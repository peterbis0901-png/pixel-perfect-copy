import { createServerFn } from "@tanstack/react-start";
import { CITIES } from "@/data/tour";

export type CityWeather = {
  id: keyof typeof CITIES;
  temp: number; humidity: number; code: number;
  daily: { date: string; max: number; min: number; code: number }[];
};

const mock = (): CityWeather[] =>
  (Object.keys(CITIES) as (keyof typeof CITIES)[]).map((id, i) => ({
    id, temp: 28 - i, humidity: 72 + i * 5, code: [2, 3, 1][i] ?? 1,
    daily: Array.from({ length: 4 }, (_, d) => ({ date: `D${d + 1}`, max: 31 - i, min: 24 - i, code: [1, 2, 61, 3][d] ?? 1 })),
  }));

/** Live weather from Open-Meteo (no key). Falls back to sample data on failure. */
export const getWeather = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const ids = Object.keys(CITIES) as (keyof typeof CITIES)[];
    const lat = ids.map((k) => CITIES[k].lat).join(","), lng = ids.map((k) => CITIES[k].lng).join(",");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&forecast_days=4`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`weather ${r.status}`);
    const arr = (await r.json()) as any[];
    const data: CityWeather[] = ids.map((id, i) => {
      const w = arr[i];
      return {
        id, temp: Math.round(w.current.temperature_2m), humidity: w.current.relative_humidity_2m, code: w.current.weather_code,
        daily: w.daily.time.map((date: string, d: number) => ({ date, max: Math.round(w.daily.temperature_2m_max[d]), min: Math.round(w.daily.temperature_2m_min[d]), code: w.daily.weather_code[d] })),
      };
    });
    return { live: true, data };
  } catch (e) {
    console.error(e);
    return { live: false, data: mock() };
  }
});
