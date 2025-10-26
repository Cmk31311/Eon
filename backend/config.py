import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    BASETEN_API_KEY = os.getenv("BASETEN_API_KEY")
    BASETEN_MODEL_ID = os.getenv("BASETEN_MODEL_ID")
    BRIGHT_DATA_USERNAME = os.getenv("BRIGHT_DATA_USERNAME")
    BRIGHT_DATA_PASSWORD = os.getenv("BRIGHT_DATA_PASSWORD")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
    
    # Database & Caching
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    ELASTIC_URL = os.getenv("ELASTIC_URL", "http://localhost:9200")
    ELASTIC_USERNAME = os.getenv("ELASTIC_USERNAME", "elastic")
    ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")
    
    # LiveKit (Optional)
    LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
    LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
    LIVEKIT_WS_URL = os.getenv("LIVEKIT_WS_URL")
    
    # API Endpoints
    BASETEN_BASE_URL = "https://model-{}.api.baseten.co"
    BRIGHT_DATA_BASE_URL = "https://brd.superproxy.io"
    ANTHROPIC_BASE_URL = "https://api.anthropic.com"
    DEEPGRAM_BASE_URL = "https://api.deepgram.com"
