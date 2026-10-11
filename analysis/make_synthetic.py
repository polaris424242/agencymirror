"""Generate SYNTHETIC Agency Mirror exports for testing the analysis.

These numbers are invented with known effects built in. Never report them as results.

    python analysis/make_synthetic.py --out analysis/sample_data
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

# Built-in truths the analysis should roughly recover
START_RATE = {"socratic": 0.60, "directive": 0.65, "note": 0.45}
AUTONOMY = {"socratic": 5.6, "directive": 4.6, "note": 5.0}
REVEAL_RATE = 0.25


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="analysis/sample_data")
    ap.add_argument("--participants", type=int, default=6)
    ap.add_argument("--episodes", type=int, default=30, help="per participant")
    ap.add_argument("--seed", type=int, default=2026)
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for i in range(1, a.participants + 1):
        pid = f"SYN{i:02d}"
        shift = rng.normal(0, 0.08)  # people differ in baseline follow-through
        conds = np.tile(["socratic", "directive", "note"], a.episodes // 3 + 1)[: a.episodes]
        rng.shuffle(conds)
        ep = []
        for j, c in enumerate(conds):
            started = int(rng.random() < np.clip(START_RATE[c] + shift, 0.02, 0.98))
            ep.append({
                "participant": pid, "id": f"{pid}-e{j}", "at": f"2026-11-{1 + j % 28:02d}T10:00:00Z",
                "condition": c, "obstacle": rng.choice(["unclear", "toobig", "boring", "fear"]),
                "intention": "synthetic task", "text": "", "turns": int(rng.integers(0, 4)) if c == "socratic" else 0,
                "revealed": bool(c == "socratic" and rng.random() < REVEAL_RATE), "revealedAtTurn": "",
                "aiUsed": False, "plan": "", "started": started,
                "autonomy": int(np.clip(round(rng.normal(AUTONOMY[c], 1.1)), 1, 7)),
                "helpful": int(np.clip(round(rng.normal(4.5, 1.3)), 1, 7)),
            })
        pd.DataFrame(ep).to_csv(out / f"SYNTHETIC-episodes-{pid}.csv", index=False)
        it = []
        for k in range(40):
            p = rng.choice([0.3, 0.5, 0.7, 0.8, 0.9])
            truth = np.clip(p - 0.15 + shift, 0.02, 0.98)  # built-in overconfidence of about 15 points
            y = float(rng.random() < truth)
            it.append({"participant": pid, "id": f"{pid}-i{k}", "title": "synthetic", "kind": "study",
                       "day": "2026-11-01", "predicted": p, "outcome": y, "importance": int(rng.integers(1, 6)),
                       "interest": int(rng.integers(1, 6)), "plannedMin": 30, "actualMin": "", "predFeel": 1,
                       "actualFeel": "", "commitment": "", "finalStatus": "done" if y else "dropped"})
        pd.DataFrame(it).to_csv(out / f"SYNTHETIC-intentions-{pid}.csv", index=False)
    print(f"Wrote synthetic data for {a.participants} participants to {out}")


if __name__ == "__main__":
    main()
