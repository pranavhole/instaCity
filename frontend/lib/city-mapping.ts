export function formatBuildingMetric(value: number, suffix = "") {
  return `${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

export function districtAccent(district: string) {
  const accents: Record<string, string> = {
    Tech: "#ff7a45",
    Fashion: "#ff2f87",
    Food: "#ffb15c",
    Travel: "#b238d8",
    Gaming: "#7c2be8",
    Music: "#ff4fb0",
    Art: "#c45cff",
    Default: "#ff2f87"
  };
  return accents[district] ?? accents.Default;
}
