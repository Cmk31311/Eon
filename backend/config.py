import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    
    # API Endpoints
    ANTHROPIC_BASE_URL = "https://api.anthropic.com"

