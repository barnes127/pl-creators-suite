export type DistanceUnit = "m" | "cm" | "mm" | "km" | "in" | "ft";
export type TimeUnit = "s" | "ms" | "min" | "hr";
export type MassUnit = "kg" | "g" | "lb";

const distanceToMeters: Record<DistanceUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
};

const timeToSeconds: Record<TimeUnit, number> = {
  s: 1,
  ms: 0.001,
  min: 60,
  hr: 3600,
};

const massToKilograms: Record<MassUnit, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
};

export function convertDistance(
  value: number,
  from: DistanceUnit,
  to: DistanceUnit
): number {
  return (value * distanceToMeters[from]) / distanceToMeters[to];
}

export function convertTime(value: number, from: TimeUnit, to: TimeUnit): number {
  return (value * timeToSeconds[from]) / timeToSeconds[to];
}

export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
  return (value * massToKilograms[from]) / massToKilograms[to];
}

export function meters(value: number): number {
  return convertDistance(value, "m", "m");
}

export function seconds(value: number): number {
  return convertTime(value, "s", "s");
}

export function kilograms(value: number): number {
  return convertMass(value, "kg", "kg");
}
