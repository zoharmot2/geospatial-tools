/**
 * WGS84 geodetic / ECEF / local ENU coordinate utilities.
 *
 * Geographic inputs:
 *   longitude: decimal degrees
 *   latitude: decimal degrees
 *   height: WGS84 ellipsoidal height in metres
 *
 * ECEF and ENU outputs are metres.
 */

export const WGS84 = Object.freeze({
  a: 6378137.0,
  inverseFlattening: 298.257223563,
});

const f = 1 / WGS84.inverseFlattening;
const e2 = f * (2 - f);

function finite(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite.`);
  }
}

export function validateGeographicCoordinate({ longitude, latitude, height = 0 }) {
  finite(longitude, "longitude");
  finite(latitude, "latitude");
  finite(height, "height");

  if (longitude < -180 || longitude > 180) {
    throw new RangeError("Longitude must be between -180 and 180 degrees.");
  }
  if (latitude < -90 || latitude > 90) {
    throw new RangeError("Latitude must be between -90 and 90 degrees.");
  }
}

export function geodeticToECEF({ longitude, latitude, height = 0 }) {
  validateGeographicCoordinate({ longitude, latitude, height });

  const lon = longitude * Math.PI / 180;
  const lat = latitude * Math.PI / 180;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  const N = WGS84.a / Math.sqrt(1 - e2 * sinLat * sinLat);

  return {
    x: (N + height) * cosLat * cosLon,
    y: (N + height) * cosLat * sinLon,
    z: (N * (1 - e2) + height) * sinLat,
  };
}

/**
 * Convert an ECEF point to local ENU coordinates around an observer origin.
 */
export function ecefToENU(pointECEF, observerGeodetic) {
  const originECEF = geodeticToECEF(observerGeodetic);
  const dx = pointECEF.x - originECEF.x;
  const dy = pointECEF.y - originECEF.y;
  const dz = pointECEF.z - originECEF.z;

  const lon = observerGeodetic.longitude * Math.PI / 180;
  const lat = observerGeodetic.latitude * Math.PI / 180;

  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);

  return {
    x: -sinLon * dx + cosLon * dy, // East
    y: -sinLat * cosLon * dx - sinLat * sinLon * dy + cosLat * dz, // North
    z: cosLat * cosLon * dx + cosLat * sinLon * dy + sinLat * dz, // Up
  };
}

export function geodeticToENU(pointGeodetic, observerGeodetic) {
  validateGeographicCoordinate(pointGeodetic);
  validateGeographicCoordinate(observerGeodetic);
  return ecefToENU(geodeticToECEF(pointGeodetic), observerGeodetic);
}

/**
 * Create observer-relative Cartesian geometry.
 * The observer becomes (0,0,0).
 */
export function geographicGeometryToLocal(observer, vertices) {
  validateGeographicCoordinate(observer);

  if (!Array.isArray(vertices) || vertices.length < 1) {
    throw new RangeError("vertices must contain at least one point.");
  }

  return {
    observer: { x: 0, y: 0, z: 0 },
    vertices: vertices.map((vertex) => geodeticToENU(vertex, observer)),
  };
}
