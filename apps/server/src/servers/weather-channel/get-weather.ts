export interface WeatherLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface WeatherDetails {
  location: string;
  temperature: number;
  temperatureUnit: "celsius" | "fahrenheit";
  condition: string;
  humidity: number;
  windSpeed: number;
  windSpeedUnit: "mph" | "kmh";
  feelsLike: number;
  precipitation: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  timestamp: Date;
}

/**
 * Mock function to get weather details for a given location
 * @param location - The location to get weather for
 * @returns Weather details for the specified location
 */
export function getWeather(location: WeatherLocation | string): WeatherDetails {
  const locationStr =
    typeof location === "string"
      ? location
      : `${location.city}${location.state ? `, ${location.state}` : ""}${
          location.country ? `, ${location.country}` : ""
        }`;

  // Mock weather data
  const mockWeatherConditions = [
    "Sunny",
    "Partly Cloudy",
    "Cloudy",
    "Rainy",
    "Thunderstorm",
    "Snowy",
    "Foggy",
    "Clear",
  ];

  // Generate pseudo-random but consistent data based on location string
  const seed = locationStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    location: locationStr,
    temperature: 15 + (seed % 20),
    temperatureUnit: "celsius",
    condition: mockWeatherConditions[seed % mockWeatherConditions.length],
    humidity: 40 + (seed % 50),
    windSpeed: 5 + (seed % 25),
    windSpeedUnit: "kmh",
    feelsLike: 14 + (seed % 20),
    precipitation: (seed % 10) / 10,
    uvIndex: 1 + (seed % 10),
    visibility: 8 + (seed % 5),
    pressure: 1000 + (seed % 50),
    timestamp: new Date(),
  };
}
