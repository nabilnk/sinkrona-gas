const RULES = [
  {
    id: 'WEB_INPUT_SYNC',
    when: function (payload) {
      return payload.label === 'web.input';
    },
    execute: [
      'conditionalDriveHandler',
      'conditionalCalendarHandler',
      'conditionalNotionHandler',
      'conditionalNotifHub'
    ]
  },
    {
    id: 'NOTION_SCAN_SYNC',
    when: function (payload) {
      return payload.label === 'notion.sync';
    },
    execute: [
      'resolveDivisionEmails',
      'conditionalDriveHandler',
      'conditionalCalendarHandler',
      'conditionalNotionHandler',
      'webHandler',
      'conditionalNotifHub'
    ]
  }
];


const NOTIF_RULES = [
  { id: 'SUCCESS_MAIL', when: 'payload.ref.calendar_url', template: 'fancyTableTemplate', channels: ['email'] }
];

function conditionalDriveHandler(payload) {
  if (payload.data.sync_drive === false) return;
  driveHandler(payload);
}

function conditionalCalendarHandler(payload) {
  if (payload.data.sync_calendar === false) return;
  calendarHandler(payload);
}

function conditionalNotionHandler(payload) {
  if (payload.data.sync_notion === false) return;
  notionHandler(payload);
}

function conditionalNotifHub(payload) {
  console.log('[CHECK EMAIL FLAG] sync_email = ' + payload.data.sync_email);
  console.log('[CHECK EMAIL RECIPIENT] ' + payload.data.recipient_email);

  if (payload.data.sync_email === false || payload.data.sync_email === 'false' || payload.data.sync_email === 0) {
    console.log('[SKIP EMAIL] sync_email false');
    return;
  }

  console.log('[RUN EMAIL] notifHub dipanggil');
  notifHub(payload);
}

function resolveDivisionEmails(payload) {
  if (payload.data.recipient_email) {
    return;
  }

  var divisionName = String(payload.data.recipient_division || '').trim();

  if (!divisionName) {
    Logger.log('[DIVISION EMAIL] Divisi kosong');
    return;
  }

  if (!WEB_DASHBOARD_URL) {
    throw new Error('WEB_DASHBOARD_URL belum diisi.');
  }

  var baseUrl = WEB_DASHBOARD_URL.replace('/receive', '');
  var endpoint = baseUrl + '/api/division-emails';

  Logger.log('[DIVISION EMAIL REQUEST] ' + endpoint);
  Logger.log('[DIVISION EMAIL NAME] ' + divisionName);

  var res = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      division: divisionName
    }),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var text = res.getContentText();

  Logger.log('[DIVISION EMAIL RESPONSE] ' + code + ' ' + text);

  if (code < 200 || code >= 300) {
    throw new Error('Gagal mengambil email divisi: ' + code + ' - ' + text);
  }

  var json = JSON.parse(text);

  payload.data.recipient_email = json.recipient_email || '';
  payload.data.recipient_division_id = json.division_id || null;

  if (!payload.data.recipient_email) {
    throw new Error('Divisi tidak memiliki user aktif dengan email: ' + divisionName);
  }
}