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

// Default timezones: Ha Noi and Tokyo
const DEFAULT_TIMEZONES = [
  TIMEZONE_LIST.find((tz) => tz.id === "vn")!,
  TIMEZONE_LIST.find((tz) => tz.id === "jst")!,
];

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

  const handleHourChange = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        selectedTimezones={selectedTimezones}
        selectedHour={selectedHour}
        onAddTimezone={handleAddTimezone}
        onRemoveTimezone={handleRemoveTimezone}
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
