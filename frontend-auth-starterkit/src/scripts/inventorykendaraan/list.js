import { formatDate } from "../../helpers/dom";

const $ = window.jQuery;

const tableLoading = document.getElementById("tableLoading");

const tableContainer = document.getElementById("tableContainer");

function initInventoryKendaraanDataTable() {
  const table = document.getElementById("datatableInventoryKendaraan");

  if (!table) return;

  // Hindari double init Astro
  if ($.fn.DataTable.isDataTable("#datatableInventoryKendaraan")) {
    return;
  }

  $("#datatableInventoryKendaraan").DataTable({
    processing: true,

    serverSide: true,

    autoWidth: false,

    responsive: true,

    ajax: {
      url: "/api/inventorykendaraan/ga/reporting",

      type: "GET",

      xhrFields: {
        withCredentials: true,
      },

      error(xhr) {
        tableLoading.innerHTML = `
            <div class="text-red-500 py-6">
              Gagal memuat data inventory kendaraan.
            </div>
          `;
      },
    },

    initComplete() {
      tableLoading?.classList.add("hidden");

      tableContainer?.classList.remove("hidden");

      this.api().columns.adjust();
    },

    pageLength: 10,

    lengthMenu: [10, 25, 50, 100],

    ordering: true,

    language: {
      search: "_INPUT_",

      searchPlaceholder: "Cari data kendaraan...",

      zeroRecords: "Data tidak ditemukan",

      emptyTable: "Tidak ada data",

      processing: "Memuat data...",
    },

    columns: [
      {
        data: "created_at",

        render: (data) => (data ? formatDate(data) : "-"),
      },

      {
        data: "user_id",

        defaultContent: "-",
      },

      {
        data: "plate_number",

        defaultContent: "-",
      },

      {
        data: "vehicle_milage",

        defaultContent: 0,

        className: "text-center font-semibold",
      },

      {
        data: "report_id",

        orderable: false,

        searchable: false,

        className: "text-center",

        render: (id) => `
              <button
                class="btn-detail p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                data-id="${id}">
                <i class="fas fa-eye text-sm"></i>
              </button>
            `,
      },
    ],

    dom:
      "<'flex flex-col sm:flex-row items-center justify-between gap-4 mb-4'lf>" +
      "rt" +
      "<'flex flex-col sm:flex-row items-center justify-between gap-4 mt-4'ip>",
  });

  setTimeout(() => {
    $(".dataTables_filter input").addClass(
      "py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white md:w-64",
    );

    $(".dataTables_length select").addClass(
      "py-1.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
    );
  }, 50);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-detail");

  if (!btn) return;

  window.location.href = `/ga/inventorykendaraan/detail/${btn.dataset.id}`;
});

// Astro SPA safe
document.addEventListener("DOMContentLoaded", initInventoryKendaraanDataTable);

// Initial load
initInventoryKendaraanDataTable();
