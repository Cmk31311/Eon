import { EnvironmentalData } from '../services/environmentalDataService';

export interface ExportData {
  region: string;
  timestamp: string;
  data: EnvironmentalData;
}

export class DataExporter {
  static exportToCSV(data: ExportData): void {
    const csvContent = this.generateCSV(data);
    this.downloadFile(csvContent, `${data.region}_environmental_data.csv`, 'text/csv');
  }

  static exportToJSON(data: ExportData): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${data.region}_environmental_data.json`, 'application/json');
  }

  static exportAllRegionsToCSV(allData: ExportData[]): void {
    const csvContent = this.generateMultiRegionCSV(allData);
    this.downloadFile(csvContent, 'all_regions_environmental_data.csv', 'text/csv');
  }

  static exportAllRegionsToJSON(allData: ExportData[]): void {
    const jsonContent = JSON.stringify(allData, null, 2);
    this.downloadFile(jsonContent, 'all_regions_environmental_data.json', 'application/json');
  }

  private static generateCSV(data: ExportData): string {
    const headers = [
      'Region',
      'Timestamp',
      'Temperature (°C)',
      'Humidity (%)',
      'Pressure (hPa)',
      'Wind Speed (m/s)',
      'Wind Direction (°)',
      'Precipitation (mm)',
      'UV Index',
      'Visibility (km)',
      'Cloud Cover (%)',
      'Solar Radiation (W/m²)',
      'Air Quality Index',
      'CO2 Concentration (ppm)',
      'Ozone Concentration (ppm)',
      'Pollen Count (grains/m³)',
      'Soil Moisture (%)',
      'Noise Level (dB)'
    ];

    const values = [
      data.region,
      data.timestamp,
      data.data.temperature.toFixed(1),
      data.data.humidity.toFixed(1),
      data.data.pressure.toFixed(1),
      data.data.wind_speed.toFixed(1),
      data.data.wind_direction.toFixed(0),
      data.data.precipitation.toFixed(1),
      data.data.uv_index.toFixed(1),
      data.data.visibility_from_space.toFixed(1),
      data.data.cloud_cover.toFixed(1),
      data.data.solar_radiation.toFixed(0),
      data.data.air_quality_index.toFixed(0),
      data.data.co2_concentration.toFixed(0),
      data.data.ozone_concentration.toFixed(3),
      data.data.pollen_count.toFixed(0),
      data.data.soil_moisture.toFixed(1),
      data.data.noise_level.toFixed(0)
    ];

    return [headers.join(','), values.join(',')].join('\n');
  }

  private static generateMultiRegionCSV(allData: ExportData[]): string {
    const headers = [
      'Region',
      'Timestamp',
      'Temperature (°C)',
      'Humidity (%)',
      'Pressure (hPa)',
      'Wind Speed (m/s)',
      'Wind Direction (°)',
      'Precipitation (mm)',
      'UV Index',
      'Visibility (km)',
      'Cloud Cover (%)',
      'Solar Radiation (W/m²)',
      'Air Quality Index',
      'CO2 Concentration (ppm)',
      'Ozone Concentration (ppm)',
      'Pollen Count (grains/m³)',
      'Soil Moisture (%)',
      'Noise Level (dB)'
    ];

    const rows = allData.map(data => [
      data.region,
      data.timestamp,
      data.data.temperature.toFixed(1),
      data.data.humidity.toFixed(1),
      data.data.pressure.toFixed(1),
      data.data.wind_speed.toFixed(1),
      data.data.wind_direction.toFixed(0),
      data.data.precipitation.toFixed(1),
      data.data.uv_index.toFixed(1),
      data.data.visibility_from_space.toFixed(1),
      data.data.cloud_cover.toFixed(1),
      data.data.solar_radiation.toFixed(0),
      data.data.air_quality_index.toFixed(0),
      data.data.co2_concentration.toFixed(0),
      data.data.ozone_concentration.toFixed(3),
      data.data.pollen_count.toFixed(0),
      data.data.soil_moisture.toFixed(1),
      data.data.noise_level.toFixed(0)
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static formatDataForExport(region: string, data: EnvironmentalData): ExportData {
    return {
      region,
      timestamp: new Date().toISOString(),
      data
    };
  }
}
