function webHandler(payload) {
  if (!WEB_DASHBOARD_URL) {
    throw new Error('WEB_DASHBOARD_URL belum diisi.');
  }

  var body = {
    data: payload.data,
    ref: payload.ref,
    errors: payload.errors
  };

  Logger.log('[WEB CALLBACK START]');
  Logger.log('[WEB CALLBACK URL] ' + WEB_DASHBOARD_URL);
  Logger.log('[WEB CALLBACK BODY] ' + JSON.stringify(body));

  var res = UrlFetchApp.fetch(WEB_DASHBOARD_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  Logger.log('[WEB CALLBACK STATUS] ' + res.getResponseCode());
  Logger.log('[WEB CALLBACK RESPONSE] ' + res.getContentText());

  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
    throw new Error('Callback Laravel gagal: ' + res.getResponseCode() + ' - ' + res.getContentText());
  }
}