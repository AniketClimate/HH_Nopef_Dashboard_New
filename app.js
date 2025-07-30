/* app.js - Updated to match new data.json structure */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------- Config ----------------------
  const DATA_PATHS = [
    "data.json", // root-level (preferred)
    "public/data.json", // fallback if kept inside /public
  ];

  // Map dashboard fields -> JSON fields
  const FIELD_MAP = {
    name: "name",
    population: "population_current",
    populationProjected: "population_projected",
    youthPct: "youth_percentage",
    internetPenetration: "internet_penetration",
    smartphonePenetration: "smartphone_penetration",
    digitalLiteracy: "digital_literacy",
    perCapitaIncome: "per_capita_income",
    healthSpend: "government_health_spending",
    healthInfraScore: "health_infrastructure_score",
    abdmRate: "abdm_adoption_rate",
    healthAppUsage: "health_app_usage",
    ruralUrban: "rural_urban_ratio",
    literacyRate: "literacy_rate",
    climateRisk: "climate_vulnerability_score",
    attractiveness: "market_attractiveness_score",
    priority: "priority_category",
  };

  // ---------------------- State ----------------------
  let stateData = [];
  let currentView = "dashboard";
  const charts = {};

  // ---------------------- Helpers ----------------------
  const $(id) => document.getElementById(id);
  const format = (n) => n.toLocaleString("en-IN");
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length || 0;

  // ---------------------- Initialization ----------------------
  init();

  function init() {
    console.log("âœ… Halla Health dashboard script loaded");
    bindNavigation();
    bindTabs();
    loadData();
  }

  // ---------------------- Data Loading ----------------------
  async function loadData() {
    for (const path of DATA_PATHS) {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(res.status);
        const raw = await res.json();
        if (!Array.isArray(raw)) throw new Error("JSON must be an array");
        console.log("ðŸ“Š Loaded", raw.length, "records from", path);
        stateData = raw.map(mapRecord);
        renderDashboard();
        renderCMS();
        return; // success
      } catch (err) {
        console.warn("âš ï¸ Failed to load", path, err);
      }
    }
    console.error("âŒ All data.json fetch attempts failed");
  }

  function mapRecord(obj) {
    const mapped = {};
    for (const key in FIELD_MAP) {
      mapped[key] = obj[FIELD_MAP[key]] ?? 0;
    }
    return mapped;
  }

  // ---------------------- Navigation ----------------------
  function bindNavigation() {
    $("navDashboard").addEventListener("click", () => switchView("dashboard"));
    $("navCms").addEventListener("click", () => switchView("cms"));
  }

  function switchView(view) {
    currentView = view;
    for (const v of document.querySelectorAll(".view")) v.classList.add("hidden");
    $(view + "View").classList.remove("hidden");
  }

  // ---------------------- Tabs ----------------------
  function bindTabs() {
    for (const btn of document.querySelectorAll(".tab-btn")) {
      btn.addEventListener("click", () => {
        for (const b of document.querySelectorAll(".tab-btn")) b.classList.remove("active");
        for (const c of document.querySelectorAll(".tab-content")) c.classList.remove("active");
        btn.classList.add("active");
        $(btn.dataset.tab).classList.add("active");
      });
    }
  }

  // ---------------------- Dashboard Rendering ----------------------
  function renderDashboard() {
    // KPIs
    const kpiGrid = $("kpiGrid");
    if (!kpiGrid) return;
    const totalPop = stateData.reduce((s, r) => s + r.population, 0);
    const totalProj = stateData.reduce((s, r) => s + r.populationProjected, 0);
    const avgYouth = avg(stateData.map((r) => r.youthPct));
    const avgSmart = avg(stateData.map((r) => r.smartphonePenetration));

    kpiGrid.innerHTML = `
      <div class="kpi-card"><h3>Total Pop (Now)</h3><div class="kpi-val">${format(totalPop)}</div></div>
      <div class="kpi-card"><h3>Total Pop (2030)</h3><div class="kpi-val">${format(totalProj)}</div></div>
      <div class="kpi-card"><h3>Avg Youth %</h3><div class="kpi-val">${avgYouth.toFixed(1)}%</div></div>
      <div class="kpi-card"><h3>Avg Smartphone %</h3><div class="kpi-val">${avgSmart.toFixed(1)}%</div></div>
    `;

    // Charts
    buildBarChart("populationChart", {
      labels: stateData.map((r) => r.name),
      datasets: [
        {
          label: "Population (Current)",
          data: stateData.map((r) => r.population),
          backgroundColor: "#1FB8CD",
        },
        {
          label: "Population (Projected)",
          data: stateData.map((r) => r.populationProjected),
          backgroundColor: "#FFC185",
        },
      ],
    });

    buildBarChart("attractivenessChart", {
      labels: stateData.map((r) => r.name),
      datasets: [
        {
          label: "Market Attractiveness",
          data: stateData.map((r) => r.attractiveness),
          backgroundColor: "#5D878F",
        },
      ],
    });

    buildLineChart("digitalChart", {
      labels: stateData.map((r) => r.name),
      datasets: [
        {
          label: "Internet %",
          data: stateData.map((r) => r.internetPenetration),
          borderColor: "#944454",
        },
        {
          label: "Smartphone %",
          data: stateData.map((r) => r.smartphonePenetration),
          borderColor: "#D2BA4C",
        },
      ],
    });

    buildLineChart("healthChart", {
      labels: stateData.map((r) => r.name),
      datasets: [
        {
          label: "Health Infra Score",
          data: stateData.map((r) => r.healthInfraScore),
          borderColor: "#13343B",
        },
        {
          label: "ABDM Adoption %",
          data: stateData.map((r) => r.abdmRate),
          borderColor: "#DB4545",
        },
      ],
    });

    // State Table
    renderStateTable();

    // Compare dropdowns
    populateCompare();
  }

  function buildBarChart(canvasId, cfg) {
    const ctx = $(canvasId);
    if (!ctx) return;
    charts[canvasId]?.destroy?.();
    charts[canvasId] = new Chart(ctx, { type: "bar", data: cfg, options: { responsive: true, plugins: { legend: { display: true }}}});
  }

  function buildLineChart(canvasId, cfg) {
    const ctx = $(canvasId);
    if (!ctx) return;
    charts[canvasId]?.destroy?.();
    charts[canvasId] = new Chart(ctx, { type: "line", data: cfg, options: { responsive: true, plugins: { legend: { display: true }}}});
  }

  // ---------------------- State Table ----------------------
  function renderStateTable() {
    const table = $("stateTable");
    if (!table) return;
    const head = table.querySelector("thead");
    const body = table.querySelector("tbody");

    head.innerHTML = `
      <tr>
        <th>State</th>
        <th>Pop (Now)</th>
        <th>Pop (Proj)</th>
        <th>Youth %</th>
        <th>Smartphone %</th>
        <th>Infra Score</th>
        <th>ABDM %</th>
        <th>Attractiveness</th>
        <th>Priority</th>
      </tr>`;

    body.innerHTML = stateData
      .map((r) => `
        <tr>
          <td>${r.name}</td>
          <td>${format(r.population)}</td>
          <td>${format(r.populationProjected)}</td>
          <td>${r.youthPct}%</td>
          <td>${r.smartphonePenetration}%</td>
          <td>${r.healthInfraScore}</td>
          <td>${r.abdmRate}%</td>
          <td>${r.attractiveness}</td>
          <td class="priority-${r.priority?.split(" ")[0].toLowerCase()}">${r.priority || "â€”"}</td>
        </tr>
      `)
      .join("");
  }

  // ---------------------- Compare ----------------------
  function populateCompare() {
    const a = $("compareA");
    const b = $("compareB");
    if (!a || !b) return;

    const opts = stateData.map((r) => `<option value="${r.name}">${r.name}</option>`).join("");
    a.innerHTML = "<option value=''>Choose...</option>" + opts;
    b.innerHTML = "<option value=''>Choose...</option>" + opts;

    a.selectedIndex = 1;
    b.selectedIndex = 2;

    a.addEventListener("change", drawCompare);
    b.addEventListener("change", drawCompare);
    drawCompare();

    function drawCompare() {
      const sA = stateData.find((r) => r.name === a.value);
      const sB = stateData.find((r) => r.name === b.value);
      if (!sA || !sB) return;
      const ctx = $("compareChart");
      if (!ctx) return;

      const fPop = (n) => Math.min(100, (n / 250_000_000) * 100);
      const f100 = (n) => Math.min(100, n);
      const data = {
        labels: ["Population", "Youth %", "Smart %", "Infra", "Attractiveness"],
        datasets: [
          {
            label: sA.name,
            data: [
              fPop(sA.population),
              f100(sA.youthPct),
              f100(sA.smartphonePenetration),
              f100(sA.healthInfraScore * 10),
              f100(sA.attractiveness * 10),
            ],
            backgroundColor: "#1FB8CD66",
            borderColor: "#1FB8CD",
          },
          {
            label: sB.name,
            data: [
              fPop(sB.population),
              f100(sB.youthPct),
              f100(sB.smartphonePenetration),
              f100(sB.healthInfraScore * 10),
              f100(sB.attractiveness * 10),
            ],
            backgroundColor: "#FFC18566",
            borderColor: "#FFC185",
          },
        ],
      };

      charts.compare?.destroy?.();
      charts.compare = new Chart(ctx, { type: "radar", data, options: { responsive: true, scales: { r: { suggestedMax: 100 }}} });
    }
  }

  // ---------------------- CMS Rendering ----------------------
  function renderCMS() {
    renderAdminTable();
    bindCMSLogin();
  }

  function bindCMSLogin() {
    const form = $("loginForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = $("username").value.trim();
      const pass = $("password").value.trim();
      if (user === "admin" && pass === "admin123") {
        $("loginSection").classList.add("hidden");
        $("adminSection").classList.remove("hidden");
        renderAdminTable();
      } else alert("Invalid credentials");
    });
  }

  function renderAdminTable() {
    const table = $("cmsStateTable");
    if (!table) return;
    const head = table.querySelector("thead");
    const body = table.querySelector("tbody");
    head.innerHTML = `<tr><th>State</th><th>Pop (Now)</th><th>Youth %</th><th>Smart %</th><th>Priority</th></tr>`;
    body.innerHTML = stateData
      .map((r, idx) => `
        <tr>
          <td>${r.name}</td>
          <td><input type="number" data-idx="${idx}" data-field="population" value="${r.population}" /></td>
          <td><input type="number" data-idx="${idx}" data-field="youthPct" value="${r.youthPct}" /></td>
          <td><input type="number" data-idx="${idx}" data-field="smartphonePenetration" value="${r.smartphonePenetration}" /></td>
          <td><input type="text" data-idx="${idx}" data-field="priority" value="${r.priority}" /></td>
        </tr>`)
      .join("");
  }
});
