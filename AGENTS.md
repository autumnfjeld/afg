# AGENTS.md: instructions for AI tools and developers

This file tells any AI coding agent (Claude, Copilot, Cursor, Codex, etc.) or developer what this project is, the rules it must follow, and what has already been done. Read it fully before changing anything. Human-facing editing instructions are in `README.md`.

## What this is

A small, static, single-page website for the **Australian Fracture Group (AFG)**, an academic society for fracture mechanics and structural integrity, established in 1971.

Sections, in order: **Hero, History, Members, Events, Contact.** Navigation is links only (History, Members, Events, Contact) that scroll to each section.

## Non-negotiable requirements

1. **Static site.** Plain HTML, CSS and vanilla JavaScript. No framework, no bundler, no build step, no server code, no CMS, no WordPress, no plugins.
2. **Content is data, not code.** All text, names, events and links live in `site/data/*.json`. `index.html`, `css/` and `js/` must contain no site content other than the fixed section headings and the fallback hero text. Never hard-code a person, event or paragraph in HTML or JS.
3. **Easy for non-programmers to maintain.** A technical but non-engineer volunteer must be able to change content by editing one JSON file in GitHub's web editor and committing. Do not make this harder.
4. **Responsive.** Must work and look right at phone (about 390px), tablet (about 820px) and desktop (1440px and wider). No horizontal scrolling at any width.
5. **Mobile navigation** collapses into a menu button below 721px.
6. **No buttons on the page.** The only controls are the links in the top navigation (and the mobile menu toggle). Do not add call-to-action buttons.
7. **Look:** classic and tasteful. Alternating dark (`#242424`) and light (`#d9d9d3`) full-width sections; thin hairline rules; light serif headings (Cormorant Garamond) and small clean sans body text (Inter); navy (`#22314d`) accent only in light sections. Reference: a law-firm style template with large serif headings and heading-left / content-right sections.
8. **Hero:** full-width SEM fracture-surface photo (`site/assets/hero.jpg`) with a dark overlay so white text stays legible over the white fracture lines. Do not use text outlines. Text: "Australian Fracture Group" and the tagline "Advancing fracture mechanics in Australia since 1971". Logo is the text "AFG", top left.
9. **Headings left, content right** on wide screens (900px and up), with the left heading **sticky** while the text scrolls. Single column below 900px.
10. **Events:** the next upcoming event is highlighted at the top of the Events section; past events follow, in two groups (AFG Meetings; SIF Conferences) with columns Year, Venue, Chair(s), Awards; then Proceedings. Upcoming events with a `date` or `endDate` that has passed are hidden automatically.
11. **Members:** committee roles first, then group members grouped A to Z. Grouping and sorting is done by the page from a flat list, by surname (last word of the name, or the optional `surname` field).
12. **Contact:** a single person (name, role, organisation, email). The email is inserted by JavaScript to deter spam bots.
13. **Hosting:** Cloudflare Pages, deployed from GitHub. Build command `node scripts/check-data.mjs`, output directory `site`. A data error must fail the build so the previous version stays live.
14. **Accessibility basics:** semantic HTML, skip link, visible focus, sufficient contrast, `aria-expanded` on the menu toggle, reduced-motion respected. No tracking or analytics.

## Project layout

```
site/index.html          page skeleton (section containers, nav, footer)
site/css/style.css       all styling (design tokens at the top, in :root)
site/js/main.js          fetches data/*.json and renders every section
site/data/*.json         ALL EDITABLE CONTENT (schemas below)
site/assets/hero.jpg     hero image (cropped from a 842px SEM image)
scripts/check-data.mjs   validator: plain-English errors, exit code 1 on error
docs/DECISIONS.md        why things are the way they are
docs/original-content/   transcription of the old website's text (reference only)
README.md                maintainer guide, deployment steps
```

## Data schemas

`site.json`: `{ "name", "logo", "tagline" }`

`history.json`: `{ "title", "author", "sections": [ { "heading", "paragraphs": [text, ...] } ] }`

`members.json`:
```
{ "committee": [ { "role", "people": [ { "name", "affiliation" } ] } ],
  "groupMembers": [ { "name", "affiliation", "surname"? } ] }
```

`events.json`:
```
{ "upcoming": [ { "title", "when", "venue"?, "details"?, "date"?, "endDate"?, "link"?, "linkText"? } ],
  "past": [ { "name", "events": [ { "year", "venue", "chairs", "award"? } ] } ],
  "proceedings": [ { "label", "url"? } ] }
```
`date` and `endDate` use `YYYY-MM-DD`. Optional strings may be `""`.

`contact.json`: `{ "name", "role"?, "organisation"?, "email" }`

If you change a schema, update `scripts/check-data.mjs`, `site/js/main.js`, this file and the README together.

## Rules for making changes

- **Content change requests** (add a member, add an event, fix a typo): edit only `site/data/*.json`, then run `node scripts/check-data.mjs`.
- **Keep code beginner-readable:** small functions, comments on the non-obvious parts, no clever one-liners, no dependencies. `package.json` has no dependencies and should stay that way.
- Build page content with DOM methods (`textContent`, `createElement`), never `innerHTML` with data, so a stray character in JSON cannot break or inject into the page.
- Do not commit passwords, account details, or personal data beyond what is already in the data files. Do not add analytics, cookies or third-party scripts (Google Fonts is the only external request).
- Do not comment on or reorder who belongs on the committee or in which role. Reproduce what the group supplies.
- Keep the placeholder wording and tone plain and simple.

## How to verify a change

1. `node scripts/check-data.mjs` must print "All data files look good."
2. Serve `site/` locally (`npx serve site` or `python3 -m http.server --directory site`) and look at the page at **1440, 820 and 390 pixels wide**. Check: no horizontal overflow, text legible over the hero, sticky headings work at 900px+, the mobile menu opens and closes, members columns go 4 to 2 to 1.
3. Break a data file on purpose and confirm the checker reports it clearly, then restore it.

## What has been done (state at first release, November 2026)

- Single-page site built to the requirements above, with the hero, History, Members, Events and Contact sections.
- Content transcribed from the old website: History (four sections), Members (committee plus 53 group members), Events (AFG Meetings 1974 to 1997, SIF Conferences 1998 to 2016, awards, proceedings).
- Corrections made while transcribing: "Deputy Treasure" is "Deputy Treasurer"; the flat group member list is sorted by the page, which fixes entries that were under the wrong letter on the old site (for example Clegg and Heller); one member is titled "Prof" to match the contact person's university page.
- **Placeholder content:** the upcoming event is a placeholder ("Next AFG Conference", 2027, Sydney, "More information to come."). Replace it when real details are known.

## Open items

- The SIF 10 (Adelaide 2016) conference program PDF link was not recovered from the old site. `events.json` has `"url": ""` for it. Add the file (for example under `site/files/`) and link it.
- The hero image is only 842px wide and will look soft on very large screens. Replace `site/assets/hero.jpg` with a larger image when available.
- The domain name has not been purchased or connected yet (see README sections 7 to 9).
- Group member list: the old site's order was not strictly alphabetical in places; confirm the list with the committee when convenient.
