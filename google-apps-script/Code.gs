/*
 * XI TKJ 1 — GOOGLE DRIVE BACKEND TERPADU
 * Absensi Foto + Barcode + Request Lagu + Snapshot Keuangan + Vooting
 *
 * Deploy:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * GANTI FOLDER_ID jika folder Drive utama berbeda.
 */
const FOLDER_ID = '1Flcbrukb1Ln2x-uhDhUyWUc0eHp8EZoQ';
const TZ = 'Asia/Jakarta';
const BACKEND_VERSION = 'XI-TKJ1-UNIFIED-2026-09-03-V15';

function folder_(){ return DriveApp.getFolderById(FOLDER_ID); }
function subFolder_(name){
  const root=folder_(); const it=root.getFoldersByName(name);
  return it.hasNext()?it.next():root.createFolder(name);
}
function clean_(v){return String(v==null?'':v).trim().replace(/[\\/:*?"<>|#%{}~&]/g,'_').slice(0,120)}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function jsonp_(o,cb){
  if(cb && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(cb)) return ContentService.createTextOutput(cb+'('+JSON.stringify(o)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return json_(o);
}
function payload_(e){
  const p={}; if(e&&e.parameter)Object.keys(e.parameter).forEach(k=>p[k]=e.parameter[k]);
  try{const body=e&&e.postData&&e.postData.contents;if(body){const x=JSON.parse(body);if(x&&typeof x==='object')Object.keys(x).forEach(k=>{if(p[k]===undefined||p[k]==='')p[k]=x[k]})}}catch(_){ }
  return p;
}
function today_(){return Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd')}
function nowTime_(){return Utilities.formatDate(new Date(),TZ,'HH:mm:ss')}
function thumbnailUrl_(id){return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1200'}
function safeShare_(f){try{f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW)}catch(_){}}
function meta_(file){try{return JSON.parse(file.getDescription()||'{}')}catch(_){return {}}}
function findByMeta_(type,date,nisn){
  const fs=folder_().getFiles();
  while(fs.hasNext()){const f=fs.next(),m=meta_(f);if(m.type===type&&String(m.date||'')===String(date||'')&&String(m.nisn||'')===String(nisn||''))return f}
  return null;
}
function normalizeBase64_(v){return String(v||'').trim().replace(/^data:[^;]+;base64,/i,'').replace(/[\r\n\t\s]/g,'')}
function decode_(v,maxBytes){const b64=normalizeBase64_(v);if(!b64)throw new Error('Data gambar kosong.');if(b64.length>12000000)throw new Error('Gambar terlalu besar.');const bytes=Utilities.base64Decode(b64);if(!bytes.length)throw new Error('Gambar kosong.');if(bytes.length>(maxBytes||9000000))throw new Error('Ukuran gambar terlalu besar.');return bytes}

/* ===== ABSENSI BARCODE ===== */
function makeBarcodeImage_(p){
  const date=clean_(p.date)||today_(),time=clean_(p.time)||nowTime_(),nisn=clean_(p.nisn),name=clean_(p.name)||'Siswa',kelas=clean_(p.kelas)||'XI TKJ 1';
  if(!nisn)return {ok:false,error:'NISN barcode kosong.'};
  const lock=LockService.getScriptLock();lock.tryLock(10000);
  try{
    const old=findByMeta_('barcode-attendance',date,nisn);if(old){const m=meta_(old);return {ok:true,duplicate:true,message:'Barcode sudah tercatat hari ini.',id:old.getId(),url:old.getUrl(),thumbnail:thumbnailUrl_(old.getId()),date,time:m.time||time,nisn,name:m.name||name,kelas:m.kelas||kelas,status:'H',metode:'BARCODE'}}
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="820"><rect width="1400" height="820" rx="42" fill="#101936"/><rect x="45" y="45" width="1310" height="730" rx="34" fill="#182449" stroke="#4055ff" stroke-width="3"/><text x="700" y="145" text-anchor="middle" fill="#8ea0ff" font-family="Arial" font-size="30" font-weight="700">XI TKJ 1 • ATTENDANCE</text><text x="700" y="270" text-anchor="middle" fill="#fff" font-family="Arial" font-size="58" font-weight="800">'+esc(name)+'</text><text x="700" y="365" text-anchor="middle" fill="#fff" font-family="Arial" font-size="44" font-weight="700">Absen Dengan Barcode</text><line x1="240" y1="420" x2="1160" y2="420" stroke="#4055ff" stroke-width="4"/><text x="700" y="505" text-anchor="middle" fill="#dce2ff" font-family="Arial" font-size="38">Tanggal '+esc(date)+'</text><text x="700" y="575" text-anchor="middle" fill="#dce2ff" font-family="Arial" font-size="38">Waktu '+esc(time)+' WIB</text><text x="700" y="670" text-anchor="middle" fill="#6df0bd" font-family="Arial" font-size="34" font-weight="700">✓ HADIR • BARCODE</text><text x="700" y="720" text-anchor="middle" fill="#8d98b9" font-family="Arial" font-size="20">NISN '+esc(nisn)+'</text></svg>';
    const f=subFolder_('ABSENSI BARCODE').createFile(Utilities.newBlob(svg,'image/svg+xml','ABSEN_BARCODE_'+date+'_'+time.replace(/:/g,'-')+'_'+clean_(name)+'.svg'));
    f.setDescription(JSON.stringify({type:'barcode-attendance',date,time,nisn,name,kelas,status:'H',metode:'BARCODE'}));safeShare_(f);
    return {ok:true,duplicate:false,message:'Absensi barcode tersimpan.',id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId()),date,time,nisn,name,kelas,status:'H',metode:'BARCODE'};
  }finally{try{lock.releaseLock()}catch(_){}}
}

/* ===== ABSENSI FOTO ===== */
function saveFace_(p){
  const date=clean_(p.date)||today_(),time=clean_(p.time)||nowTime_(),nisn=clean_(p.nisn),name=clean_(p.name)||'Siswa',kelas=clean_(p.kelas)||'XI TKJ 1';
  if(!nisn)return {ok:false,error:'NISN foto tidak lengkap.'};
  const lock=LockService.getScriptLock();lock.tryLock(15000);
  try{
    const old=findByMeta_('face-attendance',date,nisn);if(old){const m=meta_(old);return {ok:true,duplicate:true,message:'Foto absensi sudah tercatat hari ini.',id:old.getId(),url:old.getUrl(),thumbnail:thumbnailUrl_(old.getId()),date,time:m.time||time,nisn,name:m.name||name,kelas:m.kelas||kelas,status:'H',metode:'FOTO MUKA'}}
    const blob=Utilities.newBlob(decode_(p.imageData||p.imageBase64||p.photo,9000000),'image/jpeg','ABSEN_FOTO_'+date+'_'+time.replace(/:/g,'-')+'_'+clean_(name)+'.jpg');
    const f=subFolder_('ABSENSI FOTO').createFile(blob);
    const m={type:'face-attendance',date,time,nisn,name,kelas,status:'H',metode:'FOTO MUKA',latitude:String(p.latitude||''),longitude:String(p.longitude||''),accuracy:String(p.accuracy||''),mapsUrl:String(p.mapsUrl||''),locationText:String(p.locationText||p.address||''),uploadedAt:Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HH:mm:ss')};
    f.setDescription(JSON.stringify(m));safeShare_(f);return {ok:true,duplicate:false,message:'Foto absensi berhasil disimpan.',id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId()),date,time,nisn,name,kelas,status:'H',metode:'FOTO MUKA',latitude:m.latitude,longitude:m.longitude,accuracy:m.accuracy,mapsUrl:m.mapsUrl,locationText:m.locationText};
  }catch(e){return {ok:false,error:e.message||String(e)}}finally{try{lock.releaseLock()}catch(_){}}
}
function listAttendance_(p){
  const date=clean_(p.date)||today_(),barcode=[],face=[];const fs=folder_().getFiles();
  while(fs.hasNext()){const f=fs.next(),m=meta_(f);if(String(m.date||'')!==date)continue;const common={id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId()),date:m.date||'',time:m.time||'',nisn:m.nisn||'',name:m.name||'',kelas:m.kelas||'XI TKJ 1',status:'H',metode:m.metode||''};if(m.type==='barcode-attendance')barcode.push(common);if(m.type==='face-attendance')face.push(Object.assign(common,{latitude:m.latitude||'',longitude:m.longitude||'',accuracy:m.accuracy||'',mapsUrl:m.mapsUrl||'',locationText:m.locationText||''}))}
  barcode.sort((a,b)=>String(a.time).localeCompare(String(b.time)));face.sort((a,b)=>String(a.time).localeCompare(String(b.time)));return {ok:true,date,barcode,face,totalBarcode:barcode.length,totalFace:face.length};
}
function attendanceStatus_(p){const date=clean_(p.date)||today_(),nisn=clean_(p.nisn);if(!nisn)return {ok:false,error:'NISN kosong.'};const b=findByMeta_('barcode-attendance',date,nisn),f=findByMeta_('face-attendance',date,nisn);return {ok:true,date,nisn,barcodeDone:!!b,faceDone:!!f,locked:!!b||!!f,record:f?Object.assign(meta_(f),{id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId())}):b?Object.assign(meta_(b),{id:b.getId(),url:b.getUrl(),thumbnail:thumbnailUrl_(b.getId())}):null};}

/* ===== REQUEST LAGU ===== */
function saveSongRequest_(p){
  const title=clean_(p.title),artist=clean_(p.artist),name=clean_(p.name)||'Siswa',nisn=clean_(p.nisn),date=clean_(p.date)||today_(),time=clean_(p.time)||nowTime_();
  if(!title||!artist)return {ok:false,error:'Judul lagu dan artis wajib diisi.'};
  try{
    let f;
    if(p.imageData){f=subFolder_('REQUEST LAGU').createFile(Utilities.newBlob(decode_(p.imageData,9000000),String(p.mimeType||'image/png'),clean_(p.fileName||('Request-Lagu-'+title+'.png'))));}
    else f=subFolder_('REQUEST LAGU').createFile(Utilities.newBlob('Request Lagu\nNama: '+name+'\nJudul: '+title+'\nArtis: '+artist+'\nWaktu: '+date+' '+time,'text/plain','Request-Lagu-'+clean_(title)+'.txt'));
    const m={type:'song-request',name,nisn,title,artist,date,time,status:'NEW',createdAt:new Date().toISOString()};f.setDescription(JSON.stringify(m));safeShare_(f);return {ok:true,id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId()),name,title,artist,date,time};
  }catch(e){return {ok:false,error:e.message||String(e)}}
}
function listSongRequests_(p){
  const out=[],fs=subFolder_('REQUEST LAGU').getFiles();while(fs.hasNext()){const f=fs.next(),m=meta_(f);if(m.type==='song-request')out.push(Object.assign(m,{id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId())}))}out.sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));return {ok:true,requests:out};
}

