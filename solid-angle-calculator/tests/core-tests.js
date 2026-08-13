import {
  add,
  subtract,
  dot,
  cross,
  magnitude,
  normalize,
  distance,
} from "../js/core/vector3.js";

import {
  coneSolidAngle,
  diskSolidAngle,
  rectangleSolidAngle,
  sphereSolidAngle,
} from "../js/core/simple-geometries.js";

import {
  triangleSolidAngleSigned,
  triangleSolidAngle,
  triangulatedSurfaceSolidAngle,
} from "../js/core/solid-angle.js";

import {
  degreesToRadians,
  radiansToDegrees,
  steradiansToSquareDegrees,
  percentOfFullSphere,
  percentOfHemisphere,
  equivalentConeHalfAngle,
} from "../js/core/units.js";

import {
  assertClose,
  assertEqual,
  assertThrows,
} from "./assertions.js";

const TESTS = [];

function test(name, fn) {
  TESTS.push({ name, fn });
}

const EPS = 1e-12;

test("vector add/subtract", () => {
  const a = { x: 1, y: 2, z: 3 };
  const b = { x: 4, y: -1, z: 2 };
  const sum = add(a, b);
  assertEqual(sum.x, 5, "sum.x");
  assertEqual(sum.y, 1, "sum.y");
  assertEqual(sum.z, 5, "sum.z");

  const diff = subtract(a, b);
  assertEqual(diff.x, -3, "diff.x");
  assertEqual(diff.y, 3, "diff.y");
  assertEqual(diff.z, 1, "diff.z");
});

test("vector dot and cross", () => {
  const x = { x: 1, y: 0, z: 0 };
  const y = { x: 0, y: 1, z: 0 };

  assertClose(dot(x, y), 0, EPS, "dot");
  const z = cross(x, y);
  assertClose(z.x, 0, EPS, "cross.x");
  assertClose(z.y, 0, EPS, "cross.y");
  assertClose(z.z, 1, EPS, "cross.z");
});

test("vector magnitude, distance, normalize", () => {
  const v = { x: 3, y: 4, z: 0 };
  assertClose(magnitude(v), 5, EPS, "magnitude");
  assertClose(distance({ x: 0, y: 0, z: 0 }, v), 5, EPS, "distance");

  const n = normalize(v);
  assertClose(magnitude(n), 1, EPS, "normalized magnitude");
});

test("cone 60° half-angle = π sr", () => {
  const omega = coneSolidAngle(degreesToRadians(60));
  assertClose(omega, Math.PI, EPS, "cone 60");
});

test("cone 90° half-angle = 2π sr", () => {
  const omega = coneSolidAngle(degreesToRadians(90));
  assertClose(omega, 2 * Math.PI, EPS, "cone 90");
});

test("cone 180° half-angle = 4π sr", () => {
  const omega = coneSolidAngle(Math.PI);
  assertClose(omega, 4 * Math.PI, EPS, "cone 180");
});

test("disk radius=distance", () => {
  const omega = diskSolidAngle(1, 1);
  const expected = 2 * Math.PI * (1 - 1 / Math.sqrt(2));
  assertClose(omega, expected, EPS, "disk");
});

test("rectangle reference case = 2π/3 sr", () => {
  // Half-width a=1, half-height b=1, distance=1 => width=2, height=2.
  const omega = rectangleSolidAngle(2, 2, 1);
  assertClose(omega, 2 * Math.PI / 3, EPS, "rectangle");
});

test("sphere observer inside = 4π sr", () => {
  const omega = sphereSolidAngle(2, 1);
  assertClose(omega, 4 * Math.PI, EPS, "sphere inside");
});

test("sphere observer on surface = 2π sr", () => {
  const omega = sphereSolidAngle(2, 2);
  assertClose(omega, 2 * Math.PI, EPS, "sphere surface");
});

test("orthogonal triangle = π/2 sr", () => {
  const observer = { x: 0, y: 0, z: 0 };
  const p1 = { x: 1, y: 0, z: 0 };
  const p2 = { x: 0, y: 1, z: 0 };
  const p3 = { x: 0, y: 0, z: 1 };

  assertClose(
    triangleSolidAngle(observer, p1, p2, p3),
    Math.PI / 2,
    EPS,
    "orthogonal triangle"
  );
});

