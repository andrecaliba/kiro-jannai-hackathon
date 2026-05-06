# Design Document: Item Claim Verification

## Overview

The Item Claim Verification feature adds an ownership-verification layer to the UST Lost and Found app. It is entirely frontend-only, living inside the existing Zustand store and Next.js pages with no backend or network calls.

The core flow is:

1. A reporter optionally attaches a **secret detail** (a hidden question or fact) when submitting a report.
2. A signed-in user who believes an item is theirs clicks **"Claim This Item"** on the item detail page.
3. The secret detail is revealed to the claimant, who types an answer and submits it.
4. The answer is stored in the Zustand store and displayed to the reporter in a **Verification Panel**, so they can verify ownership offline before marking the item as claimed or resolved.

The feature integrates with the existing "Mark as Claimed" / "Mark as Resolved" lifecycle without modifying the `updateItemStatus` action.

---

## Architecture

The feature is a pure client-side extension of the existing architecture. No new routes, no new files beyond what is strictly necessary.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Zustand Store                            │
│                                                                 │
│  Item {                                                         │
│    ...existing fields...                                        │
│    secret_detail?:  string   ← new (reporter sets at report)   │
│    claim_answer?:   string   ← new (claimant submits)          │
│    claimant_name?:  string   ← new (claimant's display name)   │
│  }                                                              │
│                                                                 │
│  Actions:                                                       │
│    addItem(payload)          ← extended to accept secret_detail │
│    submitClaimAnswer(id, answer, name)  ← new action           │
│    updateItemStatus(id, status)         ← unchanged            │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────────────────────┐
│  ItemForm.tsx   │          │  /items/[id]/page.tsx            │
│                 │          │                                  │
│  + secret_detail│          │  + "Claim This Item" button      │
│    input field  │          │  + ClaimFlow inline panel        │
│                 │          │  + VerificationPanel             │
└─────────────────┘          └──────────────────────────────────┘
```

**Key design decisions:**

- **No new components file** for ClaimFlow or VerificationPanel — they are rendered inline inside `ItemDetailPage` as conditional JSX sections. This keeps the feature self-contained in one file and avoids over-engineering a prototype.
- **No new store slice** — the three new fields are added directly to the `Item` type and the store is extended with one new action.
- **Privacy is enforced at the rendering layer** — `secret_detail` is simply never referenced in `ItemCard`, the items catalog page, or any public section of the detail page. There is no runtime filtering or redaction function needed.

---

## Components and Interfaces

### 1. `Item` type extension (`src/types/index.ts`)

Three optional fields are added to the existing `Item` interface:

```ts
export interface Item {
  // ...existing fields unchanged...
  secret_detail?: string;   // set by reporter; never shown publicly
  claim_answer?: string;    // set by claimant after revealing secret_detail
  claimant_name?: string;   // display name of the claimant
}
```

All three fields are `string | undefined`. Existing mock items that omit them remain valid — TypeScript's optional fields default to `undefined`.

### 2. Zustand store (`src/store/index.ts`)

**Extended `addItem` action** — the payload type already uses `Omit<Item, "id" | "created_at">`, so once `secret_detail` is added to `Item`, `addItem` automatically accepts it. No signature change is needed; the spread `{ ...item, id, created_at }` will include `secret_detail` when present.

**New `submitClaimAnswer` action:**

```ts
submitClaimAnswer: (id: string, claim_answer: string, claimant_name: string) => void;
```

Implementation:

```ts
submitClaimAnswer: (id, claim_answer, claimant_name) =>
  set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, claim_answer, claimant_name } : item
    ),
  })),