/* ===== SNAPSHOT KEUANGAN / IMAGE GENERIC ===== */
function saveDriveImage_(p,kindOverride){
  try{const bytes=decode_(p.imageData,9000000),mime=String(p.mimeType||'image/png'),kind=clean_(kindOverride||p.kind||'class-image'),fileName=clean_(p.fileName||('XI-TKJ1-'+Date.now()+'.png')),f=subFolder_(kind==='finance-snapshot'?'SNAPSHOT KEUANGAN':'CLASS EXPORT').createFile(Utilities.newBlob(bytes,mime,fileName));let m={};try{m=JSON.parse(p.meta||'{}')}catch(_){}m.type=kind;m.createdAt=new Date().toISOString();m.source='XI TKJ 1 Class Website';f.setDescription(JSON.stringify(m));safeShare_(f);return {ok:true,id:f.getId(),url:f.getUrl(),thumbnail:thumbnailUrl_(f.getId()),name:f.getName(),kind};}catch(e){return {ok:false,error:e.message||String(e)}}
}
function saveFinanceSnapshot_(p){return saveDriveImage_(p,'finance-snapshot')}

/* ===== SYSTEM ===== */
function TEST(){try{const f=folder_();return {ok:true,message:'XI TKJ 1 unified backend aktif.',version:BACKEND_VERSION,folder:f.getName(),folderId:f.getId(),folders:['ABSENSI FOTO','ABSENSI BARCODE','REQUEST LAGU','SNAPSHOT KEUANGAN']}}catch(e){return {ok:false,error:e.message||String(e),version:BACKEND_VERSION}}}
function route_(p){
  const a=String(p.action||'').trim();
  if(a==='test'||a==='ping'||a==='testConnection')return a==='testConnection'?TEST():{ok:true,message:'XI TKJ 1 unified backend aktif',version:BACKEND_VERSION};
  if(a==='saveBarcodeAttendance'||a==='barcode')return makeBarcodeImage_(p);
  if(a==='uploadFaceAttendance'||a==='saveFace')return saveFace_(p);
  if(a==='attendanceStatus')return attendanceStatus_(p);
  if(a==='attendanceSummary'||a==='listAttendance'||a==='listFaceAttendance')return listAttendance_(p);
  if(a==='saveSongRequest')return saveSongRequest_(p);
  if(a==='listSongRequests')return listSongRequests_(p);
  if(a==='saveFinanceSnapshot')return saveFinanceSnapshot_(p);
  if(a==='saveDriveImage')return saveDriveImage_(p);
  if(a==='version')return {ok:true,version:BACKEND_VERSION};
  return {ok:true,message:'XI TKJ 1 unified backend running',version:BACKEND_VERSION};
}
function doGet(e){const p=payload_(e);try{return jsonp_(route_(p),p.callback)}catch(err){return jsonp_({ok:false,error:err.message||String(err),version:BACKEND_VERSION},p.callback)}}
function doPost(e){const p=payload_(e);try{return json_(route_(p))}catch(err){return json_({ok:false,error:err.message||String(err),version:BACKEND_VERSION})}}
