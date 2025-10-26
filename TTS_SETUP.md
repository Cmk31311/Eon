# Fish Audio TTS Integration

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory with your Fish Audio API key:

```bash
FISH_API_KEY=your_fish_audio_api_key_here
FISH_VOICE_ID=optional_default_voice
FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts
PORT=3001
```

### 2. Running the Application

**Terminal 1 - Start the TTS Server:**
```bash
npm run server
```

**Terminal 2 - Start the Frontend:**
```bash
cd frontend && npm run dev
```

### 3. Usage
1. Navigate to `http://localhost:5173`
2. Click on any region on the globe
3. Wait for the AI narrative to generate
4. Click the "🔈 Speak" button next to the narrative text
5. The text will be converted to speech using Fish Audio TTS

### 4. Features
- ✅ Secure TTS proxy (API key never exposed to client)
- ✅ Automatic audio playback
- ✅ Button state management (disabled while speaking)
- ✅ Error handling with user feedback
- ✅ Responsive design with Tailwind CSS

### 5. API Endpoints
- `POST /api/tts` - Text-to-speech conversion proxy

### 6. Files Added/Modified
- `server/index.js` - Express TTS proxy server
- `frontend/src/lib/ttsClient.ts` - TTS client helper
- `frontend/src/components/NarrativePanel.tsx` - UI component with Speak button
- `frontend/src/App.tsx` - Integration of NarrativePanel
- `frontend/vite.config.ts` - Proxy configuration
- `package.json` - Server script added
