import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../../.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "../../../.claude/skills/anatomy/kit/tube.mjs";
import * as A from "../../../.claude/skills/anatomy/kit/audit.mjs";
import { kitScript } from "../../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = process.argv.includes("--light") ? "light" : "dark";

// ---------------------------------------------------------------------------
// The machine: a 1958-style perceptron trainer bench, learning XOR live.
// Two input lamp-switches feed two hidden summing meters (each with a relay);
// their weight pots sit on the association boxes. The output box carries the
// big meter, its two weights and its bias. Eight cables carry the signals;
// during training the error runs backwards and the servos turn the pots by
// the gradient. Seed 6866, lr 0.8: 56 presentations to converge.
// ---------------------------------------------------------------------------
const NET_SEED = 6866;
const NET_LR = 0.8;
const NET_STEPS = 56;

const W = 680;
const H = 470;
const PLATE = { x: -170, y: -86, w: 340, d: 172, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const IN_A = [-146, 42];
const IN_B = [-146, -42];
const JA = [-90, 10];
const JB = [-90, -10];
const B1 = { x0: -80, y0: 22, x1: 0, y1: 70, top: 26 };
const B2 = { x0: -80, y0: -70, x1: 0, y1: -22, top: 26 };
const OUT = { x0: 44, y0: -26, x1: 128, y1: 26, top: 30 };
const TRAIN_BTN = [146, -44];

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-146, 42, 21], [-146, -42, 21],
    [-72, 62, 33], [-64, 46, 36.6],
    [-6, 46, 44.6], [-6, -46, 44.6],
    [98, 0, 42.6], [122, -8, 36.6],
    [146, -44, 18],
  ],
  W,
  H,
  { pad: 30, azimuth: 42, elevation: 30 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (pts, style) => k.dotsSvg(pts, style);
const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
const f2 = (v) => Math.round(v * 100) / 100;

const R = A.recorder(P);
const record = R.solid;
function put(name, ref, svg, shapes = [], { bias = 0, ...rest } = {}) {
  return R.put({ name, at: ref, bias, svg, shapes, piece: "rig", ...rest });
}

const netInit = (() => {
  let s = NET_SEED >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return {
    W1: [[rnd() - 0.5, rnd() - 0.5], [rnd() - 0.5, rnd() - 0.5]],
    B1: [rnd() - 0.5, rnd() - 0.5],
    W2: [rnd() - 0.5, rnd() - 0.5],
    B2: rnd() - 0.5,
  };
})();
const initFwd = (() => {
  const { W1, B1, W2, B2 } = netInit;
  const h = [Math.max(0, B1[0]), Math.max(0, B1[1])];
  return { h, y: 1 / (1 + Math.exp(W2[0] * h[0] + W2[1] * h[1] + B2)) };
})();

function box(name, [x0, y0, z0], [x1, y1, z1], style = {}, { r = 0.4, steps = 2, bevel = 0, extra = "", inner = "", bias = 0 } = {}) {
  const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r };
  const shape = record(A.slab(plan, z0, z1 - z0, { name }, steps));
  put(name, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], S(k.slabOf(plan, z0, z1 - z0, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias });
  return shape;
}
function cyl(name, cx, cy, r, z, h, style = {}, opts = {}) {
  const shape = record(A.cylinder(cx, cy, r, z, h, { name }));
  put(name, [cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, opts.steps ?? 24, opts.bevel ?? 0.4), { tone: "mid", ...style, ...(opts.inner ? { inner: opts.inner } : {}) }) + (opts.extra || ""), [shape], { bias: opts.bias ?? 0 });
  return shape;
}
function disc(name, F, s0, s1, r, style = {}, opts = {}) {
  const shape = record(A.disc(F, s0, s1, r, { name }));
  const mid = G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2));
  put(name, mid, S(G.disc(s0, s1, r, F, P, { steps: opts.steps ?? 24, bevel: opts.bevel ?? 0.2 }), { tone: "mid", ...style, ...(opts.inner ? { inner: opts.inner } : {}) }) + (opts.extra || ""), [shape], { bias: opts.bias ?? 0 });
  return shape;
}
function ball(name, c, r, style = {}, { bias = 0, extra = "" } = {}) {
  const shape = record(A.ball(c, r, { name }));
  put(name, c, S(G.sphereOf(c, r, P, { steps: 24 }), { tone: "mid", ...style }) + extra, [shape], { bias });
  return shape;
}
function faceSlot(x, cy, z0, z1, w, r = 0.8) {
  const ring = k.roundedPlan({ x: cy - w / 2, y: z0, w, d: z1 - z0, r }, 4);
  return path3(ring.map(([u, v]) => [x, u, v]), true);
}

