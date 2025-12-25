from fastapi import APIRouter, File, Form, UploadFile
from typing import Optional

from app.schemas.mood import (
    TextMoodRequest,
    MoodResponse,
    MultimodalMoodResponse,
)
from app.services.pipeline import analyze_text_mood, analyze_multimodal_mood


router = APIRouter()


@router.post("/text", response_model=MoodResponse)
async def analyze_text(request: TextMoodRequest) -> MoodResponse:
    """
    Analyze mood from text only and return supportive response.
    """
    return await analyze_text_mood(request, admin_password=request.admin_password)


@router.post("/multimodal", response_model=MultimodalMoodResponse)
async def analyze_multimodal(
    text: Optional[str] = Form(default=None),
    face_image: Optional[UploadFile] = File(default=None),
    voice_audio: Optional[UploadFile] = File(default=None),
    conversation_id: Optional[str] = Form(default=None),
    admin_password: Optional[str] = Form(default=None),
) -> MultimodalMoodResponse:
    """
    Analyze mood from combination of text, face, and voice.
    """
    return await analyze_multimodal_mood(
        text=text,
        face_image=face_image,
        voice_audio=voice_audio,
        conversation_id=conversation_id,
        admin_password=admin_password,
    )


