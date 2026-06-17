import { createItemRow } from "./itemRow.js";
import { destroySelect2 } from "../helpers/select2.js";

export function initItemManager({ containerEl, emptyStateEl, addBtnEl, products = [], maxItems = 5 }) {
  let itemCount = 0;
  let items = [];
  let currentProducts = [...products];

  function updateEmptyState() {
    if (items.length === 0) {
      emptyStateEl.classList.remove("hidden");
      containerEl.classList.add("hidden");
    } else {
      emptyStateEl.classList.add("hidden");
      containerEl.classList.remove("hidden");
    }
  }

  function renumberItems() {
    containerEl.querySelectorAll(".item-row").forEach((row, index) => {
      const heading = row.querySelector(".item-heading");
      if (heading) heading.textContent = `Item ${index + 1}`;
    });
    items.forEach((item, index) => {
      item.displayNumber = index + 1;
    });
  }

  function handleRemove(itemIndex) {
    items = items.filter((i) => i.id !== itemIndex);
    renumberItems();
    updateEmptyState();
    addBtnEl.disabled = false;
  }

  addBtnEl.addEventListener("click", () => {
    if (items.length >= maxItems) return;

    itemCount++;
    const displayNumber = items.length + 1;
    items.push({ id: itemCount, displayNumber });

    const row = createItemRow(itemCount, displayNumber, currentProducts, {
      onRemove: handleRemove,
    });

    containerEl.appendChild(row);
    updateEmptyState();

    if (items.length >= maxItems) {
      addBtnEl.disabled = true;
    }
  });

  // --- Public methods ---

  // Ganti products, berlaku untuk item row yang ditambah berikutnya
  function setProducts(newProducts) {
    currentProducts = [...newProducts];
  }

  // Hapus semua item row yang ada
  function clearItems() {
    // Destroy semua select2 di item rows sebelum clear
    containerEl.querySelectorAll(".item-select").forEach((el) => {
      destroySelect2(el);
    });

    containerEl.innerHTML = "";
    items = [];
    updateEmptyState();
    addBtnEl.disabled = false;
  }

  function getItems() {
    return Array.from(containerEl.querySelectorAll(".item-row")).map((row) => {
      const isManual = row.querySelector(".manual-toggle")?.checked ?? false;
      const itemSelect = row.querySelector(".item-select");
      const manualInput = row.querySelector(".manual-item-input");
      const qtyInput = row.querySelector(".qty-input");

      return {
        stock_id: !isManual && itemSelect?.value ? itemSelect.value : null,
        manual_item_name: isManual ? manualInput?.value?.trim() ?? null : null,
        qty: qtyInput?.value ? parseInt(qtyInput.value) : null,
      };
    });
  }

  // Tampilkan pesan error pada item row tertentu (berdasarkan urutan/index)
  function setItemError(index, message) {
    const row = containerEl.querySelectorAll(".item-row")[index];
    if (!row) return;

    const errorEl = row.querySelector('[data-error="item"]');
    if (!errorEl) return;

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  // Hapus semua pesan error pada seluruh item row
  function clearItemErrors() {
    containerEl.querySelectorAll('[data-error="item"]').forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
  }

  updateEmptyState();

  return {
    setProducts,
    clearItems,
    getItems,
    setItemError,
    clearItemErrors,
  };
}