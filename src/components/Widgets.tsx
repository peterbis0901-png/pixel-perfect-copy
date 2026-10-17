import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Droplets, Volume2, Square, MapPin, Headphones, Play, BellRing, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { CITIES, EVENTS, GUIDE, eventTime, stopById, type TourEvent } from "@/data/tour";
import { getWeather } from "@/lib/weather.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { emitNarration, fmtCountdown, onNarration, speak, useApp, useProgress } from "@/lib/app-state";

export function WeatherIcon({ code, className = "h-6 w-6" }: { code: number; className?: string }) {
  const I = code === 0 ? Sun : code <= 2 ? CloudSun : code <= 48 ? Cloud : code >= 95 ? CloudLightning : CloudRain;
  return <I className={className} />;
}

export function WeatherWidget() {
  const { t, tr } = useApp();
  const q = useQuery({ queryKey: ["weather"], queryFn: () => getWeather(), staleTime: 10 * 60e3 });
  return (
    <section className="card-paper p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">{t("weather")}</h2>
        {q.data && <span className="chip">{q.data.live ? t("liveData") : t("sample")}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(q.data?.data ?? []).map((c) => (
          <div key={c.id} className="rounded-xl bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{tr(CITIES[c.id].name)}</span>
              <WeatherIcon code={c.code} className="h-7 w-7 text-accent" />
            </div>
            <div className="mt-1 font-display text-4xl">{c.temp}°</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Droplets className="h-3 w-3" />{t("humidity")} {c.humidity}%</div>
            <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px] text-muted-foreground">
              {c.daily.map((d, i) => (
                <div key={i} className={CITIES[c.id].days.includes((i + 1) as never) ? "rounded-md bg-background py-1 text-foreground" : "py-1"}>
                  <div>{t("day")} {i + 1}</div>
                  <WeatherIcon code={d.code} className="mx-auto my-0.5 h-4 w-4" />
                  {d.max}°/{d.min}°
                </div>
              ))}
            </div>
          </div>
        ))}
        {q.isLoading && [0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
      </div>
    </section>
  );
}

export function NextAssembly() {
  const { t, tr, now } = useApp();
  const { nextAssembly } = useProgress();
  if (!nextAssembly) return <section className="card-paper p-5"><h2 className="font-display text-2xl">{t("nextMeet")}</h2><p className="mt-2 text-muted-foreground">{t("finished")}</p></section>;
  const ms = nextAssembly.at - now, urgent = ms < 30 * 60e3;
  return (
    <section className={`p-5 ${urgent ? "card-alert" : "card-lacquer"}`}>
      <div className="text-xs uppercase tracking-[0.2em] opacity-80">{t("nextMeet")} · {t("day")} {nextAssembly.ev.day}</div>
      <div className="mt-2 font-display text-5xl tabular-nums">{fmtCountdown(ms)}</div>
      <div className="mt-2 text-lg font-medium">{nextAssembly.ev.time} — {tr(nextAssembly.ev.title)}</div>
      <div className="flex items-center gap-1 text-sm opacity-85"><MapPin className="h-4 w-4" />{nextAssembly.ev.assembly ? tr(nextAssembly.ev.assembly) : ""}</div>
    </section>
  );
}

export function ProgressCard() {
  const { t, tr } = useApp();
  const p = useProgress();
  const stop = stopById(p.current?.stopId);
  return (
    <section className="card-paper p-5">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>{t("progress")}</span><span>{Math.round(p.pct)}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-route transition-all" style={{ width: `${p.pct}%` }} /></div>
      {p.status === "before" && <p className="mt-4 text-muted-foreground">{t("notStarted")}</p>}
      {p.status === "after" && <p className="mt-4 text-muted-foreground">{t("finished")}</p>}
      {p.status === "during" && p.current && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="chip">{t("now")} · {t("day")} {p.current.day} · {p.current.time}</div>
            <div className="mt-2 font-display text-2xl">{tr(p.current.title)}</div>
            {stop && <div className="text-sm text-muted-foreground">{tr(stop.name)}</div>}
          </div>
          {p.next && (
            <div className="border-l border-border pl-3">
              <div className="chip-muted">{t("next")} · {p.next.time}</div>
              <div className="mt-2 text-lg">{tr(p.next.title)}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ListenButton({ text }: { text: string }) {
  const { t, lang } = useApp();
  const [on, setOn] = useState(false);
  return (
    <Button variant="ghost"
      className="btn-ghost"
      onClick={() => { if (on) { speechSynthesis.cancel(); setOn(false); } else { setOn(true); speak(text, lang, () => setOn(false)); } }}
    >
      {on ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{on ? t("stop") : t("listen")}
    </Button>
  );
}

/** Manually playable narration for every scheduled slot. */
export function NarrationPlayer({ day }: { day?: TourEvent["day"] }) {
  const { t, tr, lang, now, start } = useApp();
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => onNarration(setPlaying), []);
  const slots = EVENTS.filter((ev) => ev.narrate?.length && (!day || ev.day === day)).map((ev) => ({ ev, at: eventTime(start, ev), items: GUIDE.filter((g) => ev.narrate?.includes(g.id)) }));
  const play = (items: typeof GUIDE) => {
    const label = items.map((x) => tr(x.title)).join(" · ");
    speak(items.map((x) => `${tr(x.title)}. ${tr(x.body)}`).join(" "), lang);
    emitNarration(label);
  };
  return (
    <section className="card-paper p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Headphones className="h-5 w-5 text-accent" />
        <h2 className="mr-auto font-display text-2xl">{t("narration")}</h2>
      </div>
      {playing && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-muted p-3">
          <Volume2 className="h-5 w-5 animate-pulse text-primary" />
          <div className="flex-1 text-sm"><div className="text-xs uppercase tracking-widest text-muted-foreground">{t("nowPlaying")}</div>{playing}</div>
          <Button variant="ghost" className="btn-ghost" onClick={() => { if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); emitNarration(null); }}><Square className="h-4 w-4" />{t("stop")}</Button>
        </div>
      )}
      <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{t("upNext")}</div>
      <ul className="space-y-1">
        {slots.map(({ ev, at, items }, i) => {
          const past = at <= now;
          return (
            <li key={i} className={`flex flex-wrap items-center gap-3 rounded-lg p-2 text-sm ${past ? "opacity-60" : ""}`}>
              <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{t("day")} {ev.day} · {ev.time}</span>
              <span className="flex-1">{items.map((x) => tr(x.title)).join(" · ")}</span>
              <Button variant="ghost" className="btn-ghost" onClick={() => play(items)}><Play className="h-4 w-4" />{t("play")}</Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Compact meetup section shared by Overview and the legacy meeting page. */
export function MeetingSection() {
  const { t, tr, now } = useApp();
  const { assemblies } = useProgress();
  const [perm, setPerm] = useState("default");
  useEffect(() => { if (typeof Notification !== "undefined") setPerm(Notification.permission); }, []);
  const enable = async () => {
    if (typeof Notification === "undefined") { toast.error(t("notificationsUnsupported")); return; }
    try {
      const permission = await Notification.requestPermission();
      setPerm(permission);
      if (permission === "granted") new Notification(t("notifOn"), { body: "Di Sản Bắc Bộ" });
    } catch { toast.error(t("notificationsUnsupported")); }
  };
  return (
    <section className="card-paper p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="mr-auto font-display text-2xl">{t("alerts")}</h2>
        <Button variant="ghost" onClick={enable} disabled={perm === "granted"} className={perm === "granted" ? "btn-ghost" : "btn-primary"}>
          {perm === "granted" ? <Check /> : <BellRing />}{perm === "granted" ? t("notifOn") : t("enableNotif")}
        </Button>
      </div>
      <ul className="max-h-64 divide-y divide-border overflow-y-auto">
        {assemblies.map(({ ev, at }) => (
          <li key={`${ev.day}-${ev.time}`} className={`flex flex-wrap items-center gap-3 py-3 text-sm ${at <= now ? "opacity-50" : ""}`}>
            <span className="w-28 shrink-0 tabular-nums text-muted-foreground">{t("day")} {ev.day} · {ev.time}</span>
            <div className="min-w-0 flex-1"><div className="font-medium">{tr(ev.title)}</div><div className="flex items-start gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{ev.assembly && tr(ev.assembly)}</div></div>
            <span className={at <= now ? "chip-muted" : "chip tabular-nums"}>{at <= now ? t("done") : fmtCountdown(at - now)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
