export function formatBuildingMetric(value: number, suffix = "") {
  return `${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

export function districtAccent(district: string) {
  const accents: Record<string, string> = {
    Tech: "#79ffe1",
    Fashion: "#ffd1dc",
    Food: "#ffb703",
    Travel: "#90e0ef",
    Gaming: "#ff006e",
    Music: "#4cc9f0",
    Art: "#8338ec",
    Default: "#19c2a0"
  };
  return accents[district] ?? accents.Default;
}
