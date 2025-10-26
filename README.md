# 🌍 EON - Earth Saga

> **Interactive Environmental Data Visualization & AI-Powered Storytelling**

An immersive web application that transforms real-time environmental data from 222+ global regions into dynamic, AI-generated narratives with text-to-speech capabilities.

![EON Earth Saga](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

### 🌐 Interactive 3D Globe
- **222+ Unique Regions** across 8 categories (Rainforest, Desert, Mountain, Coastal, Urban, Wetland, Volcanic, Tundra)
- **Real-time Environmental Data** from Open-Meteo and OpenWeatherMap APIs
- **Smooth 3D Interactions** with Three.js and React Globe GL
- **Responsive Design** optimized for all devices

### 🤖 AI-Powered Narratives
- **Dynamic Story Generation** using enhanced local AI algorithms
- **Data-Driven Content** based on real environmental parameters
- **Unique Narratives** that change on every refresh
- **Regional Context** with location-specific storytelling

### 🔊 Text-to-Speech
- **Custom Voice Integration** with Fish Audio TTS
- **Personalized Narration** using your custom "Cmk" voice
- **Real-time Audio Generation** with stop/play controls
- **Fallback Support** with browser speech synthesis

### 🎨 Advanced UI/UX
- **Glassmorphism Design** with modern aesthetics
- **Dark/Light Theme Toggle** with system preference detection
- **Smooth Animations** and micro-interactions
- **Performance Optimized** with lazy loading and memoization

### 🔍 Smart Features
- **Region Search** with instant filtering
- **Bookmark System** for favorite locations
- **Data Export** (CSV/JSON formats)
- **Environmental Parameters**: Temperature, Humidity, Pressure, Wind, Precipitation, UV Index, Visibility from Space, Cloud Cover, Solar Radiation, Air Quality, CO2, Ozone, Pollen, Soil Moisture, Noise Level

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Fish Audio API key (for TTS)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/eon-earth-saga.git
cd eon-earth-saga

# Install dependencies
npm install
cd frontend && npm install

# Set up environment variables
cp .env.example .env
# Add your Fish Audio API key to .env
```

### Development

```bash
# Start the frontend development server
npm run dev

# Start the TTS server (optional)
npm run server

# Open http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
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
   FISH_API_KEY=your_fish_audio_api_key
   FISH_VOICE_ID=@https://fish.audio/m/your_voice_id
   FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts
   ```

### Other Platforms
- **Netlify**: Works with static build
- **GitHub Pages**: Static deployment
- **Railway/Render**: Full-stack deployment

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Three.js** for 3D graphics
- **React Globe GL** for globe visualization

### Backend Services
- **Express.js** serverless functions (Vercel)
- **Fish Audio TTS** integration
- **Open-Meteo API** for weather data
- **OpenWeatherMap** for air quality data

### Data Flow
```
User Interaction → Region Selection → API Data Fetch → AI Narrative Generation → TTS Audio → User Experience
```

## 📊 Environmental Data Sources

- **Weather Data**: Open-Meteo API (temperature, humidity, pressure, wind, precipitation, UV, visibility, clouds)
- **Air Quality**: OpenWeatherMap Air Pollution API (AQI, CO2, ozone, pollen)
- **Additional Parameters**: Calculated soil moisture, noise levels, solar radiation

## 🎯 Hackathon Demo Script

### 30-Second Pitch
"EON Earth Saga transforms environmental data into immersive stories. Click any of 222 global regions to see real-time data become AI-generated narratives with your custom voice."

### Key Demo Points
1. **Interactive Globe**: "Explore 222 unique regions worldwide"
2. **Real-time Data**: "Live environmental parameters from space"
3. **AI Narratives**: "Powered by enhanced local AI algorithms"
4. **Custom TTS**: "Hear stories in your own voice"
5. **Advanced Features**: "Search, bookmark, export data"

## 🔧 Configuration

### Environment Variables

```env
# Fish Audio TTS (Required for voice features)
FISH_API_KEY=your_api_key_here
FISH_VOICE_ID=@https://fish.audio/m/your_voice_id
FISH_TTS_ENDPOINT=https://api.fish.audio/v1/tts

# Note: AI narratives use enhanced local generation - no external backend needed
```

### Customization

- **Add Regions**: Edit `frontend/src/App.tsx` regions array
- **Modify Narratives**: Update `frontend/src/services/narrativeService.ts`
- **Change Styling**: Modify `frontend/src/index.css` and Tailwind config
- **Update APIs**: Configure in `frontend/src/services/environmentalDataService.ts`

## 📈 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading**: Lazy loading for components
- **Caching**: Memoized calculations and API responses
- **Rendering**: React.memo for performance optimization
- **Assets**: Compressed images and optimized 3D models

## 🛠️ Development

### Project Structure
```
eon-earth-saga/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── lib/             # Utilities
│   │   └── utils/           # Helper functions
│   └── dist/                # Build output
├── server/                  # Express serverless functions
# No backend directory needed - simplified architecture
├── vercel.json             # Vercel configuration
└── package.json            # Root package config
```

### Key Components
- **`App.tsx`**: Main application with 222 regions
- **`EarthGlobe.tsx`**: 3D globe visualization
- **`NarrativePanel.tsx`**: AI narrative display
- **`ThemeToggle.tsx`**: Dark/light mode
- **`environmentalDataService.ts`**: Data fetching
- **`narrativeService.ts`**: AI narrative generation
- **`ttsClient.ts`**: Text-to-speech integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Enhanced Local AI** for narrative generation
- **Fish Audio** for text-to-speech capabilities
- **Open-Meteo** for weather data
- **OpenWeatherMap** for air quality data
- **Three.js** for 3D graphics
- **React Globe GL** for globe visualization

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/eon-earth-saga/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/eon-earth-saga/discussions)
- **Email**: your.email@example.com

---

**Built with ❤️ for environmental awareness and storytelling**

*Transform data into stories. Explore the world through AI-powered narratives.*
