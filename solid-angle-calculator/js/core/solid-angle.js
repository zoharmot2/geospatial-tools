/**
 * General solid-angle mathematics.
 *
 * The signed triangle formula follows the robust atan2 form using observer-relative
 * vectors a, b, c. Orientation is preserved internally.
 */

import {
  subtract,
  dot,
  cross,
  magnitude,
  assertVector3,
} from "./vector3.js";

const DEFAULT_EPSILON = 1e-15;

/**
 * Signed solid angle of a 3D triangle from an observer point.
 * Returns steradians in approximately [-2π, 2π].
 *
 * Reversing triangle winding reverses the sign.
 */
export function triangleSolidAngleSigned(observer, p1, p2, p3, epsilon = DEFAULT_EPSILON) {
  assertVector3(observer, "observer");
  assertVector3(p1, "p1");
  assertVector3(p2, "p2");
  assertVector3(p3, "p3");

  const a = subtract(p1, observer);
  const b = subtract(p2, observer);
  const c = subtract(p3, observer);

  const la = magnitude(a);
  const lb = magnitude(b);
  const lc = magnitude(c);

  if (la <= epsilon || lb <= epsilon || lc <= epsilon) {
    throw new RangeError("Observer must not coincide with a triangle vertex.");
  }

  const numerator = dot(a, cross(b, c));

  const denominator =
    la * lb * lc +
    dot(a, b) * lc +
    dot(b, c) * la +
    dot(c, a) * lb;

  // atan2 safely handles denominator values near or below zero.
  return 2 * Math.atan2(numerator, denominator);
}

/**
 * User-facing triangle solid-angle magnitude.
 */
export function triangleSolidAngle(observer, p1, p2, p3, epsilon = DEFAULT_EPSILON) {
  return Math.abs(
    triangleSolidAngleSigned(observer, p1, p2, p3, epsilon)
  );
}

/**
 * Solid angle of an explicitly triangulated oriented surface.
 *
 * triangles is an array of [p1, p2, p3].
 * Orientation should be consistent across triangles.
 *
 * Returns the positive magnitude of the summed signed contributions.
 */
export function triangulatedSurfaceSolidAngle(observer, triangles, epsilon = DEFAULT_EPSILON) {
  assertVector3(observer, "observer");

  if (!Array.isArray(triangles) || triangles.length === 0) {
    throw new RangeError("triangles must contain at least one triangle.");
  }

  let signedTotal = 0;

  for (const triangle of triangles) {
    if (!Array.isArray(triangle) || triangle.length !== 3) {
      throw new TypeError("Each triangle must contain exactly three vertices.");
    }

    signedTotal += triangleSolidAngleSigned(
      observer,
      triangle[0],
      triangle[1],
      triangle[2],
      epsilon
    );
  }

  return Math.abs(signedTotal);
}
