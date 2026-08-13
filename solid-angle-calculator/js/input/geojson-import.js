/**
 * GeoJSON Polygon import for Version 1.0.
 *
 * Accepted:
 * - Polygon geometry
 * - Feature containing Polygon
 * - FeatureCollection containing exactly one Polygon feature
 *
 * Limitations:
 * - no polygon holes
 * - no MultiPolygon
 * - coordinates interpreted as WGS84 [longitude, latitude, optional height]
 */

import { validateGeographicCoordinate } from "../spatial/coordinate-utils.js";

function extractGeometry(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("GeoJSON must be a JSON object.");
  }

  if (input.type === "Polygon") return input;

  if (input.type === "Feature") {
    if (!input.geometry) throw new RangeError("GeoJSON Feature has no geometry.");
    return input.geometry;
  }

  if (input.type === "FeatureCollection") {
    const polygons = input.features
      .filter((feature) => feature?.geometry?.type === "Polygon")
      .map((feature) => feature.geometry);

    if (polygons.length !== 1) {
      throw new RangeError(
        "Version 1.0 requires a FeatureCollection containing exactly one Polygon feature."
      );
    }

    return polygons[0];
  }

  throw new RangeError("Version 1.0 supports GeoJSON Polygon geometry only.");
}

export function parseGeoJSONPolygon(input, defaultHeight = null) {
  const geometry = extractGeometry(input);

  if (geometry.type !== "Polygon") {
    throw new RangeError("Version 1.0 supports Polygon geometry only.");
  }

  if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length !== 1) {
    throw new RangeError("Polygon holes are not supported in Version 1.0.");
  }

  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    throw new RangeError("GeoJSON Polygon exterior ring must contain at least four coordinate entries including closure.");
  }

  const vertices = ring.map((coord, index) => {
    if (!Array.isArray(coord) || coord.length < 2) {
      throw new RangeError(`Invalid coordinate at ring position ${index + 1}.`);
    }

    const longitude = Number(coord[0]);
    const latitude = Number(coord[1]);
    let height;

    if (coord.length >= 3 && Number.isFinite(Number(coord[2]))) {
      height = Number(coord[2]);
    } else if (defaultHeight !== null && Number.isFinite(Number(defaultHeight))) {
      height = Number(defaultHeight);
    } else {
      throw new RangeError(
        "GeoJSON has no Z coordinates. Provide a default target height before import."
      );
    }

    const point = { longitude, latitude, height };
    validateGeographicCoordinate(point);
    return point;
  });

  // GeoJSON rings normally repeat the first point as the last.
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  const closes =
    first.longitude === last.longitude &&
    first.latitude === last.latitude &&
    first.height === last.height;

  const cleaned = closes ? vertices.slice(0, -1) : vertices;

  if (cleaned.length < 3) {
    throw new RangeError("Polygon requires at least three unique target vertices.");
  }

  return cleaned;
}

export function readGeoJSONFile(file, defaultHeight = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the selected GeoJSON file."));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        resolve(parseGeoJSONPolygon(parsed, defaultHeight));
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsText(file);
  });
}
