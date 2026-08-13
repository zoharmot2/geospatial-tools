import { calculateSpatialSolidAngle } from "../spatial/spatial-calculator.js";
import { createVertexTableController } from "../input/vertex-table.js";
import { readGeoJSONFile } from "../input/geojson-import.js";
import { createGeographicMapController } from "../map/map.js";
import { formatNumber } from "../core/units.js";

function readNumber(id, label) {
  const input = document.getElementById(id); const value = Number(input.value); input.setAttribute("aria-invalid", "false");
  if (!Number.isFinite(value)) { input.setAttribute("aria-invalid", "true"); throw new Error(`${label} must be a finite number.`); }
  return value;
}

export function initializeSpatialCalculator({ resultsUI }) {
  const coordinateMode = document.getElementById("coordinate-mode");
  const observerFields = document.getElementById("spatial-observer-fields");
  const vertexHead = document.getElementById("vertex-table-head");
  const vertexBody = document.getElementById("vertex-table-body");
  const form = document.getElementById("spatial-form");
  const message = document.getElementById("spatial-message");
  const warningsBox = document.getElementById("spatial-warnings");
  const diagnostics = document.getElementById("spatial-diagnostics");
  const inputSource = document.getElementById("spatial-input-source");
  const geojsonPanel = document.getElementById("geojson-panel");
  const mapPanel = document.getElementById("map-panel");
  const mapStatus = document.getElementById("map-status");
  let suppressMapSync = false;
  let mapController = null;

  const vertexController = createVertexTableController({
    tableBody: vertexBody,
    onChange: (vertices) => {
      if (!suppressMapSync && coordinateMode.value === "geographic" && mapController?.available) mapController.setVertices(vertices);
    },
  });

  function observerFromForm() {
    return coordinateMode.value === "cartesian"
      ? { x: readNumber("observer-x", "Observer X"), y: readNumber("observer-y", "Observer Y"), z: readNumber("observer-z", "Observer Z") }
      : { longitude: readNumber("observer-longitude", "Observer longitude"), latitude: readNumber("observer-latitude", "Observer latitude"), height: readNumber("observer-height", "Observer height") };
  }

  function ensureMap() {
    if (mapController) return mapController;
    mapController = createGeographicMapController({
      containerId: "spatial-map", statusElement: mapStatus,
      onObserverChange: (observer) => {
        if (!observer) return;
        document.getElementById("observer-longitude").value = observer.longitude.toFixed(8);
        document.getElementById("observer-latitude").value = observer.latitude.toFixed(8);
        document.getElementById("observer-height").value = observer.height ?? 0;
      },
      onVerticesChange: (vertices) => { suppressMapSync = true; vertexController.setVertices(vertices); suppressMapSync = false; },
    });
    return mapController;
  }

  function setObserverFields(mode, observer = null) {
    if (mode === "cartesian") {
      const o = observer ?? { x: 0, y: 0, z: 0 };
      observerFields.innerHTML = `<div class="field-row three"><div class="field"><label for="observer-x">Observer X</label><input id="observer-x" type="number" step="any" value="${o.x}"></div><div class="field"><label for="observer-y">Observer Y</label><input id="observer-y" type="number" step="any" value="${o.y}"></div><div class="field"><label for="observer-z">Observer Z</label><input id="observer-z" type="number" step="any" value="${o.z}"></div></div>`;
      vertexHead.innerHTML = `<tr><th>Vertex</th><th>X</th><th>Y</th><th>Z</th><th>Actions</th></tr>`;
    } else {
      const o = observer ?? { longitude: 35.2137, latitude: 31.7683, height: 800 };
      observerFields.innerHTML = `<div class="field-row three"><div class="field"><label for="observer-longitude">Longitude</label><input id="observer-longitude" type="number" step="any" value="${o.longitude}"></div><div class="field"><label for="observer-latitude">Latitude</label><input id="observer-latitude" type="number" step="any" value="${o.latitude}"></div><div class="field"><label for="observer-height">Height (m)</label><input id="observer-height" type="number" step="any" value="${o.height}"></div></div><span class="hint">Height is interpreted as WGS84 ellipsoidal height.</span>`;
      vertexHead.innerHTML = `<tr><th>Vertex</th><th>Longitude</th><th>Latitude</th><th>Height (m)</th><th>Actions</th></tr>`;
    }
  }

  function configureMode(mode, { observer = null, vertices = null, useDefaults = true } = {}) {
    coordinateMode.value = mode;
    setObserverFields(mode, observer);
    vertexController.setMode(mode);
    if (vertices) vertexController.setVertices(vertices);
    else if (useDefaults) vertexController.setVertices(mode === "cartesian" ? [
      { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 },
    ] : [
      { longitude: 35.2145, latitude: 31.7686, height: 800 },
      { longitude: 35.2148, latitude: 31.7681, height: 800 },
      { longitude: 35.2142, latitude: 31.7679, height: 800 },
    ]);
    const geographic = mode === "geographic";
    inputSource.querySelector('option[value="map"]').disabled = !geographic;
    inputSource.querySelector('option[value="geojson"]').disabled = !geographic;
    if (!geographic) inputSource.value = "manual";
    updateInputSourceVisibility();
  }

  function updateInputSourceVisibility() {
    const geographic = coordinateMode.value === "geographic"; const source = inputSource.value;
    geojsonPanel.hidden = !(geographic && source === "geojson");
    mapPanel.hidden = !(geographic && source === "map");
    if (!mapPanel.hidden) {
      const controller = ensureMap(); setTimeout(() => controller.invalidateSize(), 0);
      try { controller.setObserver(observerFromForm()); } catch {}
      controller.setVertices(vertexController.getVertices());
    }
  }

  function renderDiagnostics(result) {
    diagnostics.innerHTML = `<strong>Spatial diagnostics</strong><div class="diagnostic-grid"><span>Vertices</span><b>${result.diagnostics.vertexCount}</b><span>Triangles</span><b>${result.diagnostics.triangleCount}</b><span>Planarity</span><b>${result.diagnostics.planarityStatus.replaceAll('_',' ')}</b><span>Centroid distance</span><b>${formatNumber(result.diagnostics.centroidDistance, 3)}</b><span>Nearest vertex</span><b>${formatNumber(result.diagnostics.nearestVertexDistance, 3)}</b><span>Farthest vertex</span><b>${formatNumber(result.diagnostics.farthestVertexDistance, 3)}</b></div>`;
    diagnostics.hidden = false;
    if (result.warnings.length) {
      warningsBox.innerHTML = `<strong>Warnings</strong><ul>${result.warnings.map((w) => `<li>${w}</li>`).join('')}</ul>`; warningsBox.hidden = false;
    } else warningsBox.hidden = true;
  }

  function calculate() {
    message.hidden = true; warningsBox.hidden = true; diagnostics.hidden = true;
    try {
      const mode = coordinateMode.value; const observer = observerFromForm(); const vertices = vertexController.getVertices();
      const result = calculateSpatialSolidAngle({ coordinateMode: mode, observer, vertices });
      renderDiagnostics(result);
      resultsUI.displayResult({
        mode: "spatial", title: mode === "cartesian" ? "Cartesian XYZ target" : "WGS84 geographic target",
        description: `${result.diagnostics.vertexCount} vertices; ${result.diagnostics.triangleCount} triangles`,
        omega: result.omega,
        warnings: result.warnings,
        shareState: { mode: "spatial", coordinateMode: mode, observer, vertices },
        exportData: { coordinateMode: mode, observer, target: { vertices }, diagnostics: result.diagnostics },
        visualization: { observer: result.localObserver, vertices: result.localVertices, triangleIndices: result.triangleIndices },
      });
      return true;
    } catch (error) {
      resultsUI.clear(); message.textContent = error instanceof Error ? error.message : String(error); message.hidden = false; return false;
    }
  }

  coordinateMode.addEventListener("change", () => { configureMode(coordinateMode.value); resultsUI.clear(); });
  inputSource.addEventListener("change", updateInputSourceVisibility);
  document.getElementById("add-vertex").addEventListener("click", () => vertexController.addVertex());
  document.getElementById("clear-vertices").addEventListener("click", () => vertexController.clear());
  document.getElementById("map-target-height").addEventListener("input", (e) => ensureMap().setTargetDefaultHeight(Number(e.target.value)));
  document.getElementById("map-set-observer").addEventListener("click", () => { ensureMap().beginObserverPlacement(); mapStatus.hidden = false; mapStatus.textContent = "Click the map once to place the observer."; });
  document.getElementById("map-draw-target").addEventListener("click", () => { ensureMap().setTargetDefaultHeight(Number(document.getElementById("map-target-height").value)); ensureMap().beginTargetDrawing(); mapStatus.hidden = false; mapStatus.textContent = "Click the map to add target vertices. Use Stop Drawing when finished."; });
  document.getElementById("map-stop-drawing").addEventListener("click", () => { ensureMap().stopDrawing(); mapStatus.hidden = true; });
  document.getElementById("map-fit").addEventListener("click", () => ensureMap().fitToData());
  document.getElementById("map-clear").addEventListener("click", () => { ensureMap().clearGeometry(); vertexController.clear(); });
  document.getElementById("import-geojson").addEventListener("click", async () => {
    const fileInput = document.getElementById("geojson-file"); message.hidden = true;
    if (!fileInput.files?.length) { message.textContent = "Select a GeoJSON file first."; message.hidden = false; return; }
    try {
      const value = document.getElementById("geojson-default-height").value.trim(); const defaultHeight = value === "" ? null : Number(value);
      const vertices = await readGeoJSONFile(fileInput.files[0], defaultHeight); suppressMapSync = true; vertexController.setVertices(vertices); suppressMapSync = false; ensureMap().setVertices(vertices); inputSource.value = "manual"; updateInputSourceVisibility();
    } catch (error) { message.textContent = error instanceof Error ? error.message : String(error); message.hidden = false; }
  });
  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  document.getElementById("reset-spatial").addEventListener("click", () => { inputSource.value = "manual"; configureMode("cartesian"); warningsBox.hidden = true; diagnostics.hidden = true; message.hidden = true; resultsUI.clear(); });
  configureMode("cartesian");

  return {
    calculate,
    onModeActivated() { if (coordinateMode.value === "geographic" && !mapPanel.hidden) ensureMap().invalidateSize(); },
    applyState(state) {
      if (!state || state.mode !== "spatial" || !["cartesian", "geographic"].includes(state.coordinateMode) || !state.observer || !Array.isArray(state.vertices)) throw new Error("Invalid Spatial / GIS share state.");
      inputSource.value = "manual"; configureMode(state.coordinateMode, { observer: state.observer, vertices: state.vertices, useDefaults: false }); return calculate();
    },
  };
}
