/* MonConP - Lógica del dashboard. Los datos vienen de data.js (window.convenios). */
const convenios = window.convenios;

const ESTADO_LABEL = { exec:"En ejecución", vig:"Vigente", fin:"Finalizado", tram:"En trámite" };
const ESTADO_COLOR = { exec:"#00AFFF", vig:"#26A65B", fin:"#5A6A7A", tram:"#E8A600" };
const fmtMoney = n => !n ? "—" : "$" + n.toLocaleString("es-EC");
const fmtDate  = s => !s ? "Por definir" : new Date(s+"T00:00:00").toLocaleDateString("es-EC", {day:"2-digit", month:"short", year:"numeric"});

const titles = { powerbi:"📈 Reporte Power BI", dashboard:"📊 Dashboard", timeline:"📅 Línea de Tiempo", table:"📋 Tabla de Convenios", charts:"📈 Gráficos", calendar:"🗓️ Calendario", map:"🗺️ Mapa" };
const inited = { charts:false, map:false, dashChart:false };
let leafletMap = null;

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const v = item.dataset.view;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
        document.getElementById(v === 'map' ? 'map-view' : v).classList.add('active');
        document.getElementById('viewTitle').textContent = titles[v];
        if (v === 'dashboard' && !inited.dashChart) { buildDashChart(); inited.dashChart = true; }
        if (v === 'charts' && !inited.charts) { buildCharts(); inited.charts = true; }
        if (v === 'map') { if (!inited.map) { buildMap(); inited.map = true; } setTimeout(() => leafletMap && leafletMap.invalidateSize(), 200); }
    });
});

function countBy(st) { return convenios.filter(c => c.estado === st).length; }
function refreshStats() {
    const total = convenios.length, exec = countBy('exec'), vig = countBy('vig'), tram = countBy('tram'), fin = countBy('fin');
    stTotal.textContent = total; stExec.textContent = exec; stVig.textContent = vig; stTram.textContent = tram; stFin.textContent = fin;
    kTotal.textContent = total; kExec.textContent = exec; kVig.textContent = vig; kTram.textContent = tram;
    cgExec.textContent = exec; cgVig.textContent = vig; cgTram.textContent = tram; cgFin.textContent = fin;
}

function buildAlerts() {
    const box = document.getElementById('alertsBox'); const today = new Date(); const items = [];
    convenios.forEach(c => {
        if (!c.fin) return;
        const days = Math.round((new Date(c.fin+"T00:00:00") - today) / 86400000);
        if (days < 0) return;
        if (days <= 180) items.push({ cls:'crit', ico:'⏰', txt:`<b>#${c.num} ${c.entidad}</b> vence en ${days} días (${fmtDate(c.fin)}).` });
        else if (c.estado === 'exec' && c.ejec !== null && c.ejec < 30) items.push({ cls:'warn', ico:'⚠️', txt:`<b>#${c.num} ${c.entidad}</b> con baja ejecución (${c.ejec}%).` });
    });
    const tram = countBy('tram');
    if (tram) items.push({ cls:'info', ico:'📝', txt:`<b>${tram} convenios</b> en trámite o por suscribir.` });
    if (!items.length) items.push({ cls:'info', ico:'✅', txt:'Sin alertas de vencimiento próximas.' });
    box.innerHTML = items.map(a => `<div class="alert ${a.cls}"><span class="ico">${a.ico}</span><div>${a.txt}</div></div>`).join('');
}

function buildDashChart() {
    new Chart(document.getElementById('dashEstado'), {
        type:'doughnut',
        data:{ labels:['En ejecución','Vigente','En trámite','Finalizado'],
            datasets:[{ data:[countBy('exec'),countBy('vig'),countBy('tram'),countBy('fin')], backgroundColor:[ESTADO_COLOR.exec,ESTADO_COLOR.vig,ESTADO_COLOR.tram,ESTADO_COLOR.fin], borderWidth:0 }] },
        options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ font:{ family:'Inter', size:13 }, padding:16 } } } }
    });
}

