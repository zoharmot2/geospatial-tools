import {
  coneSolidAngle,
  diskSolidAngle,
  rectangleSolidAngle,
  sphereSolidAngle,
} from "../core/simple-geometries.js";
import { degreesToRadians } from "../core/units.js";

const LENGTH_UNITS = [
  ["mm", "Millimeters"], ["cm", "Centimeters"], ["m", "Meters"],
  ["km", "Kilometers"], ["in", "Inches"], ["ft", "Feet"],
];

const GEOMETRIES = {
  cone: {
    title: "Cone",
    assumption: "The cone is defined by its axis and angular aperture. A full apex angle is converted internally to a half-angle.",
    formula: "Ω = 2π(1 − cos θ), where θ is the cone half-angle.",
  },
  disk: {
    title: "Circular Target",
    assumption: "The circular target is planar, centered on the viewing axis, and perpendicular to the observer-target direction.",
    formula: "Ω = 2π(1 − d / √(d² + r²)), where r is target radius and d is observer-to-plane distance.",
  },
  rectangle: {
    title: "Rectangle",
    assumption: "The rectangle is planar, centered on the viewing axis, and perpendicular to the observer-target direction.",
    formula: "Ω = 4 atan2(ab, d√(d² + a² + b²)), where a = width/2 and b = height/2.",
  },
  sphere: {
    title: "Sphere",
    assumption: "Distance is measured from the observer to the sphere center. An observer inside the sphere subtends the full 4π sr.",
    formula: "For d > r: Ω = 2π(1 − √(d² − r²)/d). At d = r, Ω = 2π. For d < r, Ω = 4π.",
  },
};

function numberField(id, label, value) {
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" step="any" min="0" value="${value}" inputmode="decimal"></div>`;
}

function lengthUnitField(value = "m") {
  return `<div class="field"><label for="length-unit">Length unit</label><select id="length-unit">${LENGTH_UNITS.map(([v,l]) => `<option value="${v}" ${v===value?'selected':''}>${l}</option>`).join('')}</select><span class="hint">All lengths in one calculation must use the same unit.</span></div>`;
}

function renderFields(container, geometry, values = {}) {
  if (geometry === "cone") {
    container.innerHTML = `<div class="field-row">${numberField("cone-angle", "Angle", values.angle ?? 60)}<div class="field"><label for="angle-unit">Angle unit</label><select id="angle-unit"><option value="degrees">Degrees</option><option value="radians">Radians</option></select></div></div><div class="field"><span class="field-label">Angle definition</span><div class="radio-group"><label class="radio-option"><input type="radio" name="angle-definition" value="half" checked>Half-angle</label><label class="radio-option"><input type="radio" name="angle-definition" value="full">Full apex angle</label></div></div>`;
    if (values.angleUnit === "radians") document.getElementById("angle-unit").value = "radians";
    if (values.angleDefinition === "full") document.querySelector('input[name="angle-definition"][value="full"]').checked = true;
    return;
  }
  if (geometry === "disk") {
    container.innerHTML = `<div class="field-row">${numberField("disk-radius", "Target radius", values.radius ?? 1)}${numberField("disk-distance", "Observer-to-plane distance", values.distance ?? 1)}</div>${lengthUnitField(values.lengthUnit)}`;
    return;
  }
  if (geometry === "rectangle") {
    container.innerHTML = `<div class="field-row">${numberField("rectangle-width", "Width", values.width ?? 2)}${numberField("rectangle-height", "Height", values.height ?? 2)}</div>${numberField("rectangle-distance", "Observer-to-plane distance", values.distance ?? 1)}${lengthUnitField(values.lengthUnit)}`;
    return;
  }
  container.innerHTML = `<div class="field-row">${numberField("sphere-radius", "Sphere radius", values.radius ?? 1)}${numberField("sphere-distance", "Observer-to-center distance", values.distance ?? 2)}</div>${lengthUnitField(values.lengthUnit)}`;
}

function positive(id, label) {
  const input = document.getElementById(id); const value = Number(input.value); input.setAttribute("aria-invalid", "false");
  if (!Number.isFinite(value) || value <= 0) { input.setAttribute("aria-invalid", "true"); throw new Error(`${label} must be greater than zero.`); }
  return value;
}

