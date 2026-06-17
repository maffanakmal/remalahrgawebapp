import { initItemManager } from "../../utils/itemManager.js";
import { belanjaBulananApi } from "../../services/api/belanjabulanan.api.js";
import { initSelect2 } from "../../helpers/select2.js";
import { validate, rules } from "../../utils/validator.js";

import {
  showError,
  showSuccess,
  showInfo,
} from "../../helpers/alert.js";

const locationSelect = document.getElementById("location");
const addItemBtn = document.getElementById("addItemBtn");
const form = document.getElementById("monthlyShoppingForm");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const manager = initItemManager({
  containerEl: document.getElementById("itemContainer"),
  emptyStateEl: document.getElementById("emptyState"),
  addBtnEl: addItemBtn,
  products: [],
  maxItems: 5,
});

let api = window.isLoggedIn
  ? belanjaBulananApi.ga
  : belanjaBulananApi;

const $ = window.jQuery;

// ── Validation Rules ─────────────────────────────────────────────────────────
const validationRules = {
  location: [rules.required("Lokasi")],
};

// ── Error Helpers (pola sama dengan login, register, & inventory) ────────────
function setFieldError(fieldName, message) {
  const errorEl = form.querySelector(`[data-error="${fieldName}"]`);
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearFieldError(fieldName) {
  const errorEl = form.querySelector(`[data-error="${fieldName}"]`);
  if (!errorEl) return;

  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function clearAllFieldErrors() {
  form.querySelectorAll("[data-error]").forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });

  manager.clearItemErrors();
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  resetBtn.disabled = isLoading;

  if (isLoading) {
    submitBtn.dataset.originalText =
      submitBtn.dataset.originalText || submitBtn.textContent;
    submitBtn.textContent = "Mengirim...";
  } else {
    submitBtn.textContent = submitBtn.dataset.originalText || "Kirim";
  }
}

function getSubmitErrorMessage(error) {
  if (error instanceof TypeError) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }

  return error?.message || "Terjadi kesalahan, coba lagi.";
}

// ── Load Locations ────────────────────────────────────────────────────────
async function loadLocations() {
  try {
    const response = await api.getAllLocations();
    const locations = response?.data ?? [];

    locationSelect.innerHTML =
      '<option value="">Pilih Perusahaan - Lokasi/Divisi</option>';

    locations.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.location_id;
      option.textContent = loc.location_name;
      locationSelect.appendChild(option);
    });

    locationSelect.disabled = false;

    initSelect2(locationSelect, "Pilih Perusahaan - Lokasi/Divisi");
  } catch (error) {
    locationSelect.innerHTML = '<option value="">Gagal memuat lokasi</option>';

    showError("Gagal memuat daftar lokasi. Muat ulang halaman.", "Gagal");
    console.error("loadLocations error:", error);
  }
}

// ── Load Stocks ───────────────────────────────────────────────────────────
async function loadStocksByLocation(locationId) {

  manager.clearItems();
  manager.setProducts([]);

  const emptyState = document.getElementById("emptyState");

  addItemBtn.disabled = true;

  emptyState.innerHTML = `
    <p class="text-sm text-gray-500 font-medium">
      Memuat data...
    </p>
    <p class="text-xs text-gray-400 mt-1">
      Mohon tunggu sebentar
    </p>
  `;

  emptyState.classList.remove("hidden");

  try {
    const response = await api.getStockByLocationId(locationId);
    const stocks = response?.data ?? [];

    manager.setProducts(stocks);

    addItemBtn.disabled = false;

    emptyState.innerHTML = `
      <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <i class="fas fa-box-open text-gray-400"></i>
      </div>

      <p class="text-sm text-gray-500 font-medium">
        Belum ada item
      </p>

      <p class="text-xs text-gray-400 mt-1">
        Klik "Tambah Item" untuk mulai mengisi
      </p>
    `;
  } catch (error) {
    emptyState.innerHTML = `
      <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
      </div>

      <p class="text-sm text-red-500 font-medium">
        Gagal memuat data
      </p>

      <p class="text-xs text-gray-400 mt-1">
        Periksa koneksi dan coba lagi
      </p>
    `;

    console.error("loadStocksByLocation error:", error);
  }
}

// ── Location Change ───────────────────────────────────────────────────────
$(locationSelect).on("select2:select select2:clear", () => {
  const locationId = locationSelect.value;

  clearFieldError("location");

  if (!locationId) {
    manager.clearItems();
    manager.setProducts([]);
    addItemBtn.disabled = true;
    return;
  }

  loadStocksByLocation(locationId);
});

// ── Validasi Items ────────────────────────────────────────────────────────
function validateItems(items) {
  let valid = true;

  if (!items.length) {
    setFieldError("items", "Tambahkan minimal 1 item.");
    return false;
  }

  items.forEach((item, index) => {
    if (!item.stock_id && !item.manual_item_name) {
      manager.setItemError(index, "Item wajib dipilih atau diisi manual.");
      valid = false;
      return;
    }

    if (!item.qty || item.qty < 1) {
      manager.setItemError(index, "Jumlah wajib diisi minimal 1.");
      valid = false;
    }
  });

  return valid;
}

// ── Form Submit ───────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Cegah double submit
  if (submitBtn.disabled) return;

  clearAllFieldErrors();

  const data = {
    location: locationSelect.value,
  };

  const { valid: locationValid, errors } = validate(data, validationRules);

  if (!locationValid) {
    Object.keys(errors).forEach((fieldName) => {
      setFieldError(fieldName, errors[fieldName]);
    });

    return;
  }

  const items = manager.getItems();

  if (!validateItems(items)) {
    return;
  }

  setLoading(true);

  try {
    await api.createTransaction({
      location_id: data.location,
      items,
    });

    showSuccess("Pengajuan berhasil dikirim!", "Berhasil");

    form.reset();

    manager.clearItems();
    manager.setProducts([]);

    addItemBtn.disabled = true;

    $(locationSelect).val(null).trigger("change");
  } catch (error) {
    showError(getSubmitErrorMessage(error), "Gagal");
  } finally {
    setLoading(false);
  }
});

// ── Reset Form ────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", (e) => {
  e.preventDefault();

  form.reset();

  clearAllFieldErrors();

  manager.clearItems();
  manager.setProducts([]);

  addItemBtn.disabled = true;

  $(locationSelect).val(null).trigger("change");

  showInfo("Form telah direset.", "Reset");
});

// ── Initialize Page ───────────────────────────────────────────────────────
function initMonthlyShoppingForm() {
  if (!form) return;

  if (form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  loadLocations();
}

initMonthlyShoppingForm();

document.addEventListener("DOMContentLoaded", initMonthlyShoppingForm);