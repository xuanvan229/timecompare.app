import { useState, useCallback } from "react";
import type { Route } from "./+types/home";
import { Sidebar } from "~/components/Sidebar";
import { TimezoneComparison } from "~/components/TimezoneComparison";
import {
  type TimezoneInfo,
  TIMEZONE_LIST,
} from "~/lib/timezone-data";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Timezone Comparison" },
    { name: "description", content: "Compare times across different timezones" },
  ];
}

// Default timezones: Ho Chi Minh and Tokyo
const DEFAULT_TIMEZONES = [
  TIMEZONE_LIST.find((tz) => tz.id === "asia-ho-chi-minh")!,
  TIMEZONE_LIST.find((tz) => tz.id === "asia-tokyo")!,
].filter(Boolean);

export default function Home() {
  const [selectedTimezones, setSelectedTimezones] = useState<TimezoneInfo[]>(DEFAULT_TIMEZONES);
  // Selected hour in the FIRST timezone (0-24)
  const [selectedHour, setSelectedHour] = useState<number>(12);

  const handleAddTimezone = useCallback((timezone: TimezoneInfo) => {
    setSelectedTimezones((prev) => [...prev, timezone]);
  }, []);

  const handleRemoveTimezone = useCallback((id: string) => {
    setSelectedTimezones((prev) => prev.filter((tz) => tz.id !== id));
  }, []);

  const handleReorderTimezones = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedTimezones((prev) => {
      const newList = [...prev];
      const [moved] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, moved);
      return newList;
    });
  }, []);

  const handleHourChange = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      <Sidebar
        selectedTimezones={selectedTimezones}
        selectedHour={selectedHour}
        onAddTimezone={handleAddTimezone}
        onRemoveTimezone={handleRemoveTimezone}
        onReorderTimezones={handleReorderTimezones}
      />
      <TimezoneComparison
        timezones={selectedTimezones}
        selectedHour={selectedHour}
        onHourChange={handleHourChange}
        onRemoveTimezone={handleRemoveTimezone}
      />
    </div>
  );
}
