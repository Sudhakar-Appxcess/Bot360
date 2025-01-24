# app/api/__init__.py

from fastapi import APIRouter

# Import the auth router
from .auth import router as auth_router
from .v1 import router as api_router

# Create a main router for the API
router = APIRouter()

# Include the auth router
router.include_router(auth_router, prefix="/api/auth", tags=["auth"])
router.include_router(api_router, prefix="/api/v1",tags=["api"])
