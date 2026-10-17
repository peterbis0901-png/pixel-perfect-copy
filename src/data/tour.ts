// Tour data: the single source of truth for stops, schedule and guide content.
export type L = { en: string; vi: string };
export type Lang = keyof L;

export const TOUR_START_DATE = "2026-10-15";
export const DAY_TITLES = {
  1: { en: "SGN → Hà Nội · Capital heritage", vi: "SGN → Hà Nội · Di sản Thủ đô" },
  2: { en: "Ninh Bình · Tràng An → Hạ Long", vi: "Ninh Bình · Tràng An → Hạ Long" },
  3: { en: "Hạ Long Bay cruise → Hà Nội", vi: "Du thuyền vịnh Hạ Long → Hà Nội" },
  4: { en: "Old Quarter → SGN", vi: "Phố cổ → SGN" },
};

export type Stop = {
  id: string;
  name: L;
  lat: number;
  lng: number;
  day: 1 | 2 | 3 | 4;
  city: "hcm" | "hanoi" | "ninhbinh" | "halong";
  img?: "hanoi" | "trangan" | "halong";
  desc: L;
};

export const STOPS: Stop[] = [
  { id: "sgn", day: 1, city: "hcm", lat: 10.8188, lng: 106.6519, name: { en: "Tan Son Nhat Airport (SGN)", vi: "Sân bay Tân Sơn Nhất (SGN)" }, desc: { en: "Group meets at Domestic Terminal for the morning flight to Hà Nội.", vi: "Đoàn tập trung tại Ga Quốc nội, đáp chuyến bay sáng ra Hà Nội." } },
  { id: "han", day: 1, city: "hanoi", lat: 21.2187, lng: 105.8042, name: { en: "Noi Bai Airport (HAN)", vi: "Sân bay Nội Bài (HAN)" }, desc: { en: "Arrival in the capital; the coach and local guide welcome the group.", vi: "Đến Thủ đô, xe và hướng dẫn viên địa phương đón đoàn." } },
  { id: "badinh", day: 1, city: "hanoi", lat: 21.0368, lng: 105.8346, img: "hanoi", name: { en: "Ba Dinh Square & Mausoleum", vi: "Quảng trường Ba Đình & Lăng Bác" }, desc: { en: "Where President Hồ Chí Minh read the Declaration of Independence on 2 September 1945.", vi: "Nơi Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập ngày 2/9/1945." } },
  { id: "museum", day: 1, city: "hanoi", lat: 21.0355, lng: 105.8325, name: { en: "Ho Chi Minh Museum", vi: "Bảo tàng Hồ Chí Minh" }, desc: { en: "A lotus-shaped museum telling the life and revolutionary journey of Uncle Hồ.", vi: "Bảo tàng hình hoa sen kể lại cuộc đời và hành trình cách mạng của Bác Hồ." } },
  { id: "onepillar", day: 1, city: "hanoi", lat: 21.0359, lng: 105.8335, name: { en: "One Pillar Pagoda", vi: "Chùa Một Cột" }, desc: { en: "Built in 1049 by Emperor Lý Thái Tông after a dream of Bodhisattva Quan Âm seated on a lotus.", vi: "Xây năm 1049 dưới thời vua Lý Thái Tông sau giấc mơ thấy Phật Bà Quan Âm ngồi trên đài sen." } },
  { id: "vanmieu", day: 1, city: "hanoi", lat: 21.0275, lng: 105.8355, name: { en: "Temple of Literature", vi: "Văn Miếu – Quốc Tử Giám" }, desc: { en: "Vietnam's first university (1076), with 82 stone steles honouring doctoral laureates.", vi: "Trường đại học đầu tiên của Việt Nam (1076), với 82 bia tiến sĩ." } },
  { id: "hoankiem", day: 1, city: "hanoi", lat: 21.0287, lng: 105.8524, img: "hanoi", name: { en: "Hoan Kiem Lake & Ngoc Son Temple", vi: "Hồ Hoàn Kiếm & Đền Ngọc Sơn" }, desc: { en: "The Lake of the Returned Sword, crossed by the red Thê Húc bridge.", vi: "Hồ Gươm với cầu Thê Húc đỏ rực dẫn vào đền Ngọc Sơn." } },
  { id: "citadel", day: 1, city: "hanoi", lat: 21.0352, lng: 105.8403, name: { en: "Thang Long Imperial Citadel (night tour)", vi: "Hoàng thành Thăng Long (tour đêm)" }, desc: { en: "UNESCO site, seat of power for 13 centuries, explored by lantern light.", vi: "Di sản UNESCO, trung tâm quyền lực suốt 13 thế kỷ, khám phá dưới ánh đèn lồng." } },
  { id: "trangan", day: 2, city: "ninhbinh", lat: 20.2547, lng: 105.8956, img: "trangan", name: { en: "Trang An Scenic Complex", vi: "Quần thể danh thắng Tràng An" }, desc: { en: "Sampan ride through limestone caves and rice-field valleys — a UNESCO mixed heritage site.", vi: "Đi đò qua hang động núi đá vôi và thung lũng lúa — di sản thế giới hỗn hợp UNESCO." } },
  { id: "tuanchau", day: 3, city: "halong", lat: 20.9286, lng: 107.0019, img: "halong", name: { en: "Tuan Chau Harbour", vi: "Cảng Tuần Châu" }, desc: { en: "Boarding point for the Hạ Long Bay cruise.", vi: "Bến lên tàu tham quan vịnh Hạ Long." } },
  { id: "thiencung", day: 3, city: "halong", lat: 20.9133, lng: 107.075, img: "halong", name: { en: "Thien Cung Cave", vi: "Động Thiên Cung" }, desc: { en: "The 'Heavenly Palace' cave of glittering stalactites and legends of a dragon king's wedding.", vi: "'Cung điện nhà Trời' với nhũ đá lấp lánh và truyền thuyết đám cưới con vua Thủy Tề." } },
  { id: "dinhhuong", day: 3, city: "halong", lat: 20.91, lng: 107.088, img: "halong", name: { en: "Dinh Huong Islet", vi: "Hòn Đỉnh Hương" }, desc: { en: "Shaped like an incense burner offered to heaven.", vi: "Hình chiếc lư hương dâng lên trời đất." } },
  { id: "gachoi", day: 3, city: "halong", lat: 20.905, lng: 107.083, img: "halong", name: { en: "Fighting Cocks Islet", vi: "Hòn Gà Chọi" }, desc: { en: "Two rocks facing each other like fighting roosters — icon of Hạ Long.", vi: "Hai khối đá đối mặt như đôi gà chọi — biểu tượng của Hạ Long." } },
  { id: "hanoi4", day: 4, city: "hanoi", lat: 21.0333, lng: 105.85, img: "hanoi", name: { en: "Hanoi Old Quarter", vi: "Phố cổ Hà Nội" }, desc: { en: "Free time for the 36 streets, egg coffee and souvenirs.", vi: "Tự do dạo 36 phố phường, cà phê trứng và mua quà." } },
  { id: "han4", day: 4, city: "hanoi", lat: 21.2187, lng: 105.8042, name: { en: "Noi Bai Airport (HAN)", vi: "Sân bay Nội Bài (HAN)" }, desc: { en: "Return flight to Hồ Chí Minh City.", vi: "Bay về TP. Hồ Chí Minh." } },
  { id: "sgn4", day: 4, city: "hcm", lat: 10.8188, lng: 106.6519, name: { en: "Tan Son Nhat Airport (SGN)", vi: "Sân bay Tân Sơn Nhất (SGN)" }, desc: { en: "End of the tour. Hẹn gặp lại!", vi: "Kết thúc chương trình. Hẹn gặp lại!" } },
];

