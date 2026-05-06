# Requirements Document

## Introduction

The Secret Detail Verification feature adds an optional ownership-verification layer to the UST Lost and Found app. When reporting a lost or found item, the reporter may supply a "secret detail" — a hidden fact or question that only the true owner would know (e.g., "What is the wallpaper on the phone?" or "There is a sticker on the back of the case"). This secret detail is stored in the item's state but is never shown publicly.

On the item detail page, a signed-in user can click a "Claim This Item" button. Clicking it reveals the secret question or hint to the claimant, who then submits their answer. The submitted answer is stored alongside the item and becomes visible to the reporter so they can verify ownership offline before marking the item as claimed and then resolved.

The feature is entirely frontend-only: all state lives in the existing Zustand store, no backend or network calls are involved, and the flow integrates with the existing "Mark as Claimed" / "Mark as Resolved" workflow.

---

## Glossary

- **App**: The UST Lost and Found Next.js web application.
- **User**: A visitor who has completed the fake login flow and has a session in the store.
- **Guest**: A visitor who has not logged in.
- **Item**: A lost or found object reported through the App, conforming to the Item data model.
- **Store**: The single Zustand client-side state store holding user state, items array, and filters.
- **Reporter**: The User who originally submitted an Item report.
- **Claimant**: A signed-in User who believes an Item belongs to them and initiates the claim flow.
- **Secret Detail**: An optional string stored on an Item that contains a hidden verification question or fact only the true owner would know.
- **Claim Answer**: The text submitted by a Claimant in response to the Secret Detail, stored on the Item and visible only to the Reporter.
- **Claim Flow**: The multi-step UI interaction on the Item Detail Page through which a Claimant reveals the Secret Detail and submits a Claim Answer.
- **ItemForm**: The shared form component used on both `/report/lost` and `/report/found`.
- **Item Detail Page**: The page at `/items/[id]` that displays full information about a single Item.
- **Protected Item**: A lost Item whose category is a High-Value Category, subject to the existing Privacy Rule.
- **High-Value Category**: Electronics, Bags and Wallets, ID and Cards, Accessories, Documents.
- **Verification Panel**: The UI section on the Item Detail Page that displays the Claim Answer to the Reporter.

---

## Requirements

### Requirement 1: Secret Detail Field in the Data Model

**User Story:** As a developer, I want the Item data model to support an optional secret detail and claim answer, so that the verification feature has a well-typed, consistent data structure.

#### Acceptance Criteria

1. THE App SHALL extend the `Item` TypeScript type with an optional `secret_detail` field of type `string | undefined`.
2. THE App SHALL extend the `Item` TypeScript type with an optional `claim_answer` field of type `string | undefined`.
3. THE App SHALL extend the `Item` TypeScript type with an optional `claimant_name` field of type `string | undefined`, storing the name of the User who submitted the Claim Answer.
4. THE App SHALL ensure that all existing mock seed Items remain valid without `secret_detail`, `claim_answer`, or `claimant_name` fields (i.e., the fields are optional and default to `undefined`).

---

### Requirement 2: Secret Detail Input in the Report Form

**User Story:** As a reporter, I want to optionally add a secret detail when submitting a report, so that I can later verify that a claimant is the true owner.

#### Acceptance Criteria

1. THE ItemForm SHALL include an optional `secret_detail` text input field, labeled "Secret Verification Detail", positioned after the Image URL field and before the Reporter Name field.
2. THE ItemForm SHALL display helper text beneath the Secret Verification Detail field explaining that the value will never be shown publicly and will only be revealed to signed-in users who initiate a claim.
3. WHEN the Secret Verification Detail field is left empty, THE ItemForm SHALL submit the Item with `secret_detail` set to `undefined`.
4. WHEN the Secret Verification Detail field contains text, THE ItemForm SHALL submit the Item with `secret_detail` set to the trimmed input value.
5. THE ItemForm SHALL NOT mark the Secret Verification Detail field as required; form submission SHALL succeed whether or not the field is filled.
6. WHEN the form is submitted, THE ItemForm SHALL pass `secret_detail` to the `addItem` Store action alongside all other Item fields.

