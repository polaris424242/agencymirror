// Run with: node --test   (from the repository root)
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../docs/am-math.js");

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("Brier score and skill against the base-rate baseline", () => {
  const b = M.brier([{ p: 0.7, y: 1 }, { p: 0.7, y: 0 }, { p: 0.3, y: 0 }, { p: 0.9, y: 1 }]);
  // (0.09 + 0.49 + 0.09 + 0.01) / 4 = 0.17 ; ybar = 0.5 -> baseline 0.25 ; skill = 1 - 0.17/0.25
  close(b.brier, 0.17);
  close(b.baseline, 0.25);
  close(b.skill, 0.32);
});

test("Brier ignores trials without a forecast", () => {
  const b = M.brier([{ p: null, y: 1 }, { p: 1, y: 1 }]);
  assert.equal(b.n, 1);
});

test("Calibration bins split low, middle and high forecasts", () => {
  const c = M.calibration([{ p: 0.2, y: 0 }, { p: 0.5, y: 1 }, { p: 0.8, y: 1 }, { p: 0.8, y: 0 }]);
  assert.deepEqual(c.map(x => x.n), [1, 1, 2]);
  close(c[2].actual, 0.5);
  close(c[2].pred, 0.8);
});

test("Beta-Bernoulli posterior counts partial outcomes as half", () => {
  const r = M.betaPost([1, 1, 0, 0.5]); // successes 2.5, failures 1.5 -> Beta(3.5, 2.5)
  close(r.a, 3.5);
  close(r.b, 2.5);
  close(r.mean, 3.5 / 6);
  assert.ok(r.lo < r.mean && r.mean < r.hi);
});

test("Beta posterior with no data is the flat prior", () => {
  const r = M.betaPost([]);
  close(r.mean, 0.5);
});

test("Logistic regression recovers which predictor matters", () => {
  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rows = [];
  for (let i = 0; i < 400; i++) {
    const imp = 1 + Math.floor(rnd() * 5), int = 1 + Math.floor(rnd() * 5);
    const p = 1 / (1 + Math.exp(-1.5 * (int - 3)));
    rows.push({ x: [imp, int], y: rnd() < p ? 1 : 0 });
  }
  const f = M.logistic(rows);
  assert.ok(Math.abs(f.b[2]) > 4 * Math.abs(f.b[1]), `coefficients ${f.b}`);
  assert.ok(f.b[2] > 0);
});

test("Logistic flags a constant predictor", () => {
  const f = M.logistic([{ x: [3, 1], y: 1 }, { x: [3, 5], y: 0 }]);
  assert.equal(f.ok[0], false);
  assert.equal(f.ok[1], true);
});

test("SMAA: a dominant option always wins", () => {
  const r = M.smaa(["A", "B"], [{ lo: 1, hi: 9 }, { lo: 1, hi: 9 }], [[9, 9], [1, 1]], { N: 2000 });
  assert.equal(r.winPct[0], 1);
  assert.equal(r.pivot, null);
});

test("SMAA: a symmetric trade-off splits about evenly and finds a pivot", () => {
  let seed = 7;
  const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const r = M.smaa(["A", "B"], [{ lo: 0, hi: 10 }, { lo: 0, hi: 10 }], [[10, 0], [0, 10]], { N: 4000, rng });
  assert.ok(Math.abs(r.winPct[0] - 0.5) < 0.05, `win ${r.winPct}`);
  assert.ok(r.pivot);
});

test("SMAA with fixed weights reduces to ordinary weighted scoring (MAUT)", () => {
  const r = M.smaa(["A", "B", "C"], [{ lo: 6, hi: 6 }, { lo: 4, hi: 4 }], [[8, 2], [5, 6], [3, 9]], { N: 200 });
  // A = .6*8 + .4*2 = 5.6 ; B = 5.4 ; C = 5.4
  assert.equal(r.winPct[0], 1);
  close(r.midScore[0], 5.6);
});

test("Rank acceptabilities sum to one for every option", () => {
  const r = M.smaa(["A", "B", "C"], [{ lo: 0, hi: 10 }, { lo: 0, hi: 10 }], [[7, 3], [5, 5], [2, 9]], { N: 1000 });
  r.rankPct.forEach(row => close(row.reduce((a, x) => a + x, 0), 1, 1e-9));
});

test("Median of an even-length list averages the middle pair", () => {
  assert.equal(M.median([3, 1, 2, 10]), 2.5);
});
