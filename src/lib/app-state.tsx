// Global app state: language, theme, live/simulated clock, and assembly alerts.
import { type Context, createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { EVENTS, GUIDE, eventTime, stopById, type L, type Lang } from "@/data/tour";

const UI = {
  overview: { en: "Overview", vi: "Tổng quan" },
  map: { en: "Map", vi: "Bản đồ" },
  itinerary: { en: "Itinerary", vi: "Lịch trình" },
  guide: { en: "Guide", vi: "Thuyết minh" },
  alerts: { en: "Meetups", vi: "Tập trung" },
  day: { en: "Day", vi: "Ngày" },
  now: { en: "Now", vi: "Hiện tại" },
  next: { en: "Next", vi: "Tiếp theo" },
  live: { en: "Live", vi: "Thời gian thực" },
  sim: { en: "Simulation", vi: "Mô phỏng" },
  startDate: { en: "Tour start date", vi: "Ngày khởi hành" },
  notStarted: { en: "Tour has not started yet", vi: "Tour chưa bắt đầu" },
  finished: { en: "Tour completed", vi: "Tour đã kết thúc" },
  nextMeet: { en: "Next meeting time", vi: "Giờ tập trung kế tiếp" },
  weather: { en: "Weather on the route", vi: "Thời tiết trên hành trình" },
  listen: { en: "Listen", vi: "Nghe" },
  stop: { en: "Stop", vi: "Dừng" },
  enableNotif: { en: "Enable notifications", vi: "Bật thông báo" },
  notifOn: { en: "Notifications on", vi: "Đã bật thông báo" },
  progress: { en: "Tour progress", vi: "Tiến độ tour" },
  meetingSoon: { en: "Meeting in 30 minutes", vi: "Còn 30 phút đến giờ tập trung" },
  meetingNow: { en: "Meeting time now!", vi: "Đến giờ tập trung!" },
  humidity: { en: "Humidity", vi: "Độ ẩm" },
  sample: { en: "Sample data", vi: "Dữ liệu mẫu" },
  liveData: { en: "Live data", vi: "Dữ liệu trực tiếp" },
  openMap: { en: "Open map", vi: "Mở bản đồ" },
  history: { en: "History", vi: "Lịch sử" },
  legend: { en: "Legends", vi: "Truyền thuyết" },
  food: { en: "Food", vi: "Ẩm thực" },
  all: { en: "All", vi: "Tất cả" },
  done: { en: "Done", vi: "Đã qua" },
  arrived: { en: "Arriving at", vi: "Đang đến" },
  narration: { en: "Tour narration", vi: "Thuyết minh tự động" },
  autoNarrate: { en: "Auto-play on schedule", vi: "Tự phát theo lịch" },
  nowPlaying: { en: "Now playing", vi: "Đang phát" },
  upNext: { en: "Scheduled narrations", vi: "Thuyết minh theo lịch" },
  play: { en: "Play", vi: "Phát" },
  mapKeyMissing: { en: "Map failed to load.", vi: "Không tải được bản đồ." },
  viewLocation: { en: "View location", vi: "Xem địa điểm" },
  newTab: { en: "opens Google Maps in a new tab", vi: "mở Google Maps trong thẻ mới" },
  mapRegion: { en: "Tour route map. Use Tab to move between stops, Enter to open details, Escape to close.", vi: "Bản đồ lộ trình tour. Dùng Tab để chuyển giữa các điểm, Enter để xem chi tiết, Esc để đóng." },
  mapOffline: { en: "Map tiles can't load (offline?). The route and stops are listed below.", vi: "Không tải được nền bản đồ (mất mạng?). Lộ trình và các điểm dừng được liệt kê bên dưới." },
  routeList: { en: "Route, in order", vi: "Lộ trình theo thứ tự" },
  byFlight: { en: "flight", vi: "máy bay" },
  byRoad: { en: "by road / boat", vi: "đường bộ / tàu" },
  closePopup: { en: "Close details", vi: "Đóng chi tiết" },
  stopList: { en: "Tour stops", vi: "Các điểm dừng" },
} satisfies Record<string, L>;
export type UIKey = keyof typeof UI;

type Ctx = {
  lang: Lang; setLang: (l: Lang) => void;
  t: (k: UIKey) => string; tr: (l: L) => string;
  dark: boolean; setDark: (d: boolean) => void;
  mode: "live" | "sim"; setMode: (m: "live" | "sim") => void;
  start: string; setStart: (s: string) => void;
  simOffset: number; setSimOffset: (m: number) => void; // minutes since 00:00 day 1
  now: number;
  autoNarrate: boolean; setAutoNarrate: (b: boolean) => void;
};
// Keep one context instance across hot reloads so providers and consumers always match.
const g = globalThis as { __tourAppCtx?: Context<Ctx | null> };
const AppCtx = (g.__tourAppCtx ??= createContext<Ctx | null>(null));

const todayVN = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<"live" | "sim">("sim");
  const [start, setStart] = useState("2026-10-15");
  const [simOffset, setSimOffset] = useState(10 * 60 + 30);
  const [autoNarrate, setAutoNarrate] = useState(true);
  const [tick, setTick] = useState(() => Date.now());
  const loaded = useRef(false);

  // Restore preferences after hydration
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("tour-prefs") || "{}");
      if (s.lang) setLang(s.lang);
      if (s.dark) setDark(true);
      if (s.mode) setMode(s.mode);
      setStart(s.start || todayVN());
      if (typeof s.simOffset === "number") setSimOffset(s.simOffset);
      if (typeof s.autoNarrate === "boolean") setAutoNarrate(s.autoNarrate);
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) localStorage.setItem("tour-prefs", JSON.stringify({ lang, dark, mode, start, simOffset, autoNarrate }));
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = lang;
  }, [lang, dark, mode, start, simOffset, autoNarrate]);
  useEffect(() => { const i = setInterval(() => setTick(Date.now()), 1000); return () => clearInterval(i); }, []);

  const now = mode === "live" ? tick : eventTime(start, { day: 1, time: "00:00" }) + simOffset * 60e3;

  const value = useMemo<Ctx>(() => ({
    lang, setLang, t: (k) => UI[k][lang], tr: (l) => l[lang],
    dark, setDark, mode, setMode, start, setStart, simOffset, setSimOffset, now, autoNarrate, setAutoNarrate,
  }), [lang, dark, mode, start, simOffset, now, autoNarrate]);

  return <AppCtx.Provider value={value}><AssemblyWatcher ctx={value} />{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}

