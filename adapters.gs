var Adapters = Adapters || {};

Adapters.toStandardTask = function(payload) {
  var d = payload.data || {};
  var myEmail = Session.getEffectiveUser().getEmail();

  if (payload.label === 'notion.sync') {
    var p = d.properties || {};
    var email = readEmail_(p['Email Penerima']) || myEmail;
    return {
      local_id: null,
      notion_id: d.id || null,
      id: d.id || null,
      title: readTitle_(p.Name) || 'Untitled',
      start: dateObj.start || new Date().toISOString(),
      end: dateObj.end || dateObj.start || addOneHour_(dateObj.start || new Date()),
      period: readText_(p['Periode Pengerjaan']) || '',
      sync_gws: readCheckbox_(p.SyncGWS),
      status: readSelect_(p.Status) || 'To Do',
      priority: readSelect_(p.Priority) || 'Medium',
      pic: readText_(p.PIC) || 'Staff',
      pic_name: readText_(p.PIC) || 'Staff',
      recipient_email: email,
      pic_email: email,
      pic_emails: splitEmails_(email),
      location: readText_(p.Location) || '-',
      source: readSelect_(p.Source) || readText_(p.Source) || 'Notion',
      organizer: readText_(p.Penyelenggara) || '',
      task_type: readSelect_(p['Jenis Tugas']) || readText_(p['Jenis Tugas']) || '',
      gcal_url: readUrl_(p['URL GCalendar']) || ''
    };
  }

  var emailWeb = d.recipient_email || d.email || d.pic_email || myEmail;
  return {
    local_id: d.local_id || null,
    notion_id: d.notion_id || null,
    id: d.notion_id || null,
    title: d.title || 'Untitled',
    period: d.period || '',
    sync_gws: d.sync_gws !== false,
    status: d.status || 'To Do',
    priority: d.priority || 'Medium',
    pic: d.pic || d.pic_name || 'Staff',
    pic_name: d.pic || d.pic_name || 'Staff',
    recipient_email: emailWeb,
    pic_email: emailWeb,
    pic_emails: splitEmails_(emailWeb),
    location: d.location || '-',
    source: d.source || 'Website',
    organizer: d.organizer || d.penyelenggara || '',
    task_type: d.task_type || d.jenis_tugas || '',
    gcal_url: d.gcal_url || ''
  };
};

function readTitle_(prop) {
  return prop && prop.title && prop.title.length ? prop.title[0].plain_text : '';
}
function readText_(prop) {
  if (!prop) return '';
  if (prop.rich_text && prop.rich_text.length) return prop.rich_text.map(function(x){ return x.plain_text; }).join('');
  if (prop.title && prop.title.length) return prop.title.map(function(x){ return x.plain_text; }).join('');
  if (prop.select) return prop.select.name;
  if (prop.email) return prop.email;
  if (prop.url) return prop.url;
  if (prop.checkbox !== undefined) return prop.checkbox ? 'true' : 'false';
  return '';
}
function readEmail_(prop) { return prop && prop.email ? prop.email : readText_(prop); }
function readSelect_(prop) { return prop && prop.select ? prop.select.name : ''; }
function readCheckbox_(prop) { return prop && prop.checkbox === true; }
function readUrl_(prop) { return prop && prop.url ? prop.url : ''; }
function splitEmails_(s) {
  return safeText_(s, '').split(/[;,]/).map(function(x){ return x.trim(); }).filter(function(x){ return x.indexOf('@') > -1; });
}
function addOneHour_(value) {
  var d = new Date(value);
  if (isNaN(d.getTime())) d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}
