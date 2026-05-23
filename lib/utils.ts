/** Convert average speed (m/s) to a "M'SS\"" per-km pace string. */
export function formatPace(avgSpeed: number): string {
  if (avgSpeed <= 0) return "--";
  const paceDecimal = 1000 / avgSpeed / 60;
  const paceMin = Math.floor(paceDecimal);
  const paceSec = Math.round((paceDecimal - paceMin) * 60);
  return `${paceMin}'${paceSec.toString().padStart(2, "0")}"`;
}
