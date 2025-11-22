# Content Generation Studio

This project delivers the marketing content generator requested in the ticket:

- `/api/content/social` builds deterministic, multi-platform social variants using validated property data.
- `/api/content/video` creates scene-by-scene video scripts that reference provided media.
- `/api/content/plan` persists drafts to a SQLite-backed `ContentPlan` table.
- `/public` hosts a lightweight composer UI for selecting properties, tweaking prompts, and saving plans.

## Getting started

```bash
npm install
npm run dev
```

This starts the Express server on `http://localhost:3000` and serves the composer UI.

### Running tests

```bash
npm test
```

Vitest executes prompt-builder unit tests to guarantee deterministic prompt construction.

## Project structure

```
src/
  db/                SQLite connection + repository helpers
  lib/               Prompt builders, generators, validators, token utilities
public/              Composer UI (HTML/CSS/JS)
server.js            Express entrypoint + routes
```

The SQLite database file (`content.db`) is created automatically in the project root.
