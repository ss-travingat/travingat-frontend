# Frontend Modules

This directory defines module entrypoints for the Next.js modular monolith.

## Current Modules

- `layout` - shared shell pieces (`Header`, `Footer`)
- `marketing` - landing page sections
- `flags` - flag components and hooks

## Rules

- Import feature code through `@/modules/<module>` when available.
- Keep page-level composition in `src/app/<route>/page.tsx`.
- Keep module internals behind small exports in each `index.ts`.
