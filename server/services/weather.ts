/**
 * Weather service using Open-Meteo (https://open-meteo.com).
 * No API key required. Returns current conditions + 5-day daily forecast.
 */

export interface CurrentWeather {
  temperature: number;   // °C
  windspeed: number;     // km/h
  precipitation: number; // mm in last hour
  weathercode: number;
  condition: string;
}

export interface DailyForecast {
  date: string;          // YYYY-MM-DD
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number; // %
  weathercode: number;
  condition: string;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

const WMO_CODES: Record<number, string> = {
  0:  "Clear sky",
  1:  "Mainly clear",
  2:  "Partly cloudy",
  3:  "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export function wmoDescription(code: number): string {
  return WMO_CODES[code] ?? "Unknown";
}

export async function getWeatherForLocation(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude:  String(lat),
    longitude: String(lng),
    current:   "temperature_2m,precipitation,windspeed_10m,weathercode",
    daily:     "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode",
    forecast_days: "5",
    timezone:  "auto",
  });

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      headers: { "User-Agent": "MotoRoute-Europe/1.0" },
    });

    if (!res.ok) {
      console.error("[Weather] Open-Meteo error:", res.status);
      return null;
    }

    const json = await res.json();

    const current: CurrentWeather = {
      temperature:   Math.round(json.current.temperature_2m),
      windspeed:     Math.round(json.current.windspeed_10m),
      precipitation: json.current.precipitation ?? 0,
      weathercode:   json.current.weathercode,
      condition:     wmoDescription(json.current.weathercode),
    };

    const daily: DailyForecast[] = (json.daily.time as string[]).map(
      (date: string, i: number) => ({
        date,
        tempMax:                 Math.round(json.daily.temperature_2m_max[i]),
        tempMin:                 Math.round(json.daily.temperature_2m_min[i]),
        precipitationSum:        Math.round(json.daily.precipitation_sum[i] * 10) / 10,
        precipitationProbability: json.daily.precipitation_probability_max[i] ?? 0,
        weathercode:             json.daily.weathercode[i],
        condition:               wmoDescription(json.daily.weathercode[i]),
      })
    );

    return { current, daily };
  } catch (err) {
    console.error("[Weather] Fetch failed:", err);
    return null;
  }
}