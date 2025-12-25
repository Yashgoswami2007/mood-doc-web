from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import Dict, Any

router = APIRouter()
security = HTTPBearer()

@router.post("/auth/login")
async def login(token: Dict[str, Any] = Depends(security)) -> Dict[str, str]:
    """Simple authentication endpoint"""
    return {"message": "Authentication successful", "token": token.credentials}

@router.post("/auth/logout")
async def logout() -> Dict[str, str]:
    """Logout endpoint"""
    return {"message": "Logged out successfully"}

@router.get("/auth/verify")
async def verify_token() -> Dict[str, str]:
    """Token verification endpoint"""
    return {"message": "Token is valid"}
