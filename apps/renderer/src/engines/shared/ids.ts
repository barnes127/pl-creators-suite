export function createEngineId(prefix: string): string {
  const cleanPrefix = String(prefix || "engine")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safePrefix = cleanPrefix || "engine";
  const random = Math.random().toString(36).slice(2, 8);

  return `${safePrefix}-${Date.now()}-${random}`;
}

export function normalizeEngineName(value: string, fallback = "Untitled"): string {
  const clean = String(value || "").trim();

  return clean || fallback;
}
