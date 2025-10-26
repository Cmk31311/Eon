# 🏗️ EarthStory Architecture

## System Overview

EarthStory is a full-stack web application that transforms environmental data into immersive storytelling experiences with adaptive music.

## 🎯 Core Components

### Frontend (React + TypeScript)
- **GlobeViewer**: Interactive 3D Earth visualization with CesiumJS
- **EnvironmentalLayers**: Real-time environmental data visualization
- **AudioPlayer**: Text-to-speech narration playback
- **ClimateComposer**: Adaptive music generation with Tone.js

### Backend (FastAPI + Python)
- **BasetenService**: ML model integration for environmental data
- **AnthropicService**: AI narration generation with Claude
- **DeepgramService**: Text-to-speech conversion
- **RedisService**: Caching layer for performance
- **ElasticService**: Data storage and analytics

## 🔄 Data Flow

```
User Interaction → Globe Selection → API Call → Data Processing → AI Generation → Audio/Music
```

1. **User selects region** on 3D globe
2. **Frontend calls** `/features` endpoint with coordinates
3. **Backend fetches** environmental data from Baseten
4. **Data is cached** in Redis for performance
5. **Claude generates** contextual narration
6. **Deepgram converts** text to speech
7. **Tone.js creates** adaptive music
8. **Data is stored** in Elasticsearch for analytics

## 🗄️ Data Models

### Environmental Features
```typescript
interface Features {
  cloud_pct: number;        // Cloud cover percentage
  rain_24h_mm: number;       // 24-hour rainfall
  wind_ms: number;          // Wind speed in m/s
  lst_anom_c: number;       // Land surface temperature anomaly
  ndvi_anom: number;        // Vegetation health index
  aod: number;              // Air quality index
  lightning_rate: number;   // Lightning activity
  time_of_day: string;      // Day/night cycle
  biome: string;           // Ecosystem type
  seed: number;            // Random seed for consistency
}
```

## 🔌 API Endpoints

### Core Endpoints
- `GET /health` - Service status and health check
- `GET /features` - Environmental data for region
- `POST /narrate` - AI-generated environmental story
- `POST /tts` - Text-to-speech conversion
- `GET /analytics/{region}` - Historical analytics
- `GET /historical/{region}` - Time-series data

### Request/Response Examples

#### Get Features
```bash
GET /features?region=San_Francisco_Bay&latitude=37.7749&longitude=-122.4194
```

Response:
```json
{
  "region": "San_Francisco_Bay",
  "features": {
    "cloud_pct": 0.45,
    "rain_24h_mm": 12.3,
    "wind_ms": 8.7,
    "lst_anom_c": 2.1,
    "ndvi_anom": 0.15,
    "aod": 0.3,
    "lightning_rate": 0.05,
    "time_of_day": "day",
    "biome": "temperate",
    "seed": 12345
  },
  "cached": false
}
```

#### Generate Narration
```bash
POST /narrate
{
  "region": "San_Francisco_Bay",
  "features": { ... }
}
```

Response:
```json
{
  "text": "In San Francisco Bay, the atmosphere tells a story of dynamic change...",
  "cached": false
}
```

## 🎵 Music Generation

### ClimateComposer Logic
The `ClimateComposer` class adapts music based on environmental conditions:

- **Cloud Cover**: Affects brightness and mood
- **Temperature**: Influences tempo and energy
- **Wind Speed**: Controls reverb and atmosphere
- **Rainfall**: Adds percussive elements
- **Vegetation**: Modulates harmonic content

### Musical Parameters
```typescript
interface MusicParams {
  bpm: number;           // Tempo based on temperature
  brightness: number;    // Filter frequency based on clouds
  reverb: number;        // Atmospheric depth
  harmony: string[];      // Chord progression
  rhythm: number;         // Percussion intensity
}
```

## 💾 Caching Strategy

### Redis Caching
- **Features**: 1-hour TTL for environmental data
- **Narration**: 2-hour TTL for AI-generated stories
- **TTS Audio**: 24-hour TTL for speech files

### Cache Keys
```
features:{region}           # Environmental data
narration:{region}:{hash}   # AI-generated stories
tts:{text_hash}             # Audio files
```

## 📊 Analytics & Storage

### Elasticsearch Integration
- **Index**: `earthstory-features`
- **Document Structure**: Region, coordinates, features, timestamp
- **Analytics**: Statistical aggregations for trends
- **Historical Data**: Time-series analysis

### Analytics Queries
```json
{
  "query": {
    "bool": {
      "must": [
        {"term": {"region": "San_Francisco_Bay"}},
        {"range": {"timestamp": {"gte": "now-7d"}}}
      ]
    }
  },
  "aggs": {
    "cloud_stats": {"stats": {"field": "features.cloud_pct"}},
    "temp_stats": {"stats": {"field": "features.lst_anom_c"}}
  }
}
```

## 🔧 Configuration

### Environment Variables
```env
# API Keys
BASETEN_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
DEEPGRAM_API_KEY=your_key

# Infrastructure
REDIS_URL=redis://localhost:6379
ELASTIC_URL=http://localhost:9200

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading for CesiumJS
- **Asset Optimization**: Compressed images and audio
- **Caching**: Browser cache for static assets
- **CDN**: Global content delivery

### Backend
- **Async Processing**: Non-blocking I/O operations
- **Connection Pooling**: Database connection management
- **Caching**: Redis for frequently accessed data
- **Rate Limiting**: API protection

## 🔒 Security Considerations

### API Security
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Pydantic models
- **Error Handling**: Graceful failure modes

### Data Privacy
- **No Personal Data**: Only environmental metrics
- **API Key Security**: Environment variable storage
- **HTTPS**: Encrypted communication
- **Audit Logging**: Request/response tracking

## 📈 Monitoring & Observability

### Health Checks
- **Service Status**: `/health` endpoint
- **Dependencies**: Redis, Elasticsearch connectivity
- **API Keys**: Service availability
- **Performance**: Response times and throughput

### Metrics
- **Request Rate**: API calls per minute
- **Cache Hit Rate**: Redis performance
- **Error Rate**: Failed requests
- **Latency**: Response time distribution

## 🔄 Deployment Architecture

### Development
```
Frontend (Vite) → Backend (FastAPI) → Redis → Elasticsearch
```

### Production
```
CDN → Load Balancer → Frontend (Nginx) → Backend (FastAPI) → Redis Cluster → Elasticsearch Cluster
```

## 🛠️ Development Workflow

### Local Development
1. Start Redis and Elasticsearch
2. Run backend with `uvicorn main:app --reload`
3. Run frontend with `npm run dev`
4. Access at `http://localhost:5173`

### Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

---

**EarthStory: Where environmental data meets immersive storytelling** 🌍🎵
