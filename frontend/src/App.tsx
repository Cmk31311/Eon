import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import EarthGlobe from './components/EarthGlobe';
import { environmentalDataService, EnvironmentalData } from './services/environmentalDataService';
import { narrativeService, NarrativeResponse } from './services/narrativeService';

// Comprehensive global region data with coordinates
const regions = [
  // Rainforests
  { name: 'amazon_rainforest', lat: -3.4653, lon: -62.2159, label: 'Amazon Rainforest', category: 'Rainforest' },
  { name: 'congo_rainforest', lat: -0.2280, lon: 15.8277, label: 'Congo Rainforest', category: 'Rainforest' },
  { name: 'borneo_rainforest', lat: 1.3521, lon: 103.8198, label: 'Borneo Rainforest', category: 'Rainforest' },
  { name: 'daintree_rainforest', lat: -16.1667, lon: 145.4167, label: 'Daintree Rainforest', category: 'Rainforest' },
  { name: 'atlantic_forest', lat: -23.5505, lon: -46.6333, label: 'Atlantic Forest', category: 'Rainforest' },

  // Deserts
  { name: 'sahara_desert', lat: 23.8061, lon: 11.2884, label: 'Sahara Desert', category: 'Desert' },
  { name: 'gobi_desert', lat: 42.5900, lon: 103.4300, label: 'Gobi Desert', category: 'Desert' },
  { name: 'atacama_desert', lat: -24.5000, lon: -69.2500, label: 'Atacama Desert', category: 'Desert' },
  { name: 'namib_desert', lat: -24.5000, lon: 15.0000, label: 'Namib Desert', category: 'Desert' },
  { name: 'mohave_desert', lat: 35.0000, lon: -115.5000, label: 'Mojave Desert', category: 'Desert' },

  // Mountains
  { name: 'himalayas', lat: 28.0000, lon: 84.0000, label: 'Himalayas', category: 'Mountain' },
  { name: 'alps', lat: 46.5197, lon: 6.6323, label: 'Alps', category: 'Mountain' },
  { name: 'rocky_mountains', lat: 39.7392, lon: -104.9903, label: 'Rocky Mountains', category: 'Mountain' },
  { name: 'andes', lat: -32.6532, lon: -70.0112, label: 'Andes', category: 'Mountain' },
  { name: 'urals', lat: 60.0000, lon: 60.0000, label: 'Ural Mountains', category: 'Mountain' },

  // Coastal
  { name: 'great_barrier_reef', lat: -18.2871, lon: 147.6992, label: 'Great Barrier Reef', category: 'Coastal' },
  { name: 'maldives', lat: 3.2028, lon: 73.2207, label: 'Maldives', category: 'Coastal' },
  { name: 'hawaii', lat: 19.8968, lon: -155.5828, label: 'Hawaii', category: 'Coastal' },
  { name: 'galapagos', lat: -0.7893, lon: -91.0544, label: 'Galapagos Islands', category: 'Coastal' },
  { name: 'mediterranean', lat: 35.0000, lon: 18.0000, label: 'Mediterranean Sea', category: 'Coastal' },

  // Arctic/Antarctic
  { name: 'antarctica', lat: -75.0000, lon: 0.0000, label: 'Antarctica', category: 'Polar' },
  { name: 'alaska', lat: 64.2008, lon: -149.4937, label: 'Alaska', category: 'Polar' },
  { name: 'siberia', lat: 60.0000, lon: 100.0000, label: 'Siberia', category: 'Polar' },
  { name: 'greenland', lat: 71.7069, lon: -42.6043, label: 'Greenland', category: 'Polar' },
  { name: 'northern_canada', lat: 60.0000, lon: -100.0000, label: 'Northern Canada', category: 'Polar' },

  // Islands
  { name: 'iceland', lat: 64.9631, lon: -19.0208, label: 'Iceland', category: 'Island' },
  { name: 'madagascar', lat: -18.7669, lon: 46.8691, label: 'Madagascar', category: 'Island' },
  { name: 'philippines', lat: 12.8797, lon: 121.7740, label: 'Philippines', category: 'Island' },
  { name: 'sri_lanka', lat: 7.8731, lon: 80.7718, label: 'Sri Lanka', category: 'Island' },

  // Plains
  { name: 'serengeti', lat: -2.1530, lon: 34.6857, label: 'Serengeti', category: 'Plains' },
  { name: 'pampas', lat: -34.6037, lon: -58.3816, label: 'Pampas', category: 'Plains' },
  { name: 'prairies', lat: 49.0000, lon: -100.0000, label: 'Great Plains', category: 'Plains' },
  { name: 'steppes', lat: 50.0000, lon: 100.0000, label: 'Eurasian Steppes', category: 'Plains' },
  { name: 'savanna', lat: -15.0000, lon: 20.0000, label: 'African Savanna', category: 'Plains' }
];