function buildCharts() {
    const cOrigen = {}, cDir = {}, cCoord = {}, ejec = { '0-25':0,'26-50':0,'51-75':0,'76-100':0 };
    convenios.forEach(c => {
        cOrigen[c.origen] = (cOrigen[c.origen]||0)+1;
        cDir[c.direccion] = (cDir[c.direccion]||0)+1;
        cCoord[c.coordinacion] = (cCoord[c.coordinacion]||0)+1;
        if (c.ejec === null) return;
        if (c.ejec <= 25) ejec['0-25']++; else if (c.ejec <= 50) ejec['26-50']++;
        else if (c.ejec <= 75) ejec['51-75']++; else ejec['76-100']++;
    });
    const base = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ font:{ family:'Inter' } } } } };
    new Chart(chEstado, { type:'doughnut', data:{ labels:['En ejecución','Vigente','En trámite','Finalizado'], datasets:[{ data:[countBy('exec'),countBy('vig'),countBy('tram'),countBy('fin')], backgroundColor:[ESTADO_COLOR.exec,ESTADO_COLOR.vig,ESTADO_COLOR.tram,ESTADO_COLOR.fin], borderWidth:0 }] }, options:{ ...base, cutout:'60%', plugins:{ legend:{ position:'bottom' } } } });
    new Chart(chOrigen, { type:'pie', data:{ labels:Object.keys(cOrigen), datasets:[{ data:Object.values(cOrigen), backgroundColor:['#002061','#E74C3C'], borderWidth:0 }] }, options:{ ...base, plugins:{ legend:{ position:'bottom' } } } });
    new Chart(chDir, { type:'bar', data:{ labels:Object.keys(cDir).map(d=>d.replace('Subdirección de ','Subdir. ').replace('Proyectos y Cooperación Internacional','Coop. Internacional')), datasets:[{ data:Object.values(cDir), backgroundColor:'#00AFFF', borderRadius:6 }] }, options:{ ...base, indexAxis:'y', plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ stepSize:1 } } } } });
    new Chart(chCoord, { type:'bar', data:{ labels:Object.keys(cCoord), datasets:[{ data:Object.values(cCoord), backgroundColor:'#0099DD', borderRadius:6 }] }, options:{ ...base, indexAxis:'y', plugins:{ legend:{ display:false } }, scales:{ x:{ ticks:{ stepSize:1 } } } } });
    new Chart(chEjec, { type:'bar', data:{ labels:['0-25%','26-50%','51-75%','76-100%'], datasets:[{ data:Object.values(ejec), backgroundColor:['#E74C3C','#E8A600','#33D4FF','#26A65B'], borderRadius:6 }] }, options:{ ...base, plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ stepSize:1 } } } } });
}

function renderTable() {
    const q = document.getElementById('tableSearch').value.toLowerCase();
    const fe = document.getElementById('filterEstado').value;
    const fo = document.getElementById('filterOrigen').value;
    const rows = convenios.filter(c =>
        (!q || (c.entidad+c.direccion+c.coordinacion+c.objeto).toLowerCase().includes(q)) &&
        (!fe || c.estado === fe) && (!fo || c.origen === fo));
    document.getElementById('tableEmpty').style.display = rows.length ? 'none' : 'block';
    document.getElementById('tableBody').innerHTML = rows.map(c => `
        <tr>
            <td class="num-cell">${c.num}</td>
            <td><b>${c.entidad}</b><br><span style="font-size:.76rem;color:var(--gray-dark)">${c.objeto}</span></td>
            <td><span class="badge ${c.origen==='Nacional'?'nac':'int'}">${c.origen}</span></td>
            <td>${c.direccion}</td>
            <td>${c.coordinacion}</td>
            <td><span class="badge ${c.estado}">${ESTADO_LABEL[c.estado]}</span></td>
            <td>${fmtDate(c.inicio)}</td>
            <td>${fmtDate(c.fin)}</td>
            <td>${c.ejec===null ? '<span style="color:var(--gray-dark)">N/D</span>' : `<div class="progress"><span style="width:${c.ejec}%"></span><small>${c.ejec}%</small></div>`}</td>
        </tr>`).join('');
}
['tableSearch','filterEstado','filterOrigen'].forEach(id => document.getElementById(id).addEventListener('input', renderTable));

