import httpx
from typing import Dict, Any
from config import Config

class BasetenService:
    def __init__(self):
        self.api_key = Config.BASETEN_API_KEY
        self.model_id = Config.BASETEN_MODEL_ID
        self.base_url = Config.BASETEN_BASE_URL.format(self.model_id)
    
    async def get_environmental_features(self, region: str, lat: float, lon: float) -> Dict[str, Any]:
        """Get environmental features from Baseten ML model"""
        if not self.api_key or not self.model_id:
            # Fallback to mock data if Baseten not configured
            return await self._get_mock_features(region, lat, lon)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/predict",
                    headers={"Authorization": f"Api-Key {self.api_key}"},
                    json={
                        "latitude": lat,
                        "longitude": lon,
                        "region": region,
                        "timestamp": "now"
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Baseten API error: {e}")
                return await self._get_mock_features(region, lat, lon)
    
    async def _get_mock_features(self, region: str, lat: float, lon: float) -> Dict[str, Any]:
        """Fallback mock features when Baseten is not available"""
        import time
        import math
        
        h = sum(ord(c) for c in region) % 1000
        t = time.time() / 600.0
        
        return {
            "cloud_pct": round((math.sin(t + h) + 1) / 2, 2),
            "rain_24h_mm": round(max(0.0, 80 * (math.sin(t / 2 + h / 7) + 0.3)), 2),
            "wind_ms": round(2 + 8 * ((math.sin(t / 3 + h / 5) + 1) / 2), 2),
            "lst_anom_c": round(-2 + 6 * (math.sin(t / 4 + h / 9)), 2),
            "ndvi_anom": round(-0.3 + 0.6 * (math.sin(t / 5 + h / 11)), 2),
            "aod": round(0.1 + 0.6 * ((math.sin(t / 6 + h / 13) + 1) / 2), 2),
            "lightning_rate": round(max(0.0, (math.sin(t / 1.5 + h / 17) + 1) / 2), 2),
            "time_of_day": "day",
            "biome": "temperate",
            "seed": int(h)
        }
