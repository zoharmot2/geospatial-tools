export function assertClose(actual, expected, tolerance, label = "value") {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    throw new Error(`${label}: expected finite values; actual=${actual}, expected=${expected}`);
  }

  const error = Math.abs(actual - expected);
  if (error > tolerance) {
    throw new Error(
      `${label}: expected ${expected}, got ${actual}; |Δ|=${error}, tolerance=${tolerance}`
    );
  }
}

export function assertEqual(actual, expected, label = "value") {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

export function assertThrows(fn, label = "function") {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }

  if (!threw) {
    throw new Error(`${label}: expected function to throw.`);
  }
}
