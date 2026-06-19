export type PhysicsVec3 = {
  x: number;
  y: number;
  z: number;
};

export function physicsVec3(x = 0, y = 0, z = 0): PhysicsVec3 {
  return { x, y, z };
}

export function addPhysicsVec3(a: PhysicsVec3, b: PhysicsVec3): PhysicsVec3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

export function subtractPhysicsVec3(a: PhysicsVec3, b: PhysicsVec3): PhysicsVec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

export function scalePhysicsVec3(value: PhysicsVec3, scalar: number): PhysicsVec3 {
  return {
    x: value.x * scalar,
    y: value.y * scalar,
    z: value.z * scalar,
  };
}

export function dotPhysicsVec3(a: PhysicsVec3, b: PhysicsVec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function crossPhysicsVec3(a: PhysicsVec3, b: PhysicsVec3): PhysicsVec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function magnitudePhysicsVec3(value: PhysicsVec3): number {
  return Math.sqrt(value.x * value.x + value.y * value.y + value.z * value.z);
}

export function normalizePhysicsVec3(value: PhysicsVec3): PhysicsVec3 {
  const magnitude = magnitudePhysicsVec3(value);

  if (magnitude === 0) return physicsVec3();

  return {
    x: value.x / magnitude,
    y: value.y / magnitude,
    z: value.z / magnitude,
  };
}

export function physicsVec3FromTuple(value: [number, number, number]): PhysicsVec3 {
  return {
    x: value[0],
    y: value[1],
    z: value[2],
  };
}

export function physicsVec3ToTuple(value: PhysicsVec3): [number, number, number] {
  return [value.x, value.y, value.z];
}
