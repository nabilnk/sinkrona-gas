function driveHandler(payload) {
  if (payload.data.gdrive_url || payload.ref.drive_url) {
    Logger.log('[SKIP DRIVE] already exists');
    return;
  }

  var title = payload.data.title || 'Tanpa Judul';
  var parent = DriveApp.getFolderById(PARENT_FOLDER_ID);

  var folderName = title + ' - ' + Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd-HHmmss'
  );

  var folder = parent.createFolder(folderName);

  payload.ref.drive_id = folder.getId();
  payload.ref.drive_url = folder.getUrl();
}