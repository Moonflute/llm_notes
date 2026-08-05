import { parseTimelineDate } from "./dates";
export interface TimeScale { start: number; end: number; width: number; at(date: string): number; invert(x: number): string }
export function createTimeScale(start: string, end: string, width: number): TimeScale {
  const from = parseTimelineDate(start).timestamp; const to = parseTimelineDate(end).timestamp;
  if (to <= from || width <= 0) throw new Error("Invalid time scale range");
  return { start: from, end: to, width, at(date) { return ((parseTimelineDate(date).timestamp - from) / (to - from)) * width; }, invert(x) { const date = new Date(from + Math.max(0, Math.min(width, x)) / width * (to - from)); return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; } };
}