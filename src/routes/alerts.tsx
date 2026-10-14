import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { fmtCountdown, useApp, useProgress } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { NextAssembly } from "@/components/Widgets";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Meeting Times – Di Sản Bắc Bộ" },
      { name: "description", content: "Countdowns and alerts for every group assembly: flights, hotel departures and boat boarding." },
      { property: "og:title", content: "Meeting Times – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Never miss a group meeting time on the heritage tour." },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { t, tr, now } = useApp();
  const { assemblies } = useProgress();
  const [perm, setPerm] = useState<string>("default");
  useEffect(() => { if (typeof Notification !== "undefined") setPerm(Notification.permission); }, []);

  const enable = async () => {
    if (typeof Notification === "undefined") return toast.error("Notifications not supported");
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") new Notification(t("notifOn"), { body: "Di Sản Bắc Bộ" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-4xl">{t("alerts")}</h1>
        <button onClick={enable} className={perm === "granted" ? "btn-ghost" : "btn-primary"}>
          {perm === "granted" ? <Check className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}{perm === "granted" ? t("notifOn") : t("enableNotif")}
        </button>
      </div>
      <ClockControls />
      <NextAssembly />
      <ul className="grid gap-3 md:grid-cols-2">
        {assemblies.map(({ ev, at }, i) => {
          const ms = at - now, past = ms <= 0, soon = !past && ms < 30 * 60e3;
          return (
            <li key={i} className={`card-paper flex items-center gap-4 p-4 ${past ? "opacity-50" : ""} ${soon ? "ring-2 ring-destructive" : ""}`}>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">{t("day")} {ev.day}</div>
                <div className="font-display text-3xl tabular-nums">{ev.time}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{tr(ev.title)}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{tr(ev.assembly!)}</div>
              </div>
              <span className={past ? "chip-muted" : "chip tabular-nums"}>{past ? t("done") : fmtCountdown(ms)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
