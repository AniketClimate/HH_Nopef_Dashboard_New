// Halla Health Dashboard - Corrected Version
// Fixed: null element click error and improved data loading

document.addEventListener('DOMContentLoaded', () => {
  console.log('âœ… Halla Health dashboard script loaded');

  // Global variables
  let stateData = [];
  let compareChartInstance = null;

  // Utility functions
  const avg = arr => arr.length ? arr.reduce((s, v) => s + (+v || 0), 0) / arr.length : 0;
  const normalize = (val, max) => max ? Math.min(100, (val / max) * 100) : 0;
  const formatNum = n => {
    if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
    return (+n || 0).toLocaleString();
  };

  // Toast notification helper
  const showToast = (msg, type = 'info') => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        display: flex; flex-direction: column; gap: 10px;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      padding: 12px 16px; border-radius: 4px; color: white; font-size: 14px;
      background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
    `;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  };

  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchToTab(targetTabId) {
    // Update button states
    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === targetTabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update content visibility
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === targetTabId);
    });

    // Render content based on tab
    if (stateData.length > 0) {
      switch(targetTabId) {
        case 'overviewTab':
          renderOverview(stateData);
          break;
        case 'stateTab':
          renderStateTable(stateData);
          break;
        case 'compareTab':
          setupCompare(stateData);
          break;
      }
    }
  }

  // Bind tab click events
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab;
      if (tabId) {
        switchToTab(tabId);
      }
    });
  });

  // Navigation between Dashboard and CMS
  const navDashboard = document.getElementById('navDashboard');
  const navCms = document.getElementById('navCms');
  const dashboardView = document.getElementById('dashboardView');
  const cmsView = document.getElementById('cmsView');

  if (navDashboard) {
    navDashboard.addEventListener('click', (e) => {
      e.preventDefault();
      if (dashboardView) dashboardView.classList.remove('hidden');
      if (cmsView) cmsView.classList.add('hidden');
      navDashboard.classList.add('active');
      if (navCms) navCms.classList.remove('active');
    });
  }

  if (navCms) {
    navCms.addEventListener('click', (e) => {
      e.preventDefault();
      if (dashboardView) dashboardView.classList.add('hidden');
      if (cmsView) cmsView.classList.remove('hidden');
      navCms.classList.add('active');
      if (navDashboard) navDashboard.classList.remove('active');
    });
  }

  // Render functions
  function renderOverview(data) {
    if (!data || !data.length) return;

    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;

    const totalPop = data.reduce((s, d) => s + (+d.population || 0), 0);
    const avgYouth = avg(data.map(d => +d.youthPercentage || 0)).toFixed(1);
    const avgSmartphone = avg(data.map(d => +d.smartphonePenetration || 0)).toFixed(1);
    const avgHealthSpend = avg(data.map(d => +d.govtHealthSpendPerCapita || 0));

    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <h3>Total Population</h3>
        <div class="number-large">${formatNum(totalPop)}</div>
      </div>
      <div class="kpi-card">
        <h3>Avg Youth %</h3>
        <div class="number-large">${avgYouth}%</div>
      </div>
      <div class="kpi-card">
        <h3>Avg Smartphone %</h3>
        <div class="number-large">${avgSmartphone}%</div>
      </div>
      <div class="kpi-card">
        <h3>Avg Health Spend</h3>
        <div class="number-large">â‚¹${formatNum(avgHealthSpend)}</div>
      </div>
    `;

    // Render population chart
    const chartCanvas = document.getElementById('populationChart');
    if (!chartCanvas) return;

    // Destroy existing chart if it exists
    if (chartCanvas.chart) {
      chartCanvas.chart.destroy();
    }

    try {
      chartCanvas.chart = new Chart(chartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: data.map(d => d.state),
          datasets: [{
            label: 'Population',
            data: data.map(d => +d.population || 0),
            backgroundColor: '#1FB8CD',
            borderColor: '#1FB8CD',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return formatNum(value);
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating population chart:', error);
    }
  }

  function renderStateTable(data) {
    if (!data || !data.length) return;

    const table = document.getElementById('stateTable');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    thead.innerHTML = `
      <tr>
        <th>State</th>
        <th>Population</th>
        <th>Youth %</th>
        <th>Smartphone %</th>
        <th>Health Spend</th>
        <th>Climate Risk</th>
      </tr>
    `;

    tbody.innerHTML = data.map(d => `
      <tr>
        <td><strong>${d.state || 'Unknown'}</strong></td>
        <td>${formatNum(d.population || 0)}</td>
        <td>${d.youthPercentage || 0}%</td>
        <td>${d.smartphonePenetration || 0}%</td>
        <td>â‚¹${formatNum(d.govtHealthSpendPerCapita || 0)}</td>
        <td>${d.climateVulnerability || 0}/10</td>
      </tr>
    `).join('');
  }

  function setupCompare(data) {
    if (!data || !data.length) return;

    const selectA = document.getElementById('compareA');
    const selectB = document.getElementById('compareB');
    const chartCanvas = document.getElementById('compareChart');

    if (!selectA || !selectB || !chartCanvas) return;

    // Populate dropdowns only if empty
    if (selectA.options.length === 0) {
      selectA.innerHTML = data.map(d => 
        `<option value="${d.state}">${d.state}</option>`
      ).join('');
      selectB.innerHTML = selectA.innerHTML;

      // Set default selections
      if (data.length >= 2) {
        selectA.selectedIndex = 0;
        selectB.selectedIndex = 1;
      }
    }

    function drawCompareChart() {
      const stateA = data.find(d => d.state === selectA.value);
      const stateB = data.find(d => d.state === selectB.value);

      if (!stateA || !stateB) return;

      const datasetA = [
        normalize(stateA.population, 250e6),
        stateA.youthPercentage || 0,
        stateA.smartphonePenetration || 0,
        normalize(stateA.govtHealthSpendPerCapita, 50000),
        ((10 - (stateA.climateVulnerability || 0)) * 10)
      ];

      const datasetB = [
        normalize(stateB.population, 250e6),
        stateB.youthPercentage || 0,
        stateB.smartphonePenetration || 0,
        normalize(stateB.govtHealthSpendPerCapita, 50000),
        ((10 - (stateB.climateVulnerability || 0)) * 10)
      ];

      // Destroy existing chart
      if (compareChartInstance) {
        compareChartInstance.destroy();
      }

      try {
        compareChartInstance = new Chart(chartCanvas.getContext('2d'), {
          type: 'radar',
          data: {
            labels: ['Population', 'Youth %', 'Smartphone %', 'Health Spend', 'Climate Resilience'],
            datasets: [
              {
                label: stateA.state,
                data: datasetA,
                backgroundColor: '#1FB8CD33',
                borderColor: '#1FB8CD',
                borderWidth: 2
              },
              {
                label: stateB.state,
                data: datasetB,
                backgroundColor: '#FFC18533',
                borderColor: '#FFC185',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                  stepSize: 25
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating compare chart:', error);
      }
    }

    // Bind change events
    selectA.addEventListener('change', drawCompareChart);
    selectB.addEventListener('change', drawCompareChart);

    // Initial draw
    drawCompareChart();
  }

  // Data loading function with multiple path attempts
  function loadData() {
    const possiblePaths = ['data.json', 'public/data.json', './data.json', './public/data.json'];
    let currentPath = 0;

    function tryNextPath() {
      if (currentPath >= possiblePaths.length) {
        console.error('âŒ All data.json fetch attempts failed');
        showToast('Could not load state data from any location', 'error');

        // Use fallback data for demo
        const fallbackData = [
          {
            state: "Delhi",
            population: 32000000,
            youthPercentage: 28.5,
            smartphonePenetration: 78.2,
            govtHealthSpendPerCapita: 46200,
            climateVulnerability: 7.8
          },
          {
            state: "Maharashtra", 
            population: 125000000,
            youthPercentage: 31.2,
            smartphonePenetration: 69.4,
            govtHealthSpendPerCapita: 23800,
            climateVulnerability: 6.2
          }
        ];

        console.log('ðŸ“Š Using fallback data with', fallbackData.length, 'records');
        stateData = fallbackData;
        initializeInterface();
        return;
      }

      const path = possiblePaths[currentPath];
      console.log(`ðŸ” Attempting to load from: ${path}`);

      fetch(path)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('ðŸ“Š Loaded', data.length, 'records from', path);
          stateData = data;
          initializeInterface();
        })
        .catch(error => {
          console.warn(`Failed to load from ${path}:`, error.message);
          currentPath++;
          tryNextPath();
        });
    }

    tryNextPath();
  }

  // Initialize interface after data is loaded
  function initializeInterface() {
    // Ensure we have data
    if (!stateData || stateData.length === 0) {
      console.warn('No state data available');
      return;
    }

    // Activate the overview tab by default (safely)
    const overviewTabBtn = document.querySelector('.tab-btn[data-tab="overviewTab"]');
    if (overviewTabBtn) {
      switchToTab('overviewTab');
    } else {
      // Fallback: just render overview content
      renderOverview(stateData);
      renderStateTable(stateData);
      setupCompare(stateData);
    }

    showToast(`Dashboard loaded with ${stateData.length} states`, 'success');
  }

  // CMS Login functionality (basic implementation)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username')?.value;
      const password = document.getElementById('password')?.value;

      // Simple credential check (in production, use proper authentication)
      if (username === 'admin' && password === 'admin123') {
        const loginSection = document.getElementById('loginSection');
        const adminSection = document.getElementById('adminSection');

        if (loginSection) loginSection.classList.add('hidden');
        if (adminSection) adminSection.classList.remove('hidden');

        showToast('Login successful!', 'success');
      } else {
        showToast('Invalid credentials. Try admin/admin123', 'error');
      }
    });
  }

  // Start the application
  loadData();
});
