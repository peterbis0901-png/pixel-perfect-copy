import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { X } from "lucide-react";
import { STOPS, type Stop } from "@/data/tour";
import { useApp, useProgress } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { ListenButton } from "@/components/Widgets";
import hanoi from "@/assets/hanoi.jpg";
import trangan from "@/assets/trangan.jpg";
import halong from "@/assets/halong.jpg";

const TourMap = lazy(() => import("@/components/TourMap.client"));
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

  return (
    <div className="space-y-4">
      <ClockControls />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card-paper relative h-[62vh] overflow-hidden p-0">
          <ClientOnly fallback={<div className="h-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
              <TourMap currentStopId={current?.stopId} selectedId={sel?.id} onSelect={setSel} labels={labels} />
            </Suspense>
          </ClientOnly>
          {sel && (
            <div className="absolute inset-x-3 bottom-3 z-[500] card-paper overflow-hidden md:left-auto md:w-96">
              {sel.img && <img src={IMG[sel.img]} alt={tr(sel.name)} loading="lazy" className="h-36 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><div className="chip">{t("day")} {sel.day}</div><h3 className="mt-1 text-2xl">{tr(sel.name)}</h3></div>
                  <button aria-label="Close" onClick={() => setSel(null)}><X className="h-5 w-5" /></button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tr(sel.desc)}</p>
                <div className="mt-3"><ListenButton text={`${tr(sel.name)}. ${tr(sel.desc)}`} /></div>
              </div>
            </div>
          )}
        </div>
        <ol className="card-paper max-h-[62vh] space-y-1 overflow-y-auto p-3">
          {STOPS.map((s, i) => (
            <li key={s.id}>
              <button onClick={() => setSel(s)} className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-muted ${sel?.id === s.id ? "bg-muted" : ""}`}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground" style={{ background: `var(--day-${s.day})` }}>{i + 1}</span>
                <span className="flex-1">{tr(s.name)}</span>
                {current?.stopId === s.id && <span className="h-2 w-2 animate-ping rounded-full bg-primary" />}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
