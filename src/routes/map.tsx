import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";
import { STOPS, mapsLink, type Stop } from "@/data/tour";
import { useApp, useProgress } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { ListenButton } from "@/components/Widgets";
import hanoi from "@/assets/hanoi.jpg";
import trangan from "@/assets/trangan.jpg";
import halong from "@/assets/halong.jpg";

const TourMap = lazy(() => import("@/components/TourMap"));
const IMG = { hanoi, trangan, halong };

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Tour Map – Di Sản Bắc Bộ" },
      { name: "description", content: "Interactive route map from Tân Sơn Nhất to Hà Nội, Tràng An and Hạ Long Bay with every stop." },
      { property: "og:title", content: "Tour Map – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Follow every stop of the northern Vietnam heritage tour on an interactive map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { tr, t } = useApp();
  const { current } = useProgress();
  const [sel, setSel] = useState<Stop | null>(null);
  const labels = useCallback((s: Stop) => tr(s.name), [tr]);
  const descs = useCallback((s: Stop) => tr(s.desc), [tr]);
  const text = useMemo(() => ({ viewLocation: t("viewLocation"), newTab: t("newTab"), region: t("mapRegion"), offline: t("mapOffline"), routeList: t("routeList"), byFlight: t("byFlight"), byRoad: t("byRoad"), closePopup: t("closePopup"), day: t("day") }), [t]);
  const vl = (s: Stop) => `${t("viewLocation")}: ${tr(s.name)} (${t("newTab")})`;

  return (
    <div className="space-y-4">
      <ClockControls />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card-paper relative h-[62vh] overflow-hidden p-0">
          <ClientOnly fallback={<div className="h-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
              <TourMap currentStopId={current?.stopId} selectedId={sel?.id} onSelect={setSel} labels={labels} descs={descs} text={text} />
            </Suspense>
          </ClientOnly>
          {sel && (
            <div role="region" aria-live="polite" aria-label={tr(sel.name)} className="absolute inset-x-3 bottom-3 z-[500] card-paper overflow-hidden md:left-auto md:w-96">
              {sel.img && <img src={IMG[sel.img]} alt={tr(sel.name)} loading="lazy" className="h-36 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><div className="chip">{t("day")} {sel.day}</div><h3 className="mt-1 text-2xl">{tr(sel.name)}</h3></div>
                  <button type="button" aria-label={t("closePopup")} onClick={() => setSel(null)} className="grid min-h-11 min-w-11 place-items-center"><X className="h-5 w-5" aria-hidden="true" /></button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tr(sel.desc)}</p>
                <div className="mt-3 flex flex-wrap gap-2"><ListenButton text={`${tr(sel.name)}. ${tr(sel.desc)}`} /><a href={mapsLink(sel)} target="_blank" rel="noopener noreferrer" aria-label={vl(sel)} className="chip inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{t("viewLocation")}</a></div>
              </div>
            </div>
          )}
        </div>
        <ol aria-label={t("stopList")} className="card-paper max-h-[62vh] space-y-1 overflow-y-auto p-3">
          {STOPS.map((s, i) => (
            <li key={s.id}>
              <div className={`flex items-center gap-1 rounded-lg hover:bg-muted ${sel?.id === s.id ? "bg-muted" : ""}`}>
              <button type="button" onClick={() => setSel(s)} aria-pressed={sel?.id === s.id} aria-label={`${i + 1}. ${tr(s.name)}, ${t("day")} ${s.day}`} className="flex min-h-11 flex-1 items-center gap-3 p-2 text-left text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground" style={{ background: `var(--day-${s.day})` }}>{i + 1}</span>
                <span className="flex-1">{tr(s.name)}</span>
                {current?.stopId === s.id && <span className="h-2 w-2 animate-ping rounded-full bg-primary" />}
              </button>
              <a href={mapsLink(s)} target="_blank" rel="noopener noreferrer" title={t("viewLocation")} aria-label={vl(s)} className="mr-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-xs text-secondary hover:bg-background"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /><span className="hidden sm:inline">{t("viewLocation")}</span></a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
