import React, { useEffect, useRef, useState, useCallback, memo } from 'react';

interface Region {
  name: string;
  lat: number;
  lon: number;
  label: string;
  category: string;
}

interface EarthGlobeProps {
  selectedRegion: string;
  onRegionClick: (regionId: string) => void;
  regions: Region[];
}

const EarthGlobe = memo(function EarthGlobe({ selectedRegion, onRegionClick, regions }: EarthGlobeProps) {
  const globeEl = useRef<any>(null);
  const [Globe, setGlobe] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    import('react-globe.gl').then((module) => {
      setGlobe(() => module.default);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to load react-globe.gl:', error);
      setError('Failed to load globe');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (globeEl.current && Globe && selectedRegion) {
      const selectedRegionData = regions.find(r => r.name === selectedRegion);
      if (selectedRegionData) {
        globeEl.current.pointOfView(
          { lat: selectedRegionData.lat, lng: selectedRegionData.lon, altitude: 2 },
          1000
        );
      }
    }
  }, [Globe, selectedRegion, regions]);

  useEffect(() => {
    if (globeEl.current && Globe) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableDamping = true;
      globeEl.current.controls().dampingFactor = 0.1;
      globeEl.current.controls().rotateSpeed = 1.0;
      globeEl.current.controls().zoomSpeed = 0.5;
    }
  }, [Globe]);

  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      'Rainforest': '#00ff00',
      'Desert': '#ffbb33',
      'Tundra': '#b3f0ff',
      'Coastal': '#00d9ff',
      'Temperate': '#00ffaa',
      'Urban': '#ff5757',
      'Special': '#ff66cc'
    };
    return colors[category] || '#ffffff';
  }, []);

  const handlePointClick = useCallback((point: any) => {
    if (point && point.name) {
      onRegionClick(point.name);
    }
  }, [onRegionClick]);

  const handleLabelClick = useCallback((label: any) => {
    if (label && label.name) {
      onRegionClick(label.name);
    }
  }, [onRegionClick]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl flex items-center justify-center rounded-2xl border border-white/20 shadow-2xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mb-6" role="status" aria-label="Loading globe">
            <span className="sr-only">Loading...</span>
          </div>
          <div className="text-2xl font-bold text-white/90 tracking-wide">
            🌍 Loading Interactive Earth...
          </div>
        </div>
      </div>
    );
  }

  if (error || !Globe) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-900/50 via-pink-900/50 to-orange-900/50 backdrop-blur-xl flex items-center justify-center rounded-2xl border border-red-500/30 shadow-2xl" role="alert">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold text-red-300 tracking-wide">
            Failed to load Interactive Earth
          </div>
          <p className="text-red-200 mt-2">Please refresh the page to try again</p>
        </div>
      </div>
    );
  }

  const selectedRegionData = selectedRegion ? regions.find(r => r.name === selectedRegion) : null;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="rgba(59, 130, 246, 0.6)"
        atmosphereAltitude={0.2}
        enablePointerInteraction={true}
        animateIn={false}
        
        pointsData={selectedRegionData ? [selectedRegionData] : []}
        pointLat={(d: Region) => d.lat}
        pointLng={(d: Region) => d.lon}
        pointColor={(d: Region) => getCategoryColor(d.category)}
        pointRadius={0.6}
        pointAltitude={0.02}
        
        labelsData={selectedRegionData ? [selectedRegionData] : []}
        labelLat={(d: Region) => d.lat}
        labelLng={(d: Region) => d.lon}
        labelText={(d: Region) => d.label}
        labelSize={1.2}
        labelColor={() => '#ffffff'}
        labelDotRadius={0.5}
        labelFont='"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
        
        onPointClick={handlePointClick}
        onLabelClick={handleLabelClick}
      />
    </div>
  );
});

export default EarthGlobe;