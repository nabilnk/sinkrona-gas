// messageBuilder.gs
var MessageBuilder = MessageBuilder || {};

// Gunakan nama fancyTableTemplate agar sinkron dengan NOTIF_RULES
MessageBuilder.fancyTableTemplate = function(payload) {
  const task = Adapters.toStandardTask(payload);
  const start = splitDateAndTime(task.start);
  const end = splitDateAndTime(task.end);

  return {
    subject: `🔔 [TA HUB] Tugas Terdaftar: ${task.title}`,
    html: `
    <html>
      <body style="font-family: Arial; background-color: #f4f7fa; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: #1a2a6c; padding: 20px; text-align: center; color: white;">
            <h2 style="margin:0;">Task Orchestration Hub</h2>
          </div>
          <div style="padding: 20px; color: #4a5568;">
            <p>Tugas <b>${task.title}</b> telah berhasil diproses melalui pipa asinkron.</p>
            <table width="100%" style="font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><b>PIC</b></td><td>: ${task.pic_name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #edf2f7;"><b>Timeline</b></td><td>: ${start.date} - ${end.date}</td></tr>
            </table>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${payload.ref.calendar_url || '#'}" style="background: #3b82f6; color: white; padding: 10px; text-decoration: none; border-radius: 5px; display: block; margin-bottom: 10px;">📅 Buka Google Calendar</a>
              <a href="${payload.ref.drive_url || '#'}" style="background: #10b981; color: white; padding: 10px; text-decoration: none; border-radius: 5px; display: block;">📁 Buka Folder Drive</a>
            </div>
          </div>
        </div>
      </body>
    </html>`
  };
};