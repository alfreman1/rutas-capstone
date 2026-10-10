"use strict";
const byId = (id) => document.getElementById(id);
const colors = [
  "#16736b",
  "#ba663e",
  "#5068a4",
  "#926599",
  "#8a762c",
  "#2e7c9e",
];
const state = {
  scenario: null,
  result: null,
  mode: "optimized",
  vehicle: 0,
  busy: false,
  presets: [],
};
const kilometers = (meters) => (meters / 1000).toFixed(1);
const minutes = (seconds) => (seconds / 60).toFixed(1);

function announce(text, error = false) {
  byId("status").textContent = text;
  byId("status").classList.toggle("error", error);
}
async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Revisa los datos: usa enteros dentro de los límites indicados.",
    );
  return data;
}
function post(url, data) {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
function busy(value) {
  state.busy = value;
  document
    .querySelectorAll(".controls input,.controls select,.controls button")
    .forEach((element) => {
      element.disabled = value;
    });
  byId("download").disabled = value || !state.result;
}
function table(headers, rows) {
  const element = document.createElement("table");
  const head = element.createTHead().insertRow();
  headers.forEach((value) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = value;
    head.append(cell);
  });
  const body = element.createTBody();
  rows.forEach((values) => {
    const row = body.insertRow();
    values.forEach((value) => {
      row.insertCell().textContent = value;
    });
  });
  return element;
}
function metric(label, value, note) {
  const element = document.createElement("article");
  element.className = "metric";
  for (const [tag, text] of [
    ["span", label],
    ["strong", value],
    ["small", note],
  ]) {
    const child = document.createElement(tag);
    child.textContent = text;
    element.append(child);
  }
  return element;
}
function fillScenario(scenario) {
  state.scenario = structuredClone(scenario);
  byId("vehicles").value = scenario.vehicles;
  byId("capacity").value = scenario.capacity;
  byId("max-minutes").value = scenario.max_minutes;
  byId("speed").value = scenario.speed_kmh;
  byId("order-count").value = scenario.orders.length;
  byId("orders-table").replaceChildren(
    table(
      ["Pedido", "X (cuadras)", "Y (cuadras)", "Cajas", "Servicio (min)"],
      scenario.orders.map((order) => [
        order.id,
        order.x,
        order.y,
        order.demand,
        order.service_minutes,
      ]),
    ),
  );
  invalidate();
}
function readSettings() {
  return {
    ...state.scenario,
    vehicles: Number(byId("vehicles").value),
    capacity: Number(byId("capacity").value),
    max_minutes: Number(byId("max-minutes").value),
    speed_kmh: Number(byId("speed").value),
  };
}
function invalidate() {
  state.result = null;
  state.vehicle = 0;
  byId("metrics").replaceChildren();
  byId("routes").replaceChildren();
  byId("vehicle-filter").replaceChildren();
  byId("outcome").hidden = true;
  byId("download").disabled = true;
  byId("plan-explanation").textContent =
    "Calcula el reparto para ver las secuencias de visita.";
  const total = state.scenario.orders.reduce(
    (sum, order) => sum + order.demand,
    0,
  );
  byId("demand-summary").textContent =
    `${state.scenario.orders.length} entregas · ${total} cajas · capacidad total ${Number(byId("vehicles").value) * Number(byId("capacity").value)} cajas`;
  renderMap();
  announce(
    "Escenario listo. Pulsa Optimizar reparto; cambiar una condición invalida el resultado anterior.",
  );
}
for (const id of ["vehicles", "capacity", "max-minutes", "speed"])
  byId(id).addEventListener("input", invalidate);
byId("preset").addEventListener("change", () => {
  const preset = state.presets.find((item) => item.id === byId("preset").value);
  if (preset) fillScenario(preset.scenario);
});
byId("generate").addEventListener("click", async () => {
  if (!byId("order-count").reportValidity() || !byId("seed").reportValidity())
    return;
  busy(true);
  try {
    const scenario = await post("/api/generate", {
      seed: Number(byId("seed").value),
      order_count: Number(byId("order-count").value),
    });
    byId("preset").value = "custom";
    fillScenario(scenario);
  } catch (error) {
    announce(error.message, true);
  } finally {
    busy(false);
  }
});
async function solve() {
  if (state.busy || !byId("plan-form").reportValidity()) return;
  state.scenario = readSettings();
  busy(true);
  announce(
    "Buscando un plan que atienda todos los pedidos y respete los límites…",
  );
  try {
    state.result = await post("/api/optimize", state.scenario);
    state.vehicle = 0;
    renderResult();
    announce(
      state.result.status === "feasible"
        ? "Plan listo y restricciones verificadas. Compara la ruta inicial con la optimizada."
        : "No hay un plan completo disponible. Revisa el diagnóstico.",
    );
  } catch (error) {
    announce(error.message, true);
  } finally {
    busy(false);
  }
}
byId("plan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  solve();
});
for (const mode of ["optimized", "baseline"])
  byId(`show-${mode}`).addEventListener("click", () => {
    state.mode = mode;
    state.vehicle = 0;
    for (const other of ["optimized", "baseline"]) {
      byId(`show-${other}`).classList.toggle("active", other === mode);
      byId(`show-${other}`).setAttribute(
        "aria-pressed",
        String(other === mode),
      );
    }
    if (state.result) renderResult();
    else renderMap();
  });
