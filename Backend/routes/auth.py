
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Literal

from Backend.database.mongodb import users_collection
from Backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()


# ==========================================
# Request Models
# ==========================================

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SettingsUpdateRequest(BaseModel):
    name: Optional[str] = None
    theme: Optional[Literal["dark", "light"]] = None
    notifications: Optional[bool] = None


# ==========================================
# Signup
# ==========================================

@router.post("/signup")
def signup(user: SignupRequest):

    email = user.email.strip().lower()
    name = user.name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    hashed_password = hash_password(user.password)

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "preferences": {
            "theme": "dark",
            "notifications": True,
        }
    })

    token = create_access_token({"email": email})

    return {
        "message": "Account created successfully.",
        "token": token,
    }


# ==========================================
# Login
# ==========================================

@router.post("/login")
def login(user: LoginRequest):

    email = user.email.strip().lower()

    existing_user = users_collection.find_one({"email": email})

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    valid_password = verify_password(
        user.password,
        existing_user["password"],
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = create_access_token({
        "email": existing_user["email"]
    })

    return {
        "message": "Login successful.",
        "token": token,
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
        }
    }


# ==========================================
# Get Logged-in User Profile & Settings
# ==========================================

@router.get("/me")
def get_my_profile(current_user: str = Depends(get_current_user)):

    user = users_collection.find_one(
        {"email": current_user},
        {"_id": 0, "password": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    preferences = user.get("preferences", {})

    return {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "preferences": {
            "theme": preferences.get("theme", "dark"),
            "notifications": preferences.get("notifications", True),
        }
    }


# ==========================================
# Update User Settings
# ==========================================

@router.put("/me/settings")
def update_my_settings(
    settings: SettingsUpdateRequest,
    current_user: str = Depends(get_current_user)
):

    user = users_collection.find_one({"email": current_user})

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    updates = {}

    if settings.name is not None:
        name = settings.name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty."
            )

        updates["name"] = name

    if settings.theme is not None:
        updates["preferences.theme"] = settings.theme

    if settings.notifications is not None:
        updates["preferences.notifications"] = settings.notifications

    if updates:
        users_collection.update_one(
            {"email": current_user},
            {"$set": updates}
        )

    updated_user = users_collection.find_one(
        {"email": current_user},
        {"_id": 0, "password": 0}
    )

    preferences = updated_user.get("preferences", {})

    return {
        "message": "Settings updated successfully.",
        "user": {
            "name": updated_user.get("name", ""),
            "email": updated_user.get("email", ""),
            "preferences": {
                "theme": preferences.get("theme", "dark"),
                "notifications": preferences.get("notifications", True),
            }
        }
    }