/** Derives where the group should be at `now`. */
export function useProgress() {
  const { start, now } = useApp();
  const times = EVENTS.map((ev) => eventTime(start, ev));
  let idx = -1;
  times.forEach((t, i) => { if (t <= now) idx = i; });
  const first = times[0]!, last = times[times.length - 1]!;
  const pct = Math.min(100, Math.max(0, ((now - first) / (last - first)) * 100));
  const assemblies = EVENTS.map((ev, i) => ({ ev, at: times[i]! })).filter((x) => x.ev.assembly);
  const nextAssembly = assemblies.find((a) => a.at > now);
  return { idx, current: EVENTS[idx], next: EVENTS[idx + 1], times, pct, status: idx < 0 ? "before" : now > last ? "after" : "during", nextAssembly, assemblies } as const;
}

/** Fires toasts + browser notifications 30 min before and at each assembly time. */
function AssemblyWatcher({ ctx }: { ctx: Ctx }) {
  const fired = useRef(new Set<string>());
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const p = prev.current; prev.current = ctx.now;
    if (p === null || Math.abs(ctx.now - p) > 3 * 3600e3) return; // skip big jumps
    for (const ev of EVENTS) {
      if (!ev.assembly) continue;
      const at = eventTime(ctx.start, ev);
      for (const [lead, key] of [[30 * 60e3, "meetingSoon"], [0, "meetingNow"]] as const) {
        const trigger = at - lead, id = `${ctx.start}-${ev.day}-${ev.time}-${lead}`;
        if (p < trigger && ctx.now >= trigger && !fired.current.has(id)) {
          fired.current.add(id);
          const title = `${ctx.t(key)} · ${ev.time}`;
          const body = `${ctx.tr(ev.title)} — ${ctx.tr(ev.assembly)}`;
          toast(title, { description: body, duration: 10000 });
          if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(title, { body });
        }
      }
    }
    // Arrival alerts + scheduled narration at the start of each time slot
    EVENTS.forEach((ev, i) => {
      const at = eventTime(ctx.start, ev), id = `${ctx.start}-slot-${i}`;
      if (!(p < at && ctx.now >= at) || fired.current.has(id)) return;
      fired.current.add(id);
      const prevStop = EVENTS[i - 1]?.stopId, stop = stopById(ev.stopId);
      if (stop && ev.stopId !== prevStop) {
        const title = `${ctx.t("arrived")} ${ctx.tr(stop.name)}`;
        toast.success(title, { description: `${ev.time} · ${ctx.tr(ev.title)}`, duration: 8000 });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(title, { body: ctx.tr(stop.desc) });
      }
      const items = (ev.narrate ?? []).map((g) => GUIDE.find((x) => x.id === g)).filter((x) => !!x);
      if (items.length) {
        const text = items.map((x) => `${ctx.tr(x.title)}. ${ctx.tr(x.body)}`).join(" ");
        const label = items.map((x) => ctx.tr(x.title)).join(" · ");
        if (ctx.autoNarrate) { speak(text, ctx.lang); emitNarration(label); }
        toast(`🎧 ${ctx.t("narration")}`, { description: label, duration: 10000, action: ctx.autoNarrate ? undefined : { label: ctx.t("play"), onClick: () => { speak(text, ctx.lang); emitNarration(label); } } });
      }
    });
  }, [ctx.now]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Tiny pub/sub so the narration player can show what the scheduler started. */
type NarrListener = (label: string | null) => void;
const narrListeners = new Set<NarrListener>();
export function emitNarration(label: string | null) { narrListeners.forEach((f) => f(label)); }
export function onNarration(f: NarrListener) { narrListeners.add(f); return () => { narrListeners.delete(f); }; }

/** Read text aloud with the device's built-in voices. */
export function speak(text: string, lang: Lang, onEnd?: () => void) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "vi" ? "vi-VN" : "en-US";
  const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang));
  if (v) u.voice = v;
  u.rate = 0.95;
  u.onend = () => { onEnd?.(); emitNarration(null); };
  speechSynthesis.speak(u);
}

export const fmtCountdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (d ? `${d}d ` : "") + `${pad(h)}:${pad(m)}:${pad(sec)}`;
};
