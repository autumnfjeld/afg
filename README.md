# Australian Fracture Group website

A small, plain website with no plugins, no database and no monthly hosting cost.
All the words, names and events live in a few simple text files (`.json`). You edit those files, save, and the website updates itself within about a minute.

**You do not need to be a programmer to look after this site.** If you can edit a text file carefully, you can do everything in sections 1 to 5.

---

## Contents

1. [Where things are](#1-where-things-are)
2. [How to edit the content](#2-how-to-edit-the-content) (members, events, history, contact, tagline)
3. [JSON in two minutes: the rules](#3-json-in-two-minutes-the-rules)
4. [Publishing your change](#4-publishing-your-change)
5. [If something goes wrong](#5-if-something-goes-wrong)
6. [Preview on your computer (optional)](#6-preview-on-your-computer-optional)
7. [First-time setup: deploy to Cloudflare Pages](#7-first-time-setup-deploy-to-cloudflare-pages)
8. [Connect the domain name](#8-connect-the-domain-name)
9. [Yearly tasks and who holds the logins](#9-yearly-tasks-and-who-holds-the-logins)
10. [Replacing the hero photo](#10-replacing-the-hero-photo)
11. [For developers and AI tools](#11-for-developers-and-ai-tools)

---

## 1. Where things are

```
site/
  data/              <-- THE ONLY FOLDER MOST EDITORS NEED
    members.json         committee and group members
    events.json          next event, past events, proceedings
    history.json         the History text
    contact.json         the Contact person
    site.json            logo letters, site name, tagline
  assets/hero.jpg    the big photo at the top
  index.html         the page structure   (developers only)
  css/style.css      colours, fonts, layout (developers only)
  js/main.js         builds the page from the data files (developers only)
scripts/check-data.mjs   checks your edits for mistakes
wrangler.jsonc          tells Cloudflare to publish the "site" folder
docs/                    background notes and the original text from the old website
AGENTS.md                instructions for AI tools and developers
```

**Rule of thumb:** to change what the website *says*, edit a file in `site/data/`. Leave everything else alone.

---

## 2. How to edit the content

Open the file in GitHub (click the file, then the pencil icon), make your change, and follow section 4 to publish.

### Add a group member

Open `site/data/members.json`. Find the list called `"groupMembers"`. Copy an existing entry and change it:

```json
{ "name": "Dr Jane Smith", "affiliation": "The University of Example" },
```

- Put it **anywhere** in the list. The website sorts everyone A to Z by **surname** and creates the letter headings itself.
- The surname is taken to be the **last word** of the name. If that is wrong (for example a two-word surname), add a `surname` field:
  `{ "name": "Dr Ana de la Cruz", "surname": "de la Cruz", "affiliation": "..." },`
- Every entry except the last one in the list needs a comma at the end (see section 3).

### Remove or change a member

Delete the whole `{ ... },` line for that person, or edit the words inside the quote marks.

### Change the committee

In the same file, the list called `"committee"` has one block per role (President, Treasurer and so on). Edit the names inside, or add a person to a role's `"people"` list. To add a whole new role, copy an entire role block:

```json
{
  "role": "Secretary",
  "people": [
    { "name": "Dr Jane Smith", "affiliation": "The University of Example" }
  ]
},
```

The roles are shown in the order they appear in the file.

### Announce the next event

Open `site/data/events.json`. The list called `"upcoming"` holds the events to advertise. The first one is shown in the highlighted "Next event" box.

```json
{
  "title": "SIF 2027 Conference",
  "when": "28 to 30 May 2027",
  "venue": "Sydney",
  "details": "Call for abstracts opens in January.",
  "date": "2027-05-28",
  "endDate": "2027-05-30",
  "link": "https://example.org/sif2027",
  "linkText": "Conference website"
}
```

- `title` and `when` are required. Everything else may be left as `""` (two quote marks with nothing between them).
- `when` is the text people see, so you can write it any way you like ("Late 2027", "2027").
- `date` (and `endDate` for multi-day events) is only used by the website itself, and must be written **year-month-day**, like `2027-05-28`. When that date has passed, the event **disappears from "Next event" automatically**, and the next one takes its place. If you leave `date` empty, the event stays until you delete it.
- If there are no upcoming events at all, the page says "To be announced".

### Add an event to the past events

In `events.json`, the list called `"past"` has two groups (the AFG meetings and the SIF conferences). Add a row to the right group:

```json
{ "year": "2027", "venue": "Sydney", "chairs": "Prof A Person & Dr B Person", "award": "C Person" }
```

`award` is optional: delete that part (and the comma before it) if there is no award.

### Add a link to the proceedings

In `events.json`, the list called `"proceedings"`:

```json
{ "label": "SIF 11, Sydney 2018: Conference Program (PDF)", "url": "https://example.org/program.pdf" }
```

An item with `"url": ""` is shown as plain text with no link. (SIF 10 is like this at the moment: its PDF link from the old website still needs to be added.)

### Edit the History

Open `site/data/history.json`. Each block has a `"heading"` and a list of `"paragraphs"`. Each paragraph is one piece of text in quote marks, followed by a comma (except the last one). To start a new paragraph, add another piece of text to the list.

### Change the contact person

Open `site/data/contact.json` and change the words inside the quote marks (`name`, `role`, `organisation`, `email`). The email address is shown as a clickable link and is kept out of the page's raw HTML to reduce spam.

### Change the logo letters or tagline

Open `site/data/site.json`.

---

## 3. JSON in two minutes: the rules

JSON is just text with strict punctuation. The files look scary but follow only a few rules:

1. **Text goes in straight double quotes:** `"like this"`. Not curly quotes, not single quotes.
2. **A comma goes between items,** but **not after the last item** in a list. This is the most common mistake.
3. **Curly brackets `{ }`** wrap one thing (one person, one event). **Square brackets `[ ]`** wrap a list of things.
4. **Never put a double quote inside text.** If you need quote marks around words, use curly ones: “like this”. For an apostrophe, just type it: `Schnadt's`.
5. **A backslash is special.** Avoid it. (If you really need one in text, write two: `\\`.)
6. Keep a copy of the pattern: **copy an existing entry, paste it, then change only the words between the quote marks.**

### Check your work before publishing

Every time the website is published, a checker runs first. If it finds a mistake:
- **the new version is not published,**
- **the old website stays online and unchanged,**
- and the checker says in plain English what is wrong and roughly which line.

You can also run the checker yourself on a computer with Node installed: `npm run check`.

---

## 4. Publishing your change

The website is connected to this GitHub repository. **Saving a change here is publishing it.**

**Easiest way, in a web browser:**

1. On github.com, open this repository and click the file you want to change (for example `site/data/members.json`).
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes…** (green button, top right), write a short note like "Add Dr Jane Smith", and click **Commit changes** again.
5. Wait about one minute, then reload the website.

**To see whether it worked:** open the repository's page on Cloudflare (Workers & Pages, then the project, then **Deployments** or **Builds**). The top entry says **Success** or **Failed**. If it failed, click it to read the checker's message, fix the file, and commit again.

Tip: on a repository page, pressing the `.` (full stop) key opens an editor in the browser that works like Visual Studio Code.

---

## 5. If something goes wrong

| What you see | What to do |
|---|---|
| Deployment says **Failed** | Click it and read the message. It names the file and what is wrong. Fix it and commit again. The old website is still online. |
| A whole section shows "could not be loaded" | A data file is broken or missing. Run the check, or open the file in GitHub and look near the line the checker names. |
| You published something wrong and want it back | **Easiest:** in Cloudflare, Workers & Pages, the project, **Deployments**, find the last good one, and choose **Rollback to this deployment** (or similar). **Alternatively:** in GitHub, open the file, click **History**, find the last good version, and restore it. |
| Names are in the wrong letter | The website uses the last word of the name. Add a `"surname"` field to fix it (see section 2). |
| An old event is still showing as "Next event" | Its `"date"` is empty or in the future. Fix the date, or delete the event. |

---

## 6. Preview on your computer (optional)

Not needed for simple edits, but handy for bigger changes.

Opening `index.html` by double-clicking it **will not work** (browsers refuse to load the data files that way). Use a tiny local web server instead:

- **With Node installed:** run `npm start` in this folder, then open the address it prints (usually http://localhost:3000).
- **With Visual Studio Code:** install the *Live Server* extension, right-click `site/index.html`, choose **Open with Live Server**.

---

## 7. First-time setup: deploy to Cloudflare

Do this once. Hosting a site this size on Cloudflare is free. Screens and button names change from time to time, so treat the names below as a guide.

**You need:** a free Cloudflare account and a free GitHub account (the group should own these, not one person's private email: see section 9).

1. **Put the code on GitHub.** Create a repository and upload everything in this folder (including `wrangler.jsonc`).
2. **Create the Cloudflare project.** In the Cloudflare dashboard go to **Workers & Pages**, choose **Create**, then **Import a repository** (connect to Git). Authorise GitHub and choose the repository.
3. **Enter the settings on the "Set up your application" screen:**

   | Setting | Value |
   |---|---|
   | Project name | `afg` (must match the `name` in `wrangler.jsonc`) |
   | Build command | `node scripts/check-data.mjs` |
   | Deploy command | `npx wrangler deploy` (leave the default) |
   | Preview command | `npx wrangler preview` (leave the default) |

   The **build command** is the safety check from section 3: if the data files contain a mistake, the build fails, nothing is deployed, and the old site stays online.
   The file `wrangler.jsonc` tells Cloudflare that the website is the `site` folder.
4. Click **Deploy**. After a minute or so the site is live at an address ending in `.workers.dev`.
5. If the build fails with a message about the Node version, open the project's **Settings, Build, Variables** and add `NODE_VERSION` with the value `20`, then retry.

From now on, every change saved to the `main` branch on GitHub is built, checked and published automatically.

> If you ever use Cloudflare *Pages* instead of Workers: set the build command to `node scripts/check-data.mjs` and the build output directory to `site`. Everything else in this guide is the same.

---

## 8. Connect the domain name

You can buy the domain from any registrar. For an Australian `.org.au`, `.asn.au` or `.au` name, use an Australian registrar, because Cloudflare does not sell those. The registrant should be the **organisation**, not an individual, and registered with an email address the group controls.

Connect it like this:

1. In the Cloudflare dashboard, **Add a site** (the free plan is fine) and enter the domain name.
2. Cloudflare shows two **nameservers**. At your registrar, find the domain's **nameserver / DNS** settings and replace the existing nameservers with Cloudflare's two. (This can take from a few minutes to a few hours.)
3. Open the project (Workers & Pages, then `afg`), go to **Settings, Domains & Routes**, choose **Add, Custom domain**, and enter the domain (and the `www.` version if you want both). Cloudflare sets up the DNS records and the free HTTPS certificate for you.

If your registrar does not allow changing nameservers, ask the registrar for help, or use a registrar that does.

---

## 9. Yearly tasks and who holds the logins

**Once a year:**
- Renew the domain name (the one real cost). Turn on auto-renew, and make sure the renewal email goes to an address someone actually reads.
- Check the website loads on a phone and on a computer, and that the "Next event" box is current.
- Update the committee list after each election.

**Fill this in and keep it up to date** (store the passwords in the group's password manager, never in this repository):

| Thing | Where / who |
|---|---|
| Domain registrar | __________________ |
| Domain renewal date | __________________ |
| Cloudflare account (email used) | __________________ |
| GitHub repository address | __________________ |
| People with edit access | __________________ |
| Backup contact if the above person leaves | __________________ |

---

## 10. Replacing the hero photo

The large picture at the top is `site/assets/hero.jpg`.

- Replace it with a new JPG with the **same file name**, and commit it.
- Wider is better: about 2000 pixels wide or more looks sharp on big screens. (The current photo is only 842 pixels wide, so it looks slightly soft on very large monitors.)
- A mostly grey, textured image works best, because a dark overlay is laid over it so the white title is always readable.
- Crop out scale bars, captions and borders first.

---

## 11. For developers and AI tools

- Read [`AGENTS.md`](AGENTS.md) first: it lists the requirements, the constraints, the data format and what has been done.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) explains why the site is built this way.
- [`docs/original-content/`](docs/original-content/) holds the text transcribed from the old website, for reference only. The live content is in `site/data/`.
- There is deliberately **no framework and no build step**: plain HTML, CSS and JavaScript.
- Fonts (Cormorant Garamond and Inter) load from Google Fonts. If they fail to load, the page falls back to system fonts and stays readable.
