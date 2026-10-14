# Heritage Tour Companion: HCM – Hà Nội – Ninh Bình – Hạ Long (4 days, 3 nights)

A travel companion web app for tour members that works well on phones, in English and Vietnamese.

## Pages
- `/` Overview: hero, tour summary, "where we are now" card, next meeting-time countdown, today's weather.
- `/map` Full interactive map: all stops in order (SGN → HAN → Ba Đình/Lăng Bác, Ho Chi Minh Museum, One Pillar Pagoda, Hoàn Kiếm & Ngọc Sơn → Văn Miếu → Hoàng Thành Thăng Long night tour → Tràng An → Hạ Long: Thiên Cung Cave, Đỉnh Hương and Gà Chọi islets → Hà Nội → SGN). Each day's route has its own color, stops use custom numbered markers, and tapping a stop opens a details panel (photo, history, audio).
- `/itinerary` Day 1–4 timeline: activities, meals, hotels (CWD, Thăng Long Espana, A25), with a live progress bar.
- `/guide` Bilingual guide: history, legends (Hoàn Kiếm turtle legend), and food (Phở, Chả cá, Cơm cháy dê núi), each with a read-aloud button.
- `/alerts` Meeting times: countdowns for flight boarding, hotel departures, and boat boarding at Tràng An and Tuần Châu, with browser notifications.

## Key behaviors
- Live progress: compares the clock to the schedule. A simulation mode lets you pick the tour start date or drag a time slider to see the progress bar and map move.
- Weather: live data for Hà Nội, Ninh Bình, and Hạ Long from Open-Meteo (free, no key needed), with a sample-data fallback.
- EN/VI switch in the header changes all text instantly and is remembered on the device.
- Read-aloud: the phone or browser's built-in voices, in Vietnamese or English. AI voices can be added later.
- Light/dark switch. Visual style: warm lacquer red, jade green, and rice-paper cream, with a serif heading font (e.g. Cormorant) and a clean body font.
- Generated photos for the main stops.

## Technical details
- TanStack Start replaces Express: the itinerary comes from typed TS data (`src/data/tour.ts`), and weather comes through a `createServerFn` that calls Open-Meteo. No database is needed.
- Leaflet + OpenStreetMap tiles, imported dynamically on the client only (SSR-safe). Routes are drawn as polylines; flight legs are dashed.
- Notifications use the Notification API plus in-app toasts (sonner), and countdowns tick every second.
- Language context with a dictionary; read-aloud uses Web Speech `speechSynthesis` with `vi-VN` and `en-US`.
- Each route gets its own head() metadata.
