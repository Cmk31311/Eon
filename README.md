# 🌍 EON - Earth Saga

> **Interactive Environmental Data Visualization & Claude AI-Powered Storytelling**

An immersive web application that transforms real-time environmental data from 222+ global regions into dynamic, Claude AI-generated narratives with multi-voice text-to-speech capabilities.

![EON Earth Saga](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![Claude AI](https://img.shields.io/badge/AI-Claude%20Sonnet%204.5-purple)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

### 🌐 Interactive 3D Globe
- **222+ Unique Regions** across multiple categories (Rainforest, Desert, Mountain, Coastal, Polar, Island, Plains)
- **Real-time Environmental Data** from Open-Meteo and OpenWeatherMap APIs
- **Smooth 3D Interactions** with Three.js and React Globe GL
- **Responsive Design** optimized for all devices

### 🤖 Claude AI-Powered Narratives
- **Dynamic Story Generation** using Claude Sonnet 4.5 API
- **Data-Driven Content** analyzing all environmental parameters
- **Unique Narratives** that change with each generation
- **Regional Context** with location-specific storytelling
- **Health Analysis** with implications and recommendations

### 🔊 Multi-Voice Text-to-Speech
- **Custom Voice Integration** with Fish Audio TTS
- **Multiple Voices** - rotates through available voices on each click
- **Real-time Audio Generation** with stop/play controls
- **High-Quality Audio** with professional voice synthesis

### 🎨 Advanced UI/UX
- **Glassmorphism Design** with modern aesthetics
- **Dark/Light Theme Toggle** with system preference detection
- **Smooth Animations** and micro-interactions
- **Performance Optimized** with lazy loading and memoization

### 🔍 Smart Features
- **Region Search** with instant filtering
- **Bookmark System** for favorite locations
- **Data Export** (CSV/JSON formats)
- **15+ Environmental Parameters**: Temperature, Humidity, Pressure, Wind, Precipitation, UV Index, Visibility, Cloud Cover, Solar Radiation, Air Quality, CO2, Ozone, Pollen, Soil Moisture, Noise Level

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic Claude API key
- Fish Audio API key (for TTS)

### Installation

```bash
# Clone the repository
git clone https://github.com/Cmk31311/Eon.git
cd earthstory

# Install dependencies
cd frontend && npm install
cd ../server && npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Anthropic Claude API
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Fish Audio TTS
FISH_API_KEY=your_fish_audio_api_key
FISH_VOICE_ID=your_voice_id
FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts
```

### Development

```bash
# Start the frontend development server (from frontend/)
npm run dev

# Start the TTS server (from server/) in another terminal
node index.js

# Open http://localhost:5173
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   ```
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
   FISH_API_KEY=your_fish_audio_api_key
   FISH_VOICE_ID=your_voice_id
   FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts
   ```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Three.js** for 3D graphics
- **React Globe GL** for globe visualization
- **Anthropic SDK** for Claude AI integration

### Backend Services
- **Express.js** serverless functions (Vercel)
- **Fish Audio TTS** integration for voice synthesis
- **Open-Meteo API** for weather data
- **OpenWeatherMap** for air quality data

### Data Flow
```
User Interaction → Region Selection → API Data Fetch → Claude AI Analysis → Narrative Generation → Multi-Voice TTS → User Experience
```

## 📊 Environmental Data Sources

- **Weather Data**: Open-Meteo API (temperature, humidity, pressure, wind, precipitation, UV, visibility, clouds, solar radiation)
- **Air Quality**: OpenWeatherMap Air Pollution API (AQI, CO2, ozone, pollen)
- **Calculated Parameters**: Soil moisture, noise levels

## 🎯 Key Features Showcase

### 30-Second Demo
"EON Earth Saga transforms environmental data into immersive stories. Click any of 222 global regions to see real-time data analyzed by Claude AI, generating unique narratives that you can hear in multiple voices."

### Key Demo Points
1. **Interactive Globe**: "Explore 222 unique regions worldwide"
2. **Real-time Data**: "Live environmental parameters from space"
3. **Claude AI Analysis**: "Powered by Claude Sonnet 4.5"
4. **Multi-Voice TTS**: "Hear stories in different voices"
5. **Advanced Features**: "Search, bookmark, export data"

## 🔧 Configuration

### Environment Variables

```env
# Anthropic Claude API (Required for AI narratives)
VITE_ANTHROPIC_API_KEY=your_api_key_here

# Fish Audio TTS (Required for voice features)
FISH_API_KEY=your_api_key_here
FISH_VOICE_ID=your_voice_id
FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts
```

### Customization

- **Add Regions**: Edit `frontend/src/App.tsx` regions array
- **Modify Claude Prompts**: Update `frontend/src/services/claudeService.ts`
- **Change Styling**: Modify `frontend/src/index.css` and Tailwind config
- **Update APIs**: Configure in `frontend/src/services/environmentalDataService.ts`

## 📈 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Lazy loading for components
- **Caching**: Memoized calculations and API responses
- **Rendering**: React.memo for performance optimization
- **API Calls**: Efficient Claude API usage with fallback

## 🛠️ Development

### Project Structure
```
earthstory/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── EarthGlobe.tsx
│   │   │   ├── NarrativePanel.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── services/         # API services
│   │   │   ├── claudeService.ts      # Claude AI integration
│   │   │   ├── narrativeService.ts   # Narrative orchestration
│   │   │   └── environmentalDataService.ts
│   │   ├── lib/             # Utilities
│   │   │   └── ttsClient.ts # Text-to-speech
│   │   └── utils/           # Helper functions
│   └── dist/                # Build output
├── server/                  # Express serverless functions
│   └── index.js            # TTS proxy server
├── vercel.json             # Vercel configuration
└── package.json            # Root package config
```

### Key Components
- **`App.tsx`**: Main application with 222 regions and data visualization
- **`EarthGlobe.tsx`**: 3D globe visualization
- **`NarrativePanel.tsx`**: Claude AI narrative display with TTS
- **`claudeService.ts`**: Claude AI API integration
- **`environmentalDataService.ts`**: Data fetching
- **`ttsClient.ts`**: Multi-voice text-to-speech

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic Claude AI** for intelligent narrative generation
- **Fish Audio** for text-to-speech capabilities
- **Open-Meteo** for weather data
- **OpenWeatherMap** for air quality data
- **Three.js** for 3D graphics
- **React Globe GL** for globe visualization

## 📞 Support

- **Repository**: [GitHub](https://github.com/Cmk31311/Eon)
- **Issues**: [GitHub Issues](https://github.com/Cmk31311/Eon/issues)

---

**Built with ❤️ for environmental awareness and storytelling**

*Transform data into stories. Explore the world through Claude AI-powered narratives.*
