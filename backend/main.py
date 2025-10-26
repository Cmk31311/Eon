from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
import hashlib
import os

# Import services
from services.baseten_service import BasetenService
from services.anthropic_service import AnthropicService
from services.deepgram_service import DeepgramService
from services.redis_service import RedisService
from services.elastic_service import ElasticService

app = FastAPI(title="EarthStory Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
baseten_service = BasetenService()
anthropic_service = AnthropicService()
deepgram_service = DeepgramService()
redis_service = RedisService()
elastic_service = ElasticService()

class Features(BaseModel):
    cloud_pct: float
    rain_24h_mm: float
    wind_ms: float
    lst_anom_c: float
    ndvi_anom: float
    aod: float
    lightning_rate: float
    time_of_day: str
    biome: str
    seed: int

class NarrateIn(BaseModel):
    region: str
    features: Features

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "aura-asteria-en"

class RegionRequest(BaseModel):
    region: str
    latitude: float
    longitude: float

@app.get('/health')
def health():
    return {'ok': True, 'services': {
        'baseten': bool(baseten_service.api_key),
        'anthropic': bool(anthropic_service.api_key),
        'deepgram': bool(deepgram_service.api_key),
        'redis': True,  # Will be tested on first use
        'elastic': True  # Will be tested on first use
    }}

@app.get('/features')
async def features(region: str = Query(...), latitude: float = Query(37.7749), longitude: float = Query(-122.4194)):
    """Get environmental features for a region"""
    try:
        # Check cache first
        cached_features = await redis_service.get_cached_features(region)
        if cached_features:
            return {'region': region, 'features': cached_features, 'cached': True}
        
        # Get features from Baseten
        features_data = await baseten_service.get_environmental_features(region, latitude, longitude)
        
        # Cache the results
        await redis_service.cache_features(region, features_data)
        
        # Store in Elasticsearch for analytics
        await elastic_service.store_feature_snapshot(region, features_data, latitude, longitude)
        
        return {'region': region, 'features': features_data, 'cached': False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching features: {str(e)}")

@app.post('/narrate')
async def narrate(body: NarrateIn):
    """Generate environmental narration using Claude"""
    try:
        # Create hash of features for caching
        features_str = str(body.features.dict())
        features_hash = hashlib.md5(features_str.encode()).hexdigest()
        
        # Check cache first
        cached_narration = await redis_service.get_cached_narration(body.region, features_hash)
        if cached_narration:
            return {'text': cached_narration, 'cached': True}
        
        # Generate narration with Anthropic
        narration = await anthropic_service.generate_narration(body.region, body.features.dict())
        
        # Cache the narration
        await redis_service.cache_narration(body.region, features_hash, narration)
        
        return {'text': narration, 'cached': False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating narration: {str(e)}")

@app.post('/tts')
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using Deepgram"""
    try:
        # Generate audio
        audio_data = await deepgram_service.text_to_speech(request.text, request.voice)
        if not audio_data:
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        # Save audio file
        filename = f"narration_{hashlib.md5(request.text.encode()).hexdigest()[:8]}.wav"
        filepath = await deepgram_service.save_audio_file(audio_data, filename)
        
        return FileResponse(
            filepath,
            media_type="audio/wav",
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating TTS: {str(e)}")

@app.get('/analytics/{region}')
async def get_analytics(region: str):
    """Get analytics for a region"""
    try:
        analytics = await elastic_service.get_analytics(region)
        return {'region': region, 'analytics': analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@app.get('/historical/{region}')
async def get_historical(region: str, days: int = 7):
    """Get historical data for a region"""
    try:
        historical = await elastic_service.get_historical_features(region, days)
        return {'region': region, 'historical': historical, 'days': days}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {str(e)}")