# Deskcraft — Mini Checkout & Browser Test Suite

A single-page e-commerce checkout application paired with an automated Playwright browser test suite and a risk-based QA test plan. Built to demonstrate reliable state management, input validation, idempotent order submission, and reproducible end-to-end browser testing.

**Author:** Rachith V

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3 (Grid, Flexbox, `tabular-nums`), and ES6 JavaScript
- **Local Server:** Zero-dependency Node.js `http` static file server (`server.js`)
- **Automated Testing:** Playwright (`@playwright/test`) running against Chromium
- **Currency Formatting:** Native `Intl.NumberFormat("en-IN")` for INR (`₹`)

---

## What Was Built

1. **Single-Page Checkout Interface (`src/`)**
   - Two fixed-price synthetic products: *Mechanical Keycap Set* (`₹1,499.00`) and *Braided USB-C Cable* (`₹549.00`).
   - Full cart management: add items, increment/decrement quantities via steppers or direct input, remove items, and view live line totals and order totals.
   - Required customer field (**Full Name**) with real-time error clearing and a structured **Order Confirmed** receipt displaying a unique `ORD-...` reference, customer name, and total paid.

2. **Validation & Edge-Case Handling**
   - Blocks checkout when the cart is empty or the required name field is blank/whitespace-only, displaying clear `role="alert"` feedback while preserving all entered data and cart state.
   - Prevents duplicate order confirmations on rapid double-clicks via an immediate synchronous state lock (`orderPlaced`) and button/input disabling.

3. **Automated Browser Test Suite (`tests/checkout.spec.js`)**
   - **Test 1:** Verifies a complete checkout produces exactly one confirmation with a valid `ORD-...` reference, matching customer name, exact total (`₹2,048.00`), and a disabled submit button.
   - **Test 2:** Verifies a blank/whitespace-only required field blocks checkout, displays the validation error, keeps the confirmation hidden, and preserves both cart items and input value.
   - **Test 3:** Verifies quantity increments and decrements update exact line totals and order totals (`₹2,048.00` → `₹5,046.00` → `₹3,547.00`).

4. **Risk-Based Test Plan (`TEST_PLAN.md`)**
   - Prioritizes checkout risks (`P0`–`P2`), documents automated coverage, and logs manual verification results for empty-cart submission and rapid double-click protection.

---

## How Results Were Achieved

- **Exact Financial Math:** All product prices and cart calculations are computed in integer paise (`149900`, `54900`) and formatted to INR (`₹`) only at render time, eliminating JavaScript floating-point precision bugs.
- **Deterministic, Clean-State Tests:** Each Playwright test starts from a fresh page load (`beforeEach` → `page.goto("/")`) and relies exclusively on user-facing locators (`getByRole`, `getByLabel`, `getByTestId`) and auto-retrying `expect` assertions—no fixed `waitForTimeout` calls.
- **Self-Contained Execution:** `playwright.config.js` automatically starts and stops `server.js` via `webServer`, ensuring anyone can clone and verify the suite with zero manual server setup.

---

## Project Structure

```text
mini-checkout/
├── package.json
├── playwright.config.js
├── server.js
├── README.md
├── TEST_PLAN.md
├── src/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── tests/
    └── checkout.spec.js
```

---

## Setup & Installation

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Install Chromium for Playwright
npx playwright install chromium
```

---

## Running the Application

Start the local static server:

```bash
npm start
```

Open `http://127.0.0.1:4173` in your browser.

---

## Running the Browser Tests

Run the full automated suite (starts and stops the local server automatically):

```bash
npm test
```

Additional test commands:

```bash
# Run tests with a visible browser window
npm run test:headed

# Open the Playwright HTML test report
npm run test:report
```

**Expected Output:** `3 passed` (0 failed, 0 flaky).

---

## QA Documentation

See [`TEST_PLAN.md`](./TEST_PLAN.md) for the full risk matrix, automated test breakdown, and manual test execution log.