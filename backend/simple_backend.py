from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
import httpx
import asyncio

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_mock_weather_data(region: str, latitude: float, longitude: float):
    """Generate realistic mock weather data based on region"""
    
    # Base data for different biomes
    biome_data = {
        "rainforest": {
            "temperature": 25 + random.uniform(-2, 4),
            "humidity": 80 + random.uniform(-10, 15),
            "wind_speed": 2 + random.uniform(0, 3),
            "cloud_cover": 0.7 + random.uniform(0, 0.3),
            "rain_24h": 5 + random.uniform(0, 15),
            "pressure": 1010 + random.uniform(-5, 5),
            "uv_index": 8 + random.uniform(0, 4),
            "air_quality": 20 + random.uniform(0, 20)
        },
        "desert": {
            "temperature": 35 + random.uniform(-5, 10),
            "humidity": 20 + random.uniform(-10, 20),
            "wind_speed": 8 + random.uniform(0, 12),
            "cloud_cover": 0.1 + random.uniform(0, 0.3),
            "rain_24h": random.uniform(0, 2),
            "pressure": 1015 + random.uniform(-5, 5),
            "uv_index": 10 + random.uniform(0, 2),
            "air_quality": 30 + random.uniform(0, 30)
        },
        "tundra": {
            "temperature": -10 + random.uniform(-10, 15),
            "humidity": 60 + random.uniform(-20, 20),
            "wind_speed": 15 + random.uniform(0, 10),
            "cloud_cover": 0.8 + random.uniform(0, 0.2),
            "rain_24h": 1 + random.uniform(0, 3),
            "pressure": 1005 + random.uniform(-10, 10),
            "uv_index": 2 + random.uniform(0, 3),
            "air_quality": 10 + random.uniform(0, 15)
        },
        "coastal": {
            "temperature": 22 + random.uniform(-5, 8),
            "humidity": 70 + random.uniform(-20, 20),
            "wind_speed": 5 + random.uniform(0, 8),
            "cloud_cover": 0.4 + random.uniform(0, 0.4),
            "rain_24h": 3 + random.uniform(0, 7),
            "pressure": 1013 + random.uniform(-5, 5),
            "uv_index": 7 + random.uniform(0, 3),
            "air_quality": 25 + random.uniform(0, 25)
        },
        "temperate": {
            "temperature": 15 + random.uniform(-10, 15),
            "humidity": 50 + random.uniform(-20, 30),
            "wind_speed": 5 + random.uniform(0, 10),
            "cloud_cover": 0.5 + random.uniform(0, 0.4),
            "rain_24h": 2 + random.uniform(0, 5),
            "pressure": 1013 + random.uniform(-5, 5),
            "uv_index": 5 + random.uniform(0, 5),
            "air_quality": 25 + random.uniform(0, 25)
        }
    }
    
    # Determine biome based on region
    biome = determine_biome(region, latitude, longitude)
    
    # Get base data for biome
    base_data = biome_data.get(biome, biome_data["temperate"])
    
    # Add some variation
    data = {}
    for key, value in base_data.items():
        if isinstance(value, (int, float)):
            data[key] = round(value, 1)
        else:
            data[key] = value
    
    return data, biome

