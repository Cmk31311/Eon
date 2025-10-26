import { EnvironmentalData } from './environmentalDataService';

export interface NarrativeResponse {
  narrative: string;
  mood: string;
  insights: string[];
}

class NarrativeService {
  private generationCounter = 0;
  
  private narrativeTemplates: Record<string, string[]> = {
    opening: [
      "As dawn breaks across the landscape,",
      "Under the midday sun,",
      "As evening approaches,",
      "Under the starlit sky,",
      "In this moment of atmospheric wonder,",
      "Within this unique environmental tapestry,",
      "Amidst the ever-changing conditions,",
      "In this corner of our planet,",
      "Within this dynamic ecosystem,",
      "In this remarkable location,",
      "Beneath the vast canopy of sky,",
      "In the heart of this ecosystem,",
      "Where nature's forces converge,",
      "In this living laboratory of Earth,",
      "Amidst the symphony of environmental factors,",
      "In this microcosm of our planet,",
      "Where atmospheric conditions tell their story,",
      "In this realm of natural phenomena,",
      "Within this environmental sanctuary,",
      "In this corner of Earth's diversity,"
    ],
    temperature: [
      "The temperature of {temp}°C creates {condition}",
      "At {temp}°C, the thermal environment {effect}",
      "With temperatures reaching {temp}°C, {impact}",
      "The {temp}°C reading reveals {insight}",
      "Thermal conditions of {temp}°C {result}"
    ],
    humidity: [
      "Humidity levels of {humidity}% {effect}",
      "The {humidity}% humidity {impact}",
      "With {humidity}% atmospheric moisture, {result}",
      "Humidity at {humidity}% {condition}",
      "The moisture content of {humidity}% {outcome}"
    ],
    airQuality: [
      "Air quality index of {aqi} indicates {condition}",
      "The AQI reading of {aqi} reveals {insight}",
      "With an air quality index of {aqi}, {impact}",
      "Air quality at {aqi} {effect}",
      "The {aqi} AQI measurement {result}"
    ],
    wind: [
      "Wind speeds of {wind} m/s {effect}",
      "The {wind} m/s winds {impact}",
      "With winds reaching {wind} m/s, {result}",
      "Wind conditions of {wind} m/s {condition}",
      "The {wind} m/s air movement {outcome}"
    ],
    pressure: [
      "Atmospheric pressure of {pressure} hPa {effect}",
      "The {pressure} hPa pressure reading {impact}",
      "With pressure at {pressure} hPa, {result}",
      "Barometric pressure of {pressure} hPa {condition}",
      "The {pressure} hPa measurement {outcome}"
    ],
    closing: [
      "These conditions tell a story of {theme}.",
      "This environment reflects the {aspect} of our planet.",
      "Such conditions demonstrate the {quality} of Earth's systems.",
      "These measurements reveal the {characteristic} of this region.",
      "This data illustrates the {nature} of our world's diversity."
    ]
  };

  private generateNarrativeFromData(data: EnvironmentalData, locationName: string): NarrativeResponse {
    this.generationCounter++;
    const timestamp = Date.now();
    const locationHash = this.createLocationHash(locationName, data);
    // Add extra randomness with Math.random() and counter to ensure uniqueness
    const extraRandomness = Math.random() * 1000000;
    const randomSeed = this.createRandomSeed(timestamp + extraRandomness + this.generationCounter, locationHash);
    
    console.log(`🎲 Generating unique narrative #${this.generationCounter} for ${locationName} with seed: ${randomSeed} (timestamp: ${timestamp})`);
    console.log(`🕐 Current time: ${new Date().toLocaleTimeString()} (hour: ${new Date().getHours()})`);
    
    const insights = this.generateDynamicInsights(data, randomSeed);
    const mood = this.determineDynamicMood(data, randomSeed);
    const narrative = this.createDynamicNarrative(data, locationName, mood, insights, randomSeed);
    
    console.log(`📖 Generated opening: "${narrative.split(' Welcome to')[0]},"`);
    
    return {
      narrative,
      mood,
      insights
    };
  }

