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
    items: [
      "I delay making decision until it’s too late.",
      "Even after I make a decision I delay acting upon it.",
      "I waste a lot of time on trivial matters before getting to the final decisions.",
      "In preparation for some deadlines, I often waste time by doing other things.",
      "Even jobs that require little else except sitting down and doing them, I find that they seldom get done for days.",
      "I often find myself performing tasks that I had intended to do days before",
      "I am continually saying “I’ll do it tomorrow.”",
      "I generally delay before starting on work I have to do.",
      "I find myself running out of time.",
      "I don’t get things done on time.",
      "I am not very good at meeting deadlines.",
      "Putting things off till the last minute has cost me money in the past."
    ],
    reversed: []
  },
  {
    id: "iaf",
    name: "Index of Autonomous Functioning (IAF)",
    nItems: 15,
    max: 5,
    when: "Baseline and end of study",
    cite: "Weinstein, Przybylski & Ryan (2012), Journal of Research in Personality 46, 397-413. Used under the Center for Self-Determination Theory's terms for academic use. Three subscales of five items; the total averages authorship, interest-taking and reversed susceptibility to control, so higher means more autonomous. Item-to-subscale mapping follows item content; check it against the scoring key in the CSDT download.",
    url: "https://selfdeterminationtheory.org/index-of-autonomous-functioning/",
    low: "not at all true", high: "completely true",
    items: [
      "My decisions represent my most important values and feelings.",
      "I do things in order to avoid feeling badly about myself.",
      "I often reflect on why I react the way I do.",
      "I strongly identify with the things that I do.",
      "I am deeply curious when I react with fear or anxiety to events in my life.",
      "I do a lot of things to avoid feeling ashamed.",
      "I try to manipulate myself into doing certain things.",
      "My actions are congruent with who I really am.",
      "I am interested in understanding the reasons for my actions.",
      "My whole self stands behind the important decisions I make.",
      "I believe certain things so that others will like me.",
      "I am interested in why I act the way I do.",
      "I like to investigate my feelings.",
      "I often pressure myself.",
      "My decisions are steadily informed by things I want or care about."
    ],
    reversed: [],
    subscales: [
      { name: "Authorship / self-congruence", items: [1, 4, 8, 10, 15] },
      { name: "Interest-taking", items: [3, 5, 9, 12, 13] },
      { name: "Susceptibility to control", items: [2, 6, 7, 11, 14], reverse: true }
    ]
  }
];
