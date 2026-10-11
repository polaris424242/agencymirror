# Protocol: Agency Mirror pilot

Version 1.0 · written before data collection. Post a frozen copy to OSF as a preregistration and record any later change in the deviations log at the end.

## Question

When someone stalls on a task they chose themselves, does being asked questions (Socratic) help them start as often as being told what to do (directive), while leaving them feeling the decision was their own? And how often do people abandon the questions and ask to be told?

## Design

Within-person randomized trial. Every time a participant presses **Help me start**, the app assigns one of three responses:

| Code | Name | What the participant sees |
| --- | --- | --- |
| `socratic` | Questions only | One or two questions at a time, up to three rounds, with a "Just tell me what to do" button |
| `directive` | Direct advice | One concrete first action for the next 10 minutes |
| `note` | Plain note | "Noted. Decide your next step yourself, write it below, and go." (control) |

**Assignment rule.** The app picks the response the participant has received least often so far and breaks ties uniformly at random. This keeps the three groups balanced within each person even with few episodes. Participants can see which response they received (not blinded).

**Wording.** The public version uses a fixed script for the Socratic and directive responses, written per obstacle (see `docs/index.html`, `FALLBACK_Q` and `FALLBACK_ADVICE`). Every participant therefore gets identical wording, so differences between conditions cannot come from a model improvising.

## Participants

Adults who want help following through on self-chosen tasks, recruited informally (pilot). Exclusions: anyone in crisis or receiving acute psychiatric care, and anyone under 18. Target 5–10 participants for 3–4 weeks.

## Outcomes

- **Primary:** started the task within 30 minutes (yes/no), asked 30 minutes after the episode.
- **Secondary:** "What I did next was my own decision" (1–7) and "That response helped" (1–7).
- **Dependence:** in Socratic episodes, whether the participant pressed "Just tell me what to do".
- **Descriptive (not randomized):** forecast calibration (Brier score), planning ratio, feeling error, and stated versus revealed drivers of follow-through.

## Sample size

This is a pilot whose purpose is estimation, not testing. Aim for at least 10–15 answered episodes per condition per participant. The results report effect sizes with 95% intervals and do not claim significance.

## Analysis plan

1. Start rate per condition with Wilson 95% intervals.
2. Logistic GEE with an exchangeable working correlation within participant, condition as predictor, and the plain note as reference. This is a plain logistic model if only one participant contributes data. Report odds ratios with 95% CIs.
3. Autonomy and helpfulness: means with t-based 95% CIs per condition.
4. Dependence: proportion of Socratic episodes with a reveal, with a Wilson interval.
5. Missing follow-ups are excluded and their number is reported by condition. If one condition has noticeably more missing follow-ups, say so.

All steps are implemented in `analysis/analyze.py`.

## Ethics and safety

- Participants read a consent screen before use. Data stays in their own browser unless they export and send it.
- Exports carry a self-chosen pseudonym, not a name.
- The app is not therapy. The consent screen points to crisis support, and the scripted coach never comments on mental health.
- This is an informal pilot. Before any publication, seek review from an institutional ethics committee.

## Deviations log

| Date | Change | Reason |
| --- | --- | --- |
| | | |
