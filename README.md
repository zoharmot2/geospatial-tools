# Geospatial Tools

**Toolbox release: v1.0** — Stable baseline (2026-10-25).

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

**Geospatial Tools (toolbox): v1.0** — stable, approved baseline as of 2026-10-25.

Toolbox versioning describes the repository-wide collection, landing page, consistent navigation, and standalone / WordPress-embed experience. **It does not replace the independent versions of the applications.**

Each tool is versioned independently.

Current stable baselines:

| Tool | Stable version |
|---|---:|
| Coordinate Converter | 2.4.1 |
| Solid Angle & 3D Visibility Calculator | 1.0.0 |

A change to one tool does not require a version change to another tool.

### Toolbox v1.0 — Release summary (2026-10-25)

- Two independently deployable tools are available from the GitHub Pages landing page: Coordinate Converter and Solid Angle & 3D Visibility Calculator.
- Consistent standalone headers and `← Geospatial Tools` return navigation are established across both applications.
- The WordPress `?embed=1` experience hides standalone headers and shows a compact application name; users switch tools through the website Resources menu.
- Coordinate Converter's header typography and alignment are standardized to match the Solid Angle design.
- Coordinate Converter uses a pale-gray workspace in standalone mode and its original white/transparent workspace in embed mode.
- The two-mode UI and independent-tool architecture are mandatory conventions for all future tools.

**Release status:** documentation is prepared for the v1.0 repository release. Publish the GitHub tag/release separately; updating this README does not create a GitHub release or alter application version constants.


## Development roadmap

Future geospatial utilities may be added to this repository as additional standalone subdirectories.

The guiding principle is:

> One toolbox, multiple independent tools.

## License

See the repository `LICENSE` file.


---

## Navigation, headers, and embedding — approved UI baseline (2026-10-25)

The following requirements are **binding for every existing and future tool**.

### Standalone mode (GitHub Pages)

- The repository root `index.html` is the Geospatial Tools landing page, linking to each tool.
- Every tool displays a full header with these four elements, in this order:
  1. `← Geospatial Tools` — links to the repository landing page (`../`).
  2. `GEOSPATIAL TOOLS` — small eyebrow label.
  3. The tool's full name — main heading.
  4. A brief description of the tool.
- Use the same typography, colors, hierarchy, spacing, and subtle bottom divider as the Solid Angle & 3D Visibility Calculator reference header.
- **Do not center-align the header text.** The four elements are left-aligned with each other; the Coordinate Converter header's left edge aligns with the main content column, rather than a wider outer container.
- Each tool retains its own calculations, controls, and independent assets.
- The Coordinate Converter's standalone workspace uses a subtle light-gray background.

### Embedded mode (WordPress iframe)

- `?embed=1` enables the embedded presentation.
- Hide the **entire standalone header**, including the back link, eyebrow, full heading, and description.
- Show a **compact tool-name heading** above the application workspace, so the tool remains identifiable inside WordPress.
- Navigation between tools happens through the WordPress menu:
  `Resources → Geospatial Tools → [tool]`; do not route embedded users through the GitHub landing page.
- The Coordinate Converter's embedded workspace keeps its **original white/transparent background**, not the light-gray standalone background.
- The Solid Angle Calculator preserves its approved embedded workspace appearance.
- Never compromise calculator functionality, forms, results, share links, or responsive behavior for these display rules.

### Adding future tools

Each new tool must:
1. Live in its own independent subdirectory, including any required CSS, JS, assets and vendor dependencies.
2. Be listed on the Geospatial Tools landing page and linked through the WordPress Resources menu.
3. Implement both standalone and `?embed=1` header modes with the conventions above.
4. Check navigation, typography, main-content alignment, backgrounds and functionality in **both** modes before release.
5. Avoid shared runtime files or dependencies on another tool directory.

### Accepted changes and verification history (2026-10-25)

The following describes the user-approved outcome of the October navigation and layout work:

| Area | Accepted outcome |
|---|---|
| Cross-tool navigation | Consistent standalone `← Geospatial Tools` return link |
| Coordinate Converter standalone header | Mirrors the Solid Angle header's structure and type sizes; aligned to the converter's content left edge |
| Standalone headers | Four-part header visible, with subtle divider |
| WordPress embedding | Full standalone headers hidden; tool name displayed at top |
| Coordinate Converter standalone workspace | Pale gray background |
| Coordinate Converter embedded workspace | Original white/transparent background restored |
| Solid Angle embedding | Approved appearance retained |
| Future tools | Must apply this same two-mode navigation convention |

This section records the **approved final decisions**, not every intermediate styling experiment. The user confirmed the final behavior was satisfactory on 2026-10-25. Runtime/browser regression testing is still advised whenever source files change.

### Quick regression checklist

- [ ] Root GitHub Pages landing page links to each tool.
- [ ] Direct tool URL without `embed=1` shows the complete four-part header and working return link.
- [ ] Coordinate Converter standalone header aligns with the main content column.
- [ ] URL with `?embed=1` hides the complete standalone header, displays a compact tool title, and keeps the calculator visible.
- [ ] Coordinate Converter embed background remains white/transparent; standalone workspace remains pale gray.
- [ ] WordPress Resources menu moves between tool pages without nesting the main site in an iframe.
- [ ] Desktop/mobile layouts, calculations, form input, results, exports and share links still work.

### Commit message for this documentation update

```text
docs: finalize geospatial-tools v1.0 release documentation
```

The version numbers for individual tools in this README identify their independently tracked baselines. The toolbox itself is designated **v1.0**; appearance fixes and cache-busting parameters do not automatically change either version.
