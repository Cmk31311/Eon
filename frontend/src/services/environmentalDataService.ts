import axios from 'axios';

export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  precipitation: number;
  uv_index: number;
  visibility: number;
  cloud_cover: number;
  solar_radiation: number;
  air_quality_index: number;
  co2_concentration: number;
  last_updated: string;
  location_name?: string;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
    uv_index: number;
    visibility: number;
    cloud_cover: number;
    time: string;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    precipitation: string;
    uv_index: string;
    visibility: string;
    cloud_cover: string;
  };
}

class EnvironmentalDataService {
  private openMeteoBaseUrl = 'https://api.open-meteo.com/v1/forecast';

  async getLiveEnvironmentalData(lat: number, lon: number, locationName?: string): Promise<EnvironmentalData> {
    console.log(`🌍 Fetching environmental data for ${locationName || 'location'} at ${lat}, ${lon}`);
    
    try {
      const realData = await this.fetchOpenMeteoData(lat, lon);
      if (realData && realData.current) {
        console.log('✅ Successfully fetched real data from Open Meteo');
        return this.processRealData(realData, locationName);
      }
    } catch (error) {
      console.warn('⚠️ Open Meteo API failed, using location-specific mock data:', error);
    }

    console.log('🔄 Using location-specific mock data');
    return this.getLocationSpecificMockData(lat, lon, locationName);
  }

  private async fetchOpenMeteoData(lat: number, lon: number): Promise<OpenMeteoResponse> {
    const params = {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation',
        'uv_index',
        'visibility',
        'cloud_cover'
      ].join(','),
      timezone: 'auto',
      forecast_days: 1
    };

    console.log('📡 Calling Open Meteo API with params:', params);
    
    const response = await axios.get(this.openMeteoBaseUrl, { 
      params,
      timeout: 8000
    });
    
