# Solid Angle & 3D Visibility Calculator

Standalone scientific and geospatial web calculator within the `geospatial-tools` repository.

## Development status

Current development baseline: **0.1.0-dev**

Version 1.0 will provide two independent calculation modes:

- **Simple Calculator** — cone, circular target, rectangle, and sphere.
- **Spatial / GIS Calculator** — observer point plus a 3D triangle or planar polygon using Cartesian XYZ or WGS84 geographic coordinates.

## Architecture

This tool is fully self-contained. It must not depend at runtime on files from other tools in the `geospatial-tools` repository.

## Local development

From the `geospatial-tools` repository root:

```bash
py -m http.server 8000
```

Open:

```text
http://localhost:8000/solid-angle-calculator/
```

Embed-mode smoke test:

```text
http://localhost:8000/solid-angle-calculator/?embed=1
```

## Current milestone

Milestone 1 — repository/application scaffold.

The mathematical core will be implemented and tested before map or 3D dependencies are introduced.
