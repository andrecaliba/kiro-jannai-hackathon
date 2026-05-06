# Requirements Document

## Introduction

UST Lost and Found is a frontend-only prototype web application for the University of Santo Tomas. It allows students to report lost or found items, browse a catalog of all reported items, and update item statuses. The application uses no real backend, database, or authentication — all data lives in client-side Zustand state seeded with mock data. Login is simulated by setting a hardcoded demo user. Branding follows UST colors (gold `#F5B731`, black `#1A1A1A`) and the clean, card-based visual style of the MyUSTe Portal.

---

## Glossary

- **App**: The UST Lost and Found Next.js web application.
- **User**: A visitor who has completed the fake login flow and has a session in the store.
- **Guest**: A visitor who has not logged in.
- **Item**: A lost or found object reported through the App, conforming to the Item data model.
- **Store**: The single Zustand client-side state store holding user state, items array, and filters.
- **ItemCard**: The reusable card component used to display an Item in any grid view.
- **ItemForm**: The shared form component used on both `/report/lost` and `/report/found`.
- **Navbar**: The global navigation bar rendered on all routes except `/login`.
- **Privacy Rule**: The rule that anonymizes high-value lost items in all public views.
- **High-Value Category**: Any of the following item categories subject to the Privacy Rule: Electronics, Bags and Wallets, ID and Cards, Accessories, Documents.
- **Protected Item**: A lost Item whose category is a High-Value Category, triggering the Privacy Rule.
- **Open Item**: An Item whose status is `open`.
- **Claimed Item**: An Item whose status is `claimed`.
- **Resolved Item**: An Item whose status is `resolved`.
- **Mock Data**: The eight hardcoded seed Items defined in the Store file, used to populate the App on first load.
- **Demo User**: The hardcoded user object `{ name: "Juan dela Cruz", email: "jdelacruz@ust.edu.ph" }` set in the Store on login.
- **StatCard**: A dashboard component displaying a single aggregate count.
- **Hero Banner**: The dark gradient banner at the top of the dashboard page.
- **Filter Bar**: The row of controls on `/items` used to narrow the displayed Item list.

---

## Requirements

### Requirement 1: Project Bootstrap and Technology Constraints

**User Story:** As a developer, I want the project to use a defined, minimal tech stack, so that the prototype remains simple and free of unnecessary dependencies.

#### Acceptance Criteria

1. THE App SHALL be built with Next.js 16 or newer using the App Router, TypeScript in strict mode, a `src/` directory layout, and the `@` path alias mapped to `src/`.
2. THE App SHALL use Tailwind CSS as the sole styling mechanism, with no CSS modules or styled-components.
3. THE App SHALL use a single Zustand store as the sole state management solution.
4. THE App SHALL NOT include Axios, React Query, TanStack Query, NextAuth, FastAPI, SQLAlchemy, any database driver, or any ORM.
5. WHEN `npm run dev` is executed, THE App SHALL start a development server on port 3000.
6. WHEN `npm run build` is executed, THE App SHALL produce a successful production build with no TypeScript errors.
7. WHEN `npm run lint` is executed, THE App SHALL report no ESLint errors.

---

### Requirement 2: Data Model

**User Story:** As a developer, I want a well-defined Item data model, so that all parts of the App share a consistent structure.

#### Acceptance Criteria

1. THE App SHALL define an `Item` TypeScript type with the following fields: `id` (string, UUID), `type` (`"lost" | "found"`), `title` (string), `description` (string), `category` (string), `location` (string), `date` (string, ISO 8601), `image_url` (optional string), `status` (`"open" | "claimed" | "resolved"`), `contact_email` (string), `reporter_name` (string), `created_at` (string, ISO 8601).
2. THE App SHALL define a `User` TypeScript type with the fields: `name` (string) and `email` (string).
3. THE App SHALL define a `Filters` TypeScript type with the fields: `search` (string), `type` (`"" | "lost" | "found"`), `category` (string), `status` (`"" | "open" | "claimed" | "resolved"`).
4. THE App SHALL define the following category values as a constant: Electronics, Clothing, Books and Notes, ID and Cards, Keys, Bags and Wallets, Accessories, Documents, Others.
5. THE App SHALL define the following location values as a constant: Main Building, Benavides Building, Albertus Magnus Building, Roque Ruano Building, Thomas Aquinas Research Complex, Central Laboratory, Tan Yan Kee Student Center, UST Gym, Quadricentennial Pavilion, UST Library, Plaza Mayor, Lovers Lane, Arch of the Centuries, Other.
6. THE App SHALL define the High-Value Categories as a constant set containing: Electronics, Bags and Wallets, ID and Cards, Accessories, Documents.

