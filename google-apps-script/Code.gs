/*
 * XI TKJ 1 — BACKEND ABSENSI DRIVE ONLY
 * --------------------------------------
 * Tidak menggunakan Google Sheets.
 *
 * Penyimpanan:
 *   1. FOTO MUKA  -> file JPG di Google Drive
 *   2. BARCODE     -> file SVG (gambar berisi teks) di Google Drive
 *
 * Folder Drive:
 *   1Flcbrukb1Ln2x-uhDhUyWUc0eHp8EZoQ
 *
 * Deploy sebagai Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 */

const FOLDER_ID = '1Flcbrukb1Ln2x-uhDhUyWUc0eHp8EZoQ';
const TZ = 'Asia/Jakarta';
const BACKEND_VERSION = 'XI-TKJ1-DRIVE-ONLY-2026-09-01';


/* =========================
   DRIVE
   ========================= */

function folder_() {
  return DriveApp.getFolderById(FOLDER_ID);
}


/* =========================
   UTILITAS
   ========================= */

function clean_(value) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, '_')
    .slice(0, 120);
}

function xml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function today_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

function nowTime_() {
  return Utilities.formatDate(new Date(), TZ, 'HH:mm:ss');
}

function dateLabel_(date) {
  const p = String(date || today_()).split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(date || '');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(obj, callback) {
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

function payload_(e) {
  const p = {};
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(k => p[k] = e.parameter[k]);
  }

  try {
    if (e && e.postData && e.postData.contents) {
      const body = JSON.parse(e.postData.contents);
      if (body && typeof body === 'object') {
        Object.keys(body).forEach(k => {
          if (p[k] === undefined || p[k] === '') p[k] = body[k];
        });
      }
    }
  } catch (_) {}

  return p;
}

function safeShare_(file) {
  try {
    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );
  } catch (_) {
    // Beberapa akun Workspace melarang sharing publik.
    // File tetap disimpan di Drive.
  }
}

function thumbnailUrl_(fileId) {
  return 'https://drive.google.com/thumbnail?id=' +
    encodeURIComponent(fileId) + '&sz=w1200';
}


/* =========================
   CARI RECORD DI DRIVE
   ========================= */

function findAttendanceFile_(type, date, nisn) {
  const files = folder_().getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const desc = file.getDescription() || '';

    try {
      const meta = JSON.parse(desc);
      if (
        meta.type === type &&
        String(meta.date || '') === String(date || '') &&
        String(meta.nisn || '') === String(nisn || '')
      ) {
        return file;
      }
    } catch (_) {}
  }

  return null;
}


/* =========================
   BARCODE -> GAMBAR SVG
   ========================= */

function makeBarcodeImage_(p) {
  const nisn = clean_(p.nisn);
  const name = clean_(p.name) || 'Siswa';
  const date = clean_(p.date) || today_();
  const time = clean_(p.time) || nowTime_();

  if (!nisn) {
    return { ok: false, error: 'NISN barcode kosong.' };
  }

  // Satu absensi barcode per siswa per hari.
  const existing = findAttendanceFile_('barcode-attendance', date, nisn);
  if (existing) {
    const meta = JSON.parse(existing.getDescription() || '{}');
    return {
      ok: true,
      duplicate: true,
      message: 'Barcode sudah tercatat hari ini.',
      id: existing.getId(),
      url: existing.getUrl(),
      thumbnail: thumbnailUrl_(existing.getId()),
      date: date,
      time: meta.time || time,
      nisn: nisn,
      name: meta.name || name,
      kelas: meta.kelas || 'XI TKJ 1',
      status: 'H',
      metode: 'BARCODE'
    };
  }

  const safeName = clean_(name) || 'Siswa';
  const fileName =
    'ABSEN_BARCODE_' +
    date + '_' +
    time.replace(/:/g, '-') + '_' +
    safeName + '.svg';

  /*
   * SVG sengaja dibuat sebagai GAMBAR.
   * Isi gambarnya hanya teks absensi.
   */
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="820" viewBox="0 0 1400 820">' +
      '<rect width="1400" height="820" rx="42" fill="#101936"/>' +
      '<rect x="45" y="45" width="1310" height="730" rx="34" fill="#182449" stroke="#4055ff" stroke-width="3"/>' +
      '<text x="700" y="145" text-anchor="middle" fill="#8ea0ff" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" letter-spacing="8">XI TKJ 1 • ATTENDANCE</text>' +
      '<text x="700" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="66" font-weight="800">' + xml_(name) + '</text>' +
      '<text x="700" y="365" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="700">Absen Dengan Barcode</text>' +
      '<line x1="240" y1="420" x2="1160" y2="420" stroke="#4055ff" stroke-width="4"/>' +
      '<text x="700" y="505" text-anchor="middle" fill="#dce2ff" font-family="Arial,Helvetica,sans-serif" font-size="38">Tanggal  ' + xml_(dateLabel_(date)) + '</text>' +
      '<text x="700" y="575" text-anchor="middle" fill="#dce2ff" font-family="Arial,Helvetica,sans-serif" font-size="38">Waktu  ' + xml_(time) + ' WIB</text>' +
      '<text x="700" y="670" text-anchor="middle" fill="#6df0bd" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" letter-spacing="3">✓ HADIR • BARCODE</text>' +
      '<text x="700" y="720" text-anchor="middle" fill="#8d98b9" font-family="Arial,Helvetica,sans-serif" font-size="20">NISN ' + xml_(nisn) + '</text>' +
    '</svg>';

  const blob = Utilities.newBlob(
    svg,
    'image/svg+xml',
    fileName
  );

  const file = folder_().createFile(blob);

  const meta = {
    type: 'barcode-attendance',
    date: date,
    time: time,
    nisn: nisn,
    name: name,
    kelas: clean_(p.kelas) || 'XI TKJ 1',
    status: 'H',
    metode: 'BARCODE'
  };

  file.setDescription(JSON.stringify(meta));
  safeShare_(file);

  return {
    ok: true,
    duplicate: false,
    message: 'Absensi barcode tersimpan di Google Drive.',
    id: file.getId(),
    url: file.getUrl(),
    thumbnail: thumbnailUrl_(file.getId()),
    date: date,
    time: time,
    nisn: nisn,
    name: name,
    kelas: meta.kelas,
    status: 'H',
    metode: 'BARCODE'
  };
}


