/**
 * Unit conversion and formatting helpers.
 */

export const ANGLE_UNITS = Object.freeze({
  DEGREES: "degrees",
  RADIANS: "radians",
});

export function degreesToRadians(degrees) {
  if (!Number.isFinite(degrees)) {
    throw new TypeError("degrees must be finite.");
  }
  return degrees * Math.PI / 180;
}

export function radiansToDegrees(radians) {
  if (!Number.isFinite(radians)) {
    throw new TypeError("radians must be finite.");
  }
  return radians * 180 / Math.PI;
}

export function steradiansToSquareDegrees(steradians) {
  if (!Number.isFinite(steradians)) {
    throw new TypeError("steradians must be finite.");
  }
  const factor = 180 / Math.PI;
  return steradians * factor * factor;
}

export function percentOfFullSphere(steradians) {
  if (!Number.isFinite(steradians)) {
    throw new TypeError("steradians must be finite.");
  }
  return 100 * steradians / (4 * Math.PI);
}

export function percentOfHemisphere(steradians) {
  if (!Number.isFinite(steradians)) {
    throw new TypeError("steradians must be finite.");
  }
  return 100 * steradians / (2 * Math.PI);
}

/**
 * Equivalent circular-cone half-angle for 0 <= Ω <= 2π.
 * Returns radians.
 */
export function equivalentConeHalfAngle(steradians) {
  if (!Number.isFinite(steradians)) {
    throw new TypeError("steradians must be finite.");
  }

  const max = 2 * Math.PI;
  const epsilon = 1e-12;

  if (steradians < -epsilon || steradians > max + epsilon) {
    throw new RangeError("Equivalent cone half-angle is defined here only for 0 ≤ Ω ≤ 2π.");
  }

  const omega = Math.min(max, Math.max(0, steradians));
  const cosine = 1 - omega / (2 * Math.PI);

  // Defensive clamping for floating-point drift.
  return Math.acos(Math.min(1, Math.max(-1, cosine)));
}

export function formatNumber(value, decimalPlaces = 6) {
  if (!Number.isFinite(value)) return String(value);
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 15) {
    throw new RangeError("decimalPlaces must be an integer between 0 and 15.");
  }

  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e9)) {
    return value.toExponential(decimalPlaces);
  }

  return value.toFixed(decimalPlaces);
}
