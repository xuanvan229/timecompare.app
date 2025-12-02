import { useState, useCallback } from "react";
import type { Route } from "./+types/home";
import { Sidebar } from "~/components/Sidebar";
import { TimezoneComparison } from "~/components/TimezoneComparison";
import {
  type TimezoneInfo,
  TIMEZONE_LIST,
  getCurrentHourInTimezone,
} from "~/lib/timezone-data";

export function meta({}: Route.MetaArgs) {
  const title = "Timezone Converter & Comparison Tool | World Clock";
  const description =
    "Free timezone converter and comparison tool. Easily compare times across multiple cities worldwide. Perfect for scheduling international meetings, remote work coordination, and travel planning.";
  const url = "https://tz-app.vercel.app"; // Update with your actual domain
  const image = `${url}/og-image.png`; // Add an OG image to public folder

  return [
    // Primary Meta Tags
    { title },
    { name: "description", content: description },
    { name: "keywords", content: "timezone converter, world clock, time zone comparison, international time, meeting scheduler, time difference calculator, global time zones" },
    { name: "author", content: "TZ App" },
    { name: "robots", content: "index, follow" },
    { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:site_name", content: "TZ App - Timezone Converter" },
    { property: "og:locale", content: "en_US" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },

    // Additional SEO
    { name: "theme-color", content: "#0f172a" },
    { name: "apple-mobile-web-app-title", content: "TZ App" },
    { name: "application-name", content: "TZ App" },

    // Canonical URL
    { tagName: "link", rel: "canonical", href: url },
  ];
}

// Default timezones: Ho Chi Minh and Tokyo
const DEFAULT_TIMEZONES = [
  TIMEZONE_LIST.find((tz) => tz.id === "asia-ho-chi-minh")!,
  TIMEZONE_LIST.find((tz) => tz.id === "asia-tokyo")!,
].filter(Boolean);

// Get current hour in the first default timezone
const getInitialHour = () => {
  const firstTz = DEFAULT_TIMEZONES[0];
  if (firstTz) {
    return getCurrentHourInTimezone(firstTz.offset);
  }
  return 12; // fallback
};

export default function Home() {
  const [selectedTimezones, setSelectedTimezones] = useState<TimezoneInfo[]>(DEFAULT_TIMEZONES);
  const [selectedHour, setSelectedHour] = useState<number>(getInitialHour);
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
