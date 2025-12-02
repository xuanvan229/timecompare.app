import { useRef, useCallback, useEffect, useState } from "react";
import {
  type TimezoneInfo,
  formatHour,
} from "~/lib/timezone-data";

type TimezoneComparisonProps = {
  timezones: TimezoneInfo[];
  selectedHour: number; // Hour in the first timezone (0-24)
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

const TIME_GROUPS: TimeGroup[] = [
  { name: "Late Night", startHour: 0, endHour: 6, labelColor: "bg-slate-800 text-slate-200", blockColor: "bg-slate-700 dark:bg-slate-900" },
  { name: "Morning", startHour: 6, endHour: 12, labelColor: "bg-amber-400/80 text-amber-900", blockColor: "bg-amber-200 dark:bg-amber-500/50" },
  { name: "Afternoon", startHour: 12, endHour: 18, labelColor: "bg-orange-400/80 text-orange-900", blockColor: "bg-orange-200 dark:bg-orange-500/50" },
  { name: "Night", startHour: 18, endHour: 24, labelColor: "bg-indigo-700/80 text-indigo-100", blockColor: "bg-indigo-200 dark:bg-indigo-500/50" },
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

  // Get the hour in a timezone for a given hour in the first timezone
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

  // Effect for external sync: mouse/touch event listeners on window
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
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Time Comparison
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Click or drag on the timeline to compare times
            {firstTimezone && (
              <span className="ml-1">
                (based on <span className="font-medium text-fuchsia-500">{firstTimezone.city}</span>)
              </span>
            )}
          </p>
        </div>

        {/* Time group labels */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-24 shrink-0" />
          <div className="flex-1 flex gap-0.5">
            {TIME_GROUPS.map((group) => {
              const width = ((group.endHour - group.startHour) / 24) * 100;
              return (
                <div
                  key={group.name}
                  className={`h-6 rounded-md flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide ${group.labelColor}`}
                  style={{ width: `${width}%` }}
                >
                  {group.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hour labels - shows hours 0-23 for the first timezone */}
        <div className="flex items-center gap-4 mb-1">
          <div className="w-24 shrink-0" />
          <div className="flex-1 flex text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {HOURS.map((h) => (
              <div key={h} className="w-[calc(100%/24)] text-center">
                {h % 3 === 0 ? h : ""}
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
                <div key={tz.id} className="flex items-center gap-4 group">
                  {/* City name */}
                  <div className="w-24 shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onRemoveTimezone(tz.id)}
                      onKeyDown={(e) => handleRemoveKeyDown(e, tz.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs"
                      aria-label={`Remove ${tz.city}`}
                      tabIndex={0}
                    >
                      ×
                    </button>
                    <span className={`font-medium truncate text-sm ${isFirst ? "text-fuchsia-500" : "text-slate-700 dark:text-slate-200"}`}>
                      {tz.city}
                    </span>
                  </div>

                  {/* Hour blocks - this is the draggable area */}
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
                    <div className={`flex h-10 bg-white dark:bg-slate-900 rounded-lg border overflow-hidden ${isFirst ? "border-fuchsia-400" : "border-slate-300 dark:border-slate-600"}`}>
                      {HOURS.map((firstTzHour) => {
                        // For the first timezone, firstTzHour IS the hour
                        // For other timezones, calculate what hour it is there when it's firstTzHour in the first timezone
                        const tzHour = isFirst ? firstTzHour : getHourInTimezone(firstTzHour, tz);
                        const timeGroup = getTimeGroupForHour(tzHour);

                        return (
                          <div
                            key={firstTzHour}
                            className={`
                              w-[calc(100%/24)] h-full border-r border-slate-300/50 dark:border-slate-600/50 last:border-r-0 transition-colors duration-150
                              ${timeGroup.blockColor}
                            `}
                            title={`${tz.city}: ${formatHour(tzHour)}`}
                          />
                        );
                      })}
                    </div>

                    {/* Time indicator line for this row */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 pointer-events-none transition-all duration-75"
                      style={{
                        left: `${linePosition}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="absolute inset-0 bg-slate-900 dark:bg-white" />
                      {/* Show handle only on first row */}
                      {index === 0 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white shadow-lg border-2 border-white dark:border-slate-900 cursor-grab active:cursor-grabbing" />
                      )}
                      {/* Show handle only on last row */}
                      {index === timezones.length - 1 && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white shadow-lg border-2 border-white dark:border-slate-900 cursor-grab active:cursor-grabbing" />
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
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No timezones selected
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Add timezones from the sidebar to compare times
            </p>
          </div>
        )}

        {/* Legend */}
        {timezones.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            {TIME_GROUPS.map((group) => (
              <div key={group.name} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${group.blockColor}`} />
                <span>{group.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
