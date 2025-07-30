
// Halla Health â€“ Fixed app.js (2025-07-30)
// ------------------------------------------------------------
// This script powers both the public dashboard and the CMS.
// It safely loads data.json, renders charts, and handles tab
// navigation without throwing runtime errors even if data is
// missing. All DOM work waits until DOMContentLoaded.
// ------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  console.log('âœ… Halla Health dashboard script loaded');

  // ---------------------------------------------------------------------------
  // Utility helpers
  // ---------------------------------------------------------------------------
  const avg = arr => arr.length ? arr.reduce((s, v) => s + (+v || 0), 0) / arr.length : 0;
  const normalize = (val, max) => max ? Math.min(100, (val / max) * 100) : 0;
  const formatNum = n => {
    if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
    return (+n || 0).toLocaleString();
  };

  // Simple toast helper (non-blocking)
  const showToast = (msg, type = 'info') => {
    let box = document.getElementById('toastContainer');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toastContainer';
      box.className = 'toast-container';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  };

  // ---------------------------------------------------------------------------
  // Tab navigation (Overview â€¢ State Analysis â€¢ Compare)
  // ---------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // update button active states
      tabButtons.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      // update content visibility
      tabContents.forEach(c => c.classList.toggle('active', c.id === tabId));
      // lazy render per tab
      if (tabId === 'overviewTab') renderOverview(stateData);
      if (tabId === 'stateTab')   renderStateTable(stateData);
      if (tabId === 'compareTab') setupCompare(stateData);
    });
  });

  // ---------------------------------------------------------------------------
  // Dashboard renderers
  // ---------------------------------------------------------------------------
  let compareChartInstance = null; // keep global reference so we can destroy
  let stateData = [];

  function renderOverview(data) {
    if (!data || !data.length) return;
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;

    const totalPop       = data.reduce((s, d) => s + (+d.population || 0), 0);
    const avgYouth       = avg(data.map(d => +d.youthPercentage || 0)).toFixed(1);
    const avgSmartphone  = avg(data.map(d => +d.smartphonePenetration || 0)).toFixed(1);
    const avgHealthSpend = avg(data.map(d => +d.govtHealthSpendPerCapita || 0));

    kpiGrid.innerHTML = `
      <div class="kpi-card"><h3>Total Population</h3><div class="number-large">${formatNum(totalPop)}</div></div>
      <div class="kpi-card"><h3>Avg Youth %</h3><div class="number-large">${avgYouth}%</div></div>
      <div class="kpi-card"><h3>Avg Smartphone %</h3><div class="number-large">${avgSmartphone}%</div></div>
      <div class="kpi-card"><h3>Avg Health Spend</h3><div class="number-large">â‚¹${formatNum(avgHealthSpend)}</div></div>`;

    const barCanvas = document.getElementById('populationChart');
    if (!barCanvas) return;

    // destroy any previous bar chart stored on the canvas element
    if (barCanvas._chart) {
      barCanvas._chart.destroy();
    }

    barCanvas._chart = new Chart(barCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: data.map(d => d.state),
        datasets: [{
          label: 'Population',
          data: data.map(d => d.population),
          backgroundColor: '#1FB8CD'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderStateTable(data) {
    const table = document.getElementById('stateTable');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    thead.innerHTML = `<tr><th>State</th><th>Population</th><th>Youth %</th><th>Smartphone %</th><th>Health â‚¹</th><th>Climate Risk</th></tr>`;
    tbody.innerHTML = data.map(d => `
      <tr>
        <td>${d.state}</td>
        <td>${formatNum(d.population)}</td>
        <td>${d.youthPercentage}%</td>
        <td>${d.smartphonePenetration}%</td>
        <td>â‚¹${formatNum(d.govtHealthSpendPerCapita)}</td>
        <td>${d.climateVulnerability}/10</td>
      </tr>`).join('');
  }

  function setupCompare(data) {
    const selA = document.getElementById('compareA');
    const selB = document.getElementById('compareB');
    const radarCanvas = document.getElementById('compareChart');
    if (!selA || !selB || !radarCanvas) return;

    // populate dropdowns only once
    if (!selA.options.length) {
      selA.innerHTML = data.map(d => `<option value="${d.state}">${d.state}</option>`).join('');
      selB.innerHTML = selA.innerHTML;
      selA.selectedIndex = 0;
      selB.selectedIndex = 1;
    }

    function drawRadar() {
      const sA = data.find(d => d.state === selA.value);
      const sB = data.find(d => d.state === selB.value);
      if (!sA || !sB) return;

      const dataset = {
        labels: ['Population', 'Youth %', 'Smartphone %', 'Health â‚¹', 'Climate Resilience'],
        datasets: [
          {
            label: sA.state,
            data: [
              normalize(sA.population, 250e6),
              sA.youthPercentage,
              sA.smartphonePenetration,
              normalize(sA.govtHealthSpendPerCapita, 50000),
              (10 - sA.climateVulnerability) * 10
            ],
            backgroundColor: '#1FB8CD55',
            borderColor: '#1FB8CD',
            borderWidth: 2
          },
          {
            label: sB.state,
            data: [
              normalize(sB.population, 250e6),
              sB.youthPercentage,
              sB.smartphonePenetration,
              normalize(sB.govtHealthSpendPerCapita, 50000),
              (10 - sB.climateVulnerability) * 10
            ],
            backgroundColor: '#FFC18555',
            borderColor: '#FFC185',
            borderWidth: 2
          }
        ]
      };

      if (compareChartInstance) compareChartInstance.destroy();
      compareChartInstance = new Chart(radarCanvas.getContext('2d'), {
        type: 'radar',
        data: dataset,
        options: { responsive: true, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } }
      });
    }

    selA.addEventListener('change', drawRadar);
    selB.addEventListener('change', drawRadar);
    drawRadar(); // initial render
  }

  // ---------------------------------------------------------------------------
  // Load JSON data (tries root first, then /public/)
  // ---------------------------------------------------------------------------
  function loadData() {
    const tryPaths = ['data.json', 'public/data.json'];
    let attempt = 0;

    function attemptFetch() {
      if (attempt >= tryPaths.length) {
        showToast('âŒ Could not load data.json', 'error');
        console.error('All data.json fetch attempts failed');
        return;
      }
      const path = tryPaths[attempt];
      fetch(path)
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(json => {
          console.log('ðŸ“Š Loaded', json.length, 'records from', path);
          stateData = json;
          // Render default tab (Overview)
          renderOverview(stateData);
          renderStateTable(stateData);
          // ensure Overview tab visible on first load
          document.querySelector('.tab-btn[data-tab="overviewTab"]').click();
        })
        .catch(err => {
          console.warn('Failed to load', path, err);
          attempt += 1;
          attemptFetch();
        });
    }

    attemptFetch();
  }

  // ---------------------------------------------------------------------------
  // Kick things off
  // ---------------------------------------------------------------------------
  loadData();
});
