// @ts-nocheck



// const scriptProperties = PropertiesService.getScriptProperties();
// const calendarId = scriptProperties.getProperty('CALENDAR_ID');
// const parentfolderId = scriptProperties.getProperty('PARENT_ID_FOLDER');
// const ws = SpreadsheetApp.getActiveSheet(); 


// Fungsi pembantu untuk UI agar tidak error saat testing backend
const getUiSafe = () => {
  try { return SpreadsheetApp.getUi(); } catch (e) { return null; }
};


const NAME_ARRAY = ['michaelanandya','arifkurnia','rahmatadi','anggitobustan','ridhorisadianto','chandradwi','danannurdiansyah','linamunfaroh'];
const DOMAIN = "@semarangkota.go.id";
const FALLBACK_EMAIL = "sandiman_diskominfo" + DOMAIN;

const COLS = {
  DATE_START: 2, TIME_START: 3, DATE_END: 4, TIME_END: 5,
  SOURCE: 6, LABEL: 7, DUTY_DESC: 8, TITLE: 9, DESC: 9,
  LOCATION: 10, ORGANIZER: 11, GUESTS: 12, LINK_DESC: 13,
  FILE: 14, CHECKBOX: 15, CAL_URL: 16, EVENT_ID: 17
};

function getCalendarSafe() {
  return CalendarApp.getCalendarById(CALENDAR_ID); 
}

function getParentFolderSafe() {
  return DriveApp.getFolderById(PARENT_FOLDER_ID); 
}


function generateEmails(input) {
  let emailAddresses = [];
  if (!input || input.trim() === "") return '';
  let cleanedInput = input.replace(/\s+/g, ' ').toLowerCase().trim();
  if (cleanedInput.includes('all')) {
    emailAddresses.push(FALLBACK_EMAIL);
    cleanedInput = cleanedInput.replace(/\ball\b/g, '').trim();
  }
  if (!cleanedInput) return emailAddresses.join(',');
  const parts = cleanedInput.includes(',') ? cleanedInput.split(',').map(s => s.trim()) : cleanedInput.split(' ');
  if (!input.includes(',')) {
    for (let i = 0; i < parts.length - 1; i += 2) {
      const fullName = (parts[i] + parts[i + 1]).toLowerCase();
      if (NAME_ARRAY.includes(fullName)) { emailAddresses.push(fullName + DOMAIN); }
    }
  } else {
    for (const part of parts) {
      const fullName = part.replace(/\s+/g, '');
      if (NAME_ARRAY.includes(fullName)) { emailAddresses.push(fullName + DOMAIN); }
    }
  }
  return emailAddresses.join(',');
}

function getTimestamp(date, time, isBlank) {
  const formattedDate = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "MM/dd/yyyy");
  const adjustTime = new Date(time.getTime() - 25 * 60 * 1000);
  if (isBlank === 1) {
    const oneHourLater = new Date(adjustTime);
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    const timeStr = Utilities.formatDate(oneHourLater, Session.getScriptTimeZone(), "HH:mm");
    return new Date(formattedDate + " " + timeStr + " GMT+07:00");
  }
  const timeStr = Utilities.formatDate(adjustTime, Session.getScriptTimeZone(), "HH:mm");
  return new Date(formattedDate + " " + timeStr + " GMT+07:00");
}

function generateOutputString(title, source, desc, guests, organizer, duty_desc, link_desc, file, label) {
  const line = "──────────────────────────";
  let uppercaseTitle = title.toString().toUpperCase();
  return `🗓️ <b>${uppercaseTitle}</b>\n${line}\n\n<b>DETAILS</b>\n🏢 Penyelenggara : ${organizer}\n🏷️ Label : ${label}\n🌍 Sumber : ${source}\n\n<b>DESCRIPTION</b>\n${desc}\n\n<b>ASSIGNMENT</b>\n💼 Jenis Tugas : ${duty_desc}\n👥 Disposisi : ${guests}\n\n<b>RESOURCES</b>\n🔗 Link/url : ${link_desc}\n📁 Dokumen pendukung : ${file}\n\n${line}\n<i>Auto-notification by system 🤖</i>`;
}

function pdfToAgenda() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Sheet1");
  const folder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const files = folder.getFilesByType(MimeType.PDF);

  if (!files.hasNext()) throw new Error("File PDF tidak ditemukan di Drive.");

  const pdfFile = files.next();
  const blob = pdfFile.getBlob();
  const resource = { title: pdfFile.getName(), mimeType: pdfFile.getMimeType() };
  
  // 1. Proses OCR
  const tempDoc = Drive.Files.insert(resource, blob, { ocr: true });
  const doc = DocumentApp.openById(tempDoc.id);
  const text = doc.getBody().getText();
  Drive.Files.remove(tempDoc.id); 

  const lines = text.split('\n');
  
  lines.forEach(line => {
    // 2. CARI TANGGAL (Contoh: 10/03/2026)
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
    
    if (dateMatch) {
      const foundDate = dateMatch[0];
      
      // Ambil bagian teks SETELAH Tanggal
      let afterDate = line.substring(line.indexOf(foundDate) + foundDate.length).trim();

      // 3. CARI JAM (Contoh: 08:00 atau 08.00)
      const timeMatch = afterDate.match(/(\d{1,2}[:.]\d{2})/);
      let foundTime = "";
      let remainingContent = afterDate;

      if (timeMatch) {
        foundTime = timeMatch[0];
        // Konten utama adalah teks SETELAH Jam
        remainingContent = afterDate.substring(afterDate.indexOf(foundTime) + foundTime.length).trim();
      }

      /**
       * 4. PECAH KONTEN (Judul, Lokasi, Penyelenggara)
       * KUNCI: Kita hanya memecah jika ada tanda '|' atau spasi SANGAT LEBAR (minimal 4 spasi)
       * Ini mencegah Judul "Rapat Koordinasi" terbelah.
       */
      let parts = remainingContent.split(/[|│]|\s{4,}/).map(p => p.trim()).filter(Boolean);

      let judul = parts[0] || "Agenda dari PDF";
      let lokasi = parts[1] || "-";
      let penyelenggara = parts[2] || "-";

      // 5. HITUNG HARI
      const dParts = foundDate.split(/[\/\-]/);
      const dObj = new Date(dParts[2], dParts[1]-1, dParts[0]);
      dObj.setHours(12, 0, 0, 0); 
      const dayName = WEEKDAYS[dObj.getDay()];

      // 6. TULIS KE SHEET SECARA SEJAJAR (A - K)
      const targetRow = sheet.getLastRow() + 1;
      const rowData = [
        [dayName, foundDate, foundTime, "", "", "PDF SOURCE", "", "Rapat", judul, lokasi, penyelenggara]
      ];

      sheet.getRange(targetRow, 1, 1, 11).setValues(rowData);
      Logger.log(`✅ Sukses: ${judul} | Lokasi: ${lokasi}`);
    }
  });
}