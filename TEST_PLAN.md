# Mini Checkout — Test Plan & Execution Results

**Application:** Deskcraft Mini Checkout (`http://127.0.0.1:4173`)  
**Environment:** Windows 11, Chromium (Playwright v1.49+), Node.js  
**Date:** November 23, 2026

---

## 1. Scope & Risk Prioritization

The checkout flow is tested against the highest-impact customer and business risks first:

| Priority | Risk Area | Customer / Business Impact | Verification Method |
| :--- | :--- | :--- | :--- |
| **P0** | Incorrect line totals or order total | Overcharging or undercharging customers; loss of trust | Automated (`Test 3`) |
| **P0** | Duplicate confirmation on rapid double-click | Duplicate orders or conflicting reference numbers | Manual (`M2`) |
| **P0** | Checkout allowed with empty cart or blank name | Invalid orders placed with `₹0.00` total or missing customer details | Automated (`Test 2`) + Manual (`M1`) |
| **P1** | Form input or cart lost after validation error | Customer forced to re-select items or re-type details | Automated (`Test 2`) + Manual (`M1`) |
| **P1** | Invalid quantity inputs (0, negative, removal) | Negative totals or broken cart state | Code guard (`updateQuantity`) |
| **P2** | Unclear feedback or inaccessible status messages | Customers unsure why checkout is blocked or if order succeeded | Accessible `role="alert"` / `role="status"` assertions |

---

## 2. Automated Browser Test Suite (`tests/checkout.spec.js`)

All automated checks start from a clean page load (`beforeEach` -> `page.goto("/")`) and assert on visible, user-facing state with no fixed `waitForTimeout` calls.

| ID | Test Case | Key Assertions | Result |
| :--- | :--- | :--- | :--- |
| **A1** | Successful checkout produces a single confirmation | Adds Mechanical Keycap Set (`₹1,499.00`) + Braided USB-C Cable (`₹549.00`); verifies total `₹2,048.00`; submits `Ada Lovelace`; verifies 1 confirmation block, `ORD-...` reference, customer name, total, and disabled `Order Placed` button. | **PASS** |
| **A2** | Missing required field blocks checkout and preserves state | Adds Mechanical Keycap Set (`₹1,499.00`); enters whitespace-only name (`"   "`); clicks Place Order; verifies error alert (`Please enter your full name.`), hidden confirmation, cart row preserved, and input value preserved. | **PASS** |
| **A3** | Quantity changes update exact line and order totals | Adds both items (`₹2,048.00`); increases Keycap Set qty to `3` (`₹4,497.00` line / `₹5,046.00` total); decreases qty to `2` (`₹2,998.00` line / `₹3,547.00` total). | **PASS** |

**Execution Evidence:**
- Command: `npm test`
- Result: **3 passed (0 failed, 0 flaky)**
- HTML Report: Available via `npm run test:report`

---

## 3. Manual Test Cases & Execution Log

### M1: Empty Cart Checkout Attempt
- **Precondition:** Fresh page load at `http://127.0.0.1:4173` (0 items in bag, total `₹0.00`).
- **Steps:**
  1. Leave the cart empty.
  2. Type `Rachith V` into the **Full Name** input.
  3. Click **Place Order**.
- **Expected Result:**
  - Checkout is blocked; no confirmation receipt appears.
  - Validation alert displays: *"Your cart is empty. Add at least one item before placing an order."*
  - `Rachith V` remains preserved in the **Full Name** field.
- **Actual Result:** **PASS** — Checkout was blocked, the validation error banner appeared immediately above the button, no confirmation receipt rendered, and `Rachith V` remained intact in the input field.
- **Defects Found:** None.

### M2: Rapid Double-Click on "Place Order"
- **Precondition:** Fresh page load at `http://127.0.0.1:4173`.
- **Steps:**
  1. Click **Add** on *Mechanical Keycap Set* (`₹1,499.00`).
  2. Enter `Rachith V` in the **Full Name** field.
  3. Rapidly double-click the **Place Order** button.
- **Expected Result:**
  - Exactly one **Order Confirmed** receipt is displayed with a single `ORD-...` reference.
  - The submit button immediately switches to **Order Placed** and becomes disabled.
  - Product add buttons, quantity steppers, and customer name input are locked.
- **Actual Result:** **PASS** — Single confirmation rendered (e.g., reference `ORD-MWTHJIR4-609L`, total `₹1,499.00`). The second click had no effect because `orderPlaced` locked state and disabled the button synchronously on the first click.
- **Defects Found:** None.

---

## 4. Defect Summary

No defects were found in the final build.

*(Note: During test development, `Test 3` initially failed with a Playwright strict-mode locator violation because `getByLabel("Quantity of Mechanical Keycap Set")` substring-matched the `-` and `+` buttons' `aria-label`s. Adding `{ exact: true }` to the locator resolved the test ambiguity; no application bug was present.)*