/**
 * Internal ear-clipping triangulation for a simple 2D polygon without holes.
 *
 * Returns triangles as arrays of original vertex indices.
 */

import { signedArea2D } from "./polygon.js";

const EPS = 1e-12;

function cross2D(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointInTriangle(p, a, b, c, epsilon = EPS) {
  const c1 = cross2D(a, b, p);
  const c2 = cross2D(b, c, p);
  const c3 = cross2D(c, a, p);

  const hasNeg = c1 < -epsilon || c2 < -epsilon || c3 < -epsilon;
  const hasPos = c1 > epsilon || c2 > epsilon || c3 > epsilon;

  return !(hasNeg && hasPos);
}

export function triangulateSimplePolygon(points) {
  if (!Array.isArray(points) || points.length < 3) {
    throw new RangeError("A polygon requires at least three points.");
  }

  if (points.length === 3) return [[0, 1, 2]];

  const area = signedArea2D(points);
  if (Math.abs(area) <= EPS) {
    throw new RangeError("Polygon has zero or near-zero area.");
  }

  const ccw = area > 0;
  const indices = points.map((_, index) => index);
  const triangles = [];

  const isConvex = (prev, curr, next) => {
    const value = cross2D(points[prev], points[curr], points[next]);
    return ccw ? value > EPS : value < -EPS;
  };

  let guard = 0;
  const guardLimit = points.length * points.length * 4;

  while (indices.length > 3) {
    let earFound = false;

    for (let i = 0; i < indices.length; i += 1) {
      const prev = indices[(i - 1 + indices.length) % indices.length];
      const curr = indices[i];
      const next = indices[(i + 1) % indices.length];

      if (!isConvex(prev, curr, next)) continue;

      let containsOther = false;
      for (const candidate of indices) {
        if (candidate === prev || candidate === curr || candidate === next) continue;
        if (
          pointInTriangle(
            points[candidate],
            points[prev],
            points[curr],
            points[next]
          )
        ) {
          containsOther = true;
          break;
        }
      }

      if (containsOther) continue;

      triangles.push([prev, curr, next]);
      indices.splice(i, 1);
      earFound = true;
      break;
    }

    if (!earFound) {
      throw new RangeError(
        "Polygon could not be triangulated. Check vertex order, duplicate points, or self-intersections."
      );
    }

    guard += 1;
    if (guard > guardLimit) {
      throw new Error("Triangulation exceeded the safety iteration limit.");
    }
  }

  triangles.push([indices[0], indices[1], indices[2]]);
  return triangles;
}
