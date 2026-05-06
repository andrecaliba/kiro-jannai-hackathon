# Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (includes global navbar, conditionally hidden)
│   ├── page.tsx                # Redirects to /dashboard
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── items/
│   │   ├── page.tsx            # Catalog with filters
│   │   └── [id]/
│   │       └── page.tsx        # Item detail
│   └── report/
│       ├── lost/
│       │   └── page.tsx
│       └── found/
│           └── page.tsx
├── components/
│   ├── ui/                     # Reusable primitives (Badge, Card, Button, etc.)
│   ├── ItemCard.tsx            # Card used in grids (applies privacy rules)
│   ├── ItemForm.tsx            # Shared lost/found report form (accepts type prop)
│   ├── Navbar.tsx              # Global nav (hidden on /login)
│   └── StatCard.tsx            # Dashboard stat cards
├── store/
│   └── index.ts                # Single Zustand store (user, items, filters, actions)
├── types/
│   └── index.ts                # Shared TypeScript types (Item, User, Filters, etc.)
└── lib/
    └── constants.ts            # Categories list, Locations list, privacy categories set
```

## Conventions
- All pages are React Server Components by default; add `"use client"` only when needed (store access, interactivity)
- Use `use(params)` (React 19 API) to unwrap dynamic route params in client components
- Zustand store is imported directly — no context providers needed
- Mock seed data lives inside the store file, defined as a constant before the store
- Privacy logic (anonymization) is a pure utility function in `lib/constants.ts` or co-located in `ItemCard`
- No barrel `index.ts` files unless the folder has 3+ exports