const CABLES = {};
const alongAt = (route, p) => {
  let best = 0, gap = Infinity;
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i];
    const ab = G.sub3(b, a), len = G.len3(ab);
    if (len < 1e-6) continue;
    const t = Math.max(0, Math.min(1, (p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / (len * len));
    const q = [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t];
    const d = G.len3(G.sub3(p, q));
    const along = G.pathLength(route.slice(0, i)) + len * t;
    if (d < gap) { gap = d; best = along; }
  }
  return best;
};
function cable(name, points, r = 0.55, { tone = "lo", bend = 1.8, ends = [true, true], maxLength = 12, bias = 0.05, limp = true, breaksAt = [] } = {}) {
  const route = G.fillet(points, Math.max(bend, r * 2.6), 10, { P, tube: r });
  const breaks = breaksAt.map((p) => alongAt(route, p)).sort((a, b) => a - b);
  R.route(name, route, r, { gaps: [], limp, piece: "rig" });
  tubePieces(route, r, P, { maxLength, spacing: Math.max(0.6, Math.min(1.6, r)), breaks }).forEach((piece, index) =>
    put(`${name}:${index}`, piece.mid, tubeSvg(piece, { tone }), [A.tube(piece.points, piece.radii)], { bias, route: name, chunk: index }),
  );
  [0, 1].forEach((index) => {
    if (!ends[index]) return;
    const end = index ? route[route.length - 1] : route[0];
    const size = Math.max(0.5, r * G.scaleOf(P) * 0.9);
    put(`${name}.end${index}`, end, Dots([at(end)], { size, tone: "hi" }), [A.ball(end, size / G.scaleOf(P), { name: `${name}.end${index}`, owner: name })], { bias: bias + 0.15 });
  });
  CABLES[name] = route;
  return route;
}

// --------------------------------------------------------------------------- back: plate, ruler, raceway, label
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
  back.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
