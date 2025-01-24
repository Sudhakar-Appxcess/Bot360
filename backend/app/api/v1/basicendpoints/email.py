#emdpoints/emmil.py
from fastapi import APIRouter, HTTPException, Query,Depends
from fastapi.responses import JSONResponse
from app.models.email.email import EmailInput, EmailResponse, Email
from app.core.database.mongodb import email_collection
from app.core.security import role_required, get_current_user
router = APIRouter()

@router.post("/", response_model=EmailInput)
async def send_email(email_input: EmailInput,current_user: dict = Depends(get_current_user)):
    try:
        email = Email(**email_input.dict())
        result = await email_collection.insert_one(email.to_dict())  # Insert into MongoDB
        return JSONResponse(content={"message": "Email data stored successfully.", "email_id": str(result.inserted_id)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")

@router.get("/",response_model=EmailResponse,dependencies=[Depends(role_required("admin"))]) 
async def get_emails(page: int = Query(1, ge=1), limit: int = Query(10, gt=0)):
    offset = (page - 1) * limit
    emails_cursor = email_collection.find().sort("last_updated", -1).skip(offset).limit(limit)  # Sort by last_updated
    emails = await emails_cursor.to_list(length=limit)
    
    total_emails = await email_collection.count_documents({})
    total_pages = (total_emails + limit - 1) // limit

    return EmailResponse(emails=[EmailInput(**email) for email in emails], total_emails=total_emails, total_pages=total_pages )