function activePlan() {
  return state.result ? state.result[state.mode] : null;
}

function renderMap() {
  const map = byId("route-map");
  map.replaceChildren();
  const ns = "http://www.w3.org/2000/svg";
  const x = (value) => 100 + value * 21;
  const y = (value) => 460 - value * 21;
  function svg(tag, attrs, text, parent = map) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) =>
      element.setAttribute(key, value),
    );
    if (text !== undefined) element.textContent = text;
    parent.append(element);
    return element;
  }
  svg("rect", { x: 100, y: 40, width: 420, height: 420, fill: "#e7eadf" });
  for (let grid = 0; grid <= 20; grid++) {
    svg("line", {
      x1: x(grid),
      y1: y(0),
      x2: x(grid),
      y2: y(20),
      stroke: "#fcfcf5",
      "stroke-width": grid % 5 ? 2 : 4,
    });
    svg("line", {
      x1: x(0),
      y1: y(grid),
      x2: x(20),
      y2: y(grid),
      stroke: "#fcfcf5",
      "stroke-width": grid % 5 ? 2 : 4,
    });
    if (grid % 5 === 0) {
      svg(
        "text",
        {
          x: x(grid),
          y: 482,
          "text-anchor": "middle",
          "font-size": 10,
          fill: "#617a72",
        },
        `${grid / 2} km`,
      );
      svg(
        "text",
        {
          x: 89,
          y: y(grid) + 3,
          "text-anchor": "end",
          "font-size": 10,
          fill: "#617a72",
        },
        `${grid / 2}`,
      );
    }
  }
  if (!state.scenario) return;
  const nodes = new Map([
    [0, { id: 0, x: 10, y: 10 }],
    ...state.scenario.orders.map((order) => [order.id, order]),
  ]);
  const plan = activePlan();
  const assignment = new Map();
  if (plan)
    for (const route of plan.routes) {
      route.order_ids.forEach((id) => assignment.set(id, route.vehicle));
      if (state.vehicle && route.vehicle !== state.vehicle) continue;
      const ids = [0, ...route.order_ids, 0];
      let path = `M${x(10)} ${y(10)}`;
      for (let index = 1; index < ids.length; index++) {
        const node = nodes.get(ids[index]);
        path += ` H${x(node.x)} V${y(node.y)}`;
      }
      svg("path", {
        d: path,
        fill: "none",
        stroke: colors[route.vehicle - 1],
        "stroke-width": 3.5,
        "stroke-linejoin": "round",
        opacity: 0.8,
      });
    }
  for (const order of state.scenario.orders) {
    const vehicle = assignment.get(order.id);
    const muted = state.vehicle && state.vehicle !== vehicle;
    const color = vehicle ? colors[vehicle - 1] : "#6f817e";
    const group = svg("g", {
      tabindex: 0,
      role: "button",
      "aria-label": `Pedido ${order.id}: ${order.demand} cajas, ${order.service_minutes} minutos de servicio`,
      opacity: muted ? 0.35 : 1,
      style: "cursor:pointer",
    });
    svg(
      "circle",
      {
        cx: x(order.x),
        cy: y(order.y),
        r: 10,
        fill: color,
        stroke: "#fff",
        "stroke-width": 2,
      },
      undefined,
      group,
    );
    svg(
      "text",
      {
        x: x(order.x),
        y: y(order.y) + 3,
        "text-anchor": "middle",
        "font-size": 9,
        "font-weight": "bold",
        fill: "white",
        "pointer-events": "none",
      },
      order.id,
      group,
    );
    const describe = () => {
      byId("map-detail").textContent =
        `Pedido ${order.id} · ${order.demand} cajas · servicio ${order.service_minutes} min · posición (${order.x}, ${order.y})${plan ? (vehicle ? ` · vehículo ${vehicle}` : " · sin asignar en este plan") : ""}.`;
    };
    group.addEventListener("click", describe);
    group.addEventListener("keydown", (event) => {
      if (["Enter", " "].includes(event.key)) {
        event.preventDefault();
        describe();
      }
    });
  }
  svg("rect", {
    x: x(10) - 11,
    y: y(10) - 11,
    width: 22,
    height: 22,
    rx: 4,
    fill: "#183b40",
    stroke: "white",
    "stroke-width": 2,
  });
  svg(
    "text",
    {
      x: x(10),
      y: y(10) + 4,
      "font-size": 11,
      "text-anchor": "middle",
      fill: "white",
      "font-weight": "bold",
    },
    "D",
  );
  byId("map-label").textContent =
    `${state.mode === "baseline" ? "Plan inicial" : "Plan optimizado"}${plan ? (plan.feasible ? " · completo" : " · incompleto") : " · sin calcular o sin solución"} / Cuadras de 500 m`;
  byId("map-detail").textContent =
    "Selecciona una entrega para ver su carga y servicio. Las líneas representan tramos horizontales y verticales; el orden está en los itinerarios.";
}

