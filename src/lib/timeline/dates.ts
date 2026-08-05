import type { DatePrecision, HistoricalDate } from "./types";

export function parseTimelineDate(value: string): { value: string; precision: DatePrecision; timestamp: number } {
  const normalized = value.replace(/\./g, "-");
  if (!/^\d{4}(-\d{2})?(-\d{2})?$/.test(normalized)) throw new Error(`Invalid timeline date: ${value}`);
  const [year, month = "01", day = "01"] = normalized.split("-");
  const precision: DatePrecision = normalized.length === 4 ? "year" : normalized.length === 7 ? "month" : "day";
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  return { value: normalized, precision, timestamp };
}
export function historicalDate(value: string, sourceIds: string[], kind: HistoricalDate["kind"] = "announced"): HistoricalDate {
  const parsed = parseTimelineDate(value);
  return { value: parsed.value, precision: parsed.precision, kind, sourceIds };
}
export function compareTimelineDates(a: string, b: string) { return parseTimelineDate(a).timestamp - parseTimelineDate(b).timestamp; }
export function monthDistance(a: string, b: string) { const from = parseTimelineDate(a); const to = parseTimelineDate(b); return (new Date(to.timestamp).getUTCFullYear() - new Date(from.timestamp).getUTCFullYear()) * 12 + new Date(to.timestamp).getUTCMonth() - new Date(from.timestamp).getUTCMonth(); }