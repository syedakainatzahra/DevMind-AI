from dotenv import load_dotenv
import os

load_dotenv()

# Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# MongoDB
MONGO_URI = os.getenv("MONGO_URI")

# JWT
SECRET_KEY = "your_super_secret_key_12345"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24