---

### Requirement 3: Store Actions for Claim Submission

**User Story:** As a developer, I want the Zustand store to support recording a claim answer, so that the Claimant's response is persisted in client state and visible to the Reporter.

#### Acceptance Criteria

1. THE Store SHALL expose a `submitClaimAnswer` action that accepts an item `id`, a `claim_answer` string, and a `claimant_name` string.
2. WHEN `submitClaimAnswer` is called, THE Store SHALL update the matching Item's `claim_answer` field to the provided answer and `claimant_name` field to the provided name.
3. WHEN `submitClaimAnswer` is called with an `id` that does not match any Item, THE Store SHALL leave the `items` array unchanged.
4. THE Store SHALL ensure that `submitClaimAnswer` is a pure state update with no side effects, network calls, or async operations.
5. THE App SHALL extend the `addItem` Store action to accept and persist the optional `secret_detail` field when provided.

---

### Requirement 4: "Claim This Item" Button on the Item Detail Page

**User Story:** As a signed-in user, I want a "Claim This Item" button on the item detail page, so that I can initiate the verification process for an item I believe is mine.

#### Acceptance Criteria

1. WHEN a signed-in User views an Item whose `status` is `open` and whose `secret_detail` is defined, THE Item Detail Page SHALL display a "Claim This Item" button.
2. WHEN a signed-in User views an Item whose `status` is `open` and whose `secret_detail` is `undefined`, THE Item Detail Page SHALL NOT display the "Claim This Item" button; the existing "Mark as Claimed" and "Mark as Resolved" buttons SHALL remain the only actions.
3. WHEN a Guest views an Item, THE Item Detail Page SHALL NOT display the "Claim This Item" button.
4. WHEN an Item's `status` is `claimed` or `resolved`, THE Item Detail Page SHALL NOT display the "Claim This Item" button.
5. THE "Claim This Item" button SHALL be styled using UST gold (`#F5B731`) with UST black (`#1A1A1A`) text, consistent with the App's primary button style.
6. WHEN the "Claim This Item" button is displayed alongside the existing "Mark as Claimed" and "Mark as Resolved" buttons, THE Item Detail Page SHALL render all applicable action buttons in the same button row.

---

### Requirement 5: Claim Flow — Reveal Secret Detail and Collect Answer

**User Story:** As a claimant, I want to see the secret verification question and submit my answer, so that the reporter can confirm I am the true owner.

#### Acceptance Criteria

1. WHEN the "Claim This Item" button is clicked, THE Item Detail Page SHALL reveal the Claim Flow inline on the page without navigating away.
2. THE Claim Flow SHALL display the Item's `secret_detail` text as a visible prompt to the Claimant.
3. THE Claim Flow SHALL display a labeled text area for the Claimant to enter their answer.
4. THE Claim Flow SHALL display a "Submit Answer" button and a "Cancel" button.
5. WHEN the "Cancel" button is clicked, THE Item Detail Page SHALL hide the Claim Flow and restore the "Claim This Item" button without modifying any Item state.
6. IF the Claimant clicks "Submit Answer" with an empty answer field, THEN THE Claim Flow SHALL display a validation error message and SHALL NOT call `submitClaimAnswer`.
7. WHEN the Claimant submits a non-empty answer, THE Item Detail Page SHALL call `submitClaimAnswer` with the Item's `id`, the trimmed answer text, and the signed-in User's `name`.
8. WHEN `submitClaimAnswer` completes, THE Item Detail Page SHALL hide the Claim Flow and display a confirmation message informing the Claimant that their answer has been recorded and the reporter will be in touch.
9. THE Claim Flow SHALL NOT be shown to a User who is the Reporter of the Item (i.e., when `user.email === item.contact_email`).

