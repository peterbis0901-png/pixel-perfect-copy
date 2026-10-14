import { Link } from "@tanstack/react-router";
import { Bell, BookOpen, CalendarDays, Compass, Map, Moon, Sun } from "lucide-react";
import { useApp, type UIKey } from "@/lib/app-state";

const NAV: { to: "/" | "/map" | "/itinerary" | "/guide" | "/alerts"; k: UIKey; I: typeof Map }[] = [
  { to: "/", k: "overview", I: Compass },
  { to: "/map", k: "map", I: Map },
  { to: "/itinerary", k: "itinerary", I: CalendarDays },
  { to: "/guide", k: "guide", I: BookOpen },
  { to: "/alerts", k: "alerts", I: Bell },
];

export function Header() {
  const { t, lang, setLang, dark, setDark } = useApp();
  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-display text-xl font-semibold leading-none">
            <span className="text-primary">Di Sản</span> Bắc Bộ
            <span className="block text-[10px] font-sans tracking-[0.25em] text-muted-foreground">HCM · HN · NB · HL</span>
          </Link>
          <nav className="ml-6 hidden gap-1 md:flex">
            {NAV.map(({ to, k }) => (
              <Link key={to} to={to} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-muted text-foreground" }} activeOptions={{ exact: true }}>{t(k)}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-full border border-border p-0.5 text-xs font-semibold">
              {(["vi", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`rounded-full px-2.5 py-1 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button aria-label="Toggle theme" onClick={() => setDark(!dark)} className="rounded-full border border-border p-2">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-[1000] grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map(({ to, k, I }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
            <I className="h-5 w-5" />{t(k)}
          </Link>
        ))}
      </nav>
    </>
  );
}

/** Live / simulation clock controls */
export function ClockControls() {
  const { t, mode, setMode, start, setStart, simOffset, setSimOffset, now, lang } = useApp();
  const day = Math.floor(simOffset / 1440) + 1, hm = simOffset % 1440;
  return (
    <section className="card-paper flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex rounded-full border border-border p-0.5 text-xs font-medium">
        {(["live", "sim"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1 ${mode === m ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}>{t(m)}</button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        {t("startDate")}
        <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className="rounded-md border border-input bg-card px-2 py-1 text-foreground" />
      </label>
      {mode === "sim" ? (
        <div className="flex flex-1 items-center gap-3">
          <input type="range" min={240} max={3 * 1440 + 18 * 60} step={5} value={simOffset} onChange={(e) => setSimOffset(+e.target.value)} className="flex-1 accent-[var(--lacquer)]" aria-label="Simulated time" />
          <span className="w-28 text-right text-sm font-medium tabular-nums">{t("day")} {day} · {String(Math.floor(hm / 60)).padStart(2, "0")}:{String(hm % 60).padStart(2, "0")}</span>
        </div>
      ) : (
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">{new Date(now).toLocaleString(lang === "vi" ? "vi-VN" : "en-GB", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
      )}
    </section>
  );
}
