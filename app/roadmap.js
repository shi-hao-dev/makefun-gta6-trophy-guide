// The platinum roadmap: four steps built from the official trophy descriptions and
// PowerPyx's published roadmap (difficulty 4/10, about 200 hours, one playthrough,
// no mission replay, free roam after the story). Each step names the trophies it
// covers so the checklist below can point back at it.
export const ROADMAP_STEPS = [
  {
    step: 1,
    title: 'Play the story, all five chapters',
    hours: '60–80 hours',
    text: 'Follow the story from Gone Fishing to the final mission. Every chapter trophy and every named-mission trophy unlocks on its own, so there is nothing to hunt here — just play. Take optional missions as they appear, scan vehicles and study animals as you go, and answer Cal\u2019s fishing text in Chapter 1.',
    trophies: 'Just Like Paradise, the four chapter trophies, the final mission, Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked, Snow Storm, Baited My Tackle',
  },
  {
    step: 2,
    title: 'The 100% completion checklist',
    hours: 'about 100 hours',
    text: 'After the credits the checklist opens under Progress, then Stats, then 100% Completion — but everything you did during the story already counts. The thresholds are lenient, closer to 60% of true completion: 200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges, 300 of 397 stunts. Robberies, gang operations and the shooting ranges are the only parts that need everything.',
    trophies: 'A Long Road, Cunning Stunts, The Shootist, Top Fun, Earn Cash, Not Kudos, One Last Thing, Whip It Good, Maximum Withdrawal, The Goodtime State, Pest Control',
  },
  {
    step: 3,
    title: 'Strangers & Freaks, side characters and cleanup',
    hours: 'about 10 hours',
    text: 'Finish the 8 stranger strands that count, the final missions for Andy, Kenton, Billy, Randy and Tyrone, Bret\u2019s hunting quests, and the miscellaneous trophies: meditation spots, WAiNK photos, card sets, garages, Scooter Bros registrations, money totals and the odd one-off moments.',
    trophies: 'Strangers & Freaks, the five side-character finales, Fair Game, Don\u2019t Touch My Deck, You WAiNKer!, Little Boxes, On the Spot, Dime on the Dollar, Treat Yo Self, and the rest',
  },
  {
    step: 4,
    title: 'Platinum',
    hours: 'when the last trophy pops',
    text: 'Vice Got a Price! unlocks the moment the other 54 are yours. In practice A Long Road is the last gate for most hunters, because the 100% checklist is the longest single job on the list.',
    trophies: 'Vice Got a Price!',
  },
];

// The one missable trophy, in the guide's own words, from PowerPyx's warning.
export const MISSABLE_NOTE =
  'Positive Mental Attitude is the only trophy PowerPyx flags as potentially missable: ' +
  'the first meditation spot is offered at Jason\u2019s house in Chapter 1 and is gone after ' +
  'that chapter, and it is not yet confirmed whether the trophy needs it. Do it anyway to be ' +
  'safe. Everything else — story trophies included — can be finished in free roam after the story.';

export function renderRoadmap(container, earnedNames, trophyByName) {
  const list = document.createElement('ol');
  list.className = 'roadmap-steps';
  for (const step of ROADMAP_STEPS) {
    const item = document.createElement('li');
    item.className = 'roadmap-step';
    const names = step.trophies.split(',').map((s) => s.trim());
    const stepTrophies = names
      .map((n) => trophyByName.get(n))
      .filter(Boolean);
    const done = stepTrophies.length > 0 && stepTrophies.every((t) => earnedNames.has(t.name));
    if (done) item.classList.add('done');
    const num = document.createElement('div');
    num.className = 'roadmap-num';
    num.textContent = done ? '✓' : String(step.step);
    const body = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = step.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = step.hours;
    title.append(hours);
    const text = document.createElement('p');
    text.textContent = step.text;
    const covers = document.createElement('p');
    covers.className = 'step-trophies';
    covers.textContent = 'Covers: ' + step.trophies;
    body.append(title, text, covers);
    item.append(num, body);
    list.append(item);
  }
  container.replaceChildren(list);
}