---

### Requirement 6: Verification Panel for the Reporter

**User Story:** As a reporter, I want to see the claimant's submitted answer on the item detail page, so that I can verify ownership offline and then mark the item as claimed.

#### Acceptance Criteria

1. WHEN an Item has a `claim_answer` defined, THE Item Detail Page SHALL display a Verification Panel showing the Claimant's name (`claimant_name`) and their submitted answer (`claim_answer`).
2. THE Verification Panel SHALL be visually distinct from the rest of the page, using a bordered card or highlighted section.
3. THE Verification Panel SHALL include a label such as "Claim Submitted" and display both the claimant's name and their answer text.
4. THE Verification Panel SHALL be visible to all signed-in Users viewing the Item Detail Page, not only the Reporter, since the App has no real authentication to distinguish ownership.
5. THE Verification Panel SHALL NOT be visible to Guests.
6. WHEN an Item has a `claim_answer` defined and `status` is `open`, THE Item Detail Page SHALL display the existing "Mark as Claimed" and "Mark as Resolved" buttons alongside the Verification Panel so the Reporter can act on the verification.
7. WHEN an Item has a `claim_answer` defined, THE Item Detail Page SHALL NOT display the "Claim This Item" button, since a claim has already been submitted.

---

### Requirement 7: Secret Detail Privacy Guarantee

**User Story:** As a reporter, I want the secret detail to remain hidden from public views, so that bad actors cannot use it to fraudulently claim an item.

#### Acceptance Criteria

1. THE ItemCard component SHALL never render the `secret_detail` field of any Item, regardless of the Item's type, category, or status.
2. THE Item Detail Page SHALL never render the `secret_detail` field in any publicly visible section of the page.
3. THE Item Detail Page SHALL only reveal the `secret_detail` value inside the Claim Flow, which is accessible exclusively to signed-in Users.
4. WHEN the Items Catalog Page (`/items`) renders Items, THE Items Page SHALL never expose `secret_detail` in any rendered output.
5. THE App SHALL never include `secret_detail` in any search matching, filter logic, or display label.

---

### Requirement 8: Compatibility with the Existing Claim Workflow

**User Story:** As a reporter, I want the new claim verification flow to work alongside the existing "Mark as Claimed" and "Mark as Resolved" buttons, so that the overall item lifecycle is not disrupted.

#### Acceptance Criteria

1. WHEN an Item has no `secret_detail`, THE Item Detail Page SHALL behave exactly as it did before this feature: showing "Mark as Claimed" and "Mark as Resolved" for signed-in Users viewing open Items.
2. WHEN an Item has a `secret_detail` and a `claim_answer` has been submitted, THE Item Detail Page SHALL display the "Mark as Claimed" and "Mark as Resolved" buttons so the Reporter can complete the lifecycle.
3. WHEN an Item's `status` is updated to `claimed` or `resolved` via `updateItemStatus`, THE Store SHALL preserve the existing `claim_answer` and `claimant_name` values on the Item unchanged.
4. THE `updateItemStatus` Store action SHALL NOT be modified; status transitions SHALL continue to use the existing action.

---

### Requirement 9: Secret Detail in Mock Seed Data

**User Story:** As a developer, I want at least one mock item to include a secret detail, so that the feature is immediately demonstrable without manual data entry.

#### Acceptance Criteria

1. THE Store SHALL include at least two mock Items with a non-empty `secret_detail` value.
2. THE mock Items with `secret_detail` SHALL cover at least one Protected Item (lost, High-Value Category) and at least one non-protected Item.
3. THE `secret_detail` values in mock data SHALL be realistic examples, such as a verification question (e.g., "What color is the phone case?") or a hidden fact (e.g., "There is a small scratch on the bottom-left corner of the screen").
4. THE mock Items with `secret_detail` SHALL have `status` set to `open` so the Claim Flow is immediately accessible in the demo.
