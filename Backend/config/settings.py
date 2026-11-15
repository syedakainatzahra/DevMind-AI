
from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

# Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# MongoDB
MONGO_URI = os.getenv("MONGO_URI")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Validate environment variables
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing.")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is missing.")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing.")
