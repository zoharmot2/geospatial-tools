import { assertClose, assertEqual, assertThrows } from "./assertions.js";
import { geodeticToECEF, geodeticToENU } from "../js/spatial/coordinate-utils.js";
import { analyzePlanarity } from "../js/spatial/planarity.js";
import { hasSelfIntersections, signedArea2D } from "../js/spatial/polygon.js";
import { triangulateSimplePolygon } from "../js/spatial/triangulation.js";
import { parseGeoJSONPolygon } from "../js/input/geojson-import.js";
import { calculateSpatialSolidAngle } from "../js/spatial/spatial-calculator.js";

const TESTS = [];
const test = (name, fn) => TESTS.push({ name, fn });
const EPS = 1e-9;

test("WGS84 equator prime meridian ECEF", () => {
  const p = geodeticToECEF({ longitude: 0, latitude: 0, height: 0 });
  assertClose(p.x, 6378137, 1e-6, "ECEF X");
  assertClose(p.y, 0, 1e-9, "ECEF Y");
  assertClose(p.z, 0, 1e-9, "ECEF Z");
});

test("ENU observer maps to origin", () => {
  const observer = { longitude: 35, latitude: 32, height: 100 };
  const p = geodeticToENU(observer, observer);
  assertClose(p.x, 0, 1e-9, "E");
  assertClose(p.y, 0, 1e-9, "N");
  assertClose(p.z, 0, 1e-9, "U");
});

test("triangle is planar", () => {
  const result = analyzePlanarity([
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ]);
  assertEqual(result.status, "PLANAR", "triangle planarity");
});

test("planar square recognized", () => {
  const result = analyzePlanarity([
    { x: 0, y: 0, z: 2 },
    { x: 1, y: 0, z: 2 },
    { x: 1, y: 1, z: 2 },
    { x: 0, y: 1, z: 2 },
  ]);
  assertEqual(result.status, "PLANAR", "square planarity");
});

test("substantially non-planar polygon recognized", () => {
  const result = analyzePlanarity([
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: 0.5 },
    { x: 0, y: 1, z: 0 },
  ]);
  assertEqual(result.status, "NON_PLANAR", "nonplanar");
});

test("simple square triangulates to two triangles", () => {
  const triangles = triangulateSimplePolygon([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]);
  assertEqual(triangles.length, 2, "triangle count");
});

test("concave polygon triangulates n-2", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 2 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
  ];
  const triangles = triangulateSimplePolygon(points);
  assertEqual(triangles.length, 3, "concave triangle count");
});

test("bow-tie polygon self-intersects", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
  ];
  assertEqual(hasSelfIntersections(points), true, "self-intersection");
});

test("GeoJSON Polygon import removes closing vertex", () => {
  const result = parseGeoJSONPolygon({
    type: "Polygon",
    coordinates: [[
      [35, 32, 10],
      [35.001, 32, 10],
      [35.001, 32.001, 10],
      [35, 32.001, 10],
      [35, 32, 10],
    ]],
  });
  assertEqual(result.length, 4, "GeoJSON vertex count");
});

test("GeoJSON default height applied", () => {
  const result = parseGeoJSONPolygon({
    type: "Polygon",
    coordinates: [[
      [35, 32],
      [35.001, 32],
      [35, 32.001],
      [35, 32],
    ]],
  }, 123);
  assertEqual(result[0].height, 123, "default height");
});

test("Cartesian orthogonal triangle = pi/2", () => {
  const result = calculateSpatialSolidAngle({
    coordinateMode: "cartesian",
    observer: { x: 0, y: 0, z: 0 },
    vertices: [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
    ],
  });
  assertClose(result.omega, Math.PI / 2, 1e-12, "cartesian omega");
});

test("Cartesian planar square calculates finite positive solid angle", () => {
  const result = calculateSpatialSolidAngle({
    coordinateMode: "cartesian",
    observer: { x: 0, y: 0, z: 0 },
    vertices: [
      { x: -1, y: -1, z: 2 },
      { x: 1, y: -1, z: 2 },
      { x: 1, y: 1, z: 2 },
      { x: -1, y: 1, z: 2 },
    ],
  });
  if (!(result.omega > 0 && Number.isFinite(result.omega))) {
    throw new Error(`Expected positive finite solid angle, got ${result.omega}`);
  }
  assertEqual(result.diagnostics.triangleCount, 2, "square triangles");
});

test("Non-planar quadrilateral is rejected", () => {
  assertThrows(() => calculateSpatialSolidAngle({
    coordinateMode: "cartesian",
    observer: { x: 0, y: 0, z: -2 },
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 1, z: 0 },
    ],
  }), "non-planar polygon");
});

test("Geographic small target produces finite solid angle", () => {
  const result = calculateSpatialSolidAngle({
    coordinateMode: "geographic",
    observer: { longitude: 35.0, latitude: 32.0, height: 100 },
    vertices: [
      { longitude: 35.0001, latitude: 32.0, height: 100 },
      { longitude: 35.0001, latitude: 32.0001, height: 100 },
      { longitude: 35.0, latitude: 32.0001, height: 100 },
    ],
  });
  if (!(result.omega >= 0 && Number.isFinite(result.omega))) {
    throw new Error(`Expected finite solid angle, got ${result.omega}`);
  }
});

export async function runSpatialTests() {
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
