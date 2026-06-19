export type PhysicsVec2 = {
  x: number;
  y: number;
};

export function physicsVec2(x = 0, y = 0): PhysicsVec2 {
  return { x, y };
}

export function addPhysicsVec2(a: PhysicsVec2, b: PhysicsVec2): PhysicsVec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function subtractPhysicsVec2(a: PhysicsVec2, b: PhysicsVec2): PhysicsVec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function scalePhysicsVec2(value: PhysicsVec2, scalar: number): PhysicsVec2 {
  return {
    x: value.x * scalar,
    y: value.y * scalar,
  };
}

export function dotPhysicsVec2(a: PhysicsVec2, b: PhysicsVec2): number {
  return a.x * b.x + a.y * b.y;
}

export function magnitudePhysicsVec2(value: PhysicsVec2): number {
  return Math.sqrt(value.x * value.x + value.y * value.y);
}

export function normalizePhysicsVec2(value: PhysicsVec2): PhysicsVec2 {
  const magnitude = magnitudePhysicsVec2(value);

  if (magnitude === 0) return physicsVec2();

  return {
    x: value.x / magnitude,
    y: value.y / magnitude,
  };
}

export function distancePhysicsVec2(a: PhysicsVec2, b: PhysicsVec2): number {
  return magnitudePhysicsVec2(subtractPhysicsVec2(a, b));
}
