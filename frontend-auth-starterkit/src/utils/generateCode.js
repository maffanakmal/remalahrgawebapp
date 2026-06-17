export function generateId(prefix = "TRX", currentLineNumber = 1) {
  const today = new Date();
  const day   = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year  = today.getFullYear();
  const formattedDate = `${day}${month}${year}`;

  const padRow = String(currentLineNumber).padStart(4, "0");

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSuffix = "";

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    for (let i = 0; i < 4; i++) {
      randomSuffix += characters.charAt(array[i] % characters.length);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }

  return `${prefix}-${formattedDate}${padRow}-${randomSuffix}`;
}