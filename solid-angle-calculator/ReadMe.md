# Solid Angle & 3D Visibility Calculator

**Stable release: v1.0.0**

A fully standalone scientific and geospatial browser tool within the `geospatial-tools` repository. It calculates the solid angle subtended by standard geometric objects or by a user-defined 3D target from an observer point.

## Modes

### Simple Calculator

- Cone
- Circular target / disk
- Rectangle
- Sphere

### Spatial / GIS Calculator

- Cartesian XYZ observer and target vertices
- WGS84 longitude / latitude / ellipsoidal height
- Arbitrary 3D triangles
- Planar and approximately planar simple polygons
- GeoJSON Polygon import
- Interactive geographic map
- Interactive dependency-free 3D geometry visualization

## Outputs

- Steradians (sr)
- Square degrees
- Percentage of full sphere
- Percentage of hemisphere
- Equivalent circular-cone half-angle when applicable
- Spatial diagnostics
- JSON export
- Shareable calculation URL

## Self-contained architecture

The tool has no runtime dependency on any other application in `geospatial-tools`. Its HTML, CSS, JavaScript, assets, tests, and optional map library are contained inside `solid-angle-calculator/`.

Leaflet 1.9.4 is vendored in `vendor/leaflet/` for deployed builds. If those distribution files are absent in a fresh development copy, run `vendor/leaflet/install-leaflet.cmd` once before map testing.

The 3D viewer is implemented with the browser Canvas API and therefore adds no additional runtime library dependency.

## Local development

From the `geospatial-tools` repository root:

```bash
py -m http.server 8000
```

Open:

```text
http://localhost:8000/solid-angle-calculator/
```

Embed mode:

```text
http://localhost:8000/solid-angle-calculator/?embed=1
```

## QA

Core tests:

```text
http://localhost:8000/solid-angle-calculator/tests/
```

Spatial tests:

```text
http://localhost:8000/solid-angle-calculator/tests/spatial.html
```

Combined release tests:

```text
http://localhost:8000/solid-angle-calculator/tests/release.html
```

Or from the tool directory:

```bash
node tests/run-release-node.mjs
```

## Scientific scope

For WGS84 input, geographic coordinates are converted to ECEF and then to a local observer-centered ENU frame. General polygons are validated for planarity, projected to their representative plane for topology/triangulation, triangulated internally, and evaluated by summing signed triangle solid angles before converting the final result to magnitude.

## v1.0 limitations

- no polygon holes;
- no MultiPolygon;
- no substantially non-planar polygon with more than three vertices;
- no arbitrary CRS reprojection beyond Cartesian XYZ and WGS84 geographic input;
- no DEM/viewshed analysis;
- no external-object occlusion;
- no atmospheric visibility model.

The repository-level license governs this tool. Third-party notices are provided separately.
