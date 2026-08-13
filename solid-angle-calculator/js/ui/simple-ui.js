import {
  coneSolidAngle,
  diskSolidAngle,
  rectangleSolidAngle,
  sphereSolidAngle,
} from "../core/simple-geometries.js";

import {
  degreesToRadians,
  radiansToDegrees,
  steradiansToSquareDegrees,
  percentOfFullSphere,
  percentOfHemisphere,
  equivalentConeHalfAngle,
  formatNumber,
} from "../core/units.js";

const GEOMETRIES = {
  cone: {
    title: "Cone",
    assumption:
      "The cone is defined by its axis and angular aperture. A full apex angle is converted internally to a half-angle.",
    formula:
      "Ω = 2π(1 − cos θ), where θ is the cone half-angle.",
  },
  disk: {
    title: "Circular Target",
    assumption:
      "The circular target is planar, centered on the viewing axis, and perpendicular to the observer-target direction.",
    formula:
      "Ω = 2π(1 − d / √(d² + r²)), where r is target radius and d is observer-to-plane distance.",
  },
  rectangle: {
    title: "Rectangle",
    assumption:
      "The rectangle is planar, centered on the viewing axis, and perpendicular to the observer-target direction.",
    formula:
      "Ω = 4 atan2(ab, d√(d² + a² + b²)), where a = width/2 and b = height/2.",
  },
  sphere: {
    title: "Sphere",
    assumption:
      "Distance is measured from the observer to the sphere center. An observer inside the sphere subtends the full 4π sr.",
    formula:
      "For d > r: Ω = 2π(1 − √(d² − r²)/d). At d = r, Ω = 2π. For d < r, Ω = 4π.",
  },
};

const LENGTH_UNITS = [
  ["mm", "Millimeters"],
  ["cm", "Centimeters"],
  ["m", "Meters"],
  ["km", "Kilometers"],
  ["in", "Inches"],
  ["ft", "Feet"],
];

