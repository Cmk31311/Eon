import type { EnvironmentalData } from './environmentalDataService';

export interface MusicParameters {
  mood: string;
  genre: string;
  tempo: string;
  intensity: string;
  atmosphere: string;
  tags: string[];
  duration: number;
  prompt: string;
}

/**
 * Maps environmental data to musical parameters for AI music generation
 */
export class MusicGenerationService {
  /**
   * Analyzes environmental data and generates music parameters
   */
  static generateMusicParameters(data: EnvironmentalData): MusicParameters {
    const mood = this.determineMood(data);
    const genre = this.determineGenre(data);
    const tempo = this.determineTempo(data);
    const intensity = this.determineIntensity(data);
    const atmosphere = this.determineAtmosphere(data);
    const tags = this.generateTags(data);
    const prompt = this.generatePrompt(data, mood, genre, tempo, atmosphere);

    return {
      mood,
      genre,
      tempo,
      intensity,
      atmosphere,
      tags,
      duration: 60, // 60 seconds default
      prompt
    };
  }

  /**
   * Determines mood based on environmental conditions
   */
  private static determineMood(data: EnvironmentalData): string {
    const { temperature, air_quality_index, last_updated, wind_speed } = data;

    // Check air quality impact
    if (air_quality_index && air_quality_index > 150) {
      return 'tense';
    }

    // Time of day influence
    if (last_updated) {
      const hour = new Date(last_updated).getHours();
      if (hour >= 5 && hour < 7) return 'hopeful'; // Dawn
      if (hour >= 7 && hour < 12) return 'energetic'; // Morning
      if (hour >= 12 && hour < 17) return 'bright'; // Afternoon
      if (hour >= 17 && hour < 20) return 'calm'; // Evening
      if (hour >= 20 || hour < 5) return 'mysterious'; // Night
    }

    // Temperature influence
    if (temperature < 0) return 'stark';
    if (temperature > 35) return 'intense';
    if (temperature >= 15 && temperature <= 25) return 'peaceful';

    // Wind influence
    if (wind_speed > 20) return 'dramatic';

    return 'ambient';
  }

  /**
   * Determines musical genre based on biome and region
   */
  private static determineGenre(data: EnvironmentalData): string {
    const location = (data.location_name || '').toLowerCase();

    // Biome-specific genres
    if (location.includes('rainforest') || location.includes('jungle')) {
      return 'tropical ambient';
    }
    if (location.includes('desert') || location.includes('sahara') || location.includes('gobi')) {
      return 'minimal ambient';
    }
    if (location.includes('mountain') || location.includes('himalaya') || location.includes('alps')) {
      return 'epic ambient';
    }
    if (location.includes('coast') || location.includes('ocean') || location.includes('reef')) {
      return 'aquatic ambient';
    }
    if (location.includes('polar') || location.includes('arctic') || location.includes('antarctica')) {
      return 'glacial ambient';
    }
    if (location.includes('urban') || location.includes('city') || location.includes('tokyo') || location.includes('london')) {
      return 'electronic ambient';
    }
    if (location.includes('island')) {
      return 'island ambient';
    }
    if (location.includes('wetland') || location.includes('swamp') || location.includes('everglades')) {
      return 'organic ambient';
    }
    if (location.includes('volcanic') || location.includes('volcano')) {
      return 'dark ambient';
    }
    if (location.includes('tundra')) {
      return 'sparse ambient';
    }
    if (location.includes('plain') || location.includes('prairie') || location.includes('serengeti')) {
      return 'open ambient';
    }
    if (location.includes('forest')) {
      return 'woodland ambient';
    }

    return 'atmospheric ambient';
  }

  /**
   * Determines tempo based on temperature and wind
   */
  private static determineTempo(data: EnvironmentalData): string {
    const { temperature, wind_speed } = data;

    // Base tempo on temperature
    let tempoScore = 50; // Neutral

    if (temperature < -10) tempoScore = 30; // Very slow
    else if (temperature < 10) tempoScore = 40; // Slow
    else if (temperature >= 10 && temperature <= 25) tempoScore = 50; // Medium
    else if (temperature > 25 && temperature <= 35) tempoScore = 60; // Moderate
    else if (temperature > 35) tempoScore = 70; // Fast

    // Wind speed modifier
    if (wind_speed > 15) tempoScore += 10;
    if (wind_speed < 5) tempoScore -= 10;

    // Map to descriptive tempo
    if (tempoScore < 35) return 'very slow';
    if (tempoScore < 45) return 'slow';
    if (tempoScore < 55) return 'moderate';
    if (tempoScore < 65) return 'medium-fast';
    return 'energetic';
  }

  /**
   * Determines intensity based on wind, precipitation, and extremes
   */
  private static determineIntensity(data: EnvironmentalData): string {
    const { wind_speed, precipitation, temperature, air_quality_index } = data;

    let intensityScore = 0;

    // Wind impact
    if (wind_speed > 25) intensityScore += 3;
    else if (wind_speed > 15) intensityScore += 2;
    else if (wind_speed > 8) intensityScore += 1;

    // Precipitation impact
    if (precipitation > 10) intensityScore += 3;
    else if (precipitation > 5) intensityScore += 2;
    else if (precipitation > 1) intensityScore += 1;

    // Temperature extremes
    if (temperature < -20 || temperature > 40) intensityScore += 2;
    else if (temperature < -10 || temperature > 35) intensityScore += 1;

    // Air quality impact
    if (air_quality_index && air_quality_index > 150) intensityScore += 2;
    else if (air_quality_index && air_quality_index > 100) intensityScore += 1;

    // Map to intensity levels
    if (intensityScore === 0) return 'gentle';
    if (intensityScore <= 2) return 'calm';
    if (intensityScore <= 4) return 'moderate';
    if (intensityScore <= 6) return 'strong';
    return 'intense';
  }

