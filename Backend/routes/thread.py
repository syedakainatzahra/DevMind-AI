
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
import uuid

from Backend.database.mongodb import threads_collection, chat_collection
from Backend.utils.security import get_current_user

router = APIRouter()


# ==========================
# Request Model
# ==========================

class RenameThreadRequest(BaseModel):
    title: str


# ==========================
# Create New Thread
# ==========================

@router.post("/threads")
def create_thread(
    current_user: str = Depends(get_current_user)
):
    thread_id = str(uuid.uuid4())

    thread = {
        "thread_id": thread_id,
        "user_email": current_user,
        "title": "New Chat",
        "status": "active",
        "created_at": datetime.utcnow()
    }

    threads_collection.insert_one(thread)

    return {
        "thread_id": thread_id,
        "title": thread["title"],
        "status": thread["status"],
        "created_at": thread["created_at"]
    }


# ==========================
# Get User's Threads
# ==========================

@router.get("/threads")
def get_threads(
    current_user: str = Depends(get_current_user)
):
    threads = list(
        threads_collection.find(
            {"user_email": current_user},
            {"_id": 0}
        ).sort("created_at", -1)
    )

    return threads


# ==========================
# Rename User's Thread
# ==========================

@router.put("/threads/{thread_id}")
def rename_thread(
    thread_id: str,
    request: RenameThreadRequest,
    current_user: str = Depends(get_current_user)
):
    result = threads_collection.update_one(
        {
            "thread_id": thread_id,
            "user_email": current_user
        },
        {
            "$set": {
                "title": request.title
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    return {
        "message": "Thread renamed successfully."
    }


# ==========================
# Delete User's Thread
# ==========================

@router.delete("/threads/{thread_id}")
def delete_thread(
    thread_id: str,
    current_user: str = Depends(get_current_user)
):
    thread = threads_collection.find_one({
        "thread_id": thread_id,
        "user_email": current_user
    })

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found"
        )

    threads_collection.delete_one({
        "thread_id": thread_id,
        "user_email": current_user
    })

    chat_collection.delete_many({
        "thread_id": thread_id,
        "user_email": current_user
    })

    return {
        "message": "Thread deleted successfully."
    }
