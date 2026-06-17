import { initSelect2 } from "../../helpers/select2.js";
import { inventoryKendaraanApi } from "../../services/api/inventorykendaraan.api.js";
import { validate, rules } from "../../utils/validator.js";

import {
  showError,
  showSuccess,
  showWarning,
} from "../../helpers/alert.js";

import {
  renderVehicleInfo,
  clearVehicleInfo,
  mapVehicleToFields,
} from "../../utils/vehicleInfo.js";

const form = document.getElementById("vehicleInventoryForm");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const plateSelect = document.getElementById("plate_number");
const vehicleInfoContainer = document.querySelector(".vehicle-information");
const emptyState = document.getElementById("emptyState");

const $ = window.jQuery;

const ORIGINAL_EMPTY_STATE_HTML = emptyState.innerHTML;

// ── Validation Rules ─────────────────────────────────────────────────────────
const validationRules = {
  vehicle_inventory_date: [rules.required("Tanggal Inventory")],
  plate_number: [rules.required("Nomor Plat")],
  vehicle_color: [
    rules.required("Warna Kendaraan"),
    rules.maxLength(50, "Warna Kendaraan"),
  ],
  vehicle_milage: [
    rules.required("KM Kendaraan"),
    rules.numeric("KM Kendaraan"),
    rules.min(0, "KM Kendaraan"),
  ],
  equipment_detail: [
    rules.required("Detail Peralatan"),
    rules.maxLength(500, "Detail Peralatan"),
  ],
  physical_condition: [
    rules.required("Kondisi Fisik"),
    rules.maxLength(500, "Kondisi Fisik"),
  ],
};

// ── Error Helpers (pola sama dengan login & register) ────────────────────────
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
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
function restoreEmptyState() {
  emptyState.innerHTML = ORIGINAL_EMPTY_STATE_HTML;
}

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

function getFormData() {
  return {
    vehicle_inventory_date: form.vehicle_inventory_date.value.trim(),
    plate_number: plateSelect.value,
    vehicle_color: form.vehicle_color.value.trim(),
    vehicle_milage: form.vehicle_milage.value.trim(),
    equipment_detail: form.equipment_detail.value.trim(),
    physical_condition: form.physical_condition.value.trim(),
  };
}

// ── Load Plate Number Options ───────────────────────────────────────────────
async function loadVehicle() {
  try {
    const response = await inventoryKendaraanApi.ga.getAllKendaraan();
    const vehicles = response?.data ?? [];

    plateSelect.innerHTML = '<option value="">Pilih Nomor Plat</option>';

    vehicles.forEach((vehicle) => {
      const option = document.createElement("option");
      option.value = vehicle.plate_number;
      option.textContent = vehicle.plate_number;
      plateSelect.appendChild(option);
    });

    plateSelect.disabled = false;
    initSelect2(plateSelect, "Pilih Nomor Plat");
  } catch (error) {
    plateSelect.innerHTML = '<option value="">Gagal memuat nomor plat</option>';
    showError("Gagal memuat daftar nomor plat. Muat ulang halaman.", "Gagal");
    console.error("load plate select error:", error);
  }
}

// ── Load Vehicle Info by Plate Number ───────────────────────────────────────
async function loadVehicleByPlateNumber(plateNumber) {
  emptyState.classList.remove("hidden");
  vehicleInfoContainer.classList.add("hidden");

  emptyState.innerHTML = `
    <div class="flex flex-col items-center justify-center">
      <p class="text-sm text-gray-500 font-medium">
        Memuat data...
      </p>
      <p class="text-xs text-gray-400 mt-1">Mohon tunggu sebentar</p>
    </div>
  `;

  try {
    const response = await inventoryKendaraanApi.ga.getKendaraanByPlateNumber(plateNumber);
    const vehicle = response?.data ?? null;

    if (!vehicle) {
      throw new Error("Data spesifikasi kendaraan tidak ditemukan");
    }

    const fields = mapVehicleToFields(vehicle);
    renderVehicleInfo(vehicleInfoContainer, emptyState, fields);
  } catch (error) {
    clearVehicleInfo(vehicleInfoContainer, emptyState);

    emptyState.innerHTML = `
      <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
      </div>
      <p class="text-sm text-red-500 font-medium">Gagal memuat data kendaraan</p>
      <p class="text-xs text-gray-400 mt-1">Periksa koneksi sistem atau pilih kembali plat nomor</p>
    `;

    console.error("loadVehicleByPlateNumber error:", error);
  }
}

// ── Plate Number Change ──────────────────────────────────────────────────────
$(plateSelect).on("change", function () {
  const plateNumber = this.value;

  clearFieldError("plate_number");

  if (!plateNumber) {
    restoreEmptyState();
    clearVehicleInfo(vehicleInfoContainer, emptyState);
    return;
  }

  loadVehicleByPlateNumber(plateNumber);
});

// ── Hapus error saat user mengetik ───────────────────────────────────────────
form.addEventListener("input", (e) => {
  const target = e.target;

  if (!target?.name) return;

  clearFieldError(target.name);
});

// ── Form Submit ───────────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Cegah double submit
  if (submitBtn.disabled) return;

  clearAllFieldErrors();

  const data = getFormData();

  const { valid, errors } = validate(data, validationRules);

  if (!valid) {
    Object.keys(errors).forEach((fieldName) => {
      setFieldError(fieldName, errors[fieldName]);
    });

    showWarning("Periksa kembali data yang Anda masukkan.", "Validasi");
    return;
  }

  setLoading(true);

  try {
    await inventoryKendaraanApi.ga.createReporting(data);

    showSuccess("Pengajuan berhasil dikirim!", "Berhasil");

    form.reset();
    $(plateSelect).val(null).trigger("change");
    restoreEmptyState();
    clearVehicleInfo(vehicleInfoContainer, emptyState);
  } catch (error) {
    showError(getSubmitErrorMessage(error), "Gagal");
  } finally {
    setLoading(false);
  }
});

// ── Form Reset Handling ──────────────────────────────────────────────────────
resetBtn.addEventListener("click", (e) => {
  e.preventDefault();
  form.reset();

  clearAllFieldErrors();

  $(plateSelect).val("").trigger("change");

  restoreEmptyState();
  clearVehicleInfo(vehicleInfoContainer, emptyState);
});

// ── Init ──────────────────────────────────────────────────────────────────────
function initVehicleInventoryForm() {
  if (!form) return;

  if (form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  loadVehicle();
}

initVehicleInventoryForm();

document.addEventListener("DOMContentLoaded", initVehicleInventoryForm);