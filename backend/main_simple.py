from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import time, math
import httpx
import asyncio
from datetime import datetime, timedelta

app = FastAPI(title="EarthStory Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get('/health')
def health():
    return {'ok': True, 'services': {
        'baseten': False,
        'anthropic': False,
        'deepgram': False,
        'redis': False,
        'elastic': False,
        'mode': 'demo'
    }}

async def get_live_weather_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """Get live weather data from Open-Meteo API"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get current weather
            current_response = await client.get(
                f"https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m",
                    "hourly": "temperature_2m,precipitation,rain,cloud_cover,wind_speed_10m",
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max",
                    "timezone": "auto"
                }
            )
            current_response.raise_for_status()
            data = current_response.json()
            
            current = data.get('current', {})
            hourly = data.get('hourly', {})
            daily = data.get('daily', {})
            
            # Calculate 24h precipitation
            rain_24h = 0
            if 'precipitation' in hourly and len(hourly['precipitation']) >= 24:
                rain_24h = sum(hourly['precipitation'][:24])
            
            # Get current time info
            now = datetime.now()
            hour = now.hour
            time_of_day = 'day' if 6 <= hour <= 18 else 'night'
            
            # Determine biome based on location
            biome = determine_biome(latitude, longitude)
            
            return {
                'cloud_pct': current.get('cloud_cover', 0) / 100.0,
                'rain_24h_mm': round(rain_24h, 2),
                'wind_ms': current.get('wind_speed_10m', 0),
                'lst_anom_c': round(current.get('temperature_2m', 0) - 20, 2),  # Simple anomaly calculation
                'ndvi_anom': calculate_ndvi_anomaly(latitude, longitude),
                'aod': calculate_aod(latitude, longitude),
                'lightning_rate': calculate_lightning_rate(current.get('precipitation', 0)),
                'time_of_day': time_of_day,
                'biome': biome,
                'seed': int(latitude * longitude) % 1000,
                'temperature': current.get('temperature_2m', 0),
                'humidity': current.get('relative_humidity_2m', 0),
                'pressure': current.get('pressure_msl', 0),
                'weather_code': current.get('weather_code', 0)
            }
    except Exception as e:
        print(f"Error fetching live weather data: {e}")
        # Fallback to mock data
        return get_mock_weather_data(latitude, longitude)

def determine_biome(latitude: float, longitude: float) -> str:
    """Determine biome based on coordinates"""
    if latitude > 60 or latitude < -60:
        return 'tundra'
    elif latitude > 23.5 or latitude < -23.5:
        if abs(latitude) < 10:
            return 'rainforest'
        else:
            return 'temperate'
    else:
        if longitude > 0 and longitude < 50:  # Sahara region
            return 'desert'
        elif latitude < -10 and longitude > 140:  # Australia
            return 'coastal'
        else:
            return 'temperate'

def calculate_ndvi_anomaly(latitude: float, longitude: float) -> float:
    """Calculate NDVI anomaly based on location and season"""
    # Simplified NDVI calculation
    base_ndvi = 0.3 + 0.4 * math.sin(latitude * math.pi / 180)
    seasonal_factor = math.sin(time.time() / (365.25 * 24 * 3600) * 2 * math.pi)
    return round(base_ndvi + seasonal_factor * 0.2, 2)

def calculate_aod(latitude: float, longitude: float) -> float:
    """Calculate aerosol optical depth"""
    # Simplified AOD calculation
    base_aod = 0.2 + 0.3 * abs(math.sin(latitude * math.pi / 180))
    return round(base_aod, 2)

def calculate_lightning_rate(precipitation: float) -> float:
    """Calculate lightning rate based on precipitation"""
    return round(max(0, precipitation * 0.1), 2)

def get_mock_weather_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """Fallback mock weather data"""
    h = int(latitude * longitude) % 1000
    t = time.time() / 600.0
    
    return {
        'cloud_pct': round((math.sin(t + h) + 1) / 2, 2),
        'rain_24h_mm': round(max(0.0, 20 * (math.sin(t/2 + h/7) + 0.5)), 2),
        'wind_ms': round(2 + 8 * ((math.sin(t/3 + h/5) + 1) / 2), 2),
        'lst_anom_c': round(-3 + 6 * (math.sin(t/4 + h/9)), 2),
        'ndvi_anom': round(-0.3 + 0.6 * (math.sin(t/5 + h/11)), 2),
        'aod': round(0.1 + 0.4 * ((math.sin(t/6 + h/13) + 1) / 2), 2),
        'lightning_rate': round(max(0.0, (math.sin(t/1.5 + h/17) + 1) / 3), 2),
        'time_of_day': 'day' if (int(time.time() / 3600) % 24) < 18 else 'night',
        'biome': determine_biome(latitude, longitude),
        'seed': h,
        'temperature': round(15 + 20 * math.sin(latitude * math.pi / 180), 1),
        'humidity': round(50 + 30 * math.sin(t + h), 1),
        'pressure': round(1013 + 20 * math.sin(t/2 + h), 1),
        'weather_code': int(40 + 40 * (math.sin(t + h) + 1) / 2)
    }

@app.get('/features')
async def features(region: str = Query(...), latitude: float = Query(37.7749), longitude: float = Query(-122.4194)):
    """Get environmental features for a region with live weather data"""
    try:
        # Get live weather data
        weather_data = await get_live_weather_data(latitude, longitude)
        
        return {
            'region': region,
            'features': weather_data,
            'cached': False,
            'source': 'live',
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in features endpoint: {e}")
        # Fallback to mock data
        mock_data = get_mock_weather_data(latitude, longitude)
        return {
            'region': region,
            'features': mock_data,
            'cached': False,
            'source': 'mock',
            'timestamp': datetime.now().isoformat()
        }

@app.post('/narrate')
async def narrate(body: NarrateIn):
    """Generate environmental narration (demo mode)"""
    f = body.features
    region_name = body.region.replace('_', ' ')
    
    # Create a more engaging story based on the data
    story_parts = []
    
    # Weather conditions
    if f.cloud_pct > 0.7:
        story_parts.append(f"Thick clouds blanket {region_name}, creating a moody atmosphere with {int(f.cloud_pct*100)}% cloud cover.")
    elif f.cloud_pct > 0.3:
        story_parts.append(f"Scattered clouds drift across {region_name}, covering {int(f.cloud_pct*100)}% of the sky.")
    else:
        story_parts.append(f"Clear skies dominate {region_name}, with only {int(f.cloud_pct*100)}% cloud cover allowing brilliant sunshine.")
    
    # Temperature
    if f.lst_anom_c > 3:
        story_parts.append(f"The land surface temperature is significantly elevated at {f.lst_anom_c:+.1f}°C above normal, indicating intense heat.")
    elif f.lst_anom_c < -3:
        story_parts.append(f"Temperatures are well below average at {f.lst_anom_c:+.1f}°C, creating a chilly environment.")
    else:
        story_parts.append(f"Temperatures are near normal with a {f.lst_anom_c:+.1f}°C anomaly from the typical range.")
    
    # Rainfall
    if f.rain_24h_mm > 20:
        story_parts.append(f"Heavy rainfall has drenched the area with {f.rain_24h_mm:.1f}mm in the past 24 hours, creating lush conditions.")
    elif f.rain_24h_mm > 5:
        story_parts.append(f"Moderate rainfall of {f.rain_24h_mm:.1f}mm has provided welcome moisture to the ecosystem.")
    else:
        story_parts.append(f"Minimal rainfall of only {f.rain_24h_mm:.1f}mm has left the landscape dry and parched.")
    
    # Wind
    if f.wind_ms > 10:
        story_parts.append(f"Strong winds at {f.wind_ms:.1f} m/s sweep across the landscape, carrying seeds and pollen far and wide.")
    elif f.wind_ms > 5:
        story_parts.append(f"A gentle breeze of {f.wind_ms:.1f} m/s stirs the air, creating a pleasant atmosphere.")
    else:
        story_parts.append(f"Calm conditions prevail with winds barely reaching {f.wind_ms:.1f} m/s.")
    
    # Vegetation
    if f.ndvi_anom > 0.2:
        story_parts.append(f"The vegetation is thriving with a positive NDVI anomaly of {f.ndvi_anom:+.2f}, indicating healthy plant growth.")
    elif f.ndvi_anom < -0.2:
        story_parts.append(f"Vegetation stress is evident with a negative NDVI anomaly of {f.ndvi_anom:+.2f}, suggesting challenging growing conditions.")
    else:
        story_parts.append(f"Vegetation health is stable with a near-normal NDVI anomaly of {f.ndvi_anom:+.2f}.")
    
    # Air quality
    if f.aod > 0.5:
        story_parts.append(f"The air carries a noticeable haze with an aerosol optical depth of {f.aod:.2f}, reducing visibility.")
    else:
        story_parts.append(f"Clear air conditions prevail with low aerosol levels at {f.aod:.2f} optical depth.")
    
    # Lightning
    if f.lightning_rate > 0.3:
        story_parts.append(f"Electrical activity is high with a lightning rate of {f.lightning_rate:.2f}, indicating active storm systems.")
    
    # Biome context
    biome_context = {
        'rainforest': "This tropical rainforest ecosystem supports incredible biodiversity.",
        'desert': "This arid desert landscape has adapted to extreme conditions.",
        'temperate': "This temperate region experiences distinct seasonal changes.",
        'tundra': "This cold tundra environment supports hardy Arctic vegetation.",
        'coastal': "This coastal ecosystem bridges land and sea environments.",
        'savanna': "This grassland savanna supports large herbivores and predators."
    }
    
    if f.biome in biome_context:
        story_parts.append(biome_context[f.biome])
    
    story = " ".join(story_parts)
    return {'text': story, 'cached': False}

@app.post('/tts')
async def text_to_speech(request: TTSRequest):
    """Mock TTS endpoint (demo mode)"""
    return {
        'message': 'TTS service not configured in demo mode',
        'text': request.text,
        'voice': request.voice,
        'demo': True
    }

@app.get('/analytics/{region}')
async def get_analytics(region: str):
    """Mock analytics endpoint (demo mode)"""
    return {
        'region': region,
        'analytics': {
            'cloud_cover': {'avg': 0.45, 'min': 0.1, 'max': 0.9},
            'rainfall': {'avg': 15.2, 'min': 0, 'max': 45.8},
            'wind': {'avg': 6.3, 'min': 1.2, 'max': 18.7},
            'temperature': {'avg': 2.1, 'min': -8.3, 'max': 12.4}
        },
        'demo': True
    }

@app.get('/historical/{region}')
async def get_historical(region: str, days: int = 7):
    """Mock historical data endpoint (demo mode)"""
    return {
        'region': region,
        'historical': [],
        'days': days,
        'demo': True,
        'message': 'Historical data not available in demo mode'
    }
