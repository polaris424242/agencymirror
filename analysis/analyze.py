"""Analyse Agency Mirror exports.

Reads the CSV files participants export from the app and writes figures plus a
plain-language results summary.

    python analysis/analyze.py --episodes "data/*episodes*.csv" \
                               --intentions "data/*intentions*.csv" \
                               --out analysis/output

Primary outcome: did the person start within 30 minutes of asking for help
(yes/no), compared across the three randomly assigned responses. The analysis
follows PROTOCOL.md; any deviation should be logged there.
"""
from __future__ import annotations

import argparse
import glob
import math
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
import statsmodels.api as sm  # noqa: E402
import statsmodels.formula.api as smf  # noqa: E402

CONDITIONS = ["socratic", "directive", "note"]
LABELS = {"socratic": "Questions only", "directive": "Direct advice", "note": "Plain note"}
COLORS = {"socratic": "#5b2a52", "directive": "#2c5f7c", "note": "#7a7f6b"}


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a proportion; well-behaved at small n and at 0% or 100%."""
    if n == 0:
        return (float("nan"), float("nan"))
    p = k / n
    denom = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denom
    half = z * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2)) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def mean_ci(x: pd.Series) -> tuple[float, float, float]:
    """Mean with a t-based 95% interval."""
    x = x.dropna().astype(float)
    n = len(x)
    if n == 0:
        return (float("nan"),) * 3
    m = x.mean()
    if n < 2:
        return (m, float("nan"), float("nan"))
    from scipy import stats  # statsmodels depends on scipy

    h = stats.t.ppf(0.975, n - 1) * x.std(ddof=1) / math.sqrt(n)
    return (m, m - h, m + h)


def read_many(pattern: str | None) -> pd.DataFrame:
    if not pattern:
        return pd.DataFrame()
    files = sorted(set(sum((glob.glob(p) for p in pattern.split(",")), [])))
    if not files:
        return pd.DataFrame()
    return pd.concat([pd.read_csv(f) for f in files], ignore_index=True)


def to_bool(s: pd.Series) -> pd.Series:
    return s.astype(str).str.lower().isin(["true", "1", "yes"])


def analyse_episodes(ep: pd.DataFrame, out: Path, lines: list[str]) -> None:
    ep = ep.copy()
    ep["participant"] = ep["participant"].astype(str)
    total = len(ep)
    ep = ep[ep["started"].notna() & (ep["started"].astype(str) != "")]
    ep["started"] = ep["started"].astype(float).astype(int)
    answered = len(ep)
    people = ep["participant"].nunique()
    lines += [
        "## Primary outcome: started within 30 minutes",
        "",
        f"{answered} of {total} stuck episodes have an answered follow-up, from {people} participant(s). "
        "Episodes without an answer are excluded (see PROTOCOL.md).",
        "",
        "| Response | Episodes | Started | Rate | 95% CI (Wilson) | Felt like my decision (1–7) | Helpful (1–7) |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    rows = []
    for c in CONDITIONS:
        g = ep[ep["condition"] == c]
        n, k = len(g), int(g["started"].sum())
        lo, hi = wilson(k, n)
        am, alo, ahi = mean_ci(g["autonomy"])
        hm, _, _ = mean_ci(g["helpful"])
        rows.append((c, n, k, lo, hi))
        rate = f"{k / n:.0%}" if n else "–"
        ci = f"{lo:.0%}–{hi:.0%}" if n else "–"
        aut = f"{am:.1f} ({alo:.1f}–{ahi:.1f})" if n > 1 else (f"{am:.1f}" if n else "–")
        hel = f"{hm:.1f}" if n else "–"
        lines.append(f"| {LABELS[c]} | {n} | {k} | {rate} | {ci} | {aut} | {hel} |")
    lines.append("")

    # Figure: start rate by condition with Wilson intervals
    fig, ax = plt.subplots(figsize=(6, 3.4), dpi=150)
    for i, (c, n, k, lo, hi) in enumerate(rows):
        if n == 0:
            continue
        p = k / n
        ax.bar(i, p, color=COLORS[c], width=0.6)
        ax.errorbar(i, p, yerr=[[p - lo], [hi - p]], color="#1b2230", capsize=5, lw=1.2)
        ax.text(i, min(hi + 0.04, 1.02), f"n={n}", ha="center", fontsize=8, color="#5d6672")
    ax.set_xticks(range(3), [LABELS[c] for c in CONDITIONS])
    ax.set_ylim(0, 1.1)
    ax.set_ylabel("Started within 30 min")
    ax.yaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(1.0))
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_title("Start rate by randomly assigned response (95% Wilson CI)", fontsize=9, loc="left")
    fig.tight_layout()
    fig.savefig(out / "start_rate_by_condition.png")
    plt.close(fig)
    lines += ["![Start rate by condition](start_rate_by_condition.png)", ""]

    # Model: odds of starting relative to the plain-note control
    counts = ep["condition"].value_counts()
    if all(counts.get(c, 0) >= 5 for c in CONDITIONS) and ep["started"].nunique() == 2:
        formula = "started ~ C(condition, Treatment('note'))"
        if people >= 2:
            model = smf.gee(formula, groups="participant", data=ep, family=sm.families.Binomial(),
                            cov_struct=sm.cov_struct.Exchangeable())
            label = "GEE logistic model, exchangeable correlation within participant"
        else:
            model = smf.glm(formula, data=ep, family=sm.families.Binomial())
            label = "logistic model (one participant, so no between-person term)"
        res = model.fit()
        ci = res.conf_int()
        lines += [f"**Model.** {label}. Odds ratios relative to the plain note:", "",
                  "| Response | Odds ratio | 95% CI | p |", "| --- | --- | --- | --- |"]
        for name in res.params.index:
            if name == "Intercept":
                continue
            c = name.split("T.")[-1].rstrip("]")
            lines.append(f"| {LABELS.get(c, c)} | {math.exp(res.params[name]):.2f} | "
                         f"{math.exp(ci.loc[name, 0]):.2f}–{math.exp(ci.loc[name, 1]):.2f} | {res.pvalues[name]:.3f} |")
        lines += ["", "With pilot-sized samples these intervals will be wide. Report them as estimates of effect "
                  "size and uncertainty, not as tests that pass or fail.", ""]
    else:
        lines += ["**Model.** Not fitted: it needs at least 5 answered episodes in every condition "
                  "and both outcomes present.", ""]

    # Dependence: asking to be told during Socratic episodes
    soc = ep[ep["condition"] == "socratic"]
    if len(soc):
        r = to_bool(soc["revealed"]).sum()
        lo, hi = wilson(int(r), len(soc))
        lines += ["## Dependence", "",
                  f"In {r} of {len(soc)} Socratic episodes ({r / len(soc):.0%}, 95% CI {lo:.0%}–{hi:.0%}) "
                  "the person pressed \"Just tell me what to do\".", ""]


def analyse_intentions(it: pd.DataFrame, out: Path, lines: list[str]) -> None:
    t = it.dropna(subset=["predicted", "outcome"]).copy()
    if t.empty:
        return
    t["predicted"] = t["predicted"].astype(float)
    t["outcome"] = t["outcome"].astype(float)
    brier = float(((t["predicted"] - t["outcome"]) ** 2).mean())
    ybar = float(t["outcome"].mean())
    base = float(((ybar - t["outcome"]) ** 2).mean())
    skill = 1 - brier / base if base > 0 else float("nan")
    lines += ["## Self-prediction", "",
              f"{len(t)} forecasts. Brier score {brier:.3f} (0 is perfect). Baseline from always predicting "
              f"the overall rate ({ybar:.0%}): {base:.3f}. Skill {skill:+.2f} (above 0 means the individual "
              "forecasts carry information).", ""]
    bins = pd.cut(t["predicted"], [0, 0.35, 0.65, 1.0], labels=["≤30%", "40–60%", "≥70%"], include_lowest=True)
    cal = t.groupby(bins, observed=False).agg(n=("outcome", "size"), predicted=("predicted", "mean"),
                                              actual=("outcome", "mean"))
    lines += ["| Forecast | Trials | Mean forecast | What happened |", "| --- | --- | --- | --- |"]
    for k, r in cal.iterrows():
        if r["n"]:
            lines.append(f"| {k} | {int(r['n'])} | {r['predicted']:.0%} | {r['actual']:.0%} |")
    lines.append("")

    fig, ax = plt.subplots(figsize=(3.6, 3.6), dpi=150)
    ax.plot([0, 1], [0, 1], color="#cfd4cc", lw=1, label="perfect calibration")
    g = cal[cal["n"] > 0]
    ax.scatter(g["predicted"], g["actual"], s=20 + 6 * g["n"], color="#5b2a52", zorder=3)
    for _, r in g.iterrows():
        ax.annotate(f"n={int(r['n'])}", (r["predicted"], r["actual"]), textcoords="offset points",
                    xytext=(6, -10), fontsize=7, color="#5d6672")
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xlabel("Forecast chance of doing it")
    ax.set_ylabel("Share actually done")
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(frameon=False, fontsize=7, loc="upper left")
    fig.tight_layout()
    fig.savefig(out / "calibration.png")
    plt.close(fig)
    lines += ["![Calibration](calibration.png)", ""]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--episodes", help="glob for episode CSVs (comma-separate several)")
    ap.add_argument("--intentions", help="glob for intention CSVs (comma-separate several)")
    ap.add_argument("--out", default="analysis/output", help="folder for figures and results.md")
    ap.add_argument("--title", default="Agency Mirror pilot results")
    a = ap.parse_args(argv)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    ep, it = read_many(a.episodes), read_many(a.intentions)
    if ep.empty and it.empty:
        print("No input files matched. Pass --episodes and/or --intentions.", file=sys.stderr)
        return 1
    lines = [f"# {a.title}", "", "Generated by `analysis/analyze.py`. Edit the interpretation, not the numbers.", ""]
    if not ep.empty:
        analyse_episodes(ep, out, lines)
    if not it.empty:
        analyse_intentions(it, out, lines)
    (out / "results.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out / 'results.md'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
