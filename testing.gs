// testing.gs

function testRestApiSync() {
  const pageId = "335e5720418a80b3b111da09e83ace47";
  
  // 1. Ambil data mentah (Simulasi data yang masuk ke pintu)
  const options = { method: "get", headers: { "Authorization": "Bearer " + NOTION_TOKEN, "Notion-Version": "2022-06-28" } };
  const response = UrlFetchApp.fetch(`https://api.notion.com/v1/pages/${pageId}`, options);
  const incomingData = JSON.parse(response.getContentText());

  // 2. Bungkus dengan Label (Penentuan label sebelum masuk ke router)
  const requestPayload = {
    label: "notion.sync", // INI LABELNYA
    data: incomingData,
    ref: {}
  };

  Logger.log(`🚀 Incoming Request with Label: ${requestPayload.label}`);
  
  // 3. Router hanya bertugas mengevaluasi label tersebut
  Router.dispatch(requestPayload);
  
  Logger.log("🏁 Result Ref: " + JSON.stringify(requestPayload.ref));
}

// testing.gs
function testWebInputSimulation() {
  // Simulasi data yang dikirim oleh Website Dashboard Anda
  const mockPayload = {
    label: "web.input",
    data: {
      title: "RISET TA NABIL",
      start: "2026-05-10T09:00:00Z",
      email: "muh.nabilnk@gmail.com",
      pic_name: "Nabil NK",
      location: "Fakultas Ilmu Komputer"
    },
    ref: {}
  };

  Logger.log("🚀 Testing Universal Web Input...");
  Router.dispatch(mockPayload);
  Logger.log("🏁 Final Ref Object: " + JSON.stringify(mockPayload.ref));
}

// testing.gs

/**
 * Simulasi Input dari Postman / Web
 * Cek apakah ref terisi link GCal & Drive secara otomatis
 */
function testPhase1_ExternalInput() {
  const mockRequest = {
    label: "web.input",
    data: {
      title: "UJI COBA FASE 1",
      start: "2026-04-10T09:00:00Z",
      email: Session.getEffectiveUser().getEmail(),
      pic_name: "Nabil NK",
      location: "Semarang"
    },
    ref: {} // Harus berevolusi di akhir
  };

  Router.dispatch(mockRequest);
  Logger.log("🏁 HASIL AKHIR (ref): " + JSON.stringify(mockRequest.ref));
}

function authorizeSinkrona() {
  GmailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    'Tes izin SINKRONA',
    'Izin Gmail berhasil aktif.'
  );
}