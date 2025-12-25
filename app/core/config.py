import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


class Settings:
    APP_NAME: str = "MoodDoctor Backend"
    ENV: str = os.getenv("ENV", "dev")

    # Database
    MONGODB_URL: str | None = os.getenv("MONGODB_URL")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "mooddoctor")

    # API Keys
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    GROQ_MODEL_NAME: str = os.getenv("GROQ_MODEL_NAME", "llama-3.1-8b-instant")

    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-flash")

    OPENROUTER_API_KEY: str | None = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL_NAME: str = os.getenv("OPENROUTER_MODEL_NAME", "deepseek/deepseek-chat")

    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str | None = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_SHEETS_API_KEY: str | None = os.getenv("GOOGLE_SHEETS_API_KEY")
    GOOGLE_SHEETS_ID: str | None = os.getenv("GOOGLE_SHEETS_ID")

    # Supabase
    SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY: str | None = os.getenv("SUPABASE_ANON_KEY")

    # Admin password for training endpoints
    ADMIN_PASSWORD: str | None = os.getenv("ADMIN_PASSWORD")

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
