function getJQuery() {
  const $ = window.jQuery;

  if (!$) {
    console.error("jQuery tidak tersedia. Pastikan jQuery sudah di-load sebelum script ini.");
    return null;
  }

  return $;
}

export function initSelect2(element, placeholder = "") {
  const $ = getJQuery();
  if (!$) return;

  $(element).select2({
    width: "100%",
    placeholder,
  });
}

export function destroySelect2(element) {
  const $ = getJQuery();
  if (!$) return;

  if ($(element).hasClass("select2-hidden-accessible")) {
    $(element).select2("destroy");
  }
}