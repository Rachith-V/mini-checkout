(() => {
  // Prices stored in integer paise (1 INR = 100 paise) to avoid floating-point drift
  const PRODUCTS = [
    {
      id: "keycaps",
      name: "Mechanical Keycap Set",
      meta: "PBT Double-Shot · 108 Keys",
      pricePaise: 149900, // ₹1,499.00
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h2M11 9h2M15 9h2M7 13h10"/></svg>`,
    },
    {
      id: "cable",
      name: "Braided USB-C Cable",
      meta: "1.8m Nylon · 60W Fast Charge",
      pricePaise: 54900, // ₹549.00
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6h8v5a4 4 0 0 1-8 0V6Z"/><path d="M10 3v3M14 3v3M12 15v6"/></svg>`,
    },
  ];

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const cart = new Map(); // productId -> positive integer quantity
  let orderPlaced = false;

  const productListEl = document.getElementById("product-list");
  const cartEmptyEl = document.getElementById("cart-empty-state");
  const cartListEl = document.getElementById("cart-list");
  const cartCountEl = document.getElementById("cart-count");
  const orderTotalEl = document.getElementById("order-total");
  const checkoutFormEl = document.getElementById("checkout-form");
  const customerNameEl = document.getElementById("customer-name");
  const validationErrorEl = document.getElementById("validation-error");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const confirmationEl = document.getElementById("order-confirmation");
  const confirmationRefEl = document.getElementById("confirmation-ref");
  const confirmationNameEl = document.getElementById("confirmation-name");
  const confirmationTotalEl = document.getElementById("confirmation-total");

  function formatMoney(paise) {
    return inrFormatter.format(paise / 100);
  }

  function getOrderTotalPaise() {
    let total = 0;
    for (const [productId, qty] of cart.entries()) {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (product) total += product.pricePaise * qty;
    }
    return total;
  }

  function getTotalItemCount() {
    let count = 0;
    for (const qty of cart.values()) count += qty;
    return count;
  }

  function generateOrderReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${randomPart}`;
  }

  function clearValidationError() {
    validationErrorEl.textContent = "";
    validationErrorEl.classList.add("hidden");
  }

  function showValidationError(message) {
    validationErrorEl.textContent = message;
    validationErrorEl.classList.remove("hidden");
  }

  function addItem(productId) {
    if (orderPlaced) return;
    cart.set(productId, (cart.get(productId) || 0) + 1);
    clearValidationError();
    render();
  }

  function updateQuantity(productId, nextQty) {
    if (orderPlaced) return;
    const parsed = Number.parseInt(nextQty, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      cart.delete(productId);
    } else {
      cart.set(productId, parsed);
    }
    clearValidationError();
    render();
  }

  function removeItem(productId) {
    if (orderPlaced) return;
    cart.delete(productId);
    clearValidationError();
    render();
  }

  function renderProducts() {
    productListEl.innerHTML = "";
    for (const product of PRODUCTS) {
      const li = document.createElement("li");
      li.className = "product-item";
      li.dataset.testid = `product-${product.id}`;

      const left = document.createElement("div");
      left.className = "product-left";

      const thumb = document.createElement("div");
      thumb.className = "product-thumb";
      thumb.setAttribute("aria-hidden", "true");
      thumb.innerHTML = product.icon;

      const info = document.createElement("div");
      const nameSpan = document.createElement("span");
      nameSpan.className = "product-name";
      nameSpan.textContent = product.name;

      const metaSpan = document.createElement("span");
      metaSpan.className = "product-meta";
      metaSpan.textContent = product.meta;

      info.append(nameSpan, metaSpan);
      left.append(thumb, info);

      const right = document.createElement("div");
      right.className = "product-right";

      const priceSpan = document.createElement("span");
      priceSpan.className = "product-price nums";
      priceSpan.textContent = formatMoney(product.pricePaise);

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn-add";
      addBtn.textContent = "Add";
      addBtn.disabled = orderPlaced;
      addBtn.setAttribute("aria-label", `Add ${product.name} to cart`);
      addBtn.addEventListener("click", () => addItem(product.id));

      right.append(priceSpan, addBtn);
      li.append(left, right);
      productListEl.append(li);
    }
  }

  function renderCart() {
    const isEmpty = cart.size === 0;
    const totalCount = getTotalItemCount();
    cartCountEl.textContent = `${totalCount} ${totalCount === 1 ? "item" : "items"}`;

    cartEmptyEl.classList.toggle("hidden", !isEmpty);
    cartListEl.classList.toggle("hidden", isEmpty);
    cartListEl.innerHTML = "";

    for (const [productId, qty] of cart.entries()) {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) continue;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.dataset.testid = `cart-row-${product.id}`;

      const topRow = document.createElement("div");
      topRow.className = "cart-item-top";

      const titleWrap = document.createElement("div");
      const nameDiv = document.createElement("div");
      nameDiv.className = "cart-item-name";
      nameDiv.textContent = product.name;

      const unitDiv = document.createElement("div");
      unitDiv.className = "cart-item-unit nums";
      unitDiv.textContent = `${formatMoney(product.pricePaise)} each`;

      titleWrap.append(nameDiv, unitDiv);

      const lineTotalDiv = document.createElement("div");
      lineTotalDiv.className = "cart-item-total nums";
      lineTotalDiv.dataset.testid = `line-total-${product.id}`;
      lineTotalDiv.textContent = formatMoney(product.pricePaise * qty);

      topRow.append(titleWrap, lineTotalDiv);

      const controlsRow = document.createElement("div");
      controlsRow.className = "cart-item-controls";

      const stepper = document.createElement("div");
      stepper.className = "stepper";

      const decBtn = document.createElement("button");
      decBtn.type = "button";
      decBtn.textContent = "−";
      decBtn.disabled = orderPlaced;
      decBtn.setAttribute("aria-label", `Decrease quantity of ${product.name}`);
      decBtn.addEventListener("click", () => updateQuantity(product.id, qty - 1));

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "1";
      qtyInput.value = String(qty);
      qtyInput.disabled = orderPlaced;
      qtyInput.setAttribute("aria-label", `Quantity of ${product.name}`);
      qtyInput.addEventListener("change", (e) => updateQuantity(product.id, e.target.value));

      const incBtn = document.createElement("button");
      incBtn.type = "button";
      incBtn.textContent = "+";
      incBtn.disabled = orderPlaced;
      incBtn.setAttribute("aria-label", `Increase quantity of ${product.name}`);
      incBtn.addEventListener("click", () => updateQuantity(product.id, qty + 1));

      stepper.append(decBtn, qtyInput, incBtn);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-remove";
      removeBtn.textContent = "Remove";
      removeBtn.disabled = orderPlaced;
      removeBtn.setAttribute("aria-label", `Remove ${product.name}`);
      removeBtn.addEventListener("click", () => removeItem(product.id));

      controlsRow.append(stepper, removeBtn);
      li.append(topRow, controlsRow);
      cartListEl.append(li);
    }

    orderTotalEl.textContent = formatMoney(getOrderTotalPaise());
  }

  function render() {
    renderProducts();
    renderCart();
  }

  customerNameEl.addEventListener("input", () => {
    if (!orderPlaced) clearValidationError();
  });

  checkoutFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    if (orderPlaced) return;

    const trimmedName = customerNameEl.value.trim();
    const errors = [];

    if (cart.size === 0) {
      errors.push("Your cart is empty. Add at least one item before placing an order.");
    }
    if (trimmedName.length === 0) {
      errors.push("Please enter your full name.");
    }

    if (errors.length > 0) {
      showValidationError(errors.join(" "));
      return;
    }

    orderPlaced = true;
    clearValidationError();
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Order Placed";
    customerNameEl.disabled = true;

    confirmationRefEl.textContent = generateOrderReference();
    confirmationNameEl.textContent = trimmedName;
    confirmationTotalEl.textContent = formatMoney(getOrderTotalPaise());
    confirmationEl.classList.remove("hidden");

    render();
  });

  render();
})();