const { test, expect } = require("@playwright/test");

test.describe("Mini Checkout Customer Journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Select Items" })).toBeVisible();
  });

  test("1. Successful checkout displays a single confirmation with reference and exact total", async ({ page }) => {
    await page.getByRole("button", { name: "Add Mechanical Keycap Set to cart" }).click();
    await page.getByRole("button", { name: "Add Braided USB-C Cable to cart" }).click();

    await expect(page.getByTestId("order-total")).toHaveText("₹2,048.00");

    await page.getByLabel("Full Name").fill("Ada Lovelace");
    await page.getByRole("button", { name: "Place Order" }).click();

    const confirmation = page.getByTestId("order-confirmation");
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCount(1);
    await expect(confirmation).toContainText("Order Confirmed");
    await expect(confirmation).toContainText("Ada Lovelace");
    await expect(confirmation).toContainText("₹2,048.00");
    await expect(page.getByTestId("order-reference")).toHaveText(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/);
    await expect(page.getByRole("button", { name: "Order Placed" })).toBeDisabled();
  });

  test("2. Missing required field blocks checkout, shows error, and preserves cart state", async ({ page }) => {
    await page.getByRole("button", { name: "Add Mechanical Keycap Set to cart" }).click();
    await expect(page.getByTestId("order-total")).toHaveText("₹1,499.00");

    await page.getByLabel("Full Name").fill("   ");
    await page.getByRole("button", { name: "Place Order" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Please enter your full name.");

    await expect(page.getByTestId("order-confirmation")).toBeHidden();
    await expect(page.getByTestId("cart-row-keycaps")).toBeVisible();
    await expect(page.getByTestId("order-total")).toHaveText("₹1,499.00");
    await expect(page.getByLabel("Full Name")).toHaveValue("   ");
  });

  test("3. Quantity changes update exact line totals and order total", async ({ page }) => {
    await page.getByRole("button", { name: "Add Mechanical Keycap Set to cart" }).click();
    await page.getByRole("button", { name: "Add Braided USB-C Cable to cart" }).click();

    await expect(page.getByTestId("line-total-keycaps")).toHaveText("₹1,499.00");
    await expect(page.getByTestId("line-total-cable")).toHaveText("₹549.00");
    await expect(page.getByTestId("order-total")).toHaveText("₹2,048.00");

    // Increase Keycap Set quantity to 3
    const incKeycaps = page.getByRole("button", { name: "Increase quantity of Mechanical Keycap Set" });
    await incKeycaps.click();
    await incKeycaps.click();

   await expect(
  page.getByLabel("Quantity of Mechanical Keycap Set", { exact: true })
).toHaveValue("3");
    await expect(page.getByTestId("line-total-keycaps")).toHaveText("₹4,497.00");
    await expect(page.getByTestId("order-total")).toHaveText("₹5,046.00");

    // Decrease Keycap Set quantity to 2
    await page.getByRole("button", { name: "Decrease quantity of Mechanical Keycap Set" }).click();
    await expect(
  page.getByLabel("Quantity of Mechanical Keycap Set", { exact: true })
).toHaveValue("2");
    await expect(page.getByTestId("line-total-keycaps")).toHaveText("₹2,998.00");
    await expect(page.getByTestId("order-total")).toHaveText("₹3,547.00");
  });
});