// # Fixed app.js for Halla Health Dashboard & CMS

// Copy the entire JavaScript code below into `app.js` (replace the previous file). It fixes:

// 1. Fetches live state data from `data.json` at runtime (remove hard-coded sample list)
// 2. Maps data-file field names â†’ dashboard field names automatically
// 3. Renders dashboard only after data have loaded
// 4. Keeps local-storage overrides and CMS editing intact
// 5. Restores tab switching (single listener, no duplicates)

```javascript
// Halla Health Dashboard & CMS â€” FIXED 2025-07-30
// =========================================================
// Changes vs broken version
// 1. loadData() now fetches data.json asynchronously
// 2. Added mapJsonToState() to translate dataset fields
// 3. init() waits for data before rendering UI
// 4. Consolidated tab event-listener to avoid duplicate handlers
// ---------------------------------------------------------

// SECTION 1: SIMPLE LOGIN (unchanged)
document.addEventListener('DOMContentLoaded', () => {
  const loginForm  = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const CREDS = { admin: 'admin123', editor: 'edit123', datamanager: 'data123' };
    if (CREDS[u] === p) {
      sessionStorage.setItem('hh_logged_in_as', u);
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('adminSection').classList.remove('hidden');
      renderCMSTable();
    } else {
      alert('Invalid credentials');
    }
  });
});

// SECTION 2: DASHBOARD + CMS
//--------------------------------------------

const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
let currentStatesData = [];
let charts = {};
let currentView = 'dashboard';
let pollingInterval;

// Map remote JSON â†’ dashboard schema
function mapJsonToState(obj){
  return {
    state:                        obj.name || obj.state,
    population:                  obj.population_current || obj.population || 0,
    youthPercentage:             obj.youth_percentage   ?? obj.youthPercentage ?? 0,
    smartphonePenetration:       obj.smartphone_penetration ?? obj.smartphonePenetration ?? 0,
    govtHealthSpendPerCapita:    obj.government_health_spending ?? obj.govtHealthSpendPerCapita ?? 0,
    climateVulnerability:        obj.climate_vulnerability_score ?? obj.climateVulnerability ?? 0
  };
}

// ---------- INITIALISATION ----------
window.addEventListener('DOMContentLoaded', init);

async function init(){
  await loadData();              // wait for fetch
  setupEventListeners();         // nav + tabs etc.
  showView('dashboard');
  startPolling();
}

// ---------- DATA MANAGEMENT ----------
async function loadData(){
  try{
    const res = await fetch('./data.json');   // place data.json beside index.html
    if(!res.ok) throw new Error('HTTP '+res.status);
    const raw = await res.json();
    currentStatesData = Array.isArray(raw) ? raw.map(mapJsonToState) : [];
    // localStorage overrides keep working
    const overrides = localStorage.getItem('hh_state_data_override');
    if (overrides){
      const ov = JSON.parse(overrides);
      currentStatesData = mergeOverrides(currentStatesData, ov);
    }
  }catch(err){
    console.error('data load error:', err);
    currentStatesData = [];
  }
}

function mergeOverrides(base, over){
  return base.map(b => {
    const o = over.find(x=>x.state===b.state);
    return o ? { ...b, ...o } : b;
  });
}
function saveOverrides(){
  localStorage.setItem('hh_state_data_override', JSON.stringify(currentStatesData));
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners(){
  // nav
  document.getElementById('navDashboard').addEventListener('click',e=>{e.preventDefault();showView('dashboard');});
  document.getElementById('navCms').addEventListener('click',e=>{e.preventDefault();showView('cms');});
  // tabs (delegate)
  document.querySelector('.dashboard-tabs').addEventListener('click',e=>{
    if(e.target.classList.contains('tab-btn')){
      switchTab(e.target.dataset.tab);
      updateActiveTab(e.target);
    }
  });
  // compare selects
  ['compareA','compareB'].forEach(id=>{
    const el=document.getElementById(id);
    el && el.addEventListener('change',updateCompareChart);
  });
  // export / import
  document.getElementById('exportBtn').addEventListener('click',exportData);
  document.getElementById('importBtn').addEventListener('click',()=>document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change',handleImport);
}

// ---------- VIEW MANAGEMENT ----------
function showView(v){
  currentView=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.add('hidden'));
  document.getElementById(v+'View').classList.remove('hidden');
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active', b.id==='nav'+capitalize(v)));
  v==='dashboard'?loadDashboard():loadCMS();
}

function switchTab(t){
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.toggle('active',c.id===t));
  if(t==='overviewTab'){renderKPIs();renderPopulationChart();}
  if(t==='stateTab'){renderStateTable();}
  if(t==='compareTab'){populateCompareDropdowns();updateCompareChart();}
}
function updateActiveTab(b){
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
}

// ---------- DASHBOARD RENDER ----------
function loadDashboard(){
  switchTab('overviewTab');
}
function renderKPIs(){
  const grid=document.getElementById('kpiGrid');
  if(!grid||!currentStatesData.length) return;
  const tp=currentStatesData.reduce((s,x)=>s+x.population,0);
  const ay=currentStatesData.reduce((s,x)=>s+x.youthPercentage,0)/currentStatesData.length;
  const as=currentStatesData.reduce((s,x)=>s+x.smartphonePenetration,0)/currentStatesData.length;
  const ah=currentStatesData.reduce((s,x)=>s+x.govtHealthSpendPerCapita,0)/currentStatesData.length;
  const rows=[
    {l:'Total Population',v:formatNumber(tp)},
    {l:'Avg Youth %',v:ay.toFixed(1)+'%'},
    {l:'Avg Smartphone %',v:as.toFixed(1)+'%'},
    {l:'Avg Health Spend',v:'â‚¹'+formatNumber(ah)}];
  grid.innerHTML=rows.map(r=>`<div class="kpi-card"><h3>${r.l}</h3><div class="number-large">${r.v}</div></div>`).join('');
}
function renderPopulationChart(){
  const c=document.getElementById('populationChart'); if(!c) return;
  charts.population && charts.population.destroy();
  charts.population=new Chart(c,{type:'bar',data:{labels:currentStatesData.map(s=>s.state),datasets:[{data:currentStatesData.map(s=>s.population),backgroundColor:chartColors[0]}]},options:{responsive:true,plugins:{legend:{display:false}}}});
}
function renderStateTable(){
  const tbody=document.querySelector('#stateTable tbody'); if(!tbody) return;
  tbody.innerHTML=currentStatesData.map(s=>`<tr><td>${s.state}</td><td>${formatNumber(s.population)}</td><td>${s.youthPercentage}%</td><td>${s.smartphonePenetration}%</td><td>â‚¹${formatNumber(s.govtHealthSpendPerCapita)}</td><td>${s.climateVulnerability}</td></tr>`).join('');
}
function populateCompareDropdowns(){
  const opts=currentStatesData.map(s=>`<option>${s.state}</option>`).join('');
  ['compareA','compareB'].forEach(id=>{const el=document.getElementById(id); if(el){el.innerHTML='<option value="">Select</option>'+opts;}});
}
function updateCompareChart(){
  const a=document.getElementById('compareA').value; const b=document.getElementById('compareB').value; if(!a||!b) return;
  const A=currentStatesData.find(s=>s.state===a); const B=currentStatesData.find(s=>s.state===b);
  const ctx=document.getElementById('compareChart'); if(!ctx) return;
  charts.compare && charts.compare.destroy();
  const normPop=x=>Math.min(100,x/250000000*100);
  const normSpend=x=>Math.min(100,x/50000*100);
  const normRisk=x=>(10-x)*10;
  charts.compare=new Chart(ctx,{type:'radar',data:{labels:['Population','Youth %','Smartphone %','Health Spend','Climate Resilience'],datasets:[{label:A.state,data:[normPop(A.population),A.youthPercentage,A.smartphonePenetration,normSpend(A.govtHealthSpendPerCapita),normRisk(A.climateVulnerability)],backgroundColor:chartColors[0]+'33',borderColor:chartColors[0]},{label:B.state,data:[normPop(B.population),B.youthPercentage,B.smartphonePenetration,normSpend(B.govtHealthSpendPerCapita),normRisk(B.climateVulnerability)],backgroundColor:chartColors[1]+'33',borderColor:chartColors[1]}]},options:{responsive:true,scales:{r:{beginAtZero:true,max:100}}});
}

// ---------- CMS RENDER ----------
function loadCMS(){
  const logged=sessionStorage.getItem('hh_logged_in_as');
  if(logged) {renderCMSTable();document.getElementById('loginSection').classList.add('hidden');document.getElementById('adminSection').classList.remove('hidden');}
}
function renderCMSTable(){
  const tbody=document.querySelector('#cmsStateTable tbody'); if(!tbody) return;
  tbody.innerHTML=currentStatesData.map((s,i)=>`<tr><td>${s.state}</td><td><input type="number" value="${s.population}" data-i="${i}" data-f="population"></td><td><input type="number" value="${s.youthPercentage}" data-i="${i}" data-f="youthPercentage" step="0.1" max="100"></td><td><input type="number" value="${s.smartphonePenetration}" data-i="${i}" data-f="smartphonePenetration" step="0.1" max="100"></td><td><input type="number" value="${s.govtHealthSpendPerCapita}" data-i="${i}" data-f="govtHealthSpendPerCapita"></td><td><input type="number" value="${s.climateVulnerability}" data-i="${i}" data-f="climateVulnerability" step="0.1" max="10"></td></tr>`).join('');
  tbody.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',onCmsEdit));
}
function onCmsEdit(e){
  const i=+e.target.dataset.i; const f=e.target.dataset.f; const v=parseFloat(e.target.value)||0;
  currentStatesData[i][f]=v; saveOverrides();
  if(currentView==='dashboard') renderPopulationChart();
}
function exportData(){
  const blob=new Blob([JSON.stringify(currentStatesData,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='halla_health_states_'+Date.now()+'.json'; a.click();
}
function handleImport(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader(); reader.onload=evt=>{try{const arr=JSON.parse(evt.target.result); if(Array.isArray(arr)){currentStatesData=arr; saveOverrides(); renderCMSTable(); renderPopulationChart();}}
  catch(err){alert('Invalid JSON');}}; reader.readAsText(file);}

// ---------- MISC ----------
function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}function formatNumber(n){return n.toLocaleString('en-IN');}
function startPolling(){pollingInterval=setInterval(()=>{const ov=localStorage.getItem('hh_state_data_override');if(ov){const arr=JSON.parse(ov); if(JSON.stringify(arr)!==JSON.stringify(currentStatesData)){currentStatesData=arr; if(currentView==='dashboard') renderPopulationChart(); if(currentView==='cms') renderCMSTable();}}},30000);}
window.addEventListener('beforeunload',()=>{Object.values(charts).forEach(c=>c&&c.destroy());clearInterval(pollingInterval);});

// =================== END =====================
```
