function doGet(e) {
  return jsonOutput_({
    status: 'ok',
    message: 'SINKRONA aktif - versi terbaru',
    time: new Date().toISOString()
  });
}

function doPost(e) {
  var requestId = Utilities.getUuid();

  try {
    var contents = e && e.postData && e.postData.contents
      ? e.postData.contents
      : '{}';

    var raw = JSON.parse(contents);

    if (WEBHOOK_SECRET && raw.secret !== WEBHOOK_SECRET) {
      return jsonOutput_({
        status: 'error',
        request_id: requestId,
        message: 'Invalid webhook secret'
      });
    }


    if (raw.label === 'notion.scan') {
      var resultScan = pollNotionTasks();

      return jsonOutput_({
        status: 'ok',
        request_id: requestId,
        message: 'Scan Notion selesai',
        processed: resultScan.count,
        items: resultScan.items
      });
    }

    var payload = {
      label: raw.label || 'web.input',
      data: raw.data || {},
      ref: {},
      errors: []
    };

    var result = Router.dispatch(payload);

    return jsonOutput_({
      status: result.ok ? 'ok' : 'error',
      request_id: requestId,
      ref: payload.ref,
      errors: payload.errors
    });

  } catch (err) {
    return jsonOutput_({
      status: 'error',
      request_id: requestId,
      message: err.message,
      stack: err.stack
    });
  }
}


function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}