---

### Requirement 3: Zustand Store

**User Story:** As a developer, I want a single Zustand store managing all client state, so that every component reads from and writes to one consistent source of truth.

#### Acceptance Criteria

1. THE Store SHALL hold a `user` field of type `User | null`, initialized to `null`.
2. THE Store SHALL hold an `items` field of type `Item[]`, initialized with the Mock Data.
3. THE Store SHALL hold a `filters` field of type `Filters`, initialized with all fields set to empty strings.
4. THE Store SHALL expose a `signIn` action that sets `user` to the Demo User object.
5. THE Store SHALL expose a `signOut` action that sets `user` to `null`.
6. THE Store SHALL expose an `addItem` action that accepts an `Item` object, assigns it a new `crypto.randomUUID()` id and a `created_at` timestamp of the current ISO date-time, and prepends it to the `items` array.
7. THE Store SHALL expose an `updateItemStatus` action that accepts an item `id` and a new `status` value, and updates the matching Item's `status` field in the `items` array.
8. THE Store SHALL expose a `setFilters` action that accepts a partial `Filters` object and merges it into the current `filters` state.
9. THE Store SHALL expose a `resetFilters` action that resets `filters` to all empty strings.

---

### Requirement 4: Mock Seed Data

**User Story:** As a developer, I want the store seeded with realistic mock items, so that the prototype is immediately demonstrable without manual data entry.

#### Acceptance Criteria

1. THE Store SHALL be seeded with exactly 8 mock Items on initialization.
2. THE Mock Data SHALL include at least one item of each of the following: a mobile phone, an ID card, a wallet, a backpack, a set of keys, and a textbook.
3. THE Mock Data SHALL include a mix of `lost` and `found` type items.
4. THE Mock Data SHALL include items with `open`, `claimed`, and `resolved` statuses.
5. THE Mock Data SHALL use Filipino names for `reporter_name` fields and `ust.edu.ph` email addresses for `contact_email` fields.
6. THE Mock Data SHALL use realistic, specific descriptions for each item.
7. WHEN the App initializes, THE Store SHALL contain all 8 mock Items without any fetch or async operation.

---

### Requirement 5: Routing and Navigation

**User Story:** As a student, I want clear navigation between pages, so that I can move through the App without confusion.

#### Acceptance Criteria

1. WHEN a Guest visits `/`, THE App SHALL redirect the Guest to `/dashboard`.
2. THE App SHALL render the Navbar on all routes except `/login`.
3. THE Navbar SHALL display the UST Lost and Found brand name, a link to `/dashboard`, a link to `/items`, and a link to `/report/lost`.
4. WHEN a User is signed in, THE Navbar SHALL display the signed-in user's name and a sign-out button.
5. WHEN the sign-out button is clicked, THE Navbar SHALL call the `signOut` action and redirect the User to `/login`.
6. THE App SHALL define the following routes: `/login`, `/dashboard`, `/items`, `/items/[id]`, `/report/lost`, `/report/found`.

---

### Requirement 6: Login Page (`/login`)

**User Story:** As a student, I want a login page, so that I can enter the App with a simulated identity.

#### Acceptance Criteria

1. THE Login Page SHALL display a full-screen black (`#1A1A1A`) background.
2. THE Login Page SHALL display a centered circular UST logo element styled in UST gold (`#F5B731`).
3. THE Login Page SHALL display a white card containing a "Continue with Google" button and a "Continue with Demo Account" button.
4. WHEN the "Continue with Google" button is clicked, THE Login Page SHALL call the `signIn` action and redirect to `/dashboard`.
5. WHEN the "Continue with Demo Account" button is clicked, THE Login Page SHALL call the `signIn` action and redirect to `/dashboard`.
6. THE Login Page SHALL NOT render the Navbar.
7. THE Login Page SHALL NOT perform any real OAuth or network request.

---

### Requirement 7: Dashboard Page (`/dashboard`)

**User Story:** As a student, I want a dashboard overview, so that I can quickly see the state of lost and found items and take action.

#### Acceptance Criteria

