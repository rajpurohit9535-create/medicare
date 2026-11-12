import { format, parse, isBefore, isAfter, addMinutes } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Returns time of day greeting/description ("Morning", "Afternoon", "Evening", "Night")
 */
export function getTimeOfDayPeriod(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Afternoon";
  if (hours >= 17 && hours < 21) return "Evening";
  return "Night";
}

/**
 * Friendly header text for patient screens, e.g. "Thursday, 12 November. Morning. 8:05 AM."
 */
export function formatPatientHeaderDate(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE
): {
  dayAndDate: string;
  period: string;
  timeString: string;
  fullString: string;
} {
  const zoned = toZonedTime(date, timeZone);
  const dayAndDate = formatTz(zoned, "EEEE, d MMMM", { timeZone });
  const period = getTimeOfDayPeriod(zoned);
  const timeString = formatTz(zoned, "h:mm a", { timeZone });
  const fullString = `${dayAndDate}. ${period}. ${timeString}.`;

  return { dayAndDate, period, timeString, fullString };
}

/**
 * Formats task time for display e.g. "08:00:00" -> "8:00 AM"
 */
export function formatTaskTime(timeStr: string): string {
  try {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return format(date, "h:mm a");
  } catch {
    return timeStr;
  }
}

/**
 * Gets day of week index for Postgres: 1=Mon .. 7=Sun
 */
export function getPostgresDayOfWeek(date: Date = new Date()): number {
  const jsDay = date.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  return jsDay === 0 ? 7 : jsDay;
}