record(A.slab(PLATE, -PLATE_H, PLATE_H, { name: "bench.plate", ground: true }, 8));
back.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
back.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
const plateScrews = k.corners(PLATE, 10);
back.push(Ln(plateScrews.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
back.push(Dots(plateScrews.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

const STRIP = { x: -140, y: 74, w: 280, d: 6, r: 1 };
back.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
const ticks = k.topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y, 0.6, [2, 3.6], P);
back.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));

const RACE = { x: -102, y: -15, w: 144, d: 30, r: 4 };
back.push(S(k.slabOf(RACE, 0, 0.6, P, 4), { tone: "lo", crease: "none" }));
back.push(Ln(k.planOutline(k.insetPlan(RACE, 2), 0.6, P, 4), { tone: "faint" }));

const LABEL = { x: 104, y: 60, w: 44, d: 13, r: 1.2 };
back.push(S(k.slabOf(LABEL, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
back.push(Ln(k.planOutline(k.insetPlan(LABEL, 1.4), 0.8, P, 3), { tone: "faint" }));
back.push(Ln([20, 14, 17].map((w, i) => k.lineOnTop([LABEL.x + 4, LABEL.y + 3.4 + i * 3], [LABEL.x + 4 + w, LABEL.y + 3.4 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
back.push(Dots([at([LABEL.x + LABEL.w - 2.6, LABEL.y + 2.4, 0.8]), at([LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d - 2.4, 0.8])], { size: 0.45 }));

// --------------------------------------------------------------------------- input lamp-switch units
function inputUnit(id, [cx, cy]) {
  const flange = cyl(`${id}.flange`, cx, cy, 7, 0, 2.5, { tone: "lo" }, { steps: 28 });
  Dots([]); // (dots ride on the housing item below)
  cyl(`${id}.housing`, cx, cy, 5.5, 2.5, 11.5, { tone: "mid", crease: "lo" }, {
    steps: 28, bevel: 0.3,
    extra: Dots([at([cx + 4.6, cy + 3.8, 2.5]), at([cx - 4.6, cy - 3.8, 2.5])], { size: 0.45, tone: "lo" })
      + Ln([6.5, 10.5].map((z) => k.sideArc(cx, cy, 5.5, z, P, 16)).join(""), { tone: "faint" }),
  });
  cyl(`${id}.lamphousing`, cx, cy, 4.2, 14, 2.5, { tone: "mid" }, { steps: 24 });
  const dome = ball(`${id}.dome`, [cx, cy, 19.2], 3.1, { tone: "hi" });
  // rewrap the dome svg with the lamp class
  const domeItem = R.items[R.items.length - 1];
  domeItem.svg = `<g class="pt-lamp" data-lamp="${id}">${domeItem.svg}</g>`;
  // switch plate on the +x face, slot, slider, terminal boss
  const platePlan = { x: cx + 5.5, y: cy - 6, w: 1.6, d: 12, r: 0.4 };
  const plateShape = record(A.slab(platePlan, 5, 8, { name: `${id}.plate` }, 2));
  const slider = `<g data-part="slider-${id}">` +
    S(G.disc(0, 2, 2.2, G.frameAlong([cx + 7.1, cy, 7.5], [1, 0, 0]), P, { steps: 20, bevel: 0.2 }), { tone: "mid" }) +
    Ln(path3([[cx + 9.12, cy - 1.4, 7.5], [cx + 9.12, cy + 1.4, 7.5]]), { tone: "hi", free: "end" }) +
    `</g>`;
  put(`${id}.plate`, [cx + 6.3, cy, 9], S(k.slabOf(platePlan, 5, 8, P, 2, 0.2), { tone: "mid" }) +
    Ln(faceSlot(cx + 7.12, cy, 6.5, 12.5, 4.4, 1.2), { tone: "faint" }) +
    Dots([at([cx + 7.08, cy + 3.1, 7.5]), at([cx + 7.08, cy + 3.1, 11.5])], { size: 0.4, tone: "lo" }) +
    slider, [plateShape]);
  disc(`${id}.boss`, G.frameAlong([cx + 5.5, cy, 3.4], [1, 0, 0]), 0, 2.6, 1.2, { tone: "lo" });
}
inputUnit("in-a", IN_A);
inputUnit("in-b", IN_B);

// --------------------------------------------------------------------------- junction blocks
function junction(id, [cx, cy]) {
  const plan = { x: cx - 4, y: cy - 4, w: 8, d: 8, r: 1.2 };
  const shape = record(A.slab(plan, 0, 5, { name: id }, 3));
  put(id, [cx, cy, 2.5], S(k.slabOf(plan, 0, 5, P, 3, 0.4), { tone: "mid" }) +
    Ln(k.planOutline(k.insetPlan(plan, 1.4), 5, P, 3), { tone: "faint" }) +
    Dots([at([cx + 2.2, cy - 2.2, 5]), at([cx - 2.2, cy + 2.2, 5])], { size: 0.4, tone: "lo" }), [shape]);
}
junction("junc-a", JA);
junction("junc-b", JB);

// --------------------------------------------------------------------------- association boxes
function assocBox(id, B) {
  const plan = { x: B.x0, y: B.y0, w: B.x1 - B.x0, d: B.y1 - B.y0, r: 3 };
  const shape = record(A.slab(plan, 0, B.top, { name: id }, 4));
  const vents = [-3, -1, 1].map((i) => faceSlot(B.x1 + 0.02, (B.y0 + B.y1) / 2 + i * 4, 6, 20, 2.4)).join("");
  put(id, [(B.x0 + B.x1) / 2, (B.y0 + B.y1) / 2, B.top / 2],
    S(k.slabOf(plan, 0, B.top, P, 4, 0.8), { tone: "mid", inner: Ln([8, 17].map((z) => k.sideSeam(plan, z, P, 4)).join(""), { tone: "faint" }) }) +
    Ln(k.planOutline(k.insetPlan(plan, 3), B.top, P, 4), { tone: "faint" }) +
    Ln(vents, { tone: "faint" }) +
    Dots([at([B.x0 + 5, B.y0 + 4, B.top]), at([B.x1 - 5, B.y1 - 4, B.top])], { size: 0.45, tone: "lo" }),
    [shape]);
}
assocBox("assoc-1", B1);
assocBox("assoc-2", B2);

// --------------------------------------------------------------------------- meters, pots, relays, servos, lamps
const needleH = (c, v) => {
  const a = Math.PI / 2 + (Math.max(-3, Math.min(3, v)) / 3) * 1.7;
  const dir = [Math.cos(a), Math.sin(a)];
  return k.lineOnTop([c[0] - dir[0] * 2.2, c[1] - dir[1] * 2.2], [c[0] + dir[0] * 10.2, c[1] + dir[1] * 10.2], c[2] + 0.2, P);
};
const needleOut = (v, len, tail) => {
  const a = Math.PI + (Math.max(0, Math.min(1, v)) - 0.5) * 2.0;
  const dir = [Math.cos(a), Math.sin(a)];
  return k.lineOnTop([98 - dir[0] * tail, -dir[1] * tail], [98 + dir[0] * len, dir[1] * len], 42.2, P);
};
const potPointer = (p, w) => {
  const phi = (Math.max(-3, Math.min(3, w)) / 3) * 1.92;
  const dir = [Math.cos(phi), Math.sin(phi)];
  return k.lineOnTop([p.x, p.y], [p.x + dir[0] * 6.55, p.y + dir[1] * 6.55], p.z + 8.7, P);
};

function meter(name, c, zBase, v0) {
  const [cx, cy] = c;
  const shape = record(A.cylinder(cx, cy, 11, zBase, 10, { name }));
  const zTop = zBase + 10;
  const ticksM = k.radialTicks(cx, cy, 9.6, 24, 4, zTop, [0.9, 1.8], P);
  const zero = k.lineOnTop([cx + Math.cos(Math.PI / 2) * 12.6, cy + Math.sin(Math.PI / 2) * 12.6], [cx + Math.cos(Math.PI / 2) * 15.4, cy + Math.sin(Math.PI / 2) * 15.4], zTop, P);
  put(name, [cx, cy, zBase + 5],
    S(k.cylinder(cx, cy, 11, zBase, 10, P, 48, 0.8), { tone: "hi", crease: "lo" }) +
    Ln(k.knurl(cx, cy, 11, zTop - 2.6, zTop, 60, P, 0.3), { tone: "lo" }) +
    Ln(k.sideArc(cx, cy, 11, zTop - 2.6, P, 40), { tone: "faint" }) +
    Ln(k.ring(cx, cy, 10.2, zTop, P, 48), { tone: "lo" }) +
    Ln(ticksM.minor, { tone: "lo" }) + Ln(ticksM.major, { tone: "mid" }) +
    Ln(zero, { tone: "hi" }) +
    Ln(k.ring(cx, cy, 1.4, zTop, P, 16), { tone: "mid" }) +
    `<path data-part="needle-${name}" class="iso-line" data-tone="hi" data-free="start" d="${needleH([cx, cy, zTop], v0)}" style="stroke-width:1"/>`,
    [shape]);
}

function pot(id, c, zBase, w0) {
  const [cx, cy] = c;
  const body = record(A.cylinder(cx, cy, 3.2, zBase, 5, { name: `${id}.body` }));
  const knob = record(A.cylinder(cx, cy, 4, zBase + 5, 3.5, { name: `${id}.knob` }));
  const pad = record(A.slab({ x: cx - 7.4, y: cy - 7.4, w: 14.8, d: 14.8, r: 7.4 }, zBase, 0.05, { name: `${id}.scale` }));
  const zKnob = zBase + 8.5;
  const arc = [];
  for (let phi = -1.92; phi <= 1.921; phi += 0.24) arc.push([cx + Math.cos(phi) * 6.6, cy + Math.sin(phi) * 6.6, zBase + 0.15]);
  const tick = (w, r1, tone) => {
    const phi = (w / 3) * 1.92;
    const dir = [Math.cos(phi), Math.sin(phi)];
    return Ln(k.lineOnTop([cx + dir[0] * 6.6, cy + dir[1] * 6.6], [cx + dir[0] * r1, cy + dir[1] * r1], zBase + 0.15, P), { tone });
  };
  put(id, [cx, cy, zBase + 4],
    S(k.cylinder(cx, cy, 3.2, zBase, 5, P, 24, 0.3), { tone: "hi", crease: "lo" }) +
    S(k.cylinder(cx, cy, 4, zBase + 5, 3.5, P, 28, 0.25), { tone: "hi", crease: "lo" }) +
    Ln(k.knurl(cx, cy, 4, zBase + 5.4, zBase + 8.3, 24, P, 0.25), { tone: "lo" }) +
    Ln(k.ring(cx, cy, 3.2, zBase + 5, P, 24), { tone: "lo" }) +
    Ln(path3(arc), { tone: "lo" }) +
    [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((w) => tick(w, 5.0, "lo")).join("") +
    [-2, -1, 1, 2].map((w) => tick(w, 5.6, "lo")).join("") +
    tick(-3, 5.0, "lo") + tick(3, 5.0, "lo") +
    tick(0, 4.8, "hi") +
    Dots([at([cx, cy, zKnob])], { size: 0.5, tone: "hi" }) +
    `<path data-part="pot-${id}" class="iso-line" data-tone="hi" d="${potPointer({ x: cx, y: cy, z: zBase }, w0)}" style="stroke-width:1"/>`,
    [pad, body, knob]);
}

function relay(id, c, zBase) {
  const [cx, cy] = c;
  const base = record(A.slab({ x: cx - 4, y: cy - 3, w: 8, d: 6, r: 1 }, zBase, 1.6, { name: `${id}.base` }, 2));
  const coil = record(A.cylinder(cx, cy, 2.4, zBase + 1.6, 8, { name: `${id}.coil` }));
  const post = record(A.slab({ x: cx + 3.4, y: cy - 1.5, w: 1.6, d: 3, r: 0.3 }, zBase + 1.6, 15.4, { name: `${id}.post` }, 2));
  const armPlan = { x: cx - 3.5, y: cy - 1.5, w: 9, d: 3, r: 0.6 };
  const arm = record(A.slab(armPlan, zBase + 17, 1.6, { name: `${id}.arm` }, 2));
  const rod = record(A.cylinder(cx, cy, 0.9, zBase + 9.6, 4.6, { name: `${id}.rod` }));
  const tip = record(A.cylinder(cx, cy, 1.5, zBase + 14.2, 0.8, { name: `${id}.tip` }));
  put(`${id}.body`, [cx, cy, zBase + 9],
    S(k.slabOf({ x: cx - 4, y: cy - 3, w: 8, d: 6, r: 1 }, zBase, 1.6, P, 2, 0.3), { tone: "lo" }) +
    S(k.cylinder(cx, cy, 2.4, zBase + 1.6, 8, P, 24, 0.2), { tone: "hi" }) +
    Ln([3, 5, 7, 8.8].map((z) => k.sideArc(cx, cy, 2.4, zBase + z, P, 16)).join(""), { tone: "faint" }) +
    S(k.slabOf({ x: cx + 3.4, y: cy - 1.5, w: 1.6, d: 3, r: 0.3 }, zBase + 1.6, 15.4, P, 2), { tone: "mid" }) +
    Dots([at([cx + 4.2, cy + 2.2, zBase]), at([cx - 4.2, cy - 2.2, zBase])], { size: 0.4, tone: "lo" }),
    [base, coil, post]);
  put(`${id}.plunger`, [cx, cy, zBase + 15],
    `<g data-part="plunger-${id}">` +
    S(k.cylinder(cx, cy, 0.9, zBase + 9.6, 4.6, P, 16, 0.1), { tone: "mid" }) +
    S(k.cylinder(cx, cy, 1.5, zBase + 14.2, 0.8, P, 16, 0.1), { tone: "hi" }) +
    `</g>`, [rod, tip], { bias: 0.2 });
  put(`${id}.arm`, [cx + 1, cy, zBase + 17.8],
    S(k.slabOf(armPlan, zBase + 17, 1.6, P, 2, 0.2), { tone: "mid" }) +
    Dots([at([cx - 1.5, cy + 1.1, zBase + 18.6]), at([cx + 4.6, cy - 1.1, zBase + 18.6])], { size: 0.4, tone: "lo" }),
    [arm], { bias: 0.5 });
}

function servo(name, c, zBase) {
  const [cx, cy] = c;
  const F = G.frameAlong([cx - 6, cy, zBase + 2.4], [1, 0, 0]);
  disc(`${name}.body`, F, 0, 12, 2.4, { tone: "mid" }, { steps: 28 });
  disc(`${name}.cap`, F, 12, 13.2, 1.2, { tone: "lo" }, { steps: 12 });
  disc(`${name}.shaft`, F, 13.2, 15.4, 0.6, { tone: "hi" }, { steps: 10 });
  box(`${name}.foot1`, [cx - 4.6, cy - 3.6, zBase], [cx + 4.6, cy - 2.4, zBase + 1.4], { tone: "lo" }, { r: 0.3 });
  box(`${name}.foot2`, [cx - 4.6, cy + 2.4, zBase], [cx + 4.6, cy + 3.6, zBase + 1.4], { tone: "lo" }, { r: 0.3 });
}

function lamp(id, c, zBase) {
  const [cx, cy] = c;
  cyl(`${id}.post`, cx, cy, 1.4, zBase, 1.8, { tone: "mid" });
  cyl(`${id}.housing`, cx, cy, 2.6, zBase + 1.8, 2.4, { tone: "mid" });
  ball(`${id}.dome`, [cx, cy, zBase + 6.0], 2.2, { tone: "hi" });
  const item = R.items[R.items.length - 1];
  item.svg = `<g class="pt-lamp" data-lamp="${id}">${item.svg}</g>`;
}

// hidden unit 1 (B1): meter, three pots, relay, servo, lamp
meter("h1", [-64, 46], B1.top, initFwd.h[0]);
pot("wA1", [-44, 34], B1.top, netInit.W1[0][0]);
pot("wB1", [-26, 34], B1.top, netInit.W1[0][1]);
pot("b1", [-8, 34], B1.top, netInit.B1[0]);
relay("r1", [-6, 52], B1.top);
servo("srv1", [-26, 60], B1.top);
lamp("h1lamp", [-72, 62], B1.top);
// hidden unit 2 (B2)
meter("h2", [-64, -46], B2.top, initFwd.h[1]);
pot("wA2", [-44, -34], B2.top, netInit.W1[1][0]);
pot("wB2", [-26, -34], B2.top, netInit.W1[1][1]);
pot("b2", [-8, -34], B2.top, netInit.B1[1]);
relay("r2", [-6, -46], B2.top);
servo("srv2", [-26, -60], B2.top);
lamp("h2lamp", [-72, -62], B2.top);

// --------------------------------------------------------------------------- output unit
{
  const plan = { x: OUT.x0, y: OUT.y0, w: OUT.x1 - OUT.x0, d: OUT.y1 - OUT.y0, r: 3 };
  const shape = record(A.slab(plan, 0, OUT.top, { name: "outbox" }, 4));
  const vents = [-2, 0, 2].map((i) => faceSlot(OUT.x1 + 0.02, i * 6, 8, 20, 2.4)).join("");
  put("outbox", [(OUT.x0 + OUT.x1) / 2, 0, OUT.top / 2],
    S(k.slabOf(plan, 0, OUT.top, P, 4, 0.8), { tone: "mid", inner: Ln([10, 20].map((z) => k.sideSeam(plan, z, P, 4)).join(""), { tone: "faint" }) }) +
    Ln(k.planOutline(k.insetPlan(plan, 3), OUT.top, P, 4), { tone: "faint" }) +
    Ln(vents, { tone: "faint" }) +
    Dots([at([OUT.x0 + 5, OUT.y0 + 4, OUT.top]), at([OUT.x1 - 5, OUT.y1 - 4, OUT.top])], { size: 0.45, tone: "lo" }),
    [shape]);
}
// out terminals on B1/B2 +x faces
disc("term1", G.frameAlong([0, 52, 20], [1, 0, 0]), 0, 2.5, 1.3, { tone: "lo" });
disc("term2", G.frameAlong([0, -46, 20], [1, 0, 0]), 0, 2.5, 1.3, { tone: "lo" });
// output meter: puck, ticks, digits, output needle (lit) + target needle
{
  const [cx, cy] = [98, 0];
  const zBase = OUT.top, zTop = OUT.top + 12;
  const shape = record(A.cylinder(cx, cy, 18, zBase, 12, { name: "outmeter" }));
  const ticksM = k.radialTicks(cx, cy, 15.4, 28, 4, zTop, [1.1, 2.2], P);
  const center = k.lineOnTop([cx - 12.6, cy], [cx - 15.4, cy], zTop, P);
  put("outmeter", [cx, cy, zBase + 6],
    S(k.cylinder(cx, cy, 18, zBase, 12, P, 64, 0.8), { tone: "hi", crease: "lo" }) +
    Ln(k.knurl(cx, cy, 18, zTop - 3.2, zTop, 84, P, 0.3), { tone: "lo" }) +
    Ln(k.sideArc(cx, cy, 18, zTop - 3.2, P, 48), { tone: "faint" }) +
    Ln(k.ring(cx, cy, 16.2, zTop, P, 64), { tone: "lo" }) +
    Ln(ticksM.minor, { tone: "lo" }) + Ln(ticksM.major, { tone: "mid" }) +
    Ln(center, { tone: "hi" }) +
    k.faceTextSvg(k.topMatrix([cx - 6.7, cy + 10.5], zTop, P, "x"), "0", { size: 2, tone: "lo", anchor: "middle" }) +
    k.faceTextSvg(k.topMatrix([cx - 6.7, cy - 10.5], zTop, P, "x"), "1", { size: 2, tone: "lo", anchor: "middle" }) +
    Ln(k.ring(cx, cy, 1.8, zTop, P, 16), { tone: "mid" }) +
    `<path data-part="needle-target" class="iso-line" data-tone="hi" data-free="start" d="${needleOut(0.5, 16.2, 2.2)}" style="stroke-width:0.8"/>` +
    `<path data-part="needle-out" class="iso-line" data-tone="lit" data-free="start" d="${needleOut(initFwd.y, 16.2, 2.6)}" style="stroke-width:1.2"/>`,
    [shape]);
}
pot("wH1", [56, 12], OUT.top, netInit.W2[0]);
pot("wH2", [56, -12], OUT.top, netInit.W2[1]);
pot("bOut", [72, 0], OUT.top, netInit.B2);
lamp("outlamp", [122, -8], OUT.top);
servo("srv3", [96, 23], OUT.top);
// train push-button
{
  const [cx, cy] = TRAIN_BTN;
  cyl("btn.base", cx, cy, 6, 0, 3, { tone: "lo" }, { steps: 28 });
  cyl("btn.collar", cx, cy, 4.5, 3, 3, { tone: "mid" }, { steps: 24 });
  const rod = record(A.cylinder(cx, cy, 1.6, 6, 6, { name: "btn.rod", owner: "btn" }));
  const head = record(A.cylinder(cx, cy, 4, 12, 3, { name: "btn.head", owner: "btn" }));
  const dome = record(A.ball([cx, cy, 15.8], 3, { name: "btn.cap", owner: "btn" }));
  put("btn.press", [cx, cy, 12],
    `<g data-part="train-btn">` +
    S(k.cylinder(cx, cy, 1.6, 6, 6, P, 16, 0.1), { tone: "mid" }) +
    S(k.cylinder(cx, cy, 4, 12, 3, P, 28, 0.3), { tone: "hi" }) +
    S(G.sphereOf([cx, cy, 15.8], 3, P, { steps: 24 }), { tone: "hi" }) +
    `</g>`,
    [rod, head, dome], { bias: 0.3 });
  Dots([]);
}

// --------------------------------------------------------------------------- cables
cable("r1", [[-137.9, 42, 3.4], [-131, 42, 3.2], [-127, 42, 2.2], [-99, 42, 2.2], [-99, 20, 2.2], [-90, 20, 2.2], [-90, 14, 2.2]]);
cable("r2", [[-86, 10, 2.2], [-36, 10, 2.2], [-36, 21.1, 2.2], [-36, 21.1, 28.4], [-36, 34, 27.2], [-40.8, 34, 27.0]], 0.55, { breaksAt: [[-36, 21.1, 2.2], [-36, 21.1, 27]] });
cable("r3", [[-94, 10, 2.2], [-99, 10, 2.2], [-99, 0, 3.8], [-99, -19, 3.8], [-44, -19, 3.8], [-44, -21.1, 28.4], [-44, -30.8, 27.0]]);
cable("r4", [[-137.9, -42, 3.4], [-131, -42, 3.2], [-127, -42, 2.2], [-90, -42, 2.2], [-90, -14, 2.2]]);
cable("r5", [[-86, -8, 2.2], [-26, -8, 2.2], [-26, -21.1, 2.2], [-26, -21.1, 28.4], [-26, -30.8, 27.0]]);
cable("r6", [[-94, -12, 2.2], [-102, -12, 2.2], [-102, 0, 3.8], [-102, 18, 3.8], [-14, 18, 3.8], [-14, 18, 28.4], [-14, 34, 27.2], [-22.8, 34, 27.0]], 0.55, { breaksAt: [[-14, 18, 26]] });
cable("r7", [[2.5, 52, 20], [12, 52, 20], [12, 52, 2.2], [38, 52, 2.2], [38, 32, 2.2], [56, 32, 2.2], [56, 32, 31.2], [56, 15.2, 31.0]]);
cable("r8", [[2.5, -46, 20], [12, -46, 20], [12, -46, 2.2], [38, -46, 2.2], [38, -32, 2.2], [56, -32, 2.2], [56, -32, 31.2], [64, -12, 31.0], [59.2, -12, 31.0]]);

// --------------------------------------------------------------------------- settle and page
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => `<g class="it" data-name="${item.name}">${item.svg}</g>`);

const routeData = {};
for (const [name, route] of Object.entries(CABLES)) {
  const pts = route.map((p) => at(p).map(f2));
  const cum = [0];
  for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + G.len3(G.sub3(route[i], route[i - 1])));
  routeData[name] = { pts, cum: cum.map(f2), total: f2(cum[cum.length - 1]) };
}

const o = at([0, 0, 0]);
const ex = at([1, 0, 0]), ey = at([0, 1, 0]);
const DATA = {
  P,
  affine: { o: o.map(f2), ex: [f2(ex[0] - o[0]), f2(ex[1] - o[1])], ey: [f2(ey[0] - o[0]), f2(ey[1] - o[1])] },
  hits: [
    { id: "in-a", x: IN_A[0], y: IN_A[1], r: 10 },
    { id: "in-b", x: IN_B[0], y: IN_B[1], r: 10 },
    { id: "btn", x: TRAIN_BTN[0], y: TRAIN_BTN[1], r: 9 },
  ],
  routes: routeData,
  pots: {
    wA1: { x: -44, y: 34, z: 26 }, wB1: { x: -26, y: 34, z: 26 }, b1: { x: -8, y: 34, z: 26 },
    wA2: { x: -44, y: -34, z: 26 }, wB2: { x: -26, y: -34, z: 26 }, b2: { x: -8, y: -34, z: 26 },
    wH1: { x: 56, y: 12, z: 30 }, wH2: { x: 56, y: -12, z: 30 }, bOut: { x: 72, y: 0, z: 30 },
  },
  meters: {
    h1: { x: -64, y: 46, z: 36 }, h2: { x: -64, y: -46, z: 36 }, out: { x: 98, y: 0, z: 42 },
  },
  relayFire: 2.2,
  btnPress: -2.2,
  sliderDz: 4,
  net: { seed: NET_SEED, lr: NET_LR, steps: NET_STEPS },
};

const CSS = `
.pt-lamp .iso-fill { fill: var(--anatomy-lo); transition: fill .35s ease; }
.pt-lamp[data-on] .iso-fill { fill: var(--anatomy-lit); }
.pt-pulse { fill: var(--anatomy-lit); }
.pt-stage { outline: none; }
.pt-stage:focus-visible .iso-plate { box-shadow: 0 0 0 2px var(--anatomy-lit); }
`;

const svg = k.figureSvg({
  width: W,
  height: H,
  label:
    "一台感知机训练台:底板上有两个带开关和灯的输入单元、两个接线端子盒、两个隐层求和盒(每盒顶面有求和表、三个权重电位器、继电器、伺服电机和指示灯)、一个输出盒(大表、三个权重电位器、指示灯)和一个训练按钮。八根电缆沿走线槽连接它们。",
  body: [...back, `<g class="pt-rig">${groups.join("")}</g>`, `<g data-part="pulses"></g>`],
});

const body = `<style>${CSS}</style>` + k.plateHtml({
  fig: "图 1",
  title: "感知机训练台",
  hint: "← → 切换输入 · 空格训练一步",
  readout: "输入 (0,0) · 输出 0.46 · 未训练",
  keys: [
    { mark: "lit", label: "输出指针与信号脉冲:看它们如何随训练变化" },
    { mark: "raised", label: "九个权重电位器:训练时由电机按梯度自动旋转" },
  ],
  caption:
    "一台 1958 年罗森布拉特感知机风格的训练台,正在现场学习异或(XOR)。两个输入开关的信号经接线盒进入两个隐层求和单元:每个输入先经过盒顶的权重电位器加权,求和表读出加权和,超过零则继电器吸合(ReLU),点亮指示灯并把信号送往输出盒。输出表读出最终概率,红色目标针指出正确答案。按住训练键后,误差从输出表沿电缆反向传回,伺服电机按梯度转动九个电位器;56 次示范后机器学会 XOR——正是明斯基与帕珀特 1969 年指出单层感知机学不会、必须加隐层才能解决的问题。",
  body: `<div class="iso-stage pt-stage" tabindex="0" role="group" aria-label="感知机训练台。左右方向键切换两个输入开关,空格键进行一步训练。">${svg}</div>`,
});

const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA));
const page = k.pageHtml({ title: "感知机训练台", theme: THEME, body, script: kitScript() + LIVE, width: 700 });
const name = THEME === "light" ? "ann-demo-light.html" : "ann-demo.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`, `scale ${G.scaleOf(P).toFixed(3)}`);

A.auditOrExit(R, P, {});
