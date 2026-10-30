(() => {
const D = __DATA__;
const PAT = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const $ = (sel) => svg.querySelector(sel);

const el = {
  needleH1: $('[data-part="needle-h1"]'),
  needleH2: $('[data-part="needle-h2"]'),
  needleOut: $('[data-part="needle-out"]'),
  needleTarget: $('[data-part="needle-target"]'),
  sliderA: $('[data-part="slider-in-a"]'),
  sliderB: $('[data-part="slider-in-b"]'),
  plunger1: $('[data-part="plunger-r1"]'),
  plunger2: $('[data-part="plunger-r2"]'),
  btn: $('[data-part="train-btn"]'),
  pulses: $('[data-part="pulses"]'),
};
const pots = {};
for (const id of Object.keys(D.pots)) pots[id] = $(`[data-part="pot-${id}"]`);
const lamps = {};
svg.querySelectorAll(".pt-lamp").forEach((g) => { lamps[g.dataset.lamp] = g; });

// ------------------------------------------------------------- the network (single truth source)
const net = (() => {
  let s = D.net.seed >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  let W1, B1, W2, B2, steps;
  const seed = () => {
    s = D.net.seed >>> 0;
    W1 = [[rnd() - 0.5, rnd() - 0.5], [rnd() - 0.5, rnd() - 0.5]];
    B1 = [rnd() - 0.5, rnd() - 0.5];
    W2 = [rnd() - 0.5, rnd() - 0.5];
    B2 = rnd() - 0.5;
    steps = 0;
  };
  seed();
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const api = {
    get W1() { return W1; }, get B1() { return B1; }, get W2() { return W2; }, get B2() { return B2; },
    get steps() { return steps; },
    forward(x1, x2) {
      const z = [W1[0][0] * x1 + W1[0][1] * x2 + B1[0], W1[1][0] * x1 + W1[1][1] * x2 + B1[1]];
      const h = [Math.max(0, z[0]), Math.max(0, z[1])];
      return { z, h, y: sig(W2[0] * h[0] + W2[1] * h[1] + B2) };
    },
    loss() {
      let l = 0;
      for (const [a, b, t] of PAT) l += (api.forward(a, b).y - t) ** 2;
      return l / 4;
    },
    step(x1, x2, t) {
      const { h, y } = api.forward(x1, x2);
      const dy = y - t;
      for (let j = 0; j < 2; j++) {
        const dz = dy * W2[j] * (h[j] > 0 ? 1 : 0);
        W1[j][0] -= D.net.lr * dz * x1;
        W1[j][1] -= D.net.lr * dz * x2;
        B1[j] -= D.net.lr * dz;
        W2[j] -= D.net.lr * dy * h[j];
      }
      B2 -= D.net.lr * dy;
      steps++;
    },
    reset() { seed(); },
  };
  return api;
})();

// ------------------------------------------------------------- display state
const disp = {
  inputs: { a: 0, b: 0 },
  z: [0, 0], h: [0, 0], y: 0.46, target: 0.5,
  w: { wA1: net.W1[0][0], wB1: net.W1[0][1], b1: net.B1[0], wA2: net.W1[1][0], wB2: net.W1[1][1], b2: net.B1[1], wH1: net.W2[0], wH2: net.W2[1], bOut: net.B2 },
  phase: "demo",
};
const syncWeights = () => {
  disp.w = { wA1: net.W1[0][0], wB1: net.W1[0][1], b1: net.B1[0], wA2: net.W1[1][0], wB2: net.W1[1][1], b2: net.B1[1], wH1: net.W2[0], wH2: net.W2[1], bOut: net.B2 };
};

// ------------------------------------------------------------- pulses
const active = [];
const circles = [];
function getCircle() {
  for (const c of circles) if (!c.busy) return c;
  if (circles.length < 14) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("r", "1.35");
    node.setAttribute("class", "pt-pulse");
    el.pulses.appendChild(node);
    const c = { node, busy: false };
    circles.push(c);
    return c;
  }
  return null;
}
function pulse(name, { reverse = false, dur = 0.9, delay = 0 } = {}) {
  if (still.matches) return;
  const c = getCircle();
  if (!c) return;
  c.busy = true;
  active.push({ route: D.routes[name], reverse, dur, age: -delay, c });
}
function routePos(route, frac, reverse) {
  const L = clamp(frac, 0, 1) * route.total;
  let i = 1;
  while (i < route.cum.length - 1 && route.cum[i] < L) i++;
  const span = route.cum[i] - route.cum[i - 1] || 1;
  const t = clamp((L - route.cum[i - 1]) / span, 0, 1);
  const a = route.pts[i - 1], b = route.pts[i];
  const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return reverse ? p : p;
}
function drawPulses(dt) {
  for (let i = active.length - 1; i >= 0; i--) {
    const p = active[i];
    p.age += dt;
    if (p.age < 0) { p.c.node.setAttribute("opacity", "0"); continue; }
    const frac = p.age / p.dur;
    if (frac >= 1) {
      p.c.busy = false;
      p.c.node.setAttribute("opacity", "0");
      active.splice(i, 1);
      continue;
    }
    const pos = routePos(p.route, frac, p.reverse);
    p.c.node.setAttribute("cx", pos[0].toFixed(1));
    p.c.node.setAttribute("cy", pos[1].toFixed(1));
    p.c.node.setAttribute("opacity", (Math.min(frac / 0.12, (1 - frac) / 0.12, 1) * 0.95).toFixed(2));
  }
}

// ------------------------------------------------------------- geometry rebuilds
const P = D.P;
const needleHD = (c, v) => {
  const a = Math.PI / 2 + (clamp(v, -3, 3) / 3) * 1.7;
  const dir = [Math.cos(a), Math.sin(a)];
  return lineOnTop([c.x - dir[0] * 2.2, c.y - dir[1] * 2.2], [c.x + dir[0] * 10.2, c.y + dir[1] * 10.2], c.z + 0.2, P);
};
const needleOutD = (v, len, tail) => {
  const a = Math.PI + (clamp(v, 0, 1) - 0.5) * 2.0;
  const dir = [Math.cos(a), Math.sin(a)];
  return lineOnTop([D.meters.out.x - dir[0] * tail, -dir[1] * tail], [D.meters.out.x + dir[0] * len, dir[1] * len], D.meters.out.z + 0.2, P);
};
const potD = (id, w) => {
  const p = D.pots[id];
  const phi = (clamp(w, -3, 3) / 3) * 1.92;
  const dir = [Math.cos(phi), Math.sin(phi)];
  return lineOnTop([p.x, p.y], [p.x + dir[0] * 6.55, p.y + dir[1] * 6.55], p.z + 8.7, P);
};

// ------------------------------------------------------------- springs
const spring = (stiff, drag) => ({ stiff, drag, at: 0, rate: 0 });
const stepSpring = (sp, want, dt, calm) => {
  const drag = calm ? 2 * Math.sqrt(sp.stiff) : sp.drag;
  for (let i = 0; i < 4; i++) {
    sp.rate += ((want - sp.at) * sp.stiff - sp.rate * drag) * dt / 4;
    sp.at += sp.rate * dt / 4;
  }
  if (Math.abs(want - sp.at) < 0.004 && Math.abs(sp.rate) < 0.004) { sp.at = want; sp.rate = 0; }
};
const ease = (v, want, dt, tau) => (calm) => want; // placeholder
const follow = (v, want, dt, tau, calm) => (calm ? want : v + (want - v) * (1 - Math.exp(-dt / tau)));
const sprung = {
  nH1: spring(420, 26), nH2: spring(420, 26), nOut: spring(320, 22),
  pl1: spring(900, 34), pl2: spring(900, 34),
};
const eased = {
  slA: 0, slB: 0, tgt: 0.5, btn: 0,
  w: { ...disp.w },
};

// ------------------------------------------------------------- director
let events = [], evIdx = 0, cycleLen = 0;
function commitFwd(tt) {
  const f = net.forward(disp.inputs.a, disp.inputs.b);
  disp.z = f.z; disp.h = f.h; disp.y = f.y; disp.target = tt;
  if (f.h[0] > 0.02) pulse("r7", { dur: 0.9 });
  if (f.h[1] > 0.02) pulse("r8", { dur: 0.9 });
}
function demoPres(t0, [a, b, tt], fast) {
  events.push({ t: t0, fn: () => { disp.inputs.a = a; disp.inputs.b = b; disp.target = tt; } });
  if (a) pulse; // scheduled below
  events.push({ t: t0 + 0.1, fn: () => { if (a) pulse("r1", { dur: fast ? 0.4 : 1.3 }); if (b) pulse("r4", { dur: fast ? 0.4 : 1.3 }); } });
  events.push({ t: t0 + (fast ? 0.3 : 1.4), fn: () => commitFwd(tt) });
  events.push({ t: t0 + (fast ? 0.62 : 2.3), fn: () => { disp.y; } });
}
function trainPres(t0, pat) {
  demoPres(t0, pat, true);
  events.push({ t: t0 + 0.62, fn: () => {
    pulse("r7", { reverse: true, dur: 0.4 });
    pulse("r8", { reverse: true, dur: 0.4 });
    pulse("r2", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r6", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r3", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r5", { reverse: true, dur: 0.5, delay: 0.35 });
  } });
  events.push({ t: t0 + 0.78, fn: () => { net.step(pat[0], pat[1], pat[2]); syncWeights(); } });
}
function buildCycle() {
  events = [];
  let t = 1.2;
  events.push({ t: 0.2, fn: () => { disp.phase = "demo"; } });
  for (const p of PAT) { demoPres(t, p, false); t += 3.0; }
  events.push({ t: t, fn: () => { disp.phase = "train"; } });
  t += 0.6;
  for (let i = 0; i < D.net.steps; i++) { trainPres(t, PAT[i % 4]); t += 0.9; }
  events.push({ t: t, fn: () => { disp.phase = "verify"; } });
  t += 1.0;
  for (const p of PAT) { demoPres(t, p, false); t += 2.6; }
  t += 2.6;
  events.push({ t: t, fn: () => { net.reset(); syncWeights(); disp.phase = "demo"; } });
  cycleLen = t + 1.2;
  events.sort((a, b) => a.t - b.t);
  evIdx = 0;
}
buildCycle();

// ------------------------------------------------------------- readout
function readoutText() {
  const a = disp.inputs.a, b = disp.inputs.b;
  if (disp.phase === "train") {
    return `训练 ${net.steps}/${D.net.steps} · 输入 (${a},${b}) · 误差 ${net.loss().toFixed(3)}`;
  }
  const tt = a ^ b;
  const ok = (disp.y > 0.5) === !!tt;
  const head = disp.phase === "verify" ? "已学会" : (net.steps ? "" : "未训练");
  return `${head} 输入 (${a},${b}) · 期望 ${tt} · 输出 ${disp.y.toFixed(2)} ${ok ? "✓" : "✗"}`;
}

// ------------------------------------------------------------- draw
function setLamp(node, on) {
  if (!node) return;
  const cur = node.hasAttribute("data-on");
  if (cur !== on) on ? node.setAttribute("data-on", "") : node.removeAttribute("data-on");
}
function draw() {
  el.needleH1.setAttribute("d", needleHD(D.meters.h1, sprung.nH1.at));
  el.needleH2.setAttribute("d", needleHD(D.meters.h2, sprung.nH2.at));
  el.needleOut.setAttribute("d", needleOutD(sprung.nOut.at, 16.2, 2.6));
  el.needleTarget.setAttribute("d", needleOutD(eased.tgt, 16.2, 2.2));
  el.sliderA.setAttribute("transform", translateAlong(P, [0, 0, eased.slA * D.sliderDz]));
  el.sliderB.setAttribute("transform", translateAlong(P, [0, 0, eased.slB * D.sliderDz]));
  el.plunger1.setAttribute("transform", translateAlong(P, [0, 0, sprung.pl1.at]));
  el.plunger2.setAttribute("transform", translateAlong(P, [0, 0, sprung.pl2.at]));
  el.btn.setAttribute("transform", translateAlong(P, [0, 0, eased.btn * D.btnPress]));
  for (const id of Object.keys(pots)) pots[id].setAttribute("d", potD(id, eased.w[id]));
  setLamp(lamps["in-a"], disp.inputs.a > 0.5);
  setLamp(lamps["in-b"], disp.inputs.b > 0.5);
  setLamp(lamps["h1lamp"], disp.z[0] > 0);
  setLamp(lamps["h2lamp"], disp.z[1] > 0);
  setLamp(lamps["outlamp"], disp.y > 0.5);
  const text = readoutText();
  if (readout.textContent !== text) readout.textContent = text;
}

// ------------------------------------------------------------- main loop
let last = 0, clock = 0, frame = 0, touring = !still.matches, visible = false, idleTimer = 0;
function settled() {
  const want = [disp.z[0], disp.z[1], disp.y];
  return !touring && active.length === 0
    && Math.abs(sprung.nH1.at - want[0]) < 0.01 && Math.abs(sprung.nH2.at - want[1]) < 0.01
    && Math.abs(sprung.nOut.at - want[2]) < 0.01
    && eased.slA === disp.inputs.a && eased.slB === disp.inputs.b && eased.tgt === disp.target
    && eased.btn === (disp.phase === "train" ? 1 : 0);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) {
    clock += dt;
    if (clock >= cycleLen) { clock -= cycleLen; evIdx = 0; }
    while (evIdx < events.length && events[evIdx].t <= clock) events[evIdx++].fn();
  }
  sprung.nH1.rate; // keep
  stepSpring(sprung.nH1, disp.z[0], dt, calm);
  stepSpring(sprung.nH2, disp.z[1], dt, calm);
  stepSpring(sprung.nOut, disp.y, dt, calm);
  const r1 = disp.z[0] > 0 ? D.relayFire : 0, r2 = disp.z[1] > 0 ? D.relayFire : 0;
  stepSpring(sprung.pl1, r1, dt, calm);
  stepSpring(sprung.pl2, r2, dt, calm);
  eased.slA = follow(eased.slA, disp.inputs.a, dt, 0.18, calm);
  if (Math.abs(eased.slA - disp.inputs.a) < 0.001) eased.slA = disp.inputs.a;
  eased.slB = follow(eased.slB, disp.inputs.b, dt, 0.18, calm);
  if (Math.abs(eased.slB - disp.inputs.b) < 0.001) eased.slB = disp.inputs.b;
  eased.tgt = follow(eased.tgt, disp.target, dt, 0.3, calm);
  if (Math.abs(eased.tgt - disp.target) < 0.001) eased.tgt = disp.target;
  eased.btn = follow(eased.btn, disp.phase === "train" ? 1 : 0, dt, 0.12, calm);
  if (Math.abs(eased.btn - (disp.phase === "train" ? 1 : 0)) < 0.001) eased.btn = disp.phase === "train" ? 1 : 0;
  for (const id of Object.keys(eased.w)) {
    eased.w[id] = follow(eased.w[id], disp.w[id], dt, 0.4, calm);
    if (Math.abs(eased.w[id] - disp.w[id]) < 0.002) eased.w[id] = disp.w[id];
  }
  drawPulses(dt);
  draw();
  frame = visible && !settled() ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);

// ------------------------------------------------------------- interaction
function worldFromScreen(sx, sy) {
  const { o, ex, ey } = D.affine;
  const dx = sx - o[0], dy = sy - o[1];
  const det = ex[0] * ey[1] - ex[1] * ey[0];
  if (!det) return null;
  return [ (dx * ey[1] - dy * ey[0]) / det, (ex[0] * dy - ex[1] * dx) / det ];
}
function hit(world) {
  if (!world) return null;
  for (const h of D.hits) {
    if (Math.hypot(world[0] - h.x, world[1] - h.y) < h.r) return h.id;
  }
  return null;
}
function manualPoke(fn) {
  touring = false;
  fn();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (!still.matches) { touring = true; } run(); }, 5200);
  run();
}
function toggleInput(which) {
  manualPoke(() => {
    disp.inputs[which] = disp.inputs[which] ? 0 : 1;
    const a = disp.inputs.a, b = disp.inputs.b;
    if (a) pulse("r1", { dur: 0.9 });
    if (b) pulse("r4", { dur: 0.9 });
    commitFwd(a ^ b);
  });
}
function manualTrain() {
  manualPoke(() => {
    const a = disp.inputs.a, b = disp.inputs.b, tt = a ^ b;
    pulse("r7", { reverse: true, dur: 0.4 });
    pulse("r8", { reverse: true, dur: 0.4 });
    pulse("r2", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r6", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r3", { reverse: true, dur: 0.5, delay: 0.35 });
    pulse("r5", { reverse: true, dur: 0.5, delay: 0.35 });
    net.step(a, b, tt);
    syncWeights();
    disp.phase = net.steps >= D.net.steps ? "verify" : "train";
  });
}
stage.addEventListener("pointerdown", (event) => {
  const box = svg.getBoundingClientRect();
  const scale = D.P.w ? 1 : 1;
  const sx = (event.clientX - box.left) * (svg.viewBox ? svg.viewBox.baseVal.width / box.width : 1);
  const sy = (event.clientY - box.top) * (svg.viewBox ? svg.viewBox.baseVal.height / box.height : 1);
  const id = hit(worldFromScreen(sx, sy));
  if (id === "in-a") toggleInput("a");
  else if (id === "in-b") toggleInput("b");
  else if (id === "btn") manualTrain();
});
stage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); toggleInput("a"); }
  else if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); toggleInput("b"); }
  else if (event.key === " " || event.key === "Spacebar") { event.preventDefault(); manualTrain(); }
});

if (still.matches) {
  disp.inputs = { a: 0, b: 0 };
  commitFwd(0);
}
draw();
})();
