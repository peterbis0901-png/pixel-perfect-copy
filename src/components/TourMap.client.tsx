// Client-only Leaflet map. Loaded lazily so SSR never imports Leaflet.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FLIGHT_LEGS, STOPS, stopById, type Stop } from "@/data/tour";

type Props = { currentStopId?: string | undefined; selectedId?: string | undefined; onSelect: (s: Stop) => void; labels: (s: Stop) => string };

export default function TourMap({ currentStopId, selectedId, onSelect, labels }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});
  const here = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView([21.0, 106.2], 8);
    map.current = m;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(m);
    const css = getComputedStyle(document.documentElement);
    const color = (d: number) => css.getPropertyValue(`--day-${d}`).trim() || "#b33";

    // Ground route per day (skip flight legs, drawn dashed separately)
    const isFlight = (a: string, b: string) => FLIGHT_LEGS.some(([x, y]) => x === a && y === b);
    for (let i = 1; i < STOPS.length; i++) {
      const a = STOPS[i - 1]!, b = STOPS[i]!;
      const flight = isFlight(a.id, b.id);
      L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: color(b.day), weight: flight ? 2 : 4, dashArray: flight ? "6 8" : undefined, opacity: 0.9 }).addTo(m);
    }
    STOPS.forEach((s, i) => {
      const icon = L.divIcon({ className: "", html: `<div class="tour-pin" style="--c:${color(s.day)}"><span>${i + 1}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
      const mk = L.marker([s.lat, s.lng], { icon, title: labels(s) }).addTo(m).on("click", () => onSelect(s));
      mk.bindTooltip(labels(s), { direction: "top", offset: [0, -14] });
      markers.current[s.id] = mk;
    });
    m.fitBounds(L.latLngBounds(STOPS.filter((s) => s.city !== "hcm").map((s) => [s.lat, s.lng])), { padding: [30, 30] });
    return () => { m.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    STOPS.forEach((s) => markers.current[s.id]?.setTooltipContent(labels(s)));
  }, [labels]);

  // "Group is here" pulse marker
  useEffect(() => {
    const m = map.current; if (!m) return;
    here.current?.remove(); here.current = null;
    const s = stopById(currentStopId); if (!s) return;
    here.current = L.marker([s.lat, s.lng], { icon: L.divIcon({ className: "", html: `<div class="tour-here"></div>`, iconSize: [56, 56], iconAnchor: [28, 28] }), interactive: false, zIndexOffset: -10 }).addTo(m);
  }, [currentStopId]);

  useEffect(() => {
    const s = stopById(selectedId);
    if (s && map.current) map.current.flyTo([s.lat, s.lng], Math.max(map.current.getZoom(), s.city === "hcm" ? 10 : 13), { duration: 0.8 });
  }, [selectedId]);

  return <div ref={el} className="h-full w-full" />;
}
