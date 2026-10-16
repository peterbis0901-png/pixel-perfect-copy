// Leaflet + OpenStreetMap tour map. Leaflet is imported inside useEffect, so SSR never touches `window`.
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { FLIGHT_LEGS, STOPS, mapsLink, stopById, type Stop } from "@/data/tour";

type Props = { currentStopId?: string | undefined; selectedId?: string | undefined; onSelect: (s: Stop) => void; labels: (s: Stop) => string; descs: (s: Stop) => string; missingKey: string; viewLabel: string };

const pinHtml = (n: number, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 30 39"><path d="M15 38C15 38 28 23 28 14A13 13 0 0 0 2 14C2 23 15 38 15 38Z" fill="${color}" stroke="white" stroke-width="2"/><text x="15" y="18" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="white">${n}</text></svg>`;

export default function TourMap({ currentStopId, selectedId, onSelect, labels, descs, missingKey, viewLabel }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Record<string, Leaflet.Marker>>({});
  const here = useRef<Leaflet.CircleMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const popup = (s: Stop) => {
    const box = document.createElement("div");
    box.style.maxWidth = "220px";
    const h = document.createElement("strong"); h.textContent = labels(s);
    const p = document.createElement("div"); p.style.fontSize = "12px"; p.style.margin = "4px 0 6px"; p.textContent = descs(s);
    const a = document.createElement("a"); a.href = mapsLink(s); a.target = "_blank"; a.rel = "noopener noreferrer";
    a.textContent = `📍 ${viewLabel}`; a.style.fontWeight = "600"; a.style.fontSize = "12px";
    box.append(h, p, a);
    return box;
  };

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      const Lf = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current) return;
      L.current = Lf;
      const css = getComputedStyle(document.documentElement);
      const probe = document.createElement("span"); document.body.appendChild(probe);
      const color = (d: number) => { probe.style.color = css.getPropertyValue(`--day-${d}`).trim() || "#b33"; return getComputedStyle(probe).color; };
      const m = Lf.map(el.current, { center: [21, 106.2], zoom: 8 });
      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(m);
      map.current = m;
      const isFlight = (a: string, b: string) => FLIGHT_LEGS.some(([x, y]) => x === a && y === b);
      for (let i = 1; i < STOPS.length; i++) {
        const a = STOPS[i - 1]!, b = STOPS[i]!, flight = isFlight(a.id, b.id);
        Lf.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: color(b.day), weight: 4, opacity: 0.9, dashArray: flight ? "8 10" : undefined }).addTo(m);
      }
      const bounds = Lf.latLngBounds([]);
      STOPS.forEach((s, i) => {
        const icon = Lf.divIcon({ html: pinHtml(i + 1, color(s.day)), className: "", iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40] });
        const mk = Lf.marker([s.lat, s.lng], { icon, title: labels(s), zIndexOffset: 10 + i }).addTo(m);
        mk.on("click", () => onSelect(s));
        markers.current[s.id] = mk;
        if (s.city !== "hcm") bounds.extend([s.lat, s.lng]);
      });
      probe.remove();
      m.fitBounds(bounds, { padding: [40, 40] });
      setReady(true);
    }).catch(() => setErr(missingKey));
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Group is here" pulse
  useEffect(() => {
    const Lf = L.current; if (!ready || !Lf || !map.current) return;
    here.current?.remove();
    const s = stopById(currentStopId); if (!s) return;
    here.current = Lf.circleMarker([s.lat, s.lng], { radius: 22, color: "#c0392b", weight: 2, fillColor: "#c0392b", fillOpacity: 0.3, interactive: false }).addTo(map.current);
  }, [currentStopId, ready]);

  // Selected stop: fly to + popup
  useEffect(() => {
    const s = stopById(selectedId), m = map.current;
    if (!ready || !m) return;
    if (!s) { m.closePopup(); return; }
    const target = s.city === "hcm" ? 11 : 14;
    m.flyTo([s.lat, s.lng], Math.max(m.getZoom(), target), { duration: 0.8 });
    markers.current[s.id]?.bindPopup(popup(s)).openPopup();
  }, [selectedId, ready, labels, descs, viewLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="z-0 h-full w-full" />
      {err && <div className="absolute inset-0 grid place-items-center bg-muted p-6 text-center text-sm text-muted-foreground">{err}</div>}
    </div>
  );
}
