# Garden of Mine

A personal garden chronicle built with React, TypeScript and Vite. It connects Plant Stories, Journal entries, Harvests, Growing records, Knowledge, photographs and Trials.

Start with [the developer guide](docs/development/README.md) for template choices, CSS ownership, navigation, persistence and verification.

## Run locally

Install the dependencies with `npm install`, then run `npm run dev`. The local application uses `/project-greenbook/`; follow the address printed by Vite.

Run `npm run build` to check TypeScript and produce the production bundle. `npm run lint` runs the configured ESLint checks; its existing findings are separate from the build.

## Garden records

The garden is stored in the browser's IndexedDB database. Browser profiles have separate gardens. Use the application's Backup & Restore tools before clearing browser data or moving to a different profile. A source-code copy does not contain the gardener's live database.
