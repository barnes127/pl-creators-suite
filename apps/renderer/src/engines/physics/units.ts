export type DistanceUnit = "m" | "cm" | "mm" | "km" | "in" | "ft";
export type TimeUnit = "s" | "ms" | "min" | "hr";
export type MassUnit = "kg" | "g" | "lb";
export type VelocityUnit = "m/s" | "km/hr" | "ft/s";
export type AccelerationUnit = "m/s^2" | "ft/s^2";
export type ForceUnit = "N" | "lbf";

export type QuantityDimension =
  | "distance"
  | "time"
  | "mass"
  | "velocity"
  | "acceleration"
  | "force";

export type Unit =
  | DistanceUnit
  | TimeUnit
  | MassUnit
  | VelocityUnit
  | AccelerationUnit
  | ForceUnit;

export type Quantity<TUnit extends Unit = Unit> = {
  value: number;
  unit: TUnit;
  dimension: QuantityDimension;
};

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

const velocityToMetersPerSecond: Record<VelocityUnit, number> = {
  "m/s": 1,
  "km/hr": 1000 / 3600,
  "ft/s": 0.3048,
};

const accelerationToMetersPerSecondSquared: Record<AccelerationUnit, number> = {
  "m/s^2": 1,
  "ft/s^2": 0.3048,
};

const forceToNewtons: Record<ForceUnit, number> = {
  N: 1,
  lbf: 4.4482216152605,
};

export function createQuantity<TUnit extends Unit>(
  value: number,
  unit: TUnit,
  dimension: QuantityDimension
): Quantity<TUnit> {
  return {
    value: Number.isFinite(value) ? value : 0,
    unit,
    dimension,
  };
}

export function distance(value: number, unit: DistanceUnit = "m"): Quantity<DistanceUnit> {
  return createQuantity(value, unit, "distance");
}

export function time(value: number, unit: TimeUnit = "s"): Quantity<TimeUnit> {
  return createQuantity(value, unit, "time");
}

export function mass(value: number, unit: MassUnit = "kg"): Quantity<MassUnit> {
  return createQuantity(value, unit, "mass");
}

export function velocity(
  value: number,
  unit: VelocityUnit = "m/s"
): Quantity<VelocityUnit> {
  return createQuantity(value, unit, "velocity");
}

export function acceleration(
  value: number,
  unit: AccelerationUnit = "m/s^2"
): Quantity<AccelerationUnit> {
  return createQuantity(value, unit, "acceleration");
}

export function force(value: number, unit: ForceUnit = "N"): Quantity<ForceUnit> {
  return createQuantity(value, unit, "force");
}

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

export function convertVelocity(
  value: number,
  from: VelocityUnit,
  to: VelocityUnit
): number {
  return (value * velocityToMetersPerSecond[from]) / velocityToMetersPerSecond[to];
}

export function convertAcceleration(
  value: number,
  from: AccelerationUnit,
  to: AccelerationUnit
): number {
  return (
    (value * accelerationToMetersPerSecondSquared[from]) /
    accelerationToMetersPerSecondSquared[to]
  );
}

export function convertForce(value: number, from: ForceUnit, to: ForceUnit): number {
  return (value * forceToNewtons[from]) / forceToNewtons[to];
}

export function convertQuantity<TUnit extends Unit>(
  quantity: Quantity,
  toUnit: TUnit
): Quantity<TUnit> {
  switch (quantity.dimension) {
    case "distance":
      return distance(
        convertDistance(quantity.value, quantity.unit as DistanceUnit, toUnit as DistanceUnit),
        toUnit as DistanceUnit
      ) as Quantity<TUnit>;

    case "time":
      return time(
        convertTime(quantity.value, quantity.unit as TimeUnit, toUnit as TimeUnit),
        toUnit as TimeUnit
      ) as Quantity<TUnit>;

    case "mass":
      return mass(
        convertMass(quantity.value, quantity.unit as MassUnit, toUnit as MassUnit),
        toUnit as MassUnit
      ) as Quantity<TUnit>;

    case "velocity":
      return velocity(
        convertVelocity(quantity.value, quantity.unit as VelocityUnit, toUnit as VelocityUnit),
        toUnit as VelocityUnit
      ) as Quantity<TUnit>;

    case "acceleration":
      return acceleration(
        convertAcceleration(
          quantity.value,
          quantity.unit as AccelerationUnit,
          toUnit as AccelerationUnit
        ),
        toUnit as AccelerationUnit
      ) as Quantity<TUnit>;

    case "force":
      return force(
        convertForce(quantity.value, quantity.unit as ForceUnit, toUnit as ForceUnit),
        toUnit as ForceUnit
      ) as Quantity<TUnit>;

    default:
      throw new Error(`Unsupported quantity dimension: ${quantity.dimension}`);
  }
}

export function formatQuantity(quantity: Quantity, precision = 4): string {
  return `${quantity.value.toFixed(precision)} ${quantity.unit}`;
}

export function divideDistanceByTime(
  distanceQuantity: Quantity<DistanceUnit>,
  timeQuantity: Quantity<TimeUnit>,
  outputUnit: VelocityUnit = "m/s"
): Quantity<VelocityUnit> {
  const metersValue = convertDistance(distanceQuantity.value, distanceQuantity.unit, "m");
  const secondsValue = convertTime(timeQuantity.value, timeQuantity.unit, "s");

  if (secondsValue === 0) {
    throw new Error("Cannot divide distance by zero time");
  }

  const metersPerSecond = metersValue / secondsValue;

  return velocity(convertVelocity(metersPerSecond, "m/s", outputUnit), outputUnit);
}

export function multiplyMassByAcceleration(
  massQuantity: Quantity<MassUnit>,
  accelerationQuantity: Quantity<AccelerationUnit>,
  outputUnit: ForceUnit = "N"
): Quantity<ForceUnit> {
  const kilogramsValue = convertMass(massQuantity.value, massQuantity.unit, "kg");
  const metersPerSecondSquaredValue = convertAcceleration(
    accelerationQuantity.value,
    accelerationQuantity.unit,
    "m/s^2"
  );

  const newtons = kilogramsValue * metersPerSecondSquaredValue;

  return force(convertForce(newtons, "N", outputUnit), outputUnit);
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
