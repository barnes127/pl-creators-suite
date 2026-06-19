import { createEngineId } from "./ids";
import type { EngineMessage } from "./engineTypes";

export function createEngineMessage(
  severity: EngineMessage["severity"],
  message: string,
  source?: string
): EngineMessage {
  return {
    id: createEngineId("message"),
    severity,
    message,
    source,
  };
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (isFiniteNumber(value)) return value;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function requireString(value: unknown, fallback = ""): string {
  const clean = String(value ?? "").trim();

  return clean || fallback;
}
