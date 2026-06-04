/**
 * ============================================================
 *  Google Apps Script — Template Webhook untuk Survey Pelindo
 * ============================================================
 *
 * CARA PAKAI:
 * 1. Buka Google Spreadsheet yang ingin dijadikan tujuan data.
 * 2. Klik menu  Extensions  >  Apps Script.
 * 3. Hapus semua kode default, lalu paste seluruh isi file ini.
 * 4. Klik tombol  Deploy  >  New deployment.
 *    - Type      : Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik  Deploy , lalu  Authorize access  (ikuti langkahnya).
 * 6. Copy  Web app URL  yang muncul.
 * 7. Paste URL tersebut di form "Buat Survey Baru" pada kolom
 *    "Link Webhook Google Sheets".
 *
 * Selesai! Setiap responden yang mengisi survey,
 * datanya akan otomatis masuk ke spreadsheet ini.
 * ============================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Tulis header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      var headers = ['Timestamp'].concat(data.headers);
      sheet.appendRow(headers);
    }

    // Tulis baris data
    var row = [data.timestamp].concat(data.values);
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