```

- Pure state update, no side effects.
- If `id` does not match any item, the map returns the array unchanged.
- `updateItemStatus` is not modified; it continues to spread `{ ...item, status }`, which preserves `claim_answer` and `claimant_name` because they are already on the item object.

**Two new mock seed items** with `secret_detail` set:

- One protected item (lost, Electronics) with `status: "open"`.
- One non-protected item (lost, Books and Notes) with `status: "open"`.

### 3. `ItemForm` component (`src/components/ItemForm.tsx`)

A new optional `secret_detail` state field and input are added between the Image URL field and the Reporter Name field:

```tsx
{/* Secret Verification Detail (optional) */}
<div>
  <label htmlFor="secretDetail" className={labelClass}>
    Secret Verification Detail{" "}
    <span className="text-gray-400 font-normal">(optional)</span>
  </label>
  <input
    id="secretDetail"
    type="text"
    value={secretDetail}
    onChange={(e) => setSecretDetail(e.target.value)}
    className={inputClass}
    placeholder="e.g. What color is the phone case?"
  />
  <p className="text-xs text-gray-500 mt-1">
    This will never be shown publicly. It will only be revealed to
    signed-in users who initiate a claim, so you can verify ownership.
  </p>
</div>
```

The `addItem` call is updated to include `secret_detail: secretDetail.trim() || undefined`.

No new validation rule is added — the field is optional and the existing `validate()` function is not changed.

### 4. Item Detail Page (`src/app/items/[id]/page.tsx`)

This page gains three new UI sections, all rendered conditionally:

#### 4a. "Claim This Item" button

Shown when **all** of the following are true:
- `user !== null` (signed in)
- `item.status === "open"`
- `item.secret_detail !== undefined`
- `item.claim_answer === undefined` (no claim submitted yet)
- `user.email !== item.contact_email` (claimant is not the reporter)

```tsx
{showClaimButton && (
  <Button variant="primary" onClick={() => setClaimFlowOpen(true)}>
    Claim This Item
  </Button>
)}
```

The button uses `variant="primary"` which maps to `bg-ust-gold text-ust-black` — consistent with the existing Button component.

#### 4b. Claim Flow (inline panel)

Shown when `claimFlowOpen === true`. Rendered as a `Card` below the action buttons row.

```
┌─────────────────────────────────────────────────────┐
│  Verify Your Ownership                              │
│                                                     │
│  Secret detail: [item.secret_detail text]           │
│                                                     │
│  Your Answer                                        │
│  [textarea]                                         │
│  [validation error if empty]                        │
│                                                     │
│  [Submit Answer]  [Cancel]                          │
└─────────────────────────────────────────────────────┘
```

State managed with two local `useState` hooks:
- `claimFlowOpen: boolean` — controls visibility
- `claimAnswer: string` — textarea value
- `claimAnswerError: string` — validation message

On "Submit Answer":
1. Trim `claimAnswer`. If empty, set `claimAnswerError` and return.
2. Call `submitClaimAnswer(item.id, claimAnswer.trim(), user.name)`.
3. Set `claimFlowOpen(false)`, `setSubmitConfirmed(true)`.

On "Cancel":
1. Set `claimFlowOpen(false)`, clear `claimAnswer` and `claimAnswerError`.
2. Item state is not touched.

#### 4c. Confirmation message

Shown when `submitConfirmed === true` (after successful submission):

```
Your answer has been recorded. The reporter will review it and
be in touch to confirm ownership.
```

Rendered as a green-tinted notice block, similar in style to the existing amber privacy notice.

#### 4d. Verification Panel

Shown when `user !== null` and `item.claim_answer !== undefined`.

```
┌─────────────────────────────────────────────────────┐
│  Claim Submitted                                    │
│                                                     │
│  Claimant: [item.claimant_name]                     │
│  Answer:   [item.claim_answer]                      │
└─────────────────────────────────────────────────────┘
```

Rendered as a `Card` with a distinct amber-left-border style to make it visually prominent. Visible to all signed-in users (the app has no real auth to distinguish reporter from others).

---

## Data Models

### Updated `Item` interface

```ts
export interface Item {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image_url?: string;
  status: "open" | "claimed" | "resolved";
  contact_email: string;
  reporter_name: string;
  created_at: string;
  // --- new fields ---
  secret_detail?: string;   // optional; set by reporter at report time
  claim_answer?: string;    // optional; set by claimant via submitClaimAnswer
  claimant_name?: string;   // optional; set alongside claim_answer
}
```

### Updated `StoreState` interface

```ts
interface StoreState {
  user: User | null;
  items: Item[];
  filters: Filters;

