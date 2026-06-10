function pollNotionTasks() {
  var url = 'https://api.notion.com/v1/databases/' + DATABASE_ID + '/query';

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + NOTION_TOKEN,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify({
      page_size: 3,
      filter: {
        and: [
          {
            property: 'SyncGWS',
            checkbox: {
              equals: true
            }
          },
          {
            or: [
              {
                property: 'URL GCalendar',
                url: {
                  is_empty: true
                }
              },
              {
                property: 'URL Drive',
                url: {
                  is_empty: true
                }
              }
            ]
          }
        ]
      }
    }),
    muteHttpExceptions: true
  });

  var text = response.getContentText();
  var code = response.getResponseCode();

  if (code < 200 || code >= 300) {
    throw new Error('Notion query error ' + code + ': ' + text);
  }

  var json = JSON.parse(text);
  var results = json.results || [];
  var items = [];

  results.forEach(function (page) {
    var data = notionPageToData_(page);

    var payload = {
      label: 'notion.sync',
      data: data,
      ref: {},
      errors: []
    };

    Router.dispatch(payload);

    items.push({
      data: payload.data,
      ref: payload.ref,
      errors: payload.errors
    });
  });

  return {
    count: items.length,
    items: items
  };
}

function notionPageToData_(page) {
  var p = page.properties || {};

  return {
    notion_id: page.id,
    notion_url: page.url,
    title: getTitle_(p['Name']),
    task_type: getSelect_(p['Jenis Tugas']),
    status: getSelect_(p['Status']),
    priority: getSelect_(p['Priority']),
    start_at: getDate_(p['Tanggal Mulai']),
    end_at: getDate_(p['Tanggal Selesai']),
    pic: getText_(p['PIC']),
    recipient_division: getSelect_(p['Divisi']),
    location: getText_(p['Location']),
    organizer: getText_(p['Penyelenggara']),
    description: getText_(p['Deskripsi']),
    source: getSelect_(p['Source']) || 'Notion',
    sync_gws: true,
    sync_notion: true,
    sync_calendar: true,
    sync_drive: true,
    sync_email: true,
    gcalendar_url: getUrl_(p['URL GCalendar']),
    gdrive_url: getUrl_(p['URL Drive'])
  };
}

function getTitle_(prop) {
  return prop && prop.title && prop.title[0] ? prop.title[0].plain_text : '';
}

function getText_(prop) {
  return prop && prop.rich_text && prop.rich_text[0] ? prop.rich_text[0].plain_text : '';
}

function getDate_(prop) {
  return prop && prop.date ? prop.date.start : null;
}

function getSelect_(prop) {
  return prop && prop.select ? prop.select.name : null;
}

function getUrl_(prop) {
  return prop ? prop.url : null;
}