# Decisions

A short record of what was chosen and why, so a future maintainer does not have to guess. Dated November 2026 unless stated.

## A plain static site, not WordPress, Squarespace or a site builder
The site is small (text, lists and a few images) and has to survive changes of volunteer. WordPress needs constant updating and plugins. Squarespace and similar builders have no good way to import or edit long lists in bulk, and their editors proved fiddly. A static site has nothing to update, nothing to hack, and costs only the domain name.

## Content in JSON files
The people and event lists change over time and are the part most likely to be edited by someone new. Keeping them in `site/data/*.json` means an editor changes one file and never touches layout code. It also works for AI tools: an agent can regenerate a list from a spreadsheet or pasted text without risking the design.

## One page with scrolling navigation
Five short sections do not need separate pages. One page is simpler to build, works well on phones, and each section still has its own link (`/#members`, `/#events`).

## Hosting: Cloudflare Pages from GitHub
Free for this size, fast, automatic HTTPS, and every saved change on GitHub publishes itself. Edits can be made entirely in GitHub's browser editor, with no software to install.

## The data check runs as the build command
`scripts/check-data.mjs` is Cloudflare's build command. A typo in a JSON file (the most likely mistake) fails the build, so the previous good version stays online instead of a broken page going live. The checker explains the problem in plain English.

## Members sorted automatically by surname
The old website grouped members by hand under letters, and some were under the wrong letter. The new data is a flat list and the page groups and sorts it, so adding a member is a single line anywhere in the list. A `surname` field overrides the default (last word of the name).

## Events: next event highlighted, auto-hidden after its date
The events section is mainly advertising. The first upcoming event is highlighted, and an event drops out of "Next event" automatically once its `date` or `endDate` passes, so the page does not advertise a finished event.

## Hero image with a dark overlay, not outlined text
The SEM photo is mid-grey with bright white fracture lines, so plain text over it would be hard to read. A charcoal overlay (about 55 to 85 percent, darker on the left under the title) keeps the texture visible and makes white text readable everywhere. Text outlines were rejected because they look heavy on a thin serif. The source image is small (842px wide); swap in a larger one when available.

## No buttons
The design reference had buttons; this site deliberately has none. Navigation is by the top links only.

## Email address added by script
The contact email is stored in `contact.json` and inserted into the page by JavaScript, which keeps it out of the raw HTML that simple spam bots read. It is not a guarantee against all scrapers.

## Fonts
Cormorant Garamond (headings) and Inter (body) from Google Fonts, chosen as free stand-ins for the typeface in the design reference. The page falls back to system serif and sans-serif fonts if they cannot load.

## Corrections made to the old site's text
"Deputy Treasure" is "Deputy Treasurer". Entries on the old Members page that sat under the wrong letter are now sorted automatically. One member is titled "Prof" (rather than "Dr") to match the contact person's university staff page. The original text is kept unchanged in `docs/original-content/` for reference.
