export type TimezoneInfo = {
  id: string;
  name: string;
  city: string;
  offset: number; // offset in hours from UTC
  abbreviation: string;
};

export const TIMEZONE_LIST: TimezoneInfo[] = [
  { id: "utc", name: "UTC", city: "UTC", offset: 0, abbreviation: "UTC" },
  { id: "pst", name: "America/Los_Angeles", city: "Los Angeles", offset: -8, abbreviation: "PST" },
  { id: "mst", name: "America/Denver", city: "Denver", offset: -7, abbreviation: "MST" },
  { id: "cst", name: "America/Chicago", city: "Chicago", offset: -6, abbreviation: "CST" },
  { id: "est", name: "America/New_York", city: "New York", offset: -5, abbreviation: "EST" },
  { id: "gmt", name: "Europe/London", city: "London", offset: 0, abbreviation: "GMT" },
  { id: "cet", name: "Europe/Paris", city: "Paris", offset: 1, abbreviation: "CET" },
  { id: "eet", name: "Europe/Helsinki", city: "Helsinki", offset: 2, abbreviation: "EET" },
  { id: "msk", name: "Europe/Moscow", city: "Moscow", offset: 3, abbreviation: "MSK" },
  { id: "ist", name: "Asia/Kolkata", city: "Mumbai", offset: 5.5, abbreviation: "IST" },
  { id: "bdt", name: "Asia/Dhaka", city: "Dhaka", offset: 6, abbreviation: "BDT" },
  { id: "ict", name: "Asia/Bangkok", city: "Bangkok", offset: 7, abbreviation: "ICT" },
  { id: "vn", name: "Asia/Ho_Chi_Minh", city: "Ha Noi", offset: 7, abbreviation: "ICT" },
  { id: "cst_china", name: "Asia/Shanghai", city: "Shanghai", offset: 8, abbreviation: "CST" },
  { id: "hkt", name: "Asia/Hong_Kong", city: "Hong Kong", offset: 8, abbreviation: "HKT" },
  { id: "sgt", name: "Asia/Singapore", city: "Singapore", offset: 8, abbreviation: "SGT" },
  { id: "jst", name: "Asia/Tokyo", city: "Tokyo", offset: 9, abbreviation: "JST" },
  { id: "kst", name: "Asia/Seoul", city: "Seoul", offset: 9, abbreviation: "KST" },
  { id: "aest", name: "Australia/Sydney", city: "Sydney", offset: 11, abbreviation: "AEDT" },
  { id: "nzst", name: "Pacific/Auckland", city: "Auckland", offset: 13, abbreviation: "NZDT" },
];

export const getTimezoneById = (id: string): TimezoneInfo | undefined =>
  TIMEZONE_LIST.find((tz) => tz.id === id);

export const getHourInTimezone = (utcHour: number, offset: number): number => {
  const hour = (utcHour + offset + 24) % 24;
  return hour;
};

export const formatHour = (hour: number): string => {
  const h = Math.floor(hour);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}${suffix}`;
};

export const formatTime = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${suffix}`;
};

export const isWorkingHour = (hour: number): boolean => hour >= 9 && hour < 18;

export const getCurrentUTCHour = (): number => {
  const now = new Date();
  return now.getUTCHours() + now.getUTCMinutes() / 60;
};

