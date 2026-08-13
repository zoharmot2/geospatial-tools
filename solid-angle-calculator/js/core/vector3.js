/**
 * Lightweight immutable 3D vector utilities.
 * All functions return new values and never mutate their inputs.
 */

const isFiniteNumber = (value) => Number.isFinite(value);

export function assertVector3(v, name = "vector") {
  if (
    !v ||
    !isFiniteNumber(v.x) ||
    !isFiniteNumber(v.y) ||
    !isFiniteNumber(v.z)
  ) {
    throw new TypeError(`${name} must contain finite x, y, and z values.`);
  }
}

export function add(a, b) {
  assertVector3(a, "a");
  assertVector3(b, "b");
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtract(a, b) {
  assertVector3(a, "a");
  assertVector3(b, "b");
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(v, scalar) {
  assertVector3(v, "v");
  if (!isFiniteNumber(scalar)) {
    throw new TypeError("scalar must be finite.");
  }
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}

export function dot(a, b) {
  assertVector3(a, "a");
  assertVector3(b, "b");
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a, b) {
  assertVector3(a, "a");
  assertVector3(b, "b");
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function magnitudeSquared(v) {
  assertVector3(v, "v");
  return dot(v, v);
}

export function magnitude(v) {
  return Math.sqrt(magnitudeSquared(v));
}

export function distance(a, b) {
  return magnitude(subtract(a, b));
}

export function normalize(v, epsilon = 1e-15) {
  assertVector3(v, "v");
  const m = magnitude(v);
  if (m <= epsilon) {
    throw new RangeError("Cannot normalize a zero-length or near-zero vector.");
  }
  return scale(v, 1 / m);
}

export function almostEqual(a, b, epsilon = 1e-12) {
  assertVector3(a, "a");
  assertVector3(b, "b");
  return distance(a, b) <= epsilon;
}
