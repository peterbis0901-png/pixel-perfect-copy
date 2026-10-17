import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GuideContent } from "@/routes/guide";
import { BedDouble, Bus, Landmark, MapPin, Utensils, Users } from "lucide-react";
import { DAY_TITLES, EVENTS, mapsLink, stopById, type EventType } from "@/data/tour";
import { useApp, useProgress } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { NarrationPlayer, ProgressCard } from "@/components/Widgets";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Itinerary Day 1–4 – Di Sản Bắc Bộ" },
      { name: "description", content: "Full day-by-day schedule: activities, meals and 3-star hotels for the heritage tour." },
      { property: "og:title", content: "Itinerary Day 1–4 – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Day-by-day timeline with live progress for the northern Vietnam heritage tour." },
    ],
  }),
  component: Itinerary,
});

const ICON: Record<EventType, typeof Bus> = { transport: Bus, activity: Landmark, meal: Utensils, hotel: BedDouble };

function Itinerary() {
  const { t, tr } = useApp();
  const { idx, current } = useProgress();
  const [day, setDay] = useState<1 | 2 | 3 | 4>(current?.day ?? 1);
  return (
    <div className="space-y-4">
      <ClockControls />
      <ProgressCard />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-4xl">{t("itinerary")}</h1>
        <div role="tablist" aria-label={t("day")} className="flex gap-1">
          {([1, 2, 3, 4] as const).map((d) => <Button key={d} variant="ghost" role="tab" id={`day-tab-${d}`} aria-selected={day === d} aria-controls="day-schedule" onClick={() => setDay(d)} className={`rounded-full px-3 py-1.5 text-sm ${day === d ? "bg-muted text-foreground" : "text-muted-foreground"}`}>{t("day")} {d}</Button>)}
        </div>
      </div>
      <div id="day-schedule" role="tabpanel" aria-labelledby={`day-tab-${day}`}>
        {[day].map((d) => (
          <section key={d} className="card-paper p-5">
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-display text-4xl" style={{ color: `var(--day-${d})` }}>{String(d).padStart(2, "0")}</span>
              <h2 className="text-xl">{tr(DAY_TITLES[d])}</h2>
            </div>
            <h3 className="mb-1 text-xl">{t("estimated")}</h3>
            <p className="mb-4 text-xs text-muted-foreground">{t("timingNote")}</p>
            <ol className="relative space-y-3 border-l-2 border-border pl-5">
              {EVENTS.map((ev, i) => ({ ev, i })).filter((x) => x.ev.day === d).map(({ ev, i }) => {
                const I = ICON[ev.type], done = i < idx, cur = i === idx;
                const stop = stopById(ev.stopId);
                return (
                  <li key={i} className={`relative ${done ? "opacity-55" : ""}`}>
                    <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card ${cur ? "bg-primary ring-4 ring-primary/25" : done ? "bg-muted-foreground" : "bg-border"}`} />
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">{ev.time}–{ev.end}</span>
                      <I className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1 text-sm">
                        <div className={cur ? "font-semibold text-primary" : ""}>{tr(ev.title)}</div>
                        {stop && <a href={mapsLink(stop)} target="_blank" rel="noopener noreferrer" aria-label={`${t("viewLocation")}: ${tr(stop.name)} (${t("newTab")})`} className="mt-0.5 mr-2 inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"><MapPin className="h-3 w-3" aria-hidden="true" />{t("viewLocation")}</a>}
                        {ev.assembly && <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-secondary"><Users className="h-3 w-3" />{tr(ev.assembly)}</div>}
                      </div>
                      {cur && <span className="chip ml-auto">{t("now")}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
      <NarrationPlayer day={day} />
      <GuideContent />
    </div>
  );
}
