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
    <div className="px-3 py-2.5 border-b border-slate-700/60 last:border-b-0 text-xs">
      {state.status === "idle" && (
        <button
          onClick={fetchWeather}
          className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
          Check weather at {locationName}
        </button>
      )}

      {state.status === "loading" && (
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Fetching weather for {locationName}…
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-center gap-2 text-red-400">
          <span>Could not load weather</span>
          <button onClick={fetchWeather} className="text-orange-400 hover:text-orange-300 transition">Retry</button>
        </div>
      )}

      {state.status === "loaded" && (
        <div className="space-y-2">
          {/* City label + current conditions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-30 h-30 flex items-center justify-center text-xl overflow-hidden shrink-0">
                <span className="inline-block -translate-x-0.5">{weatherEmoji(state.data.current.weathercode)}</span>
              </span>
              <div>
                <div className="font-semibold text-white">{locationName}</div>
                <div className="text-slate-400">
                  {state.data.current.temperature}°C · {state.data.current.condition}
                </div>
                <div className="text-slate-500">
                  Wind {state.data.current.windspeed} km/h
                  {state.data.current.precipitation > 0 && ` · ${state.data.current.precipitation}mm`}
                </div>
                {windWarning(state.data.current.windspeed) && (
                  <div className="text-orange-400 font-medium mt-0.5">
                    {windWarning(state.data.current.windspeed)}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setState({ status: "idle" })}
              className="text-slate-600 hover:text-slate-400 self-start ml-2 transition"
              title="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* 5-day forecast */}
          <div className="grid grid-cols-5 gap-1">
            {state.data.daily.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center bg-slate-700/50 border border-slate-600/50 rounded-md p-1.5 text-center"
              >
                <div className="text-slate-500 text-[10px]">{formatDate(day.date).split(" ")[0]}</div>
                <div className="w-6 h-6 flex items-center justify-center overflow-hidden my-0.5 text-base">
                  <span className="inline-block -translate-x-0.5">{weatherEmoji(day.weathercode)}</span>
                </div>
                <div className="font-semibold text-white">{day.tempMax}°</div>
                <div className="text-slate-400">{day.tempMin}°</div>
                {day.precipitationProbability > 20 && (
                  <div className="text-blue-400 text-[10px]">{day.precipitationProbability}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
