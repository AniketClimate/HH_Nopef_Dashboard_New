document.addEventListener('DOMContentLoaded', () => {
  console.log("âœ… DOM Ready");
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const dashboardView = document.getElementById('dashboardView');
  const cmsView = document.getElementById('cmsView');

  let stateData = [];

  /**
   * Tab Switching Logic
   */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to current
      const tabID = btn.dataset.tab;
      btn.classList.add('active');
      const content = document.getElementById(tabID);
      if (content) content.classList.add('active');
    });
  });

  /**
   * Navigation Buttons (Dashboard/CMS)
   */
  document.getElementById('navDashboard')?.addEventListener('click', () => {
    dashboardView.classList.remove('hidden');
    cmsView.classList.add('hidden');
  });
  document.getElementById('navCms')?.addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    cmsView.classList.remove('hidden');
  });

  /**
   * Load Data from public/data.json or fallback
   */
  fetch('./public/data.json')
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => {
      console.log("ðŸ“Š Data loaded:", data.length, "records");
      stateData = data;
      renderOverview(stateData);
      renderStateTable(stateData);
      setupCompare(stateData);
    })
    .catch(err => {
      console.error("âŒ Failed loading data.json", err);
      showToast("Error loading state data", "error");
    });

  /**
   * Renders Cards and Population Chart
   */
  function renderOverview(data) {
    // KPIs
    const kpiGrid = document.getElementById('kpiGrid');
    const totalPopulation = data.reduce((sum, s) => sum + (s.population || 0), 0);
    const avgYouthPct = avg(data.map(s => s.youthPercentage));
    const avgSmartphone = avg(data.map(s => s.smartphonePenetration));
    const avgHealthSpend = avg(data.map(s => s.govtHealthSpendPerCapita));

    kpiGrid.innerHTML = `
      <div class="kpi-card"><h3>Total Population</h3><div class="number-large">${formatNum(totalPopulation)}</div></div>
      <div class="kpi-card"><h3>Avg Youth %</h3><div class="number-large">${avgYouthPct.toFixed(1)}%</div></div>
      <div class="kpi-card"><h3>Avg Smartphone %</h3><div class="number-large">${avgSmartphone.toFixed(1)}%</div></div>
      <div class="kpi-card"><h3>Avg Health Spend</h3><div class="number-large">â‚¹${formatNum(avgHealthSpend)}</div></div>
    `;

    // Bar Chart - CORRECTED SYNTAX
    const ctx = document.getElementById('populationChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(s => s.state),
        datasets: [{
          label: 'Population',
          data: data.map(s => s.population),
          backgroundColor: '#1FB8CD'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  function renderStateTable(data) {
    const table = document.getElementById('stateTable');
    const head = table.querySelector('thead');
    const body = table.querySelector('tbody');

    head.innerHTML = `
      <tr>
        <th>State</th><th>Population</th><th>Youth %</th><th>Smartphone %</th><th>Health â‚¹</th><th>Climate Risk</th>
      </tr>
    `;
    body.innerHTML = data.map(s => `
      <tr>
        <td>${s.state}</td>
        <td>${formatNum(s.population)}</td>
        <td>${s.youthPercentage}%</td>
        <td>${s.smartphonePenetration}%</td>
        <td>â‚¹${formatNum(s.govtHealthSpendPerCapita)}</td>
        <td>${s.climateVulnerability}/10</td>
      </tr>
    `).join('');
  }

  function setupCompare(data) {
    const dropdownA = document.getElementById('compareA');
    const dropdownB = document.getElementById('compareB');
    const chartCtx = document.getElementById('compareChart');

    if (!dropdownA || !dropdownB || !chartCtx) return;

    let selectedA = data[0]?.state || '';
    let selectedB = data[1]?.state || '';

    dropdownA.innerHTML = data.map(s => `<option value="${s.state}">${s.state}</option>`).join('');
    dropdownB.innerHTML = data.map(s => `<option value="${s.state}">${s.state}</option>`).join('');
    dropdownA.value = selectedA;
    dropdownB.value = selectedB;

    dropdownA.addEventListener('change', () => {
      selectedA = dropdownA.value;
      drawCompareChart();
    });
    dropdownB.addEventListener('change', () => {
      selectedB = dropdownB.value;
      drawCompareChart();
    });

    function drawCompareChart() {
      const sA = data.find(d => d.state === selectedA);
      const sB = data.find(d => d.state === selectedB);
      if (!sA || !sB) return;

      const dataset = {
        labels: ['Population', 'Youth %', 'Smartphone %', 'Health Spend', 'Climate Resilience'],
        datasets: [
          { 
            label: selectedA, 
            data: [
              normalize(sA.population, 250e6),
              sA.youthPercentage,
              sA.smartphonePenetration,
              normalize(sA.govtHealthSpendPerCapita, 50000),
              (10 - sA.climateVulnerability) * 10
            ],
            backgroundColor: '#1FB8CD88', 
            borderColor: '#1FB8CD'
          },
          { 
            label: selectedB, 
            data: [
              normalize(sB.population, 250e6),
              sB.youthPercentage,
              sB.smartphonePenetration,
              normalize(sB.govtHealthSpendPerCapita, 50000),
              (10 - sB.climateVulnerability) * 10
            ],
            backgroundColor: '#FFC18588', 
            borderColor: '#FFC185' 
          }
        ]
      };

      if (window.compareChart) window.compareChart.destroy();
      window.compareChart = new Chart(chartCtx, {
        type: 'radar',
        data: dataset,
        options: {
          responsive: true,
          scales: {
            r: { suggestedMin: 0, suggestedMax: 100 }
          }
        }
      });
    }

    drawCompareChart();
  }

  function avg(arr) {
    const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n));
    return validNumbers.length > 0 ? validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length : 0;
  }

  function normalize(val, max) {
    return Math.min(100, (val / max) * 100);
  }

  function formatNum(n) {
    if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
    return n.toLocaleString();
  }

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer') || (() => {
      const c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => container.removeChild(toast), 4000);
  }
});
