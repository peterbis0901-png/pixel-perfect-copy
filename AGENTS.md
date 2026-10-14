<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules

- All tour content (stops, schedule, guide text) lives in `src/data/tour.ts` as bilingual `{en, vi}` objects — single source of truth, no database needed.
- Global language/theme/clock state lives in `src/lib/app-state.tsx`; the "current position" is always derived from the clock + schedule, never stored.
- Leaflet is only imported from `*.client.tsx` modules loaded via `React.lazy` inside `<ClientOnly>` — it breaks SSR otherwise.
- Weather comes from Open-Meteo through a server function with sample-data fallback — keyless, so no secrets are required.
