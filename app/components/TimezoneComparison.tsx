import { useRef, useCallback, useEffect, useState } from "react";
import {
  type TimezoneInfo,
  formatHour,
} from "~/lib/timezone-data";

type TimezoneComparisonProps = {
  timezones: TimezoneInfo[];
  selectedHour: number;
  onHourChange: (hour: number) => void;
  onRemoveTimezone: (id: string) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

type TimeGroup = {
  name: string;
  startHour: number;
  endHour: number;
  labelColor: string;
  blockColor: string;
};

// Clean color palette with more saturation
const TIME_GROUPS: TimeGroup[] = [
  { name: "Night", startHour: 0, endHour: 6, labelColor: "bg-slate-700 text-white", blockColor: "bg-slate-500" },
  { name: "Morning", startHour: 6, endHour: 12, labelColor: "bg-amber-200 text-amber-800", blockColor: "bg-amber-200" },
  { name: "Afternoon", startHour: 12, endHour: 18, labelColor: "bg-sky-200 text-sky-800", blockColor: "bg-sky-200" },
  { name: "Evening", startHour: 18, endHour: 24, labelColor: "bg-indigo-400 text-white", blockColor: "bg-indigo-200" },
];

const getTimeGroupForHour = (hour: number): TimeGroup => {
  const normalizedHour = ((hour % 24) + 24) % 24;
  return TIME_GROUPS.find(
    (group) => normalizedHour >= group.startHour && normalizedHour < group.endHour
  ) || TIME_GROUPS[0];
};

export const TimezoneComparison = ({
  timezones,
  selectedHour,
  onHourChange,
  onRemoveTimezone,
}: TimezoneComparisonProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const firstTimezone = timezones[0];

  const getHourInTimezone = (firstTzHour: number, tz: TimezoneInfo): number => {
    if (!firstTimezone) return firstTzHour;
    const offsetDiff = tz.offset - firstTimezone.offset;
    return (firstTzHour + offsetDiff + 24) % 24;
  };

  const calculateHourFromPosition = useCallback(
    (clientX: number) => {
      if (!timelineRef.current) return selectedHour;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      return percentage * 24;
    },
    [selectedHour]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const hour = calculateHourFromPosition(e.clientX);
      onHourChange(hour);
    },
    [calculateHourFromPosition, onHourChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const hour = calculateHourFromPosition(e.clientX);
      onHourChange(hour);
    },
    [isDragging, calculateHourFromPosition, onHourChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      const hour = calculateHourFromPosition(touch.clientX);
      onHourChange(hour);
    },
    [calculateHourFromPosition, onHourChange]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const hour = calculateHourFromPosition(touch.clientX);
      onHourChange(hour);
    },
    [isDragging, calculateHourFromPosition, onHourChange]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const linePosition = (selectedHour / 24) * 100;

  const handleRemoveKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemoveTimezone(id);
    }
  };

  return (
    <div className="flex-1 bg-white p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Time Comparison
          </h2>
          {firstTimezone && (
            <p className="text-slate-400 text-sm mt-1">
              Based on {firstTimezone.city} time
            </p>
          )}
        </div>

        {/* Time period labels */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[120px] shrink-0" />
          <div className="flex-1 flex gap-1">
            {TIME_GROUPS.map((group) => {
              const width = ((group.endHour - group.startHour) / 24) * 100;
              return (
                <div
                  key={group.name}
                  className={`h-7 rounded-md flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider ${group.labelColor}`}
                  style={{ width: `${width}%` }}
                >
                  {group.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hour markers */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[120px] shrink-0" />
          <div className="flex-1 flex text-[10px] text-slate-400 font-medium">
            {HOURS.map((h) => (
              <div key={h} className="w-[calc(100%/24)] text-center">
                {h % 6 === 0 ? formatHour(h) : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline rows */}
        {timezones.length > 0 && (
          <div className="space-y-2">
            {timezones.map((tz, index) => {
              const isFirst = index === 0;
              return (
                <div key={tz.id} className="flex items-center gap-3 group">
                  {/* City label */}
                  <div className="w-[120px] shrink-0 flex items-center justify-end gap-1.5 pr-1">
                    <span className={`text-sm font-medium truncate ${isFirst ? "text-blue-600" : "text-slate-600"}`}>
                      {tz.city}
                    </span>
                    <button
                      onClick={() => onRemoveTimezone(tz.id)}
                      onKeyDown={(e) => handleRemoveKeyDown(e, tz.id)}
                      className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-opacity"
                      aria-label={`Remove ${tz.city}`}
                      tabIndex={0}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Timeline bar */}
                  <div
                    ref={index === 0 ? timelineRef : undefined}
                    className="flex-1 relative"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={{ cursor: isDragging ? "grabbing" : "ew-resize" }}
                    role="slider"
                    aria-label={`Time selector for ${tz.city}`}
                    aria-valuenow={Math.floor(selectedHour)}
                    aria-valuemin={0}
                    aria-valuemax={24}
                    tabIndex={0}
                  >
                    <div className={`flex h-10 rounded-lg overflow-hidden border ${isFirst ? "border-blue-200 shadow-sm" : "border-slate-200"}`}>
                      {HOURS.map((firstTzHour) => {
                        const tzHour = isFirst ? firstTzHour : getHourInTimezone(firstTzHour, tz);
                        const timeGroup = getTimeGroupForHour(tzHour);

                        return (
                          <div
                            key={firstTzHour}
                            className={`w-[calc(100%/24)] h-full border-r border-white/50 last:border-r-0 transition-colors ${timeGroup.blockColor}`}
                            title={`${tz.city}: ${formatHour(tzHour)}`}
                          />
                        );
                      })}
                    </div>

                    {/* Time indicator line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
                      style={{
                        left: `${linePosition}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="absolute inset-0 bg-blue-500 rounded-full" />
                      {index === 0 && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                      )}
                      {index === timezones.length - 1 && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {timezones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No timezones selected</p>
            <p className="text-xs mt-1">Add cities from the sidebar</p>
          </div>
        )}

        {/* Legend */}
        {timezones.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500">
            {TIME_GROUPS.map((group) => (
              <div key={group.name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${group.blockColor} border border-slate-200`} />
                <span>{group.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
