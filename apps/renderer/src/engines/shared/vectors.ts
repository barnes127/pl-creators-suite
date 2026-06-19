export type Vec2 = {
  x: number;
  y: number;
};

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function addVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function subVec2(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

export function scaleVec2(value: Vec2, scalar: number): Vec2 {
  return {
    x: value.x * scalar,
    y: value.y * scalar,
  };
}

export function magnitudeVec2(value: Vec2): number {
  return Math.sqrt(value.x * value.x + value.y * value.y);
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

export function subVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

export function scaleVec3(value: Vec3, scalar: number): Vec3 {
  return {
    x: value.x * scalar,
    y: value.y * scalar,
    z: value.z * scalar,
  };
}

export function magnitudeVec3(value: Vec3): number {
  return Math.sqrt(value.x * value.x + value.y * value.y + value.z * value.z);
}

export function vec3FromTuple(value: [number, number, number]): Vec3 {
  return {
    x: value[0],
    y: value[1],
    z: value[2],
  };
}

export function vec3ToTuple(value: Vec3): [number, number, number] {
  return [value.x, value.y, value.z];
}
