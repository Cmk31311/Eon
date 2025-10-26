import httpx
import asyncio
from typing import Optional
from config import Config

class DeepgramService:
    def __init__(self):
        self.api_key = Config.DEEPGRAM_API_KEY
        self.base_url = Config.DEEPGRAM_BASE_URL
    
    async def text_to_speech(self, text: str, voice: str = "aura-asteria-en") -> Optional[bytes]:
        """Convert text to speech using Deepgram"""
        if not self.api_key:
            print("Deepgram API key not configured")
            return None
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v1/speak",
                    headers={
                        "Authorization": f"Token {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "text": text,
                        "model": voice,
                        "encoding": "linear16",
                        "sample_rate": 24000
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                return response.content
            except Exception as e:
                print(f"Deepgram API error: {e}")
                return None
    
    async def save_audio_file(self, audio_data: bytes, filename: str) -> str:
        """Save audio data to file and return the file path"""
        import aiofiles
        import os
        
        # Create audio directory if it doesn't exist
        os.makedirs("audio", exist_ok=True)
        filepath = f"audio/{filename}"
        
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(audio_data)
        
        return filepath
