export function resetContainer(container) {
  container.innerHTML = "";
}

export function refreshItemNumbers(container) {
  container.querySelectorAll(".item-card").forEach((card, index) => {
    const title = card.querySelector("h4");

    if (title) {
      title.textContent = `Item ${index + 1}`;
    }
  });
}

export function showError(container, message) {
  const div = document.createElement("div");

  div.className =
    "text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg";

  div.textContent = message;

  container.replaceChildren(div);
}

export function showLoading(container, message = "Memuat data...") {
  const div = document.createElement("div");

  div.className = "text-gray-400 text-sm p-3 text-center";

  div.textContent = message;

  container.replaceChildren(div);
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}