import { EnvironmentalData } from './environmentalDataService';

export interface NarrativeResponse {
  narrative: string;
  mood: string;
  insights: string[];
}

class NarrativeService {
  private generateNarrativeFromData(data: EnvironmentalData, locationName: string): NarrativeResponse {
    const insights = this.generateInsights(data);
    const mood = this.determineMood(data);
    const narrative = this.createNarrative(data, locationName, mood, insights);
    
    return {
      narrative,
      mood,
      insights
    };
  }

  private determineMood(data: EnvironmentalData): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const wind = data.wind_speed;
    const cloud = data.cloud_cover;

    // Determine mood based on environmental conditions
    if (aqi > 70) return 'concerned';
    if (temp < -10) return 'harsh';
    if (temp > 35) return 'intense';
    if (humidity > 80) return 'humid';
    if (wind > 8) return 'dynamic';
    if (cloud < 20) return 'clear';
    if (cloud > 70) return 'overcast';
    if (aqi < 30) return 'pristine';
    if (temp >= 20 && temp <= 25 && humidity >= 40 && humidity <= 60) return 'pleasant';
    
    return 'balanced';
  }

  private generateInsights(data: EnvironmentalData): string[] {
    const insights: string[] = [];
    
    // Temperature insights
    if (data.temperature < -20) {
      insights.push('Extreme cold conditions create unique survival challenges');
    } else if (data.temperature > 40) {
      insights.push('Intense heat requires special adaptations for life');
    } else if (data.temperature >= 20 && data.temperature <= 25) {
      insights.push('Optimal temperature range supports diverse ecosystems');
    }

    // Humidity insights
    if (data.humidity > 80) {
      insights.push('High humidity creates lush, tropical environments');
    } else if (data.humidity < 30) {
      insights.push('Low humidity creates arid conditions requiring water conservation');
    }

    // Air quality insights
    if (data.air_quality_index < 30) {
      insights.push('Exceptional air quality indicates pristine environmental conditions');
    } else if (data.air_quality_index > 70) {
      insights.push('Elevated air pollution levels require attention and mitigation');
    }

    // Wind insights
    if (data.wind_speed > 6) {
      insights.push('Strong winds create dynamic atmospheric conditions');
    } else if (data.wind_speed < 2) {
      insights.push('Calm conditions allow for stable atmospheric patterns');
    }

    // Solar radiation insights
    if (data.solar_radiation > 600) {
      insights.push('High solar radiation provides abundant energy for photosynthesis');
    } else if (data.solar_radiation < 200) {
      insights.push('Limited solar radiation creates challenging conditions for plant life');
    }

    // CO2 insights
    if (data.co2_concentration < 400) {
      insights.push('Lower CO2 levels indicate natural carbon sequestration');
    } else if (data.co2_concentration > 450) {
      insights.push('Elevated CO2 levels reflect human activity and industrial processes');
    }

    return insights;
  }

  private createNarrative(data: EnvironmentalData, locationName: string, mood: string, insights: string[]): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const aqi = data.air_quality_index;
    const solar = data.solar_radiation;
    const cloud = data.cloud_cover;
    const co2 = data.co2_concentration;
    const uv = data.uv_index;
    const visibility = data.visibility;

    // Create a structured, concise narrative
    const locationDescriptor = this.getLocationDescriptor(locationName);
    
    // Opening statement
    let narrative = `Welcome to ${locationName}, where ${locationDescriptor}. `;

    // Primary environmental condition (most significant)
    const primaryCondition = this.getPrimaryCondition(data, locationName);
    narrative += primaryCondition;

    // Secondary conditions (2-3 most relevant)
    const secondaryConditions = this.getSecondaryConditions(data, locationName);
    narrative += secondaryConditions;

    // Impact statement
    const impactStatement = this.getImpactStatement(data, locationName, mood);
    narrative += impactStatement;

    return narrative;
  }

  private getPrimaryCondition(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const aqi = data.air_quality_index;
    const humidity = data.humidity;
    const wind = data.wind_speed;

    // Determine the most significant condition
    if (aqi > 70) {
      return `The air quality index of ${aqi.toFixed(0)} indicates concerning atmospheric conditions that require attention. `;
    } else if (temp < -20) {
      return `Extreme cold at ${temp.toFixed(1)}°C creates a harsh environment where only the most adapted species survive. `;
    } else if (temp > 35) {
      return `Intense heat of ${temp.toFixed(1)}°C creates challenging conditions for life. `;
    } else if (humidity > 80) {
      return `High humidity of ${humidity.toFixed(1)}% creates a lush, tropical atmosphere. `;
    } else if (humidity < 30) {
      return `Low humidity of ${humidity.toFixed(1)}% creates arid, dry conditions. `;
    } else if (wind > 6) {
      return `Strong winds of ${wind.toFixed(1)} m/s create dynamic atmospheric patterns. `;
    } else {
      return `The temperature of ${temp.toFixed(1)}°C creates a ${temp > 25 ? 'warm' : temp < 15 ? 'cool' : 'mild'} environment. `;
    }
  }

  private getSecondaryConditions(data: EnvironmentalData, locationName: string): string {
    const conditions = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const solar = data.solar_radiation;
    const cloud = data.cloud_cover;
    const visibility = data.visibility;

    // Add 2-3 most relevant secondary conditions
    if (humidity > 60 && humidity <= 80) {
      conditions.push(`humidity at ${humidity.toFixed(1)}%`);
    } else if (humidity < 30) {
      conditions.push(`dry air with ${humidity.toFixed(1)}% humidity`);
    }

    if (wind > 2 && wind <= 6) {
      conditions.push(`moderate winds of ${wind.toFixed(1)} m/s`);
    } else if (wind < 2) {
      conditions.push(`calm conditions with ${wind.toFixed(1)} m/s winds`);
    }

    if (solar > 600) {
      conditions.push(`abundant solar energy at ${solar.toFixed(0)} W/m²`);
    } else if (solar < 200) {
      conditions.push(`limited solar radiation of ${solar.toFixed(0)} W/m²`);
    }

    if (cloud > 70) {
      conditions.push(`overcast skies with ${cloud.toFixed(1)}% cloud cover`);
    } else if (cloud < 20) {
      conditions.push(`clear skies with only ${cloud.toFixed(1)}% cloud cover`);
    }

    if (visibility > 15) {
      conditions.push(`exceptional visibility of ${visibility.toFixed(1)} km`);
    } else if (visibility < 8) {
      conditions.push(`limited visibility of ${visibility.toFixed(1)} km`);
    }

    // Return top 2-3 conditions
    const selectedConditions = conditions.slice(0, 2);
    if (selectedConditions.length > 0) {
      return `Additional conditions include ${selectedConditions.join(' and ')}. `;
    }
    return '';
  }

  private getImpactStatement(data: EnvironmentalData, locationName: string, mood: string): string {
    const aqi = data.air_quality_index;
    const temp = data.temperature;
    const co2 = data.co2_concentration;
    const solar = data.solar_radiation;

    if (mood === 'pristine') {
      return `These pristine conditions support diverse ecosystems and represent some of Earth's most unspoiled environments.`;
    } else if (mood === 'concerned') {
      return `These conditions highlight the need for environmental protection and sustainable practices.`;
    } else if (mood === 'harsh') {
      return `These extreme conditions demonstrate nature's resilience and the remarkable adaptations of life.`;
    } else if (mood === 'intense') {
      return `These intense conditions create unique challenges and opportunities for specialized life forms.`;
    } else if (mood === 'pleasant') {
      return `These optimal conditions create ideal habitats for diverse plant and animal life.`;
    } else if (mood === 'dynamic') {
      return `These dynamic conditions create ever-changing environments that shape the landscape.`;
    } else {
      return `These conditions reflect the natural balance and diversity of Earth's ecosystems.`;
    }
  }

  private getLocationDescriptor(locationName: string): string {
    const name = locationName.toLowerCase();
    
    if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo')) {
      return 'lush biodiversity and ancient ecosystems';
    } else if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama')) {
      return 'harsh beauty and extreme adaptation';
    } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky')) {
      return 'majestic peaks and alpine ecosystems';
    } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii')) {
      return 'oceanic harmony and marine diversity';
    } else if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london')) {
      return 'human innovation and urban ecosystems';
    } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland')) {
      return 'frozen wilderness and polar resilience';
    } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines')) {
      return 'isolated ecosystems and unique evolution';
    } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies')) {
      return 'vast grasslands and migratory patterns';
    } else {
      return 'natural wonder and environmental diversity';
    }
  }

  async generateNarrative(data: EnvironmentalData, locationName: string): Promise<NarrativeResponse> {
    console.log(`📝 Generating AI narrative for ${locationName} with environmental data:`, data);
    
    try {
      // For now, we'll use the local narrative generation
      // In the future, this could call an external AI service
      const narrative = this.generateNarrativeFromData(data, locationName);
      
      console.log(`✅ Generated narrative with mood: ${narrative.mood}`);
      return narrative;
    } catch (error) {
      console.error('Error generating narrative:', error);
      
      // Fallback narrative
      return {
        narrative: `Welcome to ${locationName}. This region offers unique environmental characteristics with a temperature of ${data.temperature.toFixed(1)}°C, humidity of ${data.humidity.toFixed(1)}%, and air quality index of ${data.air_quality_index.toFixed(0)}. The environment here tells a story of natural diversity and climatic adaptation.`,
        mood: 'neutral',
        insights: ['Environmental data provides insights into local conditions', 'Climate patterns shape the local ecosystem']
      };
    }
  }
}

export const narrativeService = new NarrativeService();
