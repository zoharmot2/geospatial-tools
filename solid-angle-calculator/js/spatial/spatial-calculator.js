/**
 * Cartesian and WGS84 spatial solid-angle calculation pipeline.
 */

import { distance, dot, subtract } from "../core/vector3.js";
import { triangulatedSurfaceSolidAngle } from "../core/solid-angle.js";
import { analyzePlanarity } from "./planarity.js";
import {
  removeClosingDuplicate,
  removeConsecutiveDuplicates,
  countUniqueVertices,
  projectToPlane2D,
  signedArea2D,
  hasSelfIntersections,
  pointInPolygon2D,
} from "./polygon.js";
import { triangulateSimplePolygon } from "./triangulation.js";
import {
  geographicGeometryToLocal,
  validateGeographicCoordinate,
} from "./coordinate-utils.js";

const VERTEX_EPSILON = 1e-10;

function finiteCartesianPoint(point, name) {
  if (
    !point ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    !Number.isFinite(point.z)
  ) {
    throw new TypeError(`${name} must contain finite X, Y, and Z values.`);
  }
}

function centroid3D(vertices) {
  const n = vertices.length;
  return vertices.reduce(
    (acc, p) => ({ x: acc.x + p.x / n, y: acc.y + p.y / n, z: acc.z + p.z / n }),
    { x: 0, y: 0, z: 0 }
  );
}

function prepareCartesian(observer, vertices) {
  finiteCartesianPoint(observer, "Observer");
  vertices.forEach((v, i) => finiteCartesianPoint(v, `Vertex ${i + 1}`));

  return {
    observer,
    vertices,
  };
}

function prepareGeographic(observer, vertices) {
  validateGeographicCoordinate(observer);
  vertices.forEach((v) => validateGeographicCoordinate(v));
  return geographicGeometryToLocal(observer, vertices);
}

function diagnoseObserverPlane(observer, projection, planarity, polygon2D) {
  if (!planarity.normal) return [];

  const observerVector = subtract(observer, planarity.centroid);
  const planeDistance = Math.abs(dot(observerVector, planarity.normal));
  const threshold = Math.max((planarity.scale ?? 1) * 1e-8, 1e-8);

  if (planeDistance > threshold) return [];

  const projectedObserver = {
    x: dot(observerVector, projection.u),
    y: dot(observerVector, projection.v),
  };

  if (pointInPolygon2D(projectedObserver, polygon2D)) {
    return [
      "The observer lies on or extremely close to the target plane and projects inside the target polygon. The solid angle is singular or numerically sensitive."
    ];
  }

  return [
    "The observer lies on or extremely close to the target plane. Interpret the result with care."
  ];
}

export function calculateSpatialSolidAngle({
  coordinateMode,
  observer,
  vertices,
}) {
  if (!Array.isArray(vertices) || vertices.length < 3) {
    throw new RangeError("Target requires at least three vertices.");
  }

  let prepared;
  if (coordinateMode === "cartesian") {
    prepared = prepareCartesian(observer, vertices);
  } else if (coordinateMode === "geographic") {
    prepared = prepareGeographic(observer, vertices);
  } else {
    throw new RangeError("Unsupported coordinate mode.");
  }

  const cleanedVertices = removeConsecutiveDuplicates(
    removeClosingDuplicate(prepared.vertices),
    VERTEX_EPSILON
  );

  if (cleanedVertices.length < 3 || countUniqueVertices(cleanedVertices) < 3) {
    throw new RangeError("Target requires at least three unique vertices.");
  }

  for (let i = 0; i < cleanedVertices.length; i += 1) {
    if (distance(prepared.observer, cleanedVertices[i]) <= VERTEX_EPSILON) {
      throw new RangeError(`Observer coincides with target vertex ${i + 1}.`);
    }
  }

  const planarity = analyzePlanarity(cleanedVertices);

  if (planarity.status === "DEGENERATE") {
    throw new RangeError("Target polygon is degenerate or has zero area.");
  }

  if (
    cleanedVertices.length > 3 &&
    planarity.status === "NON_PLANAR"
  ) {
    throw new RangeError(
      "Target vertices are substantially non-planar. Version 1.0 supports arbitrary triangles and planar or approximately planar polygons."
    );
  }

  const projection = projectToPlane2D(
    cleanedVertices,
    planarity.centroid,
    planarity.normal
  );

  const area2D = signedArea2D(projection.points2D);
  if (Math.abs(area2D) <= 1e-12) {
    throw new RangeError("Target polygon has zero or near-zero projected area.");
  }

  if (hasSelfIntersections(projection.points2D)) {
    throw new RangeError(
      "Target polygon self-intersects. Reorder the vertices to define one simple polygon."
    );
  }

  const triangleIndices = triangulateSimplePolygon(projection.points2D);
  const triangles = triangleIndices.map(([a, b, c]) => [
    cleanedVertices[a],
    cleanedVertices[b],
    cleanedVertices[c],
  ]);

  const omega = triangulatedSurfaceSolidAngle(
    prepared.observer,
    triangles
  );

  const center = centroid3D(cleanedVertices);
  const vertexDistances = cleanedVertices.map((vertex) =>
    distance(prepared.observer, vertex)
  );

  const warnings = [];
  if (planarity.status === "APPROXIMATELY_PLANAR") {
    warnings.push(
      "The target is approximately planar rather than perfectly planar. It was projected to its representative plane for topology and triangulation."
    );
  }
  warnings.push(
    ...diagnoseObserverPlane(
      prepared.observer,
      projection,
      planarity,
      projection.points2D
    )
  );

  return {
    omega,
    localObserver: prepared.observer,
    localVertices: cleanedVertices,
    triangles,
    triangleIndices,
    diagnostics: {
      vertexCount: cleanedVertices.length,
      triangleCount: triangles.length,
      centroidDistance: distance(prepared.observer, center),
      nearestVertexDistance: Math.min(...vertexDistances),
      farthestVertexDistance: Math.max(...vertexDistances),
      planarityStatus: planarity.status,
      planarityMaxDeviation: planarity.maxDeviation,
      planarityRelativeDeviation: planarity.relativeDeviation,
      coordinateMode,
    },
    warnings,
  };
}