/* TIMELINE: eje 2023–2030 (84 meses) */
const TL_START = 2023, TL_MONTHS = 84;
let tlFilter = 'all';
function monthsSince(d) { const x = new Date(d+"T00:00:00"); return (x.getFullYear()-TL_START)*12 + x.getMonth(); }
function renderTimeline() {
    const withDates = convenios.filter(c => c.inicio && c.fin && (tlFilter==='all' || c.estado===tlFilter));
    document.getElementById('tlRows').innerHTML = withDates.map(c => {
        const s = monthsSince(c.inicio), e = monthsSince(c.fin);
        const left = Math.max(0, s)/TL_MONTHS*100;
        const width = Math.max(1.5, Math.min(TL_MONTHS, e-s)/TL_MONTHS*100);
        return `<div class="tl-track">
            <div class="tl-name" title="${c.entidad}"><span class="n">${c.num}</span>${c.entidad}</div>
            <div class="tl-lane"><div class="tl-bar ${c.estado}" style="left:${left}%;width:${width}%">
                #${c.num}
                <div class="tl-tip"><b>#${c.num} ${c.entidad}</b><br>${fmtDate(c.inicio)} → ${fmtDate(c.fin)}<br>${ESTADO_LABEL[c.estado]}${c.ejec!==null?' · '+c.ejec+'%':''}</div>
            </div></div>
        </div>`;
    }).join('') || '<p style="text-align:center;color:var(--gray-dark);padding:1.5rem">No hay convenios con fechas en esta categoría.</p>';
    const sinFecha = convenios.filter(c => (!c.inicio || !c.fin) && (tlFilter==='all'||c.estado===tlFilter)).map(c=>'#'+c.num);
    document.getElementById('tlNote').textContent = sinFecha.length ? `Nota: los convenios ${sinFecha.join(', ')} no tienen fecha de inicio o fin definida y no se grafican aquí (sí aparecen en la tabla).` : '';
}
document.querySelectorAll('.btn-filter[data-f]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.btn-filter[data-f]').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); tlFilter = b.dataset.f; renderTimeline();
}));
function monthLabel(v) { return (TL_START + Math.floor(v/12)) + "-" + String((v%12)+1).padStart(2,'0'); }
slStart.addEventListener('input', e => bdStart.textContent = monthLabel(+e.target.value));
slEnd.addEventListener('input', e => bdEnd.textContent = monthLabel(+e.target.value));

/* CALENDARIO */
let calDate = new Date(2026, 5, 1);
const DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
function renderCalendar() {
    const y = calDate.getFullYear(), m = calDate.getMonth();
    document.getElementById('calTitle').textContent = calDate.toLocaleDateString('es-EC', { month:'long', year:'numeric' });
    const firstDow = new Date(y, m, 1).getDay(), days = new Date(y, m+1, 0).getDate(), today = new Date();
    let html = DOW.map(d => `<div class="cal-dow">${d}</div>`).join('');
    for (let i=0;i<firstDow;i++) html += `<div class="cal-cell empty"></div>`;
    for (let d=1; d<=days; d++) {
        const iso = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = today.getFullYear()===y && today.getMonth()===m && today.getDate()===d;
        let evs = '';
        convenios.forEach(c => {
            if (c.inicio === iso) evs += `<div class="cal-ev start" title="Suscripción: #${c.num} ${c.entidad}">▶ #${c.num} ${c.entidad}</div>`;
            if (c.fin === iso)    evs += `<div class="cal-ev end" title="Fin: #${c.num} ${c.entidad}">■ #${c.num} ${c.entidad}</div>`;
        });
        html += `<div class="cal-cell ${isToday?'today':''}"><div class="dnum">${d}</div>${evs}</div>`;
    }
    document.getElementById('calGrid').innerHTML = html;
}
document.getElementById('calPrev').onclick = () => { calDate.setMonth(calDate.getMonth()-1); renderCalendar(); };
document.getElementById('calNext').onclick = () => { calDate.setMonth(calDate.getMonth()+1); renderCalendar(); };
document.getElementById('calToday').onclick = () => { calDate = new Date(); renderCalendar(); };

/* MAPA */
function buildMap() {
    leafletMap = L.map('map').setView([-2.35, -79.85], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap', maxZoom:18 }).addTo(leafletMap);
    convenios.forEach(c => {
        L.circleMarker([c.lat, c.lng], { radius:11, fillColor:ESTADO_COLOR[c.estado], color:'#fff', weight:2, fillOpacity:0.9 })
            .addTo(leafletMap)
            .bindPopup(`<b>#${c.num} · ${c.entidad}</b><br>${c.objeto}<br><br>${ESTADO_LABEL[c.estado]}${c.ejec!==null?' · '+c.ejec+'%':''}<br>${fmtDate(c.inicio)} → ${fmtDate(c.fin)}`);
    });
}

/* PORTADA POWER BI */
const pbiFrame = document.getElementById('pbiFrame');
const pbiFsBtn = document.getElementById('pbiFullscreen');
if (pbiFsBtn && pbiFrame) {
    pbiFsBtn.addEventListener('click', () => {
        if (pbiFrame.requestFullscreen) pbiFrame.requestFullscreen();
        else if (pbiFrame.webkitRequestFullscreen) pbiFrame.webkitRequestFullscreen();
    });
}
const pbiReloadBtn = document.getElementById('pbiReload');
if (pbiReloadBtn && pbiFrame) {
    pbiReloadBtn.addEventListener('click', () => { pbiFrame.src = pbiFrame.src; });
}

/* INIT — la portada es Power BI; el gráfico del Dashboard se construye al abrir su pestaña */
refreshStats(); buildAlerts();
renderTable(); renderTimeline(); renderCalendar();