function numberField(id, label, value = "", hint = "") {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="number" step="any" min="0" value="${value}" inputmode="decimal">
      ${hint ? `<span class="hint">${hint}</span>` : ""}
    </div>
  `;
}

function lengthUnitField() {
  return `
    <div class="field">
      <label for="length-unit">Length unit</label>
      <select id="length-unit" name="length-unit">
        ${LENGTH_UNITS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
      </select>
      <span class="hint">All lengths in one calculation must use the same unit.</span>
    </div>
  `;
}

function renderGeometryFields(container, geometry) {
  if (geometry === "cone") {
    container.innerHTML = `
      <div class="field-row">
        ${numberField("cone-angle", "Angle", "60")}
        <div class="field">
          <label for="angle-unit">Angle unit</label>
          <select id="angle-unit" name="angle-unit">
            <option value="degrees">Degrees</option>
            <option value="radians">Radians</option>
          </select>
        </div>
      </div>

      <div class="field">
        <span class="field-label">Angle definition</span>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="angle-definition" value="half" checked>
            Half-angle
          </label>
          <label class="radio-option">
            <input type="radio" name="angle-definition" value="full">
            Full apex angle
          </label>
        </div>
      </div>
    `;
    return;
  }

  if (geometry === "disk") {
    container.innerHTML = `
      <div class="field-row">
        ${numberField("disk-radius", "Target radius", "1")}
        ${numberField("disk-distance", "Observer-to-plane distance", "1")}
      </div>
      ${lengthUnitField()}
    `;
    return;
  }

  if (geometry === "rectangle") {
    container.innerHTML = `
      <div class="field-row">
        ${numberField("rectangle-width", "Width", "2")}
        ${numberField("rectangle-height", "Height", "2")}
      </div>
      ${numberField("rectangle-distance", "Observer-to-plane distance", "1")}
      ${lengthUnitField()}
    `;
    return;
  }

  if (geometry === "sphere") {
    container.innerHTML = `
      <div class="field-row">
        ${numberField("sphere-radius", "Sphere radius", "1")}
        ${numberField("sphere-distance", "Observer-to-center distance", "2")}
      </div>
      ${lengthUnitField()}
    `;
  }
}

function finitePositiveFromInput(id, label) {
  const input = document.getElementById(id);
  const value = Number(input.value);

  input.setAttribute("aria-invalid", "false");

  if (!Number.isFinite(value) || value <= 0) {
    input.setAttribute("aria-invalid", "true");
    throw new Error(`${label} must be greater than zero.`);
  }

  return value;
}

function calculateGeometry(geometry) {
  if (geometry === "cone") {
    const input = document.getElementById("cone-angle");
    const value = Number(input.value);

    input.setAttribute("aria-invalid", "false");

    if (!Number.isFinite(value) || value < 0) {
      input.setAttribute("aria-invalid", "true");
      throw new Error("Angle must be zero or greater.");
    }

    const unit = document.getElementById("angle-unit").value;
    const definition =
      document.querySelector('input[name="angle-definition"]:checked')?.value ?? "half";

    let radians = unit === "degrees" ? degreesToRadians(value) : value;
    if (definition === "full") radians /= 2;

    if (radians > Math.PI) {
      input.setAttribute("aria-invalid", "true");
      throw new Error("Cone half-angle must not exceed 180° (π radians).");
    }

    return {
      omega: coneSolidAngle(radians),
      description:
        definition === "half"
          ? `${value} ${unit === "degrees" ? "degrees" : "radians"} half-angle`
          : `${value} ${unit === "degrees" ? "degrees" : "radians"} full apex angle`,
    };
  }

  if (geometry === "disk") {
    const radius = finitePositiveFromInput("disk-radius", "Target radius");
    const distance = finitePositiveFromInput("disk-distance", "Observer-to-plane distance");
    return {
      omega: diskSolidAngle(radius, distance),
      description: `circular target with radius ${radius} and distance ${distance}`,
    };
  }

  if (geometry === "rectangle") {
    const width = finitePositiveFromInput("rectangle-width", "Width");
    const height = finitePositiveFromInput("rectangle-height", "Height");
    const distance = finitePositiveFromInput("rectangle-distance", "Observer-to-plane distance");
    return {
      omega: rectangleSolidAngle(width, height, distance),
      description: `rectangle ${width} × ${height} at distance ${distance}`,
    };
  }

  if (geometry === "sphere") {
    const radius = finitePositiveFromInput("sphere-radius", "Sphere radius");
    const input = document.getElementById("sphere-distance");
    const distance = Number(input.value);

    input.setAttribute("aria-invalid", "false");

    if (!Number.isFinite(distance) || distance < 0) {
      input.setAttribute("aria-invalid", "true");
      throw new Error("Observer-to-center distance must be zero or greater.");
    }

    return {
      omega: sphereSolidAngle(radius, distance),
      description: `sphere with radius ${radius} and center distance ${distance}`,
    };
  }

  throw new Error("Unsupported geometry.");
}

function formatResult(omega) {
  const deg2 = steradiansToSquareDegrees(omega);
  const spherePct = percentOfFullSphere(omega);
  const hemiPct = percentOfHemisphere(omega);

  let equivalentText = "Not applicable";
  let equivalentNote = "requires Ω ≤ 2π";

  if (omega <= 2 * Math.PI + 1e-12) {
    const halfAngle = equivalentConeHalfAngle(Math.min(omega, 2 * Math.PI));
    const halfDegrees = radiansToDegrees(halfAngle);
    equivalentText = `${formatNumber(halfDegrees, 6)}°`;
    equivalentNote = "equivalent cone half-angle";
  }

  return {
    steradians: formatNumber(omega, 9),
    squareDegrees: formatNumber(deg2, 6),
    spherePercent: formatNumber(spherePct, 6),
    hemispherePercent: formatNumber(hemiPct, 6),
    equivalentText,
    equivalentNote,
  };
}

function buildInterpretation(omega, formatted) {
  const hemiPct = percentOfHemisphere(omega);
  let text =
    `The target subtends ${formatted.steradians} sr, equivalent to ` +
    `${formatted.hemispherePercent}% of a hemisphere and ` +
    `${formatted.spherePercent}% of a full sphere.`;

  if (omega <= 2 * Math.PI + 1e-12) {
    text += ` The same solid angle corresponds to a circular viewing cone with a half-angle of ${formatted.equivalentText}.`;
  }

  return text;
}

export function initializeSimpleCalculator() {
  const form = document.getElementById("simple-form");
  const geometrySelect = document.getElementById("geometry-type");
  const fields = document.getElementById("geometry-fields");
  const assumptionBox = document.getElementById("assumption-box");
  const formulaContent = document.getElementById("formula-content");
  const message = document.getElementById("form-message");
  const resetButton = document.getElementById("reset-simple");
  const copyButton = document.getElementById("copy-result");

  const empty = document.getElementById("result-empty");
  const content = document.getElementById("result-content");

  let copyText = "";

  const renderGeometry = () => {
    const geometry = geometrySelect.value;
    renderGeometryFields(fields, geometry);
    assumptionBox.innerHTML = `<strong>Assumptions</strong><span>${GEOMETRIES[geometry].assumption}</span>`;
    formulaContent.innerHTML = `
      <strong>${GEOMETRIES[geometry].title}</strong>
      <div class="formula-display">${GEOMETRIES[geometry].formula}</div>
      <p>${GEOMETRIES[geometry].assumption}</p>
    `;
    message.hidden = true;
  };

  const clearResults = () => {
    empty.hidden = false;
    content.hidden = true;
    copyButton.disabled = true;
    copyText = "";
  };

  const showError = (error) => {
    message.textContent = error instanceof Error ? error.message : String(error);
    message.hidden = false;
  };

  const showResult = (omega, geometry, description) => {
    const formatted = formatResult(omega);

    document.getElementById("result-sr").textContent = formatted.steradians;
    document.getElementById("result-deg2").textContent = formatted.squareDegrees;
    document.getElementById("result-sphere-pct").textContent = formatted.spherePercent;
    document.getElementById("result-hemi-pct").textContent = formatted.hemispherePercent;
    document.getElementById("result-equivalent").textContent = formatted.equivalentText;
    document.getElementById("result-equivalent-note").textContent = formatted.equivalentNote;
    document.getElementById("result-interpretation").textContent =
      buildInterpretation(omega, formatted);

    empty.hidden = true;
    content.hidden = false;
    copyButton.disabled = false;

    copyText = [
      "Solid Angle & 3D Visibility Calculator",
      `Geometry: ${GEOMETRIES[geometry].title}`,
      `Input: ${description}`,
      `Solid angle: ${formatted.steradians} sr`,
      `Square degrees: ${formatted.squareDegrees} deg²`,
      `Full sphere: ${formatted.spherePercent}%`,
      `Hemisphere: ${formatted.hemispherePercent}%`,
      `Equivalent cone: ${formatted.equivalentText} (${formatted.equivalentNote})`,
    ].join("\n");
  };

  geometrySelect.addEventListener("change", () => {
    renderGeometry();
    clearResults();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.hidden = true;

    try {
      const geometry = geometrySelect.value;
      const { omega, description } = calculateGeometry(geometry);
      showResult(omega, geometry, description);
    } catch (error) {
      clearResults();
      showError(error);
    }
  });

  resetButton.addEventListener("click", () => {
    geometrySelect.value = "cone";
    renderGeometry();
    clearResults();
  });

  copyButton.addEventListener("click", async () => {
    if (!copyText) return;

    try {
      await navigator.clipboard.writeText(copyText);
      const original = copyButton.textContent;
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = original;
      }, 1400);
    } catch {
      showError("Could not copy the result to the clipboard.");
    }
  });

  renderGeometry();
  clearResults();
}
