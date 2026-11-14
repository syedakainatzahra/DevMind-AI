from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    thread_id: Optional[str] = None
    mode: str
    message: str