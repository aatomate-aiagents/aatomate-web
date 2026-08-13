from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_VERIFY_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = ""
    WHATSAPP_FLOW_ID: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Merged from python-service
    PROJECT_NAME: str = "Aatomate Outreach"
    REDIS_URL: str = "redis://localhost:6379/0"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-service-account.json"
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
