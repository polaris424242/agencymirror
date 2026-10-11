// Guards docs/scales.js: it must parse, and any filled-in scale must be complete and consistent.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const src = fs.readFileSync(path.join(__dirname, "..", "docs", "scales.js"), "utf8");

test("scales.js parses and defines AM_SCALES", () => {
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  assert.ok(Array.isArray(ctx.window.AM_SCALES));
});

test("every filled-in scale is well formed", () => {
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  const ids = new Set();
  for (const s of ctx.window.AM_SCALES) {
    assert.ok(s.id && !ids.has(s.id), `duplicate or missing id: ${s.id}`);
    ids.add(s.id);
    assert.ok([5, 7].includes(s.max), `${s.id}: max must be 5 or 7`);
    if (!s.items.length) continue;
    if (s.nItems) assert.equal(s.items.length, s.nItems, `${s.id}: expected ${s.nItems} items`);
    for (const it of s.items) {
      assert.ok(!/^\s*[A-Za-z]{2,6}\s*\(\d+\)/.test(it), `${s.id}: remove the label prefix from "${it}"`);
      assert.ok(!/\(R\)\s*$/.test(it), `${s.id}: put reverse-scored numbers in "reversed", not "(R)" in "${it}"`);
    }
    for (const r of s.reversed) assert.ok(r >= 1 && r <= s.items.length, `${s.id}: reversed item ${r} out of range`);
  }
});

test("subscales cover every item exactly once", () => {
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  for (const s of ctx.window.AM_SCALES) {
    if (!s.subscales || !s.items.length) continue;
    const all = s.subscales.flatMap(x => x.items).sort((a, b) => a - b);
    assert.deepEqual(all, s.items.map((_, i) => i + 1), `${s.id}: subscale items must cover 1..${s.items.length} once each`);
  }
});
