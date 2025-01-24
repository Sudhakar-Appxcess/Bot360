from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List, Tuple
import time
from app.models.schemas import ProcessingStats, QuestionRequest, SearchResult, AnswerResponse
from app.utils.pdf_processor import EnhancedPDFProcessor
from app.utils.vector_store import OptimizedVectorStore
from app.utils.qa_chain import QAChain
import io

router = APIRouter()
pdf_processor = EnhancedPDFProcessor()
vector_store = OptimizedVectorStore()
qa_chain = QAChain()

class DocumentProcessor:
    async def process_document(self, file: UploadFile) -> Tuple[int, int]:
        content = await file.read()
        pdf_file = io.BytesIO(content)
        
        # Extract text from PDF
        extracted_data = pdf_processor.extract_text_from_pdf(pdf_file)
        
        # Split text into chunks
        chunks = pdf_processor.split_text_into_chunks(
            extracted_data["text"],
            chunk_size=2000,
            overlap=100
        )
        
        # Store chunks in vector store
        vector_store.store_embeddings(chunks)
        
        return len(chunks), extracted_data["metadata"]["page_count"]

document_processor = DocumentProcessor()

@router.post("/uploadz", response_model=ProcessingStats)
async def upload_document(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    total_chunks = 0
    total_pages = 0
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        try:
            chunks, pages = await document_processor.process_document(file)
            total_chunks += chunks
            total_pages += pages
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return ProcessingStats(
        file_name=", ".join(f.filename for f in files),
        chunks=total_chunks,
        pages=total_pages,
        timestamp=time.strftime('%Y-%m-%d %H:%M:%S')
    )

@router.post("/askz", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    try:
        # Search relevant chunks
        results = vector_store.hybrid_search(
            query=request.question,
            top_k=request.top_k,
            score_threshold=request.score_threshold
        )
        
        if not results:
            return AnswerResponse(
                answer="I couldn't find relevant information to answer your question."
            )
        
        # Generate answer
        answer = qa_chain.generate_answer(request.question, results)
        
        return AnswerResponse(
            answer=answer
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))