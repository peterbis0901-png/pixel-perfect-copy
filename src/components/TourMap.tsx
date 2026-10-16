// Leaflet + OpenStreetMap tour map. Leaflet is imported inside useEffect, so SSR never touches `window`.
// Accessible: markers are keyboard-focusable buttons with labels; a text route list is always available
// to screen readers and becomes visible when tiles (or Leaflet itself) fail to load.
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, WifiOff } from "lucide-react";
import { FLIGHT_LEGS, STOPS, mapsLink, stopById, type Stop } from "@/data/tour";

export type MapText = { viewLocation: string; newTab: string; region: string; offline: string; routeList: string; byFlight: string; byRoad: string; closePopup: string; day: string };
type Props = { currentStopId?: string | undefined; selectedId?: string | undefined; onSelect: (s: Stop) => void; labels: (s: Stop) => string; descs: (s: Stop) => string; text: MapText };

const pinHtml = (n: number, color: string) =>
  `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 30 39"><path d="M15 38C15 38 28 23 28 14A13 13 0 0 0 2 14C2 23 15 38 15 38Z" fill="${color}" stroke="white" stroke-width="2"/><text x="15" y="18" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="white">${n}</text></svg>`;

const isFlight = (a: string, b: string) => FLIGHT_LEGS.some(([x, y]) => x === a && y === b);

export default function TourMap({ currentStopId, selectedId, onSelect, labels, descs, text }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const L = useRef<typeof Leaflet | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const markers = useRef<Record<string, Leaflet.Marker>>({});
  const here = useRef<Leaflet.CircleMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tilesDown, setTilesDown] = useState(false);
  const fallback = failed || tilesDown;

  const markerLabel = (s: Stop, i: number) => `${i + 1}. ${labels(s)}, ${text.day} ${s.day}`;

  const popup = (s: Stop) => {
    const box = document.createElement("div");
    box.style.maxWidth = "220px";
    const h = document.createElement("strong"); h.textContent = labels(s); h.id = `pop-${s.id}`;
    const p = document.createElement("div"); p.style.fontSize = "12px"; p.style.margin = "4px 0 6px"; p.textContent = descs(s);
    const a = document.createElement("a"); a.href = mapsLink(s); a.target = "_blank"; a.rel = "noopener noreferrer";
    a.textContent = `📍 ${text.viewLocation}`; a.style.fontWeight = "600"; a.style.fontSize = "12px";
    a.setAttribute("aria-label", `${text.viewLocation}: ${labels(s)} (${text.newTab})`);
    box.setAttribute("role", "dialog"); box.setAttribute("aria-labelledby", h.id);
    box.append(h, p, a);
    return box;
  };

  useEffect(() => {
    let cancelled = false;
    const goOffline = () => setTilesDown(true);
    const goOnline = () => setTilesDown(false);
    if (!navigator.onLine) setTilesDown(true);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    import("leaflet").then((mod) => {
      const Lf = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      if (cancelled || !el.current) return;
      L.current = Lf;
      const css = getComputedStyle(document.documentElement);
      const probe = document.createElement("span"); document.body.appendChild(probe);
      const color = (d: number) => { probe.style.color = css.getPropertyValue(`--day-${d}`).trim() || "#b33"; return getComputedStyle(probe).color; };
      const m = Lf.map(el.current, { center: [21, 106.2], zoom: 8, keyboard: true });
      let loaded = 0, errors = 0;
      Lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" })
        .on("tileload", () => { loaded++; if (navigator.onLine) setTilesDown(false); })
        .on("tileerror", () => { errors++; if (errors >= 3 && loaded === 0) setTilesDown(true); })
        .addTo(m);
      map.current = m;
      for (let i = 1; i < STOPS.length; i++) {
        const a = STOPS[i - 1]!, b = STOPS[i]!, flight = isFlight(a.id, b.id);
        Lf.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: color(b.day), weight: 4, opacity: 0.9, dashArray: flight ? "8 10" : undefined, interactive: false }).addTo(m);
      }
      const bounds = Lf.latLngBounds([]);
      STOPS.forEach((s, i) => {
        const icon = Lf.divIcon({ html: pinHtml(i + 1, color(s.day)), className: "tour-pin", iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -40] });
        const mk = Lf.marker([s.lat, s.lng], { icon, keyboard: true, title: labels(s), zIndexOffset: 10 + i, riseOnHover: true }).addTo(m);
        mk.on("click", () => onSelect(s));
        const node = mk.getElement();
        if (node) {
          node.setAttribute("role", "button");
          node.setAttribute("aria-label", markerLabel(s, i));
          // Leaflet handles Enter; add Space for button semantics.
          node.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); onSelect(s); } });
        }
        markers.current[s.id] = mk;
        if (s.city !== "hcm") bounds.extend([s.lat, s.lng]);
      });
      // Popup a11y: label close button, move focus into the popup, return it to the marker on close.
      m.on("popupopen", (e) => {
        const root = e.popup.getElement();
        root?.querySelector(".leaflet-popup-close-button")?.setAttribute("aria-label", text.closePopup);
        (root?.querySelector("a[target=_blank]") as HTMLElement | null)?.focus({ preventScroll: true });
      });
      m.on("popupclose", (e) => {
        const src = (e.popup as unknown as { _source?: Leaflet.Marker })._source;
        src?.getElement()?.focus({ preventScroll: true });
      });
      probe.remove();
      m.fitBounds(bounds, { padding: [40, 40] });
      setReady(true);
    }).catch(() => setFailed(true));
    return () => {
      cancelled = true;
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      map.current?.remove(); map.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep marker labels in the current language
  useEffect(() => {
    STOPS.forEach((s, i) => {
      const n = markers.current[s.id]?.getElement();
      n?.setAttribute("aria-label", markerLabel(s, i)); n?.setAttribute("title", labels(s));
    });
  }, [labels, ready, text.day]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [selectedId, ready, labels, descs, text]); // eslint-disable-line react-hooks/exhaustive-deps

  const legs = STOPS.slice(1).map((b, i) => ({ a: STOPS[i]!, b, flight: isFlight(STOPS[i]!.id, b.id) }));

  return (
    <div className="relative h-full w-full">
      <div ref={el} role="region" aria-label={text.region} className={`z-0 h-full w-full ${fallback ? "bg-muted" : ""}`} />
      {/* Text route: always readable by screen readers, shown visually when the map can't load */}
      <div className={fallback ? "absolute inset-0 z-[450] overflow-y-auto bg-card/95 p-4" : "sr-only"} aria-live="polite">
        {fallback && <p role="status" className="mb-3 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm"><WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{text.offline}</p>}
        <h3 className="mb-2 text-lg">{text.routeList}</h3>
        <ol className="space-y-2 text-sm">
          {legs.map(({ a, b, flight }, i) => (
            <li key={b.id} className="flex flex-wrap items-center gap-2 border-l-4 pl-3" style={{ borderColor: `var(--day-${b.day})` }}>
              <button type="button" onClick={() => onSelect(b)} className="text-left underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                {text.day} {b.day}: {i + 1}. {labels(a)} → {i + 2}. {labels(b)}
              </button>
              <span className="text-xs text-muted-foreground">({flight ? text.byFlight : text.byRoad})</span>
              <a href={mapsLink(b)} target="_blank" rel="noopener noreferrer" aria-label={`${text.viewLocation}: ${labels(b)} (${text.newTab})`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <MapPin className="h-3 w-3" aria-hidden="true" />{text.viewLocation}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
