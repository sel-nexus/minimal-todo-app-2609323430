# Minimal Todo App

A focused, single-page checklist. Add tasks by button or Enter, see them in creation order, toggle completion, and delete individual tasks. Task state exists only in the current page session and resets on reload.

## Stack decision

The upstream design records a conflict between the PRD's directly opened, single-file vanilla HTML/CSS/JavaScript requirement and the selected Vite + React catalogue stack. The product/build owner selected Vite + React for this implementation. This accepts the build requirement and deviation from direct-open/no-build vanilla delivery; the task behavior and exact DOM selectors remain as specified.

## Requirements

- Node.js 20 or newer and npm.
- No backend, API, database, account, or runtime environment configuration.

## Local development

```sh
cd frontend
npm install
npm run dev
```

## Tests and production build

```sh
cd frontend
npm test
npm run build
```

The browser acceptance test uses Playwright and starts the Vite server automatically:

```sh
node node_modules/@playwright/test/cli.js test --config playwright.config.ts
```

Install Chromium for Playwright when needed:

```sh
node node_modules/@playwright/test/cli.js install chromium
```

## Container

Build from the frontend directory and run the static nginx service on port 80:

```sh
docker build -t minimal-todo-app .
docker run --rm -p 8080:80 minimal-todo-app
```

Open `http://localhost:8080`. The root path serves the app; `/healthz` is available as a simple liveness response. The container contains only static assets and does not persist task data.