/* =========================
   FOTO MUKA -> JPG DRIVE
   ========================= */

function saveFace_(p) {
  const date = clean_(p.date) || today_();
  const time = clean_(p.time) || nowTime_();
  const nisn = clean_(p.nisn);
  const name = clean_(p.name) || 'Siswa';

  if (!date || !nisn) {
    return json_({ ok: false, error: 'Tanggal atau NISN foto tidak lengkap.' });
  }

  if (!p.imageData) {
    return json_({ ok: false, error: 'Foto tidak diterima server.' });
  }

  const existing = findAttendanceFile_('face-attendance', date, nisn);
  if (existing) {
    const meta = JSON.parse(existing.getDescription() || '{}');
    return json_({
      ok: true,
      duplicate: true,
      message: 'Foto absensi sudah tercatat hari ini.',
      id: existing.getId(),
      url: existing.getUrl(),
      thumbnail: thumbnailUrl_(existing.getId()),
      date: date,
      time: meta.time || time,
      nisn: nisn,
      name: meta.name || name,
      kelas: meta.kelas || 'XI TKJ 1',
      status: 'H',
      metode: 'FOTO MUKA'
    });
  }

  let base64 = String(p.imageData)
    .replace(/^data:image\/[^;]+;base64,/i, '')
    .replace(/\s/g, '');

  let bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (err) {
    return json_({
      ok: false,
      error: 'Format foto tidak valid: ' + err.message
    });
  }

  const safeName = clean_(name) || 'Siswa';
  const blob = Utilities.newBlob(
    bytes,
    'image/jpeg',
    'ABSEN_FOTO_' +
      date + '_' +
      time.replace(/:/g, '-') + '_' +
      safeName + '.jpg'
  );

  const file = folder_().createFile(blob);

  const meta = {
    type: 'face-attendance',
    date: date,
    time: time,
    nisn: nisn,
    name: name,
    kelas: clean_(p.kelas) || 'XI TKJ 1',
    status: 'H',
    metode: 'FOTO MUKA',
    latitude: String(p.latitude || ''),
    longitude: String(p.longitude || ''),
    accuracy: String(p.accuracy || ''),
    mapsUrl: String(p.mapsUrl || ''),
    locationText: String(p.locationText || p.address || '')
  };

  file.setDescription(JSON.stringify(meta));
  safeShare_(file);

  return json_({
    ok: true,
    duplicate: false,
    message: 'Foto absensi berhasil disimpan di Google Drive.',
    id: file.getId(),
    url: file.getUrl(),
    thumbnail: thumbnailUrl_(file.getId()),
    date: date,
    time: time,
    nisn: nisn,
    name: name,
    kelas: meta.kelas,
    status: 'H',
    metode: 'FOTO MUKA'
  });
}


/* =========================
   LIST SEMUA ABSENSI HARIAN
   ========================= */

function listAttendance_(p) {
  const date = clean_(p.date) || today_();
  const barcode = [];
  const face = [];

  const files = folder_().getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const desc = file.getDescription() || '';

    try {
      const m = JSON.parse(desc);

      if (m.date !== date) continue;

      const common = {
        id: file.getId(),
        url: file.getUrl(),
        thumbnail: thumbnailUrl_(file.getId()),
        date: m.date || '',
        time: m.time || '',
        nisn: m.nisn || '',
        name: m.name || '',
        kelas: m.kelas || 'XI TKJ 1',
        status: 'H',
        metode: m.metode || ''
      };

      if (m.type === 'barcode-attendance') {
        barcode.push(common);
      }

      if (m.type === 'face-attendance') {
        face.push(Object.assign(common, {
          latitude: m.latitude || '',
          longitude: m.longitude || '',
          accuracy: m.accuracy || '',
          mapsUrl: m.mapsUrl || '',
          locationText: m.locationText || ''
        }));
      }
    } catch (_) {}
  }

  barcode.sort((a, b) => String(a.time).localeCompare(String(b.time)));
  face.sort((a, b) => String(a.time).localeCompare(String(b.time)));

  return {
    ok: true,
    date: date,
    barcode: barcode,
    face: face
  };
}


