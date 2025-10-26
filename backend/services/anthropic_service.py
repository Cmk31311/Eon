import anthropic
from typing import Dict, Any
from config import Config

class AnthropicService:
    def __init__(self):
        self.api_key = Config.ANTHROPIC_API_KEY
        print(f"🔧 Initializing AnthropicService...")
        print(f"🔑 API Key loaded: {bool(self.api_key)}")
        if self.api_key:
            print(f"🔑 API Key preview: {self.api_key[:10]}...{self.api_key[-10:]}")
            self.client = anthropic.Anthropic(api_key=self.api_key)
            print(f"✅ Anthropic client initialized")
        else:
            print(f"⚠️ No API key provided")
            self.client = None
    
    async def generate_narration(self, region: str, features: Dict[str, Any]) -> str:
        """Generate environmental narration using Claude"""
        print(f"🤖 API Key present: {bool(self.api_key)}")
        print(f"🔑 API Key preview: {self.api_key[:20] if self.api_key else 'None'}...")
        
        if not self.client:
            print("⚠️ No API key found, using mock narration")
            return await self._get_mock_narration(region, features)
        
        # Create a rich prompt for Claude
        prompt = self._create_prompt(region, features)
        
        try:
            print(f"🔥 Calling Anthropic API for region: {region}")
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=1000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            print(f"✅ Successfully generated narration from Claude")
            return response.content[0].text
        except Exception as e:
            print(f"❌ Anthropic API error: {e}")
            import traceback
            traceback.print_exc()
            return await self._get_mock_narration(region, features)
    
    def _create_prompt(self, region: str, features: Dict[str, Any]) -> str:
        """Create a detailed prompt for Claude"""
        region_name = region.replace('_', ' ')
        
        return f"""You are an environmental storyteller creating a captivating narrative about {region_name}. 

Based on the following real-time environmental data, create a compelling 2-3 paragraph story that:
- Describes the current environmental conditions in an engaging, accessible way
- Explains the ecological significance of the data
- Connects the data to broader environmental themes
- Uses vivid, descriptive language that helps people understand and care about their environment

Environmental Data:
- Temperature: {features.get('temperature', 'N/A')}°C
- Humidity: {features.get('humidity', 'N/A')}%
- Air Quality Index: {features.get('air_quality_index', 'N/A')}
- Wind Speed: {features.get('wind_speed', 'N/A')} m/s
- Atmospheric Pressure: {features.get('pressure', 'N/A')} hPa
- Precipitation: {features.get('precipitation', 'N/A')} mm
- UV Index: {features.get('uv_index', 'N/A')}
- Visibility: {features.get('visibility_from_space', 'N/A')} km
- Cloud Cover: {features.get('cloud_cover', 'N/A')}%
- Solar Radiation: {features.get('solar_radiation', 'N/A')} W/m²
- CO2 Concentration: {features.get('co2_concentration', 'N/A')} ppm
- Ozone Concentration: {features.get('ozone_concentration', 'N/A')} ppb
- Pollen Count: {features.get('pollen_count', 'N/A')}
- Soil Moisture: {features.get('soil_moisture', 'N/A')}%
- Noise Level: {features.get('noise_level', 'N/A')} dB

Write in a warm, informative tone that helps people understand and care about their environment."""
    
    async def _get_mock_narration(self, region: str, features: Dict[str, Any]) -> str:
        """Fallback mock narration when Anthropic is not available"""
        f = features
        return (f"In {region.replace('_',' ')}, clouds cover ~{int(f.get('cloud_cover', 0))}%. "
                f"Temperature is {f.get('temperature', 0):.1f}°C with {f.get('humidity', 0):.1f}% humidity. "
                f"Winds are {f.get('wind_speed', 0):.1f} m/s and air quality index is {f.get('air_quality_index', 0):.0f}. "
                f"This creates a {'dynamic' if f.get('wind_speed', 0) > 5 else 'calm'} atmospheric environment "
                f"with {'excellent' if f.get('air_quality_index', 0) < 50 else 'moderate'} air quality conditions. "
                "— Enhanced local generation (Claude AI not available).")
