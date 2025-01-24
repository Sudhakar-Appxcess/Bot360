# app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.database.mongodb import user_collection, admin_collection
from app.models.auth.admin import Admin
from app.models.auth.user import User
from app.api.auth.utils import set_access_token_cookie

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/admin")

# Collection mapping by role
collections = {
    "user": (user_collection, User),
    "admin": (admin_collection, Admin),
}

async def register_user_admin(role: str, user_data):
    """Helper function to register user or admin."""
    collection, model = collections[role]
    user_data['password'] = get_password_hash(user_data['password'])
    await collection.insert_one(user_data)
    return {"message": f"{role.capitalize()} registered successfully"}

@router.post("/register/user", status_code=status.HTTP_201_CREATED)
async def register_user(user: User):
    return await register_user_admin("user", user.dict())

@router.post("/register/admin", status_code=status.HTTP_201_CREATED)
async def register_admin(admin: Admin):
    return await register_user_admin("admin", admin.dict())

async def login_user_admin(role: str, form_data: OAuth2PasswordRequestForm, response: Response):
    """Helper function for user or admin login."""
    collection, model = collections[role]
    user = await collection.find_one({"username": form_data.username})

    # Validate credentials
    if not user or not verify_password(form_data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create and set access token
    access_token = create_access_token(data={"sub": user['username'], "role": role})
    set_access_token_cookie(access_token, response)
    
    return {
        "detail": "Login successful",
        "role": role
    }

@router.post("/login/admin")
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = None):
    return await login_user_admin("admin", form_data, response)

@router.post("/login/user")
async def user_login(form_data: OAuth2PasswordRequestForm = Depends(), response: Response = None):
    return await login_user_admin("user", form_data, response)
