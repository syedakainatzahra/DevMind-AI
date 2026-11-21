
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Backend.routes.chat import router as chat_router
from Backend.routes.thread import router as thread_router
from Backend.routes.chat_history import router as history_router
from Backend.routes.auth import router as auth_router


app = FastAPI(
    title="DevMind AI Backend API",
    description="""
    DevMind AI is a FastAPI-powered AI platform that provides:

    - AI Assistant
    - Python Interviewer
    - Java Interviewer
    - React Interviewer
    - HR Interviewer
    - Software Debugger
    - Resume Reviewer
    - Career Coach

    Powered by Google Gemini and MongoDB.
    """,
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "DevMind AI Backend is running!",
        "status": "success"
    }
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Thread-ID"],
)


# Routes
app.include_router(chat_router)
app.include_router(thread_router)
app.include_router(history_router)
app.include_router(auth_router)
