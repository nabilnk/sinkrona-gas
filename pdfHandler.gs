// pdfHandler.gs
Handlers.pdfHandler = function(payload) {
  Logger.log("--- Menjalankan Robot PDF Parsing ---");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Sheet1");
  
  try {
    ss.toast("🤖 Memulai ekstraksi data dari PDF...", "Processing", 5);
    
    pdfToAgenda(); // Panggil mesin rill di agenda.gs

    // 7. SIAPKAN CHECKBOX UNTUK DATA BARU
    const lastRow = sheet.getLastRow();
    if (lastRow > 4) {
      // Pasang Checkbox di kolom G (PDF Checklist) dan P (Sync GWS)
      sheet.getRange(5, 7, lastRow - 4, 1).insertCheckboxes();
      sheet.getRange(5, 16, lastRow - 4, 1).insertCheckboxes();
    }
    
    ss.toast("Selesai! Data sudah masuk ke kolomnya masing-masing.", "Sukses", 5);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Gagal memproses PDF: " + e.message);
  } finally {
    // Matikan tombol utama di G4
    sheet.getRange(4, 7).uncheck();
  }
};