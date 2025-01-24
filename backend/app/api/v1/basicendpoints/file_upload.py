from typing import List
import fitz  # PyMuPDF
from fastapi import UploadFile, APIRouter, File, HTTPException, Depends
from PyPDF2 import PdfReader
import pandas as pd
from docx import Document
from PIL import Image
import pytesseract
import io
from langchain_text_splitters import MarkdownHeaderTextSplitter
from app.core.database.vector_store import get_vector_store
from typing import List
from pydantic import BaseModel
from app.core.security import role_required
from app.core.security import get_current_user
import logging
from typing import List, Dict

router = APIRouter()

# Model for text input
class TextInput(BaseModel):
    text: str

# Chunking size for large text
CHUNK_SIZE = 35000

# Unified Text Extraction Handler
async def extract_text_from_file(file: UploadFile) -> List[str]:
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        return await extract_text_from_pdf(file)
    elif filename.endswith(".csv"):
        return await extract_text_from_csv(file)
    elif filename.endswith((".docx", ".doc")):
        return await get_word_text(file)
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return await extract_text_from_image(file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")



# # PDF Text Extraction
# async def extract_text_from_pdf(file: UploadFile) -> List[str]:
#     print(file)
#     reader = PdfReader(file.file)
#     text = ""
    
#     for page in reader.pages:
#         text += page.extract_text() or ""
        
#     print("CHUNK DATA")
#     print(chunk_text(text))
#     print('\n\n\n')

#     return (chunk_text(text)



# CSV Text Extraction with Chunking
async def extract_text_from_csv(file: UploadFile) -> List[str]:
    print("CSV CALLED")
    chunks = []
    df = pd.read_csv(file.file)

    chunk_size = 100  # Divide CSV into 100-row chunks
    for i in range(0, len(df), chunk_size):
        chunk_df = df.iloc[i:i + chunk_size]
        csv_chunk_text = chunk_df.to_string(index=False)  
        chunks.append(csv_chunk_text)
        print("CSV Chunk Extracted:", csv_chunk_text)
    
    return [sub_chunk for chunk in chunks for sub_chunk in chunk_text(chunk)]


logging.basicConfig(level=logging.INFO)

async def get_word_text(word_file: UploadFile) -> List[str]:
    text = ""
    try:
        file_content = await word_file.read()  # Read file content directly
        doc = Document(io.BytesIO(file_content))  # Initialize Document with file content
        
        for para in doc.paragraphs:
            if para.text.strip():
                text += para.text.strip() + "\n"

        if not text.strip():
            logging.error("Uploaded Word file does not contain readable content.")
            raise HTTPException(status_code=400, detail="No readable content in the uploaded Word file.")
        
    except Exception as e:
        logging.exception(f"Error reading Word file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading Word file: {str(e)}")
    
    return chunk_text(text)


# Image Text Extraction
async def extract_text_from_image(file: UploadFile) -> List[str]:
    image = Image.open(io.BytesIO(await file.read()))
    text = pytesseract.image_to_string(image)
    return chunk_text(text)

def chunk_text(text: str) -> List[str]:
    chunks = []
    
    while len(text) > CHUNK_SIZE:
        split_pos = text.rfind('\n', 0, CHUNK_SIZE)
        if split_pos == -1:
            split_pos = CHUNK_SIZE
        chunks.append(text[:split_pos])
        text = text[split_pos:]
        
    if text:  # Add remaining text if there's any
        chunks.append(text)
        
    return chunks

# Text-based upload endpoint
@router.post("/text")#, dependencies=[Depends(role_required("admin"))])
async def upload_text(content: TextInput, current_user: dict = Depends(get_current_user)):
    headers_to_split_on = [("##", "Header 2")]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on, strip_headers=False)
    md_header_splits = markdown_splitter.split_text(content.text)
    
    docsearch = get_vector_store()
    docsearch.add_documents(md_header_splits)
    return {"message": "Content stored successfully!"}


async def extract_text_from_pdf(file: UploadFile, max_limit: int = 2000) -> List[Dict]:
  
    # Open the PDF dynamically from the uploaded file
    pdf_data = await file.read()
    doc = fitz.open(stream=pdf_data, filetype="pdf")

    records = []

    # Iterate through each page
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text_instances = page.get_text("dict")

        current_record = {'headings': [], 'context': []}
        last_y = None

        # Loop through the text blocks
        for block in text_instances["blocks"]:
            if block['type'] == 0:  # 0 means text block
                for line in block["lines"]:
                    for span in line["spans"]:
                        if "bold" in span["font"].lower():
                            # Handle a new heading
                            current_y = line["bbox"][1]  # Y coordinate of the line
                            if last_y is None or abs(current_y - last_y) > 5:
                                # Save the current record if it has content
                                if current_record['headings'] or current_record['context']:
                                    records.append(current_record)
                                current_record = {'headings': [span["text"]], 'context': []}
                            else:
                                current_record['headings'].append(span["text"])
                            last_y = current_y
                        elif current_record['headings']:
                            # Collecting paragraph text related to the latest heading
                            current_record['context'].append(span["text"])

        # Append the last record if it has any context
        if current_record['headings'] or current_record['context']:
            records.append(current_record)

    # Merge records to meet the word limit
    merged_records = []
    current_merged = {'headings': [], 'context': [], 'previous_heading': None}
    current_word_count = 0

    for i, record in enumerate(records):
        # Count words in the current record
        record_word_count = sum(len(text.split()) for text in record['context'])

        if current_word_count + record_word_count <= max_limit:
            # Merge into the current record
            current_merged['headings'].extend(record['headings'])
            current_merged['context'].extend(record['context'])
            current_word_count += record_word_count
        else:
            # Finalize the current record and start a new one
            merged_records.append(current_merged)
            current_merged = {
                'headings': record['headings'],
                'related_heading': merged_records[-1]['headings'] if merged_records else None,
                'context': record['context']
                
            }
            current_word_count = record_word_count

    # Add the last merged record
    if current_merged['headings'] or current_merged['context']:
        merged_records.append(current_merged)

    return merged_records



@router.post("/file")#, dependencies=[Depends(role_required("admin"))])
async def upload_files(files: List[UploadFile] = File(...)): #, current_user: dict = Depends(get_current_user)):
    docsearch = get_vector_store()
    for file in files:
        filename = file.filename.lower()
        print("METHOD EXTACT CALLED--------------------------")
        if filename.endswith(".pdf"):
            print("Extracted called-------------")
            content_chunks= await extract_text_from_pdf(file)
            print("Extracted closed-------------")
            for chunk in content_chunks:

                markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("##", "Header 2")], strip_headers=False)
                # Combine headings and context into a single string
                text_to_split = "\n".join(chunk['headings']) + "\n" + "\n".join(chunk['context'])
                
                # Split the combined text
                md_header_splits = markdown_splitter.split_text(text_to_split)
                
                # Add the split text to the vector store
                docsearch.add_documents(md_header_splits)   
        else:
            content_chunks = await extract_text_from_file(file)
            # print("CONTENT CHUNKS")
            # print(content_chunks)
            # count = 0
            for chunk in content_chunks:

                markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("##", "Header 2")], strip_headers=False)
                md_header_splits = markdown_splitter.split_text(chunk)
                print("\nMD Header")
                print(md_header_splits)
                docsearch.add_documents(md_header_splits)

    
    return {"message": "Files processed and content stored successfully!"}