  private createLocationHash(locationName: string, data: EnvironmentalData): number {
    const str = `${locationName}-${data.temperature}-${data.humidity}-${data.air_quality_index}-${data.wind_speed}-${data.pressure}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private createRandomSeed(timestamp: number, locationHash: number): number {
    return (timestamp + locationHash) % 1000000;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  private determineDynamicMood(data: EnvironmentalData, seed: number): string {
    const moods = [
      'pristine', 'dynamic', 'harsh', 'intense', 'humid', 'clear', 'overcast', 
      'balanced', 'pleasant', 'concerned', 'mysterious', 'dramatic', 'serene',
      'volatile', 'stable', 'energetic', 'calm', 'turbulent', 'harmonious'
    ];
    
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const wind = data.wind_speed;
    const pressure = data.pressure;
    
    // Create a weighted score for each mood based on environmental data
    const moodScores: Record<string, number> = {};
    
    // Temperature-based moods
    if (temp < -20) moodScores['harsh'] = 0.9;
    else if (temp > 35) moodScores['intense'] = 0.8;
    else if (temp >= 20 && temp <= 25) moodScores['pleasant'] = 0.7;
    
    // Humidity-based moods
    if (humidity > 85) moodScores['humid'] = 0.8;
    else if (humidity < 25) moodScores['harsh'] = (moodScores['harsh'] || 0) + 0.6;
    
    // Air quality moods
    if (aqi < 25) moodScores['pristine'] = 0.9;
    else if (aqi > 80) moodScores['concerned'] = 0.8;
    
    // Wind-based moods
    if (wind > 8) moodScores['dynamic'] = 0.8;
    else if (wind < 2) moodScores['calm'] = 0.7;
    
    // Pressure-based moods
    if (pressure < 1000) moodScores['volatile'] = 0.6;
    else if (pressure > 1020) moodScores['stable'] = 0.6;
    
    // Add randomness based on seed
    const randomFactor = this.seededRandom(seed);
    const randomMood = moods[Math.floor(randomFactor * moods.length)];
    moodScores[randomMood] = (moodScores[randomMood] || 0) + 0.3;
    
    // Find the mood with highest score
    let bestMood = 'balanced';
    let bestScore = 0;
    
    for (const [mood, score] of Object.entries(moodScores)) {
      if (score > bestScore) {
        bestScore = score;
        bestMood = mood;
      }
    }
    
    return bestMood;
  }

  private generateDynamicInsights(data: EnvironmentalData, seed: number): string[] {
    const insights: string[] = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const wind = data.wind_speed;
    const pressure = data.pressure;
    const solar = data.solar_radiation;
    const co2 = data.co2_concentration;
    
    // Temperature insights with variations
    const tempInsights = [
      `These extreme cold conditions at ${temp.toFixed(1)}°C create unique challenges for local ecosystems, with specialized adaptations required for survival.`,
      `High temperatures of ${temp.toFixed(1)}°C create thermal stress that influences species behavior and distribution patterns.`,
      `The temperature of ${temp.toFixed(1)}°C creates optimal conditions for diverse biological activity.`,
      `Thermal conditions of ${temp.toFixed(1)}°C drive complex ecological interactions and evolutionary pressures.`,
      `At ${temp.toFixed(1)}°C, the thermal environment shapes the very fabric of local biodiversity.`
    ];
    
    // Humidity insights with variations
    const humidityInsights = [
      `The high humidity of ${humidity.toFixed(1)}% supports rapid biological processes and creates ideal conditions for moisture-dependent species.`,
      `Low humidity of ${humidity.toFixed(1)}% creates water-limited conditions that favor drought-resistant adaptations.`,
      `Humidity levels of ${humidity.toFixed(1)}% create a delicate balance between evaporation and condensation processes.`,
      `The moisture content of ${humidity.toFixed(1)}% influences cloud formation and precipitation patterns.`,
      `With ${humidity.toFixed(1)}% humidity, the atmosphere reaches a critical threshold for biological activity.`
    ];
    
    // Air quality insights with variations
    const aqiInsights = [
      `Exceptional air quality with an AQI of ${aqi.toFixed(0)} indicates pristine atmospheric conditions with minimal anthropogenic impact.`,
      `Elevated air pollution with an AQI of ${aqi.toFixed(0)} reflects significant human activity and industrial influence on local air quality.`,
      `The air quality index of ${aqi.toFixed(0)} reveals the complex interplay between natural processes and human activities.`,
      `Air quality measurements of ${aqi.toFixed(0)} demonstrate the delicate balance of atmospheric composition.`,
      `With an AQI of ${aqi.toFixed(0)}, the air quality reflects both local and regional environmental influences.`
    ];
    
    // Wind insights with variations
    const windInsights = [
      `Strong winds of ${wind.toFixed(1)} m/s create dynamic atmospheric conditions that influence heat exchange and species dispersal.`,
      `Calm conditions with ${wind.toFixed(1)} m/s winds allow for stable atmospheric patterns and reduced mixing.`,
      `Wind speeds of ${wind.toFixed(1)} m/s create microclimates that support diverse ecological niches.`,
      `The ${wind.toFixed(1)} m/s air movement patterns influence local weather systems and climate variability.`,
      `With winds of ${wind.toFixed(1)} m/s, the atmosphere exhibits unique circulation patterns.`
    ];
    
    // Select insights based on data and randomness
    const random1 = this.seededRandom(seed);
    const random2 = this.seededRandom(seed + 1000);
    const random3 = this.seededRandom(seed + 2000);
    
    if (temp < -15 || temp > 30) {
      insights.push(tempInsights[Math.floor(random1 * tempInsights.length)]);
    }
    
    if (humidity > 80 || humidity < 30) {
      insights.push(humidityInsights[Math.floor(random2 * humidityInsights.length)]);
    }
    
    if (aqi < 30 || aqi > 70) {
      insights.push(aqiInsights[Math.floor(random3 * aqiInsights.length)]);
    }
    
    if (wind > 6) {
      insights.push(windInsights[Math.floor(this.seededRandom(seed + 3000) * windInsights.length)]);
    }
    
    // Add CO2 and solar insights if significant
    if (co2 > 450) {
      insights.push(`Elevated CO2 concentrations of ${co2.toFixed(0)} ppm indicate significant anthropogenic influence on atmospheric composition.`);
    } else if (co2 < 400) {
      insights.push(`Lower CO2 levels of ${co2.toFixed(0)} ppm suggest effective carbon sequestration by local vegetation.`);
    }
    
    if (solar > 700) {
      insights.push(`High solar irradiance of ${solar.toFixed(0)} W/m² provides abundant energy for photosynthesis and drives primary productivity.`);
    }
    
    return insights;
  }

  private createDynamicNarrative(data: EnvironmentalData, locationName: string, mood: string, insights: string[], seed: number): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const wind = data.wind_speed;
    const pressure = data.pressure;
    const solar = data.solar_radiation;
    const co2 = data.co2_concentration;
    const uv = data.uv_index;
    const visibility = data.visibility_from_space;
    const cloud = data.cloud_cover;

    // Select opening with more randomness - 70% random, 30% time-based
    const timeBasedOpening = this.getTimeBasedOpening();
    const randomOpening = this.narrativeTemplates.opening[Math.floor(this.seededRandom(seed) * this.narrativeTemplates.opening.length)];
    const opening = this.seededRandom(seed + 5000) > 0.3 ? randomOpening : timeBasedOpening;

    // Create location descriptor with variations
    const locationDescriptor = this.getDynamicLocationDescriptor(locationName, seed);
    
    let narrative = `${opening} Welcome to ${locationName}, where ${locationDescriptor}. `;

    // Generate primary condition with template variation
    const primaryCondition = this.generatePrimaryCondition(data, seed);
    narrative += primaryCondition;

    // Add secondary conditions with randomness
    const secondaryConditions = this.generateSecondaryConditions(data, seed);
    if (secondaryConditions) {
      narrative += secondaryConditions;
    }

    // Add scientific insights with variation
    if (insights.length > 0) {
      const selectedInsight = insights[Math.floor(this.seededRandom(seed + 10000) * insights.length)];
      narrative += selectedInsight + ' ';
    }

    // Add environmental impact based on mood and data
    const environmentalImpact = this.generateEnvironmentalImpact(data, mood, seed);
    narrative += environmentalImpact;

    // Add climate context with variation
    const climateContext = this.generateClimateContext(data, seed);
    narrative += climateContext;

    return narrative;
  }

  private getTimeBasedOpening(): string {
    const hour = new Date().getHours();
    const timeBasedOpenings = {
      dawn: ["As dawn breaks across the landscape,", "With the first light of morning,", "As the sun rises over the horizon,"],
      morning: ["Under the morning sun,", "In the bright morning light,", "As morning unfolds,"],
      midday: ["Under the midday sun,", "In the bright afternoon light,", "As the sun reaches its peak,"],
      afternoon: ["In the warm afternoon,", "As afternoon progresses,", "Under the afternoon sky,"],
      evening: ["As evening approaches,", "In the golden hour,", "As the day begins to fade,"],
      night: ["Under the starlit sky,", "In the quiet of night,", "Beneath the moon's glow,", "In the darkness of night,"]
    };
    
    if (hour >= 5 && hour < 8) return timeBasedOpenings.dawn[Math.floor(Math.random() * timeBasedOpenings.dawn.length)];
    if (hour >= 8 && hour < 12) return timeBasedOpenings.morning[Math.floor(Math.random() * timeBasedOpenings.morning.length)];
    if (hour >= 12 && hour < 14) return timeBasedOpenings.midday[Math.floor(Math.random() * timeBasedOpenings.midday.length)];
    if (hour >= 14 && hour < 17) return timeBasedOpenings.afternoon[Math.floor(Math.random() * timeBasedOpenings.afternoon.length)];
    if (hour >= 17 && hour < 20) return timeBasedOpenings.evening[Math.floor(Math.random() * timeBasedOpenings.evening.length)];
    return timeBasedOpenings.night[Math.floor(Math.random() * timeBasedOpenings.night.length)];
  }

  private getDynamicLocationDescriptor(locationName: string, seed: number): string {
    const descriptors = [
      'lush biodiversity and ancient ecosystems',
      'harsh beauty and extreme adaptation',
      'majestic peaks and alpine ecosystems',
      'oceanic harmony and marine diversity',
      'human innovation and urban ecosystems',
      'frozen wilderness and polar resilience',
      'isolated ecosystems and unique evolution',
      'vast grasslands and migratory patterns',
      'natural wonder and environmental diversity',
      'dynamic landscapes and climatic extremes',
      'pristine environments and ecological balance',
      'dramatic terrain and weather patterns'
    ];

    const name = locationName.toLowerCase();
    
    // Location-specific descriptors
    if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo') || name.includes('borneo')) {
      return descriptors[0];
    } else if (name.includes('desert') || name.includes('sahara') || name.includes('gobi') || name.includes('atacama')) {
      return descriptors[1];
    } else if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas') || name.includes('rocky')) {
      return descriptors[2];
    } else if (name.includes('coastal') || name.includes('reef') || name.includes('maldives') || name.includes('hawaii')) {
      return descriptors[3];
    } else if (name.includes('urban') || name.includes('tokyo') || name.includes('new york') || name.includes('london')) {
      return descriptors[4];
    } else if (name.includes('antarctica') || name.includes('alaska') || name.includes('siberia') || name.includes('greenland')) {
      return descriptors[5];
    } else if (name.includes('island') || name.includes('iceland') || name.includes('madagascar') || name.includes('philippines')) {
      return descriptors[6];
    } else if (name.includes('plains') || name.includes('serengeti') || name.includes('pampas') || name.includes('prairies')) {
      return descriptors[7];
    } else {
      // Random descriptor for unknown locations
      return descriptors[Math.floor(this.seededRandom(seed) * descriptors.length)];
    }
  }

  private generatePrimaryCondition(data: EnvironmentalData, seed: number): string {
    const temp = data.temperature;
    const aqi = data.air_quality_index;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const pressure = data.pressure;

    const conditions = [
      { value: aqi, threshold: 70, type: 'air_quality', templates: [
        `The air quality index of ${aqi.toFixed(0)} indicates ${aqi > 100 ? 'unhealthy' : 'moderate'} atmospheric conditions that ${aqi > 100 ? 'pose health risks' : 'require attention'}.`,
        `With an AQI of ${aqi.toFixed(0)}, the air quality ${aqi > 100 ? 'presents significant challenges' : 'shows concerning patterns'}.`,
        `Air quality measurements of ${aqi.toFixed(0)} reveal ${aqi > 100 ? 'degraded atmospheric conditions' : 'moderate pollution levels'}.`
      ]},
      { value: Math.abs(temp), threshold: 30, type: 'temperature', templates: [
        `The temperature of ${temp.toFixed(1)}°C creates ${temp > 35 ? 'extreme heat stress' : temp < -20 ? 'permafrost conditions' : temp > 25 ? 'warm' : temp < 5 ? 'cold' : 'mild'} conditions.`,
        `At ${temp.toFixed(1)}°C, the thermal environment ${temp > 35 ? 'approaches biological limits' : temp < -20 ? 'challenges survival mechanisms' : 'supports diverse life forms'}.`,
        `Thermal readings of ${temp.toFixed(1)}°C indicate ${temp > 35 ? 'intense heat conditions' : temp < -20 ? 'extreme cold environments' : 'moderate temperature ranges'}.`
      ]},
      { value: humidity, threshold: 80, type: 'humidity', templates: [
        `Humidity levels of ${humidity.toFixed(1)}% create ${humidity > 80 ? 'saturated atmospheric conditions' : humidity < 30 ? 'arid, water-limited environment' : 'moderate moisture conditions'}.`,
        `The ${humidity.toFixed(1)}% humidity ${humidity > 80 ? 'saturates the atmosphere' : humidity < 30 ? 'creates desert-like conditions' : 'maintains balanced moisture'}.`,
        `With ${humidity.toFixed(1)}% humidity, the environment ${humidity > 80 ? 'supports lush vegetation' : humidity < 30 ? 'favors drought-resistant species' : 'enables diverse ecosystems'}.`
      ]},
      { value: wind, threshold: 6, type: 'wind', templates: [
        `Wind speeds of ${wind.toFixed(1)} m/s create ${wind > 8 ? 'dynamic atmospheric patterns' : wind < 2 ? 'calm, stable conditions' : 'moderate air movement'}.`,
        `The ${wind.toFixed(1)} m/s winds ${wind > 8 ? 'generate significant atmospheric mixing' : wind < 2 ? 'allow for stable air masses' : 'create gentle circulation'}.`,
        `Wind conditions of ${wind.toFixed(1)} m/s ${wind > 8 ? 'drive weather systems' : wind < 2 ? 'maintain atmospheric stability' : 'influence local climate'}.`
      ]}
    ];

    // Sort by how extreme the condition is
    conditions.sort((a, b) => Math.abs(a.value - a.threshold) - Math.abs(b.value - b.threshold));
    
    const selectedCondition = conditions[0];
    const templateIndex = Math.floor(this.seededRandom(seed) * selectedCondition.templates.length);
    
    return selectedCondition.templates[templateIndex] + ' ';
  }

  private generateSecondaryConditions(data: EnvironmentalData, seed: number): string {
    const conditions = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const solar = data.solar_radiation;
    const cloud = data.cloud_cover;
    const visibility = data.visibility_from_space;
    const uv = data.uv_index;
    const pressure = data.pressure;

    // Add conditions based on actual data values with variations
    if (pressure > 1020) {
      conditions.push(`high atmospheric pressure of ${pressure.toFixed(1)} hPa`);
    } else if (pressure < 1000) {
      conditions.push(`low atmospheric pressure of ${pressure.toFixed(1)} hPa`);
    }

    if (solar > 700) {
      conditions.push(`intense solar radiation of ${solar.toFixed(0)} W/m²`);
    } else if (solar < 200) {
      conditions.push(`limited solar radiation of ${solar.toFixed(0)} W/m²`);
    }

    if (cloud > 80) {
      conditions.push(`heavy cloud cover at ${cloud.toFixed(1)}%`);
    } else if (cloud < 20) {
      conditions.push(`clear skies with only ${cloud.toFixed(1)}% cloud cover`);
    }

    if (visibility > 20) {
      conditions.push(`exceptional visibility of ${visibility.toFixed(1)} km`);
    } else if (visibility < 5) {
      conditions.push(`poor visibility of ${visibility.toFixed(1)} km`);
    }

    if (uv > 6) {
      conditions.push(`high UV index of ${uv.toFixed(1)} requiring protection`);
    } else if (uv < 3) {
      conditions.push(`low UV index of ${uv.toFixed(1)} with minimal risk`);
    }

    const selectedConditions = conditions.slice(0, 2);
    if (selectedConditions.length > 0) {
      const connectors = ['include', 'feature', 'exhibit', 'display', 'show'];
      const connector = connectors[Math.floor(this.seededRandom(seed + 15000) * connectors.length)];
      return `Current atmospheric conditions ${connector} ${selectedConditions.join(' and ')}. `;
    }
    return '';
  }

  private generateEnvironmentalImpact(data: EnvironmentalData, mood: string, seed: number): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const solar = data.solar_radiation;

    const impactTemplates = {
      pristine: [
        "These pristine conditions support high biodiversity with optimal air quality and natural atmospheric composition. ",
        "Such pristine environments create ideal habitats for diverse species and complex ecological interactions. ",
        "These exceptional conditions foster rich ecosystems with minimal human impact. "
      ],
      concerned: [
        "These conditions highlight the impact of human activity on environmental health, with air quality levels requiring attention. ",
        "Such measurements reveal the delicate balance between natural processes and anthropogenic influences. ",
        "These conditions demonstrate the need for environmental stewardship and sustainable practices. "
      ],
      harsh: [
        "These extreme conditions demonstrate the resilience of life and the remarkable adaptations that enable survival in challenging environments. ",
        "Such harsh environments showcase nature's ability to thrive under the most demanding circumstances. ",
        "These extreme conditions reveal the incredible adaptability of life forms in hostile environments. "
      ],
      intense: [
        "High solar radiation creates intense energy conditions that drive primary productivity and influence ecosystem dynamics. ",
        "These intense conditions create selective pressures that drive evolutionary adaptations and ecological specialization. ",
        "Such intense environments generate unique ecological niches and specialized species interactions. "
      ],
      pleasant: [
        "These optimal conditions create ideal habitats that support diverse species and complex ecological interactions. ",
        "Such pleasant conditions foster rich biodiversity and stable ecosystem dynamics. ",
        "These ideal conditions support thriving communities of plants and animals. "
      ],
      dynamic: [
        "These dynamic conditions create ever-changing environments that shape species distributions and ecological processes. ",
        "Such dynamic environments drive evolutionary change and create opportunities for species adaptation. ",
        "These changing conditions create complex ecological interactions and species relationships. "
      ]
    };

    const templates = impactTemplates[mood as keyof typeof impactTemplates] || impactTemplates.pleasant;
    const selectedTemplate = templates[Math.floor(this.seededRandom(seed + 20000) * templates.length)];
    
    return selectedTemplate;
  }

  private generateClimateContext(data: EnvironmentalData, seed: number): string {
    const temp = data.temperature;
    const co2 = data.co2_concentration;
    const aqi = data.air_quality_index;
    const pressure = data.pressure;

    const contextTemplates = [
      `The elevated CO2 levels of ${co2.toFixed(0)} ppm here reflect broader global patterns of atmospheric change and human influence on climate systems.`,
      `Local air quality patterns with an AQI of ${aqi.toFixed(0)} demonstrate the complex interactions between natural processes and human activities in Earth's atmosphere.`,
      `Low atmospheric pressure of ${pressure.toFixed(1)} hPa indicates dynamic weather patterns that contribute to regional climate variability.`,
      `This region's environmental measurements contribute valuable data to our understanding of Earth's climate system and atmospheric processes.`,
      `These conditions reflect the interconnected nature of global climate systems and local environmental factors.`,
      `The environmental data from this location provides insights into regional climate patterns and atmospheric dynamics.`,
      `Such measurements help scientists understand the complex relationships between local conditions and global climate systems.`
    ];

