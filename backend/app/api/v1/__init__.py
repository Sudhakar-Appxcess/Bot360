# app/api/v1/__init__.py

from fastapi import APIRouter
from app.api.v1.basicendpoints.file_upload import router as file_upload_router
from app.api.v1.basicendpoints.email import router as email_router
from app.api.v1.basicendpoints.question import router as question_router
from app.api.v1.multidbendpoints.chatbot import router as multiDb_router
from app.api.v1.basicendpoints.endpoints import router as endpoints
router = APIRouter()

# Including routers with prefixes
router.include_router(endpoints, prefix="")
router.include_router(file_upload_router, prefix="")
router.include_router(email_router, prefix="/email")
router.include_router(question_router, prefix="")
router.include_router(multiDb_router, prefix="/customdb")