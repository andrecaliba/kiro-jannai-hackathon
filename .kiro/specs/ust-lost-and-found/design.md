# Design Document: UST Lost and Found

## Overview

UST Lost and Found is a frontend-only Next.js 16+ prototype for the University of Santo Tomas. It lets students report lost or found items, browse a filterable catalog, and update item statuses — all without a backend, database, or real authentication. All state lives in a single Zustand store seeded with eight mock items. The visual style mirrors the MyUSTe Portal: card-based, rounded corners, subtle shadows, UST gold (`#F5B731`) and UST black (`#1A1A1A`).

### Goals

- Demonstrate the full lost-and-found workflow in a self-contained prototype.
- Apply a Privacy Rule that anonymizes high-value lost items in all public views.
- Remain simple: no external API calls, no auth library, no database.

### Non-Goals

- Real authentication or user accounts.
- Persistent storage (data resets on page refresh).
- Server-side rendering of dynamic data (all data is client-side).
- Backend, API routes, or any network requests.

---

## Architecture

The application is a pure client-side SPA hosted inside the Next.js App Router shell. All pages that need state are Client Components (`"use client"`). Pages that are purely presentational can remain Server Components.

```
Browser
  └── Next.js App Router (src/app/)
        ├── Root Layout (layout.tsx)
        │     └── Navbar (hidden on /login via pathname check)
        ├── Pages (RSC by default, "use client" where needed)
        │     ├── /login
        │     ├── /dashboard
        │     ├── /items
        │     ├── /items/[id]
        │     ├── /report/lost
        │     └── /report/found
        └── Shared Components (src/components/)
              ├── ItemCard.tsx
              ├── ItemForm.tsx
              ├── Navbar.tsx
              └── StatCard.tsx

State Layer
  └── Zustand Store (src/store/index.ts)
        ├── user: User | null
        ├── items: Item[]
        └── filters: Filters

Shared Logic
  ├── src/types/index.ts       — TypeScript types
  └── src/lib/constants.ts     — CATEGORIES, LOCATIONS, HIGH_VALUE_CATEGORIES, isProtected()
```

### Key Architectural Decisions

**Single Zustand store** — All client state (user session, items array, active filters) lives in one store. Components import the store hook directly; no React Context or Provider wrappers are needed.

**App Router with selective `"use client"`** — Pages default to React Server Components. The `"use client"` directive is added only to components that read from the Zustand store or handle user interaction (forms, filter bar, status buttons).

**`use(params)` for dynamic routes** — The `/items/[id]` page is a Client Component that uses the React 19 `use()` API to unwrap the `params` Promise, as required by Next.js 16 App Router conventions.

**Privacy Rule as a pure function** — `isProtected(item: Item): boolean` lives in `src/lib/constants.ts`. It is a pure function with no side effects, making it trivially testable and reusable across `ItemCard`, the detail page, and the search filter.

**No barrel files** — `index.ts` re-exports are only added to folders with three or more exports. Currently only `src/types/index.ts` qualifies.

---

## Components and Interfaces

### `src/app/layout.tsx` — Root Layout

Server Component. Renders the global HTML shell and conditionally renders `<Navbar />`. The Navbar is hidden on `/login` by reading `usePathname()` inside a thin `"use client"` wrapper component (`NavbarWrapper`).

```tsx
// Pseudocode
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NavbarWrapper />   {/* "use client" — hides on /login */}
        {children}
      </body>
    </html>
  )
}
```

### `src/components/Navbar.tsx`

Client Component. Reads `user` from the Zustand store. Displays brand name, nav links (`/dashboard`, `/items`, `/report/lost`), and — when `user` is non-null — the user's name and a sign-out button. Sign-out calls `signOut()` then `router.push('/login')`.

**Props:** none (reads store directly)

### `src/components/ItemCard.tsx`

Client Component. Renders a single `Item` as a card. Applies the Privacy Rule via `isProtected(item)` before rendering any field.

**Props:**
```ts
interface ItemCardProps {
  item: Item
}
```

**Privacy Rule application:**
- If `isProtected(item)` is `true`:
  - Title → generic label derived from category (e.g., `"Lost electronic device"`, `"Lost bag or wallet"`)
  - Description → hidden (not rendered)
  - Image → hidden (not rendered)
  - Amber `"Protected"` badge shown
