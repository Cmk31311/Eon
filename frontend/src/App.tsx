import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import { environmentalDataService, EnvironmentalData } from './services/environmentalDataService';
import { narrativeService, NarrativeResponse } from './services/narrativeService';
import { PerformanceMonitor } from './utils/performance';
import { DataExporter } from './utils/dataExport';

// Lazy load heavy components
const EarthGlobe = lazy(() => import('./components/EarthGlobe'));
const NarrativePanel = lazy(() => import('./components/NarrativePanel').then(module => ({ default: module.NarrativePanel })));
const ThemeToggle = lazy(() => import('./components/ThemeToggle'));

// Memoized regions data to prevent recreation on every render
const regions = [
  { name: 'amazon_rainforest', lat: -3.4653, lon: -62.2159, label: 'Amazon Rainforest', category: 'Rainforest' },
  { name: 'congo_rainforest', lat: -0.2280, lon: 15.8277, label: 'Congo Rainforest', category: 'Rainforest' },
  { name: 'borneo_rainforest', lat: 1.3521, lon: 103.8198, label: 'Borneo Rainforest', category: 'Rainforest' },
  { name: 'daintree_rainforest', lat: -16.1667, lon: 145.4167, label: 'Daintree Rainforest', category: 'Rainforest' },
  { name: 'atlantic_forest', lat: -23.5505, lon: -46.6333, label: 'Atlantic Forest', category: 'Rainforest' },

  { name: 'sahara_desert', lat: 23.8061, lon: 11.2884, label: 'Sahara Desert', category: 'Desert' },
  { name: 'gobi_desert', lat: 42.5900, lon: 103.4300, label: 'Gobi Desert', category: 'Desert' },
  { name: 'atacama_desert', lat: -24.5000, lon: -69.2500, label: 'Atacama Desert', category: 'Desert' },
  { name: 'namib_desert', lat: -24.5000, lon: 15.0000, label: 'Namib Desert', category: 'Desert' },
  { name: 'mohave_desert', lat: 35.0000, lon: -115.5000, label: 'Mojave Desert', category: 'Desert' },

  { name: 'himalayas', lat: 28.0000, lon: 84.0000, label: 'Himalayas', category: 'Mountain' },
  { name: 'alps', lat: 46.5197, lon: 6.6323, label: 'Alps', category: 'Mountain' },
  { name: 'rocky_mountains', lat: 39.7392, lon: -104.9903, label: 'Rocky Mountains', category: 'Mountain' },
  { name: 'andes', lat: -32.6532, lon: -70.0112, label: 'Andes', category: 'Mountain' },
  { name: 'urals', lat: 60.0000, lon: 60.0000, label: 'Ural Mountains', category: 'Mountain' },

  { name: 'great_barrier_reef', lat: -18.2871, lon: 147.6992, label: 'Great Barrier Reef', category: 'Coastal' },
  { name: 'maldives', lat: 3.2028, lon: 73.2207, label: 'Maldives', category: 'Coastal' },
  { name: 'hawaii', lat: 19.8968, lon: -155.5828, label: 'Hawaii', category: 'Coastal' },
  { name: 'galapagos', lat: -0.7893, lon: -91.0544, label: 'Galapagos Islands', category: 'Coastal' },
  { name: 'mediterranean', lat: 35.0000, lon: 18.0000, label: 'Mediterranean Sea', category: 'Coastal' },

  { name: 'antarctica', lat: -75.0000, lon: 0.0000, label: 'Antarctica', category: 'Polar' },
  { name: 'alaska', lat: 64.2008, lon: -149.4937, label: 'Alaska', category: 'Polar' },
  { name: 'siberia', lat: 60.0000, lon: 100.0000, label: 'Siberia', category: 'Polar' },
  { name: 'greenland', lat: 71.7069, lon: -42.6043, label: 'Greenland', category: 'Polar' },
  { name: 'northern_canada', lat: 60.0000, lon: -100.0000, label: 'Northern Canada', category: 'Polar' },

  { name: 'iceland', lat: 64.9631, lon: -19.0208, label: 'Iceland', category: 'Island' },
  { name: 'madagascar', lat: -18.7669, lon: 46.8691, label: 'Madagascar', category: 'Island' },
  { name: 'philippines', lat: 12.8797, lon: 121.7740, label: 'Philippines', category: 'Island' },
  { name: 'sri_lanka', lat: 7.8731, lon: 80.7718, label: 'Sri Lanka', category: 'Island' },

  { name: 'serengeti', lat: -2.1530, lon: 34.6857, label: 'Serengeti', category: 'Plains' },
  { name: 'pampas', lat: -34.6037, lon: -58.3816, label: 'Pampas', category: 'Plains' },
  { name: 'prairies', lat: 49.0000, lon: -100.0000, label: 'Great Plains', category: 'Plains' },
  { name: 'steppes', lat: 50.0000, lon: 100.0000, label: 'Eurasian Steppes', category: 'Plains' },
  { name: 'savanna', lat: -15.0000, lon: 20.0000, label: 'African Savanna', category: 'Plains' },

  // Additional Rainforests
  { name: 'valdivian_rainforest', lat: -40.0000, lon: -73.0000, label: 'Valdivian Rainforest', category: 'Rainforest' },
  { name: 'tropical_andes', lat: -2.0000, lon: -78.0000, label: 'Tropical Andes', category: 'Rainforest' },
  { name: 'sundarbans', lat: 22.0000, lon: 89.0000, label: 'Sundarbans', category: 'Rainforest' },
  { name: 'kinabalu_park', lat: 6.0750, lon: 116.5581, label: 'Kinabalu Park', category: 'Rainforest' },
  { name: 'taman_negara', lat: 4.0000, lon: 102.0000, label: 'Taman Negara', category: 'Rainforest' },

  // Additional Deserts
  { name: 'kalahari_desert', lat: -23.0000, lon: 20.0000, label: 'Kalahari Desert', category: 'Desert' },
  { name: 'thar_desert', lat: 27.0000, lon: 71.0000, label: 'Thar Desert', category: 'Desert' },
  { name: 'sonoran_desert', lat: 32.0000, lon: -112.0000, label: 'Sonoran Desert', category: 'Desert' },
  { name: 'chihuahuan_desert', lat: 30.0000, lon: -105.0000, label: 'Chihuahuan Desert', category: 'Desert' },
  { name: 'patagonian_desert', lat: -40.0000, lon: -70.0000, label: 'Patagonian Desert', category: 'Desert' },

  // Additional Mountains
  { name: 'karakoram', lat: 35.0000, lon: 76.0000, label: 'Karakoram Range', category: 'Mountain' },
  { name: 'pamir_mountains', lat: 38.0000, lon: 72.0000, label: 'Pamir Mountains', category: 'Mountain' },
  { name: 'caucasus', lat: 42.0000, lon: 44.0000, label: 'Caucasus Mountains', category: 'Mountain' },
  { name: 'atlas_mountains', lat: 31.0000, lon: -7.0000, label: 'Atlas Mountains', category: 'Mountain' },
  { name: 'appalachians', lat: 40.0000, lon: -78.0000, label: 'Appalachian Mountains', category: 'Mountain' },
  { name: 'carpathians', lat: 47.0000, lon: 25.0000, label: 'Carpathian Mountains', category: 'Mountain' },
  { name: 'pyrenees', lat: 42.5000, lon: 1.0000, label: 'Pyrenees', category: 'Mountain' },
  { name: 'drakensberg', lat: -29.0000, lon: 29.0000, label: 'Drakensberg', category: 'Mountain' },

  // Additional Coastal Areas
  { name: 'amazon_river', lat: -2.0000, lon: -60.0000, label: 'Amazon River Basin', category: 'Coastal' },
  { name: 'nile_delta', lat: 31.0000, lon: 31.0000, label: 'Nile Delta', category: 'Coastal' },
  { name: 'mississippi_delta', lat: 29.0000, lon: -89.0000, label: 'Mississippi Delta', category: 'Coastal' },
  { name: 'ganges_delta', lat: 22.0000, lon: 89.0000, label: 'Ganges Delta', category: 'Coastal' },
  { name: 'yangtze_delta', lat: 31.0000, lon: 121.0000, label: 'Yangtze Delta', category: 'Coastal' },
  { name: 'caribbean', lat: 15.0000, lon: -75.0000, label: 'Caribbean Sea', category: 'Coastal' },
  { name: 'red_sea', lat: 22.0000, lon: 38.0000, label: 'Red Sea', category: 'Coastal' },
  { name: 'persian_gulf', lat: 26.0000, lon: 52.0000, label: 'Persian Gulf', category: 'Coastal' },

  // Additional Polar Regions
  { name: 'patagonia', lat: -50.0000, lon: -70.0000, label: 'Patagonia', category: 'Polar' },
  { name: 'svalbard', lat: 78.0000, lon: 20.0000, label: 'Svalbard', category: 'Polar' },
  { name: 'falkland_islands', lat: -51.7963, lon: -59.5236, label: 'Falkland Islands', category: 'Polar' },
  { name: 'south_georgia', lat: -54.0000, lon: -37.0000, label: 'South Georgia', category: 'Polar' },
  { name: 'tierra_del_fuego', lat: -54.0000, lon: -68.0000, label: 'Tierra del Fuego', category: 'Polar' },

  // Additional Islands
  { name: 'new_zealand', lat: -40.9006, lon: 174.8860, label: 'New Zealand', category: 'Island' },
  { name: 'tasmania', lat: -41.4545, lon: 145.9707, label: 'Tasmania', category: 'Island' },
  { name: 'borneo', lat: 1.0000, lon: 114.0000, label: 'Borneo', category: 'Island' },
  { name: 'sumatra', lat: -0.7893, lon: 101.3431, label: 'Sumatra', category: 'Island' },
  { name: 'java', lat: -7.0000, lon: 110.0000, label: 'Java', category: 'Island' },
  { name: 'sulawesi', lat: -2.0000, lon: 121.0000, label: 'Sulawesi', category: 'Island' },
  { name: 'new_guinea', lat: -5.0000, lon: 140.0000, label: 'New Guinea', category: 'Island' },
  { name: 'cuba', lat: 21.5218, lon: -77.7812, label: 'Cuba', category: 'Island' },
  { name: 'jamaica', lat: 18.1096, lon: -77.2975, label: 'Jamaica', category: 'Island' },
  { name: 'hispaniola', lat: 19.0000, lon: -70.6667, label: 'Hispaniola', category: 'Island' },

  // Additional Plains/Grasslands
  { name: 'llanos', lat: 6.0000, lon: -67.0000, label: 'Llanos', category: 'Plains' },
  { name: 'cerrado', lat: -15.0000, lon: -47.0000, label: 'Cerrado', category: 'Plains' },
  { name: 'pantanal', lat: -20.0000, lon: -56.0000, label: 'Pantanal', category: 'Plains' },
  { name: 'chaco', lat: -25.0000, lon: -60.0000, label: 'Gran Chaco', category: 'Plains' },
  { name: 'veld', lat: -26.0000, lon: 28.0000, label: 'Highveld', category: 'Plains' },
  { name: 'outback', lat: -25.0000, lon: 133.0000, label: 'Australian Outback', category: 'Plains' },
  { name: 'mara', lat: -1.0000, lon: 35.0000, label: 'Maasai Mara', category: 'Plains' },
  { name: 'okavango', lat: -19.0000, lon: 23.0000, label: 'Okavango Delta', category: 'Plains' },

  // Urban/Industrial Areas
  { name: 'tokyo', lat: 35.6762, lon: 139.6503, label: 'Tokyo', category: 'Urban' },
  { name: 'new_york', lat: 40.7128, lon: -74.0060, label: 'New York', category: 'Urban' },
  { name: 'london', lat: 51.5074, lon: -0.1278, label: 'London', category: 'Urban' },
  { name: 'paris', lat: 48.8566, lon: 2.3522, label: 'Paris', category: 'Urban' },
  { name: 'moscow', lat: 55.7558, lon: 37.6176, label: 'Moscow', category: 'Urban' },
  { name: 'beijing', lat: 39.9042, lon: 116.4074, label: 'Beijing', category: 'Urban' },
  { name: 'mumbai', lat: 19.0760, lon: 72.8777, label: 'Mumbai', category: 'Urban' },
  { name: 'sao_paulo', lat: -23.5505, lon: -46.6333, label: 'São Paulo', category: 'Urban' },
  { name: 'mexico_city', lat: 19.4326, lon: -99.1332, label: 'Mexico City', category: 'Urban' },
  { name: 'cairo', lat: 30.0444, lon: 31.2357, label: 'Cairo', category: 'Urban' },

  // Unique Ecosystems
  { name: 'everglades', lat: 25.0000, lon: -80.5000, label: 'Everglades', category: 'Wetland' },
  { name: 'okefenokee', lat: 30.0000, lon: -82.0000, label: 'Okefenokee Swamp', category: 'Wetland' },
  { name: 'congo_basin', lat: 0.0000, lon: 20.0000, label: 'Congo Basin', category: 'Wetland' },
  { name: 'mekong_delta', lat: 10.0000, lon: 106.0000, label: 'Mekong Delta', category: 'Wetland' },
  { name: 'camargue', lat: 43.5000, lon: 4.5000, label: 'Camargue', category: 'Wetland' },
  { name: 'kakadu', lat: -12.0000, lon: 132.0000, label: 'Kakadu National Park', category: 'Wetland' },

  // Volcanic Regions
  { name: 'ring_of_fire', lat: 0.0000, lon: 120.0000, label: 'Ring of Fire', category: 'Volcanic' },
  { name: 'yellowstone', lat: 44.4280, lon: -110.5885, label: 'Yellowstone', category: 'Volcanic' },
  { name: 'etna', lat: 37.7340, lon: 14.9990, label: 'Mount Etna', category: 'Volcanic' },
  { name: 'kilimanjaro', lat: -3.0674, lon: 37.3556, label: 'Mount Kilimanjaro', category: 'Volcanic' },
  { name: 'fuji', lat: 35.3606, lon: 138.7274, label: 'Mount Fuji', category: 'Volcanic' },
  { name: 'vesuvius', lat: 40.8220, lon: 14.4289, label: 'Mount Vesuvius', category: 'Volcanic' },

  // Tundra Regions
  { name: 'alaskan_tundra', lat: 68.0000, lon: -150.0000, label: 'Alaskan Tundra', category: 'Tundra' },
  { name: 'canadian_tundra', lat: 70.0000, lon: -100.0000, label: 'Canadian Tundra', category: 'Tundra' },
  { name: 'russian_tundra', lat: 70.0000, lon: 100.0000, label: 'Russian Tundra', category: 'Tundra' },
  { name: 'scandinavian_tundra', lat: 70.0000, lon: 25.0000, label: 'Scandinavian Tundra', category: 'Tundra' },

  // Additional regions to reach 151 total
  { name: 'boreal_forest', lat: 60.0000, lon: -100.0000, label: 'Boreal Forest', category: 'Forest' },
  { name: 'temperate_forest', lat: 45.0000, lon: -75.0000, label: 'Temperate Forest', category: 'Forest' },
  { name: 'deciduous_forest', lat: 40.0000, lon: -80.0000, label: 'Deciduous Forest', category: 'Forest' },
  { name: 'coniferous_forest', lat: 55.0000, lon: -120.0000, label: 'Coniferous Forest', category: 'Forest' },
  { name: 'mixed_forest', lat: 50.0000, lon: -100.0000, label: 'Mixed Forest', category: 'Forest' },
  { name: 'tropical_forest', lat: 10.0000, lon: -60.0000, label: 'Tropical Forest', category: 'Forest' },
  { name: 'mangrove_forest', lat: 20.0000, lon: -80.0000, label: 'Mangrove Forest', category: 'Wetland' },
  { name: 'salt_marsh', lat: 30.0000, lon: -80.0000, label: 'Salt Marsh', category: 'Wetland' },
  { name: 'peat_bog', lat: 60.0000, lon: 20.0000, label: 'Peat Bog', category: 'Wetland' },
  { name: 'freshwater_marsh', lat: 40.0000, lon: -100.0000, label: 'Freshwater Marsh', category: 'Wetland' },
  { name: 'alpine_meadow', lat: 45.0000, lon: -110.0000, label: 'Alpine Meadow', category: 'Mountain' },
  { name: 'subalpine_zone', lat: 40.0000, lon: -105.0000, label: 'Subalpine Zone', category: 'Mountain' },
  { name: 'montane_forest', lat: 35.0000, lon: -105.0000, label: 'Montane Forest', category: 'Mountain' },
  { name: 'foothills', lat: 40.0000, lon: -105.0000, label: 'Foothills', category: 'Mountain' },
  { name: 'plateau', lat: 35.0000, lon: -110.0000, label: 'Colorado Plateau', category: 'Mountain' },
  { name: 'mesa', lat: 36.0000, lon: -108.0000, label: 'Mesa', category: 'Mountain' },
  { name: 'canyon', lat: 36.0000, lon: -112.0000, label: 'Grand Canyon', category: 'Mountain' },
  { name: 'valley', lat: 40.0000, lon: -74.0000, label: 'Hudson Valley', category: 'Mountain' },
  { name: 'ridge', lat: 35.0000, lon: -83.0000, label: 'Blue Ridge', category: 'Mountain' },
  { name: 'peak', lat: 39.0000, lon: -105.0000, label: 'Pikes Peak', category: 'Mountain' },
  { name: 'summit', lat: 40.0000, lon: -105.0000, label: 'Longs Peak', category: 'Mountain' },
  { name: 'pass', lat: 39.0000, lon: -106.0000, label: 'Loveland Pass', category: 'Mountain' },
  { name: 'gorge', lat: 45.0000, lon: -122.0000, label: 'Columbia Gorge', category: 'Mountain' },
  { name: 'basin', lat: 40.0000, lon: -110.0000, label: 'Great Basin', category: 'Desert' },
  { name: 'oasis', lat: 30.0000, lon: -110.0000, label: 'Desert Oasis', category: 'Desert' },
  { name: 'sand_dunes', lat: 37.0000, lon: -105.0000, label: 'Great Sand Dunes', category: 'Desert' },
  { name: 'badlands', lat: 43.0000, lon: -102.0000, label: 'Badlands', category: 'Desert' },
  { name: 'canyon_lands', lat: 38.0000, lon: -110.0000, label: 'Canyonlands', category: 'Desert' },
  { name: 'monument_valley', lat: 37.0000, lon: -110.0000, label: 'Monument Valley', category: 'Desert' },
  { name: 'death_valley', lat: 36.0000, lon: -117.0000, label: 'Death Valley', category: 'Desert' },
  { name: 'white_sands', lat: 32.0000, lon: -106.0000, label: 'White Sands', category: 'Desert' },
  { name: 'painted_desert', lat: 35.0000, lon: -110.0000, label: 'Painted Desert', category: 'Desert' },
  { name: 'red_rocks', lat: 36.0000, lon: -105.0000, label: 'Red Rocks', category: 'Desert' },
  { name: 'coral_reef', lat: -18.0000, lon: 147.0000, label: 'Coral Reef', category: 'Coastal' },
  { name: 'kelp_forest', lat: 34.0000, lon: -120.0000, label: 'Kelp Forest', category: 'Coastal' },
  { name: 'tidal_pool', lat: 37.0000, lon: -122.0000, label: 'Tidal Pools', category: 'Coastal' },
  { name: 'beach', lat: 34.0000, lon: -118.0000, label: 'Malibu Beach', category: 'Coastal' },
  { name: 'cliff', lat: 36.0000, lon: -121.0000, label: 'Big Sur Cliffs', category: 'Coastal' },
  { name: 'bay', lat: 37.0000, lon: -122.0000, label: 'San Francisco Bay', category: 'Coastal' },
  { name: 'fjord', lat: 60.0000, lon: 5.0000, label: 'Norwegian Fjord', category: 'Coastal' },
  { name: 'estuary', lat: 37.0000, lon: -122.0000, label: 'San Francisco Estuary', category: 'Coastal' },
  { name: 'lagoon', lat: 25.0000, lon: -80.0000, label: 'Biscayne Lagoon', category: 'Coastal' },
  { name: 'atoll', lat: 4.0000, lon: 73.0000, label: 'Maldivian Atoll', category: 'Coastal' },
  { name: 'peninsula', lat: 37.0000, lon: -122.0000, label: 'San Francisco Peninsula', category: 'Coastal' },
  { name: 'cape', lat: 42.0000, lon: -70.0000, label: 'Cape Cod', category: 'Coastal' },
  { name: 'headland', lat: 45.0000, lon: -124.0000, label: 'Cape Disappointment', category: 'Coastal' },
  { name: 'spit', lat: 48.0000, lon: -123.0000, label: 'Dungeness Spit', category: 'Coastal' },
  { name: 'barrier_island', lat: 30.0000, lon: -81.0000, label: 'Barrier Island', category: 'Coastal' },
  { name: 'seamount', lat: 20.0000, lon: -155.0000, label: 'Hawaiian Seamount', category: 'Coastal' },
  { name: 'trench', lat: 20.0000, lon: -155.0000, label: 'Mariana Trench', category: 'Coastal' },
  { name: 'ridge_underwater', lat: 0.0000, lon: -20.0000, label: 'Mid-Atlantic Ridge', category: 'Coastal' },
  { name: 'hydrothermal_vent', lat: 0.0000, lon: -20.0000, label: 'Hydrothermal Vent', category: 'Coastal' },
  { name: 'cold_seep', lat: 0.0000, lon: -20.0000, label: 'Cold Seep', category: 'Coastal' },
  { name: 'whale_fall', lat: 0.0000, lon: -20.0000, label: 'Whale Fall', category: 'Coastal' },
  { name: 'brine_pool', lat: 0.0000, lon: -20.0000, label: 'Brine Pool', category: 'Coastal' },
  { name: 'blue_hole', lat: 17.0000, lon: -88.0000, label: 'Great Blue Hole', category: 'Coastal' },
  { name: 'underwater_cave', lat: 20.0000, lon: -87.0000, label: 'Underwater Cave', category: 'Coastal' },
  { name: 'coral_atoll', lat: 4.0000, lon: 73.0000, label: 'Coral Atoll', category: 'Coastal' },
  { name: 'mangrove_swamp', lat: 25.0000, lon: -80.0000, label: 'Mangrove Swamp', category: 'Wetland' },
  { name: 'cypress_swamp', lat: 30.0000, lon: -90.0000, label: 'Cypress Swamp', category: 'Wetland' },
  { name: 'floodplain', lat: 40.0000, lon: -74.0000, label: 'Floodplain', category: 'Wetland' },
  { name: 'oxbow_lake', lat: 40.0000, lon: -74.0000, label: 'Oxbow Lake', category: 'Wetland' },
  { name: 'meander', lat: 40.0000, lon: -74.0000, label: 'River Meander', category: 'Wetland' },
  { name: 'delta_plain', lat: 30.0000, lon: -90.0000, label: 'Delta Plain', category: 'Wetland' },
  { name: 'alluvial_fan', lat: 36.0000, lon: -118.0000, label: 'Alluvial Fan', category: 'Wetland' },
  { name: 'playa_lake', lat: 40.0000, lon: -120.0000, label: 'Playa Lake', category: 'Wetland' },
  { name: 'vernal_pool', lat: 37.0000, lon: -122.0000, label: 'Vernal Pool', category: 'Wetland' },
  { name: 'ephemeral_stream', lat: 36.0000, lon: -118.0000, label: 'Ephemeral Stream', category: 'Wetland' },
  { name: 'intermittent_river', lat: 36.0000, lon: -118.0000, label: 'Intermittent River', category: 'Wetland' },
  { name: 'braided_river', lat: 40.0000, lon: -105.0000, label: 'Braided River', category: 'Wetland' },
  { name: 'anabranch', lat: 40.0000, lon: -105.0000, label: 'River Anabranch', category: 'Wetland' },
  { name: 'backwater', lat: 40.0000, lon: -105.0000, label: 'Backwater', category: 'Wetland' },
  { name: 'slough', lat: 40.0000, lon: -105.0000, label: 'Slough', category: 'Wetland' },
  { name: 'bayou', lat: 30.0000, lon: -90.0000, label: 'Bayou', category: 'Wetland' },
  { name: 'billabong', lat: -25.0000, lon: 135.0000, label: 'Billabong', category: 'Wetland' },
  { name: 'lagoon_wetland', lat: 25.0000, lon: -80.0000, label: 'Wetland Lagoon', category: 'Wetland' },
  { name: 'marsh_grassland', lat: 40.0000, lon: -74.0000, label: 'Marsh Grassland', category: 'Wetland' },
  { name: 'reed_bed', lat: 40.0000, lon: -74.0000, label: 'Reed Bed', category: 'Wetland' },
  { name: 'cattail_marsh', lat: 40.0000, lon: -74.0000, label: 'Cattail Marsh', category: 'Wetland' },
  { name: 'sedge_meadow', lat: 40.0000, lon: -74.0000, label: 'Sedge Meadow', category: 'Wetland' },
  { name: 'fen', lat: 60.0000, lon: 20.0000, label: 'Fen', category: 'Wetland' },
  { name: 'bog', lat: 60.0000, lon: 20.0000, label: 'Bog', category: 'Wetland' },
  { name: 'mire', lat: 60.0000, lon: 20.0000, label: 'Mire', category: 'Wetland' },
  { name: 'quagmire', lat: 60.0000, lon: 20.0000, label: 'Quagmire', category: 'Wetland' },
  { name: 'muskeg', lat: 60.0000, lon: -100.0000, label: 'Muskeg', category: 'Wetland' },
  { name: 'swamp_forest', lat: 30.0000, lon: -90.0000, label: 'Swamp Forest', category: 'Wetland' },
  { name: 'bottomland_forest', lat: 30.0000, lon: -90.0000, label: 'Bottomland Forest', category: 'Wetland' },
  { name: 'riparian_forest', lat: 40.0000, lon: -105.0000, label: 'Riparian Forest', category: 'Wetland' },
  { name: 'gallery_forest', lat: 40.0000, lon: -105.0000, label: 'Gallery Forest', category: 'Wetland' },
  { name: 'flooded_forest', lat: 30.0000, lon: -90.0000, label: 'Flooded Forest', category: 'Wetland' },
  { name: 'seasonal_forest', lat: 30.0000, lon: -90.0000, label: 'Seasonal Forest', category: 'Wetland' },
  { name: 'tidal_forest', lat: 30.0000, lon: -80.0000, label: 'Tidal Forest', category: 'Wetland' },
  { name: 'freshwater_swamp', lat: 30.0000, lon: -90.0000, label: 'Freshwater Swamp', category: 'Wetland' },
  { name: 'brackish_swamp', lat: 30.0000, lon: -80.0000, label: 'Brackish Swamp', category: 'Wetland' },
  { name: 'saltwater_swamp', lat: 30.0000, lon: -80.0000, label: 'Saltwater Swamp', category: 'Wetland' },
  { name: 'tidal_swamp', lat: 30.0000, lon: -80.0000, label: 'Tidal Swamp', category: 'Wetland' },
  { name: 'intertidal_zone', lat: 37.0000, lon: -122.0000, label: 'Intertidal Zone', category: 'Wetland' },
  { name: 'supratidal_zone', lat: 37.0000, lon: -122.0000, label: 'Supratidal Zone', category: 'Wetland' },
  { name: 'subtidal_zone', lat: 37.0000, lon: -122.0000, label: 'Subtidal Zone', category: 'Wetland' },
  { name: 'littoral_zone', lat: 37.0000, lon: -122.0000, label: 'Littoral Zone', category: 'Wetland' },
  { name: 'benthic_zone', lat: 37.0000, lon: -122.0000, label: 'Benthic Zone', category: 'Wetland' },
  { name: 'pelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Pelagic Zone', category: 'Wetland' },
  { name: 'abyssal_zone', lat: 37.0000, lon: -122.0000, label: 'Abyssal Zone', category: 'Wetland' },
  { name: 'hadal_zone', lat: 37.0000, lon: -122.0000, label: 'Hadal Zone', category: 'Wetland' },
  { name: 'photic_zone', lat: 37.0000, lon: -122.0000, label: 'Photic Zone', category: 'Wetland' },
  { name: 'aphotic_zone', lat: 37.0000, lon: -122.0000, label: 'Aphotic Zone', category: 'Wetland' },
  { name: 'twilight_zone', lat: 37.0000, lon: -122.0000, label: 'Twilight Zone', category: 'Wetland' },
  { name: 'midnight_zone', lat: 37.0000, lon: -122.0000, label: 'Midnight Zone', category: 'Wetland' },
  { name: 'abyssopelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Abyssopelagic Zone', category: 'Wetland' },
  { name: 'hadopelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Hadopelagic Zone', category: 'Wetland' },
  { name: 'epipelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Epipelagic Zone', category: 'Wetland' },
  { name: 'mesopelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Mesopelagic Zone', category: 'Wetland' },
  { name: 'bathypelagic_zone', lat: 37.0000, lon: -122.0000, label: 'Bathypelagic Zone', category: 'Wetland' }
];

