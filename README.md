# SINKRONA Apps Script

Middleware integrasi untuk sistem **SINKRONA (Sistem Integrasi dan Koordinasi Agenda Kerja Otomatis)**. Project ini digunakan untuk menghubungkan **Notion**, **Google Workspace**, dan **Dashboard Web Laravel**.

Apps Script ini bertugas menerima data agenda, memproses sinkronisasi, membuat event Google Calendar, membuat folder Google Drive, memperbarui database Notion, mengirim notifikasi Gmail, dan mengirim hasil proses ke dashboard monitoring.

## Teknologi

- Google Apps Script
- JavaScript
- Notion API
- Google Calendar Service
- Google Drive Service
- Gmail Service
- Laravel Dashboard Webhook

## Struktur File

```txt
sinkrona-appscript/
├── 0_global.gs
├── adapters.gs
├── agenda.gs
├── calendarHandler.gs
├── driveHandler.gs
├── executionLogger.gs
├── handlers.gs
├── messageBuilder.gs
├── notifHub.gs
├── notionHandler.gs
├── pollNotion.gs
├── router.gs
├── rules_config.gs
├── taskSync.gs
├── testing.gs
├── webHandler.gs
├── webhook.gs
├── appsscript.json
└── README.md
````

## Fungsi Utama File

| File                 | Fungsi                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `webhook.gs`         | Menjadi pintu masuk utama request dari dashboard atau proses scan Notion. |
| `router.gs`          | Mengatur alur eksekusi berdasarkan label payload.                         |
| `rules_config.gs`    | Menyimpan aturan workflow dan urutan handler yang dijalankan.             |
| `pollNotion.gs`      | Mengambil agenda dari database Notion yang perlu disinkronkan.            |
| `notionHandler.gs`   | Membuat atau memperbarui data agenda pada Notion.                         |
| `calendarHandler.gs` | Membuat event agenda pada Google Calendar.                                |
| `driveHandler.gs`    | Membuat folder agenda pada Google Drive.                                  |
| `notifHub.gs`        | Mengirim notifikasi email melalui Gmail.                                  |
| `webHandler.gs`      | Mengirim hasil proses sinkronisasi ke dashboard Laravel.                  |
| `taskSync.gs`        | Mengelola proses sinkronisasi agenda dari dashboard.                      |
| `executionLogger.gs` | Mencatat proses eksekusi untuk kebutuhan debugging.                       |
| `messageBuilder.gs`  | Membentuk isi pesan/notifikasi email.                                     |
| `adapters.gs`        | Membantu penyesuaian struktur data antarplatform.                         |
| `0_global.gs`        | Menyimpan konfigurasi global dan helper yang digunakan bersama.           |
| `testing.gs`         | Berisi fungsi pengujian manual selama pengembangan.                       |

## Alur Sistem

```txt
Dashboard Web / Notion
        ↓
Google Apps Script Webhook
        ↓
Router
        ↓
Rules Config
        ↓
Calendar Handler
Drive Handler
Notion Handler
Web Handler
Notification Hub
        ↓
Google Calendar
Google Drive
Notion
Gmail
Dashboard Monitoring
```

## Label Workflow

Project ini menggunakan label untuk menentukan alur proses.

| Label         | Keterangan                                               |
| ------------- | -------------------------------------------------------- |
| `web.input`   | Digunakan saat agenda dibuat dari dashboard web Laravel. |
| `notion.scan` | Digunakan untuk memulai proses scan agenda dari Notion.  |
| `notion.sync` | Digunakan untuk memproses agenda hasil scan dari Notion. |

## Alur dari Dashboard Web

```txt
User membuat agenda di Dashboard Web
        ↓
Laravel mengirim payload ke Apps Script
        ↓
Label: web.input
        ↓
Apps Script membuat Calendar, Drive, update Notion, dan kirim email
        ↓
Hasil sinkronisasi dikirim kembali ke Dashboard Monitoring
```

## Alur dari Notion

```txt
User mengisi agenda di Notion
        ↓
