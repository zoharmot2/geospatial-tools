# Solid Angle & 3D Visibility Calculator

Standalone scientific and geospatial web calculator within the `geospatial-tools` repository.

## Development status

Current development baseline: **0.1.1-dev**

### Completed

- Milestone 1 — standalone application scaffold.
- Milestone 2 — mathematical core and reference tests.

### Next

Milestone 3 — full Simple Calculator user interface.

## Architecture

This tool is fully self-contained. It must not depend at runtime on files from other tools in the `geospatial-tools` repository.

The mathematical core is isolated from DOM, Leaflet, and Three.js code so that calculations can be tested independently.

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

Embed-mode smoke test:

```text
http://localhost:8000/solid-angle-calculator/?embed=1
```
