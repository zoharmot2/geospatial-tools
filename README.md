# Geospatial Tools

`geospatial-tools` is a collection of standalone browser-based utilities for geospatial analysis, coordinate transformation, spatial geometry, and related GIS workflows.

The repository is designed as a **toolbox repository** rather than a single application. Each tool is completely self-contained and can be used independently.

## Available tools

### 1. Coordinate Converter

**Current stable version: 2.4.1**

A browser-based GIS coordinate conversion application supporting individual and batch coordinate transformations.

Key capabilities include:

- WGS84
- Israel Transverse Mercator (ITM)
- Israel Cassini-Soldner / ICS
- UTM
- Web Mercator
- British National Grid
- Lambert-93
- CRS search
- Coordinate validation
- CSV / Excel batch conversion
- XLSX export
- Interactive Leaflet map
- Map-based point selection
- Reverse geocoding
- Coordinates under cursor
- Shareable links
- Standalone and iframe/embed deployment

Tool directory:

```text
coordinate-converter/
```

Application path:

```text
/coordinate-converter/
```

---

### 2. Solid Angle & 3D Visibility Calculator

**Current stable version: 1.0.0**

A scientific and geospatial calculator for determining the solid angle subtended by geometric or spatial targets from an observer point.

Key capabilities include:

- Cone solid-angle calculation
- Circular-target calculation
- Rectangle calculation
- Sphere calculation
- Cartesian XYZ observer and target geometry
- WGS84 longitude / latitude / height input
- WGS84 geodetic → ECEF → local ENU conversion
- Arbitrary 3D triangle targets
- Planar and approximately planar polygons
- Internal polygon validation and triangulation
- GeoJSON Polygon import
- Interactive geographic observer and target definition
- Interactive 3D observer–target visualization
- Steradian and square-degree output
- Full-sphere and hemisphere percentages
- Equivalent-cone calculation
- Copy Result
- JSON export
- Shareable URL state
- Standalone and iframe/embed deployment

Version 1.0 does **not** perform DEM-based viewshed analysis, terrain obstruction, building occlusion, or arbitrary 3D mesh analysis.

Tool directory:

```text
solid-angle-calculator/
```

Application path:

```text
/solid-angle-calculator/
```

---

## Repository structure

```text
geospatial-tools/
│
├── index.html
│
├── coordinate-converter/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── ...
│
├── solid-angle-calculator/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   ├── vendor/
│   ├── tests/
│   └── ...
│
├── README.md
├── LICENSE
└── ...
```

## Architectural principle

Each tool must remain **fully independent and self-contained**.

Tools must not share runtime:

- CSS
- JavaScript
- assets
- third-party libraries
- application configuration
- calculation modules

Visual consistency may be maintained across tools, but implementation files should remain inside each individual tool directory.

The repository root is limited to toolbox-level resources such as:

- landing page
- repository documentation
- license
- repository configuration

## Local development

From the repository root:

```bash
py -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Coordinate Converter:

```text
http://localhost:8000/coordinate-converter/
```

Solid Angle & 3D Visibility Calculator:

```text
http://localhost:8000/solid-angle-calculator/
```

## Deployment

The repository is intended for static deployment using GitHub Pages.

The root `index.html` serves as the toolbox landing page. Each application is published from its own subdirectory.

Tools may also support iframe embedding in another website. When an individual tool implements embed mode, its calculation functionality remains independent of the root toolbox page.

## Versioning

Each tool is versioned independently.

Current stable baselines:

| Tool | Stable version |
|---|---:|
| Coordinate Converter | 2.4.1 |
| Solid Angle & 3D Visibility Calculator | 1.0.0 |

A change to one tool does not require a version change to another tool.

## Development roadmap

Future geospatial utilities may be added to this repository as additional standalone subdirectories.

The guiding principle is:

> One toolbox, multiple independent tools.

## License

See the repository `LICENSE` file.
