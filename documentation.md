# NasaUSTe — Lost and Found System Documentation

NasaUSTe is a frontend-only prototype web application for the University of Santo Tomas (UST). It lets students report lost or found items and browse a catalog of active reports. All data lives in client-side state — there is no backend, no database, and no real authentication.

---

## Table of Contents

1. [User Roles](#1-user-roles)
2. [Navigation](#2-navigation)
3. [Authentication](#3-authentication)
4. [Dashboard](#4-dashboard)
5. [Browsing the Items Catalog](#5-browsing-the-items-catalog)
6. [Reporting a Lost Item](#6-reporting-a-lost-item)
7. [Reporting a Found Item](#7-reporting-a-found-item)
8. [Item Detail Page](#8-item-detail-page)
9. [Item Lifecycle](#9-item-lifecycle)
10. [Claim Verification Flow](#10-claim-verification-flow)
11. [Privacy Rules for High-Value Items](#11-privacy-rules-for-high-value-items)
12. [Reference: Categories and Locations](#12-reference-categories-and-locations)
13. [Data Model](#13-data-model)

---

## 1. User Roles

| Role | Description |
|---|---|
| **Signed-in User** | A visitor who has completed the login flow. Can report items, mark items as claimed or resolved, and initiate the claim verification flow. |
| **Reporter** | The signed-in user who originally submitted an item report. Identified by matching `contact_email` on the item. |
| **Claimant** | A signed-in user (other than the reporter) who believes an item belongs to them and submits a claim answer. |

---

## 2. Navigation

The top navigation bar is visible on all pages except `/login`. It contains:

- **NasaUSTe** (brand link) — navigates to the Dashboard
- **Dashboard** — overview and recent items
- **Browse Items** — full items catalog with filters
- **Report Lost** — form to report a lost item
- **User name + Sign Out** — shown only when signed in

---

## 3. Authentication

Authentication is simulated. No real credentials are checked.

**Sign-in process:**

1. Navigate to `/login` (or be redirected there automatically).
2. Click **Continue with Google** or **Continue with Demo Account** — both buttons perform the same action.
3. The store sets the session to a hardcoded demo user (`Juan dela Cruz`, `jdelacruz@ust.edu.ph`).
4. The user is redirected to the Dashboard.

**Sign-out process:**

1. Click **Sign Out** in the navigation bar.
2. The session is cleared from the store.
3. The user is redirected to `/login`.

---

## 4. Dashboard

The Dashboard (`/dashboard`) is the home page of the application.

**Contents:**

- **Hero banner** with the app name, a short description, and three action buttons: Report Lost, Report Found, Browse All.
- **Stats row** showing four counters: Total Items, Lost Items, Found Items, Open Items. These update in real time as items are added or their status changes.
- **Recently Lost Items** — up to 4 of the most recently created lost items, displayed as cards.
- **Recently Found Items** — up to 4 of the most recently created found items, displayed as cards.

Clicking any item card navigates to that item's detail page.

---

## 5. Browsing the Items Catalog

The Items Catalog (`/items`) shows all reported items and supports filtering.

**Filter controls:**

| Control | Behavior |
|---|---|
| Search box | Case-insensitive text search. Matches against title and description for unprotected items. For protected items, matches against the generic category label only (e.g., "Lost electronic device"). The `secret_detail` field is never included in search matching. |
| Type dropdown | Filter by `lost` or `found`. |
| Category dropdown | Filter by one of the 9 defined categories. |
| Status dropdown | Filter by `open`, `claimed`, or `resolved`. |
| Clear Filters button | Resets all filters to their empty defaults. |

All active filters are applied simultaneously. The result count is shown above the grid.

When no items match the active filters, an empty state message is displayed.

---

## 6. Reporting a Lost Item

Navigate to `/report/lost` via the navbar or the Dashboard hero button.

**Required fields:**

| Field | Notes |
|---|---|
| Item Name | The specific name of the item (e.g., "Black Samsung Galaxy S23"). |
| Description | A detailed description to help identify the item. |
| Category | Select from the 9 defined categories. |
| Location | Select from the 14 defined campus locations. |
| Date | The date the item was lost. |
| Reporter Name | Pre-filled with the signed-in user's name if available. |
| Contact Email | Pre-filled with the signed-in user's email if available. |

**Optional fields:**

| Field | Notes |
|---|---|
| Image URL | A direct link to a photo of the item. Hidden for protected items in public views. |
| Secret Verification Detail | A hidden question or fact only the true owner would know (e.g., "What color is the phone case?"). Never shown publicly. See [Claim Verification Flow](#10-claim-verification-flow). |

**Validation:** All required fields must be non-empty and non-whitespace. Inline error messages appear beneath any field that fails validation. The form does not submit until all required fields are valid.

**On successful submission:** The item is added to the store with `status: "open"` and the user is redirected to the Dashboard.

---

## 7. Reporting a Found Item

Navigate to `/report/found` via the Dashboard hero button.

The form is identical to the lost item form with two differences:

- The page title reads "Report a Found Item".
- The submit button is styled in UST gold instead of red.
- Found items are **never** subject to the privacy rule — their title, description, and image are always shown publicly.

The same required and optional fields apply. On successful submission, the item is added with `status: "open"` and the user is redirected to the Dashboard.

---

## 8. Item Detail Page

Each item has a detail page at `/items/[id]`. It is accessible to both guests and signed-in users.

**Page sections:**

| Section | Visibility |
|---|---|
| Hero image (or gold gradient placeholder) | Always visible. Image is hidden for protected items. |
| Badges (Lost/Found, status, Protected, category) | Always visible. |
| Title | Always visible. Replaced with a generic label for protected items. |
| Privacy notice block | Protected items only. Explains that details are hidden and ownership is verified privately. |
| Description | Unprotected items only. |
| Info grid (location, date, reporter, contact email) | Always visible. |
| Verification Panel | Signed-in users only, when a claim answer has been submitted. |
| Action buttons (Mark as Claimed, Mark as Resolved, Claim This Item) | Signed-in users only, when item status is `open`. |
| Claim Flow panel | Signed-in users only, when "Claim This Item" is clicked. |
| Confirmation message | Shown after a claim answer is successfully submitted. |

---

## 9. Item Lifecycle

Every item starts with `status: "open"` when reported. A signed-in user can advance the status from the item detail page.

```
open  ──►  claimed  ──►  resolved
  └──────────────────────►
```

**Status transitions:**

| Action | Button | Result |
|---|---|---|
| Mark as Claimed | "Mark as Claimed" | Status changes to `claimed`. |
| Mark as Resolved | "Mark as Resolved" | Status changes to `resolved`. |

Both buttons are shown to any signed-in user viewing an `open` item. There is no restriction to the reporter only — the app has no real authentication to enforce ownership.

Status transitions preserve all other fields on the item, including `claim_answer` and `claimant_name` if they were set.

---

## 10. Claim Verification Flow

The claim verification flow allows a signed-in user to prove ownership of an item by answering a secret question set by the reporter.

### Prerequisites

The "Claim This Item" button is shown only when **all** of the following are true:

- The user is signed in.
- The item's `status` is `open`.
- The item has a `secret_detail` set (the reporter added a verification question).
- No claim answer has been submitted yet (`claim_answer` is undefined).
- The signed-in user is not the reporter (their email does not match `contact_email`).

### Step-by-step flow

**1. Reporter sets a secret detail (at report time)**

When submitting a lost or found item, the reporter optionally fills in the "Secret Verification Detail" field. This value is stored on the item but never displayed in the catalog, item cards, or any public section of the detail page.

**2. Claimant initiates the claim**

On the item detail page, the claimant clicks "Claim This Item". The Claim Flow panel appears inline on the page without any navigation.

**3. Secret detail is revealed**

The Claim Flow panel displays the item's `secret_detail` text as a visible prompt. This is the only place in the application where `secret_detail` is rendered.

**4. Claimant submits an answer**

The claimant types their answer in the text area and clicks "Submit Answer".

- If the answer is empty or whitespace-only, a validation error is shown and the store is not updated.
- If the answer is non-empty, it is trimmed and stored on the item alongside the claimant's name.

**5. Confirmation**

The Claim Flow panel closes and a green confirmation message appears: "Your answer has been recorded. The reporter will review it and be in touch to confirm ownership."

**6. Reporter reviews the answer**

The Verification Panel appears on the item detail page for any signed-in user. It shows:

- **Claimant** — the name of the user who submitted the answer.
- **Answer** — the text they submitted.

The reporter can then verify ownership offline and use "Mark as Claimed" or "Mark as Resolved" to close out the item.

**Cancelling the flow**

Clicking "Cancel" in the Claim Flow panel closes the panel and restores the "Claim This Item" button. No changes are made to the item.

---

## 11. Privacy Rules for High-Value Items

Lost items in the following categories are considered **protected** and have their details hidden in all public views:

- Electronics
- Bags and Wallets
- ID and Cards
- Accessories
- Documents

**Found items are never protected**, regardless of category.

**What is hidden for protected items:**

| Location | What changes |
|---|---|
| Item cards (catalog, dashboard) | Title replaced with a generic label (e.g., "Lost electronic device"). Description hidden. Image replaced with a gold gradient. "Protected" amber badge shown. |
| Item detail page | Same title replacement. Description hidden. Image replaced with gold gradient. Amber privacy notice block shown. |
| Search filter | Matching is done against the generic label only, not the real title or description. |

**What is never hidden:**

- Location, date, reporter name, contact email — always visible.
- `secret_detail` — stored privately and only revealed inside the Claim Flow to signed-in users.

---

## 12. Reference: Categories and Locations

**Categories**

| Category | Protected (lost items) |
|---|---|
| Electronics | Yes |
| Bags and Wallets | Yes |
| ID and Cards | Yes |
| Accessories | Yes |
| Documents | Yes |
| Clothing | No |
| Books and Notes | No |
| Keys | No |
| Others | No |

**Campus Locations**

- Main Building
- Benavides Building
- Albertus Magnus Building
- Roque Ruano Building
- Thomas Aquinas Research Complex
- Central Laboratory
- Tan Yan Kee Student Center
- UST Gym
- Quadricentennial Pavilion
- UST Library
- Plaza Mayor
- Lovers Lane
- Arch of the Centuries
- Other

---

## 13. Data Model

### Item

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` (UUID) | Yes | Auto-generated on submission. |
| `type` | `"lost"` \| `"found"` | Yes | Whether the item was lost or found. |
| `title` | `string` | Yes | Name of the item. |
| `description` | `string` | Yes | Detailed description. |
| `category` | `string` | Yes | One of the 9 defined categories. |
| `location` | `string` | Yes | One of the 14 defined campus locations. |
| `date` | `string` (YYYY-MM-DD) | Yes | Date the item was lost or found. |
| `image_url` | `string` | No | URL to a photo of the item. |
| `status` | `"open"` \| `"claimed"` \| `"resolved"` | Yes | Current lifecycle status. Defaults to `"open"`. |
| `contact_email` | `string` | Yes | Reporter's UST email address. |
| `reporter_name` | `string` | Yes | Reporter's full name. |
| `created_at` | `string` (ISO 8601) | Yes | Auto-generated timestamp of submission. |
| `secret_detail` | `string` | No | Hidden verification question or fact. Only revealed in the Claim Flow. |
| `claim_answer` | `string` | No | Answer submitted by the claimant. Set by `submitClaimAnswer`. |
| `claimant_name` | `string` | No | Name of the user who submitted the claim answer. |

### User

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Display name of the signed-in user. |
| `email` | `string` | Email address used to identify the user and match against `contact_email`. |

### Filters

| Field | Type | Default | Description |
|---|---|---|---|
| `search` | `string` | `""` | Free-text search query. |
| `type` | `""` \| `"lost"` \| `"found"` | `""` | Filter by item type. Empty string means no filter. |
| `category` | `string` | `""` | Filter by category. Empty string means no filter. |
| `status` | `""` \| `"open"` \| `"claimed"` \| `"resolved"` | `""` | Filter by status. Empty string means no filter. |
