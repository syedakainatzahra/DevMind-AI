
from pymongo import MongoClient
from Backend.config.settings import MONGO_URI
import certifi

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["devmind_ai"]

users_collection = db["users"]
chat_collection = db["chat_history"]
threads_collection = db["threads"]

# Global user preferences and memory
memory_collection = db["user_memory"]
