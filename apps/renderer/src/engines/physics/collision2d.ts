import type { PhysicsVec2 } from "./vector2";

export type Aabb2D = {
  id: string;
  position: PhysicsVec2;
  size: PhysicsVec2;
};

export type Collision2D = {
  aId: string;
  bId: string;
  overlapX: number;
  overlapY: number;
};

export function intersectsAabb2D(a: Aabb2D, b: Aabb2D): boolean {
  return (
    a.position.x < b.position.x + b.size.x &&
    a.position.x + a.size.x > b.position.x &&
    a.position.y < b.position.y + b.size.y &&
    a.position.y + a.size.y > b.position.y
  );
}

export function getAabbCollision2D(a: Aabb2D, b: Aabb2D): Collision2D | null {
  if (!intersectsAabb2D(a, b)) return null;

  const aRight = a.position.x + a.size.x;
  const bRight = b.position.x + b.size.x;
  const aBottom = a.position.y + a.size.y;
  const bBottom = b.position.y + b.size.y;

  const overlapX = Math.min(aRight, bRight) - Math.max(a.position.x, b.position.x);
  const overlapY =
    Math.min(aBottom, bBottom) - Math.max(a.position.y, b.position.y);

  return {
    aId: a.id,
    bId: b.id,
    overlapX,
    overlapY,
  };
}

export function findAabbCollisions2D(items: Aabb2D[]): Collision2D[] {
  const collisions: Collision2D[] = [];

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const collision = getAabbCollision2D(items[i], items[j]);

      if (collision) collisions.push(collision);
    }
  }

  return collisions;
}
