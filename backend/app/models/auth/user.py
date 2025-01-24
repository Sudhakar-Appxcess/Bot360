

from pydantic import BaseModel, Field

class User(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    username: str
    password: str
    email: str  # Add email or any other fields as necessary

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True