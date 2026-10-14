import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GUIDE, type GuideItem } from "@/data/tour";
import { useApp } from "@/lib/app-state";
import { ListenButton } from "@/components/Widgets";
import hanoi from "@/assets/hanoi.jpg";
import trangan from "@/assets/trangan.jpg";
import halong from "@/assets/halong.jpg";

const IMG = { hanoi, trangan, halong };

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Bilingual Audio Guide – Di Sản Bắc Bộ" },
      { name: "description", content: "History, legends and local food of Hà Nội, Ninh Bình and Hạ Long in English and Vietnamese, with read-aloud." },
      { property: "og:title", content: "Bilingual Audio Guide – Di Sản Bắc Bộ" },
      { property: "og:description", content: "Thăng Long history, Hồ Gươm legend, Phở and Chả cá — in English and Vietnamese." },
    ],
  }),
  component: Guide,
});

function Guide() {
  const { t, tr, lang, setLang } = useApp();
  const [kind, setKind] = useState<"all" | GuideItem["kind"]>("all");
  const items = GUIDE.filter((g) => kind === "all" || g.kind === kind);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-4xl">{t("guide")}</h1>
        {(["all", "history", "legend", "food"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={kind === k ? "btn-primary" : "btn-ghost"}>{t(k)}</button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((g) => (
          <article key={g.id} className="card-paper overflow-hidden">
            {g.img && <img src={IMG[g.img]} alt={tr(g.title)} loading="lazy" className="h-44 w-full object-cover" />}
            <div className="p-5">
              <div className="chip">{t(g.kind)}</div>
              <h2 className="mt-2 text-2xl">{tr(g.title)}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{tr(g.body)}</p>
              <div className="mt-4 flex gap-2">
                <ListenButton text={`${tr(g.title)}. ${tr(g.body)}`} />
                <button className="btn-ghost" onClick={() => setLang(lang === "en" ? "vi" : "en")}>⇄ {lang === "en" ? "Tiếng Việt" : "English"}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
