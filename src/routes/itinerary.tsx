import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Bus, Landmark, Utensils, Users } from "lucide-react";
import { EVENTS, type EventType } from "@/data/tour";
import { useApp, useProgress } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { ProgressCard } from "@/components/Widgets";

export const Route = createFileRoute("/itinerary")({
  head: () => ({
    meta: [
      { title: "Itinerary Day 1–4 – Di Sản Bắc Bộ" },
      { name: "description", content: "Full day-by-day schedule: activities, meals and 3-star hotels for the heritage tour." },
      { property: "og:title", content: "Itinerary Day 1–4 – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Day-by-day timeline with live progress for the northern Vietnam heritage tour." },
    ],
  }),
  component: Itinerary,
});

const ICON: Record<EventType, typeof Bus> = { transport: Bus, activity: Landmark, meal: Utensils, hotel: BedDouble };
const DAYS = {
  1: { en: "SGN → Hà Nội · Capital heritage", vi: "SGN → Hà Nội · Di sản Thủ đô" },
  2: { en: "Ninh Bình · Tràng An → Hạ Long", vi: "Ninh Bình · Tràng An → Hạ Long" },
  3: { en: "Hạ Long Bay cruise → Hà Nội", vi: "Du thuyền vịnh Hạ Long → Hà Nội" },
  4: { en: "Old Quarter → SGN", vi: "Phố cổ → SGN" },
};

function Itinerary() {
  const { t, tr } = useApp();
  const { idx } = useProgress();
  return (
    <div className="space-y-4">
      <ClockControls />
      <ProgressCard />
      <div className="grid gap-4 md:grid-cols-2">
        {([1, 2, 3, 4] as const).map((d) => (
          <section key={d} className="card-paper p-5">
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-display text-4xl" style={{ color: `var(--day-${d})` }}>{String(d).padStart(2, "0")}</span>
              <h2 className="text-xl">{tr(DAYS[d])}</h2>
            </div>
            <ol className="relative space-y-3 border-l-2 border-border pl-5">
              {EVENTS.map((ev, i) => ({ ev, i })).filter((x) => x.ev.day === d).map(({ ev, i }) => {
                const I = ICON[ev.type], done = i < idx, cur = i === idx;
                return (
                  <li key={i} className={`relative ${done ? "opacity-55" : ""}`}>
                    <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card ${cur ? "bg-primary ring-4 ring-primary/25" : done ? "bg-muted-foreground" : "bg-border"}`} />
                    <div className="flex items-start gap-2">
                      <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">{ev.time}</span>
                      <I className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="text-sm">
                        <div className={cur ? "font-semibold text-primary" : ""}>{tr(ev.title)}</div>
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
    </div>
  );
}
