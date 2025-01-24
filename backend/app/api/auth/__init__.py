
# app/api/auth/__init__.py

from fastapi import APIRouter

# Import the routers from the auth module
from .auth import router as auth_router

# Create a main router for the auth package
router = APIRouter()

# Include the auth router
router.include_router(auth_router, prefix="", tags=["auth"])
