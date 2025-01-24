from typing import List, Dict, Optional
import PyPDF2
import pdfplumber
import spacy
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
import os
import io

class EnhancedPDFProcessor:
    def __init__(self, max_workers: int = 2, model: str = "en_core_web_sm"):
        self.max_workers = max_workers
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        try:
            self.nlp = spacy.load(model)
            if not "sentencizer" in self.nlp.pipe_names:
                self.nlp.add_pipe("sentencizer")
        except OSError:
            self.logger.info(f"Downloading spacy model: {model}")
            os.system(f"python -m spacy download {model}")
            self.nlp = spacy.load(model)

    def _clean_extracted_text(self, text: str) -> str:
        """Clean and validate extracted text."""
        if not isinstance(text, str) or not text:
            return ""
        
        # Basic cleaning
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    # def _process_page(self, page: PyPDF2.PageObject, page_num: int) -> Dict[str, str]:
    #     """Process a single PDF page with fallback methods."""
    #     text = ""
    #     try:
    #         text = page.extract_text()
    #         if not text.strip():
    #             raise ValueError("Empty text extracted")
    #     except Exception as e:
    #         self.logger.warning(f"PyPDF2 extraction failed for page {page_num + 1}: {str(e)}")
    #         try:
    #             with pdfplumber.open(self.current_pdf_bytes) as pdf:
    #                 if page_num < len(pdf.pages):
    #                     text = pdf.pages[page_num].extract_text() or ""
    #         except Exception as e2:
    #             self.logger.error(f"Fallback extraction failed for page {page_num + 1}: {str(e2)}")

    #     text = self._clean_extracted_text(text)
    #     return {f"page_{page_num + 1}": text}


    def _process_page(self, page: PyPDF2.PageObject, page_num: int) -> Dict[str, str]:
        text = ""
        try:
            text = page.extract_text()
            if not text.strip():
                raise ValueError("Empty text extracted")
        except Exception as e:
            try:
                # Convert bytes to BytesIO object for seeking capability
                pdf_bytes = io.BytesIO(self.current_pdf_bytes)
                with pdfplumber.open(pdf_bytes) as pdf:
                    if page_num < len(pdf.pages):
                        text = pdf.pages[page_num].extract_text() or ""
            except Exception as e2:
                self.logger.error(f"Fallback extraction failed for page {page_num + 1}: {str(e2)}")

        return {f"page_{page_num + 1}": self._clean_extracted_text(text)}

    def extract_text_from_pdf(self, pdf_file) -> Dict[str, str]:
        """Extract text with improved error handling."""
        try:
            self.current_pdf_bytes = pdf_file.read() if hasattr(pdf_file, 'read') else pdf_file
            pdf_file.seek(0) if hasattr(pdf_file, 'seek') else None
            
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            pages = {}
            failed_pages = []
            
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(self._process_page, page, i): i 
                    for i, page in enumerate(pdf_reader.pages)
                }
                
                for future in as_completed(futures):
                    try:
                        page_result = future.result()
                        pages.update(page_result)
                    except Exception as e:
                        page_num = futures[future]
                        failed_pages.append(page_num)
                        pages[f"page_{page_num + 1}"] = ""

            if failed_pages:
                self._handle_failed_pages(failed_pages, pages)

            processed_text = "\n".join(filter(None, pages.values()))
            if not processed_text.strip():
                raise ValueError("No text could be extracted from the PDF")

            return {
                "text": processed_text,
                "metadata": {
                    "page_count": len(pages),
                    "pages": {k: v for k, v in pages.items() if v.strip()},
                    "failed_pages": len(failed_pages)
                }
            }
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def _handle_failed_pages(self, failed_pages: List[int], pages: Dict[str, str]):
        """Process failed pages with pdfplumber."""
        try:
            with pdfplumber.open(io.BytesIO(self.current_pdf_bytes)) as pdf:
                for page_num in failed_pages:
                    if page_num < len(pdf.pages):
                        text = pdf.pages[page_num].extract_text() or ""
                        pages[f"page_{page_num + 1}"] = self._clean_extracted_text(text)
        except Exception as e:
            self.logger.error(f"Fallback processing failed: {str(e)}")

    def _split_by_section(self, text: str) -> List[str]:
        """Split text by semantic sections."""
        doc = self.nlp(text)
        sections = []
        current_section = []

        for sent in doc.sents:
            if (len(sent.text.strip()) > 0 and 
                (sent.text.strip().endswith(':') or 
                 bool(re.match(r'^[A-Z][a-z]+ \d+\.', sent.text.strip())) or
                 (sent.text.isupper() and len(sent.text.split()) < 4))):
                if current_section:
                    sections.append(' '.join(current_section))
                current_section = [sent.text]
            else:
                current_section.append(sent.text)
        
        if current_section:
            sections.append(' '.join(current_section))
        
        return [s.strip() for s in sections if s.strip()]

    def _process_section(self, section: str, respect_sentences: bool, chunk_size: int, overlap: int, section_index: int) -> List[Dict[str, str]]:
        """Process a single section into chunks using spaCy."""
        chunks = []
        try:
            doc = self.nlp(section)
            sentences = list(doc.sents) if respect_sentences else [doc]
            current_chunk = []
            current_size = 0
            
            for sentence in sentences:
                sentence_text = sentence.text.strip()
                sentence_words = sentence_text.split()
                sentence_size = len(' '.join(sentence_words))
                
                if current_size + sentence_size > chunk_size and current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append({
                        "text": chunk_text,
                        "metadata": {
                            "chunk_size": len(chunk_text),
                            "word_count": len(current_chunk),
                            "chunk_index": len(chunks),
                            "section_index": section_index,
                            "section_context": section[:100] + "..."
                        }
                    })
                    
                    if overlap > 0:
                        overlap_words = current_chunk[-overlap:]
                        current_chunk = overlap_words
                        current_size = len(' '.join(overlap_words))
                    else:
                        current_chunk = []
                        current_size = 0
                
                current_chunk.extend(sentence_words)
                current_size += sentence_size + 1
            
            if current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "chunk_size": len(chunk_text),
                        "word_count": len(current_chunk),
                        "chunk_index": len(chunks),
                        "section_index": section_index,
                        "section_context": section[:100] + "..."
                    }
                })
        except Exception as e:
            self.logger.error(f"Error processing section {section_index}: {str(e)}")
            
        return chunks

    def split_text_into_chunks(
        self, 
        text: str, 
        chunk_size: int = 1000,
        overlap: int = 100,
        respect_sentences: bool = True
    ) -> List[Dict[str, str]]:
        """Split text into chunks with parallel processing."""
        try:
            cleaned_text = self._clean_extracted_text(text)
            sections = self._split_by_section(cleaned_text)
            all_chunks = []
            
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_section = {
                    executor.submit(
                        self._process_section,
                        section,
                        respect_sentences,
                        chunk_size,
                        overlap,
                        idx
                    ): idx
                    for idx, section in enumerate(sections)
                }
                
                for future in as_completed(future_to_section):
                    try:
                        chunks = future.result()
                        all_chunks.extend(chunks)
                    except Exception as e:
                        self.logger.error(f"Error processing section: {str(e)}")
                        continue
            
            all_chunks.sort(key=lambda x: (x['metadata']['section_index'], x['metadata']['chunk_index']))
            
            for i, chunk in enumerate(all_chunks):
                chunk['metadata']['chunk_index'] = i
            
            return all_chunks
            
        except Exception as e:
            self.logger.error(f"Error splitting text into chunks: {str(e)}")
            return []