/*
 * XI TKJ 1 — ABSENSI GOOGLE DRIVE ONLY
 * ------------------------------------
 * Simpan foto absensi + metadata langsung ke Google Drive.
 * Tidak memakai Google Spreadsheet.
 *
 * Deploy Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 */

const FOLDER_ID = '1Flcbrukb1Ln2x-uhDhUyWUc0eHp8EZoQ';
const TZ = 'Asia/Jakarta';
const BACKEND_VERSION = 'XI-TKJ1-DRIVE-ONLY-2026-09-02-FINAL';

function folder_() {
  return DriveApp.getFolderById(FOLDER_ID);
}

function clean_(value) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, '_')
    .slice(0, 120);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(obj, callback) {
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(
      callback + '(' + JSON.stringify(obj) + ');'
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}

function payload_(e) {
  const p = {};
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(k => p[k] = e.parameter[k]);
  }

  // Dukungan tambahan jika client mengirim JSON.
  try {
    const body = e && e.postData && e.postData.contents;
    if (body) {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(k => {
          if (p[k] === undefined || p[k] === '') p[k] = parsed[k];
        });
      }
    }
  } catch (_) {}

  return p;
}

function today_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
}

function nowTime_() {
  return Utilities.formatDate(new Date(), TZ, 'HH:mm:ss');
}

function thumbnailUrl_(fileId) {
  return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(fileId) + '&sz=w1200';
}

function safeShare_(file) {
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (_) {
    // Workspace tertentu melarang public sharing. File tetap tersimpan.
  }
}

function findAttendanceFile_(type, date, nisn) {
  const files = folder_().getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const desc = file.getDescription() || '';
    try {
      const meta = JSON.parse(desc);
      if (meta.type === type && String(meta.date || '') === String(date || '') &&
          String(meta.nisn || '') === String(nisn || '')) {
        return file;
      }
    } catch (_) {}
  }
  return null;
}

function normalizeBase64_(value) {
  let s = String(value || '').trim();
  // Bisa menerima data URL lengkap atau base64 polos.
  s = s.replace(/^data:[^;]+;base64,/i, '');
  s = s.replace(/[\r\n\t\s]/g, '');
  // Jika client mengirim URL-encoded plus, pulihkan seperlunya.
  s = s.replace(/ /g, '+');
  return s;
}

function decodeImage_(p) {
  const raw = p.imageData || p.imageBase64 || p.photo || '';
  const base64 = normalizeBase64_(raw);
  if (!base64) throw new Error('Data foto kosong.');

  // Ukuran base64 yang terlalu besar biasanya berarti client mengirim foto mentah.
  // Client resmi XI TKJ 1 sudah melakukan kompresi JPEG sebelum upload.
  if (base64.length > 12000000) {
    throw new Error('Foto terlalu besar. Silakan ambil foto ulang agar ukuran lebih kecil.');
  }

  let bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (err) {
    throw new Error('Base64 foto tidak valid: ' + (err.message || err));
  }

  if (!bytes || !bytes.length) throw new Error('Foto kosong setelah decoding.');
  if (bytes.length > 9000000) throw new Error('Ukuran foto terlalu besar setelah decoding.');

  return Utilities.newBlob(bytes, 'image/jpeg');
}

/* =========================
   BARCODE
   ========================= */
