import { Point } from '../types/schema';

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points (in degrees)
 */
export function angleBetweenPoints(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Calculate midpoint between two points
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Snap a value to a grid
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap a point to a grid
 */
export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

/**
 * Find the closest point on a line segment to a given point
 */
export function closestPointOnSegment(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point
): Point {
  const dx = segmentEnd.x - segmentStart.x;
  const dy = segmentEnd.y - segmentStart.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    return { ...segmentStart };
  }
  
  let t = ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  
  return {
    x: segmentStart.x + t * dx,
    y: segmentStart.y + t * dy,
  };
}

/**
 * Check if a point is within a rectangle
 */
export function pointInRect(
  point: Point,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  rotation: number = 0
): boolean {
  // If rotated, transform the point to local coordinates
  if (rotation !== 0) {
    const centerX = rectX + rectWidth / 2;
    const centerY = rectY + rectHeight / 2;
    const angle = -rotation * (Math.PI / 180);
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    
    point = {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  }
  
  return (
    point.x >= rectX &&
    point.x <= rectX + rectWidth &&
    point.y >= rectY &&
    point.y <= rectY + rectHeight
  );
}

/**
 * Get the bounding box of a set of points
 */
export function getBoundingBox(points: Point[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Rotate a point around a center
 */
export function rotatePoint(point: Point, center: Point, angleDegrees: number): Point {
  const angle = angleDegrees * (Math.PI / 180);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Normalize an angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

/**
 * Snap angle to nearest 45-degree increment
 */
export function snapAngle(angle: number, snapDegrees: number = 45): number {
  return Math.round(angle / snapDegrees) * snapDegrees;
}
