
from fastapi import (
    APIRouter,
    Form,
    UploadFile,
    File,
    Depends,
    HTTPException
)
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from Backend.services.ai_service import stream_ai
from Backend.database.mongodb import threads_collection
from Backend.utils.security import verify_access_token

import uuid
import os
import shutil

router = APIRouter()

optional_bearer = HTTPBearer(auto_error=False)


# ==========================
# Optional Authentication
# ==========================

def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(optional_bearer)
):
    if not credentials:
        return None

    payload = verify_access_token(credentials.credentials)

    if not payload or not payload.get("email"):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return payload["email"]


# ==========================
# Chat
# ==========================

@router.post("/chat")
async def chat(
    message: str = Form(...),
    mode: str = Form(...),
    thread_id: str = Form(None),
    file: UploadFile = File(None),
    current_user: str = Depends(get_optional_user),
):

    # Remember whether this is a new chat
    is_new_chat = not thread_id

    if is_new_chat:
        thread_id = str(uuid.uuid4())

    # Identity for logged-in user or guest
    owner_key = current_user or f"guest:{thread_id}"

    # Verify ownership for existing chats
    if not is_new_chat:

        existing_thread = threads_collection.find_one({
            "thread_id": thread_id,
            "user_email": owner_key
        })

        if not existing_thread:
            raise HTTPException(
                status_code=404,
                detail="Chat not found or access denied."
            )

    # Prevent collision for newly generated IDs
    else:
        existing_thread = threads_collection.find_one({
            "thread_id": thread_id
        })

        if existing_thread:
            raise HTTPException(
                status_code=409,
                detail="Unable to create chat. Please try again."
            )

    # ==========================
    # Save Uploaded File
    # ==========================

    file_url = None

    if file:
        os.makedirs("uploads", exist_ok=True)

        unique_name = (
            f"{uuid.uuid4()}_{os.path.basename(file.filename)}"
        )

        file_path = os.path.join("uploads", unique_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file.file.seek(0)

        file_url = f"/uploads/{unique_name}"

    # ==========================
    # Generate AI Response
    # ==========================

    generator = stream_ai(
        thread_id=thread_id,
        mode=mode,
        message=message,
        file=file,
        file_url=file_url,
        user_email=owner_key,
    )

    return StreamingResponse(
        generator,
        media_type="text/plain",
        headers={
            "X-Thread-ID": thread_id,
        },
    )