test("triangle winding reverses signed solid angle", () => {
  const o = { x: 0, y: 0, z: 0 };
  const a = { x: 1, y: 0, z: 0 };
  const b = { x: 0, y: 1, z: 0 };
  const c = { x: 0, y: 0, z: 1 };

  const forward = triangleSolidAngleSigned(o, a, b, c);
  const reverse = triangleSolidAngleSigned(o, a, c, b);

  assertClose(forward, -reverse, EPS, "winding sign");
});

test("triangle translation invariance", () => {
  const o = { x: 0, y: 0, z: 0 };
  const a = { x: 1, y: 0, z: 0 };
  const b = { x: 0, y: 1, z: 0 };
  const c = { x: 0, y: 0, z: 1 };

  const t = { x: 100, y: -50, z: 17 };

  const translated = (p) => ({
    x: p.x + t.x,
    y: p.y + t.y,
    z: p.z + t.z,
  });

  const omega1 = triangleSolidAngle(o, a, b, c);
  const omega2 = triangleSolidAngle(
    translated(o),
    translated(a),
    translated(b),
    translated(c)
  );

  assertClose(omega1, omega2, EPS, "translation invariance");
});

test("triangle uniform-scale invariance", () => {
  const o = { x: 0, y: 0, z: 0 };
  const a = { x: 1, y: 0, z: 0 };
  const b = { x: 0, y: 1, z: 0 };
  const c = { x: 0, y: 0, z: 1 };

  const k = 1000;
  const scaled = (p) => ({ x: p.x * k, y: p.y * k, z: p.z * k });

  const omega1 = triangleSolidAngle(o, a, b, c);
  const omega2 = triangleSolidAngle(
    scaled(o),
    scaled(a),
    scaled(b),
    scaled(c)
  );

  assertClose(omega1, omega2, EPS, "scale invariance");
});

test("triangle rotation invariance around z axis", () => {
  const o = { x: 0, y: 0, z: 0 };
  const a = { x: 1, y: 0, z: 0 };
  const b = { x: 0, y: 1, z: 0 };
  const c = { x: 0, y: 0, z: 1 };

  const theta = 0.713;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  const rotateZ = (p) => ({
    x: p.x * cosT - p.y * sinT,
    y: p.x * sinT + p.y * cosT,
    z: p.z,
  });

  const omega1 = triangleSolidAngle(o, a, b, c);
  const omega2 = triangleSolidAngle(
    rotateZ(o),
    rotateZ(a),
    rotateZ(b),
    rotateZ(c)
  );

  assertClose(omega1, omega2, EPS, "rotation invariance");
});

test("triangulated surface sums signed contributions before magnitude", () => {
  const o = { x: 0, y: 0, z: 0 };

  const t1 = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ];

  const t2 = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 1, z: 0 },
  ];

  const result = triangulatedSurfaceSolidAngle(o, [t1, t2]);
  assertClose(result, Math.PI, EPS, "surface sum");
});

test("steradian conversions", () => {
  assertClose(steradiansToSquareDegrees(4 * Math.PI), 41252.96124941927, 1e-9, "sphere deg²");
  assertClose(percentOfFullSphere(Math.PI), 25, EPS, "full sphere percent");
  assertClose(percentOfHemisphere(Math.PI), 50, EPS, "hemisphere percent");
});

test("equivalent cone for Ω=π has 60° half-angle", () => {
  const theta = equivalentConeHalfAngle(Math.PI);
  assertClose(radiansToDegrees(theta), 60, EPS, "equivalent cone");
});

test("invalid standard-geometry inputs throw", () => {
  assertThrows(() => diskSolidAngle(0, 1), "zero disk radius");
  assertThrows(() => rectangleSolidAngle(1, -1, 1), "negative rectangle height");
  assertThrows(() => coneSolidAngle(Math.PI + 0.1), "cone > 180°");
});

test("observer coincident with triangle vertex throws", () => {
  const o = { x: 0, y: 0, z: 0 };
  assertThrows(
    () => triangleSolidAngle(
      o,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    ),
    "coincident observer"
  );
});

export async function runCoreTests() {
  const results = [];

  for (const { name, fn } of TESTS) {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