export function initializeSimpleCalculator({ resultsUI }) {
  const form = document.getElementById("simple-form");
  const geometrySelect = document.getElementById("geometry-type");
  const fields = document.getElementById("geometry-fields");
  const assumptionBox = document.getElementById("assumption-box");
  const formulaContent = document.getElementById("formula-content");
  const message = document.getElementById("form-message");

  function renderGeometry(values = {}) {
    const geometry = geometrySelect.value;
    renderFields(fields, geometry, values);
    assumptionBox.innerHTML = `<strong>Assumptions</strong><span>${GEOMETRIES[geometry].assumption}</span>`;
    formulaContent.innerHTML = `<strong>${GEOMETRIES[geometry].title}</strong><div class="formula-display">${GEOMETRIES[geometry].formula}</div><p>${GEOMETRIES[geometry].assumption}</p>`;
    message.hidden = true;
  }

  function calculate() {
    message.hidden = true;
    try {
      const geometry = geometrySelect.value;
      let omega; let description; let values;
      if (geometry === "cone") {
        const input = document.getElementById("cone-angle"); const angle = Number(input.value);
        if (!Number.isFinite(angle) || angle < 0) throw new Error("Angle must be zero or greater.");
        const angleUnit = document.getElementById("angle-unit").value;
        const angleDefinition = document.querySelector('input[name="angle-definition"]:checked')?.value ?? "half";
        let radians = angleUnit === "degrees" ? degreesToRadians(angle) : angle;
        if (angleDefinition === "full") radians /= 2;
        if (radians > Math.PI) throw new Error("Cone half-angle must not exceed 180° (π radians).");
        omega = coneSolidAngle(radians);
        values = { angle, angleUnit, angleDefinition };
        description = `${angle} ${angleUnit} ${angleDefinition === 'half' ? 'half-angle' : 'full apex angle'}`;
      } else if (geometry === "disk") {
        const radius = positive("disk-radius", "Target radius"); const distance = positive("disk-distance", "Observer-to-plane distance"); const lengthUnit = document.getElementById("length-unit").value;
        omega = diskSolidAngle(radius, distance); values = { radius, distance, lengthUnit }; description = `radius ${radius} ${lengthUnit}; distance ${distance} ${lengthUnit}`;
      } else if (geometry === "rectangle") {
        const width = positive("rectangle-width", "Width"); const height = positive("rectangle-height", "Height"); const distance = positive("rectangle-distance", "Observer-to-plane distance"); const lengthUnit = document.getElementById("length-unit").value;
        omega = rectangleSolidAngle(width, height, distance); values = { width, height, distance, lengthUnit }; description = `${width} × ${height} ${lengthUnit}; distance ${distance} ${lengthUnit}`;
      } else {
        const radius = positive("sphere-radius", "Sphere radius"); const input = document.getElementById("sphere-distance"); const distance = Number(input.value); const lengthUnit = document.getElementById("length-unit").value;
        if (!Number.isFinite(distance) || distance < 0) throw new Error("Observer-to-center distance must be zero or greater.");
        omega = sphereSolidAngle(radius, distance); values = { radius, distance, lengthUnit }; description = `radius ${radius} ${lengthUnit}; center distance ${distance} ${lengthUnit}`;
      }
      resultsUI.displayResult({
        mode: "simple", title: GEOMETRIES[geometry].title, description, omega,
        shareState: { mode: "simple", geometry, values },
        exportData: { geometry, values, assumptions: GEOMETRIES[geometry].assumption },
      });
      return true;
    } catch (error) {
      resultsUI.clear(); message.textContent = error instanceof Error ? error.message : String(error); message.hidden = false; return false;
    }
  }

  geometrySelect.addEventListener("change", () => { renderGeometry(); resultsUI.clear(); });
  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  document.getElementById("reset-simple").addEventListener("click", () => { geometrySelect.value = "cone"; renderGeometry(); resultsUI.clear(); });
  renderGeometry();

  return {
    calculate,
    applyState(state) {
      if (!state || state.mode !== "simple" || !GEOMETRIES[state.geometry]) throw new Error("Invalid Simple Calculator share state.");
      geometrySelect.value = state.geometry; renderGeometry(state.values ?? {}); return calculate();
    },
  };
}
