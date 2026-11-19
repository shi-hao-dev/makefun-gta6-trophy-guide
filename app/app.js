// Leonida Trophy Guide: checklist, filters, spoiler mode and export/import.
// All progress lives in localStorage under one key; nothing leaves the browser
// except the file the reader chooses to export. The app fetches only its own
// data file, app/data/trophies.json, and makes no network request at run time.
import { ROADMAP_STEPS, MISSABLE_NOTE, renderRoadmap } from './roadmap.js';

const EARNED_KEY = 'leonida-trophy-guide-earned-v1';
const SETTINGS_KEY = 'leonida-trophy-guide-settings-v1';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  online: 'Online',
};

const state = {
  trophies: [],
  byName: new Map(),
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  search: '',
  spoiler: false,
  earnedOnly: false,
  sort: 'list',
};

const $ = (id) => document.getElementById(id);

function loadStored() {
  try {
    state.earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
  } catch {
    state.earned = new Set();
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
    if (typeof saved.earnedOnly === 'boolean') state.earnedOnly = saved.earnedOnly;
    if (typeof saved.kind === 'string' && saved.kind in KIND_LABELS) state.kind = saved.kind;
    if (typeof saved.grade === 'string') state.grade = saved.grade;
    if (typeof saved.sort === 'string') state.sort = saved.sort;
  } catch {
    // A corrupt settings blob just means defaults; progress is kept separately.
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...state.earned]));
}

function saveSettings() {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      spoiler: state.spoiler,
      earnedOnly: state.earnedOnly,
      kind: state.kind,
      grade: state.grade,
      sort: state.sort,
    }),
  );
}

function trophyMatches(t) {
  if (state.kind === 'missable' && !t.missable) return false;
  if (state.kind === 'online') return false; // No online trophies: the list is all single-player.
  if (state.kind !== 'all' && state.kind !== 'missable' && !t.kinds.includes(state.kind)) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.earnedOnly && !state.earned.has(t.name)) return false;
  if (state.search) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(state.search)) return false;
  }
  return true;
}

