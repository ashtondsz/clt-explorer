/* ===========================================================
   CLT Explorer
   Deterministic, seeded population generation + live sampling
   =========================================================== */
(function(){
"use strict";

/* -------------------- seeded RNG -------------------- */
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randNormal(rng){
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function mean(arr){ return arr.reduce((a,b)=>a+b,0) / arr.length; }
function std(arr, m){
  const mu = m === undefined ? mean(arr) : m;
  return Math.sqrt(arr.reduce((a,b)=>a+(b-mu)*(b-mu),0) / arr.length);
}

/* -------------------- icons -------------------- */
const ICONS = {
fisherman: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 44c8 6 44 6 52 0" stroke="#93cba7" stroke-width="2" stroke-linecap="round"/>
  <path d="M14 44l3-10h18l4 10" fill="#dcefe1" stroke="#1e7a3d" stroke-width="2" stroke-linejoin="round"/>
  <path d="M14 44H8M39 44h6" stroke="#1e7a3d" stroke-width="2" stroke-linecap="round"/>
  <path d="M26 34V16" stroke="#1e7a3d" stroke-width="2" stroke-linecap="round"/>
  <path d="M26 16c8-2 12 3 15 1" stroke="#279149" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <circle cx="41" cy="17" r="1.6" fill="#175c30"/>
  <path d="M41 18.6c1.5 3 .5 6-2 7.5" stroke="#175c30" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <circle cx="21" cy="24" r="3.2" fill="#f1f8f3" stroke="#1e7a3d" stroke-width="1.6"/>
  <path d="M20 24h2M21 23v2" stroke="#1e7a3d" stroke-width="1" stroke-linecap="round"/>
</svg>`,
commute: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 48h56" stroke="#bfe0cb" stroke-width="2" stroke-linecap="round"/>
  <rect x="8" y="20" width="10" height="24" fill="#dcefe1" stroke="#1e7a3d" stroke-width="1.6"/>
  <rect x="21" y="12" width="12" height="32" fill="#f1f8f3" stroke="#93cba7" stroke-width="1.6"/>
  <rect x="36" y="24" width="9" height="20" fill="#dcefe1" stroke="#1e7a3d" stroke-width="1.6"/>
  <rect x="12" y="34" width="30" height="10" rx="2" fill="#1e7a3d"/>
  <circle cx="18" cy="46" r="2.6" fill="#123a24"/>
  <circle cx="36" cy="46" r="2.6" fill="#123a24"/>
  <rect x="15" y="36" width="6" height="4.5" fill="#f1f8f3"/>
  <rect x="24" y="36" width="6" height="4.5" fill="#f1f8f3"/>
  <rect x="33" y="36" width="5" height="4.5" fill="#f1f8f3"/>
</svg>`,
phone: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="21" y="8" width="22" height="48" rx="4" fill="#f1f8f3" stroke="#1e7a3d" stroke-width="2"/>
  <rect x="24" y="14" width="16" height="30" fill="#dcefe1"/>
  <circle cx="32" cy="50" r="2.2" fill="#1e7a3d"/>
  <path d="M27 22l3 4 7-8" stroke="#279149" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M27 34h10M27 38h6" stroke="#93cba7" stroke-width="1.6" stroke-linecap="round"/>
</svg>`,
lock: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.4"/></svg>`,
unlock: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 7V5a3 3 0 0 1 5.7-1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
sparkle: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M8 2l1.4 4.6L14 8l-4.6 1.4L8 14l-1.4-4.6L2 8l4.6-1.4L8 2z" fill="currentColor"/></svg>`
};

/* -------------------- example configs -------------------- */
const EXAMPLES = [
  {
    id: "fisherman",
    name: "Fisherman",
    icon: ICONS.fisherman,
    populationN: 100,
    sampleSize: 10,
    unit: " kg",
    decimals: 2,
    axisLabel: "Average weight (kg)",
    valueLabel: "weight",
    meanKnown: true,
    samplingMode: "without",
    revealThreshold: 10,
    seedPop: 12345,
    seedSample: 555,
    genPopulation(){
      const rng = mulberry32(this.seedPop);
      const arr = [];
      for (let i = 0; i < this.populationN; i++){
        let w = 2.45 + randNormal(rng) * 0.38;
        w = Math.max(0.6, w);
        w = Math.round(w * 100) / 100;
        arr.push(w);
      }
      return arr;
    },
    about: [
      "A lake holds <b>100 fish</b>.",
      "The true average weight of every fish is known ahead of time.",
      "We catch random samples of <b>10 fish</b>, weigh them, calculate the average, and repeat &mdash; until every fish has been caught exactly once."
    ],
    sentence: (est, mu) => `Ten samples of 10 fish, drawn without overlap, average out to almost exactly the lake's true weight.`
  },
  {
    id: "commute",
    name: "Bangalore Commute",
    icon: ICONS.commute,
    populationN: 10000,
    sampleSize: 50,
    unit: " min",
    decimals: 1,
    axisLabel: "Average commute time (minutes)",
    valueLabel: "commute time",
    meanKnown: false,
    samplingMode: "with",
    revealThreshold: 20,
    seedPop: 67890,
    seedSample: 84930,
    genPopulation(){
      const rng = mulberry32(this.seedPop);
      const arr = [];
      for (let i = 0; i < this.populationN; i++){
        let sum = 0;
        for (let k = 0; k < 4; k++){
          const u = rng();
          sum += -7 * Math.log(1 - u);
        }
        let t = 12 + sum;
        t = Math.min(t, 140);
        arr.push(Math.round(t * 10) / 10);
      }
      return arr;
    },
    about: [
      "Bengaluru has roughly <b>10,000 commuters</b> in this scenario, and we don't know their true average commute time.",
      "Measuring every single commuter isn't realistic &mdash; so instead we take random samples of <b>50 people</b> and look at the average of each sample.",
      "Can repeated samples help us estimate the truth without ever measuring everyone?"
    ],
    sentence: (est, mu) => `You estimated the average commute time of 10,000 people without measuring everyone.`
  },
  {
    id: "phone",
    name: "Phone Usage",
    icon: ICONS.phone,
    populationN: 100000,
    sampleSize: 100,
    unit: " hrs",
    decimals: 2,
    axisLabel: "Average daily phone usage (hours)",
    valueLabel: "daily usage",
    meanKnown: false,
    samplingMode: "with",
    revealThreshold: 20,
    seedPop: 24680,
    seedSample: 3603951,
    genPopulation(){
      const rng = mulberry32(this.seedPop);
      const arr = [];
      const mu = 1.25, sigma = 0.5;
      for (let i = 0; i < this.populationN; i++){
        const z = randNormal(rng);
        let v = Math.exp(mu + sigma * z);
        v = Math.min(v, 14);
        arr.push(Math.round(v * 100) / 100);
      }
      return arr;
    },
    about: [
      "This app has <b>100,000 users</b>, and the true average daily screen time is a mystery.",
      "The population is far too large to inspect user by user &mdash; so we take random samples of <b>100 users</b> at a time.",
      "Keep sampling to watch the sampling distribution become smoother and more bell-shaped, then reveal the truth."
    ],
    sentence: (est, mu) => `You estimated the average screen time of 100,000 users using samples of just 100.`
  }
];

const NBINS = 22;

/* -------------------- state -------------------- */
const state = {}; // per example id
let activeId = EXAMPLES[0].id;

function initExample(ex){
  const population = ex.genPopulation();
  const popMean = mean(population);
  const popStd = std(population, popMean);
  const se = popStd / Math.sqrt(ex.sampleSize);
  const halfRange = Math.max(se * 4.4, popStd * 0.12);
  const binMin = popMean - halfRange;
  const binMax = popMean + halfRange;

  const s = {
    population, popMean, popStd,
    binMin, binMax, binWidth: (binMax - binMin) / NBINS,
    binCounts: new Array(NBINS).fill(0),
    samples: [],       // { values:[...], mean:number }
    sumMeans: 0,
    revealed: false,
    order: null,        // for without-replacement
    rng: mulberry32(ex.seedSample)
  };
  if (ex.samplingMode === "without"){
    const idxRng = mulberry32(ex.seedSample);
    const idx = population.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--){
      const j = Math.floor(idxRng() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    s.order = idx;
  }
  state[ex.id] = s;
}
EXAMPLES.forEach(initExample);

function getEx(id){ return EXAMPLES.find(e => e.id === id); }

/* -------------------- sampling -------------------- */
function drawSample(ex, s){
  const n = ex.sampleSize;
  let values;
  if (ex.samplingMode === "without"){
    const start = s.samples.length * n;
    if (start + n > ex.populationN) return null;
    values = s.order.slice(start, start + n).map(i => s.population[i]);
  } else {
    values = new Array(n);
    for (let i = 0; i < n; i++){
      const idx = Math.floor(s.rng() * ex.populationN);
      values[i] = s.population[idx];
    }
  }
  const m = mean(values);
  return { values, mean: m };
}

function addSamples(ex, s, count){
  for (let i = 0; i < count; i++){
    if (ex.samplingMode === "without" && s.samples.length >= ex.revealThreshold) break;
    const sample = drawSample(ex, s);
    if (!sample) break;
    s.samples.push(sample);
    s.sumMeans += sample.mean;
    let bi = Math.floor((sample.mean - s.binMin) / s.binWidth);
    bi = Math.max(0, Math.min(NBINS - 1, bi));
    s.binCounts[bi]++;
  }
}

function resetExample(id){
  initExample(getEx(id));
}

/* -------------------- number formatting -------------------- */
function fmt(ex, v){ return v.toFixed(ex.decimals) + ex.unit; }
function fmtPlain(ex, v){ return v.toFixed(ex.decimals); }
// The "Difference" stat gets one extra decimal of precision. With populations of
// 10,000 / 100,000 and only a few dozen samples, the true gap between the estimate
// and the real mean is real but small — at the example's normal display precision
// it can round down to "0.0" and look like a suspiciously exact match. Showing an
// extra digit keeps the honest, nonzero deviation visible instead of hiding it.
function fmtDiff(ex, v){ return v.toFixed(ex.decimals + 1) + ex.unit; }

/* ===========================================================
   RENDERING
   =========================================================== */
const $ = sel => document.querySelector(sel);
const el = (tag, cls, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };

function renderExampleList(){
  const wrap = $("#exampleList");
  wrap.innerHTML = "";
  EXAMPLES.forEach((ex, i) => {
    const btn = el("button", "example-card" + (ex.id === activeId ? " active" : ""));
    btn.type = "button";
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", ex.id === activeId ? "true" : "false");
    const badgeClass = ex.meanKnown ? "known" : "hidden";
    const badgeText = ex.meanKnown ? "Population mean is known" : "Population mean is hidden";
    btn.innerHTML = `
      <div class="example-card-head">
        <span class="example-index">${i+1}</span>
        <span class="example-name">${ex.name}</span>
      </div>
      <div class="example-icon">${ex.icon}</div>
      <div class="example-meta">
        Population: <b>${ex.populationN.toLocaleString()}</b><br>
        Sample size (n): <b>${ex.sampleSize}</b>
      </div>
      <span class="example-badge ${badgeClass}">${badgeText}</span>
    `;
    btn.addEventListener("click", () => selectExample(ex.id));
    wrap.appendChild(btn);
  });
}

function selectExample(id){
  activeId = id;
  renderExampleList();
  renderAll();
}

/* ---------- main chart ---------- */
function renderMainChart(ex, s){
  const svg = $("#mainChart");
  const W = 900, H = 340;
  const padL = 46, padR = 46, padTop = 46, baseline = 272;
  const chartW = W - padL - padR;

  const scaleX = v => padL + ((v - s.binMin) / (s.binMax - s.binMin)) * chartW;
  const blockW = (chartW / NBINS) * 0.68;
  const availH = baseline - padTop - 10;
  const maxCount = Math.max(1, ...s.binCounts);
  const blockH = Math.max(4, Math.min(16, availH / Math.max(maxCount, 6)));
  const maxBlocksDrawn = Math.max(1, Math.min(50, Math.floor(availH / blockH)));

  let svgParts = [];

  // gridlines + axis ticks
  const nTicks = 7;
  for (let t = 0; t < nTicks; t++){
    const v = s.binMin + (t / (nTicks - 1)) * (s.binMax - s.binMin);
    const x = scaleX(v);
    svgParts.push(`<line x1="${x}" y1="${padTop}" x2="${x}" y2="${baseline}" stroke="#f0f3f1" stroke-width="1"/>`);
    svgParts.push(`<text x="${x}" y="${baseline + 22}" text-anchor="middle" font-size="12" fill="#8a9691" font-family="IBM Plex Mono, monospace">${v.toFixed(ex.decimals)}</text>`);
  }
  svgParts.push(`<line x1="${padL}" y1="${baseline}" x2="${W - padR}" y2="${baseline}" stroke="#d7dfda" stroke-width="1"/>`);
  svgParts.push(`<text x="${W/2}" y="${H - 6}" text-anchor="middle" font-size="12.5" fill="#4d5952" font-family="Inter, sans-serif">${ex.axisLabel}</text>`);

  // bell curve (drawn first, sits behind blocks)
  const nMeans = s.samples.length;
  if (nMeans >= 2){
    const means = s.samples.map(x => x.mean);
    const mu = mean(means);
    let sigma = std(means, mu);
    if (sigma < s.binWidth * 0.35) sigma = s.binWidth * 0.35;
    const peakDensity = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const curveScale = (maxCount * blockH * 0.94) / peakDensity;
    const pts = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++){
      const v = s.binMin + (i / steps) * (s.binMax - s.binMin);
      const density = Math.exp(-0.5 * Math.pow((v - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
      const y = baseline - density * curveScale;
      pts.push(`${scaleX(v).toFixed(1)},${y.toFixed(1)}`);
    }
    const opacity = Math.min(0.95, 0.28 + nMeans * 0.03);
    svgParts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="#1e7a3d" stroke-width="2.2" stroke-linejoin="round" opacity="${opacity.toFixed(2)}"/>`);
  }

  // building blocks
  for (let b = 0; b < NBINS; b++){
    const count = s.binCounts[b];
    if (!count) continue;
    const cx = padL + (b + 0.5) * (chartW / NBINS);
    const x0 = cx - blockW / 2;
    const drawIndividual = Math.min(count, maxBlocksDrawn);
    for (let k = 0; k < drawIndividual; k++){
      const y = baseline - (k + 1) * blockH + 1.4;
      const shade = k % 2 === 0 ? "#3aa85d" : "#4fb96f";
      svgParts.push(`<rect x="${x0.toFixed(1)}" y="${y.toFixed(1)}" width="${blockW.toFixed(1)}" height="${Math.max(2, blockH-1.8).toFixed(1)}" rx="1.5" fill="${shade}"/>`);
    }
    if (count > maxBlocksDrawn){
      // merge the overflow into a single capped block at full chart height, with a count label
      const overflowTop = padTop + 2;
      svgParts.push(`<rect x="${x0.toFixed(1)}" y="${overflowTop.toFixed(1)}" width="${blockW.toFixed(1)}" height="${(baseline - drawIndividual*blockH - overflowTop).toFixed(1)}" fill="#279149" opacity="0.55"/>`);
      svgParts.push(`<text x="${cx}" y="${(overflowTop - 6).toFixed(1)}" text-anchor="middle" font-size="10.5" fill="#175c30" font-family="IBM Plex Mono, monospace" font-weight="600">&times;${count}</text>`);
    }
  }

  // population mean line
  const showMu = ex.meanKnown || s.revealed;
  if (showMu){
    const x = scaleX(s.popMean);
    svgParts.push(`<line x1="${x}" y1="${padTop-8}" x2="${x}" y2="${baseline}" stroke="#1e7a3d" stroke-width="1.6" stroke-dasharray="5,4"/>`);
    svgParts.push(`<text x="${x}" y="${padTop-14}" text-anchor="middle" font-size="12.5" fill="#175c30" font-family="IBM Plex Mono, monospace" font-weight="600">&mu; = ${fmt(ex, s.popMean)}</text>`);
  }

  svg.innerHTML = svgParts.join("");

  // legend
  const legend = $("#chartLegend");
  legend.innerHTML = `<span class="legend-item"><span class="legend-dot"></span>Sample mean</span>` +
    (showMu ? `<span class="legend-item"><span class="legend-line"></span>Population mean (&mu;)</span>` : "");
}

/* ---------- sample rows ---------- */
function miniSampleSVG(ex, sample){
  const W = 300, H = 56, padL = 4, padR = 4, baseline = 46;
  const values = sample.values;
  const vMin = Math.min(...values), vMax = Math.max(...values);
  const range = Math.max(vMax - vMin, 1e-6);
  const nb = 14;
  const counts = new Array(nb).fill(0);
  values.forEach(v => {
    let bi = Math.floor(((v - vMin) / range) * nb);
    bi = Math.max(0, Math.min(nb - 1, bi));
    counts[bi]++;
  });
  const maxC = Math.max(...counts);
  const barW = (W - padL - padR) / nb;
  let parts = [];
  for (let i = 0; i < nb; i++){
    const h = (counts[i] / maxC) * (baseline - 6);
    if (h <= 0) continue;
    const x = padL + i * barW;
    parts.push(`<rect x="${(x+0.6).toFixed(1)}" y="${(baseline-h).toFixed(1)}" width="${(barW-1.2).toFixed(1)}" height="${h.toFixed(1)}" fill="#bfe0cb" rx="1"/>`);
  }
  parts.push(`<line x1="${padL}" y1="${baseline}" x2="${W-padR}" y2="${baseline}" stroke="#e6ebe7" stroke-width="1"/>`);
  const mx = padL + ((sample.mean - vMin) / range) * (W - padL - padR);
  parts.push(`<line x1="${mx.toFixed(1)}" y1="6" x2="${mx.toFixed(1)}" y2="${baseline}" stroke="#1e7a3d" stroke-width="1.4" stroke-dasharray="3,3"/>`);
  parts.push(`<circle cx="${mx.toFixed(1)}" cy="6" r="3.4" fill="#1e7a3d"/>`);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${parts.join("")}</svg>`;
}

const MAX_ROWS_SHOWN = 60;

function renderSampleRows(ex, s){
  const wrap = $("#sampleRows");
  const emptyMsg = $("#samplesEmpty");
  const countEl = $("#samplesCount");
  wrap.innerHTML = "";
  countEl.textContent = s.samples.length ? `${s.samples.length} sample${s.samples.length===1?"":"s"} taken` : "";

  if (!s.samples.length){
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  const total = s.samples.length;
  const startIdx = Math.max(0, total - MAX_ROWS_SHOWN);
  if (startIdx > 0){
    const note = el("div", "samples-virtual-note", `Showing the most recent ${total - startIdx} of ${total} samples`);
    wrap.appendChild(note);
  }
  for (let i = startIdx; i < total; i++){
    const sample = s.samples[i];
    const row = el("div", "sample-row");
    row.innerHTML = `
      <div class="sample-row-label">Sample ${i+1}</div>
      <div class="sample-row-chart">${miniSampleSVG(ex, sample)}</div>
      <div class="sample-row-mean">Mean&nbsp;=&nbsp;<b>${fmt(ex, sample.mean)}</b></div>
    `;
    wrap.appendChild(row);
  }
}

/* ---------- header / stats ---------- */
function renderExperimentHeader(ex, s){
  $("#experimentTitle").innerHTML = `
    <span class="ex-icon">${ex.icon}</span>
    <h2>${ex.name}</h2>
    ${ex.meanKnown
      ? `<span class="mu-badge">Population mean (&mu;) = ${fmt(ex, s.popMean)}</span>`
      : `<span class="mu-badge hidden-badge">Population mean: ${s.revealed ? fmt(ex, s.popMean) : "hidden"}</span>`}
  `;
  $("#experimentStats").innerHTML = `
    <div class="stat"><div class="stat-label">Samples taken</div><div class="stat-value accent">${s.samples.length}</div></div>
    <div class="stat"><div class="stat-label">Sample size (n)</div><div class="stat-value">${ex.sampleSize}</div></div>
  `;
}

/* ---------- controls ---------- */
function renderControls(ex, s){
  const btn1 = $("#btnAdd1"), btn5 = $("#btnAdd5"), btn10 = $("#btnAdd10"), note = $("#limitNote");
  if (ex.samplingMode === "without"){
    const remaining = ex.revealThreshold - s.samples.length;
    btn1.disabled = remaining < 1;
    btn5.disabled = remaining < 1;
    btn10.disabled = remaining < 1;
    if (remaining <= 0){
      note.textContent = `Maximum reached — all ${ex.revealThreshold} non-overlapping samples have been taken.`;
      note.classList.add("warn");
    } else if (remaining < 10){
      note.textContent = `Only ${remaining} sample${remaining===1?"":"s"} left before every fish has been caught once.`;
      note.classList.add("warn");
    } else {
      note.textContent = `Sampling without replacement — a hard maximum of ${ex.revealThreshold} samples (100 fish \u00f7 10 per sample).`;
      note.classList.remove("warn");
    }
  } else {
    btn1.disabled = false; btn5.disabled = false; btn10.disabled = false;
    note.textContent = "";
    note.classList.remove("warn");
  }
}

/* ---------- estimate section ---------- */
function renderEstimate(ex, s){
  const box = $("#estimateSection");
  if (!s.samples.length){
    box.classList.remove("visible");
    box.innerHTML = "";
    return;
  }
  box.classList.add("visible");
  const est = s.sumMeans / s.samples.length;
  const revealComplete = ex.meanKnown ? (s.samples.length >= ex.revealThreshold) : s.revealed;

  let html = `<div class="estimate-box"><div class="estimate-label">Your estimate</div><div class="estimate-value">${fmt(ex, est)}</div></div>`;
  if (revealComplete){
    const diff = Math.abs(est - s.popMean);
    html += `<div class="estimate-box pop"><div class="estimate-label">${ex.meanKnown ? "Population mean" : "Actual population mean"}</div><div class="estimate-value">${fmt(ex, s.popMean)}</div></div>`;
    html += `<div class="estimate-box diff"><div class="estimate-label">Difference</div><div class="estimate-value">${fmtDiff(ex, diff)}</div></div>`;
    html += `<div class="estimate-sentence">${ex.sentence(est, s.popMean)}</div>`;
  }
  box.innerHTML = html;
}

/* ---------- progress ---------- */
function renderProgress(ex, s){
  const step4Label = ex.meanKnown ? "Compare with the known mean" : "Reveal the truth";
  const step4Done = ex.meanKnown ? (s.samples.length >= ex.revealThreshold) : s.revealed;
  const steps = [
    { label: "Choose an example", done: true },
    { label: "Take samples", done: s.samples.length >= 1 },
    { label: "Watch the distribution form", done: s.samples.length >= 5 },
    { label: step4Label, done: step4Done }
  ];
  let firstUndone = steps.findIndex(st => !st.done);
  const list = $("#progressList");
  list.innerHTML = steps.map((st, i) => {
    const cls = st.done ? "done" : (i === firstUndone ? "current" : "");
    const mark = st.done ? "&#10003;" : (i+1);
    return `<li class="progress-item ${cls}"><span class="progress-dot">${mark}</span>${st.label}</li>`;
  }).join("");
}

/* ---------- about sidebar ---------- */
function renderAbout(ex){
  $("#aboutIcon").innerHTML = ex.icon;
  $("#aboutText").innerHTML = ex.about.map(p => `<p>${p}</p>`).join("");
}

/* ---------- reveal card ---------- */
function renderReveal(ex, s){
  const card = $("#revealCard");
  card.className = "card reveal-card";

  if (ex.meanKnown){
    const done = s.samples.length >= ex.revealThreshold;
    const pct = Math.min(100, (s.samples.length / ex.revealThreshold) * 100);
    if (done) card.classList.add("revealed");
    const est = s.samples.length ? s.sumMeans / s.samples.length : null;
    card.innerHTML = `
      <div class="reveal-title">${ICONS.sparkle} Final comparison</div>
      ${done ? `
        <div class="reveal-stat-row"><span>Population mean</span><span>${fmt(ex, s.popMean)}</span></div>
        <div class="reveal-stat-row"><span>Avg. of your sample means</span><span>${fmt(ex, est)}</span></div>
        <div class="reveal-stat-row"><span>Difference</span><span>${fmtDiff(ex, Math.abs(est - s.popMean))}</span></div>
      ` : `
        <div class="reveal-body">Take all ${ex.revealThreshold} samples to see how closely their average matches the known population mean.</div>
        <div class="reveal-progress-track"><div class="reveal-progress-fill" style="width:${pct}%"></div></div>
        <div class="reveal-progress-label">${s.samples.length} / ${ex.revealThreshold} samples</div>
      `}
    `;
    return;
  }

  const unlocked = s.samples.length >= ex.revealThreshold;
  const pct = Math.min(100, (s.samples.length / ex.revealThreshold) * 100);

  if (s.revealed){
    const est = s.sumMeans / s.samples.length;
    card.classList.add("revealed");
    card.innerHTML = `
      <div class="reveal-title">${ICONS.sparkle} The truth is revealed</div>
      <div class="reveal-stat-row"><span>Your estimate</span><span>${fmt(ex, est)}</span></div>
      <div class="reveal-stat-row"><span>Actual population mean</span><span>${fmt(ex, s.popMean)}</span></div>
      <div class="reveal-stat-row"><span>Difference</span><span>${fmtDiff(ex, Math.abs(est - s.popMean))}</span></div>
    `;
    return;
  }

  if (unlocked) card.classList.add("unlocked");
  card.innerHTML = `
    <div class="reveal-title">${unlocked ? ICONS.unlock : ICONS.lock} Reveal the truth</div>
    <div class="reveal-body">${unlocked ? "You've taken enough samples — see how close your estimate is." : "Take more samples to unlock."}</div>
    <div class="reveal-progress-track"><div class="reveal-progress-fill" style="width:${pct}%"></div></div>
    <div class="reveal-progress-label">${s.samples.length} / ${ex.revealThreshold} samples</div>
    <button class="btn btn-solid" id="btnReveal" type="button" ${unlocked ? "" : "disabled"}>Reveal the truth</button>
  `;
  const revealBtn = $("#btnReveal");
  if (revealBtn){
    revealBtn.addEventListener("click", () => {
      s.revealed = true;
      renderAll();
    });
  }
}

/* ---------- master render ---------- */
function renderAll(){
  const ex = getEx(activeId);
  const s = state[activeId];
  renderExperimentHeader(ex, s);
  renderMainChart(ex, s);
  renderSampleRows(ex, s);
  renderControls(ex, s);
  renderEstimate(ex, s);
  renderAbout(ex);
  renderProgress(ex, s);
  renderReveal(ex, s);
}

/* ===========================================================
   EVENTS
   =========================================================== */
function handleAdd(count){
  const ex = getEx(activeId);
  const s = state[activeId];
  addSamples(ex, s, count);
  renderAll();
}
$("#btnAdd1").addEventListener("click", () => handleAdd(1));
$("#btnAdd5").addEventListener("click", () => handleAdd(5));
$("#btnAdd10").addEventListener("click", () => handleAdd(10));
$("#btnReset").addEventListener("click", () => { resetExample(activeId); renderAll(); });

const modal = $("#aboutModal");
$("#aboutBtn").addEventListener("click", () => modal.classList.remove("hidden"));
$("#modalClose").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.classList.add("hidden"); });

/* ===========================================================
   INIT
   =========================================================== */
renderExampleList();
renderAll();

})();