- If `isProtected(item)` is `false`: all fields rendered normally.

**Always rendered:** type badge (red for `lost`, blue for `found`), status badge, category pill, location, date, link to `/items/[id]`.

### `src/components/ItemForm.tsx`

Client Component. Shared form for both `/report/lost` and `/report/found`.

**Props:**
```ts
interface ItemFormProps {
  type: "lost" | "found"
}
```

**Behavior:**
- Pre-fills `reporter_name` and `contact_email` from `user` in the store (if signed in).
- Submit button is red when `type === "lost"`, gold (`#F5B731`) when `type === "found"`.
- On valid submission: calls `addItem(newItem)` then `router.push('/dashboard')`.
- On invalid submission: displays per-field validation errors, does not call `addItem`.

**Fields:** item name, description, category (select), location (select), date, image URL (optional), reporter name, contact email.

### `src/components/StatCard.tsx`

Server-compatible presentational component (can be used in Client Components too).

**Props:**
```ts
interface StatCardProps {
  label: string
  value: number
  accent?: string  // Tailwind color class, e.g. "text-yellow-400"
}
```

### `src/components/ui/`

Reusable primitives: `Badge`, `Button`, `Card`. These are thin wrappers around Tailwind utility classes, kept as simple functional components with no internal state.

---

## Data Models

All types are defined in `src/types/index.ts`.

### `Item`

```ts
interface Item {
  id: string                              // UUID (crypto.randomUUID())
  type: "lost" | "found"
  title: string
  description: string
  category: string                        // one of CATEGORIES
  location: string                        // one of LOCATIONS
  date: string                            // ISO 8601 date string (YYYY-MM-DD)
  image_url?: string                      // optional image URL
  status: "open" | "claimed" | "resolved"
  contact_email: string                   // ust.edu.ph address
  reporter_name: string                   // Filipino name
  created_at: string                      // ISO 8601 datetime string
}
```

### `User`

```ts
interface User {
  name: string
  email: string
}
```

Demo User constant (defined in the store file):
```ts
const DEMO_USER: User = {
  name: "Juan dela Cruz",
  email: "jdelacruz@ust.edu.ph",
}
```

### `Filters`

```ts
interface Filters {
  search: string
  type: "" | "lost" | "found"
  category: string
  status: "" | "open" | "claimed" | "resolved"
}
```

Initial state: all fields are empty strings.

### Constants (`src/lib/constants.ts`)

```ts
export const CATEGORIES: string[] = [
  "Electronics", "Clothing", "Books and Notes", "ID and Cards",
  "Keys", "Bags and Wallets", "Accessories", "Documents", "Others",
]

export const LOCATIONS: string[] = [
  "Main Building", "Benavides Building", "Albertus Magnus Building",
  "Roque Ruano Building", "Thomas Aquinas Research Complex",
  "Central Laboratory", "Tan Yan Kee Student Center", "UST Gym",
  "Quadricentennial Pavilion", "UST Library", "Plaza Mayor",
  "Lovers Lane", "Arch of the Centuries", "Other",
]

export const HIGH_VALUE_CATEGORIES: Set<string> = new Set([
  "Electronics", "Bags and Wallets", "ID and Cards", "Accessories", "Documents",
])

export function isProtected(item: Item): boolean {
  return item.type === "lost" && HIGH_VALUE_CATEGORIES.has(item.category)
}
```

### Zustand Store (`src/store/index.ts`)

```ts
interface StoreState {
  // State
  user: User | null
  items: Item[]
  filters: Filters

  // Actions
  signIn: () => void
  signOut: () => void
  addItem: (item: Omit<Item, "id" | "created_at">) => void
  updateItemStatus: (id: string, status: Item["status"]) => void
  setFilters: (partial: Partial<Filters>) => void
  resetFilters: () => void
}
```

`addItem` assigns `crypto.randomUUID()` as `id` and `new Date().toISOString()` as `created_at`, then prepends the item to `items`.

### Mock Seed Data

Eight items defined as `MOCK_ITEMS: Item[]` in `src/store/index.ts`, before the store definition. Covers: mobile phone (lost, open), ID card (lost, open), wallet (lost, claimed), backpack (found, open), keys (lost, resolved), textbook (found, open), umbrella (found, claimed), laptop charger (lost, open). All use Filipino names and `ust.edu.ph` emails.

