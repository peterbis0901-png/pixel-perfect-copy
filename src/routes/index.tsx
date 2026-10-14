import { createFileRoute, Link } from "@tanstack/react-router";
import halong from "@/assets/halong.jpg";
import { useApp } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { NextAssembly, ProgressCard, WeatherWidget } from "@/components/Widgets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Di Sản Bắc Bộ – Heritage Tour Companion" },
      { name: "description", content: "Live progress, meeting times and weather for the 4-day HCM – Hà Nội – Ninh Bình – Hạ Long heritage tour." },
      { property: "og:title", content: "Di Sản Bắc Bộ – Heritage Tour Companion" },
      { property: "og:description", content: "Live progress, meeting times and weather for your 4-day northern Vietnam heritage tour." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang, t } = useApp();
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl">
        <img src={halong} alt="Ha Long Bay at sunrise" width={1600} height={912} className="h-[340px] w-full object-cover md:h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-background md:p-10">
          <div className="text-xs uppercase tracking-[0.3em] opacity-85">4N3Đ · {lang === "vi" ? "Hành trình di sản" : "Heritage journey"}</div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight md:text-6xl">Hồ Chí Minh – Hà Nội – Ninh Bình – Hạ Long</h1>
          <Link to="/map" className="btn-primary mt-5">{t("openMap")} →</Link>
        </div>
      </section>
      <ClockControls />
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <ProgressCard />
        <NextAssembly />
      </div>
      <WeatherWidget />
    </div>
  );
}
