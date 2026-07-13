/*
  Shop-Api — VanillaJS compartilhado
  ----------------------------------
  Responsável por: dropdown da Área do Cliente, contador do carrinho
  (localStorage), adicionar/remover itens, seletores de quantidade e
  renderização dinâmica da página de carrinho.
*/

const Store = (() => {
  const KEY = "shop-cart";

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("cart:change"));
    updateBadges();
  };

  const add = (product) => {
    const items = read();
    const found = items.find((i) => i.id === product.id);
    if (found) found.qty += product.qty || 1;
    else items.push({ ...product, qty: product.qty || 1 });
    write(items);
  };

  const remove = (id) => write(read().filter((i) => i.id !== id));

  const setQty = (id, qty) => {
    const items = read();
    const it = items.find((i) => i.id === id);
    if (it) {
      it.qty = Math.max(1, qty);
      write(items);
    }
  };

  const count = () => read().reduce((s, i) => s + i.qty, 0);

  const total = () => read().reduce((s, i) => s + i.qty * i.price, 0);

  const all = read;

  function updateBadges() {
    const n = count();
    document
      .querySelectorAll("[data-cart-count]")
      .forEach((el) => {
        el.textContent = String(n);
        el.classList.toggle("hidden", n === 0);
      });
  }

  return { add, remove, setQty, count, total, all, updateBadges };
})();

/* ---------- Dropdown da Área do Cliente ---------- */
function initCustomerDropdown() {
  const wrap = document.querySelector("[data-customer-menu]");
  if (!wrap) return;
  const btn = wrap.querySelector("[data-customer-toggle]");
  const panel = wrap.querySelector("[data-customer-panel]");

  const close = () => {
    panel.classList.add("opacity-0", "invisible", "translate-y-2");
    btn.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    panel.classList.remove("opacity-0", "invisible", "translate-y-2");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- Seletor de quantidade genérico ---------- */
function initQtySelectors() {
  document.querySelectorAll("[data-qty]").forEach((group) => {
    const input = group.querySelector("input");
    const dec = group.querySelector("[data-qty-dec]");
    const inc = group.querySelector("[data-qty-inc]");
    if (!input) return;
    const min = parseInt(input.min || "1", 10);
    const max = parseInt(input.max || "99", 10);

    const clamp = (v) => Math.min(max, Math.max(min, v));
    const emit = () => {
      input.value = clamp(parseInt(input.value || min, 10));
      group.dispatchEvent(new CustomEvent("qty:change", { detail: +input.value }));
    };

    dec?.addEventListener("click", () => {
      input.value = clamp((parseInt(input.value || min, 10)) - 1);
      emit();
    });
    inc?.addEventListener("click", () => {
      input.value = clamp((parseInt(input.value || min, 10)) + 1);
      emit();
    });
    input.addEventListener("change", emit);
  });
}

/* ---------- Botões "Adicionar ao carrinho" ---------- */
function initAddToCart() {
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img || "",
        qty: parseInt(btn.dataset.qty || "1", 10),
      };
      Store.add(p);
      flash(btn, "Adicionado ✓");
    });
  });
}

function flash(btn, text) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = text;
  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
  }, 1200);
}

/* ---------- Renderização da página de carrinho ---------- */
function renderCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const summary = document.querySelector("[data-cart-summary]");
  const empty = document.querySelector("[data-cart-empty]");
  if (!list) return;

  const items = Store.all();

  if (items.length === 0) {
    list.classList.add("hidden");
    summary?.classList.add("hidden");
    empty?.classList.remove("hidden");
    return;
  }

  empty?.classList.add("hidden");
  list.classList.remove("hidden");
  summary?.classList.remove("hidden");

  const fmt = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  list.innerHTML = items
    .map(
      (i) => `
    <div class="card p-4 sm:p-5 flex gap-4 items-center" data-row="${i.id}">
      <div class="product-media !aspect-square w-24 h-24 shrink-0 rounded-xl text-zinc-600 text-2xl font-bold">img</div>
      <div class="flex-1 min-w-0">
        <a href="produto.html" class="block truncate font-semibold text-zinc-100 hover:text-brand-400 transition-colors">${i.name}</a>
        <p class="text-sm text-zinc-500 mt-0.5">SKU · ${i.id}</p>
        <div class="mt-3 flex items-center gap-4">
          <div class="qty" data-qty data-qty-row="${i.id}">
            <button data-qty-dec aria-label="Diminuir">−</button>
            <input type="number" value="${i.qty}" min="1" max="99" aria-label="Quantidade" />
            <button data-qty-inc aria-label="Aumentar">+</button>
          </div>
          <button class="btn-danger !px-3 !py-2 text-xs" data-remove="${i.id}">Remover</button>
        </div>
      </div>
      <div class="text-right shrink-0">
        <p class="price text-lg">${fmt(i.price * i.qty)}</p>
        <p class="text-xs text-zinc-500">${fmt(i.price)} / un</p>
      </div>
    </div>`
    )
    .join("");

  // Rebind qty + remove
  initQtySelectors();
  list.querySelectorAll("[data-qty-row]").forEach((g) => {
    const id = g.getAttribute("data-qty-row");
    g.addEventListener("qty:change", (e) => {
      Store.setQty(id, e.detail);
      renderCartPage();
    });
  });
  list.querySelectorAll("[data-remove]").forEach((b) => {
    b.addEventListener("click", () => {
      Store.remove(b.getAttribute("data-remove"));
      renderCartPage();
    });
  });

  // Summary
  const subtotal = Store.total();
  const shipping = subtotal > 299 ? 0 : 29.9;
  const total = subtotal + shipping;
  if (summary) {
    summary.querySelector("[data-subtotal]").textContent = fmt(subtotal);
    summary.querySelector("[data-shipping]").textContent =
      shipping === 0 ? "Grátis" : fmt(shipping);
    summary.querySelector("[data-total]").textContent = fmt(total);
  }
}

/* ---------- Bootstrap ----------
   layout.js injeta o header e chama window.__layoutReady(). O guard
   `booted` evita dupla inicialização quando o evento DOMContentLoaded
   também dispara o boot. */
let booted = false;
function boot() {
  if (booted) return;
  booted = true;
  initCustomerDropdown();
  initQtySelectors();
  initAddToCart();
  Store.updateBadges();
  renderCartPage();
}
window.__layoutReady = boot;
document.addEventListener("DOMContentLoaded", boot);
