function notionHandler(payload) {
  var data = payload.data;

  var properties = {
    'Name': {
      title: [
        {
          text: {
            content: data.title || 'Tanpa Judul'
          }
        }
      ]
    },
    'Jenis Tugas': data.task_type ? { select: { name: data.task_type } } : undefined,
    'Status': data.status ? { select: { name: data.status } } : undefined,
    'Priority': data.priority ? { select: { name: data.priority } } : undefined,
    'Tanggal Mulai': data.start_at ? { date: { start: data.start_at } } : undefined,
    'Tanggal Selesai': data.end_at ? { date: { start: data.end_at } } : undefined,
'PIC': {
  rich_text: [
    {
      text: {
        content: data.pic || ''
      }
    }
  ]
},

'Divisi': data.recipient_division
  ? {
      select: {
        name: data.recipient_division
      }
    }
  : undefined,

'Location': {
  rich_text: [
    {
      text: {
        content: data.location || ''
      }
    }
  ]
},
    'Penyelenggara': {
      rich_text: [
        {
          text: {
            content: data.organizer || ''
          }
        }
      ]
    },
    'Deskripsi': {
      rich_text: [
        {
          text: {
            content: data.description || ''
          }
        }
      ]
    },
    'SyncGWS': {
      checkbox: true
    },
    'URL GCalendar': payload.ref.calendar_url
      ? { url: payload.ref.calendar_url }
      : undefined,
    'URL Drive': payload.ref.drive_url
      ? { url: payload.ref.drive_url }
      : undefined,
    'Source': {
      select: {
        name: data.source || 'Website'
      }
    }
  };

  Object.keys(properties).forEach(function(key) {
    if (properties[key] === undefined) {
      delete properties[key];
    }
  });

  Logger.log('[NOTION V2 PROPERTIES] ' + JSON.stringify(properties));

  var response;

  if (data.notion_id) {
    response = notionPatchV2_('https://api.notion.com/v1/pages/' + data.notion_id, {
      properties: properties
    });
  } else {
    response = notionPostV2_('https://api.notion.com/v1/pages', {
      parent: {
        database_id: DATABASE_ID
      },
      properties: properties
    });
  }

  payload.ref.notion_id = response.id;
  payload.ref.notion_url = response.url;
}

function notionPostV2_(url, payload) {
  return notionRequestV2_(url, 'post', payload);
}

function notionPatchV2_(url, payload) {
  return notionRequestV2_(url, 'patch', payload);
}

function notionRequestV2_(url, method, payload) {
  var res = UrlFetchApp.fetch(url, {
    method: method,
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + NOTION_TOKEN,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var text = res.getContentText();
  var code = res.getResponseCode();

  if (code < 200 || code >= 300) {
    throw new Error('Notion API ' + code + ': ' + text);
  }

  return JSON.parse(text);
}