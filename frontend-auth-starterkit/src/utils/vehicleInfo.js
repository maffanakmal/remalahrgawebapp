export function renderVehicleInfo(containerEl, emptyStateEl, fields = []) {
  if (!fields.length) {
    emptyStateEl.classList.remove("hidden");
    containerEl.classList.add("hidden");
    containerEl.innerHTML = "";
    return;
  }

  emptyStateEl.classList.add("hidden");
  containerEl.classList.remove("hidden");

  containerEl.innerHTML = `
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
      <p class="text-sm font-semibold text-blue-700 mb-3">Informasi Kendaraan</p>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2">
        ${fields.map((f) => `
          <div>
            <p class="text-xs text-gray-500">${f.label}</p>
            <p class="text-sm font-medium text-gray-800">${f.value || "-"}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function clearVehicleInfo(containerEl, emptyStateEl) {
  renderVehicleInfo(containerEl, emptyStateEl, []);
}

export function mapVehicleToFields(vehicle) {
  if (!vehicle) return [];
  return [
    { label: "Nomor Plat", value: vehicle.plate_number },
    { label: "Merk / Brand", value: vehicle.car_brand },
    { label: "Tipe Kendaraan", value: vehicle.car_type },
    { label: "PIC / Driver", value: vehicle.pic },
    { label: "NIK PIC", value: vehicle.nik },
    { label: "Jabatan PIC", value: vehicle.job_position },
    { label: "Direktorat", value: vehicle.directorate },
    { label: "Jenis Penggunaan", value: vehicle.usage_type },
    { label: "Nomor Mesin", value: vehicle.machine_number },
    { label: "Nomor Rangka", value: vehicle.frame_number },
    { label: "Jenis Kendaraan (Kategori)", value: vehicle.vehicle_type },
    { label: "STNK Atas Nama", value: vehicle.stnk_under_name_of },
    { label: "Masa Berlaku STNK", value: vehicle.stnk_date },
    { label: "Masa Berlaku KIR", value: vehicle.kir_date },
    { label: "Mulai Asuransi", value: vehicle.insurance_start_date }
  ];
}