  signIn: () => void;
  signOut: () => void;
  addItem: (item: Omit<Item, "id" | "created_at">) => void;
  updateItemStatus: (id: string, status: Item["status"]) => void;
  submitClaimAnswer: (id: string, claim_answer: string, claimant_name: string) => void; // new
  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;
}
```

### New mock seed items

```ts
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567809",
  type: "lost",
  title: "iPhone 14 Pro",
  description: "Space black iPhone 14 Pro with a clear case. Has a small crack on the bottom-left corner of the screen.",
  category: "Electronics",          // Protected (high-value lost item)
  location: "Main Building",
  date: "2025-01-25",
  status: "open",
  contact_email: "pcruz@ust.edu.ph",
  reporter_name: "Patricia Cruz",
  created_at: "2025-01-25T09:00:00.000Z",
  secret_detail: "What color is the phone case?",
},
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567810",
  type: "lost",
  title: "Calculus Textbook",
  description: "Stewart Calculus 8th edition with a blue sticky note on the cover. Name written inside: 'R. Bautista'.",
  category: "Books and Notes",      // Non-protected
  location: "UST Library",
  date: "2025-01-26",
  status: "open",
  contact_email: "rbautista@ust.edu.ph",
  reporter_name: "Ramon Bautista",
  created_at: "2025-01-26T11:30:00.000Z",
  secret_detail: "There is a blue sticky note on the front cover.",
},
```

### Local UI state (Item Detail Page)

| State variable      | Type      | Purpose                                              |
|---------------------|-----------|------------------------------------------------------|
| `claimFlowOpen`     | `boolean` | Whether the Claim Flow panel is visible              |
| `claimAnswer`       | `string`  | Current value of the answer textarea                 |
| `claimAnswerError`  | `string`  | Validation error message for the answer field        |
| `submitConfirmed`   | `boolean` | Whether the confirmation message should be shown     |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: `submitClaimAnswer` updates only the target item's claim fields

*For any* items array, any target item id in that array, and any claim answer and claimant name strings, calling `submitClaimAnswer` with that id shall update exactly the `claim_answer` and `claimant_name` fields of the matching item, leaving all other fields of that item and all other items in the array completely unchanged.

**Validates: Requirements 3.2**

### Property 2: `submitClaimAnswer` with unknown id leaves items unchanged

*For any* items array and any id string that does not match any item in the array, calling `submitClaimAnswer` shall leave the items array identical to its state before the call.

**Validates: Requirements 3.3**

### Property 3: `addItem` persists `secret_detail` when provided

*For any* item payload that includes a non-empty `secret_detail` string, calling `addItem` shall result in the newly prepended item having a `secret_detail` field equal to the provided value.

**Validates: Requirements 3.5**

### Property 4: `updateItemStatus` preserves `claim_answer` and `claimant_name`

*For any* item that has `claim_answer` and `claimant_name` defined, calling `updateItemStatus` with any new status shall leave `claim_answer` and `claimant_name` on that item unchanged.

**Validates: Requirements 8.3**

### Property 5: Secret detail trimming on form submission

*For any* non-empty string entered as the secret detail in the ItemForm (including strings with leading or trailing whitespace), the `secret_detail` value passed to `addItem` shall equal the trimmed version of that string.

**Validates: Requirements 2.4**

### Property 6: Claim answer trimming and routing on submission

*For any* non-empty answer string entered in the Claim Flow (including strings with leading or trailing whitespace), `submitClaimAnswer` shall be called with the trimmed version of that string and the signed-in user's name.

**Validates: Requirements 5.7**

### Property 7: Empty claim answer is rejected

*For any* string composed entirely of whitespace (or the empty string) entered as the claim answer, clicking "Submit Answer" shall not call `submitClaimAnswer` and shall display a validation error.

**Validates: Requirements 5.6**

### Property 8: `secret_detail` is never exposed in search filter logic

*For any* items array where an item's `secret_detail` matches a search query but its `title` and `description` do not, the filter function shall not include that item in the results.

**Validates: Requirements 7.5**

### Property 9: "Claim This Item" button is hidden when `claim_answer` is already set

*For any* item that has a `claim_answer` defined (regardless of its other fields), the Item Detail Page shall not render the "Claim This Item" button.

**Validates: Requirements 6.7**

### Property 10: "Claim This Item" button is hidden for non-open items

*For any* item whose `status` is `claimed` or `resolved` (regardless of whether `secret_detail` is defined), the Item Detail Page shall not render the "Claim This Item" button.

**Validates: Requirements 4.4**

---

## Error Handling

Since this is a frontend-only prototype with no network calls, error handling is limited to input validation:

**Claim answer validation:**
- Empty or whitespace-only answer: display inline error message "Please enter an answer before submitting." The `submitClaimAnswer` action is not called.
- The error is cleared when the user modifies the textarea or clicks Cancel.

**No-item edge case:**
- `submitClaimAnswer` called with a non-matching id: the store silently leaves items unchanged (no error thrown). This cannot happen through the UI since the button is only shown when the item exists.

**Reporter self-claim prevention:**
- The "Claim This Item" button is not rendered when `user.email === item.contact_email`. No runtime error is needed; the condition is enforced at render time.

**Status guard:**
- The "Claim This Item" button is not rendered for `claimed` or `resolved` items. No runtime guard is needed in the action itself.

---

## Testing Strategy

### Unit / Example-based tests

These cover specific scenarios and UI conditions that are not amenable to property-based testing:

- Rendering the "Claim This Item" button only when all conditions are met (signed in, open, secret_detail defined, no claim_answer, not reporter).
- Rendering the Verification Panel for signed-in users when `claim_answer` is defined.
- Hiding the Verification Panel from guests.
- Cancel button restores UI state without modifying store.
- Confirmation message appears after successful submission.
- Backward compatibility: items without `secret_detail` behave exactly as before.
- Mock seed data contains at least two items with `secret_detail`, covering one protected and one non-protected item.

### Property-based tests

The project uses **fast-check** (already installed and used in `src/__tests__/properties.test.ts`). Each property test runs a minimum of **100 iterations**.

New property tests to add to `src/__tests__/properties.test.ts`:

| Test tag | Property | Requirement |
|---|---|---|
| `Feature: item-claim-verification, Property 1` | `submitClaimAnswer` updates only target item's claim fields | 3.2 |
| `Feature: item-claim-verification, Property 2` | `submitClaimAnswer` with unknown id leaves items unchanged | 3.3 |
| `Feature: item-claim-verification, Property 3` | `addItem` persists `secret_detail` when provided | 3.5 |
| `Feature: item-claim-verification, Property 4` | `updateItemStatus` preserves `claim_answer` and `claimant_name` | 8.3 |
| `Feature: item-claim-verification, Property 5` | Secret detail trimming on form submission | 2.4 |
| `Feature: item-claim-verification, Property 6` | Claim answer trimming and routing on submission | 5.7 |
| `Feature: item-claim-verification, Property 7` | Empty claim answer is rejected | 5.6 |
| `Feature: item-claim-verification, Property 8` | `secret_detail` is never exposed in search filter logic | 7.5 |
| `Feature: item-claim-verification, Property 9` | "Claim This Item" button hidden when `claim_answer` is set | 6.7 |
| `Feature: item-claim-verification, Property 10` | "Claim This Item" button hidden for non-open items | 4.4 |

**Arbitraries needed:**

- Extend the existing `itemArb` / `itemPayloadArb` to optionally include `secret_detail`, `claim_answer`, and `claimant_name`.
- `nonEmptyStringArb` (already exists) covers answer and secret_detail values.
- `emptyFieldArb` (already exists) covers whitespace-only answer rejection.
- A `nonMatchingIdArb` that generates a UUID guaranteed not to appear in a given items array.

**Properties 1, 2, 4** are pure store action tests — no React rendering needed, same pattern as existing Properties 4 and 5.

**Properties 5, 6, 7** test the validation/trimming logic extracted as pure functions (same pattern as existing Property 13 which tests `validateForm` as a pure function).

**Properties 8, 9, 10** test the filter logic and button-visibility logic as pure functions, following the same pattern as existing Properties 10–12.
