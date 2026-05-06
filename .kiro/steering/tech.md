# Tech Stack

## Framework & Language
- **Next.js 16+** with App Router
- **TypeScript** (strict mode)
- `src/` directory layout
- `@` alias maps to `src/`

## Styling
- **Tailwind CSS** — utility-first, no CSS modules or styled-components

## State Management
- **Zustand** — single store for all client state (user, items, filters)

## Explicitly Excluded
Do NOT add any of the following:
- Axios or any HTTP client
- React Query / TanStack Query
- NextAuth or any real auth library
- FastAPI, SQLAlchemy, or any backend framework
- Any database driver or ORM

## Common Commands
```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run lint     # ESLint
```

## Path Alias
Use `@/` for all internal imports (e.g., `@/store`, `@/components/ui`).
