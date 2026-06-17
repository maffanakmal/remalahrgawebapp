import { formatDate } from "../../helpers/dom";

const $ = window.jQuery;

const tableLoading = document.getElementById("tableLoading");

const tableContainer = document.getElementById("tableContainer");

function initBelanjaBulananDataTable() {
  const table = document.getElementById("datatableBelanjaBulanan");

  if (!table) return;

  // Hindari double init
  if ($.fn.DataTable.isDataTable("#datatableBelanjaBulanan")) {
    return;
  }

  $("#datatableBelanjaBulanan").DataTable({
    processing: true,

    serverSide: true,

    autoWidth: false,

    responsive: true,

    ajax: {
      url: "http://localhost:3000/api/belanjabulanan/ga/transactions",

      type: "GET",

      xhrFields: {
        withCredentials: true,
      },

      dataSrc(json) {
        console.log("DATATABLE RESPONSE", json);

        return json.data || [];
      },

      error(xhr) {
        console.error("DATATABLE AJAX ERROR", xhr);

        tableLoading.innerHTML = `
            <div class="text-red-500 py-6">
              Gagal memuat data.
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

      searchPlaceholder: "Cari transaksi...",

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
        data: "location_name",

        defaultContent: "-",
      },

      {
        data: "product_name",

        defaultContent: "-",
      },

      {
        data: "quantity",

        defaultContent: 0,

        className: "text-center font-semibold",
      },

      {
        data: "current_stock",

        defaultContent: 0,

        className: "text-center",
      },

      {
        data: "status_request",

        render: (data) => {
          let badge = "bg-gray-100 text-gray-800";

          if (data === "Approved") {
            badge = "border border-green-600 bg-green-100 text-green-700";
          }

          if (data === "Pending") {
            badge = "border border-yellow-600 bg-yellow-100 text-yellow-700";
          }

          if (data === "Rejected") {
            badge = "border border-red-600 bg-red-100 text-red-700";
          }

          return `
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}">
                  ${data || "Pending"}
                </span>
              `;
        },
      },

      {
        data: "transaction_id",

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

  // Styling Datatables

  setTimeout(() => {
    $(".dataTables_filter input").addClass(
      "py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white md:w-64",
    );

    $(".dataTables_length select").addClass(
      "py-1.5 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
    );
  }, 50);
}

// Detail Button

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-detail");

  if (!btn) return;

  window.location.href = `/ga/belanjabulanan/detail/${btn.dataset.id}`;
});

// Astro SPA Safe

document.addEventListener("DOMContentLoaded", initBelanjaBulananDataTable);

// Fallback

initBelanjaBulananDataTable();
