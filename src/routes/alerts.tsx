import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { ClockControls } from "@/components/Shell";
import { MeetingSection, NextAssembly } from "@/components/Widgets";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Meeting Times – Di Sản Bắc Bộ" },
      { name: "description", content: "Countdowns and alerts for every group assembly: flights, hotel departures and boat boarding." },
      { property: "og:title", content: "Meeting Times – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Never miss a group meeting time on the heritage tour." },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { t } = useApp();
  return <div className="space-y-4"><h1 className="text-4xl">{t("alerts")}</h1><ClockControls /><NextAssembly /><MeetingSection /></div>;
}
