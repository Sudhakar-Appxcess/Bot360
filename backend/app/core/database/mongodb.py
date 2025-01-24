#maonogDb
from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
import os
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
            cls._instance.client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
            cls._instance.db = cls._instance.client[os.getenv("MONGODB_DB_NAME")]
        return cls._instance

    async def close(self):
        self.client.close()

# Define collections
mongodb_instance = MongoDB()
email_collection = mongodb_instance.db["emails"] 
user_collection = mongodb_instance.db["users"] 
admin_collection = mongodb_instance.db["admin"]  