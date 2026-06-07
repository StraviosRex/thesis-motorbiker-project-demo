import { useState } from "react";
import { Coordinates } from "@/lib/utils";

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  precipitation: number;
  weathercode: number;
  condition: string;
}

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  weathercode: number;
  condition: string;
}

interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; data: WeatherData }
  | { status: "error" };

interface WeatherWidgetProps {
  locationName: string;
  coordinates: Coordinates;
}

function weatherEmoji(code: number): string {
  if (code === 0)              return "☀️";
  if (code <= 2)               return "🌤️";
  if (code === 3)              return "☁️";
  if (code <= 48)              return "🌫️";
  if (code <= 57)              return "🌦️";
  if (code <= 67)              return "🌧️";
  if (code <= 77)              return "❄️";
  if (code <= 82)              return "🌦️";
  if (code <= 86)              return "🌨️";
  return "⛈️";
}

function windWarning(kmh: number): string | null {
  if (kmh >= 75) return "⚠️ Storm-force winds — avoid riding";
  if (kmh >= 50) return "⚠️ Strong winds — ride with caution";
  if (kmh >= 30) return "Breezy";
  return null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
}

export function WeatherWidget({ locationName, coordinates }: WeatherWidgetProps) {
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  async function fetchWeather() {
    setState({ status: "loading" });
    try {
      const params = new URLSearchParams({
        lat: String(coordinates.lat),
        lng: String(coordinates.lng),
      });
      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) throw new Error();
      const data: WeatherData = await res.json();
      setState({ status: "loaded", data });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <div className="text-xs">
      {state.status === "idle" && (
        <button
          onClick={fetchWeather}
          className="text-blue-600 hover:underline"
        >
          Check weather at {locationName}
        </button>
      )}

      {state.status === "loading" && (
        <div className="flex items-center gap-1 text-gray-400">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Fetching weather…
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-center gap-2 text-red-500">
          <span>Could not load weather</span>
          <button onClick={fetchWeather} className="text-blue-600 hover:underline">Retry</button>
        </div>
      )}

      {state.status === "loaded" && (
        <div className="mt-1 space-y-2">
          {/* Current conditions */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md p-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{weatherEmoji(state.data.current.weathercode)}</span>
              <div>
                <div className="font-medium text-gray-800">
                  {state.data.current.temperature}°C · {state.data.current.condition}
                </div>
                <div className="text-gray-500">
                  Wind {state.data.current.windspeed} km/h
                  {state.data.current.precipitation > 0 && ` · ${state.data.current.precipitation}mm`}
                </div>
                {windWarning(state.data.current.windspeed) && (
                  <div className="text-orange-600 font-medium mt-0.5">
                    {windWarning(state.data.current.windspeed)}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setState({ status: "idle" })}
              className="text-gray-400 hover:text-gray-600 ml-2 self-start"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* 5-day forecast */}
          <div className="grid grid-cols-5 gap-1">
            {state.data.daily.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center bg-white border border-gray-100 rounded p-1 text-center"
              >
                <div className="text-gray-500 text-[10px]">{formatDate(day.date).split(" ")[0]}</div>
                <div className="text-base leading-none my-0.5">{weatherEmoji(day.weathercode)}</div>
                <div className="font-medium text-gray-800">{day.tempMax}°</div>
                <div className="text-gray-400">{day.tempMin}°</div>
                {day.precipitationProbability > 20 && (
                  <div className="text-blue-500 text-[10px]">{day.precipitationProbability}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}