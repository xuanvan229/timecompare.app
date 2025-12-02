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
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleToggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Timezones</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar
          selectedTimezones={selectedTimezones}
          selectedHour={selectedHour}
          onAddTimezone={handleAddTimezone}
          onRemoveTimezone={handleRemoveTimezone}
          onReorderTimezones={handleReorderTimezones}
          onClose={handleCloseSidebar}
          isMobile={isSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-14 lg:pt-0 overflow-hidden">
        <TimezoneComparison
          timezones={selectedTimezones}
          selectedHour={selectedHour}
          onHourChange={handleHourChange}
          onRemoveTimezone={handleRemoveTimezone}
        />
      </div>
    </div>
  );
}
