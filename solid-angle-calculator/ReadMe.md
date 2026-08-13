# Solid Angle & 3D Visibility Calculator

Standalone scientific and geospatial web calculator within the `geospatial-tools` repository.

## Development status

Current development baseline: **0.2.0-dev**

### Completed

- Milestone 1 — standalone application scaffold.
- Milestone 2 — mathematical core and reference tests.
- Milestone 3 — complete Simple Calculator UI.

### Simple Calculator

Supported geometries:

- Cone
- Circular Target
- Rectangle
- Sphere

Outputs:

- Steradians
- Square degrees
- Percentage of full sphere
- Percentage of hemisphere
- Equivalent circular-cone half-angle when applicable

The interface also includes assumptions, formula display, validation, Reset, and Copy Result.

### Next

Milestone 4 — Cartesian Spatial / GIS engine.

## Architecture

This tool is fully self-contained and must not depend at runtime on files from other tools in the `geospatial-tools` repository.

## Local development

From the `geospatial-tools` repository root:

```bash
py -m http.server 8000
```

Application:

```text
http://localhost:8000/solid-angle-calculator/
```

Mathematical-core tests:

```text
http://localhost:8000/solid-angle-calculator/tests/
```

Simple Calculator QA checklist:

```text
http://localhost:8000/solid-angle-calculator/tests/simple-ui-qa.html
```

Embed mode:

```text
http://localhost:8000/solid-angle-calculator/?embed=1
```