async def fetch_open_meteo_data(latitude: float, longitude: float):
    """Fetch live weather data from Open-Meteo API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,weather_code,pressure_msl,uv_index",
                    "hourly": "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m",
                    "timezone": "auto"
                },
                timeout=10.0
            )
            data = response.json()
            
            current = data.get("current", {})
            hourly = data.get("hourly", {})
            
            # Calculate 24h rainfall
            rain_24h = 0
            if "precipitation" in hourly and len(hourly["precipitation"]) >= 24:
                rain_24h = sum(hourly["precipitation"][:24])
            
            return {
                "temperature": current.get("temperature_2m", 20),
                "humidity": current.get("relative_humidity_2m", 50),
                "pressure": current.get("pressure_msl", 1013),
                "weather_code": current.get("weather_code", 0),
                "cloud_cover": current.get("cloud_cover", 0) / 100,
                "rain_24h": rain_24h,
                "wind_speed": current.get("wind_speed_10m", 0),
                "uv_index": current.get("uv_index", 0),
                "air_quality": 50,  # Open-Meteo doesn't provide air quality
                "data_source": "open_meteo"
            }
    except Exception as e:
        print(f"Error fetching Open-Meteo data: {e}")
        return None

async def fetch_nasa_power_data(latitude: float, longitude: float):
    """Fetch additional environmental data from NASA POWER API"""
    try:
        async with httpx.AsyncClient() as client:
            # NASA POWER API endpoint
            url = f"https://power.larc.nasa.gov/api/temporal/daily/point"
            params = {
                "parameters": "T2M,PRECTOT,WS2M,RH2M,CLRSKY_SFC_SW_DWN",
                "community": "RE",
                "longitude": longitude,
                "latitude": latitude,
                "start": "20240101",
                "end": "20240101",
                "format": "JSON"
            }
            
            response = await client.get(url, params=params, timeout=10.0)
            data = response.json()
            
            if "properties" in data and "parameter" in data["properties"]:
                params_data = data["properties"]["parameter"]
                return {
                    "nasa_temperature": params_data.get("T2M", {}).get("20240101", 20),
                    "nasa_precipitation": params_data.get("PRECTOT", {}).get("20240101", 0),
                    "nasa_wind": params_data.get("WS2M", {}).get("20240101", 0),
                    "nasa_humidity": params_data.get("RH2M", {}).get("20240101", 50),
                    "nasa_solar": params_data.get("CLRSKY_SFC_SW_DWN", {}).get("20240101", 0),
                    "data_source": "nasa_power"
                }
    except Exception as e:
        print(f"Error fetching NASA POWER data: {e}")
        return None

def determine_biome(region: str, latitude: float, longitude: float) -> str:
    """Determine biome based on region name and coordinates"""
    region_lower = region.lower()
    
    if "rainforest" in region_lower or "amazon" in region_lower or "borneo" in region_lower:
        return "rainforest"
    elif "desert" in region_lower or "sahara" in region_lower or "namib" in region_lower:
        return "desert"
    elif "tundra" in region_lower or "arctic" in region_lower or "alaskan" in region_lower or "siberian" in region_lower:
        return "tundra"
    elif "reef" in region_lower or "coastal" in region_lower:
        return "coastal"
    elif "himalayan" in region_lower or "mountain" in region_lower:
        return "tundra"  # High altitude
    elif "steppe" in region_lower or "patagonian" in region_lower:
        return "temperate"
    else:
        return "temperate"

@app.get("/")
async def root():
    return {"message": "EarthStory Backend API", "status": "running"}

@app.post("/features")
async def get_features(request: dict):
    """Get environmental features for a region with live data"""
    region = request.get("region", "unknown")
    latitude = request.get("latitude", 0)
    longitude = request.get("longitude", 0)
    
    print(f"🌍 Getting LIVE features for {region} at {latitude}, {longitude}")
    
    # Try to fetch live data first
    live_data = None
    nasa_data = None
    
    try:
        # Fetch from Open-Meteo
        print("🌤️ Fetching live weather data from Open-Meteo...")
        live_data = await fetch_open_meteo_data(latitude, longitude)
        
        # Fetch from NASA POWER
        print("🛰️ Fetching environmental data from NASA POWER...")
        nasa_data = await fetch_nasa_power_data(latitude, longitude)
        
    except Exception as e:
        print(f"⚠️ Error fetching live data: {e}")
    
    # Determine biome
    biome = determine_biome(region, latitude, longitude)
    
    # Use live data if available, otherwise fall back to mock data
    if live_data:
        print("✅ Using live Open-Meteo data")
        features = {
            "temperature": live_data["temperature"],
            "humidity": live_data["humidity"],
            "pressure": live_data["pressure"],
            "cloud_cover": live_data["cloud_cover"],
            "rain_24h": live_data["rain_24h"],
            "wind_speed": live_data["wind_speed"],
            "uv_index": live_data["uv_index"],
            "air_quality": live_data["air_quality"],
            "weather_code": live_data.get("weather_code", 0),
            "biome": biome,
            "time_of_day": "day",
            "seed": random.randint(1, 1000),
            "cloud_pct": live_data["cloud_cover"],
            "rain_24h_mm": live_data["rain_24h"],
            "wind_ms": live_data["wind_speed"],
            "data_source": "open_meteo"
        }
        
        # Add NASA data if available
        if nasa_data:
            print("✅ Adding NASA POWER data")
            features.update({
                "nasa_temperature": nasa_data["nasa_temperature"],
                "nasa_precipitation": nasa_data["nasa_precipitation"],
                "nasa_wind": nasa_data["nasa_wind"],
                "nasa_humidity": nasa_data["nasa_humidity"],
                "nasa_solar": nasa_data["nasa_solar"],
                "data_sources": ["open_meteo", "nasa_power"]
            })
        else:
            features["data_sources"] = ["open_meteo"]
            
    else:
        print("⚠️ Using fallback mock data")
        # Fall back to mock data
        weather_data, biome = get_mock_weather_data(region, latitude, longitude)
        features = {
            **weather_data,
            "biome": biome,
            "time_of_day": "day",
            "seed": random.randint(1, 1000),
            "cloud_pct": weather_data["cloud_cover"],
            "rain_24h_mm": weather_data["rain_24h"],
            "wind_ms": weather_data["wind_speed"],
            "temperature": weather_data["temperature"],
            "humidity": weather_data["humidity"],
            "data_source": "mock"
        }
    
    print(f"✅ Generated features: {features}")
    return {"features": features}

@app.post("/narrate")
async def narrate(request: dict):
    """Generate simple narration"""
    region = request.get("region", "unknown")
    features = request.get("features", {})
    
    biome = features.get("biome", "unknown")
    temperature = features.get("temperature", 20)
    cloud_pct = features.get("cloud_pct", 0.5)
    humidity = features.get("humidity", 50)
    
    # Simple narration based on environmental data
    if biome == "rainforest":
        story = f"In the lush {region.replace('_', ' ')} rainforest, the temperature is {temperature:.1f}°C with {humidity:.0f}% humidity and {cloud_pct*100:.0f}% cloud cover. The dense canopy creates a rich, humid environment where life thrives in abundance."
    elif biome == "desert":
        story = f"The vast {region.replace('_', ' ')} desert stretches endlessly under a {cloud_pct*100:.0f}% cloudy sky. At {temperature:.1f}°C with {humidity:.0f}% humidity, the harsh conditions create a landscape of extremes where only the most resilient life survives."
    elif biome == "tundra":
        story = f"In the frozen {region.replace('_', ' ')} tundra, temperatures hover around {temperature:.1f}°C with {humidity:.0f}% humidity. The sparse vegetation and permafrost create a fragile ecosystem adapted to extreme cold conditions."
    elif biome == "coastal":
        story = f"Along the {region.replace('_', ' ')} coastline, the temperature is {temperature:.1f}°C with {humidity:.0f}% humidity and {cloud_pct*100:.0f}% cloud cover. The maritime environment creates a unique ecosystem where land and sea meet."
    else:
        story = f"The {region.replace('_', ' ')} region experiences {temperature:.1f}°C temperatures with {humidity:.0f}% humidity and {cloud_pct*100:.0f}% cloud cover. This {biome} environment supports a diverse range of life adapted to its unique conditions."
    
    return {"text": story}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