export const FLIGHT_LEGS: [string, string][] = [["sgn", "han"], ["han4", "sgn4"]];

export type EventType = "transport" | "activity" | "meal" | "hotel";
export type TourEvent = {
  day: 1 | 2 | 3 | 4;
  time: string; // HH:MM Vietnam time (start of the time slot)
  end: string; // HH:MM Vietnam time (end of the time slot)
  type: EventType;
  title: L;
  stopId?: string | undefined;
  assembly?: L | undefined; // set when this is a group meeting time
  narrate?: string[] | undefined; // GUIDE ids available for manual playback in this slot
};

const e = (day: TourEvent["day"], time: string, type: EventType, en: string, vi: string, stopId?: string, assembly?: L, narrate?: string[]) => ({ day, time, type, title: { en, vi }, stopId, assembly, narrate });

const RAW = [
  e(1, "05:30", "transport", "Meet at SGN Domestic Terminal", "Tập trung tại Ga Quốc nội SGN", "sgn", { en: "Airport check-in – Gate area, Domestic Terminal", vi: "Làm thủ tục bay – Ga Quốc nội" }),
  e(1, "07:00", "transport", "Boarding flight to Hà Nội", "Lên máy bay đi Hà Nội", "sgn", { en: "Boarding gate closes 07:20", vi: "Cửa ra tàu bay đóng lúc 07:20" }),
  e(1, "09:15", "transport", "Arrive Noi Bai, coach to city", "Đến Nội Bài, xe đón vào trung tâm", "han", undefined, ["thanglong"]),
  e(1, "10:30", "activity", "Ba Dinh Square & Mausoleum", "Quảng trường Ba Đình & Lăng Bác", "badinh"),
  e(1, "11:15", "activity", "Ho Chi Minh Museum", "Bảo tàng Hồ Chí Minh", "museum"),
  e(1, "11:45", "activity", "One Pillar Pagoda", "Chùa Một Cột", "onepillar"),
  e(1, "12:30", "meal", "Lunch – Hanoi set menu", "Ăn trưa – thực đơn Hà Nội", "onepillar"),
  e(1, "14:30", "activity", "Temple of Literature", "Văn Miếu – Quốc Tử Giám", "vanmieu"),
  e(1, "16:00", "activity", "Hoan Kiem Lake & Ngoc Son Temple", "Hồ Hoàn Kiếm & Đền Ngọc Sơn", "hoankiem", undefined, ["hoankiem"]),
  e(1, "18:30", "meal", "Dinner – Chả cá Lã Vọng", "Ăn tối – Chả cá Lã Vọng", "hoankiem", undefined, ["chaca"]),
  e(1, "19:45", "activity", "Imperial Citadel night tour", "Tour đêm Hoàng thành Thăng Long", "citadel", { en: "Meet at coach, Hoàn Kiếm north side", vi: "Tập trung lên xe, phía bắc Hồ Gươm" }),
  e(1, "21:30", "hotel", "Check in – CWD Hotel 3★, Hà Nội", "Nhận phòng – Khách sạn CWD 3★, Hà Nội", "citadel"),
  e(2, "06:30", "meal", "Hotel breakfast", "Ăn sáng tại khách sạn", "citadel"),
  e(2, "07:30", "transport", "Depart hotel for Ninh Bình", "Rời khách sạn đi Ninh Bình", "citadel", { en: "Lobby – bring luggage, check out", vi: "Sảnh khách sạn – mang hành lý, trả phòng" }),
  e(2, "09:30", "activity", "Trang An sampan boat tour", "Đi đò tham quan Tràng An", "trangan", { en: "Trang An wharf – 4 guests per boat", vi: "Bến thuyền Tràng An – 4 khách/đò" }, ["trangan"]),
  e(2, "12:30", "meal", "Lunch – Ninh Bình crispy rice & goat dishes", "Ăn trưa – Cơm cháy dê núi Ninh Bình", "trangan", undefined, ["comchay"]),
  e(2, "14:00", "transport", "Coach to Hạ Long", "Di chuyển đi Hạ Long", "trangan", { en: "Restaurant car park", vi: "Bãi xe nhà hàng" }),
  e(2, "18:00", "hotel", "Check in – A25 Hotel 3★, Hạ Long", "Nhận phòng – Khách sạn A25 3★, Hạ Long", "tuanchau"),
  e(2, "19:00", "meal", "Seafood dinner", "Ăn tối hải sản", "tuanchau"),
  e(3, "07:00", "meal", "Hotel breakfast", "Ăn sáng tại khách sạn", "tuanchau"),
  e(3, "08:00", "transport", "Boat boarding at Tuan Chau", "Lên tàu tại cảng Tuần Châu", "tuanchau", { en: "Tuần Châu harbour, Gate 2", vi: "Cảng Tuần Châu, Cổng 2" }, ["halong"]),
  e(3, "09:00", "activity", "Thien Cung Cave", "Động Thiên Cung", "thiencung"),
  e(3, "10:30", "activity", "Dinh Huong Islet", "Hòn Đỉnh Hương", "dinhhuong"),
  e(3, "11:00", "activity", "Fighting Cocks Islet", "Hòn Gà Chọi", "gachoi"),
  e(3, "12:00", "meal", "Lunch on board", "Ăn trưa trên tàu", "gachoi"),
  e(3, "14:00", "transport", "Coach back to Hà Nội", "Xe về Hà Nội", "tuanchau", { en: "Tuần Châu car park", vi: "Bãi xe Tuần Châu" }),
  e(3, "17:30", "hotel", "Check in – Thăng Long Espana 3★", "Nhận phòng – Thăng Long Espana 3★", "hanoi4"),
  e(3, "19:00", "meal", "Dinner – Phở Hà Nội", "Ăn tối – Phở Hà Nội", "hanoi4", undefined, ["pho"]),
  e(4, "07:00", "meal", "Hotel breakfast", "Ăn sáng tại khách sạn", "hanoi4"),
  e(4, "08:30", "activity", "Old Quarter free time", "Tự do dạo phố cổ", "hanoi4"),
  e(4, "11:00", "transport", "Check out, meet in lobby", "Trả phòng, tập trung tại sảnh", "hanoi4", { en: "Hotel lobby with luggage", vi: "Sảnh khách sạn kèm hành lý" }),
  e(4, "11:30", "meal", "Farewell lunch", "Bữa trưa chia tay", "hanoi4"),
  e(4, "12:30", "transport", "Coach to Noi Bai", "Xe ra sân bay Nội Bài", "han4"),
  e(4, "15:00", "transport", "Boarding flight to SGN", "Lên máy bay về SGN", "han4", { en: "Boarding gate – Noi Bai T1", vi: "Cửa ra tàu bay – Nội Bài T1" }),
  e(4, "17:15", "transport", "Arrive Tan Son Nhat – tour ends", "Về đến Tân Sơn Nhất – kết thúc", "sgn4"),
];

