import { calculateSpatialSolidAngle } from "../spatial/spatial-calculator.js";
import { createVertexTableController } from "../input/vertex-table.js";
import { readGeoJSONFile } from "../input/geojson-import.js";
import { createGeographicMapController } from "../map/map.js";
import {
  steradiansToSquareDegrees,
  percentOfFullSphere,
  percentOfHemisphere,
  equivalentConeHalfAngle,
  radiansToDegrees,
  formatNumber,
} from "../core/units.js";

function readNumber(id, label) {
  const input = document.getElementById(id);
  const value = Number(input.value);
  input.setAttribute("aria-invalid", "false");

  if (!Number.isFinite(value)) {
    input.setAttribute("aria-invalid", "true");
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
}

function geographicObserverFromForm() {
  return {
    longitude: readNumber("observer-longitude", "Observer longitude"),
    latitude: readNumber("observer-latitude", "Observer latitude"),
    height: readNumber("observer-height", "Observer height"),
  };
}

function cartesianObserverFromForm() {
  return {
    x: readNumber("observer-x", "Observer X"),
    y: readNumber("observer-y", "Observer Y"),
    z: readNumber("observer-z", "Observer Z"),
  };
}

function outputFormatting(omega) {
  const deg2 = steradiansToSquareDegrees(omega);
  const spherePct = percentOfFullSphere(omega);
  const hemiPct = percentOfHemisphere(omega);

  let equivalent = "Not applicable";
  let equivalentNote = "requires Ω ≤ 2π";

  if (omega <= 2 * Math.PI + 1e-12) {
    const angle = equivalentConeHalfAngle(Math.min(omega, 2 * Math.PI));
    equivalent = `${formatNumber(radiansToDegrees(angle), 6)}°`;
    equivalentNote = "equivalent cone half-angle";
  }

  return {
    sr: formatNumber(omega, 9),
    deg2: formatNumber(deg2, 6),
    spherePct: formatNumber(spherePct, 6),
    hemiPct: formatNumber(hemiPct, 6),
    equivalent,
    equivalentNote,
  };
}

export function initializeSpatialCalculator() {
  const coordinateMode = document.getElementById("coordinate-mode");
  const observerFields = document.getElementById("spatial-observer-fields");
  const vertexHead = document.getElementById("vertex-table-head");
  const vertexBody = document.getElementById("vertex-table-body");
  const addVertexButton = document.getElementById("add-vertex");
  const clearVerticesButton = document.getElementById("clear-vertices");
  const spatialForm = document.getElementById("spatial-form");
  const spatialMessage = document.getElementById("spatial-message");
  const spatialWarnings = document.getElementById("spatial-warnings");
  const diagnostics = document.getElementById("spatial-diagnostics");
  const inputSource = document.getElementById("spatial-input-source");
  const geojsonPanel = document.getElementById("geojson-panel");
  const mapPanel = document.getElementById("map-panel");
  const geojsonFile = document.getElementById("geojson-file");
  const geojsonHeight = document.getElementById("geojson-default-height");
  const importGeoJSONButton = document.getElementById("import-geojson");
  const targetMapHeight = document.getElementById("map-target-height");
  const mapStatus = document.getElementById("map-status");

  let suppressMapSync = false;

  const vertexController = createVertexTableController({
    tableBody: vertexBody,
    onChange: (vertices) => {
      if (
        !suppressMapSync &&
        coordinateMode.value === "geographic" &&
        mapController?.available
      ) {
        mapController.setVertices(vertices);
      }
    },
  });

  let mapController = null;

  function ensureMap() {
    if (mapController) return mapController;

    mapController = createGeographicMapController({
      containerId: "spatial-map",
      statusElement: mapStatus,
      onObserverChange: (observer) => {
        if (!observer) return;
        document.getElementById("observer-longitude").value = observer.longitude.toFixed(8);
        document.getElementById("observer-latitude").value = observer.latitude.toFixed(8);
        if (Number.isFinite(observer.height)) {
          document.getElementById("observer-height").value = observer.height;
        }
      },
      onVerticesChange: (vertices) => {
        suppressMapSync = true;
        vertexController.setVertices(vertices);
        suppressMapSync = false;
      },
    });

    return mapController;
  }

  function renderObserverFields() {
    if (coordinateMode.value === "cartesian") {
      observerFields.innerHTML = `
        <div class="field-row three">
          <div class="field">
            <label for="observer-x">Observer X</label>
            <input id="observer-x" type="number" step="any" value="0">
          </div>
          <div class="field">
            <label for="observer-y">Observer Y</label>
            <input id="observer-y" type="number" step="any" value="0">
          </div>
          <div class="field">
            <label for="observer-z">Observer Z</label>
            <input id="observer-z" type="number" step="any" value="0">
          </div>
        </div>
      `;
      vertexHead.innerHTML = `
        <tr><th>Vertex</th><th>X</th><th>Y</th><th>Z</th><th>Actions</th></tr>
      `;
      vertexController.setMode("cartesian");
      vertexController.setVertices([
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
      ]);
      inputSource.value = "manual";
      inputSource.querySelector('option[value="map"]').disabled = true;
      inputSource.querySelector('option[value="geojson"]').disabled = true;
    } else {
      observerFields.innerHTML = `
        <div class="field-row three">
          <div class="field">
            <label for="observer-longitude">Longitude</label>
            <input id="observer-longitude" type="number" step="any" value="35.2137">
          </div>
          <div class="field">
            <label for="observer-latitude">Latitude</label>
            <input id="observer-latitude" type="number" step="any" value="31.7683">
          </div>
          <div class="field">
            <label for="observer-height">Height (m)</label>
            <input id="observer-height" type="number" step="any" value="800">
          </div>
        </div>
        <span class="hint">Geographic height is interpreted as WGS84 ellipsoidal height.</span>
      `;
      vertexHead.innerHTML = `
        <tr><th>Vertex</th><th>Longitude</th><th>Latitude</th><th>Height (m)</th><th>Actions</th></tr>
      `;
      vertexController.setMode("geographic");
      vertexController.setVertices([
        { longitude: 35.2145, latitude: 31.7686, height: 800 },
        { longitude: 35.2148, latitude: 31.7681, height: 800 },
        { longitude: 35.2142, latitude: 31.7679, height: 800 },
      ]);
      inputSource.querySelector('option[value="map"]').disabled = false;
      inputSource.querySelector('option[value="geojson"]').disabled = false;
      ensureMap();
    }

    updateInputSourceVisibility();
  }

  function updateInputSourceVisibility() {
    const geographic = coordinateMode.value === "geographic";
    const source = inputSource.value;

    geojsonPanel.hidden = !(geographic && source === "geojson");
    mapPanel.hidden = !(geographic && source === "map");

    if (!mapPanel.hidden) {
      const controller = ensureMap();
      window.setTimeout(() => controller.invalidateSize(), 0);
      try {
        const observer = geographicObserverFromForm();
        controller.setObserver(observer);
      } catch {}
      controller.setVertices(vertexController.getVertices());
    }
  }

  coordinateMode.addEventListener("change", () => {
    spatialMessage.hidden = true;
    spatialWarnings.hidden = true;
    diagnostics.hidden = true;
    renderObserverFields();
  });

  inputSource.addEventListener("change", updateInputSourceVisibility);

  addVertexButton.addEventListener("click", () => vertexController.addVertex());
  clearVerticesButton.addEventListener("click", () => vertexController.clear());

  targetMapHeight.addEventListener("input", () => {
    ensureMap().setTargetDefaultHeight(Number(targetMapHeight.value));
  });

  document.getElementById("map-set-observer").addEventListener("click", () => {
    ensureMap().beginObserverPlacement();
    mapStatus.hidden = false;
    mapStatus.textContent = "Click the map once to place the observer.";
  });

  document.getElementById("map-draw-target").addEventListener("click", () => {
    ensureMap().setTargetDefaultHeight(Number(targetMapHeight.value));
    ensureMap().beginTargetDrawing();
    mapStatus.hidden = false;
    mapStatus.textContent = "Click the map to add target vertices. Use Stop Drawing when finished.";
  });

  document.getElementById("map-stop-drawing").addEventListener("click", () => {
    ensureMap().stopDrawing();
    mapStatus.hidden = true;
  });

  document.getElementById("map-fit").addEventListener("click", () => ensureMap().fitToData());

  document.getElementById("map-clear").addEventListener("click", () => {
    ensureMap().clearGeometry();
    vertexController.clear();
  });

  importGeoJSONButton.addEventListener("click", async () => {
    spatialMessage.hidden = true;

    if (!geojsonFile.files?.length) {
      spatialMessage.textContent = "Select a GeoJSON file first.";
      spatialMessage.hidden = false;
      return;
    }

    try {
      const defaultHeight =
        geojsonHeight.value.trim() === "" ? null : Number(geojsonHeight.value);
      const vertices = await readGeoJSONFile(geojsonFile.files[0], defaultHeight);
      suppressMapSync = true;
      vertexController.setVertices(vertices);
      suppressMapSync = false;
      ensureMap().setVertices(vertices);
      inputSource.value = "manual";
      updateInputSourceVisibility();
    } catch (error) {
      spatialMessage.textContent = error instanceof Error ? error.message : String(error);
      spatialMessage.hidden = false;
    }
  });

  spatialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    spatialMessage.hidden = true;
    spatialWarnings.hidden = true;
    diagnostics.hidden = true;

    try {
      const mode = coordinateMode.value;
      const observer =
        mode === "cartesian"
          ? cartesianObserverFromForm()
          : geographicObserverFromForm();

      const vertices = vertexController.getVertices();
      const result = calculateSpatialSolidAngle({
        coordinateMode: mode,
        observer,
        vertices,
      });

      const formatted = outputFormatting(result.omega);

      // Reuse shared results panel.
      document.getElementById("result-sr").textContent = formatted.sr;
      document.getElementById("result-deg2").textContent = formatted.deg2;
      document.getElementById("result-sphere-pct").textContent = formatted.spherePct;
      document.getElementById("result-hemi-pct").textContent = formatted.hemiPct;
      document.getElementById("result-equivalent").textContent = formatted.equivalent;
      document.getElementById("result-equivalent-note").textContent = formatted.equivalentNote;
      document.getElementById("result-interpretation").textContent =
        `The spatial target subtends ${formatted.sr} sr from the observer. ` +
        `It represents ${formatted.hemiPct}% of a hemisphere and ${formatted.spherePct}% of a full sphere.`;

      document.getElementById("result-empty").hidden = true;
      document.getElementById("result-content").hidden = false;

      diagnostics.innerHTML = `
        <strong>Spatial diagnostics</strong>
        <div class="diagnostic-grid">
          <span>Vertices</span><b>${result.diagnostics.vertexCount}</b>
          <span>Triangles</span><b>${result.diagnostics.triangleCount}</b>
          <span>Planarity</span><b>${result.diagnostics.planarityStatus.replaceAll("_", " ")}</b>
          <span>Centroid distance</span><b>${formatNumber(result.diagnostics.centroidDistance, 3)}</b>
          <span>Nearest vertex</span><b>${formatNumber(result.diagnostics.nearestVertexDistance, 3)}</b>
          <span>Farthest vertex</span><b>${formatNumber(result.diagnostics.farthestVertexDistance, 3)}</b>
        </div>
      `;
      diagnostics.hidden = false;

      if (result.warnings.length) {
        spatialWarnings.innerHTML =
          "<strong>Warnings</strong><ul>" +
          result.warnings.map((warning) => `<li>${warning}</li>`).join("") +
          "</ul>";
        spatialWarnings.hidden = false;
      }
    } catch (error) {
      spatialMessage.textContent = error instanceof Error ? error.message : String(error);
      spatialMessage.hidden = false;
    }
  });

  document.getElementById("reset-spatial").addEventListener("click", () => {
    coordinateMode.value = "cartesian";
    inputSource.value = "manual";
    renderObserverFields();
    spatialMessage.hidden = true;
    spatialWarnings.hidden = true;
    diagnostics.hidden = true;
  });

  renderObserverFields();

  return {
    onModeActivated() {
      if (coordinateMode.value === "geographic" && !mapPanel.hidden) {
        ensureMap().invalidateSize();
      }
    },
  };
}
