// Google Maps tour map. The Maps JS API script is injected in useEffect, so SSR never touches `google`.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { FLIGHT_LEGS, STOPS, stopById, type Stop } from "@/data/tour";

type Props = { currentStopId?: string | undefined; selectedId?: string | undefined; onSelect: (s: Stop) => void; labels: (s: Stop) => string; descs: (s: Stop) => string; missingKey: string };

const env = import.meta.env as Record<string, string | undefined>;
const KEY = env["VITE_GOOGLE_MAPS_API_KEY"] || env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
const CHANNEL = env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];

let loader: Promise<any> | null = null;
function loadMaps(): Promise<any> {
  const w = window as any;
  if (w.google?.maps?.Map) return Promise.resolve(w.google);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    w.__initTourMap = () => resolve(w.google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async&callback=__initTourMap&v=weekly${CHANNEL ? `&channel=${CHANNEL}` : ""}`;
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error("Google Maps failed to load")); };
    document.head.appendChild(s);
  });
  return loader;
}

const pinSvg = (n: number, color: string, big: boolean) => {
  const sz = big ? 42 : 34;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz * 1.3}" viewBox="0 0 30 39"><path d="M15 38C15 38 28 23 28 14A13 13 0 0 0 2 14C2 23 15 38 15 38Z" fill="${color}" stroke="white" stroke-width="2"/><text x="15" y="18" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="white">${n}</text></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, sz };
};

export default function TourMap({ currentStopId, selectedId, onSelect, labels, descs, missingKey }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const info = useRef<any>(null);
  const here = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(KEY ? null : missingKey);

  useEffect(() => {
    if (!KEY || !el.current) return;
    let cancelled = false;
    loadMaps().then((g) => {
      if (cancelled || !el.current) return;
      const css = getComputedStyle(document.documentElement);
      const raw = (d: number) => css.getPropertyValue(`--day-${d}`).trim() || "#b33";
      // Resolve CSS colors (e.g. oklch) to rgb for Google Maps
      const probe = document.createElement("span"); document.body.appendChild(probe);
      const color = (d: number) => { probe.style.color = raw(d); return getComputedStyle(probe).color; };
      const m = new g.maps.Map(el.current, { center: { lat: 21, lng: 106.2 }, zoom: 8, clickableIcons: false, streetViewControl: false, mapTypeControl: true, fullscreenControl: true, gestureHandling: "greedy" });
      map.current = m;
      info.current = new g.maps.InfoWindow();
      const isFlight = (a: string, b: string) => FLIGHT_LEGS.some(([x, y]) => x === a && y === b);
      for (let i = 1; i < STOPS.length; i++) {
        const a = STOPS[i - 1]!, b = STOPS[i]!, flight = isFlight(a.id, b.id), c = color(b.day);
        new g.maps.Polyline({
          map: m, path: [{ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }], geodesic: true,
          strokeColor: c, strokeOpacity: flight ? 0 : 0.9, strokeWeight: 4,
          icons: flight ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, strokeColor: c, scale: 3 }, offset: "0", repeat: "14px" }] : [{ icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: c, fillColor: c, fillOpacity: 1 }, offset: "55%" }],
        });
      }
      const bounds = new g.maps.LatLngBounds();
      STOPS.forEach((s, i) => {
        const p = pinSvg(i + 1, color(s.day), false);
        const mk = new g.maps.Marker({ map: m, position: { lat: s.lat, lng: s.lng }, title: labels(s), icon: { url: p.url, scaledSize: new g.maps.Size(p.sz, p.sz * 1.3), anchor: new g.maps.Point(p.sz / 2, p.sz * 1.3) }, zIndex: 10 + i });
        mk.addListener("click", () => onSelect(s));
        markers.current[s.id] = mk;
        if (s.city !== "hcm") bounds.extend({ lat: s.lat, lng: s.lng });
      });
      probe.remove();
      m.fitBounds(bounds, 40);
      setReady(true);
    }).catch((e) => setErr(String(e.message || e)));
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { STOPS.forEach((s) => markers.current[s.id]?.setTitle(labels(s))); }, [labels, ready]);

  // "Group is here" pulse
  useEffect(() => {
    const g = (window as any).google; if (!ready || !g) return;
    here.current?.setMap(null);
    const s = stopById(currentStopId); if (!s) return;
    here.current = new g.maps.Marker({ map: map.current, position: { lat: s.lat, lng: s.lng }, clickable: false, zIndex: 1, icon: { path: g.maps.SymbolPath.CIRCLE, scale: 22, fillColor: "#c0392b", fillOpacity: 0.3, strokeColor: "#c0392b", strokeWeight: 2 } });
  }, [currentStopId, ready]);

  // Selected stop: smooth pan/zoom + InfoWindow
  useEffect(() => {
    const s = stopById(selectedId), m = map.current;
    if (!ready || !m) return;
    if (!s) { info.current?.close(); return; }
    m.panTo({ lat: s.lat, lng: s.lng });
    const target = s.city === "hcm" ? 11 : 14;
    if (m.getZoom() < target) setTimeout(() => m.setZoom(target), 350);
    const box = document.createElement("div");
    box.style.maxWidth = "220px"; box.style.color = "#222";
    const h = document.createElement("strong"); h.textContent = labels(s);
    const p = document.createElement("div"); p.style.fontSize = "12px"; p.style.marginTop = "4px"; p.textContent = descs(s);
    box.append(h, p);
    info.current.setContent(box);
    info.current.open({ map: m, anchor: markers.current[s.id] });
  }, [selectedId, ready, labels, descs]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" />
      {err && <div className="absolute inset-0 grid place-items-center bg-muted p-6 text-center text-sm text-muted-foreground">{err}</div>}
    </div>
  );
}
