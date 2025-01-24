from pymongo import MongoClient
from sqlalchemy import create_engine
import uuid
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
import time
import threading
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.api.v1.multidbendpoints.utils import get_database_schema, convert_to_natural_language, get_query_from_openai, run_query

router = APIRouter()

class UserQuery(BaseModel):
    question: str

user_connection_pools = {}
connection_last_access_time = {}

# Timer to remove expired database connections
def cleanup_connections():
    while True:
        current_time = time.time()
        for DBKey, last_access_time in list(connection_last_access_time.items()):
            if current_time - last_access_time > 900:  # 15 minutes timeout
                del user_connection_pools[DBKey]
                del connection_last_access_time[DBKey]
        time.sleep(300)

threading.Thread(target=cleanup_connections, daemon=True).start()

# Initialize MySQL or MongoDB connection based on user input
def init_database(db_url: str, db_type: str):
    if db_type == "mysql":
        engine = create_engine(db_url, pool_size=5, max_overflow=10)
        return {"db_type": db_type, "db_connection": engine}
    elif db_type == "mongodb":
        client = MongoClient(db_url)
        db_name = db_url.split("/")[-1]  # Extract database name from the URL
        db = client[db_name]
        return {"db_type": db_type, "db_connection": db}
    else:
        raise HTTPException(status_code=400, detail="Unsupported database type")

class DatabaseConnectionRequest(BaseModel):
    db_type: str  # Either 'mysql' or 'mongodb'
    db_url: str

@router.post("/connect_db")
async def connect_database(
    request: Request,
    connection_request: DatabaseConnectionRequest,
    current_user: dict = Depends(get_current_user)
):
    DBKey = str(uuid.uuid4())  # Generate DBKey every time for the session
    response_data = {"DBKey": DBKey}

    try:
        db_type = connection_request.db_type
        db_url = connection_request.db_url
        db_connection = init_database(db_url, db_type)

        # Test the connection based on database type
        if db_type == "mysql":
            with db_connection["db_connection"].connect() as connection:
                connection.execute(text("SELECT 1"))
        elif db_type == "mongodb":
            db_connection["db_connection"].list_collection_names()  # Just check if we can access the collections

        user_connection_pools[DBKey] = db_connection
        connection_last_access_time[DBKey] = time.time()

        response_data["message"] = "Database connection successful"
        return JSONResponse(content=response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@router.post("/ask")
async def get_chat_response(request: Request, user_query: UserQuery,
                            current_user: dict = Depends(get_current_user)
                           ):
    DBKey = request.headers.get("DBKey")  # Fetch DBKey from headers

    if not DBKey:
        raise HTTPException(status_code=401, detail="Please Connect your Database first!")

    connection_data = user_connection_pools.get(DBKey)

    if connection_data is None:
        raise HTTPException(status_code=500, detail="Database not connected. Please connect first.")

    connection_last_access_time[DBKey] = time.time()
    chat_history = [{"role": "AI", "content": "Hello! Ask me anything about your database."}]
    
    db_type = connection_data["db_type"]
    db_connection = connection_data["db_connection"]
    
    try:
        # Get database schema
        schema_info = get_database_schema(db_connection, db_type)
        
        # Generate SQL or MongoDB query from user question and schema
        query = get_query_from_openai(user_query.question, schema_info, chat_history, db_type)
        
        # Execute the query (MySQL or MongoDB) and get the response
        query_response = run_query(db_connection, query, db_type)
        
        # Convert query response to natural language
        natural_language_response = convert_to_natural_language(user_query.question, schema_info, query, query_response, chat_history)
        
        return {"response": natural_language_response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/disconnect_db")
async def disconnect_database(request: Request,
                              current_user: dict = Depends(get_current_user)
):
    DBKey = request.headers.get("DBKey")  # Fetch DBKey from headers

    if not DBKey:
        raise HTTPException(status_code=400, detail="No database connection found to disconnect.")

    # Remove the connection if it exists
    if DBKey in user_connection_pools:
        del user_connection_pools[DBKey]
        del connection_last_access_time[DBKey]

    response_data = {"message": "Database disconnected successfully"}
    return JSONResponse(content=response_data)
