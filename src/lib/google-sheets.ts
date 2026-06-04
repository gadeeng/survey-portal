/**
 * Helper untuk mengirim data survey response ke Google Sheets
 * via Google Apps Script webhook.
 *
 * Pengiriman bersifat fire-and-forget: jika gagal, survey submission
 * tetap berhasil — hanya spreadsheet yang tidak terisi.
 */

interface SheetPayload {
  headers: string[]
  values: string[]
  timestamp: string
}

/**
 * Kirim data jawaban survey ke Google Sheets webhook.
 * Tidak throw error — semua failure di-log dan diabaikan.
 */
export async function sendToGoogleSheets(
  webhookUrl: string,
  payload: SheetPayload
): Promise<void> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(
        `[Google Sheets] Webhook responded with ${res.status}: ${res.statusText}`
      )
    }
  } catch (err) {
    console.error('[Google Sheets] Failed to send data to webhook:', err)
  }
}
