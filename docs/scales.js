/* Agency Mirror questionnaire library.
 *
 * To set a questionnaire up for every participant, paste its items into `items`
 * (one string per item, in the published order) and list the reverse-scored item
 * numbers in `reversed`. Until then, the app lets a person paste the items
 * themselves, and "Copy setup" in the app produces exactly this shape.
 *
 * Check each source's licence before publishing items in a public repository.
 */
window.AM_SCALES = [
  {
    id: "ips",
    name: "Irrational Procrastination Scale (IPS)",
    nItems: 9,
    max: 5,
    when: "Baseline, then weekly",
    cite: "Steel (2010). Items as reprinted in Svartdal & Steel (2017), Frontiers in Psychology 8:1927, Table 1 (open access, CC BY).",
    url: "https://www.frontiersin.org/articles/10.3389/fpsyg.2017.01927/pdf",
    low: "", high: "",
    items: [
      "I put things off so long that my well-being or efficiency unnecessarily suffers",
      "If there is something I should do, I get to it before attending to lesser tasks",
      "My life would be better if I did some activities or tasks earlier",
      "When I should be doing one thing, I will do another",
      "At the end of the day, I know I could have spent the time better",
      "I spend my time wisely",
      "I delay tasks beyond what is reasonable",
      "I procrastinate",
      "I do everything when I believe it needs to be done"
    ],
    reversed: [2, 6, 9]
  },
  {
    id: "pps",
    name: "Pure Procrastination Scale (PPS)",
    nItems: 12,
    max: 5,
    when: "Baseline and end of study",
    cite: "Steel (2010). Items as reprinted in Svartdal & Steel (2017), Frontiers in Psychology 8:1927, Table 1 (open access, CC BY).",
    url: "https://www.frontiersin.org/articles/10.3389/fpsyg.2017.01927/pdf",
    low: "", high: "",
    items: [],
    reversed: []
  },
  {
    id: "iaf",
    name: "Index of Autonomous Functioning (IAF)",
    nItems: null,
    max: 5,
    when: "Baseline and end of study",
    cite: "Weinstein, Przybylski & Ryan (2012), Journal of Research in Personality. Free for academic use under the Center for Self-Determination Theory's terms. Check those terms before publishing the items publicly.",
    url: "https://selfdeterminationtheory.org/index-of-autonomous-functioning/",
    low: "", high: "",
    items: [],
    reversed: []
  }
];