function makeBarcodeImage_(p) {
  const date = clean_(p.date) || today_();
  const time = clean_(p.time) || nowTime_();
  const nisn = clean_(p.nisn);
  const name = clean_(p.name) || 'Siswa';
  const kelas = clean_(p.kelas) || 'XI TKJ 1';

  if (!nisn) return { ok: false, error: 'NISN barcode kosong.' };

  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const existing = findAttendanceFile_('barcode-attendance', date, nisn);
    if (existing) {
      const meta = JSON.parse(existing.getDescription() || '{}');
      return {
        ok: true, duplicate: true,
        message: 'Barcode sudah tercatat hari ini.',
        id: existing.getId(), url: existing.getUrl(),
        thumbnail: thumbnailUrl_(existing.getId()), date: date,
        time: meta.time || time, nisn: nisn, name: meta.name || name,
        kelas: meta.kelas || kelas, status: 'H', metode: 'BARCODE'
      };
    }

    const fileName = 'ABSEN_BARCODE_' + date + '_' + time.replace(/:/g, '-') + '_' + name + '.svg';
    const esc = v => String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="820" viewBox="0 0 1400 820">' +
      '<rect width="1400" height="820" rx="42" fill="#101936"/>' +
      '<rect x="45" y="45" width="1310" height="730" rx="34" fill="#182449" stroke="#4055ff" stroke-width="3"/>' +
      '<text x="700" y="145" text-anchor="middle" fill="#8ea0ff" font-family="Arial" font-size="30" font-weight="700" letter-spacing="8">XI TKJ 1 • ATTENDANCE</text>' +
      '<text x="700" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="66" font-weight="800">' + esc(name) + '</text>' +
      '<text x="700" y="365" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="48" font-weight="700">Absen Dengan Barcode</text>' +
      '<line x1="240" y1="420" x2="1160" y2="420" stroke="#4055ff" stroke-width="4"/>' +
      '<text x="700" y="505" text-anchor="middle" fill="#dce2ff" font-family="Arial" font-size="38">Tanggal ' + esc(date) + '</text>' +
      '<text x="700" y="575" text-anchor="middle" fill="#dce2ff" font-family="Arial" font-size="38">Waktu ' + esc(time) + ' WIB</text>' +
      '<text x="700" y="670" text-anchor="middle" fill="#6df0bd" font-family="Arial" font-size="34" font-weight="700">✓ HADIR • BARCODE</text>' +
      '<text x="700" y="720" text-anchor="middle" fill="#8d98b9" font-family="Arial" font-size="20">NISN ' + esc(nisn) + '</text>' +
      '</svg>';

    const file = folder_().createFile(Utilities.newBlob(svg, 'image/svg+xml', fileName));
    const meta = {type:'barcode-attendance', date, time, nisn, name, kelas, status:'H', metode:'BARCODE'};
    file.setDescription(JSON.stringify(meta));
    safeShare_(file);

    return {ok:true, duplicate:false, message:'Absensi barcode tersimpan di Google Drive.',
      id:file.getId(), url:file.getUrl(), thumbnail:thumbnailUrl_(file.getId()),
      date,time,nisn,name,kelas,status:'H',metode:'BARCODE'};
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* =========================
   FOTO MUKA
   ========================= */
function saveFace_(p) {
  const date = clean_(p.date) || today_();
  const time = clean_(p.time) || nowTime_();
  const nisn = clean_(p.nisn);
  const name = clean_(p.name) || 'Siswa';
  const kelas = clean_(p.kelas) || 'XI TKJ 1';

  if (!date || !nisn) return {ok:false, error:'Tanggal atau NISN foto tidak lengkap.'};

  const lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    // Cegah double submit meskipun tombol ditekan dua kali / koneksi lambat.
    const existing = findAttendanceFile_('face-attendance', date, nisn);
    if (existing) {
      const meta = JSON.parse(existing.getDescription() || '{}');
      return {ok:true, duplicate:true, message:'Foto absensi sudah tercatat hari ini.',
        id:existing.getId(), url:existing.getUrl(), thumbnail:thumbnailUrl_(existing.getId()),
        date,time:meta.time||time,nisn,name:meta.name||name,kelas:meta.kelas||kelas,
        status:'H',metode:'FOTO MUKA'};
    }

    const blob = decodeImage_(p);
    const fileName = 'ABSEN_FOTO_' + date + '_' + time.replace(/:/g, '-') + '_' + name + '.jpg';
    blob.setName(fileName);

    const file = folder_().createFile(blob);
    const meta = {
      type:'face-attendance', date, time, nisn, name, kelas,
      status:'H', metode:'FOTO MUKA',
      latitude:String(p.latitude || ''),
      longitude:String(p.longitude || ''),
      accuracy:String(p.accuracy || ''),
      mapsUrl:String(p.mapsUrl || ''),
      locationText:String(p.locationText || p.address || ''),
      uploadedAt:Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss")
    };

    file.setDescription(JSON.stringify(meta));
    safeShare_(file);

    return {ok:true, duplicate:false, message:'Foto absensi berhasil disimpan di Google Drive.',
      id:file.getId(), url:file.getUrl(), thumbnail:thumbnailUrl_(file.getId()),
      date,time,nisn,name,kelas,status:'H',metode:'FOTO MUKA',
      latitude:meta.latitude, longitude:meta.longitude, accuracy:meta.accuracy,
      mapsUrl:meta.mapsUrl, locationText:meta.locationText};
  } catch (err) {
    return {ok:false, error:err.message || String(err)};
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* =========================
   STATUS / LIST
   ========================= */
function listAttendance_(p) {
  const date = clean_(p.date) || today_();
  const barcode = [], face = [];
  const files = folder_().getFiles();

  while (files.hasNext()) {
    const file = files.next();
    try {
      const m = JSON.parse(file.getDescription() || '{}');
      if (String(m.date || '') !== date) continue;
      const common = {id:file.getId(),url:file.getUrl(),thumbnail:thumbnailUrl_(file.getId()),
        date:m.date||'',time:m.time||'',nisn:m.nisn||'',name:m.name||'',kelas:m.kelas||'XI TKJ 1',
        status:'H',metode:m.metode||''};
      if (m.type === 'barcode-attendance') barcode.push(common);
      if (m.type === 'face-attendance') face.push(Object.assign(common, {
        latitude:m.latitude||'',longitude:m.longitude||'',accuracy:m.accuracy||'',
        mapsUrl:m.mapsUrl||'',locationText:m.locationText||''
      }));
    } catch (_) {}
  }
  barcode.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  face.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  return {ok:true,date,barcode,face};
}

function attendanceStatus_(p) {
  const date = clean_(p.date) || today_();
  const nisn = clean_(p.nisn);
  if (!nisn) return {ok:false,error:'NISN tidak ada.'};

  const barcodeFile = findAttendanceFile_('barcode-attendance',date,nisn);
  const faceFile = findAttendanceFile_('face-attendance',date,nisn);
  let record = null;
  let barcodeDone = !!barcodeFile;
  let faceDone = !!faceFile;

  if (barcodeFile) {
    const m = JSON.parse(barcodeFile.getDescription() || '{}');
    record = {date:m.date||date,time:m.time||'',nisn:m.nisn||nisn,name:m.name||'',kelas:m.kelas||'XI TKJ 1',
      status:'H',metode:'BARCODE',id:barcodeFile.getId(),url:barcodeFile.getUrl(),thumbnail:thumbnailUrl_(barcodeFile.getId())};
  }
  if (faceFile && !record) {
    const m = JSON.parse(faceFile.getDescription() || '{}');
    record = {date:m.date||date,time:m.time||'',nisn:m.nisn||nisn,name:m.name||'',kelas:m.kelas||'XI TKJ 1',
      status:'H',metode:'FOTO MUKA',id:faceFile.getId(),url:faceFile.getUrl(),thumbnail:thumbnailUrl_(faceFile.getId()),
      latitude:m.latitude||'',longitude:m.longitude||'',accuracy:m.accuracy||'',mapsUrl:m.mapsUrl||'',locationText:m.locationText||''};
  }
  return {ok:true,date,nisn,barcodeDone,faceDone,locked:barcodeDone||faceDone,record};
}

function TEST() {
  try {
    const f = folder_();
    return {ok:true,message:'Apps Script Drive-only aktif.',version:BACKEND_VERSION,folder:f.getName(),folderId:f.getId()};
  } catch (err) {
    return {ok:false,error:err.message||String(err),version:BACKEND_VERSION};
  }
}

/* =========================
   WEB APP ENDPOINTS
   ========================= */
function route_(p) {
  const action = String(p.action || '').trim();
  if (action === 'test' || action === 'ping') return {ok:true,message:'XI TKJ 1 Drive API aktif',version:BACKEND_VERSION};
  if (action === 'testConnection') return TEST();
  if (action === 'saveBarcodeAttendance' || action === 'barcode') return makeBarcodeImage_(p);
  if (action === 'uploadFaceAttendance' || action === 'saveFace') return saveFace_(p);
  if (action === 'attendanceStatus') return attendanceStatus_(p);
  if (action === 'attendanceSummary' || action === 'listAttendance' || action === 'listFaceAttendance') return listAttendance_(p);
  if (action === 'version') return {ok:true,version:BACKEND_VERSION};
  return {ok:true,message:'XI TKJ 1 attendance backend running',version:BACKEND_VERSION};
}

function doGet(e) {
  const p = payload_(e);
  try { return jsonp_(route_(p), p.callback); }
  catch (err) { return jsonp_({ok:false,error:err.message||String(err),version:BACKEND_VERSION}, p.callback); }
}

function doPost(e) {
  const p = payload_(e);
  try { return json_(route_(p)); }
  catch (err) { return json_({ok:false,error:err.message||String(err),version:BACKEND_VERSION}); }
}
