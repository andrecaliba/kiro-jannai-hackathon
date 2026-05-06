# Implementation Tasks: Item Claim Verification

## Tasks

- [x] 1. Extend the Item type and Zustand store
  - [x] 1.1 Add `secret_detail`, `claim_answer`, and `claimant_name` optional fields to the `Item` interface in `src/types/index.ts`
  - [x] 1.2 Add `submitClaimAnswer` action signature to the `StoreState` interface in `src/store/index.ts`
  - [x] 1.3 Implement the `submitClaimAnswer` action in the store (pure map over items, update matching item's `claim_answer` and `claimant_name`, leave non-matching items unchanged)
  - [x] 1.4 Add two new mock seed items with `secret_detail` set to `MOCK_ITEMS` — one protected (Electronics, lost) and one non-protected (Books and Notes, lost), both with `status: "open"`

- [x] 2. Add secret detail input to ItemForm
  - [x] 2.1 Add `secretDetail` state variable (`useState("")`) to `ItemForm`
  - [x] 2.2 Add the "Secret Verification Detail" optional input field between the Image URL field and the Reporter Name field, with helper text explaining it will never be shown publicly
  - [x] 2.3 Update the `addItem` call in `handleSubmit` to include `secret_detail: secretDetail.trim() || undefined`

- [x] 3. Add claim verification UI to the Item Detail Page
  - [x] 3.1 Add local state variables: `claimFlowOpen`, `claimAnswer`, `claimAnswerError`, `submitConfirmed`
  - [x] 3.2 Destructure `submitClaimAnswer` from `useStore` alongside the existing destructured actions
  - [x] 3.3 Derive the `showClaimButton` boolean: `user !== null && item.status === "open" && item.secret_detail !== undefined && item.claim_answer === undefined && user.email !== item.contact_email`
  - [x] 3.4 Add the "Claim This Item" button to the action buttons row (shown when `showClaimButton` is true), styled with `variant="primary"` (UST gold / UST black)
  - [x] 3.5 Implement the Claim Flow inline panel (shown when `claimFlowOpen` is true): display `item.secret_detail` as the prompt, a labeled textarea for the answer, a validation error message area, a "Submit Answer" button, and a "Cancel" button
  - [x] 3.6 Implement the "Submit Answer" handler: trim answer, show error if empty, otherwise call `submitClaimAnswer`, close flow, set `submitConfirmed`
  - [x] 3.7 Implement the "Cancel" handler: close flow, clear `claimAnswer` and `claimAnswerError`, do not modify store
  - [x] 3.8 Add the post-submission confirmation message (shown when `submitConfirmed` is true)
  - [x] 3.9 Add the Verification Panel (shown when `user !== null && item.claim_answer !== undefined`): display "Claim Submitted" label, claimant name, and answer text in a visually distinct bordered card

- [x] 4. Write property-based tests
  - [x] 4.1 Extend the existing arbitraries in `src/__tests__/properties.test.ts` to support the new `secret_detail`, `claim_answer`, and `claimant_name` fields (update `itemArb`, `itemPayloadArb`, `fullItemArb`, and `nonEmptyItemsArb`)
  - [x] 4.2 Write Property 1: `submitClaimAnswer` updates only the target item's `claim_answer` and `claimant_name` fields, leaving all other items and fields unchanged (validates Req 3.2)
  - [x] 4.3 Write Property 2: `submitClaimAnswer` with a non-matching id leaves the items array completely unchanged (validates Req 3.3)
  - [x] 4.4 Write Property 3: `addItem` with a payload that includes `secret_detail` results in the prepended item having that exact `secret_detail` value (validates Req 3.5)
  - [x] 4.5 Write Property 4: `updateItemStatus` called on an item that has `claim_answer` and `claimant_name` preserves those fields unchanged (validates Req 8.3)
  - [x] 4.6 Write Property 5: The secret detail trimming logic — for any non-empty string (including strings with leading/trailing whitespace), the value passed to `addItem` equals the trimmed input (validates Req 2.4)
  - [x] 4.7 Write Property 6: The claim answer trimming logic — for any non-empty answer string, `submitClaimAnswer` is called with the trimmed value (validates Req 5.7)
  - [x] 4.8 Write Property 7: The claim answer validation — for any empty or whitespace-only answer string, `submitClaimAnswer` is not called and a validation error is produced (validates Req 5.6)
  - [x] 4.9 Write Property 8: The filter logic never matches against `secret_detail` — for any item where `secret_detail` matches a search query but `title` and `description` do not, the item is excluded from results (validates Req 7.5)
  - [x] 4.10 Write Property 9: The "Claim This Item" button visibility logic — for any item with `claim_answer` defined, the button is not shown (validates Req 6.7)
  - [x] 4.11 Write Property 10: The "Claim This Item" button visibility logic — for any item with `status` of `claimed` or `resolved`, the button is not shown regardless of `secret_detail` (validates Req 4.4)
  - [x] 4.12 Run the full test suite (`npx jest --testPathPattern=properties`) and confirm all new and existing property tests pass

- [x] 5. Verify privacy guarantees
  - [x] 5.1 Confirm `ItemCard.tsx` does not reference `secret_detail` anywhere (code review / search)
  - [x] 5.2 Confirm `src/app/items/page.tsx` does not reference `secret_detail` anywhere (code review / search)
  - [x] 5.3 Confirm the filter logic in `src/app/items/page.tsx` does not include `secret_detail` in search matching
  - [x] 5.4 Confirm the Item Detail Page only renders `secret_detail` inside the Claim Flow section (which is gated behind `claimFlowOpen === true` and `user !== null`)
