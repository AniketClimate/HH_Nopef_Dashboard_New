// Halla Health Dashboard & CMS — Fixed version 2025-07-30
// ---------------------------------------------------------
// CHANGES
// 1. Removed stray bracket/brace that broke JavaScript parsing
// 2. Ensured initialStatesData closes correctly
// 3. Slight deduplication of Maharashtra entry with zeroes
// 4. No other functional changes so existing behaviour is preserved

//--------------------------------------------------------------------
// SECTION 1: LOGIN HANDLER (unchanged)
//--------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const loginForm  = document.getElementById('loginForm');
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();                        // stop full-page refresh
      const u = usernameEl.value.trim();
      const p = passwordEl.value.trim();

      // very simple client-side check – replace with real auth if needed
      const CREDS = { admin: 'admin123', editor: 'edit123', datamanager: 'data123' };
      if (CREDS[u] === p) {
        sessionStorage.setItem('hh_logged_in_as', u);
        // hide login screen, reveal the CMS dashboard section
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminSection').classList.remove('hidden');
      } else {
        alert('Invalid credentials');
      }
    });
  }
});

//--------------------------------------------------------------------
// SECTION 2: MAIN DASHBOARD & CMS LOGIC
//--------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  // ------------------- SAMPLE DATA (edit as needed) -------------------
  const initialStatesData = [
    { "state": "Delhi", "population": 19800000, "youthPercentage": 32, "smartphonePenetration": 75, "govtHealthSpendPerCapita": 46200, "climateVulnerability": 3.1 },
    { "state": "Maharashtra", "population": 124000000, "youthPercentage": 29, "smartphonePenetration": 68, "govtHealthSpendPerCapita": 23800, "climateVulnerability": 6.4 },
    { "state": "Uttar Pradesh", "population": 241000000, "youthPercentage": 33, "smartphonePenetration": 45, "govtHealthSpendPerCapita": 14500, "climateVulnerability": 7.9 },

    { "state":"Andhra Pradesh",    "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Arunachal Pradesh", "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Assam",             "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Bihar",             "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Chhattisgarh",      "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Goa",               "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Gujarat",           "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Haryana",           "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Himachal Pradesh",  "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Jharkhand",         "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Karnataka",         "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Kerala",            "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Madhya Pradesh",    "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Manipur",           "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Meghalaya",         "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Mizoram",           "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Nagaland",          "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Odisha",            "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Punjab",            "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Rajasthan",         "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Sikkim",            "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Tamil Nadu",        "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Telangana",         "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Tripura",           "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Uttarakhand",       "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"West Bengal",       "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },

    // Union Territories
    { "state":"Andaman & Nicobar", "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Chandigarh",        "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Dadra & Nagar Haveli and Daman & Diu", "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Delhi (NCT)",       "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Jammu & Kashmir",   "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Ladakh",            "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Lakshadweep",       "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 },
    { "state":"Puducherry",        "population":0, "youthPercentage":0, "smartphonePenetration":0, "govtHealthSpendPerCapita":0, "climateVulnerability":0 }
  ];
  // --------------------- END SAMPLE DATA ----------------------------

  const strategicInsights = { "insights": "<p>Phase 1 focus on Delhi & Maharashtra owing to high digital readiness…</p>" };
  const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

  // Application state & other vars
  let currentStatesData = [];
  let currentView = 'dashboard';
  let isLoggedIn = false;
  let charts = {};
  let pollingInterval = null;

  const validCredentials = { username: 'admin', password: 'admin123' };

  // -------------------- INITIALISATION ------------------------------
  init();

  /* ----------------- FUNCTION DEFINITIONS BELOW ------------------ */

  function init() {
    console.log('Initializing Halla Health Dashboard...');
    loadData();
    setupEventListeners();
    showView('dashboard'); // default view
    startPolling();
    showToast('Welcome to Halla Health Dashboard', 'info');
  }

  // ------------------- DATA MANAGEMENT ---------------------------
  function loadData() {
    currentStatesData = [...initialStatesData];
    const overrides = localStorage.getItem('hh_state_data_override');
    if (overrides) {
      try {
        const overrideData = JSON.parse(overrides);
        currentStatesData = mergeOverrides(currentStatesData, overrideData);
        console.log('Applied localStorage overrides');
      } catch (err) {
        console.error('override parse error', err);
      }
    }
  }

  function mergeOverrides(baseData, overrides) {
    if (!Array.isArray(overrides)) return baseData;
    return baseData.map(b => {
      const o = overrides.find(x => x.state === b.state);
      return o ? { ...b, ...o } : b;
    });
  }

  function saveOverrides() {
    try {
      localStorage.setItem('hh_state_data_override', JSON.stringify(currentStatesData));
      showToast('Data saved locally', 'success');
    } catch (err) {
      console.error('save error', err);
    }
  }

  // -------------------- EVENT LISTENERS ---------------------------
  function setupEventListeners() {
    // Nav
    const navDashboard = document.getElementById('navDashboard');
    const navCms       = document.getElementById('navCms');
    navDashboard && navDashboard.addEventListener('click', e => { e.preventDefault(); showView('dashboard'); });
    navCms && navCms.addEventListener('click', e => { e.preventDefault(); showView('cms'); });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const tabName = btn.dataset.tab;
        switchTab(tabName);
        updateActiveTab(btn);
      });
    });

    // Compare selects
    const compareA = document.getElementById('compareA');
    const compareB = document.getElementById('compareB');
    compareA && compareA.addEventListener('change', updateCompareChart);
    compareB && compareB.addEventListener('change', updateCompareChart);

    // CMS login handled earlier in first DOMContentLoaded

    // Export / Import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');
    exportBtn && exportBtn.addEventListener('click', exportData);
    importBtn && importBtn.addEventListener('click', () => fileInput && fileInput.click());
    fileInput && fileInput.addEventListener('change', handleImport);

    // Keyboard nav
    document.addEventListener('keydown', handleKeyDown);
  }

  // -------------------- VIEW MANAGEMENT --------------------------
  function showView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const targetView = document.getElementById(viewName + 'View');
    targetView && targetView.classList.remove('hidden');
    updateActiveNav(viewName);
    if (viewName === 'dashboard') loadDashboard();
    else if (viewName === 'cms')   loadCMS();
  }

  function updateActiveNav(active) {
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav' + capitalize(active));
    btn && btn.classList.add('active');
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tgt = document.getElementById(tab);
    tgt && tgt.classList.add('active');
    if (tab === 'overviewTab')      { renderKPIs(); renderPopulationChart(); }
    else if (tab === 'stateTab')    { renderStateTable(); }
    else if (tab === 'compareTab')  { populateCompareDropdowns(); updateCompareChart(); }
  }

  function updateActiveTab(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
  }

  // -------------------- DASHBOARD RENDERERS ----------------------
  function loadDashboard() {
    switchTab('overviewTab');
    const first = document.querySelector('.tab-btn[data-tab="overviewTab"]');
    first && updateActiveTab(first);
  }

  function renderKPIs() {
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;
    const totalPop = currentStatesData.reduce((s,x)=>s+x.population,0);
    const avgYouth = currentStatesData.reduce((s,x)=>s+x.youthPercentage,0)/currentStatesData.length;
    const avgSmart= currentStatesData.reduce((s,x)=>s+x.smartphonePenetration,0)/currentStatesData.length;
    const avgSpend= currentStatesData.reduce((s,x)=>s+x.govtHealthSpendPerCapita,0)/currentStatesData.length;

    const kpis=[
      {label:'Total Population', value:formatNumber(totalPop), change:'+2.1%'},
      {label:'Avg Youth %',      value:avgYouth.toFixed(1)+'%', change:'+0.8%'},
      {label:'Avg Smartphone %', value:avgSmart.toFixed(1)+'%', change:'+5.2%'},
      {label:'Avg Health Spend', value:'₹'+formatNumber(avgSpend), change:'+12.3%'}
    ];

    kpiGrid.innerHTML = kpis.map(k=>`<div class="kpi-card"><h3 class="kpi-label">${k.label}</h3><div class="kpi-value number-large">${k.value}</div><div class="kpi-change positive">${k.change}</div></div>`).join('');
  }

  function renderPopulationChart() {
    const canvas = document.getElementById('populationChart');
    if (!canvas) return;
    charts.population && charts.population.destroy();
    charts.population = new Chart(canvas.getContext('2d'), {
      type:'bar',
      data:{ labels: currentStatesData.map(x=>x.state), datasets:[{label:'Population', data:currentStatesData.map(x=>x.population), backgroundColor:chartColors[0]}] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{callback:v=>formatNumber(v)}}}}
    });
  }

  function renderStateTable() {
    const table = document.getElementById('stateTable');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = `<tr><th>State</th><th>Population</th><th>Youth %</th><th>Smartphone %</th><th>Health Spend</th><th>Climate Risk</th></tr>`;
    tbody.innerHTML = currentStatesData.map(s=>`<tr><td><strong>${s.state}</strong></td><td class="number-large">${formatNumber(s.population)}</td><td class="percentage">${s.youthPercentage}%</td><td class="percentage">${s.smartphonePenetration}%</td><td class="number-large">₹${formatNumber(s.govtHealthSpendPerCapita)}</td><td>${s.climateVulnerability}/10</td></tr>`).join('');
  }

  function populateCompareDropdowns() {
    const a=document.getElementById('compareA');
    const b=document.getElementById('compareB');
    if(!a||!b) return;
    const opts=currentStatesData.map(s=>`<option value="${s.state}">${s.state}</option>`).join('');
    a.innerHTML='<option value="">Select State A</option>'+opts;
    b.innerHTML='<option value="">Select State B</option>'+opts;
    if(currentStatesData.length>=2){a.value=currentStatesData[0].state;b.value=currentStatesData[1].state;}
  }

  function updateCompareChart() {
    const a=document.getElementById('compareA').value;
    const b=document.getElementById('compareB').value;
    const canvas=document.getElementById('compareChart');
    if(!a||!b||!canvas) return;
    const A=currentStatesData.find(x=>x.state===a);
    const B=currentStatesData.find(x=>x.state===b);
    if(!A||!B) return;
    const normPop = p=>Math.min(100,(p/250000000)*100);
    const normSpend = s=>Math.min(100,(s/50000)*100);
    const normRisk = r=>(10-r)*10;
    const dataA=[normPop(A.population),A.youthPercentage,A.smartphonePenetration,normSpend(A.govtHealthSpendPerCapita),normRisk(A.climateVulnerability)];
    const dataB=[normPop(B.population),B.youthPercentage,B.smartphonePenetration,normSpend(B.govtHealthSpendPerCapita),normRisk(B.climateVulnerability)];
    charts.compare && charts.compare.destroy();
    charts.compare=new Chart(canvas.getContext('2d'),{type:'radar',data:{labels:['Population','Youth %','Smartphone %','Health Spend','Climate Resilience'],datasets:[{label:A.state,data:dataA,backgroundColor:chartColors[0]+'33',borderColor:chartColors[0]},{label:B.state,data:dataB,backgroundColor:chartColors[1]+'33',borderColor:chartColors[1]}]},options:{responsive:true,maintainAspectRatio:false,scales:{r:{beginAtZero:true,max:100,ticks:{stepSize:20}}}}});
  }

  //---------------------- CMS RENDERERS -----------------------------
  function loadCMS() {
    const logged = sessionStorage.getItem('hh_logged_in_as');
    if (logged) {
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('adminSection').classList.remove('hidden');
      renderCMSTable();
    } else {
      document.getElementById('loginSection').classList.remove('hidden');
      document.getElementById('adminSection').classList.add('hidden');
    }
  }

  function renderCMSTable() {
    const table=document.getElementById('cmsStateTable');
    if(!table) return;
    const thead=table.querySelector('thead');
    const tbody=table.querySelector('tbody');
    thead.innerHTML='<tr><th>State</th><th>Population</th><th>Youth %</th><th>Smartphone %</th><th>Health Spend</th><th>Climate Risk</th></tr>';
    tbody.innerHTML=currentStatesData.map((s,i)=>`<tr><td><strong>${s.state}</strong></td><td><input type="number" value="${s.population}" data-field="population" data-index="${i}"></td><td><input type="number" value="${s.youthPercentage}" data-field="youthPercentage" data-index="${i}" step="0.1" min="0" max="100"></td><td><input type="number" value="${s.smartphonePenetration}" data-field="smartphonePenetration" data-index="${i}" step="0.1" min="0" max="100"></td><td><input type="number" value="${s.govtHealthSpendPerCapita}" data-field="govtHealthSpendPerCapita" data-index="${i}"></td><td><input type="number" value="${s.climateVulnerability}" data-field="climateVulnerability" data-index="${i}" step="0.1" min="0" max="10"></td></tr>`).join('');
    tbody.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',handleCellEdit));
  }

  function handleCellEdit(e) {
    const field=e.target.dataset.field;
    const idx=parseInt(e.target.dataset.index,10);
    const val=parseFloat(e.target.value)||0;
    if(idx>=0 && idx<currentStatesData.length){currentStatesData[idx][field]=val; saveOverrides(); showToast('Updated '+field+' for '+currentStatesData[idx].state,'success');}
  }

  //---------------------- EXPORT / IMPORT ---------------------------
  function exportData() {
    const blob=new Blob([JSON.stringify({states:currentStatesData,insights:strategicInsights},null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='halla_health_export_'+new Date().toISOString().split('T')[0]+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  }

  function handleImport(e) {
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=ev=>{try{const d=JSON.parse(ev.target.result); if(d.states){currentStatesData=d.states; saveOverrides(); renderStateTable(); renderCMSTable(); populateCompareDropdowns(); updateCompareChart(); showToast('Import successful','success');}}
    catch(err){showToast('Invalid JSON','error');}};
    reader.readAsText(f);
    e.target.value='';
  }

  //--------------------- POLLING ------------------------------------
  function startPolling(){pollingInterval=setInterval(()=>{const o=localStorage.getItem('hh_state_data_override');if(o){try{const d=JSON.parse(o);if(JSON.stringify(d)!==JSON.stringify(currentStatesData)){currentStatesData=d;renderStateTable();updateCompareChart();showToast('Data auto-updated','info');}}catch(err){}}},30000);}

  //--------------------- UTILITIES ----------------------------------
  function handleKeyDown(e){if(e.altKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();const tabs=[...document.querySelectorAll('.tab-btn')];const currentIdx=tabs.findIndex(b=>b.classList.contains('active'));let newIdx=e.key==='ArrowLeft'?currentIdx-1:currentIdx+1;if(newIdx<0)newIdx=tabs.length-1;if(newIdx>=tabs.length)newIdx=0;tabs[newIdx].click();}}
  function formatNumber(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n.toLocaleString();}
  function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}  
  function showToast(msg,type='info'){let c=document.getElementById('toastContainer'); if(!c){c=document.createElement('div'); c.id='toastContainer'; c.className='toast-container'; document.body.appendChild(c);} const t=document.createElement('div'); t.className='toast '+type; t.textContent=msg; c.appendChild(t); setTimeout(()=>{t.remove();},4000);}  

  window.addEventListener('beforeunload',()=>{Object.values(charts).forEach(ch=>ch&&ch.destroy()); pollingInterval&&clearInterval(pollingInterval);});
});
