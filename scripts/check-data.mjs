#!/usr/bin/env node
/**
 * Checks the editable data files in site/data/ and explains any mistakes in plain English.
 *
 *   Run it:   node scripts/check-data.mjs      (or: npm run check)
 *
 * Cloudflare Pages also runs this on every publish. If it finds an ERROR, the publish
 * stops and the previous version of the website stays live.
 * Warnings are only reminders and never stop a publish.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const errors = [];
const warnings = [];

const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isBlank = (v) => v === undefined || v === null || v === '';
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isWebLink = (v) => /^https?:\/\/\S+$/i.test(v);
const isIsoDate = (v) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

/** Read a JSON file. Syntax errors are reported with a line number and the usual causes. */
function load(name) {
  const file = path.join(siteDir, 'data', name);
  const label = `data/${name}`;
  if (!existsSync(file)) {
    err(label, 'this file is missing.');
    return null;
  }
  const raw = readFileSync(file, 'utf8');
  try {
    return { label, data: JSON.parse(raw) };
  } catch (e) {
    let where = '';
    const match = /position (\d+)/.exec(e.message);
    if (match) {
      const upTo = raw.slice(0, Number(match[1]));
      const line = upTo.split('\n').length;
      where = ` Look near line ${line}.`;
    }
    err(label,
      `the file is not valid JSON, so the website cannot read it.${where}\n` +
      `      Common causes: a missing comma between two items, an extra comma after the last item,\n` +
      `      a missing quote mark, or a missing } or ]. (Technical message: ${e.message})`);
    return null;
  }
}

function needText(label, obj, key, where) {
  if (!isText(obj[key])) err(label, `${where} needs a "${key}" (it is missing or empty).`);
}

function optionalText(label, obj, key, where) {
  if (!isBlank(obj[key]) && typeof obj[key] !== 'string') err(label, `${where}: "${key}" must be text in quote marks.`);
}

function needArray(label, obj, key, where) {
  if (!Array.isArray(obj[key])) {
    err(label, `${where} needs a list called "${key}" written as [ ... ].`);
    return [];
  }
  return obj[key];
}

/* ---------- site.json ---------- */
const site = load('site.json');
if (site) {
  const { label, data } = site;
  if (!isObject(data)) err(label, 'should be a single { ... } block.');
  else ['name', 'logo', 'tagline'].forEach((k) => needText(label, data, k, 'the site settings'));
}

/* ---------- history.json ---------- */
const history = load('history.json');
if (history) {
  const { label, data } = history;
  needText(label, data, 'title', 'the history page');
  needText(label, data, 'author', 'the history page');
  needArray(label, data, 'sections', 'the history page').forEach((s, i) => {
    const where = `history section ${i + 1}`;
    if (!isObject(s)) return err(label, `${where} should be a { ... } block.`);
    needText(label, s, 'heading', where);
    const paras = needArray(label, s, 'paragraphs', where);
    if (paras.length === 0) err(label, `${where} has no paragraphs.`);
    paras.forEach((p, j) => { if (!isText(p)) err(label, `${where}, paragraph ${j + 1} must be text in quote marks.`); });
  });
}

/* ---------- members.json ---------- */
const members = load('members.json');
let memberCount = 0;
if (members) {
  const { label, data } = members;

  const checkPerson = (p, where) => {
    if (!isObject(p)) return err(label, `${where} should be a { ... } block with a name and affiliation.`);
    needText(label, p, 'name', where);
    needText(label, p, 'affiliation', `${where} (${p.name || 'no name'})`);
    optionalText(label, p, 'surname', where);
  };

  needArray(label, data, 'committee', 'the members file').forEach((g, i) => {
    const where = `committee role ${i + 1}`;
    if (!isObject(g)) return err(label, `${where} should be a { ... } block.`);
    needText(label, g, 'role', where);
    const people = needArray(label, g, 'people', `${where} (${g.role || 'no role'})`);
    if (people.length === 0) err(label, `${where} (${g.role || 'no role'}) has nobody listed.`);
    people.forEach((p, j) => checkPerson(p, `${g.role || where}, person ${j + 1}`));
  });

  const group = needArray(label, data, 'groupMembers', 'the members file');
  memberCount = group.length;
  const seen = new Map();
  group.forEach((p, i) => {
    checkPerson(p, `group member ${i + 1}`);
    if (isObject(p) && isText(p.name)) {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) warn(label, `"${p.name}" appears more than once in groupMembers.`);
      seen.set(key, true);
    }
  });
}

