import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  type TimezoneInfo,
  TIMEZONE_LIST,
  formatTime,
} from "~/lib/timezone-data";

const ITEM_TYPE = "TIMEZONE_CARD";

type SidebarProps = {
  selectedTimezones: TimezoneInfo[];
  selectedHour: number;
  onAddTimezone: (timezone: TimezoneInfo) => void;
  onRemoveTimezone: (id: string) => void;
  onReorderTimezones: (fromIndex: number, toIndex: number) => void;
};

type DraggableCardProps = {
  timezone: TimezoneInfo;
  index: number;
  isFirst: boolean;
  hourInTz: number;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

const DraggableTimezoneCard = ({
  timezone,
  index,
  isFirst,
  hourInTz,
  onRemove,
  onMove,
}: DraggableCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index === index) return;
      onMove(item.index, index);
      item.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemove(timezone.id);
    }
  };

  return (
    <div
      ref={ref}
      className={`rounded-xl p-4 transition-all group cursor-grab active:cursor-grabbing ${
        isFirst
          ? "bg-blue-50 border border-blue-100"
          : "bg-white border border-slate-100 hover:border-slate-200 shadow-sm"
      } ${isDragging ? "opacity-50 scale-95" : ""} ${isOver ? "border-blue-400 border-dashed" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {/* Drag handle */}
            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
            <span className={`font-semibold truncate ${isFirst ? "text-blue-900" : "text-slate-700"}`}>
              {timezone.city}
            </span>
            {isFirst && (
              <span className="shrink-0 text-[9px] font-bold uppercase bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">
                Base
              </span>
            )}
          </div>
          <div className="text-slate-400 text-xs pl-6">
            GMT{timezone.offset >= 0 ? "+" : ""}{timezone.offset}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(timezone.id);
          }}
          onKeyDown={handleRemoveKeyDown}
          className={`opacity-0 group-hover:opacity-100 w-6 h-6 -mt-1 -mr-1 flex items-center justify-center rounded-md transition-all ${
            isFirst 
              ? "hover:bg-blue-100 text-blue-400 hover:text-blue-600" 
              : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          }`}
          aria-label={`Remove ${timezone.city}`}
          tabIndex={0}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className={`text-2xl font-semibold tracking-tight tabular-nums pl-6 ${
        isFirst ? "text-blue-700" : "text-slate-800"
      }`}>
        {formatTime(hourInTz)}
      </div>
    </div>
  );
};

const SidebarContent = ({
  selectedTimezones,
  selectedHour,
  onAddTimezone,
  onRemoveTimezone,
  onReorderTimezones,
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const firstTimezone = selectedTimezones[0];

  const availableTimezones = TIMEZONE_LIST.filter(
    (tz) => !selectedTimezones.some((selected) => selected.id === tz.id)
  );

  const filteredTimezones = availableTimezones.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <aside className="w-72 bg-[#FAFBFC] border-r border-slate-200/80 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
          Timezones
        </h1>
        <p className="text-slate-400 text-sm mt-1">Compare world times</p>
      </div>

      {/* Add timezone */}
      <div className="px-4 mb-4 relative">
        <button
          onClick={handleToggleDropdown}
          className="w-full px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 text-left flex items-center justify-between transition-all text-sm shadow-sm"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-slate-500">Add city...</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 bg-slate-50 border-none rounded-md text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
            </div>
            <ul className="max-h-56 overflow-y-auto" role="listbox">
              {filteredTimezones.map((tz) => (
                <li
                  key={tz.id}
                  onClick={() => handleSelectTimezone(tz)}
                  onKeyDown={(e) => handleKeyDown(e, tz)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                  role="option"
                  tabIndex={0}
                  aria-label={`Add ${tz.city}`}
                >
                  <span className="font-medium text-slate-700">{tz.city}</span>
                  <span className="text-slate-400 text-xs">
                    {tz.offset >= 0 ? "+" : ""}{tz.offset}
                  </span>
                </li>
              ))}
              {filteredTimezones.length === 0 && (
                <li className="px-4 py-4 text-slate-400 text-center text-sm">No results</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Timezone cards */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {selectedTimezones.map((tz, index) => (
          <DraggableTimezoneCard
            key={tz.id}
            timezone={tz}
            index={index}
            isFirst={index === 0}
            hourInTz={getHourInTimezone(tz)}
            onRemove={onRemoveTimezone}
            onMove={onReorderTimezones}
          />
        ))}

        {selectedTimezones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Add a timezone to begin</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Drag to reorder • Click timeline to select time
        </p>
      </div>
    </aside>
  );
};

export const Sidebar = (props: SidebarProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarContent {...props} />
    </DndProvider>
  );
};
