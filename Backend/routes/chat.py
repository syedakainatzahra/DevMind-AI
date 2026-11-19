
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
from Backend.database.mongodb import threads_collection, fs
import uuid
import os
from Backend.utils.security import verify_access_token
from bson import ObjectId
from gridfs.errors import NoFile
from urllib.parse import quote
import io



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
# Retrieve Uploaded File
# ==========================

@router.get("/files/{file_id}")
def get_uploaded_file(
    file_id: str,
    thread_id: str,
    current_user: str = Depends(get_optional_user)
):
    # Identify file owner
    owner_key = current_user or f"guest:{thread_id}"

    # Verify thread ownership
    thread = threads_collection.find_one({
        "thread_id": thread_id,
        "user_email": owner_key
    })

    if not thread:
        raise HTTPException(
            status_code=404,
            detail="File not found or access denied."
        )

    # Validate MongoDB ObjectId
    try:
        object_id = ObjectId(file_id)
    except Exception:
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    # Retrieve file from GridFS
    try:
        stored_file = fs.get(object_id)
    except NoFile:
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    # Verify file ownership and thread association
    metadata = stored_file.metadata or {}

    if (
        metadata.get("user_email") != owner_key
        or metadata.get("thread_id") != thread_id
    ):
        raise HTTPException(
            status_code=404,
            detail="File not found or access denied."
        )

    # Read stored file
    file_bytes = stored_file.read()

    filename = stored_file.filename or "uploaded_file"
    content_type = (
        stored_file.content_type or "application/octet-stream"
    )

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=content_type,
        headers={
            "Content-Disposition": (
                f"inline; filename*=UTF-8''{quote(filename)}"
            ),
            "Cache-Control": "private, no-store",
        }
    )


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

       # ==========================
    # Save Uploaded File in GridFS
    # ==========================

    file_url = None

    if file:
        try:
            file_bytes = await file.read()

            safe_filename = os.path.basename(
                file.filename or "uploaded_file"
            )

            file_id = fs.put(
                file_bytes,
                filename=safe_filename,
                content_type=(
                    file.content_type or "application/octet-stream"
                ),
                metadata={
                    "thread_id": thread_id,
                    "user_email": owner_key,
                }
            )

            file.file.seek(0)

            file_url = f"/files/{file_id}?thread_id={thread_id}"

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Unable to save uploaded file."
            )
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
