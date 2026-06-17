export function showAlertCard({
  title,
  message,
  type = "success",
  duration = 3000,
  confirmText = "OK",
  cancelText = "Batal",
  showCancel = false,
}) {
  return new Promise((resolve) => {
    const callbackEventId =
      `alert-callback-${Date.now()}-${Math.random()}`;

    if (!showCancel) {
      resolve(true);
    }

    window.addEventListener(
      callbackEventId,
      (e) => {
        resolve(e.detail.confirmed);
      },
      { once: true }
    );

    window.dispatchEvent(
      new CustomEvent("show-alert", {
        detail: {
          title,
          message,
          type,
          duration,
          confirmText,
          cancelText,
          showCancel,
          callbackEventId,
        },
      })
    );
  });
}

export function showSuccess(
  message,
  title = "Berhasil"
) {
  return showAlertCard({
    title,
    message,
    type: "success",
  });
}

export function showError(
  message,
  title = "Error"
) {
  return showAlertCard({
    title,
    message,
    type: "error",
  });
}

export function showWarning(
  message,
  title = "Peringatan"
) {
  return showAlertCard({
    title,
    message,
    type: "warning",
  });
}

export function showInfo(
  message,
  title = "Informasi"
) {
  return showAlertCard({
    title,
    message,
    type: "info",
  });
}

export function showConfirm(
  message,
  title = "Konfirmasi",
  confirmText = "Ya",
  cancelText = "Batal"
) {
  return showAlertCard({
    title,
    message,
    type: "warning",
    duration: 0,
    confirmText,
    cancelText,
    showCancel: true,
  });
}