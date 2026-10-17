import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "@/lib/app-state";
import { EVENTS, TOUR_START_DATE, eventTime } from "@/data/tour";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn() }) }));

function ClockProbe() {
  const { start, now, setSimOffset } = useApp();
  return <><output aria-label="start">{start}</output><output aria-label="clock">{now}</output><button onClick={() => setSimOffset(9 * 60 + 15)}>Advance</button></>;
}

describe("Tour settings", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("ignores previously editable departure dates", () => {
    localStorage.setItem("tour-prefs", JSON.stringify({ start: "2030-01-01" }));
    render(<AppProvider><ClockProbe /></AppProvider>);
    expect(screen.getByLabelText("start").textContent).toBe(TOUR_START_DATE);
    expect(JSON.parse(localStorage.getItem("tour-prefs") ?? "{}").start).toBe(TOUR_START_DATE);
  });

  it("derives subsequent tour days from the fixed departure date", () => {
    expect(eventTime(TOUR_START_DATE, { day: 4, time: "07:00" }) - eventTime(TOUR_START_DATE, { day: 1, time: "07:00" })).toBe(3 * 86400000);
  });

  it("does not autoplay narration when crossing a scheduled narration, even with old autoplay preferences", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn(), getVoices: () => [] });
    localStorage.setItem("tour-prefs", JSON.stringify({ mode: "sim", simOffset: 9 * 60 + 10, autoNarrate: true }));
    render(<AppProvider><ClockProbe /></AppProvider>);
    act(() => fireEvent.click(screen.getByRole("button", { name: "Advance" })));
    expect(Number(screen.getByLabelText("clock").textContent)).toBe(eventTime(TOUR_START_DATE, { day: 1, time: "09:15" }));
    expect(EVENTS.find((ev) => ev.day === 1 && ev.time === "09:15")?.narrate).toEqual(["thanglong"]);
    expect(speak).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("tour-prefs") ?? "{}").autoNarrate).toBeUndefined();
  });
});