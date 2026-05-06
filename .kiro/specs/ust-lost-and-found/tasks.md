# Implementation Plan: UST Lost and Found

## Overview

Build a frontend-only Next.js 16+ prototype for the University of Santo Tomas Lost and Found system. All state lives in a single Zustand store seeded with eight mock items. The implementation proceeds from project scaffolding through types, store, shared components, pages, and finally property-based tests — each step building on the last and wiring everything together.

## Tasks

- [x] 1. Scaffold the Next.js project
  - Run `npx create-next-app@latest` with App Router, TypeScript strict mode, `src/` directory, `@` alias, and Tailwind CSS
  - Confirm `tsconfig.json` has `"strict": true` and `"paths": { "@/*": ["./src/*"] }`
  - Add `zustand` as a dependency (`npm install zustand`)
  - Add `fast-check` as a dev dependency (`npm install -D fast-check`)
  - Extend `tailwind.config.ts` with `ust-gold: "#F5B731"` and `ust-black: "#1A1A1A"` under `theme.extend.colors`
  - Verify `npm run dev` starts on port 3000 and `npm run build` succeeds with no errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 2. Define types and constants
  - [x] 2.1 Create `src/types/index.ts` with `Item`, `User`, and `Filters` TypeScript interfaces exactly as specified in the data model
    - `Item`: id, type, title, description, category, location, date, image_url?, status, contact_email, reporter_name, created_at
    - `User`: name, email
    - `Filters`: search, type, category, status — all string union types
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Create `src/lib/constants.ts` with `CATEGORIES`, `LOCATIONS`, `HIGH_VALUE_CATEGORIES`, and `isProtected`
    - Export `CATEGORIES: string[]` with all 9 values
    - Export `LOCATIONS: string[]` with all 14 values
    - Export `HIGH_VALUE_CATEGORIES: Set<string>` with the 5 high-value categories
    - Export `isProtected(item: Item): boolean` — returns `true` iff `item.type === "lost"` and `HIGH_VALUE_CATEGORIES.has(item.category)`
    - _Requirements: 2.4, 2.5, 2.6, 12.1_

  - [x] 2.3 Write property tests for `isProtected` (Properties 1, 2, 3)
    - **Property 1: Lost high-value items are always protected** — generate random `Item` with `type="lost"` and category from `HIGH_VALUE_CATEGORIES`; assert `isProtected` returns `true`
    - **Validates: Requirements 12.1**
    - **Property 2: Found items are never protected** — generate random `Item` with `type="found"` and any category (including high-value); assert `isProtected` returns `false`
    - **Validates: Requirements 12.7**
    - **Property 3: Lost non-high-value items are not protected** — generate random `Item` with `type="lost"` and category NOT in `HIGH_VALUE_CATEGORIES`; assert `isProtected` returns `false`
    - **Validates: Requirements 12.1**