function App() {
  const [region, setRegion] = useState<string>('amazon_rainforest');
  const [features, setFeatures] = useState<any>(null);
  const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current region data
  const currentRegion = regions.find(r => r.name === region);

  // Load region data
  const loadRegionData = useCallback(async (regionName: string) => {
    setIsLoading(true);
    try {
      const regionData = regions.find(r => r.name === regionName);
      if (!regionData) return;

      console.log(`🌍 Loading data for ${regionData.label}...`);
      
      // Get environmental data
      const environmentalData = await environmentalDataService.getLiveEnvironmentalData(
        regionData.lat, 
        regionData.lon, 
        regionData.label
      );
      
      setFeatures(environmentalData);
      setLastUpdate(new Date());

      // Get narrative
        try {
        const narrativeResponse = await narrativeService.generateNarrative(environmentalData, regionData.label);
        setNarrative(narrativeResponse);
        } catch (narrativeError) {
        console.warn('Narrative generation failed:', narrativeError);
        setNarrative(null);
      }
      
    } catch (error) {
      console.error('Failed to load region data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when region changes
  useEffect(() => {
    if (region) {
      loadRegionData(region);
    }
  }, [region, loadRegionData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (region) {
        loadRegionData(region);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, region, loadRegionData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="project-title mb-2">
            Eon
          </h1>
          <h2 className="project-subtitle mb-4">
            Earth Saga
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore the world through environmental data and interactive storytelling
          </p>
        </div>

        {/* Interactive Globe - Main Feature */}
        <div className="w-full mx-auto mb-8">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                🌍 Interactive Globe
            </span>
        </h2>
            <div className="h-[70vh] min-h-[500px] rounded-lg overflow-hidden">
          <EarthGlobe 
            selectedRegion={region}
                onRegionClick={(regionName: string) => {
                  setRegion(regionName);
                  setIsDropdownOpen(false);
                }}
              regions={regions}
          />
        </div>
            </div>
          </div>
          
        {/* Region Dropdown */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative" ref={dropdownRef}>
          <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-lg font-medium">
                  {currentRegion ? currentRegion.label : 'Select a Region'}
                </span>
                <span className="text-sm text-gray-400">
                  {currentRegion ? currentRegion.category : ''}
                    </span>
                  </div>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
          </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                {regions.map((regionData) => (
                  <button
                    key={regionData.name}
                    onClick={() => {
                      setRegion(regionData.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left hover:bg-white/10 transition-all duration-300 border-b border-white/5 last:border-b-0 ${
                      region === regionData.name
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-white'
                    }`}
                  >
                    <div className="font-medium">{regionData.label}</div>
                    <div className="text-sm text-gray-400">{regionData.category}</div>
                  </button>
                ))}
              </div>
            )}
                  </div>
            </div>

        {/* Environmental Stats Panel */}
        {features && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    📊 Environmental Statistics
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
                  </div>
                    <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                      autoRefresh 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(features)
                      .filter(([key]) => key !== 'last_updated')
                      .slice(0, 8)
                      .map(([key, value]) => (
                    <div key={key} className="bg-white/5 p-4 rounded-lg">
                      <div className="text-green-300 font-medium text-sm capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-white font-bold text-lg">
                        {typeof value === 'number' ? value.toFixed(1) : String(value)}
                        {key === 'temperature' && '°C'}
                        {key === 'humidity' && '%'}
                        {key === 'wind_speed' && ' m/s'}
                        {key === 'pressure' && ' hPa'}
                        {key === 'precipitation' && ' mm'}
                        {key === 'uv_index' && ''}
                        {key === 'visibility' && ' km'}
                        {key === 'cloud_cover' && '%'}
                        {key === 'solar_radiation' && ' W/m²'}
                        {key === 'air_quality_index' && ''}
                        {key === 'co2_concentration' && ' ppm'}
                </div>
                </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Narrative Panel */}
        {narrative && (
          <div className="max-w-4xl mx-auto mb-8">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  🤖 AI Environmental Narrative
                </span>
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{narrative.narrative}</p>
                </div>
                  </div>
              )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg text-gray-300">Loading environmental data...</span>
              </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;