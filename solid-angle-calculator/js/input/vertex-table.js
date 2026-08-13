/**
 * Editable target vertex table.
 */

export function createVertexTableController({
  tableBody,
  onChange = () => {},
}) {
  let mode = "cartesian";
  let vertices = [];

  const fieldsForMode = () =>
    mode === "cartesian"
      ? [
          ["x", "X"],
          ["y", "Y"],
          ["z", "Z"],
        ]
      : [
          ["longitude", "Longitude"],
          ["latitude", "Latitude"],
          ["height", "Height (m)"],
        ];

  const emit = () => onChange(getVertices());

  function render() {
    tableBody.innerHTML = "";

    vertices.forEach((vertex, index) => {
      const row = document.createElement("tr");

      const label = document.createElement("td");
      label.textContent = `P${index + 1}`;
      row.appendChild(label);

      for (const [key, title] of fieldsForMode()) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.step = "any";
        input.value = Number.isFinite(vertex[key]) ? String(vertex[key]) : "";
        input.setAttribute("aria-label", `${title} for vertex ${index + 1}`);
        input.addEventListener("input", () => {
          const value = Number(input.value);
          vertices[index][key] = Number.isFinite(value) ? value : NaN;
          emit();
        });
        cell.appendChild(input);
        row.appendChild(cell);
      }

      const actions = document.createElement("td");
      actions.className = "vertex-actions";

      const up = document.createElement("button");
      up.type = "button";
      up.className = "icon-button";
      up.textContent = "↑";
      up.title = "Move vertex up";
      up.disabled = index === 0;
      up.addEventListener("click", () => {
        [vertices[index - 1], vertices[index]] = [vertices[index], vertices[index - 1]];
        render();
        emit();
      });

      const down = document.createElement("button");
      down.type = "button";
      down.className = "icon-button";
      down.textContent = "↓";
      down.title = "Move vertex down";
      down.disabled = index === vertices.length - 1;
      down.addEventListener("click", () => {
        [vertices[index + 1], vertices[index]] = [vertices[index], vertices[index + 1]];
        render();
        emit();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-button danger";
      remove.textContent = "×";
      remove.title = "Delete vertex";
      remove.addEventListener("click", () => {
        vertices.splice(index, 1);
        render();
        emit();
      });

      actions.append(up, down, remove);
      row.appendChild(actions);
      tableBody.appendChild(row);
    });
  }

  function setMode(newMode) {
    mode = newMode;
    vertices = [];
    render();
    emit();
  }

  function setVertices(newVertices) {
    vertices = newVertices.map((v) => ({ ...v }));
    render();
    emit();
  }

  function getVertices() {
    return vertices.map((v) => ({ ...v }));
  }

  function addVertex(initial = null) {
    const vertex =
      initial ??
      (mode === "cartesian"
        ? { x: 0, y: 0, z: 0 }
        : { longitude: 35.22, latitude: 31.78, height: 0 });

    vertices.push({ ...vertex });
    render();
    emit();
  }

  function clear() {
    vertices = [];
    render();
    emit();
  }

  return {
    setMode,
    setVertices,
    getVertices,
    addVertex,
    clear,
    render,
  };
}