### Tailwind / Branding Configuration

UST colors are added to `tailwind.config.ts` as theme extensions:

```ts
theme: {
  extend: {
    colors: {
      "ust-gold": "#F5B731",
      "ust-black": "#1A1A1A",
    },
  },
},
```

This makes `bg-ust-gold`, `text-ust-gold`, `bg-ust-black`, etc. available as utility classes throughout the app.

### Responsive Breakpoints

Tailwind's default breakpoints map cleanly to the three target viewports:

| Viewport | Tailwind prefix | Dashboard grid | Items grid |
|----------|----------------|----------------|------------|
| 375px    | (base)         | 1 column       | 1 column   |
| 768px    | `md:`          | 2 columns      | 2 columns  |
| 1280px   | `xl:`          | 4 columns      | 3 columns  |

Grid classes: dashboard `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`, items `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: isProtected — lost high-value items are always protected

*For any* Item where `type === "lost"` and `category` is in `HIGH_VALUE_CATEGORIES`, `isProtected(item)` SHALL return `true`.

**Validates: Requirements 12.1**

### Property 2: isProtected — found items are never protected

*For any* Item where `type === "found"`, `isProtected(item)` SHALL return `false`, regardless of category — including categories that are in `HIGH_VALUE_CATEGORIES`.

**Validates: Requirements 12.7**

### Property 3: isProtected — lost non-high-value items are not protected

*For any* Item where `type === "lost"` and `category` is NOT in `HIGH_VALUE_CATEGORIES`, `isProtected(item)` SHALL return `false`.

**Validates: Requirements 12.1**

### Property 4: addItem prepends and assigns unique identity

*For any* valid item payload, calling `addItem` SHALL result in the new item appearing at index 0 of the `items` array, with a non-empty `id` string and a non-empty `created_at` that is a valid ISO 8601 datetime string, and the total `items` length SHALL increase by exactly 1.

**Validates: Requirements 3.6**

### Property 5: updateItemStatus mutates only the target item

*For any* store state with N items and a valid item `id`, calling `updateItemStatus(id, newStatus)` SHALL update exactly one item's `status` to `newStatus` and leave all other items' `id`, `title`, `type`, `category`, `status`, and all other fields unchanged.

**Validates: Requirements 3.7**

### Property 6: setFilters merges without clobbering unrelated fields

*For any* current `filters` state and any partial `Filters` object, calling `setFilters(partial)` SHALL update only the fields present in `partial` and leave all other filter fields at their previous values.

**Validates: Requirements 3.8**

### Property 7: resetFilters always produces the empty-string initial state

*For any* `filters` state (regardless of what values are currently set), calling `resetFilters()` SHALL produce a `filters` object where `search`, `type`, `category`, and `status` are all empty strings.

**Validates: Requirements 3.9**

### Property 8: ItemCard hides all sensitive details for protected items

*For any* Protected Item (i.e., `isProtected(item) === true`), rendering `ItemCard` SHALL: (a) display a generic label derived from the item's category instead of the real title, (b) not render the real description, (c) not render the image, and (d) display an amber "Protected" badge.

**Validates: Requirements 12.2, 12.3, 12.4**

### Property 9: Item Detail Page applies privacy rule and shows notice for protected items

*For any* Protected Item, rendering the Item Detail Page SHALL: (a) apply the same title, description, and image hiding as Property 8, and (b) display an amber notice block explaining that details are hidden and ownership will be verified privately.

**Validates: Requirements 12.5, 12.6**

### Property 10: All active filters are applied simultaneously

*For any* combination of active filter values (`search`, `type`, `category`, `status`) and any `items` array, every item in the filtered result SHALL satisfy ALL active filter conditions simultaneously — no item that fails any single active filter SHALL appear in the results.

**Validates: Requirements 8.8**

### Property 11: Search filter matches title/description case-insensitively for unprotected items

*For any* non-empty search string `q` and any unprotected Item, the item SHALL appear in the filtered results if and only if `item.title.toLowerCase()` or `item.description.toLowerCase()` contains `q.toLowerCase()`.

**Validates: Requirements 8.9**

### Property 12: Search filter matches only generic label for protected items

*For any* non-empty search string `q` and any Protected Item, the item SHALL appear in the filtered results if and only if the generic label (derived from the item's category) contains `q` (case-insensitive); the real `title` and `description` SHALL NOT be used for matching.

**Validates: Requirements 8.9, 12.8**

### Property 13: ItemForm validation rejects submissions with empty required fields

*For any* form submission where at least one required field (item name, description, category, location, date, reporter name, contact email) is empty or composed entirely of whitespace, `addItem` SHALL NOT be called and at least one validation error message SHALL be present in the form state.

**Validates: Requirements 10.7, 11.7**

---

## Error Handling

### Form Validation

`ItemForm` performs client-side validation before calling `addItem`. Required fields: item name, description, category, location, date, reporter name, contact email. Image URL is optional. Errors are stored in local component state as a `Record<string, string>` keyed by field name and displayed inline beneath each field. Submission is blocked until all required fields are valid.

### Unknown Item ID

If `/items/[id]` is loaded with an `id` that does not match any item in the store, the page renders a "Item not found" message with a link back to `/items`. No error is thrown.

### Missing Image

If `image_url` is absent or empty, `ItemCard` and the detail page render a gold gradient placeholder div instead of an `<img>` element. No broken image icons appear.

### Store Initialization

The store is initialized synchronously with `MOCK_ITEMS`. There is no async loading state, no loading spinner, and no risk of hydration mismatch for the items array (all rendering that depends on the store uses `"use client"` components).

### Hydration

Because all interactive state is in Zustand (client-only), there is no server/client hydration mismatch risk for dynamic data. Static layout elements (Navbar shell, page headings) are safe to render on the server.

---

## Testing Strategy

### Unit Tests

Focus on pure functions and isolated component behavior:

- `isProtected(item)` — test all combinations of `type` and `category`.
- Store actions (`addItem`, `updateItemStatus`, `setFilters`, `resetFilters`) — test each action in isolation using Zustand's `getState()`.
- Filter logic — test the combined filter predicate with representative inputs covering each filter field and their combinations.
- `ItemCard` rendering — test that protected items render the generic label and hide description/image; test that unprotected items render all fields.
- `ItemForm` validation — test that required-field errors appear and that `addItem` is not called on invalid submission.

### Property-Based Tests

Use a property-based testing library (e.g., [fast-check](https://github.com/dubzzz/fast-check)) to verify the Correctness Properties above. Each property test runs a minimum of 100 iterations.

Tag format for each test: `Feature: ust-lost-and-found, Property {N}: {property_text}`

| Property | Generator inputs | What is verified |
|----------|-----------------|-----------------|
| P1 | Random `Item` with `type="lost"`, category from `HIGH_VALUE_CATEGORIES` | `isProtected` returns `true` |
| P2 | Random `Item` with `type="found"`, any category (including high-value) | `isProtected` returns `false` |
| P3 | Random `Item` with `type="lost"`, category NOT in `HIGH_VALUE_CATEGORIES` | `isProtected` returns `false` |
| P4 | Random valid item payload | New item at index 0, valid `id` and `created_at`, length +1 |
| P5 | Random store state, random target id and status | Only target item's status changes; all others unchanged |
| P6 | Random `Filters` state, random partial update | Non-updated fields unchanged |
| P7 | Random `Filters` state | All fields empty string after reset |
| P8 | Random protected item, random search string | Generic label shown, description/image hidden, "Protected" badge present |
| P9 | Random protected item, random search string | Amber notice block shown, same hiding as P8 |
| P10 | Random filter combination, random items array | All returned items satisfy ALL active filters |
| P11 | Random search string, random unprotected item | Match iff title/description contains query (case-insensitive) |
| P12 | Random search string, random protected item | Match iff generic label contains query; real title/description not used |
| P13 | Random form state with at least one empty required field | `addItem` not called, at least one error present |

### Integration / Smoke Tests

- Verify the app builds without TypeScript errors (`npm run build`).
- Verify ESLint passes (`npm run lint`).
- Smoke-test each route renders without crashing (using React Testing Library or Playwright).
- Verify the Navbar is absent on `/login` and present on all other routes.

### What is NOT tested with PBT

- UI layout and visual styling (use snapshot tests or visual regression tools).
- Responsive breakpoint behavior (manual or Playwright viewport tests).
- Redirect behavior on login/logout (example-based integration tests).
