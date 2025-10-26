from elasticsearch import Elasticsearch
from typing import Dict, Any, List
from datetime import datetime
import json
from config import Config

class ElasticService:
    def __init__(self):
        if Config.ELASTIC_PASSWORD:
            self.es = Elasticsearch(
                [Config.ELASTIC_URL],
                basic_auth=(Config.ELASTIC_USERNAME, Config.ELASTIC_PASSWORD)
            )
        else:
            self.es = Elasticsearch([Config.ELASTIC_URL])
    
    async def store_feature_snapshot(self, region: str, features: Dict[str, Any], lat: float, lon: float):
        """Store environmental feature snapshot in Elasticsearch"""
        try:
            doc = {
                "region": region,
                "latitude": lat,
                "longitude": lon,
                "features": features,
                "timestamp": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow()
            }
            
            self.es.index(
                index="earthstory-features",
                body=doc
            )
        except Exception as e:
            print(f"Elasticsearch store error: {e}")
    
    async def get_historical_features(self, region: str, days: int = 7) -> List[Dict[str, Any]]:
        """Get historical features for a region"""
        try:
            query = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"region": region}},
                            {"range": {
                                "timestamp": {
                                    "gte": f"now-{days}d"
                                }
                            }}
                        ]
                    }
                },
                "sort": [{"timestamp": {"order": "desc"}}],
                "size": 100
            }
            
            response = self.es.search(
                index="earthstory-features",
                body=query
            )
            
            return [hit["_source"] for hit in response["hits"]["hits"]]
        except Exception as e:
            print(f"Elasticsearch query error: {e}")
            return []
    
    async def get_analytics(self, region: str) -> Dict[str, Any]:
        """Get analytics for a region"""
        try:
            # Get feature statistics
            query = {
                "query": {"term": {"region": region}},
                "aggs": {
                    "cloud_stats": {"stats": {"field": "features.cloud_pct"}},
                    "rain_stats": {"stats": {"field": "features.rain_24h_mm"}},
                    "wind_stats": {"stats": {"field": "features.wind_ms"}},
                    "temp_stats": {"stats": {"field": "features.lst_anom_c"}}
                }
            }
            
            response = self.es.search(
                index="earthstory-features",
                body=query
            )
            
            return {
                "cloud_cover": response["aggregations"]["cloud_stats"],
                "rainfall": response["aggregations"]["rain_stats"],
                "wind": response["aggregations"]["wind_stats"],
                "temperature": response["aggregations"]["temp_stats"]
            }
        except Exception as e:
            print(f"Elasticsearch analytics error: {e}")
            return {}
