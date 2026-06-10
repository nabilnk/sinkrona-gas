function calendarHandler(payload) {
  if (payload.data.gcalendar_url || payload.ref.calendar_url) {
    Logger.log('[SKIP CALENDAR] already exists');
    return;
  }

  var title = payload.data.title || 'Tanpa Judul';
  var startAt = payload.data.start_at;
  var endAt = payload.data.end_at;

  if (!startAt) {
    throw new Error('Tanggal Mulai kosong.');
  }

  if (!endAt) {
    throw new Error('Tanggal Selesai kosong.');
  }

  var startDate = new Date(startAt);
  var endDate = new Date(endAt);

  if (isNaN(startDate.getTime())) {
    throw new Error('Format Tanggal Mulai tidak valid: ' + startAt);
  }

  if (isNaN(endDate.getTime())) {
    throw new Error('Format Tanggal Selesai tidak valid: ' + endAt);
  }

  if (endDate <= startDate) {
    throw new Error('Tanggal Selesai harus setelah Tanggal Mulai.');
  }

  var calendar = CalendarApp.getCalendarById(CALENDAR_ID || 'primary');

  if (!calendar) {
    throw new Error('Calendar tidak ditemukan: ' + (CALENDAR_ID || 'primary'));
  }

  var description = [
    'PIC: ' + (payload.data.pic || '-'),
    'Penyelenggara: ' + (payload.data.organizer || '-'),
    'Jenis Tugas: ' + (payload.data.task_type || '-'),
    'Prioritas: ' + (payload.data.priority || '-'),
    'Deskripsi: ' + (payload.data.description || '-'),
    'Google Drive: ' + (payload.ref.drive_url || '-')
  ].join('\n');

  var event = calendar.createEvent(title, startDate, endDate, {
    location: payload.data.location || '',
    description: description,
    guests: parseEmails_(payload.data.recipient_email).join(','),
    sendInvites: true
  });

  payload.ref.calendar_id = event.getId();

  // Link CalendarApp tidak selalu menyediakan htmlLink, jadi pakai fallback.
  payload.ref.calendar_url =
    'https://calendar.google.com/calendar/u/0/r/day/' +
    startDate.getFullYear() + '/' +
    String(startDate.getMonth() + 1).padStart(2, '0') + '/' +
    String(startDate.getDate()).padStart(2, '0');

  Logger.log('[CALENDAR CREATED] ' + payload.ref.calendar_id);
}

function parseEmails_(value) {
  if (!value) return [];

  return String(value)
    .split(/[,\n;]/)
    .map(function (email) {
      return email.trim();
    })
    .filter(function (email) {
      return email && email.indexOf('@') !== -1;
    });
}