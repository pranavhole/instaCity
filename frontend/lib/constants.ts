export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const STAT_FORMATTER = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1
});
