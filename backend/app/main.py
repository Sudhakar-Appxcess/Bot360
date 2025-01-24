#main.py

from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
from pinecone import Pinecone  # Updated import
# from app.core.database.vector_store import load_pinecone_index_and_search  # Updated import
from app.api import router as api_router
from app.core.security import role_required
# from app.api.v1.multidbendpoints.chatbot import chat_router

from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# Create a new APIRouter instance
router = APIRouter()

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME")

if not MONGODB_URI or not MONGODB_DB_NAME:
    raise Exception("MongoDB URI or Database Name not set in environment variables.")

# Create FastAPI instance
app = FastAPI()

# Configure CORS
# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://bot360-two.vercel.app"
# ]

origins = [
    # "http://localhost:3000",
    # "http://127.0.0.1:3000",
    # "https://bot360-two.vercel.app",
    # "https://bot360-fastapiu-updated.onrender.com"
    "*"
]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#     allow_headers=["*"],
#     expose_headers=["*"],
#     max_age=600
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a protected route
@app.get("/test-route")
async def protected_route():
    return {"message": "The test route working properly!."}

@app.get("/")
async def protected_route():
    return {"message": "The test route working properly!."}

# Include routers
app.include_router(api_router)
app.include_router(router)  # Make sure to include the router here!

pc=None

# app.include_router(chat_router)
# Startup event to initialize Pinecone DB
@app.on_event("startup")
async def startup_event():
    global pc
    try:
        # Initialize Pinecone DB
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENV"))
        print("Pinecone DB initialized successfully.")
    except Exception as e:
        logging.error(f"Error initializing Pinecone DB: {str(e)}")

# # Shutdown event
# @app.on_event("shutdown")
# async def shutdown_event():
#     try:
#         # Close Pinecone DB connection
#         if pc is not None:
#             pc.close() 
#         print("Pinecone DB connection closed successfully.")
#     except Exception as e:
#         logging.error(f"Error closing Pinecone DB connection: {str(e)}")



#test

@app.middleware("http")
async def timeout_middleware(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print("Error -> ",e)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Run with Uvicorn for Render
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))  # Use Render's PORT or fallback to 8000
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
