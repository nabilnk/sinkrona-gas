function notifHub(payload) {
  console.log('[NOTIF HUB START]');
  console.log('[NOTIF PAYLOAD DATA] ' + JSON.stringify(payload.data));
  var rawRecipients = String(payload.data.recipient_email || '');

  var recipients = rawRecipients
    .replace(/;/g, ',')
    .split(',')
    .map(function (email) {
      return email.trim().toLowerCase();
    })
    .filter(function (email, index, self) {
      return email && self.indexOf(email) === index;
    });

  Logger.log('[EMAIL RAW] ' + rawRecipients);
  Logger.log('[EMAIL RECIPIENTS] ' + JSON.stringify(recipients));
    console.log('[EMAIL RECIPIENTS] ' + JSON.stringify(recipients));

  if (recipients.length === 0) {
    Logger.log('[SKIP EMAIL] penerima kosong');
    return;
  }

  var subject = '[SINKRONA] ' + (payload.data.title || 'Agenda Baru');

  var body =
    'Halo,\n\n' +
    'Agenda berikut telah dibuat dan disinkronkan melalui SINKRONA.\n\n' +
    'Nama Agenda: ' + (payload.data.title || '-') + '\n' +
    'Jenis Tugas: ' + (payload.data.task_type || '-') + '\n' +
    'Mulai: ' + (payload.data.start_at || '-') + '\n' +
    'Selesai: ' + (payload.data.end_at || '-') + '\n' +
    'Lokasi: ' + (payload.data.location || '-') + '\n' +
    'PIC: ' + (payload.data.pic || '-') + '\n' +
    'Penyelenggara: ' + (payload.data.organizer || '-') + '\n\n' +
    'Google Calendar: ' + ((payload.ref && payload.ref.calendar_url) || '-') + '\n' +
    'Google Drive: ' + ((payload.ref && payload.ref.drive_url) || '-') + '\n' +
    'Notion: ' + ((payload.ref && payload.ref.notion_url) || '-') + '\n\n' +
    'Pesan ini dikirim otomatis oleh SINKRONA.';

  recipients.forEach(function (email) {
    try {
      GmailApp.sendEmail(email, subject, body);
      Logger.log('[EMAIL SENT] ' + email);
    } catch (err) {
      Logger.log('[EMAIL ERROR] ' + email + ' => ' + err.toString());

      if (!payload.errors) {
        payload.errors = [];
      }

      payload.errors.push({
        handler: 'notifHub',
        email: email,
        message: err.toString()
      });
    }
  });
}