/* ---------- events.json ---------- */
const events = load('events.json');
let pastCount = 0;
if (events) {
  const { label, data } = events;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  needArray(label, data, 'upcoming', 'the events file').forEach((ev, i) => {
    const where = `upcoming event ${i + 1}`;
    if (!isObject(ev)) return err(label, `${where} should be a { ... } block.`);
    needText(label, ev, 'title', where);
    needText(label, ev, 'when', `${where} (${ev.title || 'no title'})`);
    ['venue', 'details', 'linkText'].forEach((k) => optionalText(label, ev, k, where));

    for (const k of ['date', 'endDate']) {
      if (isBlank(ev[k])) continue;
      if (typeof ev[k] !== 'string' || !isIsoDate(ev[k])) {
        err(label, `${where} (${ev.title}): "${k}" must look like 2027-05-28 (year-month-day), or be left as "".`);
      }
    }
    if (!isBlank(ev.link) && !(typeof ev.link === 'string' && isWebLink(ev.link))) {
      err(label, `${where} (${ev.title}): "link" must start with https:// (or be left as "").`);
    }
    const last = isIsoDate(ev.endDate || '') ? ev.endDate : ev.date;
    if (isIsoDate(last || '')) {
      const [y, m, d] = last.split('-').map(Number);
      if (new Date(y, m - 1, d) < today) {
        warn(label, `${where} (${ev.title}) has already finished, so it is hidden on the website. You can delete it, and add it to the past events if you like.`);
      }
    }
  });

  needArray(label, data, 'past', 'the events file').forEach((s, i) => {
    const where = `past events list ${i + 1}`;
    if (!isObject(s)) return err(label, `${where} should be a { ... } block.`);
    needText(label, s, 'name', where);
    needArray(label, s, 'events', `${where} (${s.name || 'no name'})`).forEach((ev, j) => {
      const w = `${s.name || where}, row ${j + 1}`;
      if (!isObject(ev)) return err(label, `${w} should be a { ... } block.`);
      pastCount += 1;
      if (isBlank(ev.year) || !/^\d{4}$/.test(String(ev.year))) err(label, `${w}: "year" must be a four digit year such as "1998".`);
      needText(label, ev, 'venue', w);
      needText(label, ev, 'chairs', w);
      optionalText(label, ev, 'award', w);
    });
  });

  needArray(label, data, 'proceedings', 'the events file').forEach((p, i) => {
    const where = `proceedings item ${i + 1}`;
    if (!isObject(p)) return err(label, `${where} should be a { ... } block.`);
    needText(label, p, 'label', where);
    if (!isBlank(p.url) && !(typeof p.url === 'string' && (isWebLink(p.url) || /^[\w./-]+$/.test(p.url)))) {
      err(label, `${where} (${p.label}): "url" must start with https:// (or be a file such as files/program.pdf), or be left as "".`);
    }
    if (isBlank(p.url)) warn(label, `${where} ("${p.label}") has no link yet, so it shows as plain text.`);
  });
}

/* ---------- contact.json ---------- */
const contact = load('contact.json');
if (contact) {
  const { label, data } = contact;
  needText(label, data, 'name', 'the contact details');
  optionalText(label, data, 'role', 'the contact details');
  optionalText(label, data, 'organisation', 'the contact details');
  if (!isText(data.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    err(label, 'the contact details need a valid "email" address.');
  }
}

/* ---------- required files ---------- */
for (const f of ['index.html', 'css/style.css', 'js/main.js', 'assets/hero.jpg']) {
  if (!existsSync(path.join(siteDir, f))) err(f, 'this file is missing from the site folder.');
}

/* ---------- report ---------- */
if (warnings.length) {
  console.log('\nReminders (these will not stop the website publishing):');
  warnings.forEach((w) => console.log(`  - ${w}`));
}

if (errors.length) {
  console.error(`\nFound ${errors.length} problem${errors.length === 1 ? '' : 's'} that must be fixed:\n`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}\n`));
  console.error('Nothing has been published. The live website is unchanged.\n');
  process.exit(1);
}

console.log(`\nAll data files look good (${memberCount} group members, ${pastCount} past events).\n`);