function renderFilters(plan) {
  byId("vehicle-filter").replaceChildren();
  if (!plan) return;
  for (const number of [
    0,
    ...plan.routes
      .filter((route) => route.order_ids.length)
      .map((route) => route.vehicle),
  ]) {
    const button = document.createElement("button");
    button.className = state.vehicle === number ? "active" : "";
    button.setAttribute("aria-pressed", String(state.vehicle === number));
    if (number) {
      const dot = document.createElement("i");
      dot.style.background = colors[number - 1];
      button.append(dot);
    }
    button.append(
      document.createTextNode(number ? `Vehículo ${number}` : "Todos"),
    );
    button.addEventListener("click", () => {
      state.vehicle = number;
      renderMap();
      renderFilters(plan);
    });
    byId("vehicle-filter").append(button);
  }
}
function renderResult() {
  const result = state.result;
  const plan = activePlan();
  const metrics = byId("metrics");
  metrics.replaceChildren();
  if (plan) {
    metrics.append(
      metric(
        plan.feasible ? "Distancia total" : "Recorrido parcial",
        `${kilometers(plan.total_distance_meters)} km`,
        state.mode === "baseline" ? "Regla inicial" : "Plan seleccionado",
      ),
    );
    metrics.append(
      metric(
        "Último regreso",
        `${minutes(plan.makespan_seconds)} min`,
        "Todos parten al minuto 0",
      ),
    );
    metrics.append(
      metric(
        "Pedidos asignados",
        `${plan.served_orders}/${plan.total_orders}`,
        `${plan.vehicles_used} vehículos usados`,
      ),
    );
  }
  const outcome = byId("outcome");
  outcome.hidden = false;
  outcome.replaceChildren();
  outcome.classList.toggle(
    "warning",
    result.status !== "feasible" || (plan && !plan.feasible),
  );
  const text = document.createElement("strong");
  if (result.status === "proven_infeasible")
    text.textContent = "No es factible con estas condiciones.";
  else if (result.status === "no_solution_found")
    text.textContent =
      "No se encontró un plan dentro de la búsqueda disponible.";
  else if (result.savings)
    text.textContent = `${result.savings.percent.toFixed(1)} % menos distancia que el plan inicial completo (${kilometers(result.savings.meters)} km).`;
  else
    text.textContent =
      "Se encontró un plan completo. El inicial era incompleto: no corresponde calcular ahorro.";
  outcome.append(text);
  const note = document.createElement("p");
  note.textContent = result.reasons.length
    ? result.reasons.join(" ")
    : `Búsqueda: ${result.elapsed_seconds.toFixed(2)} s. ${result.solution_source === "baseline_retained" ? "Se conservó el plan inicial." : "Solución heurística; no se certifica el óptimo global."}`;
  outcome.append(note);
  if (plan && !plan.feasible) {
    const missing = document.createElement("p");
    missing.textContent = `Este plan deja sin asignar: ${plan.unassigned.join(", ") || "ninguno"}. ${plan.errors.join(" ")}`;
    outcome.append(missing);
  }
  renderMap();
  renderFilters(plan);
  renderRoutes(plan);
}
function renderRoutes(plan) {
  byId("routes").replaceChildren();
  byId("plan-explanation").textContent = plan
    ? `${state.mode === "baseline" ? "Plan inicial" : "Plan optimizado"}. Tiempos en minutos desde la salida; las llegadas incluyen las descargas anteriores. Cada vehículo vuelve al depósito.`
    : "No hay itinerarios optimizados disponibles. Puedes revisar el plan inicial y modificar las condiciones.";
  if (!plan) return;
  for (const route of plan.routes) {
    const card = document.createElement("article");
    card.className = "route-card";
    card.style.borderTopColor = colors[route.vehicle - 1];
    const heading = document.createElement("h3");
    heading.textContent = `Vehículo ${route.vehicle}${route.order_ids.length ? "" : " · sin usar"}`;
    const stats = document.createElement("div");
    stats.className = "route-stats";
    stats.textContent = `${route.load}/${route.capacity} cajas · ${kilometers(route.distance_meters)} km · ${minutes(route.duration_seconds)} min`;
    const sequence = document.createElement("div");
    sequence.className = "route-sequence";
    sequence.textContent = ["D", ...route.order_ids, "D"].join(" → ");
    card.append(heading, stats, sequence);
    if (route.stops.length) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "Ver llegadas y descargas";
      details.append(summary);
      details.append(
        table(
          ["Pedido", "Llegada min", "Salida min", "Cajas"],
          route.stops.map((stop) => [
            stop.id,
            minutes(stop.arrival_seconds),
            minutes(stop.departure_seconds),
            stop.demand,
          ]),
        ),
      );
      card.append(details);
    }
    const check = document.createElement("p");
    check.textContent = route.valid
      ? "Capacidad y turno respetados."
      : "Esta ruta incumple una restricción.";
    card.append(check);
    byId("routes").append(card);
  }
}
byId("download").addEventListener("click", () => {
  if (!state.result) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(state.result, null, 2)], {
      type: "application/json",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "nexo-plan.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
for (const tab of ["plan", "evaluate", "learn"])
  byId(`tab-${tab}`).addEventListener("click", () => {
    byId("status").hidden = tab !== "plan";
    for (const other of ["plan", "evaluate", "learn"]) {
      byId(`panel-${other}`).hidden = other !== tab;
      byId(`tab-${other}`).classList.toggle("active", other === tab);
      byId(`tab-${other}`).setAttribute("aria-pressed", String(other === tab));
    }
  });
async function loadBenchmark() {
  try {
    const report = await request("/api/benchmark");
    const summary = report.summary;
    byId("benchmark-summary").replaceChildren(
      metric("Casos evaluados", summary.cases, "Escenarios sintéticos fijos"),
      metric(
        "Planes completos",
        summary.feasible,
        "Con restricciones verificadas",
      ),
      metric(
        "Ahorro medio",
        `${summary.mean_savings_percent.toFixed(1)} %`,
        `${summary.comparable} comparaciones válidas`,
      ),
    );
    byId("benchmark-table").replaceChildren(
      table(
        ["Caso", "Inicial km", "Optimizado km", "Ahorro", "Estado"],
        report.records.map((row) => [
          row.id,
          row.baseline.feasible
            ? kilometers(row.baseline.total_distance_meters)
            : "Incompleto",
          row.optimized ? kilometers(row.optimized.total_distance_meters) : "—",
          row.savings ? `${row.savings.percent.toFixed(1)} %` : "No comparable",
          row.status === "feasible"
            ? "Factible"
            : row.status === "proven_infeasible"
              ? "Imposible por límite"
              : "No encontrado",
        ]),
      ),
    );
    const exact = report.records.find((row) => row.id === "small");
    byId("exact-note").textContent =
      `En el caso pequeño, la enumeración exacta dio ${kilometers(exact.exact_reference_meters)} km. Diferencia del plan encontrado: ${exact.gap_to_exact_meters} metros.`;
  } catch (error) {
    byId("benchmark-table").textContent =
      `Evaluación no disponible: ${error.message}`;
  }
}
async function initialize() {
  try {
    const data = await request("/api/scenarios");
    state.presets = data.presets;
    for (const preset of [
      ...data.presets,
      { id: "custom", label: "Pedidos personalizados" },
    ]) {
      const option = document.createElement("option");
      option.value = preset.id;
      option.disabled = preset.id === "custom";
      option.textContent = preset.label;
      byId("preset").append(option);
    }
    fillScenario(data.presets[0].scenario);
    loadBenchmark();
    await solve();
  } catch (error) {
    announce(error.message, true);
  }
}
initialize();
