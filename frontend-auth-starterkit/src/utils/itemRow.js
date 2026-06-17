import { initSelect2, destroySelect2 } from "../helpers/select2.js";

export function createItemRow(
  itemIndex,
  displayNumber,
  products = [],
  { onRemove } = {},
) {
  const wrapper = document.createElement("div");

  wrapper.className =
    "item-row p-4 border border-gray-200 rounded-lg bg-gray-50";

  wrapper.dataset.id = itemIndex;

  wrapper.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h4 class="item-heading font-semibold text-gray-700">
        Item ${displayNumber}
      </h4>

      <button
        type="button"
        class="remove-item inline-flex items-center justify-center bg-red-700 text-white w-9 h-9 rounded-md"
      >
        <i class="fa-solid fa-trash text-sm"></i>
      </button>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          class="manual-toggle"
          id="manual-${itemIndex}"
        />
        <label
          for="manual-${itemIndex}"
          class="text-sm text-gray-600"
        >
          Item tidak ditemukan?
        </label>
      </div>

      <div class="select-wrapper">
        <label class="block mb-2 text-sm font-medium">
          Item
        </label>

        <select
          class="item-select w-full py-2.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
        >
          <option value="">Pilih Item</option>

          ${products
      .map(
        (p) => `
                <option
                  value="${p.stock_id}"
                  data-product="${p.product_name}"
                  data-stock="${p.current_stock || 0}"
                  data-unit="${p.unit || ""}"
                >
                  ${p.product_name}
                </option>
              `,
      )
      .join("")}
        </select>
      </div>

      <div class="manual-wrapper hidden">
        <label class="block mb-2 text-sm font-medium">
          Nama Item
        </label>

        <input
          type="text"
          class="manual-item-input w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Masukkan nama item"
        />
      </div>

      <div class="stock-info hidden">
        <label class="block mb-2 text-sm font-medium">
          Stok Tersedia
        </label>

        <div class="flex items-center justify-between py-2 px-4 border border-gray-200 rounded-md bg-gray-50 text-sm">
          <div>
            <span class="stock-available font-semibold">0</span>
            <span class="stock-unit text-gray-500"></span>
          </div>
        </div>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium">
          Jumlah
        </label>

        <div class="flex items-center gap-2">
          <input
            type="number"
            placeholder="Masukkan jumlah"
            class="qty-input w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            min="1"
            required
            disabled
          />

          <span class="quantity-unit text-sm text-gray-500 min-w-[40px]"></span>
        </div>
      </div>

      <p class="stock-message text-sm text-red-500 hidden">
        <i class="fa-solid fa-circle-exclamation"></i>
        Stok tidak tersedia.
      </p>

      <p class="item-error text-xs text-red-500 hidden" data-error="item"></p>
    </div>
  `;

  const $ = window.jQuery;

  const manualToggle = wrapper.querySelector(".manual-toggle");
  const selectWrapper = wrapper.querySelector(".select-wrapper");
  const manualWrapper = wrapper.querySelector(".manual-wrapper");
  const itemSelect = wrapper.querySelector(".item-select");
  const qtyInput = wrapper.querySelector(".qty-input");
  const stockInfo = wrapper.querySelector(".stock-info");
  const stockMessage = wrapper.querySelector(".stock-message");
  const quantityUnit = wrapper.querySelector(".quantity-unit");
  const stockAvailable = wrapper.querySelector(".stock-available");
  const stockUnit = wrapper.querySelector(".stock-unit");
  const removeButton = wrapper.querySelector(".remove-item");
  const itemError = wrapper.querySelector(".item-error");

  // Init Select2
  initSelect2(itemSelect, "Pilih Item");

  function clearItemError() {
    itemError.textContent = "";
    itemError.classList.add("hidden");
  }

  function resetStockInfo() {
    stockInfo.classList.add("hidden");
    stockMessage.classList.add("hidden");

    qtyInput.disabled = true;
    qtyInput.value = "";

    quantityUnit.textContent = "";
    stockAvailable.textContent = "0";
    stockUnit.textContent = "";
  }

  function handleItemChange() {
    clearItemError();

    const selected = itemSelect.options[itemSelect.selectedIndex];

    if (!selected || !selected.value) {
      resetStockInfo();
      return;
    }

    const stock = Number(selected.dataset.stock || 0);
    const unit = selected.dataset.unit || "";

    stockInfo.classList.remove("hidden");

    stockAvailable.textContent = stock;
    stockUnit.textContent = unit;
    quantityUnit.textContent = unit;

    if (stock <= 0) {
      stockMessage.classList.remove("hidden");
      qtyInput.disabled = true;
      qtyInput.value = "";
    } else {
      stockMessage.classList.add("hidden");
      qtyInput.disabled = false;
    }
  }

  // Toggle manual item
  manualToggle.addEventListener("change", () => {
    clearItemError();

    const isManual = manualToggle.checked;

    if (isManual) {
      selectWrapper.classList.add("hidden");
      manualWrapper.classList.remove("hidden");

      $(itemSelect).val(null).trigger("change");

      stockInfo.classList.add("hidden");
      stockMessage.classList.add("hidden");

      quantityUnit.textContent = "";

      qtyInput.disabled = false;
      qtyInput.value = "";
    } else {
      selectWrapper.classList.remove("hidden");
      manualWrapper.classList.add("hidden");

      resetStockInfo();
    }
  });

  // Hapus error saat user mengisi input
  manualWrapper
    .querySelector(".manual-item-input")
    .addEventListener("input", clearItemError);

  qtyInput.addEventListener("input", clearItemError);

  // Select2 events
  $(itemSelect).on("select2:select select2:clear change", handleItemChange);

  // Remove item
  removeButton.addEventListener("click", () => {
    $(itemSelect).off("select2:select select2:clear change", handleItemChange);

    destroySelect2(itemSelect);

    onRemove?.(itemIndex);

    wrapper.remove();
  });

  return wrapper;
}