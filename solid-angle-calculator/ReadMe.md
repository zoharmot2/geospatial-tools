# Solid Angle & 3D Visibility Calculator

Standalone scientific and geospatial web calculator within the `geospatial-tools` repository.

## Development status

Current development baseline: **0.6.0-dev**

### Completed

- Milestone 1 — standalone application scaffold.
- Milestone 2 — mathematical core and reference tests.
- Milestone 3 — complete Simple Calculator UI.
- Milestone 4 — Cartesian XYZ spatial engine.
- Milestone 5 — WGS84 geographic engine using geodetic → ECEF → local ENU.
- Milestone 6 — GeoJSON Polygon import.
- Milestone 7 — interactive geographic map integration.

### Spatial / GIS functionality

Version 0.6.0-dev supports:

- Cartesian observer XYZ.
- Geographic observer longitude / latitude / WGS84 ellipsoidal height.
- Arbitrary 3D triangle targets.
- Planar and approximately planar simple polygons.
- Internal polygon planarity diagnostics.
- Internal ear-clipping triangulation.
- GeoJSON Polygon / Feature / single-Polygon FeatureCollection input.
- Manual vertex editing and ordering.
- Interactive geographic observer placement.
- Interactive polygon drawing.
- Draggable observer and target vertices.
- Synchronization between map geometry and the vertex table.

### Leaflet

The tool is designed so that Leaflet is stored locally inside the tool directory rather than shared with other applications.

Before testing the map for the first time on Windows, run:

```text
vendor/leaflet/install-leaflet.cmd
```

This downloads Leaflet 1.9.4 from the official GitHub release and vendors it into this tool.

After installation, Leaflet itself is local. OpenStreetMap basemap tiles still require a network connection.

## Local development

From the `geospatial-tools` repository root:

```bash
py -m http.server 8000
```

Application:

```text
http://localhost:8000/solid-angle-calculator/
```

Core mathematical tests:

```text
http://localhost:8000/solid-angle-calculator/tests/
```

Spatial tests:

```text
http://localhost:8000/solid-angle-calculator/tests/spatial.html
```

Embed mode:

```text
http://localhost:8000/solid-angle-calculator/?embed=1
```

## v1.0 limitations

- No polygon holes.
- No MultiPolygon.
- No substantially non-planar polygon with more than three vertices.
- No arbitrary CRS transformation beyond Cartesian XYZ and WGS84 geographic input.
- No DEM/viewshed or external occlusion analysis.
