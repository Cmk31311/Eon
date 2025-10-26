import httpx
from typing import Dict, Any
from config import Config

class AnthropicService:
    def __init__(self):
        self.api_key = Config.ANTHROPIC_API_KEY
        self.base_url = Config.ANTHROPIC_BASE_URL
    
    async def generate_narration(self, region: str, features: Dict[str, Any]) -> str:
        """Generate environmental narration using Claude"""
        if not self.api_key:
            return await self._get_mock_narration(region, features)
        
        # Create a rich prompt for Claude
        prompt = self._create_prompt(region, features)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v1/messages",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "anthropic-version": "2023-06-01"
                    },
                    json={
                        "model": "claude-3-sonnet-20240229",
                        "max_tokens": 1000,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ]
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                return data["content"][0]["text"]
            except Exception as e:
                print(f"Anthropic API error: {e}")
                return await self._get_mock_narration(region, features)
    
    def _create_prompt(self, region: str, features: Dict[str, Any]) -> str:
        """Create a detailed prompt for Claude"""
        region_name = region.replace('_', ' ')
        
        return f"""You are an environmental storyteller creating a captivating narrative about {region_name}. 

Current environmental conditions:
- Cloud cover: {features.get('cloud_pct', 0)*100:.0f}%
- Rainfall (24h): {features.get('rain_24h_mm', 0):.1f}mm
- Wind speed: {features.get('wind_ms', 0):.1f} m/s
- Temperature anomaly: {features.get('lst_anom_c', 0):+.1f}°C
- Vegetation health (NDVI): {features.get('ndvi_anom', 0):+.2f}
- Air quality (AOD): {features.get('aod', 0):.2f}
- Lightning activity: {features.get('lightning_rate', 0):.2f}
- Time of day: {features.get('time_of_day', 'day')}
- Biome: {features.get('biome', 'temperate')}

Create a 2-3 paragraph story that:
1. Describes the current atmospheric conditions in an engaging way
2. Explains what these conditions mean for the local ecosystem
3. Connects the environmental data to the broader climate story
4. Uses vivid, accessible language that makes science come alive

Write in a warm, informative tone that helps people understand and care about their environment."""
    
    async def _get_mock_narration(self, region: str, features: Dict[str, Any]) -> str:
        """Fallback mock narration when Anthropic is not available"""
        f = features
        return (f"In {region.replace('_',' ')}, clouds cover ~{int(f.get('cloud_pct', 0)*100)}%. "
                f"Past-day rain ≈ {int(f.get('rain_24h_mm', 0))} mm; winds {f.get('wind_ms', 0):.1f} m/s. "
                f"LST anomaly {f.get('lst_anom_c', 0):+.1f}°C, NDVI anomaly {f.get('ndvi_anom', 0):+.2f}. "
                f"Air {'hazy' if f.get('aod', 0)>0.5 else 'clear-ish'}. "
                "— mock narration (swap with Anthropic/Groq).")
