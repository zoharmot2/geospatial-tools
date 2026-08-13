/**
 * Polygon validation and 3D-to-local-2D projection.
 */

import {
  subtract,
  dot,
  cross,
  magnitude,
  normalize,
  distance,
} from "../core/vector3.js";

const EPS = 1e-12;

export function removeClosingDuplicate(vertices, tolerance = EPS) {
  if (vertices.length < 2) return [...vertices];
  if (distance(vertices[0], vertices[vertices.length - 1]) <= tolerance) {
    return vertices.slice(0, -1);
  }
  return [...vertices];
}

export function removeConsecutiveDuplicates(vertices, tolerance = EPS) {
  const cleaned = [];
  for (const vertex of vertices) {
    if (!cleaned.length || distance(cleaned[cleaned.length - 1], vertex) > tolerance) {
      cleaned.push(vertex);
    }
  }
  return removeClosingDuplicate(cleaned, tolerance);
}

export function countUniqueVertices(vertices, tolerance = EPS) {
  const unique = [];
  for (const vertex of vertices) {
    if (!unique.some((other) => distance(vertex, other) <= tolerance)) {
      unique.push(vertex);
    }
  }
  return unique.length;
}

function chooseBasis(normal) {
  // Choose a reference axis least parallel to normal.
  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);

  let reference;
  if (ax <= ay && ax <= az) {
    reference = { x: 1, y: 0, z: 0 };
  } else if (ay <= ax && ay <= az) {
    reference = { x: 0, y: 1, z: 0 };
  } else {
    reference = { x: 0, y: 0, z: 1 };
  }

  const u = normalize(cross(reference, normal));
  const v = normalize(cross(normal, u));
  return { u, v };
}

export function projectToPlane2D(vertices, origin, normal) {
  const { u, v } = chooseBasis(normal);

  return {
    points2D: vertices.map((point) => {
      const r = subtract(point, origin);
      return { x: dot(r, u), y: dot(r, v) };
    }),
    u,
    v,
    origin,
    normal,
  };
}

export function signedArea2D(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointOnSegment(a, b, p, epsilon = EPS) {
  if (Math.abs(orientation(a, b, p)) > epsilon) return false;
  return (
    p.x >= Math.min(a.x, b.x) - epsilon &&
    p.x <= Math.max(a.x, b.x) + epsilon &&
    p.y >= Math.min(a.y, b.y) - epsilon &&
    p.y <= Math.max(a.y, b.y) + epsilon
  );
}

function segmentsIntersect(a, b, c, d, epsilon = EPS) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);

  const proper =
    ((o1 > epsilon && o2 < -epsilon) || (o1 < -epsilon && o2 > epsilon)) &&
    ((o3 > epsilon && o4 < -epsilon) || (o3 < -epsilon && o4 > epsilon));

  if (proper) return true;

  if (Math.abs(o1) <= epsilon && pointOnSegment(a, b, c, epsilon)) return true;
  if (Math.abs(o2) <= epsilon && pointOnSegment(a, b, d, epsilon)) return true;
  if (Math.abs(o3) <= epsilon && pointOnSegment(c, d, a, epsilon)) return true;
  if (Math.abs(o4) <= epsilon && pointOnSegment(c, d, b, epsilon)) return true;

  return false;
}

export function hasSelfIntersections(points) {
  const n = points.length;

  for (let i = 0; i < n; i += 1) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];

    for (let j = i + 1; j < n; j += 1) {
      // Adjacent edges share a vertex and are allowed.
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue;

      const b1 = points[j];
      const b2 = points[(j + 1) % n];

      if (segmentsIntersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }

  return false;
}

export function pointInPolygon2D(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];

    if (pointOnSegment(pj, pi, point)) return true;

    const intersects =
      ((pi.y > point.y) !== (pj.y > point.y)) &&
      point.x <
        ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;

    if (intersects) inside = !inside;
  }

  return inside;
}
