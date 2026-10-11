/* Pure math used by the Patterns and Decide tabs. Kept separate so it can be tested on its own. */
(function (root) {
const AMMath = (() => {
  "use strict";
  const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
  const median = a => { if (!a.length) return NaN; const s=[...a].sort((x,y)=>x-y); const m=s.length>>1; return s.length%2 ? s[m] : (s[m-1]+s[m])/2; };
  // trials: [{p: 0..1, y: 0|0.5|1}]
  function brier(trials){
    const t = trials.filter(x => typeof x.p==="number" && typeof x.y==="number");
    if (!t.length) return null;
    const ybar = mean(t.map(x=>x.y));
    const b = mean(t.map(x=>(x.p-x.y)**2));
    const b0 = mean(t.map(x=>(ybar-x.y)**2));
    return { n:t.length, brier:b, baseline:b0, skill: b0>0 ? 1-b/b0 : null, ybar };
  }
  function calibration(trials){
    const bins = [[0,0.35,"Low (≤30%)"],[0.35,0.65,"Middle (40–60%)"],[0.65,1.01,"High (≥70%)"]];
    return bins.map(([lo,hi,label]) => {
      const g = trials.filter(x => typeof x.p==="number" && x.p>=lo && x.p<hi);
      return { label, n:g.length, pred:g.length?mean(g.map(x=>x.p)):null, actual:g.length?mean(g.map(x=>x.y)):null };
    });
  }
  // ys in [0,1]; partial outcomes count fractionally
  function betaPost(ys){
    const s = ys.reduce((a,y)=>a+y,0), f = ys.length - s;
    const a = 1+s, b = 1+f, m = a/(a+b);
    const sd = Math.sqrt(a*b/((a+b)**2*(a+b+1)));
    return { a, b, mean:m, sd, lo:Math.max(0,m-1.2816*sd), hi:Math.min(1,m+1.2816*sd), n:ys.length, succ:s };
  }
  // rows: [{x:[...], y:0..1}] ; L2-penalised logistic regression on standardized predictors
  function logistic(rows, opt={}){
    const iters = opt.iters||3000, lr = opt.lr||0.2, lambda = opt.lambda==null ? 0.02 : opt.lambda;
    const n = rows.length; if (!n) return null; const k = rows[0].x.length;
    const mu = [], sd = [];
    for (let j=0;j<k;j++){ const col = rows.map(r=>r.x[j]); const m = mean(col); mu.push(m); sd.push(Math.sqrt(mean(col.map(c=>(c-m)**2)))); }
    const ok = sd.map(s => s > 1e-9);
    const Z = rows.map(r => r.x.map((v,j) => ok[j] ? (v-mu[j])/sd[j] : 0));
    const b = new Array(k+1).fill(0);
    for (let it=0; it<iters; it++){
      const g = new Array(k+1).fill(0);
      for (let i=0;i<n;i++){
        let z = b[0]; for (let j=0;j<k;j++) z += b[j+1]*Z[i][j];
        const e = 1/(1+Math.exp(-z)) - rows[i].y;
        g[0] += e; for (let j=0;j<k;j++) g[j+1] += e*Z[i][j];
      }
      for (let j=0;j<=k;j++) b[j] -= lr*(g[j]/n + (j>0 ? lambda*b[j] : 0));
    }
    return { b, mu, sd, ok, n };
  }
  // Stochastic multicriteria acceptability analysis
  function smaa(options, criteria, scores, opt={}){
    const N = opt.N||4000, rough = !!opt.rough, rng = opt.rng||Math.random;
    const O = options.length, C = criteria.length;
    if (!O || !C) return null;
    const wins = new Array(O).fill(0), rank = options.map(()=>new Array(O).fill(0)), samples = [];
    for (let s=0;s<N;s++){
      const w = criteria.map(c => { const lo=Math.min(c.lo,c.hi), hi=Math.max(c.lo,c.hi); return lo + rng()*(hi-lo); });
      const tot = w.reduce((a,x)=>a+x,0); if (tot <= 0) continue;
      const wn = w.map(x=>x/tot);
      const sc = options.map((_,o) => criteria.reduce((a,_c,c) => a + wn[c]*((+scores[o][c]||0) + (rough ? rng()*2-1 : 0)), 0));
      const order = sc.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
      wins[order[0]]++; order.forEach((o,r) => rank[o][r]++);
      samples.push({ wn, win:order[0] });
    }
    const used = samples.length; if (!used) return null;
    const winPct = wins.map(x=>x/used);
    const winner = winPct.indexOf(Math.max(...winPct));
    let pivot = null;
    if (winPct[winner] < 0.999){
      let best = 0;
      for (let c=0;c<C;c++){
        const a = samples.filter(s=>s.win===winner).map(s=>s.wn[c]);
        const b = samples.filter(s=>s.win!==winner).map(s=>s.wn[c]);
        if (!a.length || !b.length) continue;
        const d = mean(a) - mean(b);
        if (Math.abs(d) > Math.abs(best)) { best = d; pivot = { criterion:c, diff:d }; }
      }
    }
    const mid = criteria.map(c => (c.lo+c.hi)/2), mt = mid.reduce((a,x)=>a+x,0) || 1;
    const midScore = options.map((_,o) => criteria.reduce((a,_c,c) => a + (mid[c]/mt)*(+scores[o][c]||0), 0));
    return { used, winPct, rankPct:rank.map(r=>r.map(x=>x/used)), winner, pivot, midScore };
  }
  function pearson(x, y){
    const n = Math.min(x.length, y.length); if (n < 2) return NaN;
    const mx = mean(x.slice(0,n)), my = mean(y.slice(0,n));
    let sxy = 0, sxx = 0, syy = 0;
    for (let i=0;i<n;i++){ const dx = x[i]-mx, dy = y[i]-my; sxy += dx*dy; sxx += dx*dx; syy += dy*dy; }
    return (sxx > 0 && syy > 0) ? sxy/Math.sqrt(sxx*syy) : NaN;
  }
  return { mean, median, brier, calibration, betaPost, logistic, smaa, pearson };
})();
if (typeof module === "object" && module.exports) module.exports = AMMath; else root.AMMath = AMMath;
})(typeof window !== "undefined" ? window : globalThis);
