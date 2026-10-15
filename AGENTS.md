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
- Narration and arrival alerts are driven by `narrate`/`stopId` on schedule events, fired by the watcher in app-state — never by page components, so they work on every page.
- Global language/theme/clock state lives in `src/lib/app-state.tsx`; the "current position" is always derived from the clock + schedule, never stored.
- The map uses the Google Maps JS API, injected as a script inside useEffect (key from VITE_GOOGLE_MAPS_API_KEY, falling back to the managed connector key) — keeps SSR free of `google` globals.
- Weather comes from Open-Meteo through a server function with sample-data fallback — keyless, so no secrets are required.
