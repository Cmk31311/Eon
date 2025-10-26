import redis
import json
from typing import Optional, Dict, Any
from config import Config

class RedisService:
    def __init__(self):
        self.redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
    
    async def get_cached_features(self, region: str) -> Optional[Dict[str, Any]]:
        """Get cached environmental features for a region"""
        try:
            cached_data = self.redis_client.get(f"features:{region}")
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Redis get error: {e}")
        return None
    
    async def cache_features(self, region: str, features: Dict[str, Any], ttl: int = 3600):
        """Cache environmental features for a region (1 hour TTL)"""
        try:
            self.redis_client.setex(
                f"features:{region}",
                ttl,
                json.dumps(features)
            )
        except Exception as e:
            print(f"Redis set error: {e}")
    
    async def get_cached_narration(self, region: str, features_hash: str) -> Optional[str]:
        """Get cached narration for a region and feature set"""
        try:
            cached_data = self.redis_client.get(f"narration:{region}:{features_hash}")
            return cached_data
        except Exception as e:
            print(f"Redis get error: {e}")
        return None
    
    async def cache_narration(self, region: str, features_hash: str, narration: str, ttl: int = 7200):
        """Cache narration for a region and feature set (2 hour TTL)"""
        try:
            self.redis_client.setex(
                f"narration:{region}:{features_hash}",
                ttl,
                narration
            )
        except Exception as e:
            print(f"Redis set error: {e}")
