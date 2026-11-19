
from google import genai
from datetime import datetime
from fastapi import UploadFile
from PIL import Image
from pypdf import PdfReader
from docx import Document
from pptx import Presentation
import pandas as pd

from Backend.config.settings import GEMINI_API_KEY
from Backend.database.mongodb import (
    chat_collection,
    threads_collection,
)

client = genai.Client(api_key=GEMINI_API_KEY)


# ==========================================
# Language Understanding Instructions
# ==========================================

LANGUAGE_INSTRUCTIONS = """
LANGUAGE AND COMMUNICATION RULES:

1. Understand English, Urdu, Roman Urdu, and mixed Urdu-English.
2. Understand informal Roman Urdu, common abbreviations,
   short forms, typing mistakes, and spelling variations.

Examples:
- mujhy, muje, mujhe = mujhe
- kaisy, kese, kaise = kaise
- btao, batao = batao
- krdo, kardo = kar do
- ni, nai, nahi = nahi
- hn, han, haan = haan
- kya hal hai, kaisy ho = casual Urdu conversation.

3. Never complain about spelling or grammar mistakes.
4. Understand the intended meaning from conversation context.
5. Reply in the same language and style the user uses.
6. If the user writes Roman Urdu, reply in natural Roman Urdu.
7. If the user writes English, reply in English.
8. If the user mixes Urdu and English, respond naturally
   using a similar mixture.
9. Do not unnecessarily translate Roman Urdu into English.
10. Maintain the conversation context across messages.
11. Do not ask the user to repeat something that is already
    clear from the conversation.
12. Be friendly, natural, helpful, and conversational.
"""


# ==========================================
# Prompt Builder
# ==========================================

def build_prompt(mode: str, history: str, message: str):

    if mode == "assistant":
        system_prompt = """
You are DevMind AI, a helpful and intelligent AI assistant.

Your responsibilities:
- Answer questions clearly.
- Help with programming and technology.
- Explain difficult concepts in simple language.
- Remember and use previous conversation context.

If the user uploads an image:
- Describe visible content.
- Read text inside the image when possible.
- Answer questions about the image.

If the user uploads a document:
- Understand its content.
- Summarize it.
- Answer questions based on it.
"""

    elif mode == "python_interview":
        system_prompt = """
You are an expert Python interviewer.

Rules:
- Ask one question at a time.
- Evaluate every answer.
- Give marks out of 10.
- Explain mistakes clearly.
- Continue the interview.
"""

    elif mode == "java_interview":
        system_prompt = """
You are an expert Java interviewer.

Conduct a professional Java interview.
Ask one question at a time.
Evaluate answers and explain mistakes.
"""

    elif mode == "react_interview":
        system_prompt = """
You are an expert React interviewer.

Conduct a professional React interview.
Ask one question at a time.
Evaluate answers and explain mistakes.
"""

    elif mode == "hr_interview":
        system_prompt = """
You are an experienced HR interviewer.

Conduct a professional HR interview.
Ask one question at a time.
Evaluate answers and provide feedback.
"""

    elif mode == "debugger":
        system_prompt = """
You are an expert software debugger.

Explain:
- Why the error happened.
- How to fix it.
- Step-by-step solutions.
- Relevant best practices.

Provide corrected code when needed.
"""

    elif mode == "resume_review":
        system_prompt = """
You are an ATS Resume Reviewer.

Review resumes professionally.
Identify strengths, weaknesses, and improvements.
Give practical suggestions.
"""

    elif mode == "career":
        system_prompt = """
You are an AI Career Coach.

Provide practical career guidance.
Help with skills, learning paths, interviews,
job applications, and professional development.
"""

    else:
        system_prompt = """
You are DevMind AI, a helpful AI assistant.
"""

    return f"""
{system_prompt}

{LANGUAGE_INSTRUCTIONS}

CONVERSATION HISTORY:

{history}

CURRENT USER MESSAGE:

{message}

Remember:
Use the conversation history to understand the user's
meaning and respond naturally.
"""


# ==========================================
# Read Uploaded File
# ==========================================