/** Each slot ends when the next one starts on the same day (last slot of a day ends 22:00, final one 17:45). */
export const EVENTS: TourEvent[] = RAW.map((ev, i) => {
  const nx = RAW[i + 1];
  const end = nx && nx.day === ev.day ? nx.time : i === RAW.length - 1 ? "17:45" : "22:00";
  return { ...ev, end };
});


export const CITIES = {
  hanoi: { name: { en: "Hà Nội", vi: "Hà Nội" }, lat: 21.0285, lng: 105.8542, days: [1, 3, 4] },
  ninhbinh: { name: { en: "Ninh Bình", vi: "Ninh Bình" }, lat: 20.2506, lng: 105.9745, days: [2] },
  halong: { name: { en: "Hạ Long", vi: "Hạ Long" }, lat: 20.9599, lng: 107.0425, days: [2, 3] },
} as const;

export type GuideItem = { id: string; kind: "history" | "legend" | "food"; img?: Stop["img"]; title: L; body: L };

export const GUIDE: GuideItem[] = [
  { id: "thanglong", kind: "history", img: "hanoi", title: { en: "Thăng Long – the Ascending Dragon", vi: "Thăng Long – Rồng bay lên" }, body: { en: "In 1010 Emperor Lý Thái Tổ moved the capital from Hoa Lư to Đại La. Legend says a golden dragon rose from the Red River as he arrived, so he named the city Thăng Long — 'Ascending Dragon'. For a thousand years it remained the political heart of Đại Việt, and its citadel is now a UNESCO World Heritage Site.", vi: "Năm 1010, vua Lý Thái Tổ dời đô từ Hoa Lư về Đại La. Tương truyền khi thuyền vua cập bến, một con rồng vàng bay lên từ sông Hồng, vua bèn đặt tên là Thăng Long — 'Rồng bay lên'. Suốt nghìn năm, nơi đây là trung tâm chính trị của Đại Việt; Hoàng thành nay là Di sản Thế giới UNESCO." } },
  { id: "hoankiem", kind: "legend", img: "hanoi", title: { en: "Legend of the Returned Sword", vi: "Sự tích Hồ Gươm" }, body: { en: "After defeating the Ming invaders with a magic sword, King Lê Lợi went boating on the lake. A golden turtle rose and asked for the sword back on behalf of the Dragon King. Lê Lợi returned it, and the lake was renamed Hoàn Kiếm — 'Lake of the Returned Sword'.", vi: "Sau khi đánh thắng giặc Minh nhờ thanh gươm thần, vua Lê Lợi dạo thuyền trên hồ. Rùa Vàng nổi lên đòi lại gươm cho Long Vương. Vua trả gươm, từ đó hồ được gọi là Hoàn Kiếm — Hồ Gươm." } },
  { id: "halong", kind: "legend", img: "halong", title: { en: "Where the Dragon Descended", vi: "Nơi rồng đáp xuống" }, body: { en: "When invaders came by sea, the Jade Emperor sent a mother dragon and her children. They spat out jewels and jade that became thousands of islands, forming a wall against the enemy ships. The place where she landed became Hạ Long — 'Descending Dragon'.", vi: "Khi giặc ngoại xâm kéo đến từ biển, Ngọc Hoàng sai Rồng Mẹ cùng đàn rồng con xuống giúp. Rồng nhả châu ngọc tạo thành hàng nghìn hòn đảo chặn thuyền giặc. Nơi Rồng Mẹ đáp xuống gọi là Hạ Long." } },
  { id: "trangan", kind: "history", img: "trangan", title: { en: "Tràng An & the ancient capital Hoa Lư", vi: "Tràng An & cố đô Hoa Lư" }, body: { en: "Ninh Bình was Vietnam's capital under the Đinh and Early Lê dynasties (968–1009). Tràng An's karst towers, caves and wetlands hold traces of human life over 30,000 years old — it became Vietnam's first mixed natural and cultural UNESCO site in 2014.", vi: "Ninh Bình là kinh đô thời Đinh và Tiền Lê (968–1009). Các núi đá vôi, hang động và đầm nước Tràng An lưu dấu con người hơn 30.000 năm — năm 2014 trở thành di sản hỗn hợp đầu tiên của Việt Nam." } },
  { id: "pho", kind: "food", title: { en: "Phở Hà Nội", vi: "Phở Hà Nội" }, body: { en: "Clear beef broth simmered for hours with charred ginger, onion, star anise and cinnamon, poured over flat rice noodles and thin slices of beef. Hanoians eat it for breakfast — try Phở Bát Đàn or Phở Thìn.", vi: "Nước dùng bò trong, ninh nhiều giờ với gừng, hành nướng, hoa hồi và quế, chan lên bánh phở và thịt bò thái mỏng. Người Hà Nội ăn phở buổi sáng — hãy thử Phở Bát Đàn hay Phở Thìn." } },
  { id: "chaca", kind: "food", title: { en: "Chả cá Lã Vọng", vi: "Chả cá Lã Vọng" }, body: { en: "Turmeric-marinated fish sizzled at your table with heaps of dill and spring onion, eaten with rice vermicelli, peanuts and shrimp paste. So famous the street was renamed Chả Cá.", vi: "Cá ướp nghệ rán ngay tại bàn cùng thì là và hành, ăn kèm bún, lạc rang và mắm tôm. Nổi tiếng đến mức con phố được đặt tên là phố Chả Cá." } },
  { id: "comchay", kind: "food", img: "trangan", title: { en: "Ninh Bình crispy rice & goat dishes", vi: "Cơm cháy dê núi Ninh Bình" }, body: { en: "Crispy scorched-rice crackers topped with a savoury meat sauce, alongside the region's free-range goat dishes — served rare with lemongrass and herbs, or stir-fried.", vi: "Cơm cháy giòn rụm chan nước sốt thịt, ăn cùng đặc sản dê núi thả trên núi đá — tái chanh sả lá mơ hoặc xào lăn." } },
];

/** Absolute timestamp of an event given the tour's first day (YYYY-MM-DD). Vietnam is UTC+7. */
export function eventTime(start: string, ev: Pick<TourEvent, "day" | "time">) {
  const [y = 2026, m = 1, d = 1] = start.split("-").map(Number);
  const [hh = 0, mm = 0] = ev.time.split(":").map(Number);
  return Date.UTC(y, m - 1, d + ev.day - 1, hh - 7, mm);
}

export const stopById = (id?: string) => STOPS.find((s) => s.id === id);

/** External Google Maps link for a stop (opens in a new tab; no API key needed). */
export const mapsLink = (s: Pick<Stop, "lat" | "lng">) => `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
