
from fastapi import APIRouter, HTTPException, Depends

from Backend.database.mongodb import (
    chat_collection,
    threads_collection
)

from Backend.utils.security import get_current_user

router = APIRouter()


@router.get("/chat/{thread_id}")
def get_chat_history(
    thread_id: str,
    current_user: str = Depends(get_current_user)
):
    # Verify that this thread belongs to the logged-in user
    thread = threads_collection.find_one({
        "thread_id": thread_id,
        "user_email": current_user
    })

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Chat not found."
        )

    chats = list(
        chat_collection.find(
            {
                "thread_id": thread_id,
                "user_email": current_user
            },
            {"_id": 0}
        ).sort("created_at", 1)
    )

    return chats