  /**
   * Determines atmospheric quality based on humidity, clouds, and conditions
   */
  private static determineAtmosphere(data: EnvironmentalData): string {
    const { humidity, cloud_cover, visibility_from_space, precipitation } = data;

    // Very wet and obscured
    if (humidity > 80 && cloud_cover > 75) return 'dense and misty';

    // Rainy
    if (precipitation > 5) return 'rain-soaked';

    // High humidity
    if (humidity > 70) return 'humid and thick';

    // Low visibility
    if (visibility_from_space && visibility_from_space < 3) return 'mysterious and foggy';

    // Clear and dry
    if (humidity < 30 && cloud_cover < 25) return 'crisp and clear';

    // Cloudy
    if (cloud_cover > 75) return 'overcast and somber';

    // Partly cloudy
    if (cloud_cover > 40) return 'layered and textured';

    // Default
    return 'spacious and open';
  }

  /**
   * Generates descriptive tags for music generation
   */
  private static generateTags(data: EnvironmentalData): string[] {
    const tags: string[] = ['ambient', 'environmental', 'generative'];
    const location = (data.location_name || '').toLowerCase();

    // Biome tags
    if (location.includes('rainforest') || location.includes('jungle')) {
      tags.push('tropical', 'lush', 'organic', 'nature');
    }
    if (location.includes('desert')) {
      tags.push('sparse', 'minimal', 'dry', 'expansive');
    }
    if (location.includes('mountain')) {
      tags.push('epic', 'majestic', 'vast', 'ethereal');
    }
    if (location.includes('coast') || location.includes('ocean')) {
      tags.push('aquatic', 'flowing', 'waves', 'serene');
    }
    if (location.includes('polar') || location.includes('arctic')) {
      tags.push('glacial', 'frozen', 'pristine', 'crystalline');
    }
    if (location.includes('urban') || location.includes('city')) {
      tags.push('electronic', 'rhythmic', 'modern', 'pulsing');
    }
    if (location.includes('forest')) {
      tags.push('woodland', 'peaceful', 'natural', 'breathing');
    }
    if (location.includes('volcanic')) {
      tags.push('dark', 'powerful', 'primal', 'intense');
    }

    // Weather condition tags
    if (data.precipitation > 5) tags.push('rain', 'wet');
    if (data.wind_speed > 15) tags.push('windy', 'dynamic');
    if (data.temperature < 0) tags.push('cold', 'icy');
    if (data.temperature > 30) tags.push('warm', 'heat');
    if (data.cloud_cover > 70) tags.push('cloudy', 'overcast');
    if (data.humidity > 70) tags.push('humid', 'dense');

    // Time of day tags
    if (data.last_updated) {
      const hour = new Date(data.last_updated).getHours();
      if (hour >= 5 && hour < 7) tags.push('dawn', 'morning');
      if (hour >= 20 || hour < 5) tags.push('night', 'nocturnal');
    }

    return tags;
  }

  /**
   * Generates a detailed prompt for AI music generation
   */
  private static generatePrompt(
    data: EnvironmentalData,
    mood: string,
    genre: string,
    tempo: string,
    atmosphere: string
  ): string {
    const { location_name, temperature, humidity, wind_speed, precipitation, air_quality_index } = data;

    // Build descriptive prompt
    let prompt = `Create an ambient soundscape for ${location_name || 'this environment'}. `;

    // Genre and mood
    prompt += `The music should be ${genre} with a ${mood} mood. `;

    // Tempo and intensity
    prompt += `Tempo should be ${tempo}. `;

    // Atmospheric qualities
    prompt += `The atmosphere is ${atmosphere}. `;

    // Environmental details
    const conditions: string[] = [];

    if (temperature < 0) conditions.push('freezing cold');
    else if (temperature < 15) conditions.push('cool');
    else if (temperature > 30) conditions.push('hot');
    else conditions.push('comfortable');

    if (wind_speed > 20) conditions.push('very windy');
    else if (wind_speed > 10) conditions.push('breezy');
    else conditions.push('still');

    if (precipitation > 5) conditions.push('rainy');
    else if (precipitation > 0) conditions.push('drizzling');

    if (humidity > 70) conditions.push('humid');
    else if (humidity < 30) conditions.push('dry');

    if (air_quality_index && air_quality_index > 100) conditions.push('polluted air');

    prompt += `Current conditions: ${conditions.join(', ')}. `;

    // Musical direction
    prompt += `Use natural soundscapes, subtle textures, and evolving harmonies. `;
    prompt += `The music should evoke the feeling of being present in this environment, `;
    prompt += `capturing its unique character and current atmospheric conditions.`;

    return prompt;
  }

  /**
   * Generates a shorter tag-based description for API calls
   */
  static generateShortDescription(params: MusicParameters): string {
    return `${params.genre}, ${params.mood}, ${params.tempo} tempo, ${params.intensity} intensity, ${params.atmosphere}`;
  }
}
