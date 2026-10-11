# Agency Mirror

**An open research instrument for the gap between what people intend and what they do.**

People usually know what they mean to do far better than they do it. AI coaches are increasingly offered as the fix, and most of them hand out answers. Agency Mirror tests a different idea. When you stall, does being *asked questions* help you start as often as being *told what to do*, while leaving the decision feeling like yours? And how often do people give up on the questions and ask to be told?

**[Try the live app](https://polaris424242.github.io/agencymirror/)**. It runs entirely in your browser, with no account, and nothing leaves your device unless you export it.

## What it does

| Part | What you do | What it measures |
| --- | --- | --- |
| **Today** | Add intentions with a forecast: chance of doing it today, minutes, expected feeling. Close each one honestly. | Calibration (Brier score), planning ratio, affective-forecasting error |
| **I'm stuck** | Name what's in the way. Get a randomly assigned response: questions, direct advice, or a plain note. | Start within 30 min (primary), sense of ownership, helpfulness, dependence |
| **Check-ins** | Mood and energy sliders, a precise feeling word, an optional metaphor | Emotional granularity, mood and agency over time |
| **Patterns** | Read your own data | Stated vs revealed drivers of follow-through (logistic regression), track record per kind of task (Beta–Bernoulli) |
| **Decide** | One-off decisions: objectives, weight *ranges*, ratings, your gut call | Win rates across 4,000 weightings (SMAA), the pivotal objective, gut vs model |
| **Questionnaires** | Built-in library (Irrational and Pure Procrastination Scales, Index of Autonomous Functioning) plus your own; paste items once, take at baseline, weekly and at the end | Mean scores with reverse-scoring |
| **Skin (optional)** | Daily worst itch, itch-disturbed sleep, flares, medication changes | Same-day and next-day correlation of mood with itch (single-person sub-study) |
| **Commitments** | Optional pledge, partner or stake; release takes 24 hours | Follow-through with and without commitment, and whether reliance on commitments falls |

Every statistic has a "The math, step by step" panel in the app.

## The experiment

Within-person randomized design with three arms and balanced assignment (the least-used response, ties broken at random). The full design, outcomes and analysis plan are in **[PROTOCOL.md](PROTOCOL.md)**, preregistered at **[OSF link]**.

## Pilot results

*Pending. Data collection runs [dates].* For what the output will look like, see the **[example built on synthetic data](analysis/example_output/results.md)**. Those numbers are invented and are not results.

## Repository layout

```
docs/                 the app (served by GitHub Pages)
  index.html          interface and logic
  am-math.js          the statistics, kept separate and tested
tests/                unit tests for the statistics (node --test)
analysis/
  analyze.py          reads participants' CSV exports, writes figures + results.md
  make_synthetic.py   generates labelled synthetic data for testing
  example_output/     what analyze.py produces (synthetic)
PROTOCOL.md           preregistered design and analysis plan
```

## Run it yourself

```bash
# the app: open docs/index.html in a browser, or serve it
python -m http.server --directory docs 8000

# tests for the statistics
node --test

# analysis
pip install -r analysis/requirements.txt
python analysis/analyze.py --episodes "data/*episodes*.csv" --intentions "data/*intentions*.csv" --out analysis/output
```

## For pilot participants

1. Open the app, enter the pseudonym you were given, and read the consent screen.
2. Use it for 3–4 weeks: add 1–3 intentions a day, press **I'm stuck** whenever you stall, and answer the 30-minute follow-up.
3. At the end, open **Study** and export the episodes and intentions CSVs. Send them only if you choose to.

## Roadmap

- **Version 2.** An optional live AI coach, kept separate from the scripted arms so the experiment stays clean.
- **Physiology.** Heart rate and heart-rate variability from a wearable export or a simple PPG sensor, to compare self-reported energy with physiological arousal.
- **Feed Compass.** Audit and curate your own information diet.

## Background

This builds on work on how AI can augment or diminish human decision-making and critical thinking, on affective forecasting (Gilbert & Wilson), the planning fallacy (Buehler, Griffin & Ross), emotional granularity (Barrett), value-focused thinking (Keeney), multicriteria acceptability analysis (Lahdelma) and commitment devices (Bryan, Karlan & Nelson).

## Author

Dhruve Dahiya · biomedical engineering · [Substack](https://apolaris.substack.com)

Released under the MIT licence. If you use it, please cite it (see `CITATION.cff`).
