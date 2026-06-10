var Handlers = Handlers || {};
var Adapters = Adapters || {};
var MessageBuilder = MessageBuilder || {};

function prop_(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return v || fallback || '';
}

var CALENDAR_ID = prop_('CALENDAR_ID', 'primary');
var PARENT_FOLDER_ID = prop_('PARENT_ID_FOLDER', '');
var NOTION_TOKEN = prop_('NOTION_TOKEN', '');
var DATABASE_ID = prop_('DATABASE_ID', '');
var WEB_DASHBOARD_URL = prop_('WEB_DASHBOARD_URL', '');
var WEBHOOK_SECRET = prop_('WEBHOOK_SECRET', '');
var NOTION_VERSION = '2022-06-28';

function jsonOutput_(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeText_(v, fallback) {
  if (v === null || v === undefined || v === '') return fallback || '';
  return String(v);
}

function notionHeaders_() {
  return {
    'Authorization': 'Bearer ' + NOTION_TOKEN,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json'
  };
}

function notionFetch_(url, method, body) {
  var options = {
    method: method || 'get',
    headers: notionHeaders_(),
    muteHttpExceptions: true
  };
  if (body) options.payload = JSON.stringify(body);
  var res = UrlFetchApp.fetch(url, options);
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error('Notion API ' + code + ': ' + text);
  return text ? JSON.parse(text) : {};
}