1. THE Dashboard Page SHALL display a Hero Banner with a dark gradient background, a title, a subtitle, and three call-to-action buttons: "Report Lost" (red), "Report Found" (gold), and "Browse All" (outlined).
2. WHEN "Report Lost" is clicked, THE Dashboard Page SHALL navigate to `/report/lost`.
3. WHEN "Report Found" is clicked, THE Dashboard Page SHALL navigate to `/report/found`.
4. WHEN "Browse All" is clicked, THE Dashboard Page SHALL navigate to `/items`.
5. THE Dashboard Page SHALL display four StatCards showing: total item count, lost item count, found item count, and open item count — all derived from the Store's `items` array.
6. THE Dashboard Page SHALL display a "Recently Lost Items" section showing up to 4 of the most recently created lost Items as ItemCards.
7. THE Dashboard Page SHALL display a "Recently Found Items" section showing up to 4 of the most recently created found Items as ItemCards.
8. WHEN a new Item is added to the Store, THE Dashboard Page SHALL reflect the updated counts and recent item lists without a page reload.
9. THE Dashboard Page SHALL be responsive, displaying a single-column layout at 375px, a two-column grid at 768px, and a four-column grid at 1280px for item card sections.

---

### Requirement 8: Items Catalog Page (`/items`)

**User Story:** As a student, I want to browse and filter all reported items, so that I can find a specific lost or found item.

#### Acceptance Criteria

1. THE Items Page SHALL display a Filter Bar containing: a text search input, a type select (`lost` / `found`), a category select (all defined categories), a status select (`open` / `claimed` / `resolved`), and a "Clear Filters" button.
2. WHEN the Items Page mounts, THE Items Page SHALL read the `type` query parameter from the URL and apply it as the initial type filter.
3. WHEN any filter control changes, THE Items Page SHALL update the Store's `filters` state via `setFilters`.
4. WHEN the "Clear Filters" button is clicked, THE Items Page SHALL call `resetFilters` and clear all filter control values.
5. THE Items Page SHALL display the count of currently filtered Items above the grid.
6. THE Items Page SHALL display filtered Items in a responsive grid: one column at 375px, two columns at 768px, three columns at 1280px.
7. WHEN no Items match the active filters, THE Items Page SHALL display an empty state message.
8. THE Items Page SHALL apply all active filters simultaneously (search, type, category, status).
9. WHEN the search filter is active, THE Items Page SHALL match Items whose `title` or `description` contains the search string (case-insensitive), subject to the Privacy Rule for Protected Items.

---

### Requirement 9: Item Detail Page (`/items/[id]`)

**User Story:** As a student, I want to view the full details of a reported item, so that I can determine if it is mine or contact the reporter.

#### Acceptance Criteria

1. THE Item Detail Page SHALL use `use(params)` (React 19 API) to unwrap the dynamic `id` route parameter.
2. THE Item Detail Page SHALL display a hero image using `image_url` if present, or a gold gradient placeholder if `image_url` is absent.
3. THE Item Detail Page SHALL display a type badge: red for `lost`, blue for `found`.
4. THE Item Detail Page SHALL display a status badge reflecting the Item's current `status`.
5. THE Item Detail Page SHALL display the Item's category as a pill element.
6. THE Item Detail Page SHALL display the Item's `title` and `description`.
7. THE Item Detail Page SHALL display a 2x2 information grid containing: location, date, reporter name, and contact email.
8. WHEN the Item is a Protected Item, THE Item Detail Page SHALL apply the Privacy Rule to the title, description, image, and SHALL display an amber notice block explaining that details are hidden and that the reporter will verify ownership privately.
9. WHEN the signed-in User views an Item whose `status` is `open`, THE Item Detail Page SHALL display a "Mark as Claimed" button (gold) and a "Mark as Resolved" button (green).
10. WHEN "Mark as Claimed" is clicked, THE Item Detail Page SHALL call `updateItemStatus` with `"claimed"` and update the status badge without a page reload.
11. WHEN "Mark as Resolved" is clicked, THE Item Detail Page SHALL call `updateItemStatus` with `"resolved"` and update the status badge without a page reload.
12. WHEN a Guest views an Item, THE Item Detail Page SHALL NOT display the "Mark as Claimed" or "Mark as Resolved" buttons.

---

### Requirement 10: Report Lost Page (`/report/lost`)

**User Story:** As a student, I want to report a lost item, so that others can help me find it.

#### Acceptance Criteria

