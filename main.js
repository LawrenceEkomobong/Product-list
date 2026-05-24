const url = "data.json";

// Cart state: { itemName: { quantity, price, category } }
const cart = {};

async function fetchJSONData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("response is not okay");
    const data = await response.json();

    data.forEach((el) => {
      const div = document.createElement("div");
      div.classList.add("cakes");
      div.dataset.name = el.name;
      div.dataset.price = el.price;

      div.innerHTML = `
        <div class="image-wrapper">
         <img src="${el.image.mobile}" alt="${el.name}" class="cake-img"/>
          <button class="add-to-cart" data-name="${el.name}" data-price="${el.price}">
            <img src="/images/icon-add-to-cart.svg" alt="cart icon"/>
            <p>Add to Cart</p>
          </button>
          <div class="qty-stepper hidden" data-name="${el.name}">
            <button class="qty-btn decrement" data-name="${el.name}">&#8722;</button>
            <span class="qty-count" data-name="${el.name}">0</span>
            <button class="qty-btn increment" data-name="${el.name}">&#43;</button>
          </div>
        </div>
        <div class="details">
          <p class="category">${el.category}</p>
          <p class="name">${el.name}</p>
          <p class="price">$${Number(el.price).toFixed(2)}</p>
        </div>
      `;

      document.querySelector("#cakes").appendChild(div);
    });

    // Event delegation on the cakes section
    document.querySelector("#cakes").addEventListener("click", (e) => {
      // Add to cart button
      const addBtn = e.target.closest(".add-to-cart");
      if (addBtn) {
        const name = addBtn.dataset.name;
        const price = parseFloat(addBtn.dataset.price);
        addToCart(name, price);
        return;
      }

      // Increment
      const incBtn = e.target.closest(".increment");
      if (incBtn) {
        const name = incBtn.dataset.name;
        changeQty(name, 1);
        return;
      }

      // Decrement
      const decBtn = e.target.closest(".decrement");
      if (decBtn) {
        const name = decBtn.dataset.name;
        changeQty(name, -1);
        return;
      }
    });
  } catch (err) {
    console.log("Failed to load JSON data", err);
  }
}

function addToCart(name, price) {
  if (!cart[name]) {
    cart[name] = { quantity: 1, price };
  } else {
    cart[name].quantity += 1;
  }
  showStepper(name);
  updateStepperDisplay(name);
  renderCart();
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].quantity += delta;

  if (cart[name].quantity <= 0) {
    delete cart[name];
    hideStepper(name);
  } else {
    updateStepperDisplay(name);
  }
  renderCart();
}

function showStepper(name) {
  const wrapper = document.querySelector(`.image-wrapper:has([data-name="${name}"].add-to-cart)`);
  if (!wrapper) return;
  const addBtn = wrapper.querySelector(".add-to-cart");
  const stepper = wrapper.querySelector(".qty-stepper");
  const img = wrapper.querySelector(".cake-img");
  addBtn.classList.add("hidden");
  stepper.classList.remove("hidden");
  img.classList.add("selected");
}

function hideStepper(name) {
  const wrapper = document.querySelector(`.image-wrapper:has([data-name="${name}"].add-to-cart)`);
  if (!wrapper) return;
  const addBtn = wrapper.querySelector(".add-to-cart");
  const stepper = wrapper.querySelector(".qty-stepper");
  const img = wrapper.querySelector(".cake-img");
  addBtn.classList.remove("hidden");
  stepper.classList.add("hidden");
  img.classList.remove("selected");
}

function updateStepperDisplay(name) {
  const count = document.querySelector(`.qty-count[data-name="${name}"]`);
  if (count && cart[name]) {
    count.textContent = cart[name].quantity;
  }
}

function renderCart() {
  const cartSection = document.querySelector("#num-of-cart");
  const totalItems = Object.values(cart).reduce((sum, i) => sum + i.quantity, 0);
  const orderTotal = Object.values(cart).reduce((sum, i) => sum + i.quantity * i.price, 0);

  if (totalItems === 0) {
    cartSection.innerHTML = `
      <h2>Your Cart (0)</h2>
      <img src="/images/illustration-empty-cart.svg" alt="empty cart"/>
      <p style="color: hsl(12, 20%, 44%); font-weight: 500;">Your added items will appear here</p>
    `;
    return;
  }

  let itemsHTML = "";
  for (const [name, { quantity, price }] of Object.entries(cart)) {
    const itemTotal = (quantity * price).toFixed(2);
    itemsHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-name">${name}</p>
          <div class="cart-item-details">
            <span class="cart-qty">${quantity}x</span>
            <span class="cart-unit-price">@ $${Number(price).toFixed(2)}</span>
            <span class="cart-item-total">$${itemTotal}</span>
          </div>
        </div>
        <button class="remove-btn" data-name="${name}" title="Remove item">&#10006;</button>
      </div>
      <hr class="cart-divider"/>
    `;
  }

  cartSection.innerHTML = `
    <h2 class="cart-title">Your Cart (${totalItems})</h2>
    <div class="cart-items">${itemsHTML}</div>
    <div class="order-total-row">
      <span class="order-total-label">Order Total</span>
      <span class="order-total-value">$${orderTotal.toFixed(2)}</span>
    </div>
    <div class="carbon-neutral-banner">
      <span class="tree-icon">🌳</span>
      <p>This is a <strong>carbon-neutral</strong> delivery</p>
    </div>
    <button class="confirm-order-btn">Confirm Order</button>
  `;

  // Remove item buttons
  cartSection.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      delete cart[name];
      hideStepper(name);
      renderCart();
    });
  });

  // Confirm order
  cartSection.querySelector(".confirm-order-btn").addEventListener("click", () => {
    alert("Order confirmed! Thank you 🎉");
    Object.keys(cart).forEach((name) => {
      delete cart[name];
      hideStepper(name);
    });
    renderCart();
  });
}

fetchJSONData(url);

// Dark mode toggle
document.querySelector("#switch").addEventListener("click", () => {
  if (document.body.style.background === "black") {
    document.body.style.background = "hsl(13, 31%, 94%)";
    document.querySelector("#deserts").style.color = "black";
  } else {
    document.body.style.background = "black";
    document.querySelector("#deserts").style.color = "white";
  }
});


