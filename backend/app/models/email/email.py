#model/email/email.py
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

class EmailInput(BaseModel):
    name: str
    email: EmailStr  # Use EmailStr for email validation
    mobile: str
    message: str

class EmailResponse(BaseModel):
    emails: List[EmailInput]
    total_emails: int
    total_pages: int

class Email:
    def __init__(self, name: str, email: str, mobile: str, message: str):
        self.name = name
        self.email = email
        self.mobile = mobile
        self.message = message
        self.last_updated = datetime.utcnow()

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "mobile": self.mobile,
            "message": self.message,
            "last_updated": self.last_updated
        }