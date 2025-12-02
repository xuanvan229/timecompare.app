import { useState } from "react";
import {
  type TimezoneInfo,
  TIMEZONE_LIST,
  formatTime,
} from "~/lib/timezone-data";

type SidebarProps = {
  selectedTimezones: TimezoneInfo[];
  selectedHour: number; // Hour in the first timezone
  onAddTimezone: (timezone: TimezoneInfo) => void;
  onRemoveTimezone: (id: string) => void;
};

export const Sidebar = ({
  selectedTimezones,
  selectedHour,
  onAddTimezone,
  onRemoveTimezone,
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const firstTimezone = selectedTimezones[0];

  // Exclude already selected timezones from dropdown
  const availableTimezones = TIMEZONE_LIST.filter(
    (tz) => !selectedTimezones.some((selected) => selected.id === tz.id)
  );

  const filteredTimezones = availableTimezones.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate hour in a timezone relative to the first timezone
  const getHourInTimezone = (tz: TimezoneInfo): number => {
    if (!firstTimezone) return selectedHour;
    const offsetDiff = tz.offset - firstTimezone.offset;
    return (selectedHour + offsetDiff + 24) % 24;
  };

  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setSearchQuery("");
  };

  const handleSelectTimezone = (timezone: TimezoneInfo) => {
    onAddTimezone(timezone);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, timezone: TimezoneInfo) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectTimezone(timezone);
    }
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemoveTimezone(id);
    }
  };

  return (
    <aside className="w-80 bg-slate-900 text-white p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
          Timezone
        </h1>
        <p className="text-slate-400 text-sm mt-1">Compare times across the world</p>
      </div>

      {/* Add timezone dropdown */}
      <div className="relative mb-6">
        <button
          onClick={handleToggleDropdown}
          className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-left flex items-center justify-between transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-slate-300">Add timezone...</span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                autoFocus
              />
            </div>
            <ul className="max-h-64 overflow-y-auto" role="listbox">
              {filteredTimezones.map((tz) => (
                <li
                  key={tz.id}
                  onClick={() => handleSelectTimezone(tz)}
                  onKeyDown={(e) => handleKeyDown(e, tz)}
                  className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                  role="option"
                  tabIndex={0}
                  aria-label={`Add ${tz.city}`}
                >
                  <span className="font-medium">{tz.city}</span>
                  <span className="text-slate-400 text-sm">
                    UTC{tz.offset >= 0 ? "+" : ""}
                    {tz.offset}
                  </span>
                </li>
              ))}
              {filteredTimezones.length === 0 && (
                <li className="px-4 py-3 text-slate-400 text-center">No timezones found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Selected timezones with times */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Selected Times
        </h2>
        {selectedTimezones.map((tz, index) => {
          const hourInTz = getHourInTimezone(tz);
          const isFirst = index === 0;
          return (
            <div
              key={tz.id}
              className={`rounded-xl p-4 border group ${
                isFirst
                  ? "bg-fuchsia-500/20 border-fuchsia-500/50"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{tz.city}</span>
                    {isFirst && (
                      <span className="text-[10px] uppercase bg-fuchsia-500/30 text-fuchsia-300 px-1.5 py-0.5 rounded">
                        Reference
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {tz.abbreviation} (UTC{tz.offset >= 0 ? "+" : ""}
                    {tz.offset})
                  </div>
                </div>
                <button
                  onClick={() => onRemoveTimezone(tz.id)}
                  onKeyDown={(e) => handleRemoveKeyDown(e, tz.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-sm transition-opacity"
                  aria-label={`Remove ${tz.city}`}
                  tabIndex={0}
                >
                  ×
                </button>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                {formatTime(hourInTz)}
              </div>
            </div>
          );
        })}

        {selectedTimezones.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <div className="text-4xl mb-2">🌍</div>
            <p>Add timezones to compare</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Drag the line to compare times
        </p>
      </div>
    </aside>
  );
};