User mencentang SyncGWS
        ↓
Dashboard menjalankan Scan Agenda dari Notion
        ↓
Apps Script mengambil agenda dari Notion
        ↓
Label: notion.sync
        ↓
Apps Script membuat Calendar, Drive, update Notion, kirim email, dan callback ke Dashboard
```

## Konfigurasi yang Dibutuhkan

Konfigurasi rahasia **tidak disimpan langsung di repository**. Gunakan **Script Properties** pada Google Apps Script.

Buka:

```txt
Apps Script → Project Settings → Script Properties
```

Tambahkan properti berikut:

| Key                      | Keterangan                                                 |
| ------------------------ | ---------------------------------------------------------- |
| `NOTION_TOKEN`           | Token integrasi Notion.                                    |
| `DATABASE_ID`            | ID database Notion agenda.                                 |
| `WEB_DASHBOARD_URL`      | URL callback Laravel, contoh `https://domain.com/receive`. |
| `WEBHOOK_SECRET`         | Secret key untuk validasi request dari dashboard.          |
| `CALENDAR_ID`            | ID Google Calendar target.                                 |
| `DRIVE_PARENT_FOLDER_ID` | ID folder induk Google Drive.                              |

Contoh:

```txt
NOTION_TOKEN=secret_xxxxx
DATABASE_ID=xxxxxxxxxxxxxxxx
WEB_DASHBOARD_URL=https://sinkrona.my.id/receive
WEBHOOK_SECRET=isi_secret_yang_sama_dengan_laravel
CALENDAR_ID=primary
DRIVE_PARENT_FOLDER_ID=xxxxxxxxxxxxxxxx
```

## Struktur Database Notion

Database Notion minimal memiliki properti berikut:

| Properti          | Tipe     |
| ----------------- | -------- |
| `Name`            | Title    |
| `Jenis Tugas`     | Select   |
| `Status`          | Select   |
| `Priority`        | Select   |
| `Tanggal Mulai`   | Date     |
| `Tanggal Selesai` | Date     |
| `PIC`             | Text     |
| `Divisi`          | Select   |
| `Location`        | Text     |
| `Penyelenggara`   | Text     |
| `Deskripsi`       | Text     |
| `SyncGWS`         | Checkbox |
| `URL GCalendar`   | URL      |
| `URL Drive`       | URL      |
| `Source`          | Select   |

## Cara Deploy Apps Script

1. Buka project di Google Apps Script.
2. Pastikan semua file `.gs` sudah sesuai dengan repository.
3. Masuk ke menu **Deploy**.
4. Pilih **Manage deployments**.
5. Klik ikon pensil untuk mengedit deployment.
6. Pilih **New version**.
7. Pastikan akses Web App:

   * Execute as: `Me`
   * Who has access: sesuai kebutuhan project
8. Klik **Deploy**.
9. Salin URL Web App.
10. Masukkan URL tersebut ke `.env` Laravel sebagai `GAS_WEBHOOK_URL`.

## Integrasi dengan Laravel

Pada `.env` Laravel, pastikan konfigurasi berikut tersedia:

```env
GAS_WEBHOOK_URL=https://script.google.com/macros/s/xxxxxx/exec
GAS_WEBHOOK_SECRET=isi_secret_yang_sama_dengan_apps_script
```

Untuk callback dari Apps Script ke Laravel, pastikan `WEB_DASHBOARD_URL` pada Script Properties mengarah ke:

```txt
https://domain-laravel.com/receive
```

Contoh lokal menggunakan ngrok:

```txt
https://xxxx.ngrok-free.app/receive
```

## Catatan Keamanan

File ini tidak boleh menyimpan data rahasia secara langsung, seperti:

```txt
NOTION_TOKEN
DATABASE_ID asli
WEBHOOK_SECRET asli
CALENDAR_ID internal
DRIVE_PARENT_FOLDER_ID internal
```

Gunakan Script Properties untuk menyimpan konfigurasi rahasia.


