# QA Report — Solid Angle & 3D Visibility Calculator v1.0.0

## Automated QA completed

- Mathematical core: 20/20 tests passed.
- Spatial / GIS engine: 14/14 tests passed.
- Share-state / URL serialization: 5/5 tests passed.
- Combined automated suite: **39/39 tests passed**.
- JavaScript syntax validation: passed for all `.js` and `.mjs` files.
- Relative ES-module import resolution: passed; no missing relative modules detected.
- Static HTML-to-JavaScript ID audit: no unexplained missing static DOM targets; remaining references are generated dynamically by the calculator UI.

## Browser smoke QA

The execution environment used to assemble this release blocks Chromium navigation to local and file URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`), so interactive browser automation could not be executed here. This is an environment restriction rather than an application test failure.

Before the final Git tag/release, run the following local smoke checks:

1. Open the application and calculate the default 60° cone; expect approximately 3.141593 sr at 6-decimal precision.
2. Calculate the default Cartesian orthogonal triangle; expect approximately 1.570796 sr.
3. Confirm the 3D panel appears for the spatial result and responds to drag, Shift+drag, wheel zoom, and Reset View.
4. Switch to WGS84 and calculate the default geographic triangle.
5. Open the map input mode and verify existing Leaflet map functionality still works.
6. Export JSON and confirm a `.json` file is downloaded.
7. Copy a share link, open it in a new tab, and verify the calculation is restored.
8. Open `?embed=1` and verify the standalone header/footer are hidden.
9. Open `tests/release.html` and confirm **39/39 tests passed**.

## Release decision

The codebase is functionally complete for v1.0.0 and passes all executable automated QA available in the build environment. Final deployment freeze should follow the local browser smoke check above.