def read_uploaded_file(file: UploadFile):

    extension = file.filename.split(".")[-1].lower()

    try:

        if extension == "txt":
            file.file.seek(0)
            return file.file.read().decode(
                "utf-8",
                errors="ignore",
            )

        elif extension == "pdf":
            file.file.seek(0)
            reader = PdfReader(file.file)

            text = ""

            for page in reader.pages:
                text += page.extract_text() or ""

            return text

        elif extension == "docx":
            file.file.seek(0)
            document = Document(file.file)

            return "\n".join(
                p.text for p in document.paragraphs
            )

        elif extension == "csv":
            file.file.seek(0)
            df = pd.read_csv(file.file)

            return df.to_string(index=False)

        elif extension in ["xlsx", "xls"]:
            file.file.seek(0)
            df = pd.read_excel(file.file)

            return df.to_string(index=False)

        elif extension == "pptx":
            file.file.seek(0)
            presentation = Presentation(file.file)

            text = ""

            for slide in presentation.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text += shape.text + "\n"

            return text

        elif extension in [
            "png",
            "jpg",
            "jpeg",
            "webp",
            "bmp",
        ]:
            file.file.seek(0)
            return Image.open(file.file)

        else:
            return f"Unsupported file type: {extension}"

    except Exception as e:
        return (
            "Unable to read uploaded file.\n\n"
            f"{str(e)}"
        )


# ==========================================
# Streaming AI
# ==========================================



def stream_ai(
    thread_id: str,
    mode: str,
    message: str,
    file: UploadFile = None,
    file_url: str = None,
    user_email: str = None,
):
    if not user_email:
        raise ValueError("Chat identity is required.")

    # Verify thread ownership
    existing = threads_collection.find_one({
        "thread_id": thread_id,
        "user_email": user_email
    })

    conflicting_thread = threads_collection.find_one({
        "thread_id": thread_id
    })

    if conflicting_thread and not existing:
        raise ValueError("Chat ownership conflict.")

    # Load conversation history
    previous_chats = list(
        chat_collection.find({
            "thread_id": thread_id,
            "user_email": user_email
        }).sort("created_at", 1)
    )

    history = ""

    for chat in previous_chats:
        history += f"""
User:
{chat.get("user_message", "")}

Assistant:
{chat.get("bot_response", "")}
"""

    # Build prompt
    prompt = build_prompt(mode, history, message)

    # Process uploaded file once
    uploaded_text = None
    contents = [prompt]

    if file:
        parsed_file = read_uploaded_file(file)

        if isinstance(parsed_file, Image.Image):
            contents = [prompt, parsed_file]
        else:
            uploaded_text = f"""

UPLOADED FILE:

Filename:
{file.filename}

Content:
{parsed_file}
"""
            contents = [prompt + uploaded_text]

    # Generate Gemini response once
    stream = client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=contents,
    )

    full_response = ""

    for chunk in stream:
        response_text = getattr(chunk, "text", None)

        if response_text:
            full_response += response_text
            yield response_text

    # Prepare user message
    final_user_message = message

    if uploaded_text:
        final_user_message += uploaded_text

    now = datetime.utcnow()

    # Create or update thread
    if existing:
        threads_collection.update_one(
            {
                "thread_id": thread_id,
                "user_email": user_email
            },
            {
                "$set": {
                    "mode": mode,
                    "updated_at": now,
                }
            }
        )
    else:
        threads_collection.insert_one({
            "thread_id": thread_id,
            "user_email": user_email,
            "title": (
                message[:40]
                if message.strip()
                else "New Chat"
            ),
            "mode": mode,
            "status": "active",
            "created_at": now,
            "updated_at": now,
        })

    # Save conversation once
    chat_document = {
        "thread_id": thread_id,
        "user_email": user_email,
        "mode": mode,
        "user_message": final_user_message,
        "bot_response": full_response,
        "created_at": now,
    }

    if file:
        chat_document["file_name"] = file.filename
        chat_document["file_type"] = file.content_type

        if file_url:
            chat_document["file_url"] = file_url

    chat_collection.insert_one(chat_document)
