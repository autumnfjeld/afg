# CLAUDE.md

All project instructions for AI agents are in @AGENTS.md. Read it before making changes.

Short version:
- Plain static site (HTML, CSS, vanilla JS). No frameworks, no build step.
- All content lives in `site/data/*.json`. Never hard-code content in HTML or JS.
- Run `node scripts/check-data.mjs` after any change. Check the page at 1440, 820 and 390 pixels wide.
- Keep the code simple enough for a non-engineer volunteer to follow.
