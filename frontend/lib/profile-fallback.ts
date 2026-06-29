export function profileInitials(value: string | null | undefined): string {
  const cleaned = (value ?? "")
    .replace(/^@/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (cleaned.length >= 2) {
    return `${cleaned[0][0]}${cleaned[1][0]}`.toUpperCase();
  }

  const compact = cleaned[0] ?? "";
  if (compact.length >= 2) {
    const ofIndex = compact.toLowerCase().lastIndexOf("of");
    if (ofIndex > 0 && compact[ofIndex + 2]) {
      return `${compact[0]}${compact[ofIndex + 2]}`.toUpperCase();
    }
    return `${compact[0]}${compact[compact.length - 1]}`.toUpperCase();
  }

  return (compact[0] ?? "IC").toUpperCase();
}