function sortedTrophies(list) {
  const copy = [...list];
  if (state.sort === 'grade') {
    copy.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  } else if (state.sort === 'roadmap') {
    copy.sort((a, b) => a.stage - b.stage || a.id - b.id);
  } else {
    copy.sort((a, b) => a.id - b.id);
  }
  return copy;
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function buildCard(t) {
  const isEarned = state.earned.has(t.name);
  const hiddenBySpoiler = state.spoiler && t.kinds.includes('story') && !isEarned;
  const article = document.createElement('article');
  article.className = 'trophy' + (isEarned ? ' earned' : '');
  article.id = `trophy-${t.id}`;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const checkWrap = document.createElement('label');
  checkWrap.className = 'trophy-check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.name);
    else state.earned.delete(t.name);
    saveEarned();
    render();
  });
  checkWrap.append(box);

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = hiddenBySpoiler ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hiddenBySpoiler
    ? 'A story trophy, hidden until earned.'
    : t.description;

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${t.grade}`;
  gradeTag.textContent = gradeWord(t.grade);
  tags.append(gradeTag);
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden on PS5';
    tags.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = '⚠ Missable';
    tags.append(missTag);
  }
  for (const kind of t.kinds) {
    if (kind === 'missable') continue;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = KIND_LABELS[kind] ?? kind;
    tags.append(tag);
  }
  const stageTag = document.createElement('span');
  stageTag.className = 'tag stage-tag';
  stageTag.textContent = `Roadmap step ${t.stage}`;
  tags.append(stageTag);
  if (t.count != null) {
    const countTag = document.createElement('span');
    countTag.className = 'tag';
    countTag.textContent = `Count: ${t.count.toLocaleString('en-US')}`;
    tags.append(countTag);
  }

  main.append(name, desc, tags);

  if (hiddenBySpoiler) {
    const spoilerBox = document.createElement('p');
    spoilerBox.className = 'spoiler-box';
    spoilerBox.textContent =
      'Spoiler hiding is on: this story trophy stays hidden until you earn it — ' +
      'tick it off, or turn spoiler hiding off above.';
    main.append(spoilerBox);
  } else {
    const details = document.createElement('details');
    details.className = 'trophy-guide';
    const summary = document.createElement('summary');
    summary.textContent = 'How to get it';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    details.append(summary, guide);
    if (t.sources && t.sources.length > 0) {
      const sources = document.createElement('p');
      sources.className = 'trophy-sources';
      sources.textContent = 'Sources: ';
      t.sources.forEach((source, i) => {
        if (i > 0) sources.append(document.createTextNode(' · '));
        if (source.url) {
          const link = document.createElement('a');
          link.href = source.url;
          link.textContent = source.name;
          link.target = '_blank';
          link.rel = 'noopener';
          sources.append(link);
        } else {
          sources.append(document.createTextNode(source.name));
        }
      });
      details.append(sources);
    }
    main.append(details);
  }

  head.append(checkWrap, main);
  article.append(head);
  return article;
}

function renderFacts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of state.trophies) counts[t.grade] += 1;
  const facts = $('facts');
  facts.replaceChildren();
  const items = [
    ['55', 'trophies'],
    [`${counts.platinum} platinum`, '· ' + `${counts.gold} gold`],
    [`${counts.silver} silver`, '· ' + `${counts.bronze} bronze`],
    ['28 hidden', 'until earned'],
    ['0 online', 'all single-player'],
    ['~200 hours', 'to platinum'],
  ];
  for (const [strong, rest] of items) {
    const span = document.createElement('span');
    span.className = 'fact';
    const b = document.createElement('strong');
    b.textContent = strong;
    span.append(b, document.createTextNode(' ' + rest));
    facts.append(span);
  }
}

function renderKindFilters() {
  const wrap = $('kindFilters');
  wrap.replaceChildren();
  const counts = { all: state.trophies.length, story: 0, missable: 0, collectible: 0, activity: 0, online: 0 };
  for (const t of state.trophies) {
    for (const kind of t.kinds) {
      if (kind in counts) counts[kind] += 1;
    }
    if (t.missable) counts.missable += 1;
  }
  for (const kind of Object.keys(KIND_LABELS)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'kind-chip';
    chip.setAttribute('aria-pressed', String(state.kind === kind));
    chip.textContent = KIND_LABELS[kind];
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = String(counts[kind]);
    chip.append(n);
    chip.addEventListener('click', () => {
      state.kind = kind;
      saveSettings();
      render();
    });
    wrap.append(chip);
  }
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
  $('progressText').textContent = `${earned} of ${total} earned`;
  $('progressPct').textContent = `${pct}%`;
  $('progressFill').style.width = `${pct}%`;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of state.trophies) {
    if (state.earned.has(t.name)) byGrade[t.grade] += 1;
  }
  $('gradeBreakdown').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
  document.title =
    earned === 0
      ? 'Leonida Trophy Guide — GTA VI 55 Trophies, Tracker & Platinum Roadmap'
      : `Leonida Trophy Guide — ${earned}/55 earned (${pct}%)`;
}

function renderList() {
  const visible = sortedTrophies(state.trophies.filter(trophyMatches));
  const list = $('trophyList');
  list.replaceChildren();
  for (const t of visible) list.append(buildCard(t));
  $('emptyNote').hidden = visible.length > 0;
  const shown = visible.length;
  const total = state.trophies.length;
  $('countLine').textContent =
    state.kind === 'online'
      ? 'Online: there are no online trophies. All 55 are single-player, so the platinum can never expire with a server shutdown (PowerPyx).'
      : `Showing ${shown} of ${total} trophies` +
        (state.kind !== 'all' ? ` — ${KIND_LABELS[state.kind]}` : '') +
        (state.search ? ` matching “${state.search}”` : '');
  $('filterHint').textContent =
    state.spoiler
      ? 'Spoiler hiding is on: story trophies you have not earned yet show as “Hidden story trophy”.'
      : 'Spoiler hiding is off: every story trophy name and description is visible.';
}

function render() {
  renderFacts();
  renderKindFilters();
  renderProgress();
  renderRoadmap($('roadmap'), state.earned, state.byName);
  renderList();
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportProgress() {
  download(
    'leonida-trophy-progress.json',
    JSON.stringify(
      { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...state.earned] },
      null,
      2,
    ),
  );
}

async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned list in it.');
  const known = new Set(state.trophies.map((t) => t.name));
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  state.earned = new Set(kept);
  saveEarned();
  render();
  return kept.length;
}

async function init() {
  loadStored();
  $('missableWarningText').textContent = MISSABLE_NOTE;
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  state.trophies = doc.trophies;
  state.byName = new Map(state.trophies.map((t) => [t.name, t]));
  // Drop any earned names that are not on the official list (a stale save).
  state.earned = new Set([...state.earned].filter((n) => state.byName.has(n)));

  $('spoilerToggle').checked = state.spoiler;
  $('earnedOnlyToggle').checked = state.earnedOnly;
  $('gradeFilter').value = state.grade;
  $('sortOrder').value = state.sort;

  $('spoilerToggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveSettings();
    render();
  });
  $('earnedOnlyToggle').addEventListener('change', (e) => {
    state.earnedOnly = e.target.checked;
    saveSettings();
    render();
  });
  $('gradeFilter').addEventListener('change', (e) => {
    state.grade = e.target.value;
    saveSettings();
    render();
  });
  $('sortOrder').addEventListener('change', (e) => {
    state.sort = e.target.value;
    saveSettings();
    render();
  });
  $('search').addEventListener('input', (e) => {
    state.search = e.target.value.trim().toLowerCase();
    renderList();
  });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const count = await importProgress(file);
      $('filterHint').textContent = `Imported ${count} earned trophies from ${file.name}.`;
    } catch (err) {
      $('filterHint').textContent = `Could not import ${file.name}: ${err.message}`;
    }
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear every earned tick? This cannot be undone.')) return;
    state.earned = new Set();
    saveEarned();
    render();
  });

  render();

  // Deep link: #trophy-28 opens that trophy's guide on load.
  const match = window.location.hash.match(/^#trophy-(\d+)$/);
  if (match) {
    const card = $(`trophy-${match[1]}`);
    if (card) {
      const details = card.querySelector('details');
      if (details) details.open = true;
      card.scrollIntoView({ block: 'center' });
    }
  }
}

init().catch((err) => {
  $('trophyList').replaceChildren();
  const note = document.createElement('p');
  note.className = 'empty-note';
  note.hidden = false;
  note.textContent = `The trophy list could not be loaded (${err.message}). Check that data/trophies.json sits next to this page.`;
  $('trophyList').append(note);
});