/* =========================
   STATUS SISWA
   ========================= */

function attendanceStatus_(p) {
  const date = clean_(p.date) || today_();
  const nisn = clean_(p.nisn);

  if (!nisn) {
    return {
      ok: false,
      error: 'NISN tidak ada.'
    };
  }

  const barcodeFile = findAttendanceFile_(
    'barcode-attendance',
    date,
    nisn
  );

  const faceFile = findAttendanceFile_(
    'face-attendance',
    date,
    nisn
  );

  let record = null;
  let barcodeDone = false;
  let faceDone = false;

  if (barcodeFile) {
    barcodeDone = true;
    const m = JSON.parse(barcodeFile.getDescription() || '{}');
    record = {
      date: m.date || date,
      time: m.time || '',
      nisn: m.nisn || nisn,
      name: m.name || '',
      kelas: m.kelas || 'XI TKJ 1',
      status: 'H',
      metode: 'BARCODE',
      id: barcodeFile.getId(),
      url: barcodeFile.getUrl(),
      thumbnail: thumbnailUrl_(barcodeFile.getId())
    };
  }

  if (faceFile) {
    faceDone = true;
    const m = JSON.parse(faceFile.getDescription() || '{}');

    // Foto lebih informatif jika keduanya ada.
    if (!record) {
      record = {
        date: m.date || date,
        time: m.time || '',
        nisn: m.nisn || nisn,
        name: m.name || '',
        kelas: m.kelas || 'XI TKJ 1',
        status: 'H',
        metode: 'FOTO MUKA',
        id: faceFile.getId(),
        url: faceFile.getUrl(),
        thumbnail: thumbnailUrl_(faceFile.getId())
      };
    }
  }

  return {
    ok: true,
    date: date,
    nisn: nisn,
    barcodeDone: barcodeDone,
    faceDone: faceDone,
    locked: barcodeDone || faceDone,
    record: record
  };
}


/* =========================
   TEST / SETUP
   ========================= */

function setup() {
  const folder = folder_();
  return {
    ok: true,
    message: 'Backend Drive-only siap digunakan.',
    version: BACKEND_VERSION,
    folder: folder.getName(),
    folderId: folder.getId()
  };
}

function TEST() {
  try {
    const folder = folder_();
    return {
      ok: true,
      message: 'Apps Script Drive-only aktif.',
      version: BACKEND_VERSION,
      folder: folder.getName(),
      folderId: folder.getId()
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message || String(err),
      version: BACKEND_VERSION
    };
  }
}


/* =========================
   WEB APP
   ========================= */

function doGet(e) {
  try {
    const p = payload_(e);
    const action = String(p.action || '').trim();

    if (action === 'test' || action === 'ping') {
      return jsonp_({
        ok: true,
        message: 'XI TKJ 1 Drive-only API aktif',
        version: BACKEND_VERSION
      }, p.callback);
    }

    if (action === 'testConnection') {
      return jsonp_(TEST(), p.callback);
    }

    if (action === 'saveBarcodeAttendance' || action === 'barcode') {
      return jsonp_(makeBarcodeImage_(p), p.callback);
    }

    if (action === 'attendanceStatus') {
      return jsonp_(attendanceStatus_(p), p.callback);
    }

    if (action === 'attendanceSummary') {
      return jsonp_(listAttendance_(p), p.callback);
    }

    if (action === 'listAttendance' || action === 'listFaceAttendance') {
      return jsonp_(listAttendance_(p), p.callback);
    }

    if (action === 'version') {
      return jsonp_({
        ok: true,
        version: BACKEND_VERSION
      }, p.callback);
    }

    return jsonp_({
      ok: true,
      message: 'XI TKJ 1 attendance backend running',
      version: BACKEND_VERSION
    }, p.callback);

  } catch (err) {
    return jsonp_({
      ok: false,
      error: err.message || String(err),
      version: BACKEND_VERSION
    }, e && e.parameter && e.parameter.callback);
  }
}

function doPost(e) {
  try {
    const p = payload_(e);
    const action = String(p.action || '').trim();

    if (action === 'uploadFaceAttendance') {
      return saveFace_(p);
    }

    if (action === 'saveBarcodeAttendance' || action === 'barcode') {
      return json_(makeBarcodeImage_(p));
    }

    if (action === 'attendanceStatus') {
      return json_(attendanceStatus_(p));
    }

    if (action === 'attendanceSummary' ||
        action === 'listAttendance' ||
        action === 'listFaceAttendance') {
      return json_(listAttendance_(p));
    }

    if (action === 'testConnection') {
      return json_(TEST());
    }

    return json_({
      ok: false,
      error: 'Action POST tidak dikenal: ' + action
    });

  } catch (err) {
    return json_({
      ok: false,
      error: err.message || String(err)
    });
  }
}
