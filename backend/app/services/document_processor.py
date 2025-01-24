
# app/services/document_processor.py
from fastapi import UploadFile
from typing import Tuple
import PyPDF2
from app.utils.pdf_processor import EnhancedPDFProcessor
from app.utils.vector_store import OptimizedVectorStore
from app.utils.qa_chain import QAChain
import io

class DocumentProcessor:
    def __init__(self):
        """Initialize the document processing system."""
        self.pdf_processor = EnhancedPDFProcessor()
        self.vector_store = OptimizedVectorStore()
        self.qa_chain = QAChain()
        
    async def process_document(self, file: UploadFile) -> Tuple[int, int]:
        try:
            content = await file.read()
            pdf_file = io.BytesIO(content)
            
            # Validate PDF
            try:
                reader = PyPDF2.PdfReader(pdf_file)
                if len(reader.pages) == 0:
                    raise ValueError("PDF file is empty or corrupted")
            except Exception as e:
                raise ValueError(f"Invalid PDF file: {str(e)}")
                
            # Reset file pointer
            pdf_file.seek(0)
            
            # Extract text with metadata
            pdf_content = self.pdf_processor.extract_text_from_pdf(pdf_file)
            
            if not pdf_content["text"].strip():
                raise ValueError("No text content found in PDF")
                
            chunks = self.pdf_processor.split_text_into_chunks(
                pdf_content["text"],
                chunk_size=2000,
                overlap=100,
                respect_sentences=True
            )
            
            if chunks:
                self.vector_store.store_embeddings(chunks)
                return len(chunks), pdf_content["metadata"]["page_count"]
            else:
                raise ValueError("No chunks generated from PDF content")
                
        except Exception as e:
            raise Exception(f"Error processing document {file.filename}: {str(e)}")