// Memoized components for better performance
const LoadingSpinner = React.memo(() => (
  <div className="max-w-4xl mx-auto mb-8 scale-in">
    <div className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-8 h-8 border-3 border-cyan-400/30 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <span className="text-xl text-gray-300 font-medium">Loading environmental data...</span>
        </div>
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        <p className="text-gray-400 text-sm">Fetching real-time data from environmental sensors...</p>
      </div>
    </div>
  </div>
));

function App() {
  const [region, setRegion] = useState<string>('amazon_rainforest');
  const [features, setFeatures] = useState<any>(null);
  const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedRegions, setBookmarkedRegions] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Performance monitoring
  const performanceMonitor = useMemo(() => PerformanceMonitor.getInstance(), []);

  // Memoized current region to prevent unnecessary recalculations
  const currentRegion = useMemo(() => 
    regions.find(r => r.name === region), 
    [region]
  );

  // Memoized categorized regions to prevent recalculation on every render
  const categorizedRegions = useMemo(() => 
    regions.reduce((acc, regionData) => {
      if (!acc[regionData.category]) {
        acc[regionData.category] = [];
      }
      acc[regionData.category].push(regionData);
      return acc;
    }, {} as Record<string, Array<typeof regions[0]>>),
    []
  );

  // Filtered regions based on search query
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return categorizedRegions;
    
    const query = searchQuery.toLowerCase();
    const filtered = regions.filter(region => 
      region.label.toLowerCase().includes(query) ||
      region.category.toLowerCase().includes(query) ||
      region.name.toLowerCase().includes(query)
    );
    
    return filtered.reduce((acc, regionData) => {
      if (!acc[regionData.category]) {
        acc[regionData.category] = [];
      }
      acc[regionData.category].push(regionData);
      return acc;
    }, {} as Record<string, Array<typeof regions[0]>>);
  }, [categorizedRegions, searchQuery]);

  // Data cache to prevent unnecessary API calls
  const dataCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const loadRegionData = useCallback(async (regionName: string) => {
    setIsLoading(true);
    performanceMonitor.startTiming(`load-region-${regionName}`);
    
    try {
      const regionData = regions.find(r => r.name === regionName);
      if (!regionData) return;

      // Check cache first
      const cacheKey = `${regionName}_${regionData.lat}_${regionData.lon}`;
      const cached = dataCache.current.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log(`🌍 Using cached data for ${regionData.label}...`);
        setFeatures(cached.data);
        setLastUpdate(new Date(cached.timestamp));
        setIsLoading(false);
        performanceMonitor.endTiming(`load-region-${regionName}`);
        return;
      }

      console.log(`🌍 Loading fresh data for ${regionData.label}...`);
      
      const environmentalData = await performanceMonitor.measureAsync(
        `fetch-environmental-${regionName}`,
        () => environmentalDataService.getLiveEnvironmentalData(
          regionData.lat, 
          regionData.lon, 
          regionData.label
        )
      );
      
      // Cache the data
      dataCache.current.set(cacheKey, { data: environmentalData, timestamp: now });
      
      setFeatures(environmentalData);
      setLastUpdate(new Date());

      try {
        const narrativeResponse = await performanceMonitor.measureAsync(
          `generate-narrative-${regionName}`,
          () => narrativeService.generateNarrative(environmentalData, regionData.label)
        );
        setNarrative(narrativeResponse);
      } catch (narrativeError) {
        console.warn('Narrative generation failed:', narrativeError);
        setNarrative(null);
      }
      
    } catch (error) {
      console.error('Failed to load region data:', error);
    } finally {
      setIsLoading(false);
      performanceMonitor.endTiming(`load-region-${regionName}`);
    }
  }, [performanceMonitor]);

  useEffect(() => {
    if (region) {
      loadRegionData(region);
    }
  }, [region, loadRegionData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (region) {
        loadRegionData(region);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, region, loadRegionData]);

  const handleRegionSelect = useCallback((regionName: string) => {
    setRegion(regionName);
    setIsDropdownOpen(false);
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleToggleBookmark = useCallback((regionName: string) => {
    setBookmarkedRegions(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(regionName)) {
        newBookmarks.delete(regionName);
      } else {
        newBookmarks.add(regionName);
      }
      return newBookmarks;
    });
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('[data-dropdown]');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedRegions');
    if (savedBookmarks) {
      try {
        const bookmarks = JSON.parse(savedBookmarks);
        setBookmarkedRegions(new Set(bookmarks));
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (bookmarkedRegions.size > 0) {
      localStorage.setItem('bookmarkedRegions', JSON.stringify(Array.from(bookmarkedRegions)));
    }
  }, [bookmarkedRegions]);

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitor.observeWebVitals();

    // Log memory usage periodically
    const memoryInterval = setInterval(() => {
      const memoryInfo = performanceMonitor.getMemoryInfo();
      if (memoryInfo) {
        console.log('Memory usage:', {
          used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(memoryInterval);
      performanceMonitor.cleanup();
    };
  }, [performanceMonitor]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
        
      {/* Header */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-start mb-8 slide-in-up">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="project-title mb-2">
              Eon
        </h1>
            <h2 className="project-subtitle mb-4">
              Earth Saga
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto fade-in" style={{animationDelay: '0.5s'}}>
              Explore the world through environmental data and interactive storytelling
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <Suspense fallback={<div className="w-10 h-6"></div>}>
              <ThemeToggle />
            </Suspense>
          </div>
      </div>

        {/* Main Feature */}
        <div className="w-full mx-auto mb-8 slide-in-up" style={{animationDelay: '0.3s'}}>
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            {/* Globe Header with enhanced styling */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  
            </span>
        </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            {/* Globe Container with enhanced effects */}
            <div className="relative">
              <div className="h-[70vh] min-h-[500px] rounded-xl overflow-hidden border border-white/20 shadow-2xl floating-animation">
                <Suspense fallback={
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
                }>
          <EarthGlobe 
            selectedRegion={region}
                    onRegionClick={(regionName: string) => {
                      setRegion(regionName);
                      setIsDropdownOpen(false);
                    }}
              regions={regions}
          />
                </Suspense>
      </div>

              {/* Floating particles around globe */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-green-400/60 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
      </div>
            </div>
            </div>
          </div>
          
        {/* Region Dropdown - Simple and Fast */}
        <div className="max-w-4xl mx-auto mb-8 slide-in-up" style={{animationDelay: '0.6s'}}>
          <div className="relative" data-dropdown>
          <button
              onClick={handleToggleDropdown}
              className="w-full px-6 py-5 glass-panel rounded-xl text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full pulse-glow"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-400/30 rounded-full animate-ping"></div>
                </div>
                <div className="text-left">
                  <span className="text-lg font-semibold block">
                    {currentRegion ? currentRegion.label : 'Select a Region'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {currentRegion ? currentRegion.category : 'Choose from categories below'}
                    </span>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                  {regions.length} regions
                </div>
                <svg 
                  className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
              </div>
          </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-3 glass-panel rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto scale-in">
                                        {/* Search Input */}
                                        <div className="p-4 border-b border-white/10">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search regions..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    🔍
              </div>
                  </div>
            </div>

                                        {/* Favorites Section */}
                                        {bookmarkedRegions.size > 0 && !searchQuery && (
                                            <div className="border-b border-white/10">
                                                <div className="px-6 py-3 text-xs font-bold text-yellow-200 uppercase tracking-wider bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                                                    ⭐ Favorites ({bookmarkedRegions.size})
                                                </div>
                                                {Array.from(bookmarkedRegions).map((bookmarkedRegionName) => {
                                                    const regionData = regions.find(r => r.name === bookmarkedRegionName);
                                                    if (!regionData) return null;
                                                    return (
                    <button
                                                            key={regionData.name}
                                                            onClick={() => handleRegionSelect(regionData.name)}
                                                            className={`w-full px-6 py-4 text-left hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0 group ${
                                                                region === regionData.name
                                                                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-l-4 border-purple-400'
                                                                    : 'text-white hover:border-l-4 hover:border-white/30'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    region === regionData.name
                                                                        ? 'bg-purple-400'
                                                                        : 'bg-yellow-400 group-hover:bg-white/60'
                                                                }`}></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-base truncate">{regionData.label}</div>
                                                                    <div className="text-sm text-gray-400 truncate">{regionData.category}</div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleBookmark(regionData.name);
                                                                    }}
                                                                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                                    title="Remove from favorites"
                                                                >
                                                                    ⭐
                  </button>
                                                                {region === regionData.name && (
                                                                    <div className="text-purple-400 flex-shrink-0">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                    </div>
                  )}
                </div>
                                                        </button>
                                                    );
                                                })}
              </div>
                                        )}
                                        
                                        {Object.keys(filteredRegions).length === 0 ? (
                                            <div className="p-6 text-center text-gray-400">
                                                <div className="text-4xl mb-2">🔍</div>
                                                <p>No regions found matching "{searchQuery}"</p>
                                                <p className="text-sm mt-1">Try a different search term</p>
                        </div>
                                        ) : (
                                            Object.entries(filteredRegions).map(([category, categoryRegions]) => (
                  <div key={category}>
                    <div className="px-6 py-3 text-xs font-bold text-gray-200 uppercase tracking-wider bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10 flex items-center gap-2 sticky top-0 z-10">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                      {category}
                      <div className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                        {categoryRegions.length}
                    </div>
                    </div>
                    {categoryRegions.map((regionData) => (
                    <button
                        key={regionData.name}
                        onClick={() => handleRegionSelect(regionData.name)}
                        className={`w-full px-6 py-4 text-left hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0 group ${
                          region === regionData.name
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-l-4 border-purple-400'
                            : 'text-white hover:border-l-4 hover:border-white/30'
                        }`}
                      >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                region === regionData.name
                                                                    ? 'bg-purple-400'
                                                                    : 'bg-gray-400 group-hover:bg-white/60'
                                                            }`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-base truncate">{regionData.label}</div>
                                                                <div className="text-sm text-gray-400 truncate">{regionData.category}</div>
                    </div>
                    <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleBookmark(regionData.name);
                                                                }}
                                                                className={`transition-colors ${
                                                                    bookmarkedRegions.has(regionData.name)
                                                                        ? 'text-yellow-400 hover:text-yellow-300'
                                                                        : 'text-gray-400 hover:text-yellow-400'
                                                                }`}
                                                                title={bookmarkedRegions.has(regionData.name) ? "Remove from favorites" : "Add to favorites"}
                                                            >
                                                                {bookmarkedRegions.has(regionData.name) ? '⭐' : '☆'}
                    </button>
                                                            {region === regionData.name && (
                                                                <div className="text-purple-400 flex-shrink-0">
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                </div>
                                                            )}
                          </div>
                      </button>
                    ))}
                </div>
                ))
                                        )}
            </div>
          )}
        </div>
      </div>

        {/* Environmental Stats Panel */}
        {features && (
          <div className="max-w-4xl mx-auto mb-8 slide-in-up" style={{animationDelay: '0.9s'}}>
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              {/* Header with enhanced styling */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Environmental Statistics
              </span>
          </h2>
                    <p className="text-gray-400 text-sm">Real-time environmental data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400 bg-white/10 px-3 py-2 rounded-lg">
                    {lastUpdate ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
                  </div>
          <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${
                      autoRefresh 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
                  
                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (features && currentRegion) {
                          const exportData = DataExporter.formatDataForExport(currentRegion.label, features);
                          DataExporter.exportToCSV(exportData);
                        }
                      }}
                      className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      title="Export current region data as CSV"
                    >
                      📊 CSV
                    </button>
                    <button
                      onClick={() => {
                        if (features && currentRegion) {
                          const exportData = DataExporter.formatDataForExport(currentRegion.label, features);
                          DataExporter.exportToJSON(exportData);
                        }
                      }}
                      className="px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                      title="Export current region data as JSON"
                    >
                      📄 JSON
                    </button>
                </div>
              </div>
            </div>
            
              {/* Stats Grid with enhanced cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(features)
                      .filter(([key]) => key !== 'last_updated' && key !== 'location_name')
                      .slice(0, 12)
                  .map(([key, value], index) => (
                    <div 
                      key={key} 
                      className="glass-panel p-5 rounded-xl hover:scale-105 transition-all duration-300 group"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-300 font-medium text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                </div>
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                </div>
                      <div className="text-white font-bold text-2xl mb-1">
                        {typeof value === 'number' ? value.toFixed(1) : String(value)}
                        <span className="text-sm text-gray-400 ml-1">
                          {key === 'temperature' && '°C'}
                          {key === 'humidity' && '%'}
                          {key === 'wind_speed' && ' m/s'}
                          {key === 'pressure' && ' hPa'}
                          {key === 'precipitation' && ' mm'}
                          {key === 'uv_index' && ''}
                          {key === 'visibility_from_space' && ' km'}
                          {key === 'cloud_cover' && '%'}
                          {key === 'solar_radiation' && ' W/m²'}
                          {key === 'air_quality_index' && ''}
                          {key === 'co2_concentration' && ' ppm'}
                          {key === 'ozone_concentration' && ' ppm'}
                          {key === 'pollen_count' && ' grains/m³'}
                          {key === 'soil_moisture' && '%'}
                          {key === 'noise_level' && ' dB'}
                </span>
                </div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-1000"
                          style={{width: `${Math.min(100, Math.max(10, (typeof value === 'number' ? value : 0) * 2))}%`}}
                        ></div>
                </div>
              </div>
                  ))}
              </div>
              
              {/* Data Sources Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-lg">
                    🔗
                </div>
                  <h3 className="text-xl font-bold text-white">Data Sources</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                        🌡️
                </div>
                      <h4 className="font-semibold text-white">Weather & Climate</h4>
              </div>
                    <p className="text-sm text-gray-300 mb-2">Temperature, humidity, pressure, wind speed</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Open-Meteo</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">NOAA</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">WeatherAPI</span>
                </div>
              </div>
              
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">
                        🌱
                </div>
                      <h4 className="font-semibold text-white">Environmental</h4>
                </div>
                    <p className="text-sm text-gray-300 mb-2">Air quality, UV index, solar radiation</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">OpenWeatherMap</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">UV Index API</span>
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">EPA</span>
              </div>
            </div>
                  
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                        🌊
                  </div>
                      <h4 className="font-semibold text-white">Ocean & Coastal</h4>
                </div>
                    <p className="text-sm text-gray-300 mb-2">Sea temperature, tides, marine data</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">NOAA Tides</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Marine API</span>
                  </div>
                </div>
                
                  <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                        🛰️
                  </div>
                      <h4 className="font-semibold text-white">Satellite & Remote</h4>
                </div>
                    <p className="text-sm text-gray-300 mb-2">Satellite imagery, remote sensing data</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">NASA Earth</span>
                      <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full">ESA Copernicus</span>
                  </div>
                </div>
              </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">🔄</span>
                    <span>Data is updated every 30 seconds from multiple authoritative sources</span>
            </div>
                </div>
                    </div>
                  </div>
                    </div>
          )}

        {/* AI Narrative Panel */}
        {narrative && (
          <div className="max-w-4xl mx-auto mb-8 slide-in-up" style={{animationDelay: '1.2s'}}>
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              {/* Header with enhanced styling */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                        AI Environmental Narrative
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm">Powered by ANTHROPIC_Claude_4.5</p>
                    </div>
                </div>
                    <button
          onClick={async () => {
            if (features && currentRegion) {
              try {
                const newNarrative = await narrativeService.generateNarrative(features, currentRegion.label);
                setNarrative(newNarrative);
              } catch (error) {
                console.error('Failed to generate new narrative:', error);
              }
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 hover:border-purple-500/50 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
        >
          <span>🎲</span>
          Generate New
                    </button>
                  </div>

              {/* Narrative Content */}
              <div className="relative">
                <Suspense fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    <span className="ml-3 text-gray-400">Loading narrative...</span>
                </div>
                }>
                  <NarrativePanel narrative={narrative.narrative} environmentalData={features} />
                </Suspense>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-xl"></div>
          </div>
          </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}
    </div>
    </div>
  );
}

export default App;