    console.log('📊 Open Meteo API response:', response.data);
    return response.data;
  }

  private processRealData(openMeteoData: OpenMeteoResponse, locationName?: string): EnvironmentalData {
    const current = openMeteoData.current;
    
    console.log('🔄 Processing real environmental data:', {
      location: locationName,
      coordinates: `${openMeteoData.latitude}, ${openMeteoData.longitude}`,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m
    });

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      pressure: current.surface_pressure,
      wind_speed: current.wind_speed_10m,
      wind_direction: current.wind_direction_10m,
      precipitation: current.precipitation,
      uv_index: current.uv_index,
      visibility: current.visibility,
      cloud_cover: current.cloud_cover,
      solar_radiation: this.calculateSolarRadiation(openMeteoData.latitude, current.cloud_cover),
      air_quality_index: this.calculateAirQualityIndex(current.surface_pressure, current.relative_humidity_2m, openMeteoData.latitude),
      co2_concentration: this.estimateCO2Concentration(current.temperature_2m, openMeteoData.latitude),
      last_updated: new Date().toISOString(),
      location_name: locationName
    };
  }

  private getLocationSpecificMockData(lat: number, lon: number, locationName?: string): EnvironmentalData {
    console.log(`🎭 Generating location-specific mock data for ${locationName} at ${lat}, ${lon}`);
    
    const baseData = this.calculateLocationBasedData(lat, lon, locationName);
    
    const variation = 0.1;
    
    return {
      temperature: this.addVariation(baseData.temperature, variation),
      humidity: this.addVariation(baseData.humidity, variation),
      pressure: this.addVariation(baseData.pressure, variation * 0.5),
      wind_speed: this.addVariation(baseData.wind_speed, variation * 2),
      wind_direction: Math.round(Math.random() * 360),
      precipitation: Math.max(0, this.addVariation(baseData.precipitation, variation * 3)),
      uv_index: this.addVariation(baseData.uv_index, variation),
      visibility: this.addVariation(baseData.visibility, variation * 0.5),
      cloud_cover: Math.max(0, Math.min(100, this.addVariation(baseData.cloud_cover, variation))),
      solar_radiation: this.addVariation(baseData.solar_radiation, variation),
      air_quality_index: this.addVariation(baseData.air_quality_index, variation),
      co2_concentration: this.addVariation(baseData.co2_concentration, variation * 0.5),
      last_updated: new Date().toISOString(),
      location_name: locationName
    };
  }

  private calculateLocationBasedData(lat: number, lon: number, locationName?: string) {
    const latitude = lat;
    const longitude = lon;
    
    const baseTemp = 30 - Math.abs(latitude) * 0.5;
    
    let baseHumidity = 60;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo') || name.includes('daintree') || name.includes('atlantic')) {
        baseHumidity = 85;
      } else if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama') || name.includes('namib') || name.includes('mohave')) {
        baseHumidity = 25;
      } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland') || name.includes('northern canada')) {
        baseHumidity = 70;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseHumidity = 75;
      } else if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london') || name.includes('mumbai') || name.includes('são paulo')) {
        baseHumidity = 65;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseHumidity = 55;
      } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines') || name.includes('sri lanka')) {
        baseHumidity = 70;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseHumidity = 50;
      }
    }
    
    const basePressure = 1013.25 - Math.abs(latitude) * 0.1;
    
    let baseWindSpeed = 3.0;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama') || name.includes('namib') || name.includes('mohave')) {
        baseWindSpeed = 5.5;
      } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland') || name.includes('northern canada')) {
        baseWindSpeed = 6.0;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseWindSpeed = 4.5;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseWindSpeed = 7.0;
      } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines') || name.includes('sri lanka')) {
        baseWindSpeed = 4.0;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseWindSpeed = 5.0;
      }
    }
    
    const baseUV = Math.max(1, 8 - Math.abs(latitude) * 0.1);
    
    let baseVisibility = 10;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama') || name.includes('namib') || name.includes('mohave')) {
        baseVisibility = 15;
      } else if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london') || name.includes('mumbai') || name.includes('são paulo')) {
        baseVisibility = 8;
      } else if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo') || name.includes('daintree') || name.includes('atlantic')) {
        baseVisibility = 12;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseVisibility = 20;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseVisibility = 14;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseVisibility = 16;
      }
    }
    
    let baseCloudCover = 40;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama') || name.includes('namib') || name.includes('mohave')) {
        baseCloudCover = 15;
      } else if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo') || name.includes('daintree') || name.includes('atlantic')) {
        baseCloudCover = 70;
      } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland') || name.includes('northern canada')) {
        baseCloudCover = 60;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseCloudCover = 50;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseCloudCover = 45;
      } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines') || name.includes('sri lanka')) {
        baseCloudCover = 55;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseCloudCover = 35;
      }
    }
    
    const baseSolarRadiation = Math.max(100, 800 - Math.abs(latitude) * 5 - baseCloudCover * 3);
    
    let baseAQI = 50;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london') || name.includes('mumbai') || name.includes('são paulo')) {
        baseAQI = 80;
      } else if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo') || name.includes('daintree') || name.includes('atlantic')) {
        baseAQI = 25;
      } else if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama') || name.includes('namib') || name.includes('mohave')) {
        baseAQI = 60;
      } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland') || name.includes('northern canada')) {
        baseAQI = 20;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseAQI = 30;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseAQI = 35;
      } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines') || name.includes('sri lanka')) {
        baseAQI = 40;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseAQI = 45;
      }
    }
    
    let baseCO2 = 410;
    if (locationName) {
      const name = locationName.toLowerCase();
      if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london') || name.includes('mumbai') || name.includes('são paulo')) {
        baseCO2 = 450;
      } else if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo') || name.includes('daintree') || name.includes('atlantic')) {
        baseCO2 = 380;
      } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland') || name.includes('northern canada')) {
        baseCO2 = 390;
      } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky') || name.includes('andes') || name.includes('urals') || name.includes('appalachian') || name.includes('tibetan') || name.includes('ethiopian')) {
        baseCO2 = 400;
      } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii') || name.includes('galapagos') || name.includes('mediterranean') || name.includes('river') || name.includes('delta')) {
        baseCO2 = 405;
      } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines') || name.includes('sri lanka')) {
        baseCO2 = 395;
      } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies') || name.includes('steppes') || name.includes('savanna')) {
        baseCO2 = 415;
      }
    }
    
    return {
      temperature: baseTemp,
      humidity: baseHumidity,
      pressure: basePressure,
      wind_speed: baseWindSpeed,
      precipitation: Math.random() * 2,
      uv_index: baseUV,
      visibility: baseVisibility,
      cloud_cover: baseCloudCover,
      solar_radiation: baseSolarRadiation,
      air_quality_index: baseAQI,
      co2_concentration: baseCO2
    };
  }

  private addVariation(value: number, variationPercent: number): number {
    const variation = value * variationPercent;
    const randomVariation = (Math.random() - 0.5) * 2 * variation;
    return Math.round((value + randomVariation) * 10) / 10;
  }

  private calculateSolarRadiation(latitude: number, cloudCover: number): number {
    const baseRadiation = 800 - Math.abs(latitude) * 5;
    const cloudReduction = cloudCover * 3;
    return Math.max(100, baseRadiation - cloudReduction);
  }

  private calculateAirQualityIndex(pressure: number, humidity: number, latitude: number): number {
    const baseAQI = 50;
    const pressureFactor = Math.max(0, (1013.25 - pressure) / 10);
    const humidityFactor = Math.max(0, (humidity - 60) / 10);
    const latitudeFactor = Math.abs(latitude) * 0.1;
    return Math.round(baseAQI + pressureFactor + humidityFactor + latitudeFactor);
  }

  private estimateCO2Concentration(temperature: number, latitude: number): number {
    const baseCO2 = 410;
    const tempFactor = (temperature - 15) * 2;
    const latitudeFactor = Math.abs(latitude) * 0.1;
    return Math.round(baseCO2 + tempFactor + latitudeFactor);
  }
}

export const environmentalDataService = new EnvironmentalDataService();