1. THE Report Lost Page SHALL render the ItemForm component with `type` set to `"lost"`.
2. THE ItemForm SHALL display a submit button styled in red when `type` is `"lost"`.
3. WHEN a User is signed in, THE ItemForm SHALL pre-fill the reporter name field with `user.name` and the contact email field with `user.email`.
4. THE ItemForm SHALL include the following fields: item name, description, category (select from defined categories), location (select from defined locations), date, image URL (optional), reporter name, contact email.
5. WHEN the form is submitted with all required fields valid, THE ItemForm SHALL call `addItem` with a new Item object of type `"lost"`, status `"open"`, and the current timestamp as `created_at`.
6. WHEN `addItem` is called successfully, THE Report Lost Page SHALL redirect to `/dashboard`.
7. IF a required field is empty on submission, THEN THE ItemForm SHALL display a validation error for that field and SHALL NOT call `addItem`.

---

### Requirement 11: Report Found Page (`/report/found`)

**User Story:** As a student, I want to report a found item, so that the owner can reclaim it.

#### Acceptance Criteria

1. THE Report Found Page SHALL render the ItemForm component with `type` set to `"found"`.
2. THE ItemForm SHALL display a submit button styled in gold (`#F5B731`) when `type` is `"found"`.
3. WHEN a User is signed in, THE ItemForm SHALL pre-fill the reporter name field with `user.name` and the contact email field with `user.email`.
4. THE ItemForm SHALL include the same fields as defined in Requirement 10, Criterion 4.
5. WHEN the form is submitted with all required fields valid, THE ItemForm SHALL call `addItem` with a new Item object of type `"found"`, status `"open"`, and the current timestamp as `created_at`.
6. WHEN `addItem` is called successfully, THE Report Found Page SHALL redirect to `/dashboard`.
7. IF a required field is empty on submission, THEN THE ItemForm SHALL display a validation error for that field and SHALL NOT call `addItem`.

---

### Requirement 12: Privacy Rule for High-Value Lost Items

**User Story:** As a student reporting a high-value lost item, I want my item's sensitive details hidden from the public, so that only the true owner can identify and claim it.

#### Acceptance Criteria

1. THE App SHALL define a pure function that accepts an Item and returns a boolean indicating whether the Privacy Rule applies (i.e., `type === "lost"` and category is in the High-Value Categories set).
2. WHEN an ItemCard renders a Protected Item, THE ItemCard SHALL replace the displayed title with a generic label (e.g., "Lost electronic device", "Lost bag or wallet") derived from the item's category.
3. WHEN an ItemCard renders a Protected Item, THE ItemCard SHALL hide the description and image.
4. WHEN an ItemCard renders a Protected Item, THE ItemCard SHALL display an amber "Protected" badge.
5. WHEN the Item Detail Page renders a Protected Item, THE Item Detail Page SHALL apply criteria 2, 3, and 4 above.
6. WHEN the Item Detail Page renders a Protected Item, THE Item Detail Page SHALL display an amber notice block with text explaining that item details are hidden and that the reporter will verify ownership privately.
7. THE App SHALL NEVER apply the Privacy Rule to found Items, regardless of category.
8. WHEN the search filter on `/items` is active, THE Items Page SHALL match Protected Items only against their generic title, not their real title or description.

---

### Requirement 13: Responsiveness

**User Story:** As a student using any device, I want the App to be usable on mobile, tablet, and desktop screens, so that I can access it from my phone or laptop.

#### Acceptance Criteria

1. THE App SHALL render all pages without horizontal overflow at a viewport width of 375px.
2. THE App SHALL render all pages without horizontal overflow at a viewport width of 768px.
3. THE App SHALL render all pages without horizontal overflow at a viewport width of 1280px.
4. THE ItemCard grid on `/dashboard` SHALL display one column at 375px, two columns at 768px, and four columns at 1280px.
5. THE ItemCard grid on `/items` SHALL display one column at 375px, two columns at 768px, and three columns at 1280px.
6. THE Filter Bar on `/items` SHALL stack controls vertically at 375px and display them in a row at 768px and wider.
7. THE info grid on `/items/[id]` SHALL display as a 2x2 grid at 768px and wider, and as a single column at 375px.

---

### Requirement 14: Branding and Visual Style

**User Story:** As a student, I want the App to look and feel like an official UST product, so that it feels familiar and trustworthy.

#### Acceptance Criteria

1. THE App SHALL use UST gold (`#F5B731`) as the primary accent color for interactive elements, highlights, and branding.
2. THE App SHALL use UST black (`#1A1A1A`) as the primary background color for the login page and dark UI elements.
3. THE App SHALL use rounded corners and subtle box shadows on all card components.
4. THE App SHALL NOT display any emoji characters anywhere in the UI.
5. THE App SHALL use a clean, card-based visual layout consistent with the MyUSTe Portal style.