- [x] 3. Implement the Zustand store
  - [x] 3.1 Create `src/store/index.ts` with `MOCK_ITEMS` constant and the Zustand store
    - Define `DEMO_USER: User = { name: "Juan dela Cruz", email: "jdelacruz@ust.edu.ph" }` before the store
    - Define `MOCK_ITEMS: Item[]` with exactly 8 items: mobile phone (lost, open), ID card (lost, open), wallet (lost, claimed), backpack (found, open), keys (lost, resolved), textbook (found, open), umbrella (found, claimed), laptop charger (lost, open)
    - All mock items use Filipino names for `reporter_name` and `ust.edu.ph` addresses for `contact_email`
    - Implement `StoreState` interface with `user`, `items`, `filters` state fields and all actions
    - `signIn`: sets `user` to `DEMO_USER`
    - `signOut`: sets `user` to `null`
    - `addItem`: assigns `crypto.randomUUID()` as `id` and `new Date().toISOString()` as `created_at`, prepends to `items`
    - `updateItemStatus`: finds item by `id` and updates its `status`
    - `setFilters`: merges partial `Filters` into current `filters`
    - `resetFilters`: resets `filters` to all empty strings
    - Initialize `user: null`, `items: MOCK_ITEMS`, `filters: { search: "", type: "", category: "", status: "" }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 3.2 Write property tests for store actions (Properties 4, 5, 6, 7)
    - **Property 4: addItem prepends and assigns unique identity** — generate random valid item payload; call `addItem`; assert new item is at index 0, has non-empty `id`, has valid ISO 8601 `created_at`, and `items.length` increased by 1
    - **Validates: Requirements 3.6**
    - **Property 5: updateItemStatus mutates only the target item** — generate random store state with N items and a valid `id`; call `updateItemStatus`; assert only the target item's `status` changed and all other items are unchanged
    - **Validates: Requirements 3.7**
    - **Property 6: setFilters merges without clobbering unrelated fields** — generate random `Filters` state and random partial update; call `setFilters`; assert only updated fields changed
    - **Validates: Requirements 3.8**
    - **Property 7: resetFilters always produces the empty-string initial state** — generate random `Filters` state; call `resetFilters`; assert all four fields are empty strings
    - **Validates: Requirements 3.9**

- [x] 4. Build shared UI primitives
  - [x] 4.1 Create `src/components/ui/Badge.tsx`
    - Accept `children`, `variant` prop (`"red" | "blue" | "amber" | "green" | "gray"`)
    - Render a small pill with rounded corners, appropriate background/text color per variant, no emoji
    - _Requirements: 14.3, 14.4_

  - [x] 4.2 Create `src/components/ui/Button.tsx`
    - Accept `children`, `variant` prop (`"primary" | "danger" | "outline"`), `onClick`, `type`, `className`
    - `primary`: gold background (`bg-ust-gold`), black text; `danger`: red background, white text; `outline`: transparent with border
    - _Requirements: 14.1, 14.4_

  - [x] 4.3 Create `src/components/ui/Card.tsx`
    - Accept `children` and optional `className`
    - Render a white card with rounded corners and subtle box shadow
    - _Requirements: 14.3, 14.5_

- [x] 5. Build the Navbar component
  - Create `src/components/Navbar.tsx` as a `"use client"` component
  - Read `user` from the Zustand store
  - Display brand name "UST Lost and Found", links to `/dashboard`, `/items`, `/report/lost`
  - When `user` is non-null, display `user.name` and a sign-out button
  - Sign-out button calls `signOut()` then `router.push('/login')`
  - Style with `bg-ust-black` background and `text-ust-gold` accents
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 6. Build the StatCard component
  - Create `src/components/StatCard.tsx` as a presentational component (no `"use client"` needed)
  - Accept `label: string`, `value: number`, `accent?: string` props
  - Render a Card with the numeric value prominently displayed and the label below
  - Apply `accent` as a Tailwind color class on the value text (default to `text-ust-gold`)
  - _Requirements: 7.5_

- [x] 7. Build the ItemCard component
  - Create `src/components/ItemCard.tsx` as a `"use client"` component
  - Accept `item: Item` prop
  - Call `isProtected(item)` to determine privacy mode
  - If protected: display generic label (e.g., `"Lost electronic device"`, `"Lost bag or wallet"`) derived from category, hide description and image, show amber `"Protected"` badge
  - If not protected: display real title, description, and image (or gold gradient placeholder if `image_url` is absent)
  - Always render: type badge (red for `lost`, blue for `found`), status badge, category pill, location, date, link to `/items/[id]`
  - Use Card, Badge primitives from `src/components/ui/`
  - _Requirements: 12.2, 12.3, 12.4, 12.7, 14.3, 14.4_

  - [x] 7.1 Write property test for ItemCard privacy rendering (Property 8)
    - **Property 8: ItemCard hides all sensitive details for protected items** — generate random protected item; render `ItemCard`; assert generic label shown, real description absent, image absent, amber "Protected" badge present
    - **Validates: Requirements 12.2, 12.3, 12.4**

- [x] 8. Build the ItemForm component
  - Create `src/components/ItemForm.tsx` as a `"use client"` component
  - Accept `type: "lost" | "found"` prop
  - Read `user` from the Zustand store; pre-fill `reporter_name` and `contact_email` if `user` is non-null
  - Fields: item name, description, category (select from `CATEGORIES`), location (select from `LOCATIONS`), date, image URL (optional), reporter name, contact email
  - Maintain local `errors: Record<string, string>` state for per-field validation messages
  - On submit: validate all required fields (non-empty, non-whitespace); if invalid, set errors and do NOT call `addItem`
  - On valid submit: call `addItem` with the new item (`type` from prop, `status: "open"`), then `router.push('/dashboard')`
  - Submit button: red when `type === "lost"`, gold (`bg-ust-gold`) when `type === "found"`
  - Display validation errors inline beneath each field
  - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x] 8.1 Write property test for ItemForm validation (Property 13)
    - **Property 13: ItemForm validation rejects submissions with empty required fields** — generate random form state with at least one required field empty or whitespace-only; simulate submit; assert `addItem` was NOT called and at least one error message is present
    - **Validates: Requirements 10.7, 11.7**

- [x] 9. Implement the root layout and redirect
  - [x] 9.1 Create `src/app/layout.tsx` as a Server Component
    - Import global CSS, set `<html lang="en">` and `<body>` with `bg-gray-50` base
    - Render `<NavbarWrapper />` above `{children}`
    - _Requirements: 5.2_

  - [x] 9.2 Create a `NavbarWrapper` client component (inline in `layout.tsx` or as a separate file)
    - Add `"use client"` directive
    - Use `usePathname()` from `next/navigation`
    - Render `<Navbar />` only when `pathname !== "/login"`
    - _Requirements: 5.2, 6.6_

  - [x] 9.3 Create `src/app/page.tsx` that redirects to `/dashboard`
    - Use `redirect('/dashboard')` from `next/navigation` (Server Component)
    - _Requirements: 5.1_

- [x] 10. Implement the Login page (`/login`)
  - Create `src/app/login/page.tsx` as a `"use client"` component
  - Full-screen `bg-ust-black` (`#1A1A1A`) background
  - Centered circular element styled in `bg-ust-gold` representing the UST logo
  - White Card containing two buttons: "Continue with Google" and "Continue with Demo Account"
  - Both buttons call `signIn()` then `router.push('/dashboard')` — no real OAuth or network request
  - No Navbar rendered (handled by `NavbarWrapper` in layout)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 11. Implement the Dashboard page (`/dashboard`)
  - Create `src/app/dashboard/page.tsx` as a `"use client"` component
  - Hero Banner: dark gradient background, title "UST Lost and Found", subtitle, three CTA buttons — "Report Lost" (red, → `/report/lost`), "Report Found" (gold, → `/report/found`), "Browse All" (outline, → `/items`)
  - Four StatCards: total items, lost items, found items, open items — all derived from `items` in the store
  - "Recently Lost Items" section: up to 4 most recently created `lost` items rendered as `ItemCard` components
  - "Recently Found Items" section: up to 4 most recently created `found` items rendered as `ItemCard` components
  - Responsive grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` for item card sections
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [x] 12. Implement the Items Catalog page (`/items`)
  - Create `src/app/items/page.tsx` as a `"use client"` component
  - On mount, read `type` query param from `useSearchParams()` and call `setFilters({ type })` if present
  - Filter Bar: text search input, type select, category select, status select, "Clear Filters" button — each control calls `setFilters` on change; "Clear Filters" calls `resetFilters`
  - Filter Bar stacks vertically on mobile (`flex-col`) and displays in a row at `md:` (`flex-row`)
  - Derive filtered items: apply `search`, `type`, `category`, `status` filters simultaneously from store `filters`
  - Search matching: for unprotected items match against `title` and `description`; for protected items match against the generic label only (not real title/description)
  - Display filtered item count above the grid
  - Render filtered items in `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` grid using `ItemCard`
  - When no items match, display an empty state message
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 12.8_

  - [x] 12.1 Write property tests for filter logic (Properties 10, 11, 12)
    - **Property 10: All active filters are applied simultaneously** — generate random filter combination and random items array; assert every item in the filtered result satisfies ALL active filter conditions
    - **Validates: Requirements 8.8**
    - **Property 11: Search filter matches title/description case-insensitively for unprotected items** — generate random search string and random unprotected item; assert item appears in results iff title or description contains query (case-insensitive)
    - **Validates: Requirements 8.9**
    - **Property 12: Search filter matches only generic label for protected items** — generate random search string and random protected item; assert item appears iff generic label contains query; real title/description must not be used for matching
    - **Validates: Requirements 8.9, 12.8**

- [x] 13. Implement the Item Detail page (`/items/[id]`)
  - Create `src/app/items/[id]/page.tsx` as a `"use client"` component
  - Use `use(params)` (React 19 API) to unwrap the `params` Promise and extract `id`
  - Look up item from store by `id`; if not found, render "Item not found" message with a link back to `/items`
  - Hero: render `<img>` if `image_url` is present, otherwise render a gold gradient placeholder `<div>`
  - Type badge (red for `lost`, blue for `found`), status badge, category pill
  - Apply Privacy Rule: if `isProtected(item)`, show generic label, hide description and image, show amber "Protected" badge and amber notice block explaining private ownership verification
  - If not protected: show real title and description
  - 2x2 info grid (single column at 375px, 2-column at `md:`): location, date, reporter name, contact email
  - When `user` is non-null and `item.status === "open"`: show "Mark as Claimed" (gold) and "Mark as Resolved" (green) buttons; each calls `updateItemStatus` with the appropriate status
  - When `user` is null: do not render status action buttons
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 12.5, 12.6, 13.7_

  - [x] 13.1 Write property test for Item Detail privacy rendering (Property 9)
    - **Property 9: Item Detail Page applies privacy rule and shows notice for protected items** — generate random protected item; render the detail page component; assert amber notice block is shown and same title/description/image hiding as Property 8 applies
    - **Validates: Requirements 12.5, 12.6**

- [x] 14. Implement the Report Lost page (`/report/lost`)
  - Create `src/app/report/lost/page.tsx`
  - Render `<ItemForm type="lost" />` with a page heading "Report a Lost Item"
  - No additional logic needed — all behavior is in `ItemForm`
  - _Requirements: 10.1_

- [x] 15. Implement the Report Found page (`/report/found`)
  - Create `src/app/report/found/page.tsx`
  - Render `<ItemForm type="found" />` with a page heading "Report a Found Item"
  - No additional logic needed — all behavior is in `ItemForm`
  - _Requirements: 11.1_

- [-] 16. Checkpoint — Ensure all tests pass
  - Run `npm run lint` and fix any ESLint errors
  - Run `npm run build` and resolve any TypeScript errors
  - Verify all routes render without crashing: `/login`, `/dashboard`, `/items`, `/items/[id]` (any valid id), `/report/lost`, `/report/found`
  - Verify Navbar is absent on `/login` and present on all other routes
  - Ask the user if any questions arise before proceeding

- [~] 17. Write all remaining property-based tests
  - Create a test file (e.g., `src/__tests__/properties.test.ts`) using `fast-check`
  - Each test uses the tag format: `Feature: ust-lost-and-found, Property {N}: {property_text}`
  - Minimum 100 iterations per property (`numRuns: 100`)
  - Implement any property tests not already written in earlier tasks:
    - Properties 1–3: `isProtected` (if not already written in task 2.3)
    - Properties 4–7: store actions (if not already written in task 3.2)
    - Property 8: `ItemCard` privacy rendering (if not already written in task 7.1)
    - Property 9: Item Detail privacy rendering (if not already written in task 13.1)
    - Properties 10–12: filter logic (if not already written in task 12.1)
    - Property 13: `ItemForm` validation (if not already written in task 8.1)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 3.6, 3.7, 3.8, 3.9, 8.8, 8.9, 10.7, 11.7_

- [~] 18. Final checkpoint — Build, lint, and verify
  - Run `npm run lint` — must report zero ESLint errors
  - Run `npm run build` — must complete with no TypeScript errors and no build failures
  - Confirm the dev server starts with `npm run dev` on port 3000
  - Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- The `NavbarWrapper` pattern keeps the root layout a Server Component while enabling pathname-based conditional rendering
- All `"use client"` components import the Zustand store directly — no Provider wrappers needed
- `use(params)` is the React 19 / Next.js 16 way to unwrap dynamic route params in client components
- Mock seed data is defined as a constant in `src/store/index.ts` before the store definition — not in a separate file
