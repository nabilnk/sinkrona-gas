function debugNotionDatabase_() {
  var url = 'https://api.notion.com/v1/databases/' + DATABASE_ID + '/query';

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + NOTION_TOKEN,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify({
      page_size: 5
    }),
    muteHttpExceptions: true
  });

  return {
    database_id: DATABASE_ID,
    response_code: response.getResponseCode(),
    raw: response.getContentText()
  };
}