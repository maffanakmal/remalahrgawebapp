import { AppError } from '../../utils/index.js';
import { HTTP_STATUS } from '../../constants/index.js';

// Dinaikkan ke 15 detik untuk mengantisipasi Cold Start Apps Script
const SHEETS_TIMEOUT_MS = 15000;

/**
 * Base fetch ke Apps Script via POST.
 * Semua repository sheets menggunakan fungsi ini.
 */
export async function sheetsFetch(url, apiKey, body = {}) {
  if (!url || !apiKey) {
    throw new AppError(
      'Sheets URL atau API key tidak dikonfigurasi',
      HTTP_STATUS.INTERNAL_ERROR,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHEETS_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, ...body }),
      signal: controller.signal,
      // PENTING: Memaksa runtime mengikuti redirect 302 dari Google Cloud Server
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new AppError(
        `Sheets request failed: ${res.status} ${res.statusText}`,
        HTTP_STATUS.BAD_GATEWAY,
      );
    }

    const data = await res.json();

    // Validasi payload respons internal dari Apps Script Anda
    if (data?.success === false) {
      throw new AppError(data.message || 'Sheets error', HTTP_STATUS.BAD_GATEWAY);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AppError('Sheets request timeout', HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
    
    // Jika error-nya sudah berupa AppError (dari res.ok atau data.success), langsung teruskan
    if (err instanceof AppError) {
      throw err;
    }

    // Mengonversi network error/fetch failed bawaan Node.js menjadi AppError agar format konsisten
    throw new AppError(`Network atau Server Error: ${err.message}`, HTTP_STATUS.BAD_GATEWAY);
  } finally {
    clearTimeout(timeout);
  }
}