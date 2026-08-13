/**
 * Closed-form solid-angle formulas for standard geometries.
 * Return values are always in steradians.
 */

const TWO_PI = 2 * Math.PI;
const FOUR_PI = 4 * Math.PI;

function finitePositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite value greater than zero.`);
  }
}

function finiteNonNegative(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite value greater than or equal to zero.`);
  }
}

/**
 * Solid angle of a right circular cone from its half-angle in radians.
 * Valid geometric range: 0 <= theta <= pi.
 */
export function coneSolidAngle(halfAngleRadians) {
  finiteNonNegative(halfAngleRadians, "halfAngleRadians");

  if (halfAngleRadians > Math.PI) {
    throw new RangeError("Cone half-angle must not exceed π radians (180°).");
  }

  return TWO_PI * (1 - Math.cos(halfAngleRadians));
}

/**
 * Solid angle of a circular disk perpendicular to the viewing axis and
 * centered on that axis.
 *
 * radius and distance may use any common length unit.
 */
export function diskSolidAngle(radius, distance) {
  finitePositive(radius, "radius");
  finitePositive(distance, "distance");

  return TWO_PI * (1 - distance / Math.sqrt(distance * distance + radius * radius));
}

/**
 * Solid angle of a rectangle perpendicular to and centered on the viewing axis.
 *
 * width, height, and distance may use any common length unit.
 */
export function rectangleSolidAngle(width, height, distance) {
  finitePositive(width, "width");
  finitePositive(height, "height");
  finitePositive(distance, "distance");

  const a = width / 2;
  const b = height / 2;
  const denominator = distance * Math.sqrt(
    distance * distance + a * a + b * b
  );

  return 4 * Math.atan2(a * b, denominator);
}

/**
 * Solid angle subtended by a sphere.
 *
 * radius: sphere radius
 * centerDistance: distance from observer to sphere center
 *
 * If observer lies inside sphere, result is 4π.
 * At exactly the sphere surface, the visible limiting solid angle is 2π.
 */
export function sphereSolidAngle(radius, centerDistance) {
  finitePositive(radius, "radius");
  finiteNonNegative(centerDistance, "centerDistance");

  if (centerDistance < radius) {
    return FOUR_PI;
  }

  if (centerDistance === radius) {
    return TWO_PI;
  }

  return TWO_PI * (
    1 - Math.sqrt(centerDistance * centerDistance - radius * radius) / centerDistance
  );
}

export const SIMPLE_GEOMETRY_CONSTANTS = Object.freeze({
  TWO_PI,
  FOUR_PI,
});