    if (co2 > 450) {
      return contextTemplates[0];
    } else if (aqi > 80) {
      return contextTemplates[1];
    } else if (pressure < 1000) {
      return contextTemplates[2];
    } else {
      const randomIndex = Math.floor(this.seededRandom(seed + 25000) * (contextTemplates.length - 3)) + 3;
      return contextTemplates[randomIndex];
    }
  }

  private determineMood(data: EnvironmentalData): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const wind = data.wind_speed;
    const cloud = data.cloud_cover;

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
    
    if (data.temperature < -20) {
      insights.push('Extreme cold conditions create unique survival challenges');
    } else if (data.temperature > 40) {
      insights.push('Intense heat requires special adaptations for life');
    } else if (data.temperature >= 20 && data.temperature <= 25) {
      insights.push('Optimal temperature range supports diverse ecosystems');
    }

    if (data.humidity > 80) {
      insights.push('High humidity creates lush, tropical environments');
    } else if (data.humidity < 30) {
      insights.push('Low humidity creates arid conditions requiring water conservation');
    }

    if (data.air_quality_index < 30) {
      insights.push('Exceptional air quality indicates pristine environmental conditions');
    } else if (data.air_quality_index > 70) {
      insights.push('Elevated air pollution levels require attention and mitigation');
    }

    if (data.wind_speed > 6) {
      insights.push('Strong winds create dynamic atmospheric conditions');
    } else if (data.wind_speed < 2) {
      insights.push('Calm conditions allow for stable atmospheric patterns');
    }

    if (data.solar_radiation > 600) {
      insights.push('High solar radiation provides abundant energy for photosynthesis');
    } else if (data.solar_radiation < 200) {
      insights.push('Limited solar radiation creates challenging conditions for plant life');
    }

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
    const visibility = data.visibility_from_space;
    const pressure = data.pressure;

    // Create a unique narrative based on the specific environmental data
    const dataSignature = this.createDataSignature(data);
    const locationDescriptor = this.getLocationDescriptor(locationName);
    const timeContext = this.getTimeContext();
    
    let narrative = `${timeContext} Welcome to ${locationName}, where ${locationDescriptor}. `;

    // Primary condition based on the most significant environmental factor
    const primaryCondition = this.getDataDrivenPrimaryCondition(data, locationName);
    narrative += primaryCondition;

    // Secondary conditions that highlight unique aspects
    const secondaryConditions = this.getDataDrivenSecondaryConditions(data, locationName);
    narrative += secondaryConditions;

    // Specific insights based on the actual data values
    const dataInsights = this.getDataSpecificInsights(data, locationName);
    narrative += dataInsights;

    // Environmental impact based on actual conditions
    const environmentalImpact = this.getDataDrivenEnvironmentalImpact(data, locationName, mood);
    narrative += environmentalImpact;

    // Climate context based on real measurements
    const climateContext = this.getDataDrivenClimateContext(data, locationName);
    narrative += climateContext;

    return narrative;
  }

  private createDataSignature(data: EnvironmentalData): string {
    // Create a unique signature based on the environmental data
    const temp = Math.round(data.temperature);
    const humidity = Math.round(data.humidity);
    const aqi = Math.round(data.air_quality_index);
    const wind = Math.round(data.wind_speed);
    const pressure = Math.round(data.pressure);
    
    return `${temp}C-${humidity}H-${aqi}A-${wind}W-${pressure}P`;
  }

  private getPrimaryCondition(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const aqi = data.air_quality_index;
    const humidity = data.humidity;
    const wind = data.wind_speed;

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
    const visibility = data.visibility_from_space;

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

  private getTimeContext(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'As dawn breaks across the landscape,';
    if (hour >= 12 && hour < 17) return 'Under the midday sun,';
    if (hour >= 17 && hour < 20) return 'As evening approaches,';
    return 'Under the starlit sky,';
  }

  private getSeasonalContext(data: EnvironmentalData): string {
    const month = new Date().getMonth();
    const isNorthernHemisphere = data.location_name && this.isNorthernHemisphere(data.location_name);
    
    if ((month >= 2 && month <= 4) && isNorthernHemisphere) return 'spring conditions prevail,';
    if ((month >= 5 && month <= 7) && isNorthernHemisphere) return 'summer warmth dominates,';
    if ((month >= 8 && month <= 10) && isNorthernHemisphere) return 'autumn patterns emerge,';
    if ((month >= 11 || month <= 1) && isNorthernHemisphere) return 'winter characteristics define,';
    
    return 'seasonal patterns shape the environment,';
  }

  private isNorthernHemisphere(locationName: string): boolean {
    const northernRegions = ['amazon', 'congo', 'borneo', 'sahara', 'gobi', 'himalayas', 'alps', 'rocky', 'andes', 'atlantic', 'mediterranean', 'serengeti', 'pampas', 'prairies', 'steppes', 'savanna'];
    return northernRegions.some(region => locationName.toLowerCase().includes(region));
  }

  private getEnhancedPrimaryCondition(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const aqi = data.air_quality_index;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const pressure = data.pressure;

    // More scientifically accurate descriptions
    if (aqi > 70) {
      return `The air quality index of ${aqi.toFixed(0)} indicates moderate to unhealthy atmospheric conditions, with particulate matter and pollutants affecting visibility and respiratory health. `;
    } else if (temp < -20) {
      return `Extreme cold at ${temp.toFixed(1)}°C creates permafrost conditions where only specialized cryophilic organisms can thrive. `;
    } else if (temp > 35) {
      return `Intense heat of ${temp.toFixed(1)}°C approaches the upper thermal limits for many species, creating selective pressure for heat-resistant adaptations. `;
    } else if (humidity > 80) {
      return `High humidity of ${humidity.toFixed(1)}% creates a saturated atmosphere that supports lush vegetation and rapid decomposition cycles. `;
    } else if (humidity < 30) {
      return `Low humidity of ${humidity.toFixed(1)}% creates arid conditions where water conservation becomes critical for survival. `;
    } else if (wind > 6) {
      return `Strong winds of ${wind.toFixed(1)} m/s create dynamic atmospheric patterns that influence seed dispersal and heat exchange. `;
    } else {
      return `The temperature of ${temp.toFixed(1)}°C creates a ${temp > 25 ? 'warm' : temp < 15 ? 'cool' : 'mild'} environment with atmospheric pressure of ${pressure.toFixed(1)} hPa. `;
    }
  }

  private getEnhancedSecondaryConditions(data: EnvironmentalData, locationName: string): string {
    const conditions = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const solar = data.solar_radiation;
    const cloud = data.cloud_cover;
    const visibility = data.visibility_from_space;
    const uv = data.uv_index;

    if (humidity > 60 && humidity <= 80) {
      conditions.push(`moderate humidity at ${humidity.toFixed(1)}%`);
    } else if (humidity < 30) {
      conditions.push(`arid conditions with ${humidity.toFixed(1)}% humidity`);
    }

    if (wind > 2 && wind <= 6) {
      conditions.push(`moderate winds of ${wind.toFixed(1)} m/s`);
    } else if (wind < 2) {
      conditions.push(`calm atmospheric conditions with ${wind.toFixed(1)} m/s winds`);
    }

    if (solar > 600) {
      conditions.push(`high solar irradiance of ${solar.toFixed(0)} W/m²`);
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
      conditions.push(`reduced visibility of ${visibility.toFixed(1)} km`);
    }

    if (uv > 6) {
      conditions.push(`high UV index of ${uv.toFixed(1)} requiring protection`);
    } else if (uv < 3) {
      conditions.push(`low UV index of ${uv.toFixed(1)} with minimal risk`);
    }

    const selectedConditions = conditions.slice(0, 3);
    if (selectedConditions.length > 0) {
      return `Additional atmospheric conditions include ${selectedConditions.join(', ')}. `;
    }
    return '';
  }

  private getScientificInsights(data: EnvironmentalData, locationName: string): string {
    const insights = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const co2 = data.co2_concentration;
    const solar = data.solar_radiation;

    // Temperature-based insights
    if (temp < -20) {
      insights.push('These extreme cold conditions create unique cryogenic ecosystems where specialized organisms have evolved antifreeze proteins and metabolic adaptations.');
    } else if (temp > 35) {
      insights.push('High temperatures create thermal stress that drives evolutionary adaptations in local species, including heat shock proteins and behavioral thermoregulation.');
    }

    // Humidity and ecosystem insights
    if (humidity > 80) {
      insights.push('High humidity supports rapid decomposition and nutrient cycling, creating some of the most productive ecosystems on Earth.');
    } else if (humidity < 30) {
      insights.push('Low humidity creates water-limited environments where species have evolved sophisticated water conservation mechanisms.');
    }

    // Air quality insights
    if (aqi < 30) {
      insights.push('Exceptional air quality indicates minimal anthropogenic impact and pristine atmospheric conditions.');
    } else if (aqi > 70) {
      insights.push('Elevated air pollution levels reflect human activity and industrial processes affecting local atmospheric chemistry.');
    }

    // CO2 and climate insights
    if (co2 > 450) {
      insights.push('Elevated CO2 concentrations indicate significant anthropogenic influence on local atmospheric composition.');
    } else if (co2 < 400) {
      insights.push('Lower CO2 levels suggest effective carbon sequestration by local vegetation and minimal industrial emissions.');
    }

    // Solar radiation insights
    if (solar > 600) {
      insights.push('High solar irradiance provides abundant energy for photosynthesis, supporting high primary productivity.');
    }

    return insights.length > 0 ? insights[0] + ' ' : '';
  }

  private getEcosystemImpact(data: EnvironmentalData, locationName: string, mood: string): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;

    if (mood === 'pristine') {
      return `These pristine conditions support diverse ecosystems with high species richness and complex ecological interactions. `;
    } else if (mood === 'concerned') {
      return `These conditions highlight the delicate balance between human activity and environmental health, requiring careful management. `;
    } else if (mood === 'harsh') {
      return `These extreme conditions demonstrate nature's resilience and the remarkable adaptations that enable life to persist. `;
    } else if (mood === 'intense') {
      return `These intense conditions create selective pressures that drive evolutionary adaptations and ecological specialization. `;
    } else if (mood === 'pleasant') {
      return `These optimal conditions create ideal habitats that support high biodiversity and complex food webs. `;
    } else if (mood === 'dynamic') {
      return `These dynamic conditions create ever-changing environments that shape species distributions and ecological processes. `;
    } else {
      return `These conditions reflect the natural variability that characterizes Earth's diverse ecosystems. `;
    }
  }

  private getClimateContext(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const co2 = data.co2_concentration;
    const aqi = data.air_quality_index;

    // Add climate change context based on data
    if (co2 > 450) {
      return `The elevated CO2 levels here reflect broader global patterns of atmospheric change, highlighting the interconnected nature of Earth's climate system.`;
    } else if (aqi > 70) {
      return `Local air quality patterns here are influenced by both natural processes and human activities, demonstrating the complex interactions in Earth's atmosphere.`;
    } else {
      return `This region's environmental conditions contribute to our understanding of Earth's climate system and the factors that shape our planet's diverse ecosystems.`;
    }
  }

  private getDataDrivenPrimaryCondition(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const aqi = data.air_quality_index;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const pressure = data.pressure;
    const uv = data.uv_index;

    // Find the most extreme or significant condition
    const conditions = [
      { value: aqi, threshold: 70, type: 'air_quality', text: `The air quality index of ${aqi.toFixed(0)} indicates ${aqi > 100 ? 'unhealthy' : 'moderate'} atmospheric conditions that ${aqi > 100 ? 'pose health risks' : 'require attention'}.` },
      { value: Math.abs(temp), threshold: 30, type: 'temperature', text: `The temperature of ${temp.toFixed(1)}°C creates ${temp > 35 ? 'extreme heat stress' : temp < -20 ? 'permafrost conditions' : temp > 25 ? 'warm' : temp < 5 ? 'cold' : 'mild'} conditions.` },
      { value: humidity, threshold: 80, type: 'humidity', text: `Humidity levels of ${humidity.toFixed(1)}% create ${humidity > 80 ? 'saturated atmospheric conditions' : humidity < 30 ? 'arid, water-limited environment' : 'moderate moisture conditions'}.` },
      { value: wind, threshold: 6, type: 'wind', text: `Wind speeds of ${wind.toFixed(1)} m/s create ${wind > 8 ? 'dynamic atmospheric patterns' : wind < 2 ? 'calm, stable conditions' : 'moderate air movement'}.` },
      { value: uv, threshold: 6, type: 'uv', text: `UV index of ${uv.toFixed(1)} indicates ${uv > 8 ? 'extreme' : uv > 6 ? 'high' : uv > 3 ? 'moderate' : 'low'} ultraviolet radiation levels.` }
    ];

    // Sort by how extreme the condition is
    conditions.sort((a, b) => Math.abs(a.value - a.threshold) - Math.abs(b.value - b.threshold));
    
    return conditions[0].text + ' ';
  }

  private getDataDrivenSecondaryConditions(data: EnvironmentalData, locationName: string): string {
    const conditions = [];
    const temp = data.temperature;
    const humidity = data.humidity;
    const wind = data.wind_speed;
    const solar = data.solar_radiation;
    const cloud = data.cloud_cover;
    const visibility = data.visibility_from_space;
    const uv = data.uv_index;
    const pressure = data.pressure;

    // Add conditions based on actual data values
    if (pressure > 1020) {
      conditions.push(`high atmospheric pressure of ${pressure.toFixed(1)} hPa`);
    } else if (pressure < 1000) {
      conditions.push(`low atmospheric pressure of ${pressure.toFixed(1)} hPa`);
    }

    if (solar > 700) {
      conditions.push(`intense solar radiation of ${solar.toFixed(0)} W/m²`);
    } else if (solar < 200) {
      conditions.push(`limited solar radiation of ${solar.toFixed(0)} W/m²`);
    }

    if (cloud > 80) {
      conditions.push(`heavy cloud cover at ${cloud.toFixed(1)}%`);
    } else if (cloud < 20) {
      conditions.push(`clear skies with only ${cloud.toFixed(1)}% cloud cover`);
    }

    if (visibility > 20) {
      conditions.push(`exceptional visibility of ${visibility.toFixed(1)} km`);
    } else if (visibility < 5) {
      conditions.push(`poor visibility of ${visibility.toFixed(1)} km`);
    }

    const selectedConditions = conditions.slice(0, 2);
    if (selectedConditions.length > 0) {
      return `Current atmospheric conditions include ${selectedConditions.join(' and ')}. `;
    }
    return '';
  }

  private getDataSpecificInsights(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const co2 = data.co2_concentration;
    const solar = data.solar_radiation;
    const wind = data.wind_speed;

    const insights = [];

    // Temperature-specific insights
    if (temp < -15) {
      insights.push(`These extreme cold conditions at ${temp.toFixed(1)}°C create unique challenges for local ecosystems, with specialized adaptations required for survival.`);
    } else if (temp > 30) {
      insights.push(`High temperatures of ${temp.toFixed(1)}°C create thermal stress that influences species behavior and distribution patterns.`);
    }

    // Humidity-specific insights
    if (humidity > 85) {
      insights.push(`The high humidity of ${humidity.toFixed(1)}% supports rapid biological processes and creates ideal conditions for moisture-dependent species.`);
    } else if (humidity < 25) {
      insights.push(`Low humidity of ${humidity.toFixed(1)}% creates water-limited conditions that favor drought-resistant adaptations.`);
    }

    // Air quality insights
    if (aqi < 25) {
      insights.push(`Exceptional air quality with an AQI of ${aqi.toFixed(0)} indicates pristine atmospheric conditions with minimal anthropogenic impact.`);
    } else if (aqi > 80) {
      insights.push(`Elevated air pollution with an AQI of ${aqi.toFixed(0)} reflects significant human activity and industrial influence on local air quality.`);
    }

    // CO2 insights
    if (co2 > 450) {
      insights.push(`Elevated CO2 concentrations of ${co2.toFixed(0)} ppm indicate significant anthropogenic influence on atmospheric composition.`);
    } else if (co2 < 400) {
      insights.push(`Lower CO2 levels of ${co2.toFixed(0)} ppm suggest effective carbon sequestration by local vegetation.`);
    }

    // Wind insights
    if (wind > 7) {
      insights.push(`Strong winds of ${wind.toFixed(1)} m/s create dynamic atmospheric conditions that influence heat exchange and species dispersal.`);
    }

    return insights.length > 0 ? insights[0] + ' ' : '';
  }

  private getDataDrivenEnvironmentalImpact(data: EnvironmentalData, locationName: string, mood: string): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const aqi = data.air_quality_index;
    const solar = data.solar_radiation;

    if (mood === 'pristine' && aqi < 30) {
      return `These pristine conditions support high biodiversity with optimal air quality and natural atmospheric composition. `;
    } else if (mood === 'concerned' && aqi > 70) {
      return `These conditions highlight the impact of human activity on environmental health, with air quality levels requiring attention. `;
    } else if (mood === 'harsh' && (temp < -20 || temp > 35)) {
      return `These extreme conditions demonstrate the resilience of life and the remarkable adaptations that enable survival in challenging environments. `;
    } else if (mood === 'intense' && solar > 600) {
      return `High solar radiation creates intense energy conditions that drive primary productivity and influence ecosystem dynamics. `;
    } else if (mood === 'pleasant' && temp >= 20 && temp <= 25 && humidity >= 40 && humidity <= 60) {
      return `These optimal conditions create ideal habitats that support diverse species and complex ecological interactions. `;
    } else {
      return `These environmental conditions reflect the natural variability that characterizes Earth's diverse ecosystems. `;
    }
  }

  private getDataDrivenClimateContext(data: EnvironmentalData, locationName: string): string {
    const temp = data.temperature;
    const co2 = data.co2_concentration;
    const aqi = data.air_quality_index;
    const pressure = data.pressure;

    if (co2 > 450) {
      return `The elevated CO2 levels of ${co2.toFixed(0)} ppm here reflect broader global patterns of atmospheric change and human influence on climate systems.`;
    } else if (aqi > 80) {
      return `Local air quality patterns with an AQI of ${aqi.toFixed(0)} demonstrate the complex interactions between natural processes and human activities in Earth's atmosphere.`;
    } else if (pressure < 1000) {
      return `Low atmospheric pressure of ${pressure.toFixed(1)} hPa indicates dynamic weather patterns that contribute to regional climate variability.`;
    } else {
      return `This region's environmental measurements contribute valuable data to our understanding of Earth's climate system and atmospheric processes.`;
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

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  }

  private getBiomeFromLocation(locationName: string): string {
    const name = locationName.toLowerCase();
    if (name.includes('rainforest') || name.includes('amazon') || name.includes('congo')) return 'tropical_rainforest';
    if (name.includes('desert') || name.includes('sahara') || name.includes('gobi')) return 'desert';
    if (name.includes('mountain') || name.includes('alps') || name.includes('himalayas')) return 'mountain';
    if (name.includes('coastal') || name.includes('reef') || name.includes('maldives')) return 'coastal';
    if (name.includes('polar') || name.includes('antarctica') || name.includes('arctic')) return 'polar';
    if (name.includes('urban') || name.includes('tokyo') || name.includes('new york')) return 'urban';
    if (name.includes('plains') || name.includes('serengeti') || name.includes('prairies')) return 'grassland';
    return 'temperate';
  }

  private determineMoodFromNarrative(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('serene') || lowerText.includes('peaceful') || lowerText.includes('calm')) return 'serene';
    if (lowerText.includes('dynamic') || lowerText.includes('energetic') || lowerText.includes('active')) return 'dynamic';
    if (lowerText.includes('mysterious') || lowerText.includes('enigmatic') || lowerText.includes('hidden')) return 'mysterious';
    if (lowerText.includes('dramatic') || lowerText.includes('intense') || lowerText.includes('powerful')) return 'dramatic';
    if (lowerText.includes('gentle') || lowerText.includes('soft') || lowerText.includes('mild')) return 'gentle';
    return 'neutral';
  }

  private extractInsightsFromNarrative(text: string): string[] {
    const insights: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Extract key insights from the narrative
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 150) {
        insights.push(trimmed);
      }
    });
    
    return insights.slice(0, 3); // Return up to 3 insights
  }

  private generateEnhancedNarrative(data: EnvironmentalData, locationName: string): NarrativeResponse {
    // Create a more AI-like narrative that's data-driven and unique
    const timestamp = Date.now();
    const locationHash = this.createLocationHash(locationName, data);
    const extraRandomness = Math.random() * 1000000;
    const randomSeed = this.createRandomSeed(timestamp + extraRandomness + this.generationCounter, locationHash);
    
    console.log(`🤖 Generating enhanced AI-like narrative #${this.generationCounter} for ${locationName} with seed: ${randomSeed}`);
    
    // Create a more sophisticated, data-driven narrative
    const narrative = this.createDataDrivenNarrative(data, locationName, randomSeed);
    const mood = this.determineDynamicMood(data, randomSeed);
    const insights = this.generateDynamicInsights(data, randomSeed);
    
    return {
      narrative,
      mood,
      insights
    };
  }

  private createDataDrivenNarrative(data: EnvironmentalData, locationName: string, seed: number): string {
    const timeOfDay = this.getTimeOfDay();
    const biome = this.getBiomeFromLocation(locationName);
    
    // Create opening based on time and conditions
    const opening = this.getContextualOpening(timeOfDay, data, seed);
    
    // Create main narrative based on environmental data
    const mainNarrative = this.getEnvironmentalNarrative(data, locationName, seed);
    
    // Create closing with broader context
    const closing = this.getContextualClosing(data, biome, seed);
    
    return `${opening} Welcome to ${locationName}. ${mainNarrative} ${closing}`;
  }

  private getContextualOpening(timeOfDay: string, data: EnvironmentalData, seed: number): string {
    const openings = {
      morning: [
        "As dawn's first light illuminates the atmospheric canvas,",
        "With the morning sun casting long shadows across the landscape,",
        "As the world awakens to a new day of environmental dynamics,",
        "In the gentle embrace of morning light,",
        "As the sun rises over this remarkable ecosystem,"
      ],
      afternoon: [
        "Under the brilliant midday sun,",
        "As solar radiation reaches its peak intensity,",
        "In the full radiance of afternoon light,",
        "Beneath the clear blue sky of midday,",
        "As the sun reaches its zenith,"
      ],
      evening: [
        "As the golden hour paints the sky,",
        "With evening's approach bringing atmospheric changes,",
        "As the day transitions toward twilight,",
        "In the warm glow of the setting sun,",
        "As evening shadows lengthen across the terrain,"
      ],
      night: [
        "Under the starlit canopy of night,",
        "In the quiet darkness of nocturnal hours,",
        "Beneath the moon's gentle illumination,",
        "As night falls over this remarkable landscape,",
        "In the serene embrace of nighttime,"
      ]
    };
    
    const timeOpenings = openings[timeOfDay as keyof typeof openings];
    const selectedOpening = timeOpenings[Math.floor(this.seededRandom(seed) * timeOpenings.length)];
    
    return selectedOpening;
  }

  private getEnvironmentalNarrative(data: EnvironmentalData, locationName: string, seed: number): string {
    const temp = data.temperature;
    const humidity = data.humidity;
    const windSpeed = data.wind_speed;
    const pressure = data.pressure;
    const airQuality = data.air_quality_index;
    const visibility = data.visibility_from_space;
    
    // Create data-driven narrative segments
    const temperatureNarrative = this.getTemperatureNarrative(temp, seed);
    const atmosphericNarrative = this.getAtmosphericNarrative(humidity, pressure, windSpeed, seed);
    const airQualityNarrative = this.getAirQualityNarrative(airQuality, visibility, seed);
    const ecosystemNarrative = this.getEcosystemNarrative(data, locationName, seed);
    
    return `${temperatureNarrative} ${atmosphericNarrative} ${airQualityNarrative} ${ecosystemNarrative}`;
  }

  private getTemperatureNarrative(temp: number, seed: number): string {
    if (temp < -10) {
      return "The frigid temperatures create a harsh, frozen environment where only the most resilient life forms can survive.";
    } else if (temp < 0) {
      return "Cold conditions dominate the landscape, creating a crisp, invigorating atmosphere.";
    } else if (temp < 15) {
      return "Cool temperatures provide a refreshing environment, ideal for temperate ecosystems.";
    } else if (temp < 30) {
      return "Mild temperatures create comfortable conditions for diverse life forms.";
    } else if (temp < 40) {
      return "Warm conditions prevail, creating an energetic environment where life thrives.";
    } else {
      return "Intense heat dominates the landscape, creating challenging conditions for survival.";
    }
  }

  private getAtmosphericNarrative(humidity: number, pressure: number, windSpeed: number, seed: number): string {
    const humidityDesc = humidity > 80 ? "high humidity saturates the air" : 
                        humidity > 60 ? "moderate humidity creates comfortable conditions" :
                        humidity > 40 ? "low humidity creates dry conditions" : "very low humidity creates arid conditions";
    
    const pressureDesc = pressure > 1020 ? "high atmospheric pressure" : 
                        pressure > 1000 ? "normal atmospheric pressure" : "low atmospheric pressure";
    
    const windDesc = windSpeed > 10 ? "strong winds" : 
                    windSpeed > 5 ? "moderate winds" : 
                    windSpeed > 2 ? "gentle breezes" : "calm conditions";
    
    return `The atmospheric conditions reveal ${humidityDesc} under ${pressureDesc}, with ${windDesc} shaping the local environment.`;
  }

  private getAirQualityNarrative(airQuality: number, visibility: number, seed: number): string {
    const qualityDesc = airQuality < 50 ? "excellent air quality" : 
                       airQuality < 100 ? "good air quality" : 
                       airQuality < 150 ? "moderate air quality" : 
                       airQuality < 200 ? "poor air quality" : "very poor air quality";
    
    const visibilityDesc = visibility > 15 ? "crystal-clear visibility" : 
                          visibility > 10 ? "good visibility" : 
                          visibility > 5 ? "reduced visibility" : "limited visibility";
    
    return `The air quality index indicates ${qualityDesc}, with ${visibilityDesc} extending across the landscape.`;
  }

  private getEcosystemNarrative(data: EnvironmentalData, locationName: string, seed: number): string {
    const biome = this.getBiomeFromLocation(locationName);
    const uvIndex = data.uv_index;
    const solarRadiation = data.solar_radiation;
    
    const ecosystemImpacts = [
      "These conditions create a unique microclimate that supports specialized ecosystems.",
      "The environmental parameters shape the local biodiversity in fascinating ways.",
      "This combination of factors creates a distinctive ecological signature.",
      "The atmospheric conditions influence the delicate balance of local life forms.",
      "These environmental characteristics define the unique character of this region."
    ];
    
    const selectedImpact = ecosystemImpacts[Math.floor(this.seededRandom(seed + 1000) * ecosystemImpacts.length)];
    
    return selectedImpact;
  }

  private getContextualClosing(data: EnvironmentalData, biome: string, seed: number): string {
    const closings = [
      "This snapshot of environmental data reveals the dynamic nature of our planet's atmospheric systems.",
      "These measurements tell a story of natural processes working in harmony across the landscape.",
      "The environmental conditions here exemplify the incredible diversity of Earth's ecosystems.",
      "This data provides a window into the complex interactions that shape our world.",
      "These atmospheric readings demonstrate the ever-changing nature of our planet's climate."
    ];
    
    const selectedClosing = closings[Math.floor(this.seededRandom(seed + 2000) * closings.length)];
    return selectedClosing;
  }

  async generateNarrative(data: EnvironmentalData, locationName: string): Promise<NarrativeResponse> {
    console.log(`📝 Generating AI narrative for ${locationName} with environmental data:`, {
      temperature: data.temperature,
      humidity: data.humidity,
      air_quality: data.air_quality_index,
      wind_speed: data.wind_speed,
      pressure: data.pressure,
      uv_index: data.uv_index,
      cloud_cover: data.cloud_cover,
      visibility: data.visibility_from_space,
      co2: data.co2_concentration,
      solar_radiation: data.solar_radiation
    });
    
    try {
      // Try to call the real AI backend endpoint (only works in development)
      // In production, we'll use enhanced local generation since Python backend won't be available
      const backendUrl = 'http://localhost:8000/narrate';
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: locationName,
          features: {
            cloud_pct: data.cloud_cover / 100, // Convert percentage to decimal
            rain_24h_mm: data.precipitation,
            wind_ms: data.wind_speed,
            lst_anom_c: data.temperature - 20, // Temperature anomaly from baseline
            ndvi_anom: (data.humidity - 50) / 100, // Vegetation health proxy
            aod: data.air_quality_index / 100, // Air quality as aerosol optical depth
            lightning_rate: Math.random() * 0.1, // Random lightning activity
            time_of_day: this.getTimeOfDay(),
            biome: this.getBiomeFromLocation(locationName),
            seed: Date.now() // Unique seed for each request
          }
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Generated AI narrative for ${locationName}:`, result);
      
      return {
        narrative: result.text,
        mood: this.determineMoodFromNarrative(result.text),
        insights: this.extractInsightsFromNarrative(result.text)
      };
    } catch (error) {
      console.error('Error generating AI narrative:', error);
      console.log('AI backend not available, using enhanced local generation...');
      
      // Enhanced local generation that simulates AI behavior
      const narrative = this.generateEnhancedNarrative(data, locationName);
      return narrative;
    }
  }
}

export const narrativeService = new NarrativeService();
