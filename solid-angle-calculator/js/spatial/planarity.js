/**
 * Planarity diagnostics for ordered 3D polygon vertices.
 */

import { subtract, cross, dot, magnitude, normalize } from "../core/vector3.js";

function centroid(vertices) {
  const n = vertices.length;
  return vertices.reduce(
    (acc, p) => ({ x: acc.x + p.x / n, y: acc.y + p.y / n, z: acc.z + p.z / n }),
    { x: 0, y: 0, z: 0 }
  );
}

function newellNormal(vertices) {
  let nx = 0;
  let ny = 0;
  let nz = 0;

  for (let i = 0; i < vertices.length; i += 1) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    nx += (current.y - next.y) * (current.z + next.z);
    ny += (current.z - next.z) * (current.x + next.x);
    nz += (current.x - next.x) * (current.y + next.y);
  }

  return { x: nx, y: ny, z: nz };
}

function bboxDiagonal(vertices) {
  const xs = vertices.map((p) => p.x);
  const ys = vertices.map((p) => p.y);
  const zs = vertices.map((p) => p.z);

  const dx = Math.max(...xs) - Math.min(...xs);
  const dy = Math.max(...ys) - Math.min(...ys);
  const dz = Math.max(...zs) - Math.min(...zs);

  return Math.hypot(dx, dy, dz);
}

export function analyzePlanarity(
  vertices,
  {
    planarRelativeTolerance = 1e-8,
    approximateRelativeTolerance = 1e-5,
    absoluteTolerance = 1e-9,
  } = {}
) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    throw new RangeError("Planarity requires at least three vertices.");
  }

  if (vertices.length === 3) {
    const a = subtract(vertices[1], vertices[0]);
    const b = subtract(vertices[2], vertices[0]);
    const rawNormal = cross(a, b);
    const normalLength = magnitude(rawNormal);

    if (normalLength <= absoluteTolerance) {
      return {
        status: "DEGENERATE",
        maxDeviation: 0,
        relativeDeviation: 0,
        centroid: centroid(vertices),
        normal: null,
      };
    }

    return {
      status: "PLANAR",
      maxDeviation: 0,
      relativeDeviation: 0,
      centroid: centroid(vertices),
      normal: normalize(rawNormal),
    };
  }

  const center = centroid(vertices);
  const rawNormal = newellNormal(vertices);
  const normalLength = magnitude(rawNormal);

  if (normalLength <= absoluteTolerance) {
    return {
      status: "DEGENERATE",
      maxDeviation: Infinity,
      relativeDeviation: Infinity,
      centroid: center,
      normal: null,
    };
  }

  const normal = normalize(rawNormal);
  const scale = Math.max(bboxDiagonal(vertices), absoluteTolerance);
  const deviations = vertices.map((point) =>
    Math.abs(dot(subtract(point, center), normal))
  );
  const maxDeviation = Math.max(...deviations);
  const relativeDeviation = maxDeviation / scale;

  let status = "NON_PLANAR";
  if (maxDeviation <= absoluteTolerance || relativeDeviation <= planarRelativeTolerance) {
    status = "PLANAR";
  } else if (relativeDeviation <= approximateRelativeTolerance) {
    status = "APPROXIMATELY_PLANAR";
  }

  return {
    status,
    maxDeviation,
    relativeDeviation,
    centroid: center,
    normal,
    scale,
  };
}
