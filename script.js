/* ===== HERO TYPEWRITER: ketik → jeda → hapus → ulang ===== */
(function initHeroTypewriter(){
  const title=document.getElementById("typingTitle");
  if(!title)return;

  const text="XI TKJ 1";
  const typeSpeed=140;
  const deleteSpeed=95;
  const endPause=1400;
  const startPause=350;
  let index=0;
  let deleting=false;

  function animate(){
    title.textContent=text.slice(0,index);

    if(!deleting && index<text.length){
      index++;
      setTimeout(animate,typeSpeed);
      return;
    }

    if(!deleting && index===text.length){
      deleting=true;
      setTimeout(animate,endPause);
      return;
    }

    if(deleting && index>0){
      index--;
      setTimeout(animate,deleteSpeed);
      return;
    }

    deleting=false;
    setTimeout(animate,startPause);
  }

  title.textContent='';
  setTimeout(animate,startPause);
})();

document.getElementById("year").textContent=new Date().getFullYear();

const themeButton=document.getElementById("themeButton");
if(themeButton){
 if(localStorage.getItem("xi-theme")==="dark"){document.body.classList.add("dark");themeButton.textContent="☾"}
 themeButton.addEventListener("click",()=>{
 document.body.classList.toggle("dark");
 const dark=document.body.classList.contains("dark");
 themeButton.textContent=dark?"☾":"☀";
 localStorage.setItem("xi-theme",dark?"dark":"light");
 });
}

const menuButton=document.getElementById("menuButton"),mobileMenu=document.getElementById("mobileMenu"),mobileMenuClose=document.getElementById("mobileMenuClose");
function setClassMenu(open){
 if(!mobileMenu)return;
 mobileMenu.classList.toggle("show",open);
 menuButton?.setAttribute("aria-expanded",String(open));
 document.body.classList.toggle("class-menu-open",open);
}
menuButton?.setAttribute("aria-expanded","false");
menuButton?.addEventListener("click",e=>{e.stopPropagation();setClassMenu(!mobileMenu?.classList.contains("show"))});
mobileMenuClose?.addEventListener("click",()=>setClassMenu(false));
document.addEventListener("click",e=>{if(mobileMenu?.classList.contains("show")&&!mobileMenu.contains(e.target)&&!menuButton?.contains(e.target))setClassMenu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")setClassMenu(false)});
document.querySelectorAll(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>setClassMenu(false)));

const navLinks=document.querySelectorAll(".nav-links a"),sections=document.querySelectorAll("section[id]");
window.addEventListener("scroll",()=>{
 let current="";
 sections.forEach(s=>{if(scrollY>=s.offsetTop-180)current=s.id});
 navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+current));
});

let counterDone=false;
function startCounter(){
 if(counterDone)return; counterDone=true;
 document.querySelectorAll("[data-count]").forEach(c=>{
  const target=Number(c.dataset.count);let n=0;
  const timer=setInterval(()=>{n++;c.textContent=n;if(n>=target)clearInterval(timer)},30);
 });
}
const counterObserver=new IntersectionObserver(e=>{if(e[0].isIntersecting)startCounter()},{threshold:.3});
counterObserver.observe(document.querySelector(".stats-grid"));

const schedules={
  senin:[
    ["07:00 - 08:00","UPC","—",""],
    ["08:00 - 09:55","B. Indonesia","IKE CINTIA DEWI, S.Pd",""],
    ["10:15 - 15:00","Teknologi Jaringan Kabel dan Nirkabel","TINO RAMBANG GUNAWAN, S.Kom",""]
  ],
  selasa:[
    ["07:00 - 09:45","Matematika","SETYOWATI, S.Pd",""],
    ["09:45 - 11:45","Pendidikan Agama","LU'LUA'TUL M., S.Ag",""],
    ["11:45 - 15:00","Mapil TKJ","SOJU PURIWANTO, S.Pd",""]
  ],
  rabu:[
    ["07:00 - 10:15","Perencanaan dan Pengalamatan Jaringan","DIANA CATUR KARTIKA SARI, S.Kom",""],
    ["10:35 - 14:10","Administrasi Sistem Jaringan","DONI ARDIANTO, S.Kom",""],
    ["14:10 - 15:00","B. Inggris","ANGGRAINI WULANSARI, S.Pd",""]
  ],
  kamis:[
    ["07:00 - 09:00","Sejarah","WINDI YUNITA, S.Pd",""],
    ["09:00 - 10:30","Pend. Pancasila","YANUAR DWIANTA, S.Pd",""],
    ["10:45 - 14:10","Pemasangan dan Konfigurasi Perangkat Jaringan","MAM JUNAIDI ABROR, S.Pd",""],
    ["14:10 - 15:00","B. Inggris","ANGGRAINI WULANSARI, S.Pd",""]
  ],
  jumat:[
    ["07:00 - 09:00","B. Jawa","RISKA HANDAYANI",""],
    ["09:00 - 10:30","Penjaskes","SANDY RIAWAN, M.Pd",""],
    ["10:45 - 11:30","BK","SITI KOMARIATUL UZ ZAHROK, S.Pd",""],
    ["11:30 - 14:55","Kreatifitas, Inovasi, dan Kewirausahaan","SITI NURUL FAUZIAH, S.E",""]
  ]
};
const scheduleList=document.getElementById("scheduleList");
function renderSchedule(day){
 scheduleList.innerHTML="";
 getSchedules()[day].forEach((x,i)=>{
  const d=document.createElement("div");d.className="schedule-item";d.style.animationDelay=i*.06+"s";
  d.innerHTML=`<div class="schedule-time">${x[0]}</div><div><div class="schedule-subject">${x[1]}</div><div class="schedule-teacher">${x[2]}</div></div>${x[3]?`<div class="schedule-room">${x[3]}</div>`:""}`;
  scheduleList.appendChild(d);
 });
}
const DAY_BY_INDEX=["minggu","senin","selasa","rabu","kamis","jumat","sabtu"];
const todayScheduleDay=(()=>{const weekday=new Intl.DateTimeFormat("id-ID",{weekday:"long",timeZone:"Asia/Jakarta"}).format(new Date()).toLowerCase();const d=weekday.replace("minggu","minggu");return ["senin","selasa","rabu","kamis","jumat"].includes(d)?d:"senin"})();
document.querySelectorAll(".day-button").forEach(b=>b.classList.toggle("active",b.dataset.day===todayScheduleDay));
renderSchedule(todayScheduleDay);
document.querySelectorAll(".day-button").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".day-button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderSchedule(b.dataset.day);
}));

const students=[
["Ach. Yudi","L"],["Alfi R. F.","L"],["Alvino Adityas","L"],["Alya Nur Fadilah","P"],["Aringga Rheza","L"],
["Aurellia Siva A.","P"],["Azkya Viorentina F.","P"],["Cika Ul Umha","P"],["Desvita Ayu S.","P"],["Dina Oktaviana","P"],
["Elis Nurdiyana P.","P"],["Enisa Vita Agustin","P"],["Feriska Aulia M.","P"],["Fita Dwi A.","P"],["Ines Afina R.","P"],
["Irfan Wahyu Prasetyo","L"],["Kharizma Aiya A.","P"],["Kirania Putri S.","P"],["Lucky Akbar Al F.","L"],["Marsha Aufa Nur S.","P"],
["Miftakhul Huda","L"],["Moh. Dzul Fiqri Albaqi B.","L"],["M. Indra S. P.","L"],["M. Farhan Daffa","L"],["M. Ezar Maulana M.","L"],
["M. Imam V.","L"],["Naila Naswa D.","P"],["Neneng Anjarwati","P"],["Noval Dwi Alvino","L"],["Nurissadiyah Ika F.","P"],
["Putri Ridia Artika S.","P"],["Reyhana Zema Z.","P"],["Risma Fitri Amelia","P"],["Savira Aulia Dias A.","P"],["Shela Febriyanti","P"],["Vega Aulia Renata","P"]
];
const studentsGrid=document.getElementById("studentsGrid"),searchInput=document.getElementById("studentSearch"),studentFilter=document.getElementById("studentFilter");
function accountForStudent(student){
 const index=students.indexOf(student);
 return (window.__CLASS_ACCOUNTS||[])[index] || null;
}
function getAccountProfiles(){try{return JSON.parse(localStorage.getItem('xi-account-profiles')||'{}')}catch{return {}}}
function getStudentProfile(account){
 const profiles=getAccountProfiles(), saved=account?.nisn?profiles[account.nisn]:null;
 return Object.assign({displayName:account?.name||'',username:account?.first||'',bio:'Suka mencoba hal baru dan membangun proyek digital sederhana.',interests:'Desain UI, jaringan, dan eksplorasi teknologi',skills:'Troubleshooting, konfigurasi jaringan, dan dasar coding',achievement:'Belum ada data',goal:'Mengembangkan kemampuan TKJ',favoriteSubject:'Teknik Komputer & Jaringan',motto:'',status:'Aktif'},saved||{});
}
function photoForAccount(account){if(!account)return '';try{return JSON.parse(localStorage.getItem('xi-account-photos')||'{}')[account.nisn]||''}catch{return ''}}
function renderStudents(){
 const search=searchInput.value.toLowerCase().trim(),gender=studentFilter.value;
 const filtered=students.filter(s=>s[0].toLowerCase().includes(search)&&(gender==="all"||s[1]===gender));
 studentsGrid.innerHTML="";
 if(!filtered.length){studentsGrid.innerHTML=`<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">Tidak ada siswa yang ditemukan.</div>`;return}
 filtered.forEach((s,i)=>{
  const account=accountForStudent(s), photo=photoForAccount(account), profile=getStudentProfile(account), displayName=profile.displayName||s[0];
  const c=document.createElement("div");c.className="student-card";c.style.animation=`slideIn .3s ease ${i*.03}s both`;
  c.innerHTML=`<div class="student-avatar-wrap">${photo?`<img class="student-avatar-photo" src="${photo}" alt="Foto ${escapeHTML(displayName)}">`:`<div class="student-avatar">${escapeHTML(displayName[0]||'S')}</div>`}</div><span class="gender">${s[1]}</span><h3>${escapeHTML(displayName)}</h3><p>XI TKJ 1${profile.status&&profile.status!=='Aktif'?` • ${escapeHTML(profile.status)}`:''}</p><small class="student-card-bio">${escapeHTML(profile.bio||'Profil siswa XI TKJ 1')}</small><button class="student-profile-btn" type="button">Lihat Profil →</button>`;
  c.querySelector('.student-profile-btn').addEventListener('click',()=>openStudentProfile(s[0],s[1],account));
  studentsGrid.appendChild(c);
 });
}
searchInput.addEventListener("input",renderStudents);studentFilter.addEventListener("change",renderStudents);renderStudents();

/* ===== RICH STUDENT PROFILE ===== */
const studentProfileModal=document.getElementById('studentProfileModal');
function openStudentProfile(name,gender,account){
  account=account||((window.__CLASS_ACCOUNTS||[]).find(x=>x.name===name)||null);
  const profile=getStudentProfile(account), photo=photoForAccount(account);
  name=profile.displayName||name;
  document.getElementById('studentProfileName').textContent=name;
  document.getElementById('studentProfileSubtitle').textContent='Siswa XI TKJ 1 • Profil anggota kelas';
  const avatar=document.getElementById('studentProfileAvatar');
  if(photo){avatar.innerHTML=`<img src="${photo}" alt="Foto ${escapeHTML(name)}">`;avatar.classList.add('has-photo')}else{avatar.textContent=initials(name);avatar.classList.remove('has-photo')}
  document.getElementById('studentProfileGender').textContent=gender==='L'?'Laki-laki':'Perempuan';
  document.getElementById('studentProfileFullName').textContent=name;
  document.getElementById('studentProfileNisn').textContent=account?.nisn||'Belum tersedia';
  document.getElementById('studentProfileLogin').textContent=account?'NISN terdaftar':'Belum terdaftar';
  document.getElementById('studentProfileBioText').textContent=profile.bio||'Belum ada bio. Siswa dapat menambahkannya dari Account.';
  document.getElementById('studentProfileInterests').textContent=profile.interests;
  document.getElementById('studentProfileSkills').textContent=profile.skills;
  document.getElementById('studentProfileAchievement').textContent=profile.achievement;
  document.getElementById('studentProfileGoal').textContent=profile.goal;
  document.getElementById('studentProfileFavoriteSubject').textContent=profile.favoriteSubject;
  document.getElementById('studentProfileStatus').textContent=profile.status;
  studentProfileModal.classList.add('show');studentProfileModal.setAttribute('aria-hidden','false');
}
function closeStudentProfile(){studentProfileModal.classList.remove('show');studentProfileModal.setAttribute('aria-hidden','true')}
document.getElementById('studentProfileClose')?.addEventListener('click',closeStudentProfile);
studentProfileModal?.addEventListener('click',e=>{if(e.target===studentProfileModal)closeStudentProfile()});
document.querySelectorAll('[data-profile-tab]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.student-profile-tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.getElementById('studentProfile'+btn.dataset.profileTab.charAt(0).toUpperCase()+btn.dataset.profileTab.slice(1))?.classList.add('active')}));


const modal=document.getElementById("infoModal");
document.getElementById("infoButton").addEventListener("click",()=>modal.classList.add("show"));
function closeModal(){modal.classList.remove("show")}
document.getElementById("modalClose").addEventListener("click",closeModal);
document.getElementById("modalOk").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
document.getElementById("backTop").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

const revealElements=document.querySelectorAll(".section-heading,.about-grid,.teacher-grid,.announcement-grid,.gallery-grid,.cta-card");
revealElements.forEach(e=>{e.style.opacity="0";e.style.transform="translateY(25px)";e.style.transition="opacity .7s ease,transform .7s ease"});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity="1";e.target.style.transform="translateY(0)";revealObserver.unobserve(e.target)}}),{threshold:.1});
revealElements.forEach(e=>revealObserver.observe(e));

/* ===== PIKET DATA ===== */
const piketData = {
  Senin:["Yudi","Alfi","Alvino","Cika","Aurellia","Azkya"],
  Selasa:["Ayu","Elis","Enisa","Feriska","Aringga","Huda"],
  Rabu:["Vita","Ines","Kharizma","Kirania","Dzul","Indra"],
  Kamis:["Marsya","Naila","Neneng","Nuris","Farhan","Ezzar"],
  Jumat:["Putri","Risma","Vega","Shela","Imam","Noval"]
};
const piketGrid=document.getElementById("piketGrid");
const piketSearch=document.getElementById("piketSearch");
const piketDay=document.getElementById("piketDay");
const piketResult=document.getElementById("piketResult");
const todayPiketDay=(()=>{const d=new Intl.DateTimeFormat("id-ID",{weekday:"long",timeZone:"Asia/Jakarta"}).format(new Date());return ["Senin","Selasa","Rabu","Kamis","Jumat"].includes(d)?d:"all"})();
if(piketDay)piketDay.value=todayPiketDay;

function initials(name){return name.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase()}

function renderPiket(){
  const q=piketSearch.value.toLowerCase().trim();
  const selected=piketDay.value;
  piketGrid.innerHTML="";
  let found=[];
  Object.entries(getPiketData()).forEach(([day,names])=>{
    if(selected!=="all" && selected!==day)return;
    const visible=names.filter(n=>{
      if(!q) return true;
      const full=students.find(s=>s[0].toLowerCase().startsWith(n.toLowerCase()) || s[0].toLowerCase().includes(n.toLowerCase()));
      return n.toLowerCase().includes(q) || (full && full[0].toLowerCase().includes(q));
    });
    if(q) visible.forEach(n=>found.push(`${n} piket hari ${day}`));
    const card=document.createElement("article");
    card.className="piket-day"+(day===new Intl.DateTimeFormat("id-ID",{weekday:"long",timeZone:"Asia/Jakarta"}).format(new Date())?" active":"");
    card.innerHTML=`<h3>${day}</h3><small>${visible.length} anggota</small>${
      visible.map(n=>`<div class="piket-person"><span class="piket-avatar">${initials(n)}</span><div><b>${n}</b><span>Petugas kebersihan</span></div></div>`).join("")
      || `<p style="margin-top:18px;color:var(--muted);font-size:8px">Tidak ada nama yang cocok.</p>`
    }`;
    piketGrid.appendChild(card);
  });
  if(q){
    piketResult.textContent=found.length ? found.join(" • ") : "Nama siswa tidak ditemukan di jadwal piket.";
  }else{
    piketResult.textContent="Tip: ketik nama siswa untuk langsung menemukan hari piketnya.";
  }
}
piketSearch.addEventListener("input",renderPiket);
piketDay.addEventListener("change",renderPiket);
renderPiket();

/* Active navigation also supports the new sections */
const allNavLinks=document.querySelectorAll(".nav-links a, .mobile-menu a");
allNavLinks.forEach(a=>a.addEventListener("click",()=>{
  const target=document.querySelector(a.getAttribute("href"));
  if(target) setTimeout(()=>target.scrollIntoView({behavior:"smooth",block:"start"}),0);
}));

/* ===== XI TKJ PRO FEATURES ===== */
const proTasks=[
 {id:1,title:'Konfigurasi VLAN & Trunk',subject:'Administrasi Jaringan',deadline:'2026-08-13',status:'todo',desc:'Buat topologi VLAN, trunk, dan dokumentasi konfigurasi.'},
 {id:2,title:'Subnetting IPv4',subject:'Perencanaan Jaringan',deadline:'2026-08-14',status:'doing',desc:'Kerjakan 20 soal subnetting dan simpan hasil perhitungan.'},
 {id:3,title:'Landing Page XI TKJ',subject:'Pemrograman Web',deadline:'2026-08-16',status:'done',desc:'Buat landing page responsif menggunakan HTML, CSS, dan JS.'}
];
const knowledgeFallback=[
 {id:'linux-command',icon:'🐧',cat:'linux',tag:'Linux',title:'Linux Command Dasar',desc:'Perintah penting untuk navigasi file, membuat folder, menyalin, memindahkan, dan menghapus file.',content:'Linux menggunakan terminal sebagai salah satu cara utama mengelola sistem.\n\nPerintah penting:\nls — melihat isi direktori\ncd — berpindah direktori\npwd — melihat lokasi direktori saat ini\nmkdir — membuat direktori\ntouch — membuat file kosong\ncp — menyalin file\nmv — memindahkan atau mengganti nama\nrm — menghapus file\ncat — membaca isi file'},
 {id:'linux-permission',icon:'🔐',cat:'linux',tag:'Linux',title:'Linux Permission & chmod',desc:'Owner, group, permission rwx, chmod, chown, dan keamanan file.',content:'r = read, w = write, x = execute.\n\nContoh: chmod 755 script.sh\n\n755 berarti owner rwx, group r-x, user lain r-x.'},
 {id:'linux-package',icon:'📦',cat:'linux',tag:'Linux',title:'Package Management',desc:'Mengelola aplikasi Linux dengan APT.',content:'sudo apt update\nsudo apt upgrade\nsudo apt install nginx\nsudo apt remove nginx'},
 {id:'linux-systemd',icon:'⚙️',cat:'linux',tag:'Linux',title:'Service & systemctl',desc:'Mengelola service Linux dan memeriksa status layanan.',content:'systemctl status nginx\nsudo systemctl start nginx\nsudo systemctl stop nginx\nsudo systemctl restart nginx\nsudo systemctl enable nginx'},
 {id:'linux-network',icon:'🌐',cat:'linux',tag:'Linux',title:'Networking Linux',desc:'ip, ping, ss, curl, route, dan troubleshooting koneksi.',content:'ip addr\nip route\nping 8.8.8.8\nss -tulpn\ncurl -I https://example.com'},
 {id:'ipv4-subnet',icon:'🌐',cat:'network',tag:'Jaringan',title:'IPv4 & Subnetting',desc:'CIDR, subnet mask, network address, broadcast, dan jumlah host.',content:'/24 = 255.255.255.0. Pada subnet klasik /24 terdapat 256 alamat dan 254 host usable.'},
 {id:'routing-basic',icon:'📡',cat:'network',tag:'Jaringan',title:'Routing Dasar',desc:'Static route, default route, gateway, dan tabel routing.',content:'Routing menentukan ke mana paket harus dikirim. Default route digunakan ketika tidak ada route yang lebih spesifik.'},
 {id:'dhcp-dns',icon:'📶',cat:'network',tag:'Jaringan',title:'DHCP & DNS',desc:'Pembagian IP otomatis dan penerjemahan nama domain.',content:'DHCP memberikan IP, subnet mask, gateway, dan DNS. DNS menerjemahkan nama domain menjadi alamat IP.'},
 {id:'vlan',icon:'🔀',cat:'network',tag:'Jaringan',title:'VLAN & Trunk',desc:'Membagi jaringan secara logis dan membawa beberapa VLAN melalui satu link.',content:'Access port umumnya membawa satu VLAN. Trunk dapat membawa beberapa VLAN dengan tagging.'},
 {id:'html-basic',icon:'💻',cat:'coding',tag:'Coding',title:'HTML Dasar',desc:'Struktur dokumen, semantic tags, link, image, dan form.',content:'HTML membentuk struktur halaman menggunakan elemen seperti header, nav, main, section, article, dan footer.'},
 {id:'css-basic',icon:'🎨',cat:'coding',tag:'Coding',title:'CSS Dasar',desc:'Selector, box model, flexbox, grid, dan responsive design.',content:'CSS mengatur tampilan. Pelajari selector, specificity, box model, flexbox, grid, media query, dan variables.'},
 {id:'js-basic',icon:'⚡',cat:'coding',tag:'Coding',title:'JavaScript Dasar',desc:'DOM, event, array, object, fetch, dan localStorage.',content:'JavaScript membuat halaman interaktif dan dapat memakai fetch() untuk berkomunikasi dengan backend.'},
 {id:'git-basic',icon:'🌿',cat:'coding',tag:'Coding',title:'Git Dasar',desc:'Repository, commit, branch, pull, push, dan clone.',content:'git clone URL\ngit status\ngit add .\ngit commit -m "update"\ngit push'},
 {id:'web-security',icon:'🛡️',cat:'security',tag:'Security',title:'Web Security Dasar',desc:'XSS, CSRF, HTTPS, validasi input, dan keamanan password.',content:'Validasi input, output encoding, HTTPS, dan least privilege merupakan dasar keamanan aplikasi web.'},
 {id:'auth-security',icon:'🔑',cat:'security',tag:'Security',title:'Authentication & Session',desc:'Login, password hashing, session token, dan logout.',content:'Backend sebaiknya menyimpan password dalam bentuk hash menggunakan scrypt, bcrypt, atau Argon2.'},
 {id:'sql-basic',icon:'🗄️',cat:'database',tag:'Database',title:'SQL Dasar',desc:'SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY, dan JOIN.',content:'SQL digunakan untuk mengelola data relasional. Gunakan parameterized query pada backend untuk mencegah SQL injection.'},
 {id:'api-basic',icon:'🔌',cat:'database',tag:'Backend',title:'REST API Dasar',desc:'GET, POST, PUT/PATCH, DELETE, JSON, dan status code.',content:'GET /api/materials mengambil materi. POST /api/materials menambah materi. DELETE /api/materials/:id menghapus materi.'}
];
let knowledge=JSON.parse(localStorage.getItem('xi-local-materials')||'null')||knowledgeFallback;
const ADMIN_TOKEN_KEY='xi-admin-local';
function adminToken(){return sessionStorage.getItem(ADMIN_TOKEN_KEY)||''}
async function loadKnowledge(){renderKnowledge()}
function saveKnowledge(){localStorage.setItem('xi-local-materials',JSON.stringify(knowledge))}
function renderKnowledge(){const grid=document.getElementById('knowledgeGrid');if(!grid)return;const q=(document.getElementById('knowledgeSearch').value||'').toLowerCase();const f=document.getElementById('knowledgeFilter').value;grid.innerHTML=knowledge.filter(k=>(f==='all'||k.cat===f)&&(`${k.title} ${k.desc} ${k.tag} ${k.content||''}`.toLowerCase().includes(q))).map(k=>`<article class="knowledge-card"><div class="knowledge-icon">${escapeHTML(k.icon||'📘')}</div><span class="tag">${escapeHTML(k.tag||k.cat)}</span><h3>${escapeHTML(k.title)}</h3><p>${escapeHTML(k.desc||'')}</p><button class="mini-btn" onclick="openMaterial('${escapeHTML(k.id)}')">Buka materi →</button></article>`).join('')||'<div class="knowledge-card">Materi tidak ditemukan.</div>'}
async function openMaterial(id){try{const k=knowledge.find(x=>x.id===id);if(!k)throw new Error('Materi tidak ditemukan');const box=document.getElementById('materialDetail');box.innerHTML=`<span class="eyebrow">${escapeHTML(k.tag||k.cat)}</span><h2>${escapeHTML(k.title)}</h2><p>${escapeHTML(k.desc||'')}</p><pre class="material-content">${escapeHTML(k.content||'Materi belum memiliki isi.')}</pre>`;document.getElementById('materialModal').classList.add('show');document.getElementById('materialModal').setAttribute('aria-hidden','false')}catch(e){toast(e.message)}}
window.openMaterial=openMaterial;
document.getElementById('knowledgeSearch')?.addEventListener('input',renderKnowledge);document.getElementById('knowledgeFilter')?.addEventListener('change',renderKnowledge);document.getElementById('materialClose')?.addEventListener('click',()=>document.getElementById('materialModal').classList.remove('show'));document.getElementById('materialModal')?.addEventListener('click',e=>{if(e.target.id==='materialModal')e.target.classList.remove('show')});loadKnowledge();

function escapeHTML(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.classList.remove('welcome-toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}
function welcomeToast(msg){const t=document.getElementById('toast');if(!t)return;t.classList.add('welcome-toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>{t.classList.remove('show');t.classList.remove('welcome-toast')},3200)}
function profileToast(msg){const t=document.getElementById('profileToast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(window.__profileToast);window.__profileToast=setTimeout(()=>t.classList.remove('show'),2400)}
function loadTasks(){try{return JSON.parse(localStorage.getItem('xi-pro-tasks'))||proTasks}catch{return proTasks}}
function saveTasks(x){localStorage.setItem('xi-pro-tasks',JSON.stringify(x));const stat=document.getElementById('taskStat');if(stat)stat.textContent=x.filter(t=>t.status!=='done').length}
function loadTaskSubmissions(){try{return JSON.parse(localStorage.getItem('xi-task-submissions')||'{}')}catch{return {}}}
function saveTaskSubmissions(x){localStorage.setItem('xi-task-submissions',JSON.stringify(x))}
function studentTaskStatus(taskId,nisn){const all=loadTaskSubmissions();return all[String(taskId)]?.[nisn]||'todo'}
function setStudentTaskStatus(taskId,nisn,status){const all=loadTaskSubmissions();const key=String(taskId);if(!all[key])all[key]={};all[key][nisn]=status;saveTaskSubmissions(all)}
function renderTasks(){
 const grid=document.getElementById('taskGrid');if(!grid)return;
 const q=(document.getElementById('taskSearch').value||'').toLowerCase();const f=document.getElementById('taskFilter').value;
 const session=getSessionSafe();const studentNisn=session?.role==='student'?session.nisn:null;
 const visible=loadTasks().filter(t=>(f==='all'||t.status===f)&&(`${t.title} ${t.subject}`.toLowerCase().includes(q)));
 const tasks=studentNisn?visible.filter(t=>studentTaskStatus(t.id,studentNisn)!=='done'):visible;
 grid.innerHTML=tasks.map(t=>{
   const personal=studentNisn?studentTaskStatus(t.id,studentNisn):t.status;
   const badge=personal==='done'?'🟢 Sudah Mengerjakan':personal==='doing'?'🟡 Sedang Mengerjakan':'🔴 Belum Mengerjakan';
   const studentActions=studentNisn?`<div class="task-actions"><button class="mini-btn" onclick="markTaskDoing(${t.id})">${personal==='doing'?'Sedang Mengerjakan':'Mulai Mengerjakan'}</button><button class="btn btn-primary" onclick="markTaskDone(${t.id})">Sudah Mengerjakan</button></div>`:'';
   const adminActions=!studentNisn&&session?.role==='admin'?`<div class="task-actions"><button class="mini-btn" onclick="cycleTask(${t.id})">Ubah Status</button><button class="mini-btn danger" onclick="deleteTask(${t.id})">Hapus</button></div>`:'';
   return `<article class="task-card"><span class="status">${badge}</span><small>${escapeHTML(t.subject)}</small><h3>${escapeHTML(t.title)}</h3><p>${escapeHTML(t.desc)}</p><div class="task-meta"><span>⏰ ${escapeHTML(t.deadline)}</span><span>Task #${t.id}</span></div>${studentNisn?`<div class="task-student-status">Status pribadi: ${personal==='doing'?'masih dikerjakan':'belum dikerjakan'}</div>`:''}${studentActions}${adminActions}</article>`;
 }).join('')||'<div class="task-card">Tidak ada tugas yang cocok.</div>';
 updateTaskAdminControls();
}
function markTaskDoing(id){const s=getSessionSafe();if(s?.role!=='student')return toast('Login sebagai siswa untuk mengubah status tugas.');setStudentTaskStatus(id,s.nisn,'doing');renderTasks();toast('Tugas ditandai sedang dikerjakan')}
function markTaskDone(id){const s=getSessionSafe();if(s?.role!=='student')return toast('Login sebagai siswa untuk mengumpulkan tugas.');setStudentTaskStatus(id,s.nisn,'done');renderTasks();toast('Tugas berhasil ditandai sudah mengerjakan')}
window.markTaskDoing=markTaskDoing;window.markTaskDone=markTaskDone;
function cycleTask(id){const a=loadTasks(),t=a.find(x=>x.id===id);if(!t)return;t.status=t.status==='todo'?'doing':t.status==='doing'?'done':'todo';saveTasks(a);renderTasks();adminRender('tasks');toast('Status tugas diperbarui: '+(t.status==='todo'?'Belum dimulai':t.status==='doing'?'Sedang dikerjakan':'Selesai'))}
async function confirmTaskDelete(message='Hapus Tugas?'){return await openTaskConfirm({title:message,hint:'Tugas yang dihapus tidak dapat dikembalikan.'})}
async function deleteTask(id){const ok=await confirmTaskDelete('Hapus Tugas?');if(!ok)return;saveTasks(loadTasks().filter(t=>t.id!==id));const subs=loadTaskSubmissions();delete subs[String(id)];saveTaskSubmissions(subs);renderTasks();adminRender('tasks');toast('Tugas dihapus')}
window.cycleTask=cycleTask;window.deleteTask=deleteTask;window.confirmTaskDelete=confirmTaskDelete;
function updateTaskAdminControls(){const b=document.getElementById('addTaskBtn');const s=getSessionSafe();if(b)b.hidden=!(s?.role==='admin')}
window.addEventListener('xi-session-changed',updateTaskAdminControls);
document.getElementById('taskSearch')?.addEventListener('input',renderTasks);document.getElementById('taskFilter')?.addEventListener('change',renderTasks);document.getElementById('addTaskBtn')?.addEventListener('click',()=>{if(getSessionSafe()?.role!=='admin')return toast('Hanya admin yang dapat menambah tugas.');adminAddTask()});updateTaskAdminControls();renderTasks();
function renderKnowledge(){const grid=document.getElementById('knowledgeGrid');if(!grid)return;const q=(document.getElementById('knowledgeSearch').value||'').toLowerCase();const f=document.getElementById('knowledgeFilter').value;grid.innerHTML=knowledge.filter(k=>(f==='all'||k.cat===f)&&(`${k.title} ${k.desc} ${k.tag}`.toLowerCase().includes(q))).map(k=>`<article class="knowledge-card"><div class="knowledge-icon">${k.icon}</div><span class="tag">${k.tag}</span><h3>${k.title}</h3><p>${k.desc}</p><button class="mini-btn" onclick="toast('Materi ${k.title} siap dikembangkan')">Buka materi →</button></article>`).join('')}
document.getElementById('knowledgeSearch')?.addEventListener('input',renderKnowledge);document.getElementById('knowledgeFilter')?.addEventListener('change',renderKnowledge);renderKnowledge();

const toolModal=document.getElementById('toolModal'),toolContent=document.getElementById('toolModalContent');
function openTool(type){toolModal.classList.add('show');let html='';if(type==='password')html=`<h2>🔐 Password Generator</h2><input id="toolLen" type="number" min="6" max="64" value="18"><div class="tool-actions"><button class="btn btn-primary" onclick="genPass()">Generate</button></div><div class="tool-result" id="toolResult"></div>`;
else if(type==='base64')html=`<h2>🔤 Base64 Encoder / Decoder</h2><textarea id="toolInput" placeholder="Teks..."></textarea><div class="tool-actions"><button class="btn btn-primary" onclick="b64('e')">Encode</button><button class="mini-btn" onclick="b64('d')">Decode</button></div><div class="tool-result" id="toolResult"></div>`;
else if(type==='json')html=`<h2>{ } JSON Formatter</h2><textarea id="toolInput" placeholder='{"hello":"world"}'></textarea><button class="btn btn-primary" onclick="fmtJSON()">Format</button><div class="tool-result" id="toolResult"></div>`;
else if(type==='ip')html=`<h2>🌐 IPv4 Quick Calculator</h2><input id="ipInput" value="192.168.1.10/24"><button class="btn btn-primary" onclick="calcIP()">Calculate</button><div class="tool-result" id="toolResult"></div>`;
else if(type==='hash')html=`<h2># SHA-256</h2><textarea id="toolInput" placeholder="Teks yang akan di-hash"></textarea><button class="btn btn-primary" onclick="hashText()">Hash</button><div class="tool-result" id="toolResult"></div>`;
else if(type==='color')html=`<h2>🎨 Color Picker</h2><input id="colorInput" type="color" value="#6675ff" oninput="document.getElementById('colorValue').textContent=this.value"><div class="tool-result" id="colorValue">#6675ff</div>`;
else if(type==='regex')html=`<h2>.* Regex Tester</h2><input id="regexPattern" placeholder="^XI"><textarea id="regexText" placeholder="Teks..." ></textarea><button class="btn btn-primary" onclick="testRegex()">Test</button><div class="tool-result" id="toolResult"></div>`;
else if(type==='qr')html=`<h2>▦ QR Generator</h2><input id="qrInput" placeholder="https://..." value="XI TKJ 1"><button class="btn btn-primary" onclick="makeQR()">Generate QR</button><div class="tool-result" id="toolResult">QR generator siap. Untuk versi offline penuh, gunakan library QR lokal.</div>`;toolContent.innerHTML=html}
function genPass(){const n=Math.min(64,Math.max(6,Number(document.getElementById('toolLen').value)||18)),c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';let s='';crypto.getRandomValues(new Uint32Array(n)).forEach(v=>s+=c[v%c.length]);document.getElementById('toolResult').textContent=s}
function b64(m){try{const v=document.getElementById('toolInput').value;document.getElementById('toolResult').textContent=m==='e'?btoa(unescape(encodeURIComponent(v))):decodeURIComponent(escape(atob(v)))}catch(e){document.getElementById('toolResult').textContent='Input tidak valid.'}}
function fmtJSON(){try{document.getElementById('toolResult').textContent=JSON.stringify(JSON.parse(document.getElementById('toolInput').value),null,2)}catch(e){document.getElementById('toolResult').textContent='JSON error: '+e.message}}
function calcIP(){const raw=document.getElementById('ipInput').value.trim();const [ip,cidr]=raw.split('/');const p=ip.split('.').map(Number);const n=Number(cidr);if(p.length!==4||p.some(x=>x<0||x>255)||n<0||n>32){document.getElementById('toolResult').textContent='Format IPv4/CIDR tidak valid.';return}const val=p.reduce((a,x)=>(a<<8)+x,0)>>>0;const mask=n===0?0:(0xffffffff<<(32-n))>>>0;const net=(val&mask)>>>0;const bc=(net|(~mask>>>0))>>>0;const fmt=x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255].join('.');document.getElementById('toolResult').textContent=`Network: ${fmt(net)}\nBroadcast: ${fmt(bc)}\nCIDR: /${n}\nUsable hosts: ${n>=31?Math.pow(2,32-n):Math.max(0,Math.pow(2,32-n)-2)}`}
async function hashText(){const data=new TextEncoder().encode(document.getElementById('toolInput').value),buf=await crypto.subtle.digest('SHA-256',data);document.getElementById('toolResult').textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function testRegex(){try{const r=new RegExp(document.getElementById('regexPattern').value,'g'),t=document.getElementById('regexText').value,m=[...t.matchAll(r)].map(x=>x[0]);document.getElementById('toolResult').textContent=`${m.length} match:\n${m.join('\n')}`}catch(e){document.getElementById('toolResult').textContent=e.message}}
function makeQR(){document.getElementById('toolResult').textContent='Isi: '+document.getElementById('qrInput').value+'\nQR module bisa ditambahkan offline tanpa API.'}
window.genPass=genPass;window.b64=b64;window.fmtJSON=fmtJSON;window.calcIP=calcIP;window.hashText=hashText;window.testRegex=testRegex;window.makeQR=makeQR;
document.querySelectorAll('.tool-card').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));document.getElementById('toolClose')?.addEventListener('click',()=>toolModal.classList.remove('show'));toolModal?.addEventListener('click',e=>{if(e.target===toolModal)toolModal.classList.remove('show')});

function updateClock(){const now=new Date();const time=now.toLocaleTimeString('id-ID',{hour12:false});const date=now.toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});const a=document.getElementById('dashboardTime');if(a)a.textContent=time;const b=document.getElementById('liveClock');if(b)b.textContent=time;const c=document.getElementById('dashboardDate');if(c)c.textContent=date}setInterval(updateClock,1000);updateClock();

function getSiteConfig(){try{return JSON.parse(localStorage.getItem('xi-site-config')||'{}')}catch{return {}}}
function saveSiteConfig(x){localStorage.setItem('xi-site-config',JSON.stringify(x))}
function money(n){return 'Rp '+Number(n||0).toLocaleString('id-ID')}
function applySiteConfig(){
 const cfg=getSiteConfig();
 if(cfg.welcome)document.querySelector('.welcome')?.replaceChildren(document.createTextNode(cfg.welcome));
 if(cfg.heroTitle){const h=document.querySelector('.hero-content h1');if(h)h.innerHTML=escapeHTML(cfg.heroTitle).replace(/\s1$/,'')+' <span>1</span>'}
 if(cfg.heroDescription){const el=document.querySelector('.hero-description');if(el)el.textContent=cfg.heroDescription}
 if(cfg.cash){const c=cfg.cash;const bal=document.getElementById('cashBalance'),inc=document.getElementById('cashIncome'),exp=document.getElementById('cashExpense');if(bal)bal.textContent=money(c.balance);if(inc)inc.textContent=money(c.income);if(exp)exp.textContent=money(c.expense)}
 if(Array.isArray(cfg.announcements)){const grid=document.querySelector('#announcements .announcement-grid');if(grid)grid.innerHTML=cfg.announcements.map(a=>`<article class="announcement-card"><div class="announcement-date"><strong>${escapeHTML(a.day||'')}</strong><span>${escapeHTML(a.month||'')}</span></div><div><span class="announcement-label">${escapeHTML(a.label||'INFO')}</span><h3>${escapeHTML(a.title||'')}</h3><p>${escapeHTML(a.desc||'')}</p></div></article>`).join('')}
 if(Array.isArray(cfg.events)){const next=cfg.events.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];if(next){const t=document.getElementById('nextEventTitle'),d=document.getElementById('nextEventDesc');if(t)t.textContent=next.title||'';if(d)d.textContent=next.desc||''}}
 if(Array.isArray(cfg.links)){const grid=document.querySelector('#links .linkhub-grid');if(grid)grid.innerHTML=cfg.links.map(l=>`<a class="linkhub-card" href="${escapeHTML(l.url||'#')}" target="_blank" rel="noopener"><span>LINK</span><div><b>${escapeHTML(l.title||'Link')}</b><small>${escapeHTML(l.desc||'')}</small></div><em>↗</em></a>`).join('')}
}
function getPasswordsForAdmin(nisn){try{const p=JSON.parse(localStorage.getItem('xi-account-passwords')||'{}');const a=(window.__CLASS_ACCOUNTS||[]).find(x=>x.nisn===nisn);return p[nisn]||a?.defaultPassword||''}catch{return ''}}
function adminSaveAccount(nisn,row){const accounts=window.__CLASS_ACCOUNTS||[];const account=accounts.find(x=>x.nisn===nisn);if(!account)return;const profiles=JSON.parse(localStorage.getItem('xi-account-profiles')||'{}');const current=Object.assign({displayName:account.name,username:account.first,bio:'Suka mencoba hal baru dan membangun proyek digital sederhana.',interests:'Desain UI, jaringan, dan eksplorasi teknologi',skills:'Troubleshooting, konfigurasi jaringan, dan dasar coding',motto:''},profiles[nisn]||{});current.displayName=row.querySelector('[data-account-name]')?.value.trim()||account.name;current.username=row.querySelector('[data-account-username]')?.value.trim()||account.first;profiles[nisn]=current;localStorage.setItem('xi-account-profiles',JSON.stringify(profiles));const passwords=JSON.parse(localStorage.getItem('xi-account-passwords')||'{}');const pw=row.querySelector('[data-account-password]')?.value.trim();if(pw)passwords[nisn]=pw;localStorage.setItem('xi-account-passwords',JSON.stringify(passwords));const u=getSessionSafe();if(u?.nisn===nisn){const next=Object.assign({},u,{name:current.displayName,first:current.username});sessionStorage.setItem('xi-account-session',JSON.stringify(next));}renderStudents();toast('Account berhasil diperbarui');}
function getSessionSafe(){try{return JSON.parse(sessionStorage.getItem('xi-account-session')||'null')}catch{return null}}
function adminRender(tab='overview'){
 const c=document.getElementById('adminContent');if(!c)return;const tasks=loadTasks(),cfg=getSiteConfig(),cash=cfg.cash||{balance:850000,income:300000,expense:150000};
 if(tab==='overview')c.innerHTML=`<div class="admin-cards"><div class="admin-mini"><small>Siswa</small><b>${window.__CLASS_ACCOUNTS?.length||36}</b><span>anggota kelas</span></div><div class="admin-mini"><small>Tugas aktif</small><b>${tasks.filter(t=>t.status!=='done').length}</b><span>perlu dipantau</span></div><div class="admin-mini"><small>Saldo kas</small><b>${money(cash.balance)}</b><span>tersimpan lokal</span></div></div><h3 style="margin-top:25px">Kontrol Website</h3><p class="admin-help">Semua perubahan di panel ini disimpan di browser perangkat. Tidak membutuhkan server, bracket, API, atau manifest.</p><div class="task-actions"><button class="btn btn-primary" onclick="adminRender('website')">Atur Website</button><button class="mini-btn" onclick="adminRender('finance')">Atur Kas</button><button class="mini-btn" onclick="adminRender('schedule')">Atur Jadwal</button><button class="mini-btn" onclick="exportClassBackup()">Export backup</button></div>`;
 else if(tab==='website')c.innerHTML=`<h3>Pengaturan Tampilan Website</h3><p class="admin-help">Ubah teks utama yang tampil di halaman depan.</p><div class="admin-form-stack"><label>Teks welcome<input id="cfgWelcome" value="${escapeHTML(cfg.welcome||'WELCOME TO')}"></label><label>Judul utama<input id="cfgTitle" value="${escapeHTML(cfg.heroTitle||'XI TKJ 1')}"></label><label>Deskripsi<textarea id="cfgDesc">${escapeHTML(cfg.heroDescription||'Website digital resmi untuk jadwal, piket, siswa, guru, pengumuman, tugas, dan informasi XI TKJ 1.')}</textarea></label></div><div class="admin-save-row"><button class="btn btn-primary" id="saveWebsiteCfg">Simpan perubahan</button></div>`;
 else if(tab==='attendance'){
  const dateKey=localDateKey(), accounts=window.__CLASS_ACCOUNTS||[], data=getBarcodeAttendanceLocal(dateKey);
  c.innerHTML=`<div class="attendance-hub">
    <div class="attendance-hub-hero"><div><span class="eyebrow">ATTENDANCE CONTROL • XI TKJ 1</span><h3>Absensi <em>Digital</em></h3><p>Tidak ada lagi absensi manual. Admin cukup scan barcode siswa, sementara absensi foto dikirim dari akun siswa.</p></div><div class="attendance-hub-date"><span>HARI INI</span><b>${dateKey}</b></div></div>
    <div class="attendance-method-grid">
      <button class="attendance-method-card" type="button" onclick="openAdminBarcodeScanner()"><span class="method-icon">▦</span><span><b>Scan Barcode</b><small>Catat hadir & buat bukti gambar di Google Drive.</small></span><strong>→</strong></button>
      <button class="attendance-method-card" type="button" onclick="adminRender('face-attendance')"><span class="method-icon">◉</span><span><b>Foto Muka</b><small>Lihat seluruh bukti foto yang masuk dari siswa.</small></span><strong>→</strong></button>
    </div>
    <div class="attendance-live-card"><div><span class="eyebrow">BARCODE LOG</span><h4>Scan hari ini</h4><small>Data yang sudah tercatat di Drive akan muncul di Cek Absensi.</small></div><strong>${Object.keys(data).length}<small>siswa</small></strong></div>
    <div class="attendance-quick-list">${Object.values(data).sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(r=>`<div><span>✓</span><section><b>${escapeHTML(r.name||'Siswa')}</b><small>${escapeHTML(r.time||'Waktu tersimpan')} • Barcode</small></section><em>HADIR</em></div>`).join('')||'<div class="attendance-empty-line">Belum ada scan barcode hari ini.</div>'}</div>
  </div>`;
 }
 else if(tab==='face-attendance'){
  const dateKey=localDateKey(), accounts=window.__CLASS_ACCOUNTS||[], local=getFaceAttendanceLocal(dateKey), barcode=getBarcodeAttendanceLocal(dateKey);
  c.innerHTML=`<div class="face-premium-hero"><div><span class="eyebrow">ATTENDANCE CENTER • XI TKJ 1</span><h3>Cek Absensi <em>Hari Ini</em></h3><p>Absensi barcode dan foto muka sekarang tampil dalam satu daftar yang sinkron langsung dari Google Drive.</p></div><div class="face-premium-date"><span>HARI INI</span><b>${dateKey}</b></div></div>
  <div class="face-admin-summary premium" id="attendanceSummaryCards"><div><span class="summary-icon">✓</span><section><b>0</b><small>Hadir</small></section></div><div><span class="summary-icon">▦</span><section><b>0</b><small>Barcode</small></section></div><div><span class="summary-icon">◌</span><section><b>0</b><small>Belum absen</small></section></div></div>
  <section class="face-admin-card attendance-unified-card"><div class="admin-card-head premium"><div><span>SYNCED ATTENDANCE</span><h4>Rekap Absensi Siswa</h4><small class="pending-subtitle">Status hadir dari barcode + bukti foto dari siswa. Tidak menggunakan Google Sheets.</small></div><button class="mini-btn" id="faceRefreshDrive">↻ <b>Refresh</b></button></div><div id="attendanceUnifiedList" class="attendance-unified-list">${renderUnifiedAttendance(accounts,barcode,local)}</div></section>`;
  c.querySelector('#faceRefreshDrive')?.addEventListener('click',()=>refreshUnifiedAttendance(dateKey,true));
  refreshUnifiedAttendance(dateKey,false);
 }
 else if(tab==='finance')c.innerHTML=`<h3>Kelola Kas Kelas</h3><p class="admin-help">Atur saldo, total pemasukan, dan total pengeluaran. Nilai disimpan lokal.</p><div class="admin-form-grid"><label>Saldo kas<input type="number" id="cashBal" value="${Number(cash.balance||0)}"></label><label>Total pemasukan<input type="number" id="cashInc" value="${Number(cash.income||0)}"></label><label>Total pengeluaran<input type="number" id="cashExp" value="${Number(cash.expense||0)}"></label><label>Catatan kas<input id="cashNote" value="${escapeHTML(cash.note||'Data kas kelas')}"></label></div><div class="admin-save-row"><button class="btn btn-primary" id="saveFinanceCfg">Simpan kas</button></div>`;
 else if(tab==='schedule')c.innerHTML=`<h3>Kelola Jadwal Pelajaran</h3><p class="admin-help">Format satu baris: waktu | mata pelajaran | guru | ruang. Gunakan satu blok per hari.</p><div class="admin-form-stack">${['senin','selasa','rabu','kamis','jumat'].map(day=>`<label>${day[0].toUpperCase()+day.slice(1)}<textarea id="sch_${day}">${escapeHTML((getSchedules()[day]||[]).map(x=>x.join(' | ')).join('\n'))}</textarea></label>`).join('')}</div><div class="admin-save-row"><button class="btn btn-primary" id="saveScheduleCfg">Simpan jadwal</button></div>`;
 else if(tab==='piket')c.innerHTML=`<h3>Kelola Piket</h3><p class="admin-help">Masukkan nama siswa dipisahkan koma.</p><div class="admin-form-grid">${['Senin','Selasa','Rabu','Kamis','Jumat'].map(day=>`<label>${day}<input id="pik_${day}" value="${escapeHTML((getPiketData()[day]||[]).join(', '))}"></label>`).join('')}</div><div class="admin-save-row"><button class="btn btn-primary" id="savePiketCfg">Simpan piket</button></div>`;
 else if(tab==='announcements')c.innerHTML=`<h3>Kelola Pengumuman</h3><p class="admin-help">Isi JSON sederhana. Setiap item memiliki day, month, label, title, desc.</p><textarea id="annCfg" style="width:100%;min-height:260px;box-sizing:border-box">${escapeHTML(JSON.stringify(cfg.announcements||[{day:'10',month:'AGU',label:'INFO KELAS',title:'Selamat datang di website XI TKJ 1!',desc:'Semua informasi kelas akan ditampilkan melalui website ini.'}],null,2))}</textarea><div class="admin-save-row"><button class="btn btn-primary" id="saveAnnCfg">Simpan pengumuman</button></div>`;
 else if(tab==='events')c.innerHTML=`<h3>Kelola Event & Agenda</h3><p class="admin-help">Format tanggal YYYY-MM-DD.</p><textarea id="eventCfg" style="width:100%;min-height:260px;box-sizing:border-box">${escapeHTML(JSON.stringify(cfg.events||[{date:'2026-08-25',title:'Evaluasi Subnetting',type:'Ujian',desc:'Evaluasi konsep IPv4 dan subnetting.'}],null,2))}</textarea><div class="admin-save-row"><button class="btn btn-primary" id="saveEventCfg">Simpan event</button></div>`;
 else if(tab==='links')c.innerHTML=`<h3>Kelola Link Hub</h3><p class="admin-help">Format: title, desc, url.</p><textarea id="linkCfg" style="width:100%;min-height:260px;box-sizing:border-box">${escapeHTML(JSON.stringify(cfg.links||[],null,2))}</textarea><div class="admin-save-row"><button class="btn btn-primary" id="saveLinkCfg">Simpan link</button></div>`;
 else if(tab==='notes')c.innerHTML=`<h3>Catatan Website</h3><p class="admin-help">Catatan pribadi siswa tidak diubah oleh admin. Di sini admin hanya dapat menghapus semua catatan yang tersimpan pada perangkat ini.</p><button class="btn btn-primary" id="clearNotesAdmin">Hapus semua catatan lokal</button>`;
 else if(tab==='files')c.innerHTML=`<h3>File Center</h3><p class="admin-help">Kelola file/link yang tersedia di perangkat ini.</p><button class="btn btn-primary" onclick="document.getElementById('addFileBtn')?.click()">Tambah file/link</button>`;
 else if(tab==='accounts')c.innerHTML=`<h3>Manage Account</h3><p class="admin-help">Admin dapat mengelola seluruh akun siswa: nama profile, username profile, password, foto, dan data profile.</p><div class="admin-account-list">${(window.__CLASS_ACCOUNTS||[]).map((x,i)=>{const profiles=JSON.parse(localStorage.getItem('xi-account-profiles')||'{}');const photos=JSON.parse(localStorage.getItem('xi-account-photos')||'{}');const prof=Object.assign({displayName:x.name,username:x.first,bio:'Suka mencoba hal baru dan membangun proyek digital sederhana.',interests:'Desain UI, jaringan, dan eksplorasi teknologi',skills:'Troubleshooting, konfigurasi jaringan, dan dasar coding'},profiles[x.nisn]||{});return `<article class="admin-account-row" data-account-row="${escapeHTML(x.nisn)}"><div class="admin-account-avatar">${photos[x.nisn]?`<img src="${photos[x.nisn]}" alt="">`:`${escapeHTML((x.name||'XI').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase())}`}</div><div class="admin-account-main"><b>${escapeHTML(x.name)}</b><small>NISN: ${escapeHTML(x.nisn)}</small><div class="admin-account-form"><input data-account-name="${escapeHTML(x.nisn)}" value="${escapeHTML(prof.displayName)}" placeholder="Nama profile"><input data-account-username="${escapeHTML(x.nisn)}" value="${escapeHTML(prof.username)}" placeholder="Username profile"><input data-account-password="${escapeHTML(x.nisn)}" type="text" value="${escapeHTML(getPasswordsForAdmin(x.nisn))}" placeholder="Password baru"></div><div class="task-actions"><button class="mini-btn" data-save-account="${escapeHTML(x.nisn)}">Simpan Perubahan</button><button class="mini-btn danger" data-clear-profile="${escapeHTML(x.nisn)}">Hapus Profile</button></div></div></article>`}).join('')}</div>`;
 else if(tab==='students')c.innerHTML=`<h3>Database siswa XI TKJ 1</h3><p class="admin-help">Login menggunakan NISN dari data nominasi siswa kelas 10.</p><table class="admin-table"><tr><th>#</th><th>Nama</th><th>NISN</th></tr>${(window.__CLASS_ACCOUNTS||[]).map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.nisn)}</td></tr>`).join('')}</table>`;
 else if(tab==='tasks'){const accounts=window.__CLASS_ACCOUNTS||[];c.innerHTML=`<div class="admin-head-row"><div><h3>Kelola Semua Tugas</h3><p style="color:var(--muted)">Tambah dan hapus tugas hanya dari Control Panel admin. Status pengumpulan siswa ada di setiap tugas.</p></div><div class="task-actions"><button class="btn btn-primary" id="adminAddTask">Tambah Tugas</button><button class="mini-btn danger" id="adminDeleteAllTasks">Hapus Semua</button></div></div><div class="admin-task-list">${tasks.map(t=>{const counts={todo:0,doing:0,done:0};accounts.forEach(a=>{counts[studentTaskStatus(t.id,a.nisn)]++});return `<article class="admin-task-row"><div><b>${escapeHTML(t.title)}</b><small>${escapeHTML(t.subject)} • Deadline ${escapeHTML(t.deadline)}</small><span class="admin-task-status">${escapeHTML(t.status)}</span><div class="admin-task-submission-summary"><span class="submission-badge red">Belum: ${counts.todo}</span><span class="submission-badge yellow">Mengerjakan: ${counts.doing}</span><span class="submission-badge green">Sudah: ${counts.done}</span></div><div class="admin-task-submission-detail" id="submissionDetail-${t.id}"><table><tbody>${accounts.map(a=>{const st=studentTaskStatus(t.id,a.nisn);const label=st==='done'?'Sudah Mengerjakan':st==='doing'?'Masih Mengerjakan':'Belum Mengerjakan';const cls=st==='done'?'green':st==='doing'?'yellow':'red';return `<tr><td><b>${escapeHTML(a.name)}</b><br><small>${escapeHTML(a.nisn)}</small></td><td><span class="submission-badge ${cls}">${label}</span></td><td><button class="mini-btn" data-set-submission="${t.id}" data-nisn="${escapeHTML(a.nisn)}">Ubah</button></td></tr>`}).join('')}</tbody></table></div></div><div class="task-actions"><button class="mini-btn" data-toggle-submissions="${t.id}">Lihat Pengumpulan</button><button class="mini-btn danger" data-delete-admin-task="${t.id}">Hapus</button></div></article>`}).join('')||'<div class="empty-state">Belum ada tugas.</div>'}</div>`;document.getElementById('adminAddTask')?.addEventListener('click',adminAddTask);document.getElementById('adminDeleteAllTasks')?.addEventListener('click',async()=>{if(await openTaskConfirm({title:'Hapus Semua Tugas?',hint:'Semua tugas dan data pengumpulannya akan dihapus. Ini tidak dapat dibatalkan.'})){saveTasks([]);saveTaskSubmissions({});renderTasks();adminRender('tasks');toast('Semua tugas dihapus')}});c.querySelectorAll('[data-toggle-submissions]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('submissionDetail-'+b.dataset.toggleSubmissions)?.classList.toggle('show')}));c.querySelectorAll('[data-set-submission]').forEach(b=>b.addEventListener('click',()=>{const id=Number(b.dataset.setSubmission),nisn=b.dataset.nisn,cur=studentTaskStatus(id,nisn),next=cur==='todo'?'doing':cur==='doing'?'done':'todo';setStudentTaskStatus(id,nisn,next);adminRender('tasks');renderTasks()}));c.querySelectorAll('[data-cycle-admin-task]').forEach(b=>b.addEventListener('click',()=>{cycleTask(Number(b.dataset.cycleAdminTask));adminRender('tasks')}));c.querySelectorAll('[data-delete-admin-task]').forEach(b=>b.addEventListener('click',async()=>{await deleteTask(Number(b.dataset.deleteAdminTask))}));}
 else if(tab==='materials'){c.innerHTML=`<div class="admin-head-row"><div><h3>Kelola Materi</h3></div><button class="btn btn-primary" id="adminAddMaterial">Tambah Materi</button></div><div class="admin-material-list">${knowledge.map(m=>`<article class="admin-material-row"><span>MAT</span><div><b>${escapeHTML(m.title)}</b><small>${escapeHTML(m.tag||m.cat)}</small><p>${escapeHTML(m.desc||'')}</p></div><button class="mini-btn danger" data-del-material="${escapeHTML(m.id)}">Hapus</button></article>`).join('')}</div>`;document.getElementById('adminAddMaterial')?.addEventListener('click',adminAddMaterial);c.querySelectorAll('[data-del-material]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Hapus materi ini?'))return;knowledge=knowledge.filter(x=>x.id!==b.dataset.delMaterial);saveKnowledge();renderKnowledge();adminRender('materials');toast('Materi dihapus')}));}
 else if(tab==='settings')c.innerHTML=`<h3>Pengaturan Sistem Lokal</h3><p class="admin-help">Semua data hanya tersimpan pada browser/perangkat yang digunakan. Tidak ada bracket atau server.</p><div class="admin-save-row"><button class="mini-btn danger" id="resetLocalData">Reset semua data website</button><button class="mini-btn" onclick="exportClassBackup()">Export backup</button></div>`;
 bindAdminConfigButtons();
}
function getSchedules(){try{return JSON.parse(localStorage.getItem('xi-schedules')||'null')||schedules}catch{return schedules}}
function saveSchedules(x){localStorage.setItem('xi-schedules',JSON.stringify(x))}
function getPiketData(){try{return JSON.parse(localStorage.getItem('xi-piket')||'null')||piketData}catch{return piketData}}
function savePiketData(x){localStorage.setItem('xi-piket',JSON.stringify(x))}
function bindAdminConfigButtons(){
 document.getElementById('saveWebsiteCfg')?.addEventListener('click',()=>{const cfg=getSiteConfig();cfg.welcome=document.getElementById('cfgWelcome').value;cfg.heroTitle=document.getElementById('cfgTitle').value;cfg.heroDescription=document.getElementById('cfgDesc').value;saveSiteConfig(cfg);applySiteConfig();toast('Website diperbarui')});
 document.getElementById('saveFinanceCfg')?.addEventListener('click',()=>{const cfg=getSiteConfig();cfg.cash={balance:+document.getElementById('cashBal').value||0,income:+document.getElementById('cashInc').value||0,expense:+document.getElementById('cashExp').value||0,note:document.getElementById('cashNote').value};saveSiteConfig(cfg);applySiteConfig();toast('Kas diperbarui')});
 document.getElementById('saveScheduleCfg')?.addEventListener('click',()=>{const out={};['senin','selasa','rabu','kamis','jumat'].forEach(day=>{out[day]=document.getElementById('sch_'+day).value.split('\n').map(x=>x.split('|').map(y=>y.trim())).filter(x=>x[0])});saveSchedules(out);renderSchedule(document.querySelector('.day-button.active')?.dataset.day||'senin');toast('Jadwal diperbarui')});
 document.getElementById('savePiketCfg')?.addEventListener('click',()=>{const out={};['Senin','Selasa','Rabu','Kamis','Jumat'].forEach(day=>out[day]=document.getElementById('pik_'+day).value.split(',').map(x=>x.trim()).filter(Boolean));savePiketData(out);Object.keys(piketData).forEach(k=>delete piketData[k]);Object.assign(piketData,out);renderPiket();toast('Piket diperbarui')});
 document.getElementById('saveAnnCfg')?.addEventListener('click',()=>{try{const cfg=getSiteConfig();cfg.announcements=JSON.parse(document.getElementById('annCfg').value);saveSiteConfig(cfg);applySiteConfig();toast('Pengumuman diperbarui')}catch{toast('Format pengumuman tidak valid')}});
 document.getElementById('saveEventCfg')?.addEventListener('click',()=>{try{const cfg=getSiteConfig();cfg.events=JSON.parse(document.getElementById('eventCfg').value);saveSiteConfig(cfg);applySiteConfig();toast('Event diperbarui')}catch{toast('Format event tidak valid')}});
 document.getElementById('saveLinkCfg')?.addEventListener('click',()=>{try{const cfg=getSiteConfig();cfg.links=JSON.parse(document.getElementById('linkCfg').value);saveSiteConfig(cfg);applySiteConfig();toast('Link diperbarui')}catch{toast('Format link tidak valid')}});
 document.getElementById('clearNotesAdmin')?.addEventListener('click',()=>{if(confirm('Hapus semua catatan lokal?')){localStorage.removeItem('xi-tkj1-notes-v2');toast('Catatan lokal dihapus')}});
 const adminContent=document.getElementById('adminContent');adminContent?.querySelectorAll('[data-save-account]').forEach(btn=>btn.addEventListener('click',()=>{const row=btn.closest('[data-account-row]');adminSaveAccount(btn.dataset.saveAccount,row);adminRender('accounts')}));
 adminContent?.querySelectorAll('[data-clear-profile]').forEach(btn=>btn.addEventListener('click',()=>{const nisn=btn.dataset.clearProfile;if(!confirm('Hapus semua data profile akun ini?'))return;const profiles=JSON.parse(localStorage.getItem('xi-account-profiles')||'{}');delete profiles[nisn];localStorage.setItem('xi-account-profiles',JSON.stringify(profiles));const photos=JSON.parse(localStorage.getItem('xi-account-photos')||'{}');delete photos[nisn];localStorage.setItem('xi-account-photos',JSON.stringify(photos));renderStudents();adminRender('accounts');toast('Profile akun dihapus')}));
 document.getElementById('resetLocalData')?.addEventListener('click',()=>{if(confirm('Reset seluruh data website di perangkat ini?')){['xi-site-config','xi-schedules','xi-piket','xi-pro-tasks','xi-local-materials','xi-files','xi-tkj1-notes-v2','xi-account-passwords','xi-account-photos','xi-account-profiles'].forEach(k=>localStorage.removeItem(k));location.reload()}});
}
let taskModalResolve=null;
function openTaskInput({title,hint,textarea=false,placeholder=''}){return new Promise(resolve=>{const modal=document.getElementById('taskInputModal');const titleEl=document.getElementById('taskInputTitle');const hintEl=document.getElementById('taskInputHint');const input=document.getElementById('taskInputField');const area=document.getElementById('taskTextareaField');const ok=document.getElementById('taskInputOk');const cancel=document.getElementById('taskInputCancel');if(!modal)return resolve(null);titleEl.textContent=title;hintEl.textContent=hint||'';input.hidden=textarea;area.hidden=!textarea;(textarea?area:input).value='';(textarea?area:input).placeholder=placeholder||'';modal.classList.add('show');modal.setAttribute('aria-hidden','false');(textarea?area:input).focus();taskModalResolve=resolve;const finish=v=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true');taskModalResolve=null;ok.onclick=null;cancel.onclick=null;resolve(v)};ok.onclick=()=>finish((textarea?area:input).value.trim());cancel.onclick=()=>finish(null);});}
function openTaskConfirm({title='Hapus Tugas?',hint='Apakah kamu yakin?',yesText='Ya',noText='Tidak'}){return new Promise(resolve=>{const modal=document.getElementById('taskInputModal');const titleEl=document.getElementById('taskInputTitle');const hintEl=document.getElementById('taskInputHint');const input=document.getElementById('taskInputField');const area=document.getElementById('taskTextareaField');const ok=document.getElementById('taskInputOk');const cancel=document.getElementById('taskInputCancel');if(!modal)return resolve(false);titleEl.textContent=title;hintEl.textContent=hint;input.hidden=true;area.hidden=true;input.value='';area.value='';ok.textContent=yesText;cancel.textContent=noText;modal.classList.add('show');modal.setAttribute('aria-hidden','false');const finish=v=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true');ok.textContent='Oke';cancel.textContent='Batal';ok.onclick=null;cancel.onclick=null;resolve(v)};ok.onclick=()=>finish(true);cancel.onclick=()=>finish(false);});}
async function adminAddTask(){if(getSessionSafe()?.role!=='admin')return toast('Hanya admin yang dapat menambah tugas.');const title=await openTaskInput({title:'Nama Tugas?',hint:'Masukkan nama tugas yang akan diberikan.',placeholder:'Nama tugas...'});if(!title)return;const desc=await openTaskInput({title:'Tugasnya',hint:'Tulis isi atau instruksi tugas di kolom berikut.',textarea:true,placeholder:'Isi tugas...'});if(!desc)return;const a=loadTasks();a.push({id:Date.now(),title,subject:'Umum',deadline:new Date().toISOString().slice(0,10),status:'todo',desc});saveTasks(a);renderTasks();adminRender('tasks');toast('Tugas berhasil ditambahkan')}
window.adminAddTask=adminAddTask;
function adminAddMaterial(){const title=prompt('Judul materi?');if(!title)return;const cats={linux:'Linux',network:'Jaringan',coding:'Coding',security:'Security',database:'Database'};const cat=prompt('Kategori: linux / network / coding / security / database','linux')||'linux';const desc=prompt('Deskripsi singkat?')||'';const content=prompt('Isi materi?')||'';if(!content)return;knowledge.push({id:'local-'+Date.now(),title,cat,tag:cats[cat]||cat,icon:cat==='linux'?'🐧':cat==='network'?'🌐':cat==='coding'?'💻':cat==='security'?'🛡️':'🗄️',desc,content});saveKnowledge();renderKnowledge();adminRender('materials');toast('Materi berhasil ditambahkan')}
window.adminRender=adminRender;window.adminAddMaterial=adminAddMaterial;
document.querySelectorAll('.admin-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');adminRender(b.dataset.admin)}));adminRender();

/* ===== ADMIN CONTROL PANEL ===== */
const adminPortal=document.getElementById('adminPortal');function openAdminPortal(){adminPortal?.classList.add('show');adminPortal?.setAttribute('aria-hidden','false');adminRender('overview')}function closeAdminPortal(){adminPortal?.classList.remove('show');adminPortal?.setAttribute('aria-hidden','true')}document.getElementById('adminPortalClose')?.addEventListener('click',closeAdminPortal);adminPortal?.addEventListener('click',e=>{if(e.target===adminPortal)closeAdminPortal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAdminPortal()});

/* ===== XI TKJ 1 ULTIMATE CLASS FEATURES ===== */
const CLASS_EVENTS=getSiteConfig().events||[
  {date:'2026-08-12',title:'Praktik Mikrotik',type:'Praktik',desc:'Konfigurasi dasar router dan jaringan.'},
  {date:'2026-08-13',title:'Deadline VLAN & Trunk',type:'Tugas',desc:'Pengumpulan konfigurasi VLAN.'},
  {date:'2026-08-14',title:'Quiz Subnetting',type:'Quiz',desc:'Latihan subnetting IPv4.'},
  {date:'2026-08-16',title:'Project Landing Page',type:'Project',desc:'Presentasi project web kelas.'}
];
function localDateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
let calDate=new Date();
function renderCalendar(){
 const grid=document.getElementById('calendarGrid'); if(!grid)return;
 const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);
 const title=document.getElementById('calTitle'); if(title)title.textContent=new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric'}).format(calDate);
 const start=first.getDay(),days=last.getDate(); let h='';
 for(let i=0;i<start;i++)h+='<span class="cal-empty"></span>';
 for(let d=1;d<=days;d++){const key=localDateKey(new Date(y,m,d));const ev=CLASS_EVENTS.find(e=>e.date===key);const today=key===localDateKey(new Date());h+=`<button class="cal-day ${today?'today':''} ${ev?'has-event':''}" data-date="${key}"><b>${d}</b>${ev?'<i></i>':''}</button>`}
 grid.innerHTML=h;
 grid.querySelectorAll('.cal-day').forEach(b=>b.addEventListener('click',()=>{const ev=CLASS_EVENTS.filter(e=>e.date===b.dataset.date);const list=document.getElementById('agendaList');if(list&&ev.length)list.innerHTML=ev.map(e=>`<article class="agenda-item"><b>${escapeHTML(e.title)}</b><span>${escapeHTML(e.type)}</span><p>${escapeHTML(e.desc)}</p></article>`).join('');else if(list)list.innerHTML='<div class="empty-state">Tidak ada agenda pada tanggal ini.</div>'}));
 renderAgenda();
}
function renderAgenda(){
 const list=document.getElementById('agendaList');if(!list)return;
 const now=localDateKey(new Date());const upcoming=CLASS_EVENTS.filter(e=>e.date>=now).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
 list.innerHTML=upcoming.map(e=>`<article class="agenda-item"><div><b>${escapeHTML(e.title)}</b><p>${escapeHTML(e.desc)}</p></div><span>${new Date(e.date+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</span></article>`).join('')||'<div class="empty-state">Belum ada agenda.</div>';
 const c=document.getElementById('agendaCount');if(c)c.textContent=upcoming.length+' agenda';
}
document.getElementById('calPrev')?.addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar()});
document.getElementById('calNext')?.addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar()});
renderCalendar();


const defaultCode={html:`<main><h1>XI TKJ 1</h1><p>Halo dari Code Lab 🚀</p><button onclick="document.body.style.background='#111827'">Klik aku</button></main>`,css:`body{font-family:Arial;padding:30px;background:#0b1020;color:white}h1{color:#7c8cff}`,js:`console.log('Hello XI TKJ 1');`};
function runCode(){
 const h=document.getElementById('codeHtml')?.value||'',c=document.getElementById('codeCss')?.value||'',j=document.getElementById('codeJs')?.value||'';
 const frame=document.getElementById('codePreview');if(!frame)return;
 frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><style>${c.replace(/<\/style/gi,'<\\/style')}</style></head><body>${h}<script>${j.replace(/<\/script/gi,'<\\/script')}<\/script></body></html>`;
 const st=document.getElementById('codeStatus');if(st)st.textContent='Running';
 localStorage.setItem('xi-code-lab',JSON.stringify({h,c,j}));
 setTimeout(()=>{if(st)st.textContent='Selesai'},300);
}
function resetCode(){document.getElementById('codeHtml').value=defaultCode.html;document.getElementById('codeCss').value=defaultCode.css;document.getElementById('codeJs').value=defaultCode.js;runCode()}
document.getElementById('codeRun')?.addEventListener('click',runCode);document.getElementById('codeReset')?.addEventListener('click',resetCode);
try{const saved=JSON.parse(localStorage.getItem('xi-code-lab'));if(saved){document.getElementById('codeHtml').value=saved.h;document.getElementById('codeCss').value=saved.c;document.getElementById('codeJs').value=saved.j}}catch{}
runCode();

/* File Center */
const DEFAULT_FILES=[
 {id:1,title:'Modul Jaringan Dasar',type:'PDF / Modul',url:'',icon:'📘'},
 {id:2,title:'Kisi-kisi Administrasi Jaringan',type:'Dokumen',url:'',icon:'🗂️'},
 {id:3,title:'Google Drive Kelas',type:'Link',url:'',icon:'☁️'}
];
function loadFiles(){try{return JSON.parse(localStorage.getItem('xi-files'))||DEFAULT_FILES}catch{return DEFAULT_FILES}}
function saveFiles(x){localStorage.setItem('xi-files',JSON.stringify(x))}
function renderFiles(){
 const grid=document.getElementById('fileGrid');if(!grid)return;
 const q=(document.getElementById('fileSearch').value||'').toLowerCase();
 const rows=loadFiles().filter(f=>`${f.title} ${f.type}`.toLowerCase().includes(q));
 grid.innerHTML=rows.map(f=>{
   const action=f.url
     ? `<a class="mini-btn" target="_blank" rel="noopener" href="${escapeHTML(f.url)}">Buka</a>`
     : `<button class="mini-btn" onclick="toast('Tambahkan URL melalui tombol Tambah File/Link.')">Siapkan</button>`;
   return `<article class="file-card"><div class="file-icon">${f.icon||'📄'}</div><div><span>${escapeHTML(f.type)}</span><h3>${escapeHTML(f.title)}</h3><p>${f.url?'Tersedia sebagai link.':'Belum ada URL/file yang dipasang.'}</p></div><div class="file-actions">${action}</div></article>`;
 }).join('')||'<div class="empty-state">File tidak ditemukan.</div>';
}
async function addFile(){
 const title=await openTaskInput({title:'Tambah File / Link',hint:'Masukkan nama file atau materi yang ingin ditambahkan.',placeholder:'Nama file / materi...'});
 if(!title)return;
 const type=await openTaskInput({title:'Jenis File',hint:'Contoh: PDF, Modul, Dokumen, Link.',placeholder:'PDF / Modul / Link'});
 if(!type)return;
 const url=await openTaskInput({title:'Alamat File / Google Drive',hint:'Masukkan URL jika file berada di Google Drive atau website lain. Boleh dikosongkan.',placeholder:'https://...'});
 const a=loadFiles();
 a.push({id:Date.now(),title,type,url:url||'',icon:url?'🔗':'📄'});
 saveFiles(a);renderFiles();toast('File/link berhasil ditambahkan');
}
document.getElementById('fileSearch')?.addEventListener('input',renderFiles);document.getElementById('addFileBtn')?.addEventListener('click',addFile);renderFiles();window.addFile=addFile;

/* Notification Center */
function buildNotifications(){
 const tasks=loadTasks().filter(t=>t.status!=='done').slice(0,4);
 const items=[
  {icon:'📢',title:'Website kelas aktif',text:'Selamat datang di pusat aktivitas website XI TKJ 1.',time:'Terbaru'},
  ...tasks.map(t=>({icon:'📝',title:`Tugas: ${t.title}`,text:`Deadline ${t.deadline} · ${t.subject}`,time:'Tugas'})),
  ...CLASS_EVENTS.slice(0,3).map(e=>({icon:'📅',title:e.title,text:e.desc,time:e.date}))
 ];
 const list=document.getElementById('notificationList');if(!list)return;
 list.innerHTML=items.map((n,i)=>`<article class="notification-item ${i<3?'unread':''}"><div class="notification-icon">${n.icon}</div><div><b>${escapeHTML(n.title)}</b><p>${escapeHTML(n.text)}</p></div><span>${escapeHTML(n.time)}</span></article>`).join('');
 const unread=items.length?Math.min(9,items.filter((_,i)=>i<3).length):0;
 const count=document.getElementById('notificationCount');if(count)count.textContent=unread;
}
document.getElementById('notificationButton')?.addEventListener('click',()=>document.getElementById('notifications')?.scrollIntoView({behavior:'smooth'}));
document.getElementById('markNotifications')?.addEventListener('click',()=>{document.querySelectorAll('.notification-item.unread').forEach(x=>x.classList.remove('unread'));const c=document.getElementById('notificationCount');if(c)c.textContent='0';toast('Semua notifikasi ditandai dibaca')});
buildNotifications();

function exportClassBackup(){
 const payload={tasks:loadTasks(),files:loadFiles(),quiz:localStorage.getItem('xi-last-quiz'),code:localStorage.getItem('xi-code-lab'),exportedAt:new Date().toISOString()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='XI-TKJ-1-backup.json';a.click();URL.revokeObjectURL(url);toast('Backup JSON dibuat');
}
window.exportClassBackup=exportClassBackup;



/* ===== LOCAL ACCOUNT / LOGIN (NO BACKEND) ===== */
(()=>{
 const ACCOUNTS=[
  ['ACH. YUDI CAHYONO','0091774774','Yudi','L'],['ALFI ROISATUL FALIA','0097925888','Alfi','P'],['Alvino Adityas Pratama Putra','0091525445','Alvino','L'],['ALYA NUR FADILAH','0095732347','Alya','P'],['ARINGGA RHEZA PRATAMA','0101780156','Aringga','L'],['AURELIA SIVA AYASHA','0093550534','Aurelia','P'],['AZKYA VIORENTINA FARADITA','0095686817','Azkya','P'],['Cika Ul Umaha','0095557364','Cika','P'],['DESVITA AYU SANIA','0094960010','Desvita','P'],['DINA OKTAVIANA','0094835451','Dina','P'],['ELIS NURDIYANA PUTRI','0106224279','Elis','P'],['ENISA VITA AGUSTIN','0105791283','Enisa','P'],['FERISKA AULIA MAYDA','0093826240','Feriska','P'],['FITA DWI ANGGRAINI','0161051203','Fita','P'],['INES AFINA RAHMA','0108976321','Ines','P'],['IRFAN WAHYU PRASETIO','0099472761','Irfan','L'],['KHARIZMA AIYA ANATASYA','0101262104','Kharizma','P'],['KIRANIA PUTRI SHAHANAZ','3106697354','Kirania','P'],['Lucky Akbar Al Fitroh','0091978972','Lucky','L'],['MARSYA AUFA NUR SALSABILA','0104760053','Marsya','P'],['MIFTAKHUL HUDA','0105926410','Miftakhul','L'],['MOH DZUL FIQRI ALBAQI BILLAH','0098892051','Dzul','L'],['MOHAMAD INDRA SUWARDANA PUTRA','0097925673','Indra','L'],['MUHAMAD FARHAN DAFFA','0102581747','Farhan','L'],['MUHAMMAD EZAR MAULANA MALIK','3097578041','Ezar','L'],['MUHAMMAD IMAM VAHRURROZI','3097880104','Imam','L'],['NAILLA NASWA DZAHABIYYAH','0098726453','Nailla','P'],['NENENG ANJARWATI','3099388755','Neneng','P'],['NOVAL DWI ALVINO','3094264029','Noval','L'],["NURISSA'DIYAH IKA FADLIANA",'0095716700','Nurissa','P'],['PUTRI RIDIA ARTIKA SARI','0104859909','Putri','P'],['REYHANA ZEMA ZAHIRA','0095175779','Reyhana','P'],['RISMA FITRI AMELIA','3092616273','Risma','P'],['SAVIRA AULIA DIAS AVRIA','3097497620','Savira','P'],['SHELA FEBRIYANTI','0085567595','Shela','P'],['VEGA AULIA RENATA','0097658461','Vega','P']
 ].map(([name,nisn,first,gender],i)=>({id:i+1,name,nisn,first,gender,defaultPassword:first+'123'}));
 const ADMIN={username:'admin',password:'Admin2705',name:'Admin XI TKJ 1'};
 const modal=document.getElementById('accountModal'), guest=document.getElementById('accountGuestView'), profile=document.getElementById('accountProfileView');
 const topPill=document.getElementById('accountShortcut');
 const sessionKey='xi-account-session', passKey='xi-account-passwords', photoKey='xi-account-photos', profileKey='xi-account-profiles';
 // Session dibuat tahan reload supaya tombol Account selalu membuka PROFILE setelah login.
 const getSession=()=>{
   try{
     const live=sessionStorage.getItem(sessionKey);
     if(live){const u=JSON.parse(live); if(u){return u}}
     const saved=localStorage.getItem(sessionKey);
     if(saved){const u=JSON.parse(saved); if(u){sessionStorage.setItem(sessionKey,JSON.stringify(u));return u}}
   }catch(_){}
   return null;
 };
 const setSession=u=>{
   const value=JSON.stringify(u);
   sessionStorage.setItem(sessionKey,value);
   localStorage.setItem(sessionKey,value);
   syncAdminMenu();if(typeof syncFaceAttendanceMenu==='function')syncFaceAttendanceMenu();window.dispatchEvent(new CustomEvent('xi-session-changed'));
 };
 const getPasswords=()=>JSON.parse(localStorage.getItem(passKey)||'{}');
 const getPhotos=()=>JSON.parse(localStorage.getItem(photoKey)||'{}');
 const adminMenu=document.getElementById('adminControlLink');
 function syncAdminMenu(){const u=getSession();if(adminMenu)adminMenu.hidden=!(u&&u.role==='admin');if(typeof syncFaceAttendanceMenu==='function')syncFaceAttendanceMenu();}
 function initials(n){return n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'XI'}
 function openAccount(){
  renderAccount();
  if(!modal)return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('account-modal-open');
  document.body.classList.add('account-modal-open');
 }
 function closeAccount(){
  if(!modal)return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('account-modal-open');
  document.body.classList.remove('account-modal-open');
 }
 function updateMobileAccount(u){const label=document.getElementById('mobileAccountLabel');const link=document.getElementById('mobileAccountLink');const img=document.getElementById('mobileAccountAvatar'),fallback=document.getElementById('mobileAccountAvatarFallback');if(label)label.textContent=u?(u.name):'Account / Login';if(link)link.title=u?('Akun: '+u.name):'Account / Login';if(!u){if(img)img.hidden=true;if(fallback){fallback.hidden=false;fallback.textContent='A'}return}const photos=getPhotos();if(photos[u.key]){if(img){img.hidden=false;img.src=photos[u.key]}if(fallback)fallback.hidden=true}else{if(img)img.hidden=true;if(fallback){fallback.hidden=false;fallback.textContent=initials(u.name)}}}
 function getProfiles(){try{return JSON.parse(localStorage.getItem(profileKey)||'{}')}catch{return {}}}
 function getProfile(u){const p=getProfiles();const key=u?.role==='admin'?'admin':u?.nisn;const defaults=u?.role==='admin'?{displayName:u?.name||'Admin XI TKJ 1',username:u?.username||'admin',bio:'Administrator website XI TKJ 1.',interests:'Pengelolaan website, data kelas, dan sistem informasi',skills:'Administrasi website, manajemen data, dan maintenance',achievement:'Mengelola sistem kelas',goal:'Menjaga website tetap rapi dan berjalan baik',favoriteSubject:'Administrasi Sistem',motto:'Kelola dengan rapi, layani dengan baik',status:'Aktif'}:{displayName:u?.name||'',username:u?.first||'',bio:'Suka mencoba hal baru dan membangun proyek digital sederhana.',interests:'Desain UI, jaringan, dan eksplorasi teknologi',skills:'Troubleshooting, konfigurasi jaringan, dan dasar coding',achievement:'Belum ada data',goal:'Mengembangkan kemampuan TKJ',favoriteSubject:'Teknik Komputer & Jaringan',motto:'',status:'Aktif'};return Object.assign(defaults,p[key]||{})}
 function saveProfile(u,data){const p=getProfiles();p[u.role==='admin'?'admin':u.nisn]=data;localStorage.setItem(profileKey,JSON.stringify(p))}
 function syncStudentOnlySections(){
 const u=getSession();
 const hideStudent=!!u&&u.role==='student';
 ['calendar','events'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=hideStudent?'none':''});
}
function renderAccount(){
 const u=getSession();syncStudentOnlySections();syncAdminMenu();
 if(!u){guest.hidden=false;profile.hidden=true;updateMobileAccount(null);guestTop();return}
 const prof=getProfile(u),isAdmin=u.role==='admin';
 const displayName=prof.displayName||u.name||'Akun';
 guest.hidden=true;profile.hidden=false;
 const setText=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
 setText('profileName',displayName);setText('profileName2',displayName);
 setText('profileRole',isAdmin?'ADMIN • CONTROL PANEL':'SISWA • XI TKJ 1');
 setText('profileNisn',isAdmin?'Username: '+(prof.username||'admin'):'NISN: '+u.nisn);
 setText('profileLoginValue',isAdmin?(prof.username||'admin'):(prof.username||u.first||'NISN'));
 setText('profileLoginLabel',isAdmin?'Username':'Login');
 setText('profileRoleValue',isAdmin?'Administrator':'Siswa');setText('profileStatusValue',prof.status||'Aktif');
 setText('profileFeatureRole',isAdmin?'Administrator':'Siswa');setText('profileFeatureRoleSub',isAdmin?'Control Panel':'XI TKJ 1');
 setText('profileFeatureId',isAdmin?(prof.username||'admin'):u.nisn);setText('profileFeatureIdSub',isAdmin?'Username admin':'NISN siswa');
 setText('profileFeatureStatus',prof.status||'Aktif');setText('profileFeatureData','Lokal');
 setText('profileEditorHint',isAdmin?'Edit data profil administrator setelah login.':'Edit data profil siswa setelah login.');
 const photos=getPhotos(),img=document.getElementById('profileAvatarImg'),fallback=document.getElementById('profileAvatarFallback');
 if(photos[u.key]){img.hidden=false;fallback.hidden=true;img.src=photos[u.key]}else{img.hidden=true;fallback.hidden=false;fallback.textContent=initials(displayName)}
 const values={profileNameInput:displayName,profileUsernameInput:prof.username||u.first||'',profileBioInput:prof.bio||'',profileInterestsInput:prof.interests||'',profileSkillsInput:prof.skills||''};
 Object.entries(values).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.value=val});
 if(topPill){topPill.querySelector('b').textContent=displayName;topPill.title='Akun: '+displayName;const topImg=document.getElementById('topAvatarImg'),topFallback=document.getElementById('topAvatarFallback');if(photos[u.key]){topImg.hidden=false;topFallback.hidden=true;topImg.src=photos[u.key]}else{topImg.hidden=true;topFallback.hidden=false;topFallback.textContent=initials(displayName)}}
 updateMobileAccount(Object.assign({},u,{name:displayName}));renderStudents()
}
 window.addEventListener('xi-force-account-refresh',renderAccount);
function syncAccountBio(){const u=getSession();if(!u||u.role!=='student')return;const prof=getProfile(u);const bioEl=document.getElementById('accountBio'),input=document.getElementById('accountBioInput');if(bioEl)bioEl.textContent=prof.bio||'Belum ada bio.';if(input)input.value=prof.bio||'';}
 function guestTop(){syncAdminMenu();updateMobileAccount(null);if(topPill){topPill.querySelector('b').textContent='Account';topPill.title='Account / Login';const topImg=document.getElementById('topAvatarImg'),topFallback=document.getElementById('topAvatarFallback');if(topImg)topImg.hidden=true;if(topFallback){topFallback.hidden=false;topFallback.textContent='AC'}}}
 document.querySelectorAll('[data-open-account]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();mobileMenu?.classList.remove('show');openAccount()}));
 topPill?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openAccount()});
 document.getElementById('accountModalClose')?.addEventListener('click',e=>{e.preventDefault();closeAccount()});
 modal?.addEventListener('click',e=>{if(e.target===modal)closeAccount()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('show'))closeAccount()});
 document.querySelectorAll('[data-auth-modal-view]').forEach(b=>b.addEventListener('click',()=>{
   const shell=document.getElementById('accountGuestView');
   const mode=b.dataset.authModalView==='admin'?'admin':'student';
   const current=shell?.dataset.loginMode||'student';
   if(!shell||current===mode)return;
   shell.classList.add('login-transitioning');
   document.querySelectorAll('[data-auth-modal-view]').forEach(x=>x.classList.toggle('active',x===b));
   shell.classList.toggle('admin-mode',mode==='admin');
   shell.classList.toggle('student-mode',mode==='student');
   shell.dataset.loginMode=mode;
   document.documentElement.style.setProperty('--login-mode',mode);
   // Change form near the middle of the physical exchange, not before it starts.
   window.setTimeout(()=>{
     document.querySelectorAll('.modal-login-view').forEach(x=>x.classList.remove('active'));
     document.getElementById(mode==='student'?'studentModalAuth':'adminModalAuth')?.classList.add('active');
   },460);
   window.setTimeout(()=>shell.classList.remove('login-transitioning'),980);
 }));
 document.getElementById('studentLoginForm')?.addEventListener('submit',e=>{e.preventDefault();const nisn=document.getElementById('studentUsername').value.trim();const pw=document.getElementById('studentPassword').value;const err=document.getElementById('studentLoginError');const u=ACCOUNTS.find(x=>x.nisn===nisn);const stored=getPasswords();if(!u){err.textContent='NISN tidak ditemukan di data XI TKJ 1.';return}if((stored[u.nisn]||u.defaultPassword)!==pw){err.textContent='Password salah.';return}err.textContent='';setSession({role:'student',key:u.nisn,name:u.name,nisn:u.nisn,first:u.first});document.getElementById('studentLoginForm').reset();renderAccount();closeAccount();welcomeToast('Welcome Di Website XI TKJ 1 '+u.name)});
 document.getElementById('adminLoginForm')?.addEventListener('submit',e=>{e.preventDefault();const un=document.getElementById('adminUsername').value.trim(),pw=document.getElementById('adminPassword').value,err=document.getElementById('adminLoginError');if(un!==ADMIN.username||pw!==ADMIN.password){err.textContent='Username atau password admin salah.';return}err.textContent='';setSession({role:'admin',key:'admin',name:ADMIN.name});document.getElementById('adminLoginForm').reset();renderAccount();closeAccount();welcomeToast('Welcome Di Website XI TKJ 1 '+ADMIN.name)});
 document.getElementById('accountLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(sessionKey);localStorage.removeItem(sessionKey);syncAdminMenu();if(typeof syncFaceAttendanceMenu==='function')syncFaceAttendanceMenu();window.dispatchEvent(new CustomEvent('xi-session-changed'));renderAccount();guestTop();closeAccount();closeAdminPortal();toast('Sesi ditutup.')});document.getElementById('adminLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(sessionKey);localStorage.removeItem(sessionKey);syncAdminMenu();if(typeof syncFaceAttendanceMenu==='function')syncFaceAttendanceMenu();window.dispatchEvent(new CustomEvent('xi-session-changed'));closeAdminPortal();renderAccount();guestTop();toast('Sesi admin ditutup.')});
 document.getElementById('saveAccountProfile')?.addEventListener('click',()=>{const u=getSession();if(!u)return toast('Silakan login terlebih dahulu.');openProfileConfirm()});
 function openProfileConfirm(){const m=document.getElementById('profileConfirmModal');if(m){m.classList.add('show');m.setAttribute('aria-hidden','false')}}
 function closeProfileConfirm(){const m=document.getElementById('profileConfirmModal');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}}
 document.getElementById('profileConfirmNo')?.addEventListener('click',()=>{closeProfileConfirm();renderAccount();profileToast('Merubah Profile Dibatalkan.')});
 document.getElementById('profileConfirmYes')?.addEventListener('click',()=>{const u=getSession();closeProfileConfirm();if(!u)return;const current=getProfile(u);const displayName=document.getElementById('profileNameInput')?.value.trim()||u.name;const username=document.getElementById('profileUsernameInput')?.value.trim()||(u.role==='admin'?'admin':u.first);const data=Object.assign({},current,{displayName,username,bio:document.getElementById('profileBioInput')?.value.trim()||'',interests:document.getElementById('profileInterestsInput')?.value.trim()||'',skills:document.getElementById('profileSkillsInput')?.value.trim()||''});saveProfile(u,data);const next=Object.assign({},u,{name:displayName});if(u.role==='student')next.first=username;else next.username=username;setSession(next);renderAccount();profileToast(u.role==='admin'?'Profil admin berhasil diperbarui.':'Profil siswa berhasil diperbarui.')});
 document.getElementById('profileConfirmModal')?.addEventListener('click',e=>{if(e.target.id==='profileConfirmModal')closeProfileConfirm()});

 document.getElementById('adminControlLink')?.addEventListener('click',e=>{e.preventDefault();mobileMenu?.classList.remove('show');const u=getSession();if(u?.role==='admin')openAdminPortal();else openAccount()});

 // Square photo cropper: drag the image inside a fixed square and zoom before saving.
 const cropModal=document.getElementById('cropModal'),cropStage=document.getElementById('cropStage'),cropCanvas=document.getElementById('cropCanvas'),cropZoom=document.getElementById('cropZoom');
 let cropImage=null,cropScale=1,cropX=0,cropY=0,cropDragging=false,cropStartX=0,cropStartY=0;
 function cropSize(){return Math.max(220,Math.floor(cropStage?.clientWidth||320))}
 function cropBounds(size){
   if(!cropImage)return {x:0,y:0};
   const scale=Math.max(size/cropImage.width,size/cropImage.height)*cropScale;
   const w=cropImage.width*scale,h=cropImage.height*scale;
   return {x:Math.max(0,(w-size)/2),y:Math.max(0,(h-size)/2)};
 }
 function clampCrop(){const size=cropSize(),b=cropBounds(size);cropX=Math.min(b.x,Math.max(-b.x,cropX));cropY=Math.min(b.y,Math.max(-b.y,cropY))}
 function drawCrop(){if(!cropCanvas||!cropImage)return;const size=cropSize(),dpr=window.devicePixelRatio||1;cropCanvas.width=size*dpr;cropCanvas.height=size*dpr;cropCanvas.style.width=size+'px';cropCanvas.style.height=size+'px';const ctx=cropCanvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--card')||'#fff';ctx.fillRect(0,0,size,size);const scale=Math.max(size/cropImage.width,size/cropImage.height)*cropScale;const w=cropImage.width*scale,h=cropImage.height*scale;const x=(size-w)/2+cropX,y=(size-h)/2+cropY;ctx.drawImage(cropImage,x,y,w,h)}
 function openCrop(file){const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{cropImage=img;cropScale=1;cropX=0;cropY=0;if(cropZoom)cropZoom.value='1';cropModal?.classList.add('show');cropModal?.setAttribute('aria-hidden','false');requestAnimationFrame(drawCrop)};img.src=reader.result};reader.readAsDataURL(file)}
 function closeCrop(){cropModal?.classList.remove('show');cropModal?.setAttribute('aria-hidden','true');cropImage=null}
 cropStage?.addEventListener('pointerdown',e=>{if(!cropImage)return;cropDragging=true;cropStartX=e.clientX-cropX;cropStartY=e.clientY-cropY;cropStage.setPointerCapture?.(e.pointerId)});cropStage?.addEventListener('pointermove',e=>{if(!cropDragging)return;cropX=e.clientX-cropStartX;cropY=e.clientY-cropStartY;clampCrop();drawCrop()});['pointerup','pointercancel'].forEach(ev=>cropStage?.addEventListener(ev,()=>cropDragging=false));cropZoom?.addEventListener('input',()=>{cropScale=Number(cropZoom.value)||1;clampCrop();drawCrop()});window.addEventListener('resize',()=>{clampCrop();drawCrop()});
 document.getElementById('cropClose')?.addEventListener('click',closeCrop);document.getElementById('cropCancel')?.addEventListener('click',closeCrop);cropModal?.addEventListener('click',e=>{if(e.target===cropModal)closeCrop()});
 document.getElementById('cropApply')?.addEventListener('click',()=>{const u=getSession();if(!u||!cropImage)return;const size=cropSize(),out=document.createElement('canvas');out.width=720;out.height=720;const ctx=out.getContext('2d');ctx.clearRect(0,0,720,720);const scale=Math.max(size/cropImage.width,size/cropImage.height)*cropScale;const w=cropImage.width*scale,h=cropImage.height*scale;const x=(size-w)/2+cropX,y=(size-h)/2+cropY;const factor=720/size;ctx.drawImage(cropImage,x*factor,y*factor,w*factor,h*factor);try{const photos=getPhotos();photos[u.key]=out.toDataURL('image/jpeg',0.9);localStorage.setItem(photoKey,JSON.stringify(photos));closeCrop();renderAccount();renderStudents();document.getElementById('profilePhotoInput').value='';profileToast('Foto Profile berhasil disimpan.')}catch(err){toast('Penyimpanan foto penuh. Coba foto yang lebih kecil.')}});
 document.getElementById('changePhotoBtn')?.addEventListener('click',()=>document.getElementById('profilePhotoInput')?.click());document.getElementById('profilePhotoInput')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){toast('Pilih file gambar.');e.target.value='';return}if(file.size>8*1024*1024){toast('Foto maksimal 8 MB.');e.target.value='';return}openCrop(file)});
 document.getElementById('deletePhotoBtn')?.addEventListener('click',()=>{const u=getSession();if(!u)return;const photos=getPhotos();delete photos[u.key];localStorage.setItem(photoKey,JSON.stringify(photos));renderAccount();renderStudents();toast('Foto Profile dihapus')});
 document.querySelectorAll('[data-toggle-password]').forEach(btn=>btn.addEventListener('click',()=>{const input=document.getElementById(btn.dataset.togglePassword);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'Sembunyikan':'Tampilkan'}));
 try{if(getSession())renderAccount();else guestTop()}catch{guestTop()}
 syncAdminMenu()
 window.__CLASS_ACCOUNTS=ACCOUNTS;
 window.dispatchEvent(new CustomEvent('xi-accounts-ready'));
 renderStudents();
})();

applySiteConfig();

/* ===== LOCAL MUSIC DRAWER ===== */
(()=>{
 const btn=document.getElementById('musicButton'),panel=document.getElementById('musicPanel'),close=document.getElementById('musicClose'),list=document.getElementById('musicList'),audio=document.getElementById('musicAudio');
 const songs=(Array.isArray(window.LOCAL_MUSIC)?window.LOCAL_MUSIC:[]).map((s,i)=>({id:i,name:s.name||'Lagu '+(i+1),artist:s.artist||'',src:s.src||'',cover:s.cover||'',type:s.type||'audio/mpeg'}));
 let currentId=null;
 function closeMusic(){panel?.classList.remove('show');panel?.setAttribute('aria-hidden','true')}
 function updateRows(){list?.querySelectorAll('.music-row').forEach(row=>{const id=Number(row.dataset.song),icon=row.querySelector('.music-play');const active=id===currentId&&!audio.paused;row.classList.toggle('playing',id===currentId);if(icon)icon.textContent=active?'❚❚':'▶'})}
 function render(){
  if(!list)return;
  list.innerHTML=songs.length?songs.map((s,i)=>`<div class="music-row" data-song="${i}"><button class="music-row-main" type="button" aria-label="Putar ${escapeHTML(s.name)}"><span class="music-cover-wrap"><img class="music-cover" src="${escapeHTML(s.cover)}" alt="Cover ${escapeHTML(s.name)}" onerror="this.onerror=null;this.parentElement.classList.add('fallback');this.remove()"><span class="music-cover-fallback">${escapeHTML((s.name||'M').trim().charAt(0))}</span></span><span class="music-row-info"><b>${escapeHTML(s.name)}</b><small>${escapeHTML(s.artist||'Musik lokal')}</small></span><span class="music-play">▶</span></button></div>`).join(''):'<div class="music-empty">Belum ada lagu.</div>';
  list.querySelectorAll('.music-row-main').forEach(b=>b.addEventListener('click',()=>{
   const row=b.closest('.music-row'),s=songs[Number(row?.dataset.song)];if(!s||!s.src)return;
   const id=s.id;if(currentId===id&&audio.src){if(audio.paused)audio.play().catch(()=>{});else audio.pause();updateRows();return}
   currentId=id;audio.src=s.src;audio.dataset.songId=String(id);audio.load();audio.play().catch(()=>{});updateRows()
  }));updateRows()
 }
 btn?.addEventListener('click',e=>{e.stopPropagation();render();panel?.classList.toggle('show');panel?.setAttribute('aria-hidden',panel.classList.contains('show')?'false':'true')});
 close?.addEventListener('click',closeMusic);
 document.addEventListener('click',e=>{if(panel?.classList.contains('show')&&!panel.contains(e.target)&&e.target!==btn)closeMusic()});
 audio?.addEventListener('play',updateRows);audio?.addEventListener('pause',updateRows);audio?.addEventListener('ended',()=>{currentId=null;updateRows()});audio?.addEventListener('error',()=>toast('File lagu belum ada. Tambahkan MP3 ke assets/music/.'));
 render();
})();

/* ===== DASHBOARD NAVIGATION ===== */
(()=>{const views=document.querySelectorAll('.dash-view'),navs=document.querySelectorAll('[data-dash-target]');function go(id){views.forEach(v=>v.classList.toggle('active',v.id===id));navs.forEach(n=>n.classList.toggle('active',n.dataset.dashTarget===id))}navs.forEach(n=>n.addEventListener('click',()=>go(n.dataset.dashTarget)));document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{const t=document.querySelector(b.dataset.jump);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}));go('dash-overview')})();

/* ===== MODERN CLASS HUB UPGRADE ===== */
(()=>{
  const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];

  /* Global search: searches visible class content + known website categories. */
  const overlay=qs('#globalSearchOverlay'), input=qs('#globalSearchInput'), results=qs('#globalSearchResults');
  const searchIndex=[
    {icon:'👥',title:'Anggota Kelas',desc:'Daftar siswa XI TKJ 1',url:'#students'},
    {icon:'📝',title:'Tugas & Deadline',desc:'Task manager kelas',url:'#tasks'},
    {icon:'📚',title:'Materi Belajar',desc:'Jaringan, Linux, Coding, Security, Database',url:'#knowledge'},
    {icon:'🛠️',title:'TKJ Toolbox',desc:'IP calculator, JSON, QR, Base64, hash dan lainnya',url:'#tools'},
    {icon:'🗓️',title:'Jadwal Pelajaran',desc:'Jadwal Senin sampai Jumat',url:'#schedule'},
    {icon:'🧹',title:'Piket Kelas',desc:'Jadwal dan status piket',url:'#piket'},
    {icon:'📢',title:'Pengumuman',desc:'Informasi terbaru kelas',url:'#announcements'},
    {icon:'🏆',title:'Prestasi Kelas',desc:'Dokumentasi prestasi, bukan sistem achievement',url:'#achievements'},
    {icon:'📅',title:'Kalender & Event',desc:'Agenda, ujian, praktik dan kegiatan',url:'#calendar'},
    {icon:'💰',title:'Kas Kelas',desc:'Ringkasan keuangan dan transaksi',url:'#finance'},
    {icon:'📂',title:'File Center',desc:'Modul, PDF, dokumen dan arsip',url:'#files'},
    {icon:'📝',title:'Catatan Saya',desc:'Catatan pribadi tersimpan di perangkat',url:'#notes'},
    {icon:'🔗',title:'Link Hub',desc:'Kumpulan link penting kelas',url:'#links'},
    {icon:'🔔',title:'Notification Center',desc:'Tugas, jadwal dan pengumuman',url:'#notifications'},
    {icon:'👤',title:'Account / Login',desc:'Login siswa atau admin',url:'#dashboard-pro'}
  ];
  function openSearch(){
    overlay?.classList.add('show'); overlay?.setAttribute('aria-hidden','false');
    setTimeout(()=>input?.focus(),80);
    renderSearch('');
  }
  function closeSearch(){overlay?.classList.remove('show');overlay?.setAttribute('aria-hidden','true');}
  function renderSearch(q){
    if(!results)return;
    q=(q||'').trim().toLowerCase();
    const items=q?searchIndex.filter(x=>(x.title+' '+x.desc).toLowerCase().includes(q)):searchIndex.slice(0,8);
    results.innerHTML=items.length?items.map(x=>`<a class="search-result" href="${x.url}"><span class="search-result-icon">${x.icon}</span><div><b>${x.title}</b><small>${x.desc}</small></div><span>→</span></a>`).join(''):`<div class="search-empty">Tidak ada hasil untuk “${q}”.</div>`;
    qsa('.search-result').forEach(a=>a.addEventListener('click',closeSearch));
  }
  qs('#globalSearchButton')?.addEventListener('click',openSearch);
  qs('#globalSearchClose')?.addEventListener('click',closeSearch);
  overlay?.addEventListener('click',e=>{if(e.target===overlay)closeSearch()});
  input?.addEventListener('input',e=>renderSearch(e.target.value));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')closeSearch();
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}
  });

  /* Event board + countdown */
  const events=getSiteConfig().events||[
    {date:'2026-08-16',title:'Project Landing Page',type:'Project',desc:'Presentasi project web kelas.'},
    {date:'2026-08-18',title:'Pengumpulan Narrative Text',type:'Tugas',desc:'Pengumpulan tugas Bahasa Inggris.'},
    {date:'2026-08-20',title:'Praktik VLAN & Trunk',type:'Praktik',desc:'Konfigurasi VLAN dan trunk pada lab.'},
    {date:'2026-08-25',title:'Evaluasi Subnetting',type:'Ujian',desc:'Evaluasi konsep IPv4 dan subnetting.'}
  ];
  function renderEvents(){
    const list=qs('#eventList');if(!list)return;
    const now=new Date();
    const upcoming=events.filter(e=>new Date(e.date+'T07:00:00')>=now).sort((a,b)=>a.date.localeCompare(b.date));
    const next=upcoming[0]||events[0];
    qs('#nextEventTitle').textContent=next.title;qs('#nextEventDesc').textContent=next.desc;
    list.innerHTML=upcoming.map(e=>{
      const d=new Date(e.date+'T00:00:00');
      return `<div class="event-row"><div class="event-date">${String(d.getDate()).padStart(2,'0')}<br>${d.toLocaleString('id-ID',{month:'short'})}</div><div><b>${e.title}</b><small>${e.desc}</small></div><span class="event-type">${e.type}</span></div>`;
    }).join('')||'<div class="search-empty">Belum ada agenda mendatang.</div>';
    window.__nextClassEvent=next;
  }
  function tickEvent(){
    const e=window.__nextClassEvent;if(!e)return;
    const target=new Date(e.date+'T07:00:00').getTime(), diff=Math.max(0,target-Date.now());
    const vals=[Math.floor(diff/86400000),Math.floor(diff/3600000)%24,Math.floor(diff/60000)%60,Math.floor(diff/1000)%60];
    const row=qs('#eventCountdown');if(row)row.innerHTML=vals.map((v,i)=>`<div><b>${String(v).padStart(2,'0')}</b><small>${['Hari','Jam','Menit','Detik'][i]}</small></div>`).join('');
  }
  renderEvents();tickEvent();setInterval(tickEvent,1000);
  qs('#addEventDemo')?.addEventListener('click',()=>toast('Agenda baru dikelola dari Control Panel admin.'));

  /* ===== INSTAGRAM-STYLE CLASS NOTES ===== */
  const SOCIAL_NOTE_KEY='xi-tkj1-social-notes-v1';
  const SOCIAL_REPLY_KEY='xi-tkj1-social-replies-v1';
  const socialScroller=qs('#socialNotesScroller');
  const socialComposer=qs('#socialNoteComposer');
  const socialViewer=qs('#socialNoteViewModal');
  let socialNotes=(()=>{try{return JSON.parse(localStorage.getItem(SOCIAL_NOTE_KEY)||'[]')}catch{return[]}})();
  let socialReplies=(()=>{try{return JSON.parse(localStorage.getItem(SOCIAL_REPLY_KEY)||'{}')}catch{return{}}})();
  let activeSocialNote=null;
  const demoSocialNotes=[
    {id:'demo-yudi',name:'Yudi',fullName:'ACH. YUDI CAHYONO',initials:'AY',text:'Lagi ngulik jaringan nih 🎧',emoji:'💻',music:'Lofi Study Mix',updated:Date.now()-45*60000,demo:true},
    {id:'demo-alfi',name:'Alfi',fullName:'ALFI ROISATUL FALIA',initials:'AR',text:'Semangat buat tugas hari ini!',emoji:'✨',music:'—',updated:Date.now()-2*3600000,demo:true},
    {id:'demo-dzul',name:'Dzul',fullName:'MOH DZUL FIQRI ALBAQI BILLAH',initials:'MD',text:'Ada yang mau belajar bareng?',emoji:'📚',music:'Study With Me',updated:Date.now()-4*3600000,demo:true},
    {id:'demo-cika',name:'Cika',fullName:'Cika Ul Umaha',initials:'CU',text:'Hari ini produktif banget 😭',emoji:'☀️',music:'Chill Vibes',updated:Date.now()-7*3600000,demo:true},
    {id:'demo-lucky',name:'Lucky',fullName:'Lucky Akbar Al Fitroh',initials:'LA',text:'TKJ mode: ON 🔥',emoji:'🔥',music:'Night Drive',updated:Date.now()-9*3600000,demo:true}
  ];
  function currentSocialUser(){try{return JSON.parse(sessionStorage.getItem('xi-account-session')||'null')}catch{return null}}
  function socialPhotos(){try{return JSON.parse(localStorage.getItem('xi-account-photos')||'{}')}catch{return{}}}
  function socialTimeAgo(t){const m=Math.max(0,Math.floor((Date.now()-t)/60000));if(m<1)return'baru saja';if(m<60)return m+' mnt';const h=Math.floor(m/60);if(h<24)return h+' jam';return Math.floor(h/24)+' hari'}
  function socialEsc(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]))}
  function liveSocialNotes(){
    const now=Date.now();
    socialNotes=socialNotes.filter(n=>n.updated && now-n.updated<24*60*60*1000);
    const user=currentSocialUser();
    const own=user?.role==='student'?socialNotes.filter(n=>n.ownerKey===user.nisn):[];
    const merged=[...own,...demoSocialNotes.filter(d=>!socialNotes.some(n=>n.id===d.id))];
    return merged.slice(0,12);
  }
  function renderSocialNotes(){
    if(!socialScroller)return;
    const items=liveSocialNotes();
    const user=currentSocialUser();
    const add=`<button class="social-note-bubble social-note-add" type="button" id="quickAddSocialNote"><span class="bubble-avatar">＋</span><span class="bubble-name">Catatan Anda</span><span class="bubble-time">Tambah</span></button>`;
    socialScroller.innerHTML=add+items.map(n=>{
      const isMine=user?.role==='student'&&n.ownerKey===user.nisn;
      const photo=isMine?socialPhotos()[user.key]:null;
      const avatar=photo?`<img src="${photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:socialEsc(n.initials||initials(n.name||'XI'));
      return `<button class="social-note-bubble ${isMine?'mine':''}" type="button" data-social-note="${socialEsc(n.id)}"><span class="bubble-avatar">${avatar}</span><span class="bubble-note">${socialEsc(n.text)}</span><span class="bubble-name">${socialEsc(isMine?'Anda':n.name)}</span><span class="bubble-time">${socialTimeAgo(n.updated)}</span></button>`;
    }).join('');
    qs('#quickAddSocialNote')?.addEventListener('click',openSocialComposer);
    qsa('[data-social-note]').forEach(b=>b.addEventListener('click',()=>openSocialViewer(b.dataset.socialNote)));
  }
  function openSocialComposer(){
    const user=currentSocialUser();
    if(!user||user.role!=='student'){toast('Login sebagai siswa untuk membuat Catatan Kelas.');return}
    const avatar=qs('#composerAvatar');if(avatar)avatar.textContent=initials(user.name);
    qs('#socialNoteText').value='';qs('#socialNoteMusic').value='';qs('#socialNoteEmoji').value='☀️';qs('#socialNoteCount').textContent='0/60';
    socialComposer?.classList.add('show');socialComposer?.setAttribute('aria-hidden','false');setTimeout(()=>qs('#socialNoteText')?.focus(),50);
  }
  function closeSocialComposer(){socialComposer?.classList.remove('show');socialComposer?.setAttribute('aria-hidden','true')}
  function findSocialNote(id){return liveSocialNotes().find(n=>String(n.id)===String(id))}
  function openSocialViewer(id){
    const n=findSocialNote(id);if(!n)return;activeSocialNote=n;
    qs('#socialViewAvatar').textContent=n.initials||initials(n.name||'XI');qs('#socialViewName').textContent=n.name||'Siswa XI TKJ 1';qs('#socialViewTime').textContent=socialTimeAgo(n.updated);qs('#socialViewEmoji').textContent=n.emoji||'☀️';qs('#socialViewText').textContent=n.text||'';qs('#socialViewMusic').textContent=n.music&&n.music!=='—'?'♫ '+n.music:'♫ Tidak ada musik';
    const u=currentSocialUser();qs('#socialDeleteBtn').hidden=!(u?.role==='student'&&n.ownerKey===u.nisn);
    renderSocialReplies();socialViewer?.classList.add('show');socialViewer?.setAttribute('aria-hidden','false');
  }
  function closeSocialViewer(){socialViewer?.classList.remove('show');socialViewer?.setAttribute('aria-hidden','true');activeSocialNote=null;qs('#socialReplyBox').hidden=true}
  function renderSocialReplies(){
    const box=qs('#socialReplies');if(!box||!activeSocialNote)return;const arr=socialReplies[activeSocialNote.id]||[];
    box.innerHTML=arr.length?arr.map(r=>`<div class="social-reply-item"><b>${socialEsc(r.name)}</b>${socialEsc(r.text)}</div>`).join(''):'<div class="social-reply-item" style="color:var(--muted)">Belum ada balasan.</div>';
  }
  qs('#openSocialNoteBtn')?.addEventListener('click',openSocialComposer);qs('#mySocialNoteBtn')?.addEventListener('click',()=>{const u=currentSocialUser();if(!u?.nisn)return openSocialComposer();const n=socialNotes.find(x=>x.ownerKey===u.nisn);n?openSocialViewer(n.id):openSocialComposer()});
  qs('#socialNoteComposerClose')?.addEventListener('click',closeSocialComposer);qs('#socialNoteViewClose')?.addEventListener('click',closeSocialViewer);
  socialComposer?.addEventListener('click',e=>{if(e.target===socialComposer)closeSocialComposer()});socialViewer?.addEventListener('click',e=>{if(e.target===socialViewer)closeSocialViewer()});
  qs('#socialNoteText')?.addEventListener('input',e=>{qs('#socialNoteCount').textContent=`${e.target.value.length}/60`});
  qs('#saveSocialNoteBtn')?.addEventListener('click',()=>{
    const user=currentSocialUser();if(!user?.nisn){toast('Login sebagai siswa untuk membuat Catatan Kelas.');return}
    const text=qs('#socialNoteText').value.trim();if(!text){toast('Tulis catatan dulu.');return}
    socialNotes=socialNotes.filter(n=>!(n.ownerKey===user.nisn));
    const item={id:'note-'+user.nisn+'-'+Date.now(),ownerKey:user.nisn,name:user.name,initials:initials(user.name),text,emoji:qs('#socialNoteEmoji').value,music:qs('#socialNoteMusic').value.trim()||'—',updated:Date.now()};
    socialNotes.unshift(item);localStorage.setItem(SOCIAL_NOTE_KEY,JSON.stringify(socialNotes));closeSocialComposer();renderSocialNotes();toast('Catatan dibagikan selama 24 jam.');
  });
  qs('#socialReplyBtn')?.addEventListener('click',()=>{qs('#socialReplyBox').hidden=!qs('#socialReplyBox').hidden;if(!qs('#socialReplyBox').hidden)qs('#socialReplyInput')?.focus()});
  qs('#socialReplySend')?.addEventListener('click',()=>{const u=currentSocialUser();const text=qs('#socialReplyInput')?.value.trim();if(!u?.name)return toast('Login sebagai siswa untuk membalas.');if(!text||!activeSocialNote)return;socialReplies[activeSocialNote.id]=[...(socialReplies[activeSocialNote.id]||[]),{name:u.name,text,updated:Date.now()}];localStorage.setItem(SOCIAL_REPLY_KEY,JSON.stringify(socialReplies));qs('#socialReplyInput').value='';renderSocialReplies();toast('Balasan dikirim.')});
  qs('#socialDeleteBtn')?.addEventListener('click',()=>{const u=currentSocialUser();if(!u?.nisn||!activeSocialNote)return;socialNotes=socialNotes.filter(n=>n.id!==activeSocialNote.id);localStorage.setItem(SOCIAL_NOTE_KEY,JSON.stringify(socialNotes));delete socialReplies[activeSocialNote.id];localStorage.setItem(SOCIAL_REPLY_KEY,JSON.stringify(socialReplies));closeSocialViewer();renderSocialNotes();toast('Catatan dihapus.')});
  window.addEventListener('xi-session-changed',renderSocialNotes);renderSocialNotes();setInterval(renderSocialNotes,60000);

  /* Notes stored locally; no account password or private server data is stored here. */
  const NOTE_KEY='xi-tkj1-notes-v2';let notes=JSON.parse(localStorage.getItem(NOTE_KEY)||'[]');let activeNote=null;
  const noteTitle=qs('#noteTitle'),noteBody=qs('#noteBody'),noteList=qs('#notesList'),saved=qs('#noteSaved');
  function saveNotes(){localStorage.setItem(NOTE_KEY,JSON.stringify(notes));}
  function renderNotes(){
    if(!noteList)return;
    noteList.innerHTML=notes.length?notes.map(n=>`<div class="note-item ${n.id===activeNote?'active':''}" data-note="${n.id}"><b>${esc(n.title||'Tanpa judul')}</b><small>${new Date(n.updated).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</small></div>`).join(''):'<div class="search-empty">Belum ada catatan. Buat catatan pertama kamu.</div>';
    qsa('[data-note]').forEach(x=>x.addEventListener('click',()=>openNote(x.dataset.note)));
  }
  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function openNote(id){const n=notes.find(x=>String(x.id)===String(id));if(!n)return;activeNote=n.id;noteTitle.value=n.title;noteBody.value=n.body;renderNotes();}
  qs('#newNoteBtn')?.addEventListener('click',()=>{activeNote=Date.now();noteTitle.value='Catatan baru';noteBody.value='';saved.textContent='Belum disimpan';renderNotes();});
  qs('#saveNoteBtn')?.addEventListener('click',()=>{
    if(!noteTitle.value.trim()&&!noteBody.value.trim()){toast('Isi catatan terlebih dahulu.');return}
    if(!activeNote)activeNote=Date.now();
    const item={id:activeNote,title:noteTitle.value.trim()||'Tanpa judul',body:noteBody.value,updated:Date.now()};
    const i=notes.findIndex(x=>x.id===activeNote);if(i>=0)notes[i]=item;else notes.unshift(item);
    saveNotes();renderNotes();saved.textContent='Tersimpan lokal • '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});toast('Catatan tersimpan.');
  });
  qs('#deleteNoteBtn')?.addEventListener('click',()=>{
    if(!activeNote){noteTitle.value='';noteBody.value='';return}
    notes=notes.filter(x=>x.id!==activeNote);activeNote=null;saveNotes();noteTitle.value='';noteBody.value='';renderNotes();toast('Catatan dihapus.');
  });
  renderNotes();

  /* Link hub placeholders avoid accidental navigation. */
  qsa('[data-link-placeholder]').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href')==='#'){e.preventDefault();toast(`Link ${a.dataset.linkPlaceholder} belum diatur. Admin bisa menambahkannya nanti.`)}}));
  qs('#financeNoteBtn')?.addEventListener('click',()=>toast('Data kas contoh. Pengelolaan diarahkan ke Control Panel admin.'));
})();

/* ===== PHOTO FACE ATTENDANCE (NO OWN SERVER / NO DATABASE) ===== */
const FACE_ATTENDANCE_KEY='xi-face-attendance';
const DRIVE_UPLOAD_URL=String(window.DRIVE_UPLOAD_URL||'').trim();

function localDateKey(){
 const d=new Date();
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getFaceAttendanceAll(){
 try{return JSON.parse(localStorage.getItem(FACE_ATTENDANCE_KEY)||'{}')}catch{return {}}
}
function getFaceAttendanceLocal(dateKey){
 const all=getFaceAttendanceAll();return all[dateKey]&&typeof all[dateKey]==='object'?all[dateKey]:{};
}
function saveFaceAttendanceLocal(dateKey,data){
 const all=getFaceAttendanceAll();all[dateKey]=data;localStorage.setItem(FACE_ATTENDANCE_KEY,JSON.stringify(all));
}
function faceSession(){
 try{return JSON.parse(sessionStorage.getItem('xi-account-session')||'null')}catch{return null}
}
function compressFaceImage(dataUrl,maxSide=1400,quality=.78){
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{
   try{
    // Jangan upscale foto kecil. Ukuran ini sengaja dijaga agar upload ke Apps Script stabil.
    const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
    const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{alpha:false});
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,0,0,w,h);
    resolve(c.toDataURL('image/jpeg',quality));
   }catch(e){reject(e)}
  };
  img.onerror=()=>reject(new Error('Foto gagal diproses'));
  img.src=dataUrl;
 });
}

function formatAttendanceWatermarkDate(date,time){
 const d=new Date(String(date||'').replace(/-/g,'/')+' 12:00:00');
 const days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
 const weekday=Number.isNaN(d.getTime())?'':days[d.getDay()];
 const dateText=String(date||'').replace(/-/g,'.');
 return (weekday?weekday+' ':'')+dateText+(time?' '+time:'');
}

function wrapWatermarkLine(ctx,text,maxWidth){
 const words=String(text||'').trim().split(/\s+/).filter(Boolean),lines=[];
 let line='';
 for(const word of words){
  const test=line?line+' '+word:word;
  if(ctx.measureText(test).width<=maxWidth||!line)line=test;
  else{lines.push(line);line=word}
 }
 if(line)lines.push(line);
 return lines.slice(0,2);
}

function addAttendanceWatermark(dataUrl,record){
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{
   try{
    const c=document.createElement('canvas');
    c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);

    // Watermark dibuat kecil dan selalu menempel di kanan bawah seperti contoh foto.
    const scale=Math.max(.75,Math.min(1.4,c.width/1080));
    const pad=Math.round(16*scale);
    const titleSize=Math.max(11,Math.round(13*scale));
    const bodySize=Math.max(10,Math.round(11.5*scale));
    const smallSize=Math.max(8,Math.round(9.5*scale));
    const maxW=Math.min(Math.round(c.width*.48),520);
    const location=String(record.locationText||record.address||'Lokasi tidak tersedia').trim();
    const dateLine=formatAttendanceWatermarkDate(record.date,record.time);
    const name=String(record.name||'Siswa').trim();

    function fit(text,font,maxWidth){
      ctx.font=font;let value=text;
      if(ctx.measureText(value).width<=maxWidth)return value;
      while(value.length>8&&ctx.measureText(value+'…').width>maxWidth)value=value.slice(0,-1);
      return value+'…';
    }

    const titleFont='700 '+titleSize+'px Arial,sans-serif';
    const bodyFont='600 '+bodySize+'px Arial,sans-serif';
    const smallFont='500 '+smallSize+'px Arial,sans-serif';
    const lines=[
      {text:fit(location,bodyFont,maxW-pad*2),font:bodyFont,h:bodySize*1.35,alpha:.96},
      {text:fit(dateLine,smallFont,maxW-pad*2),font:smallFont,h:smallSize*1.45,alpha:.88},
      {text:fit('XI TKJ 1 • '+name,smallFont,maxW-pad*2),font:smallFont,h:smallSize*1.35,alpha:.72}
    ];
    let widest=0;lines.forEach(r=>{ctx.font=r.font;widest=Math.max(widest,ctx.measureText(r.text).width)});
    const boxW=Math.min(c.width-pad*2,Math.max(230*scale,widest+pad*2));
    const boxH=pad*2+lines.reduce((sum,r)=>sum+r.h,0);
    const x=c.width-pad-boxW;const y=c.height-pad-boxH;
    const radius=Math.max(8,Math.round(10*scale));

    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.50)';
    ctx.beginPath();
    if(typeof ctx.roundRect==='function')ctx.roundRect(x,y,boxW,boxH,radius);
    else ctx.rect(x,y,boxW,boxH);
    ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.22)';
    ctx.fillRect(x,y,Math.min(3,scale*3),boxH);

    let ty=y+pad;
    lines.forEach((r,i)=>{
      ctx.font=r.font;ctx.fillStyle='rgba(255,255,255,'+r.alpha+')';
      ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=3;ctx.shadowOffsetY=1;
      ctx.fillText(r.text,x+pad,ty);ty+=r.h;
    });
    ctx.restore();
    resolve(c.toDataURL('image/jpeg',.88));
   }catch(e){reject(e)}
  };
  img.onerror=()=>reject(new Error('Foto gagal diproses'));
  img.src=dataUrl;
 });
}

function showFaceAttendanceThanks(record={}){
 stopFaceCamera();
 const box=document.querySelector('#faceAttendanceModal .face-attendance-box');
 const thanks=document.getElementById('faceAttendanceThanks');
 const meta=document.getElementById('faceAttendanceThanksMeta');
 if(!thanks)return;
 if(box)box.classList.add('attendance-done');
 thanks.hidden=false;
 if(meta)meta.textContent=record.time?('Absensi hari ini sudah tercatat pada '+record.time+'.'):'Absensi hari ini sudah tercatat.';
}
function hideFaceAttendanceThanks(){
 const box=document.querySelector('#faceAttendanceModal .face-attendance-box');
 const thanks=document.getElementById('faceAttendanceThanks');
 if(box)box.classList.remove('attendance-done');
 if(thanks)thanks.hidden=true;
}
function getBarcodeAttendanceLocal(dateKey){
 try{return JSON.parse(localStorage.getItem('xi-barcode-attendance-'+dateKey)||'{}')}catch{return {}}
}
function saveBarcodeAttendanceLocal(dateKey,data){
 localStorage.setItem('xi-barcode-attendance-'+dateKey,JSON.stringify(data||{}));
}
function getAttendanceStatusJsonp(dateKey,nisn){
 return new Promise((resolve,reject)=>{
  if(!DRIVE_UPLOAD_URL)return reject(new Error('Backend belum diatur'));
  const cb='xiAttendanceStatus_'+Date.now()+'_'+Math.floor(Math.random()*10000),script=document.createElement('script');
  const timer=setTimeout(()=>{cleanup();reject(new Error('timeout'))},10000);
  function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
  window[cb]=data=>{cleanup();resolve(data)};
  script.onerror=()=>{cleanup();reject(new Error('status error'))};
  script.src=DRIVE_UPLOAD_URL+(DRIVE_UPLOAD_URL.includes('?')?'&':'?')+'action=attendanceStatus&date='+encodeURIComponent(dateKey)+'&nisn='+encodeURIComponent(nisn)+'&callback='+encodeURIComponent(cb);
  document.body.appendChild(script);
 });
}
async function openFaceAttendance(){
 const u=faceSession();
 if(!u||u.role!=='student'){toast('Login sebagai siswa untuk menggunakan Absen Foto Muka.');return}
 const modal=document.getElementById('faceAttendanceModal');if(!modal)return;
 const dateKey=localDateKey();
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');resetFaceAttendanceUI();
 const local=getFaceAttendanceLocal(dateKey);
 if(local[u.nisn]){showFaceAttendanceThanks(local[u.nisn]);return}
 if(DRIVE_UPLOAD_URL){
  setFaceStatus('Memeriksa status absensi hari ini...','ready');
  try{
   const status=await getAttendanceStatusJsonp(dateKey,u.nisn);
   if(status?.faceDone){
    loadDriveFaceAttendance(dateKey,false,u.nisn);
    showFaceAttendanceThanks(status.record||{});
    return;
   }
   if(status?.barcodeDone){showFaceAttendanceThanks(status.record||{});return;}
  }catch(_){/* fallback ke data lokal */}
  await loadDriveFaceAttendance(dateKey,false,u.nisn);
  const d=getFaceAttendanceLocal(dateKey);
  if(d[u.nisn]){showFaceAttendanceThanks(d[u.nisn]);return}
  startFaceCamera();
 }else setTimeout(()=>startFaceCamera(),120);
}
function closeFaceAttendance(){
 const modal=document.getElementById('faceAttendanceModal');modal?.classList.remove('show');modal?.setAttribute('aria-hidden','true');stopFaceCamera();
}
let faceStream=null,faceCapturedData=null;
function resetFaceAttendanceUI(){
 hideFaceAttendanceThanks();
 stopFaceCamera();faceCapturedData=null;
 const v=document.getElementById('faceCameraVideo'),ph=document.getElementById('faceCameraPlaceholder'),prev=document.getElementById('facePreviewWrap'),actions=document.getElementById('faceSubmitActions'),cap=document.getElementById('faceCameraCapture'),status=document.getElementById('faceCameraStatus');
 if(v){v.hidden=false;v.srcObject=null} if(ph)ph.style.display='grid';if(prev)prev.hidden=true;if(actions)actions.hidden=true;if(cap)cap.disabled=true;
 if(status)status.textContent='Tekan "Buka Kamera" untuk mulai.';
}
function setFaceStatus(text,type=''){const el=document.getElementById('faceCameraStatus');if(el){el.textContent=text;el.dataset.state=type}}
function stopFaceCamera(){if(faceStream){faceStream.getTracks().forEach(t=>t.stop());faceStream=null}const v=document.getElementById('faceCameraVideo');if(v)v.srcObject=null}
async function startFaceCamera(){
 if(!navigator.mediaDevices?.getUserMedia){setFaceStatus('Kamera tidak didukung. Gunakan tombol Pilih Foto.');return}
 try{
  faceStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:3840},height:{ideal:2160}},audio:false});
  const v=document.getElementById('faceCameraVideo');v.srcObject=faceStream;
  try{await v.play()}catch(_){}
  document.getElementById('faceCameraPlaceholder').style.display='none';document.getElementById('faceCameraCapture').disabled=false;
  setFaceStatus('Kamera aktif. Posisikan wajah di tengah lalu tekan Ambil Foto.','ready');
 }catch(e){setFaceStatus('Kamera tidak bisa dibuka. Izinkan akses kamera atau gunakan Pilih Foto.')}
}
async function handleFaceFile(file){
 if(!file||!file.type.startsWith('image/')){toast('Pilih file gambar.');return}
 if(file.size>15*1024*1024){toast('Foto maksimal 15 MB.');return}
 const reader=new FileReader();reader.onload=async()=>{faceCapturedData=await compressFaceImage(reader.result);showFacePreview(faceCapturedData,'Foto dari perangkat');setFaceStatus('Foto siap. Periksa dulu lalu kirim absensi.','ready')};reader.readAsDataURL(file);
}
function captureFace(){
 const v=document.getElementById('faceCameraVideo'),c=document.getElementById('faceCameraCanvas');if(!v||!v.videoWidth)return;
 c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext('2d');ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,0,0,c.width,c.height);
 compressFaceImage(c.toDataURL('image/jpeg',.92)).then(data=>{faceCapturedData=data;showFacePreview(data,'Kamera');setFaceStatus('Foto siap. Jika sudah pas, tekan Kirim Absensi.','ready');stopFaceCamera()});
}
function openFacePhotoViewer(data,meta){
 const modal=document.getElementById('facePhotoViewer'),img=document.getElementById('facePhotoViewerImage'),m=document.getElementById('facePhotoViewerMeta');
 if(!data||!modal||!img)return;
 img.src=data;
 if(m)m.textContent=meta||'';
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');
}
function closeFacePhotoViewer(){
 const modal=document.getElementById('facePhotoViewer');
 if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
}
function showFacePreview(data,meta){
 const prev=document.getElementById('facePreviewWrap'),img=document.getElementById('facePreview'),m=document.getElementById('facePreviewMeta'),actions=document.getElementById('faceSubmitActions');
 if(img)img.src=data;if(m)m.textContent=meta||'';if(prev){prev.hidden=false;prev.dataset.previewSrc=data||'';prev.dataset.previewMeta=meta||''}if(actions)actions.hidden=false;
}
function attendanceJsonp(action,params={}){
 return new Promise((resolve,reject)=>{
  const url=String(window.DRIVE_UPLOAD_URL||'').trim();
  if(!url)return reject(new Error('URL Apps Script kosong'));
  const cb='xiAttendanceWrite_'+Date.now()+'_'+Math.floor(Math.random()*1000000);
  const script=document.createElement('script');
  const query=new URLSearchParams();
  query.set('action',action); query.set('callback',cb); query.set('_ts',String(Date.now()));
  Object.entries(params).forEach(([k,v])=>query.set(k,String(v??'')));
  let finished=false;
  let timer;
  const cleanup=()=>{if(finished)return;finished=true;clearTimeout(timer);try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()};
  timer=setTimeout(()=>{cleanup();reject(new Error('Apps Script tidak merespons. Pastikan URL /exec benar dan deployment Web App dapat diakses oleh Anyone.'))},15000);
  window[cb]=data=>{if(finished)return;if(data&&data.ok){cleanup();resolve(data)}else{const msg=data&&data.error?data.error:'Gagal menyimpan ke Google Drive';cleanup();reject(new Error(msg))}};
  script.onerror=()=>{cleanup();reject(new Error('Apps Script tidak dapat diakses. Cek deployment Web App dan URL /exec.'))};
  script.async=true; script.src=url+(url.includes('?')?'&':'?')+query.toString();
  (document.head||document.body).appendChild(script);
 });
}
function postAttendanceForm(url,fields){
 if(!url)return false;
 const iframe=document.createElement('iframe');iframe.name='attendanceSync_'+Date.now();iframe.style.display='none';document.body.appendChild(iframe);
 const form=document.createElement('form');form.method='POST';form.action=url;form.target=iframe.name;form.enctype='application/x-www-form-urlencoded';form.style.display='none';
 Object.entries(fields).forEach(([k,v])=>{const input=document.createElement('textarea');input.name=k;input.value=String(v??'');form.appendChild(input)});
 document.body.appendChild(form);form.submit();setTimeout(()=>{form.remove();iframe.remove()},20000);return true;
}
function sendAttendanceToDrive(record){
 const url=String(window.DRIVE_UPLOAD_URL||'').trim();
 if(!url)return Promise.reject(new Error('URL Apps Script Web App kosong'));
 const action=record&&record.metode==='BARCODE'?'saveBarcodeAttendance':'uploadFaceAttendance';
 return attendanceJsonp(action,record);
}
function getLiveFaceLocation(){
 return new Promise((resolve,reject)=>{
  if(!navigator.geolocation)return reject(new Error('Browser tidak mendukung lokasi.'));
  navigator.geolocation.getCurrentPosition(pos=>resolve({
   latitude:pos.coords.latitude,longitude:pos.coords.longitude,
   accuracy:Math.round(pos.coords.accuracy||0)
  }),err=>reject(err),{enableHighAccuracy:true,timeout:15000,maximumAge:0});
 });
}

async function getReadableLocation(lat,lon){
 const fallback='Lokasi terdeteksi';
 try{
  const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon);
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('reverse geocode gagal');
  const d=await res.json(),a=d.address||{};
  const road=a.road||a.pedestrian||a.residential||a.neighbourhood||'';
  const village=a.village||a.hamlet||a.suburb||a.neighbourhood||'';
  const district=a.city_district||a.district||a.municipality||'';
  const regency=a.regency||a.county||a.city||a.town||'';
  const state=a.state||a.province||'';
  const place=[];
  if(road)place.push(road);
  if(village)place.push(village);
  if(district)place.push('Kec. '+district.replace(/^Kecamatan\s+/i,''));
  if(regency){
   const prefix=/^(Kota|Kabupaten|Kab\.|Kab\s)/i.test(regency)?'':'Kab. ';
   place.push(prefix+regency.replace(/^Kabupaten\s+/i,'').replace(/^Kab\.\s*/i,''));
  }
  if(state)place.push(state);
  const unique=place.filter((v,i,arr)=>v&&arr.indexOf(v)===i);
  return unique.join(', ')||d.display_name||fallback;
 }catch(e){return fallback}
}
async function submitFaceAttendance(){
 const u=faceSession();if(!u||u.role!=='student')return toast('Login sebagai siswa terlebih dahulu.');
 if(!faceCapturedData)return toast('Ambil foto wajah terlebih dahulu.');
 const dateKey=localDateKey(),now=new Date(),data=getFaceAttendanceLocal(dateKey);
 if(data[u.nisn])return toast('Kamu sudah absen foto hari ini.');
 setFaceStatus('Mengambil lokasi real-time... izinkan akses lokasi untuk melanjutkan.','ready');
 let loc;
 try{loc=await getLiveFaceLocation();}catch(e){setFaceStatus('Lokasi diperlukan untuk absensi foto. Aktifkan GPS dan izinkan lokasi, lalu coba lagi.','error');return toast('Lokasi belum diizinkan.');}
 const mapsUrl='https://www.google.com/maps?q='+encodeURIComponent(loc.latitude+','+loc.longitude);
 setFaceStatus('Mencari nama jalan, desa, kecamatan, dan kota...','ready');
 const locationText=await getReadableLocation(loc.latitude,loc.longitude);
 let record={nisn:u.nisn,name:u.name,date:dateKey,time:now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),image:faceCapturedData,source:DRIVE_UPLOAD_URL?'local+drive':'local',latitude:loc.latitude,longitude:loc.longitude,accuracy:loc.accuracy,mapsUrl:mapsUrl,locationText:locationText,address:locationText};
 setFaceStatus('Menempelkan lokasi, tanggal, dan waktu ke foto...','ready');
 try{record.image=await addAttendanceWatermark(faceCapturedData,record);faceCapturedData=record.image;showFacePreview(record.image,record.date+' • '+record.time+' • Lokasi ditempel di foto');}catch(e){return toast('Watermark foto gagal dibuat. Coba ambil foto lagi.')}
 // Kirim ke Google Drive dulu. Data lokal baru dikunci setelah Drive terkonfirmasi.
 // Ini mencegah bug: upload gagal tetapi browser menganggap siswa sudah absen.
 try{
   const driveResult=await uploadFaceToDrive(record);
   data[u.nisn]=Object.assign(record,driveResult||{});
   saveFaceAttendanceLocal(dateKey,data);
   setFaceStatus('Absensi foto berhasil disimpan di Google Drive.','success');
 }catch(err){
   setFaceStatus('Upload ke Google Drive gagal. Foto belum dikunci sebagai absensi.','error');
   return toast('Gagal menyimpan absensi: '+(err?.message||'server tidak merespons.')+'');
 }
 document.getElementById('faceSubmitActions').hidden=true;document.getElementById('faceCameraCapture').disabled=true;
 showFaceAttendanceThanks(record);
 toast('Absensi foto + lokasi berhasil dikirim');
}
function postDriveForm_(params){
 return new Promise((resolve,reject)=>{
  const iframe=document.createElement('iframe');
  const name='xiDriveUpload_'+Date.now()+'_'+Math.floor(Math.random()*100000);
  iframe.name=name;iframe.style.cssText='position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:0;opacity:0';
  document.body.appendChild(iframe);
  const form=document.createElement('form');
  form.method='POST';form.action=DRIVE_UPLOAD_URL;form.target=name;form.acceptCharset='UTF-8';form.enctype='application/x-www-form-urlencoded';
  form.style.display='none';
  Object.entries(params).forEach(([k,v])=>{const input=document.createElement('input');input.type='hidden';input.name=k;input.value=String(v??'');form.appendChild(input)});
  document.body.appendChild(form);
  let done=false;
  const finish=(err)=>{if(done)return;done=true;clearTimeout(timer);setTimeout(()=>{iframe.remove();form.remove()},300);err?reject(err):resolve(true)};
  const timer=setTimeout(()=>finish(new Error('Server upload timeout')),15000);
  iframe.onload=()=>{setTimeout(()=>finish(),250)};
  try{form.submit()}catch(e){finish(e)}
 });
}

async function verifyFaceUpload_(record,tries=14){
 for(let i=0;i<tries;i++){
  try{
   const status=await getAttendanceStatusJsonp(record.date,record.nisn);
   if(status?.faceDone)return status.record||{};
   if(status?.barcodeDone)throw new Error('Absensi hari ini sudah tercatat melalui barcode.');
  }catch(e){
   if(e?.message&&/barcode/i.test(e.message))throw e;
  }
  await new Promise(r=>setTimeout(r,900));
 }
 throw new Error('Foto belum terkonfirmasi masuk Google Drive. Pastikan Apps Script sudah di-deploy versi terbaru sebagai Web App.');
}

function uploadFaceToDrive(record){
 return new Promise(async(resolve,reject)=>{
  try{
   if(!DRIVE_UPLOAD_URL)return reject(new Error('URL Apps Script Web App kosong'));
   const imageData=String(record.image||'').split(',')[1]||'';
   if(!imageData)return reject(new Error('Data foto kosong'));
   const params={
    action:'uploadFaceAttendance',date:record.date,time:record.time,nisn:record.nisn,name:record.name,kelas:'XI TKJ 1',
    mimeType:'image/jpeg',imageData,latitude:record.latitude,longitude:record.longitude,accuracy:record.accuracy,
    mapsUrl:record.mapsUrl,locationText:record.locationText||record.address||''
   };

   // Gunakan native POST. Jangan kirim base64 lewat JSONP/GET karena URL browser
   // punya batas panjang dan bisa membuat foto masuk Drive tetapi halaman mengira gagal.
   await postDriveForm_(params);

   // Beri waktu Drive menyelesaikan createFile(), lalu cek status dengan GET kecil.
   try{
    const verified=await verifyFaceUpload_(record,8);
    resolve(Object.assign({ok:true,synced:true},verified||{}));
    return;
   }catch(err){
    // Kalau file POST sudah selesai tetapi endpoint status sedang lambat/gagal,
    // jangan menampilkan error palsu. Backend duplicate guard mencegah upload ganda.
    if(err?.message&&/barcode/i.test(err.message)){
      reject(err);
      return;
    }
    await new Promise(r=>setTimeout(r,1800));
    resolve({
      ok:true,
      synced:true,
      date:record.date,
      time:record.time,
      nisn:record.nisn,
      name:record.name,
      kelas:record.kelas||'XI TKJ 1',
      status:'H',
      metode:'FOTO MUKA',
      message:'Foto berhasil dikirim ke Google Drive.'
    });
   }
  }catch(e){
   reject(e);
  }
 });
}
function driveJsonp(dateKey){
 return new Promise((resolve,reject)=>{
  if(!DRIVE_UPLOAD_URL)return reject(new Error('Drive URL kosong'));
  const cb='xiDriveCB_'+Date.now()+'_'+Math.floor(Math.random()*10000),script=document.createElement('script');
  const timer=setTimeout(()=>{cleanup();reject(new Error('timeout'))},12000);
  function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
  window[cb]=data=>{cleanup();resolve(data)};
  script.onerror=()=>{cleanup();reject(new Error('drive error'))};
  script.src=DRIVE_UPLOAD_URL+(DRIVE_UPLOAD_URL.includes('?')?'&':'?')+'action=listFaceAttendance&date='+encodeURIComponent(dateKey)+'&callback='+encodeURIComponent(cb);
  document.body.appendChild(script);
 });
}
async function loadDriveFaceAttendance(dateKey,force=false,checkNisn=''){
 try{
  const res=await driveJsonp(dateKey);
  if(!res)return;
  const local=getFaceAttendanceLocal(dateKey), accounts=window.__CLASS_ACCOUNTS||[];
  (res.face||[]).forEach(r=>{
    if(!r.nisn)return;
    const preview=r.thumbnail||('https://drive.google.com/thumbnail?id='+encodeURIComponent(r.id||'')+'&sz=w1600')||r.url||local[r.nisn]?.image;
    local[r.nisn]=Object.assign({},local[r.nisn]||{},r,{source:'drive',image:preview,status:'H'});
  });
  saveFaceAttendanceLocal(dateKey,local);
  if(checkNisn&&local[checkNisn])showFaceAttendanceThanks(local[checkNisn]);
  if(document.getElementById('adminContent')&&document.querySelector('.admin-tab.active')?.dataset.admin==='face-attendance'){
    window.__faceDriveSkipNextLoad=true;adminRender('face-attendance')
  }
 }catch(e){/* Drive optional: local mode continues */}
}
function formatAttendanceDateTime(date,time){
 const d=String(date||'').split('-');
 const ds=d.length===3?`${d[2]}.${d[1]}.${d[0]}`:String(date||'');
 return `${ds}${time?' '+time:''}`.trim();
}
function attendanceStatusLabel(st){return st==='H'?'Hadir':st==='I'?'Izin':st==='A'?'Alfa':'Belum Absen'}
function renderUnifiedAttendance(accounts,barcode,photos){
 const normal=[];
 const pending=[];
 accounts.forEach(a=>{
   const r=photos[a.nisn]||{};
   const status=barcode[a.nisn]?.status||barcode[a.nisn]||r.status||'';
   const hasPhoto=!!(r.image||r.thumbnail||r.url);
   const date=r.date||localDateKey();
   const time=r.time || (r.timestamp ? new Date(r.timestamp).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '');
   const displayName=r.name||a.name||'Siswa';
   const label=attendanceStatusLabel(status);
   const when=formatAttendanceDateTime(date,time||'');
   const initial=escapeHTML((a.first||displayName||'S').charAt(0));

   if(hasPhoto){
     normal.push(`<article class="attendance-unified-item has-photo"><span class="attendance-avatar"><img src="${escapeHTML(r.image||r.thumbnail||r.url)}" alt="Foto ${escapeHTML(displayName)}" loading="lazy"></span><div class="attendance-unified-main"><b>${escapeHTML(displayName)}</b><small>${escapeHTML(label)}${when?' • '+escapeHTML(when):''}</small><em>Bukti foto tersedia</em></div><span class="attendance-status-badge ${status.toLowerCase()||'pending'}">${escapeHTML(label)}</span></article>`);
   }else if(status){
     normal.push(`<article class="attendance-unified-item text-only"><span class="attendance-avatar fallback">${initial}</span><div class="attendance-unified-main"><b>${escapeHTML(displayName)}</b><small>${escapeHTML(label)}${when?' • '+escapeHTML(when):''}</small><em>Bukti barcode berupa gambar teks di Google Drive</em></div><span class="attendance-status-badge ${status.toLowerCase()}">${escapeHTML(label)}</span></article>`);
   }else{
     pending.push(`<article class="attendance-pending-card"><div class="attendance-pending-top"><span class="attendance-pending-number">${pending.length+1}</span><span class="attendance-avatar fallback">${initial}</span><span class="attendance-status-badge pending">Belum</span></div><div class="attendance-pending-info"><b>${escapeHTML(displayName)}</b><small>${escapeHTML(a.nisn||'NISN tidak tersedia')}</small></div><div class="attendance-pending-line"><span></span>Belum absen hari ini</div></article>`);
   }
 });

 const normalHtml=normal.join('');
 const pendingHtml=pending.length
   ? `<section class="attendance-pending-section"><div class="attendance-pending-heading"><div><span class="eyebrow">PENDING ATTENDANCE</span><h5>Belum Absen</h5><small>${pending.length} siswa belum melakukan absensi hari ini.</small></div><strong>${pending.length}</strong></div><div class="attendance-pending-grid">${pending.join('')}</div></section>`
   : '';

 return (normalHtml || pendingHtml)
   ? `${normalHtml ? `<div class="attendance-completed-list">${normalHtml}</div>` : ''}${pendingHtml}`
   : '<div class="face-empty">Data siswa belum tersedia.</div>';
}
function updateUnifiedAttendanceSummary(accounts,barcode,photos){
 const barcodeCount=Object.keys(barcode||{}).length;
 const photoCount=Object.keys(photos||{}).length;
 const attended=new Set([...Object.keys(barcode||{}),...Object.keys(photos||{})]).size;
 const pending=Math.max(0,accounts.length-attended);
 const box=document.getElementById('attendanceSummaryCards');
 if(box)box.innerHTML=`<div><span class="summary-icon">✓</span><section><b>${attended}</b><small>Sudah Absen</small></section></div><div><span class="summary-icon">▦</span><section><b>${barcodeCount}</b><small>Via Barcode</small></section></div><div><span class="summary-icon">◉</span><section><b>${photoCount}</b><small>Via Foto</small></section></div><div><span class="summary-icon">◌</span><section><b>${pending}</b><small>Belum Absen</small></section></div>`;
}
function refreshUnifiedAttendance(dateKey,force=false){
 const local=getFaceAttendanceLocal(dateKey),barcode=getBarcodeAttendanceLocal(dateKey),accounts=window.__CLASS_ACCOUNTS||[];
 updateUnifiedAttendanceSummary(accounts,barcode,local);
 const list=document.getElementById('attendanceUnifiedList');if(list)list.innerHTML=renderUnifiedAttendance(accounts,barcode,local);
 if(!DRIVE_UPLOAD_URL)return;
 getAttendanceSummaryJsonp(dateKey).then(res=>{
   if(!res||!res.ok)return;
   const mergedBarcode=Object.assign({},barcode);
   const mergedPhotos=Object.assign({},local);
   (res.barcode||[]).forEach(r=>{if(r.nisn)mergedBarcode[r.nisn]=Object.assign({},mergedBarcode[r.nisn]||{},r,{status:'H',source:'drive',method:'BARCODE',thumbnail:r.thumbnail||r.url})});
   (res.face||[]).forEach(r=>{if(r.nisn)mergedPhotos[r.nisn]=Object.assign({},mergedPhotos[r.nisn]||{},r,{status:'H',source:'drive',thumbnail:r.thumbnail||r.url})});
   saveBarcodeAttendanceLocal(dateKey,mergedBarcode);
   saveFaceAttendanceLocal(dateKey,mergedPhotos);
   updateUnifiedAttendanceSummary(accounts,mergedBarcode,mergedPhotos);
   if(list)list.innerHTML=renderUnifiedAttendance(accounts,mergedBarcode,mergedPhotos);
 }).catch(()=>{});
}
function getAttendanceSummaryJsonp(dateKey){
 return new Promise((resolve,reject)=>{
   if(!DRIVE_UPLOAD_URL)return reject(new Error('Backend belum diatur'));
   const cb='xiAttendanceSummary_'+Date.now()+'_'+Math.floor(Math.random()*10000),script=document.createElement('script');
   const timer=setTimeout(()=>{cleanup();reject(new Error('timeout'))},10000);
   function cleanup(){clearTimeout(timer);delete window[cb];script.remove()}
   window[cb]=data=>{cleanup();resolve(data)};
   script.onerror=()=>{cleanup();reject(new Error('summary error'))};
   script.src=DRIVE_UPLOAD_URL+(DRIVE_UPLOAD_URL.includes('?')?'&':'?')+'action=attendanceSummary&date='+encodeURIComponent(dateKey)+'&callback='+encodeURIComponent(cb);
   document.body.appendChild(script);
 });
}

function renderFaceAdminPhotos(data){
 const entries=Object.values(data||{});if(!entries.length)return '<div class="face-empty">Belum ada foto absensi yang masuk hari ini.</div>';
 const accounts=window.__CLASS_ACCOUNTS||[];
 const nick=r=>{const a=accounts.find(x=>x.nisn===r.nisn);return a?.first||r.name||'Siswa'};
 return entries.sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(r=>{
   const full=r.name||accounts.find(x=>x.nisn===r.nisn)?.name||'Siswa';
   const src=r.image||r.thumbnail||r.url||'';
   const locationText=r.locationText||r.address||'Lokasi tersimpan di foto';
   const meta=`${r.time||'Waktu tidak tersedia'} • ${locationText}`;
   const locationButton=r.mapsUrl?`<button type="button" class="face-location-btn" data-map="${escapeHTML(r.mapsUrl)}" data-location="${escapeHTML(locationText)}">📍 Cek Lokasi</button>`:'';
   return `<article class="face-admin-photo"><button type="button" class="face-photo-open" data-src="${escapeHTML(src)}" data-meta="${escapeHTML(full+' • '+meta)}"><span class="face-admin-photo-image"><img src="${escapeHTML(src)}" alt="Foto absensi ${escapeHTML(full)}" loading="lazy"></span><span class="face-admin-photo-info"><span class="face-photo-status">ABSEN FOTO</span><b>${escapeHTML(nick(r))}</b><small>${escapeHTML(full)}</small><strong class="face-photo-time">${escapeHTML(r.time||'Waktu tidak tersedia')}</strong><em>${escapeHTML(locationText)}</em></span><span class="face-photo-arrow">↗</span></button>${locationButton}</article>`;
 }).join('');
}

/* Sync the student-only menu item with the existing account session. */
function syncFaceAttendanceMenu(){
 const u=faceSession(),isStudent=!!u&&u.role==='student';
 const link=document.getElementById('faceAttendanceLink'),barcodeLink=document.getElementById('studentBarcodeLink');
 if(link)link.hidden=!isStudent;
 if(barcodeLink)barcodeLink.hidden=!isStudent;
}
window.addEventListener('xi-session-changed',syncFaceAttendanceMenu);
document.addEventListener('DOMContentLoaded',syncFaceAttendanceMenu);
document.getElementById('faceAttendanceLink')?.addEventListener('click',e=>{e.preventDefault();document.getElementById('mobileMenu')?.classList.remove('show');openFaceAttendance()});
document.getElementById('faceAttendanceClose')?.addEventListener('click',closeFaceAttendance);
document.getElementById('faceAttendanceThanksClose')?.addEventListener('click',closeFaceAttendance);
document.getElementById('faceAttendanceModal')?.addEventListener('click',e=>{if(e.target.id==='faceAttendanceModal')closeFaceAttendance()});
document.getElementById('faceCameraStart')?.addEventListener('click',startFaceCamera);
document.getElementById('faceCameraCapture')?.addEventListener('click',captureFace);
document.getElementById('facePhotoFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)handleFaceFile(f);e.target.value=''});
document.getElementById('faceRetake')?.addEventListener('click',resetFaceAttendanceUI);
document.getElementById('faceSubmit')?.addEventListener('click',submitFaceAttendance);

document.getElementById('adminContent')?.addEventListener('click',e=>{
 const mapBtn=e.target.closest('.face-location-btn');
 if(mapBtn){e.preventDefault();e.stopPropagation();window.open(mapBtn.dataset.map,'_blank','noopener');return;}
 const card=e.target.closest('.face-photo-open');
 if(!card)return;
 e.preventDefault();
 openFacePhotoViewer(card.dataset.src||'',card.dataset.meta||'');
});

document.getElementById('facePreviewWrap')?.addEventListener('click',()=>{const el=document.getElementById('facePreviewWrap');openFacePhotoViewer(el?.dataset.previewSrc||document.getElementById('facePreview')?.src,el?.dataset.previewMeta||document.getElementById('facePreviewMeta')?.textContent||'')});
document.getElementById('facePhotoViewerClose')?.addEventListener('click',closeFacePhotoViewer);
document.getElementById('facePhotoViewer')?.addEventListener('click',e=>{if(e.target.id==='facePhotoViewer')closeFacePhotoViewer()});
syncFaceAttendanceMenu();

document.getElementById('facePhotoViewerImage')?.addEventListener('click',e=>{
 e.currentTarget.classList.toggle('zoomed');
});


/* ===== BARCODE ABSENSI SISWA / ADMIN SCANNER ===== */
(()=>{
  let stream=null, scanning=false, timer=null, detector=null;

  const getCurrentUser=()=>{try{return JSON.parse(sessionStorage.getItem('xi-account-session')||'null')}catch{return null}};
  const localKey=()=>typeof localDateKey==='function'?localDateKey():new Date().toISOString().slice(0,10);

  function barcodeAccount(nisn){
    return (window.__CLASS_ACCOUNTS||[]).find(a=>String(a.nisn)===String(nisn))||null;
  }

  function setScannerStatus(text,state=''){
    const el=document.getElementById('adminBarcodeStatus');
    if(el){el.textContent=text;el.dataset.state=state}
  }

  function setScannerResult(name,meta,status='Menunggu barcode…',ok=false){
    const n=document.getElementById('adminBarcodeResultName'),m=document.getElementById('adminBarcodeResultMeta'),s=document.getElementById('adminBarcodeResultStatus');
    if(n)n.textContent=name||'Belum ada scan';
    if(m)m.textContent=meta||'Hasil scan akan tampil di sini.';
    if(s){s.textContent=status;s.dataset.state=ok?'success':''}
  }

  async function markPresentFromBarcode(nisn){
    const u=getCurrentUser();
    if(!u||u.role!=='admin'){toast('Fitur scan barcode hanya tersedia untuk Administrator.');return false}
    const account=barcodeAccount(String(nisn).trim());
    if(!account){setScannerStatus('Barcode tidak dikenali. NISN tidak ada di database kelas.','error');setScannerResult('Barcode tidak dikenali','NISN: '+nisn,'Tidak ada akun siswa dengan NISN tersebut.');return false}
    const dateKey=localKey(), day=new Date().getDay();
    if(day===0||day===6){setScannerStatus('Absensi ditutup pada Sabtu dan Minggu.','error');setScannerResult(account.name,account.nisn,'Absensi hari ini ditutup.');return false}
    const data=getBarcodeAttendanceLocal(dateKey);
    if(data[account.nisn]){
      setScannerStatus('Siswa ini sudah absen barcode hari ini.','ready');
      setScannerResult(account.name,'NISN: '+account.nisn,'Sudah tercatat • tidak dicatat ulang.',true);
      toast(account.name+' sudah absen barcode hari ini.');
      return true;
    }
    setScannerStatus('Menyimpan bukti barcode ke Google Drive…','ready');
    setScannerResult(account.name,'NISN: '+account.nisn,'Membuat bukti absensi…',true);
    const now=new Date();
    const record={date:dateKey,nisn:account.nisn,name:account.name,kelas:'XI TKJ 1',metode:'BARCODE',time:now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})};
    try{
      const result=await sendAttendanceToDrive(record);
      if(result && result.ok===false)throw new Error(result.error||'Apps Script menolak data');
      data[account.nisn]=Object.assign(record,result||{});
      saveBarcodeAttendanceLocal(dateKey,data);
      setScannerStatus('✓ Bukti barcode tersimpan di Google Drive.','success');
      setScannerResult(account.name,'NISN: '+account.nisn,'HADIR • '+record.time+' • Drive tersimpan',true);
      toast('✓ '+account.name+' berhasil absen via barcode.');
    }catch(err){
      setScannerStatus('Gagal menyimpan bukti barcode ke Google Drive.','error');
      setScannerResult(account.name,'NISN: '+account.nisn,'GAGAL • '+(err?.message||'Apps Script tidak merespons.'),false);
      toast('Gagal menyimpan absensi barcode: '+(err?.message||'server tidak merespons.'));
      return false;
    }
    if(typeof adminRender==='function')adminRender('attendance');
    return true;
  }

  async function handleDetected(raw){
    const nisn=String(raw||'').trim().replace(/\s+/g,'');
    if(!nisn)return;
    await stopScanner();
    const ok=await markPresentFromBarcode(nisn);
    if(ok){
      setTimeout(()=>{const modal=document.getElementById('adminBarcodeModal');if(modal?.classList.contains('show'))startScanner()},1200);
    }else{
      setTimeout(()=>{const modal=document.getElementById('adminBarcodeModal');if(modal?.classList.contains('show'))startScanner()},1200);
    }
  }

  async function scanLoop(){
    if(!scanning||!stream||!detector)return;
    const video=document.getElementById('adminBarcodeVideo');
    if(!video||video.readyState<2){timer=setTimeout(scanLoop,250);return}
    try{
      const results=await detector.detect(video);
      if(results&&results.length){
        const raw=results[0].rawValue||'';
        if(raw){await handleDetected(raw);return}
      }
    }catch(_){}
    timer=setTimeout(scanLoop,220);
  }

  async function startScanner(){
    const u=getCurrentUser();
    if(!u||u.role!=='admin'){toast('Login sebagai admin untuk menggunakan Scanner Barcode.');return}
    const video=document.getElementById('adminBarcodeVideo'),ph=document.getElementById('adminBarcodePlaceholder');
    if(!video)return;
    if(!('BarcodeDetector' in window)){
      setScannerStatus('Browser ini belum mendukung BarcodeDetector. Gunakan Chrome/Edge terbaru atau pilih gambar barcode.','error');
      if(ph){ph.style.display='grid';ph.querySelector('small').textContent='Gunakan tombol Pilih gambar barcode sebagai alternatif.'}
      return;
    }
    try{
      const supported=await BarcodeDetector.getSupportedFormats();
      const wanted=['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e'];
      const formats=wanted.filter(x=>supported.includes(x));
      detector=new BarcodeDetector({formats:formats.length?formats:['qr_code']});
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
      video.srcObject=stream;
      await video.play();
      scanning=true;
      if(ph)ph.style.display='none';
      setScannerStatus('Scanner aktif — arahkan kamera ke barcode siswa.','ready');
      scanLoop();
    }catch(e){
      setScannerStatus('Kamera tidak bisa dibuka. Izinkan akses kamera lalu coba lagi.','error');
      toast('Kamera scanner tidak dapat dibuka.');
      await stopScanner();
    }
  }

  async function stopScanner(){
    scanning=false;
    if(timer){clearTimeout(timer);timer=null}
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
    const video=document.getElementById('adminBarcodeVideo');
    if(video)video.srcObject=null;
    const ph=document.getElementById('adminBarcodePlaceholder');
    if(ph)ph.style.display='grid';
  }

  async function decodeBarcodeImage(file){
    const u=getCurrentUser();
    if(!u||u.role!=='admin'){toast('Fitur ini hanya untuk admin.');return}
    if(!('BarcodeDetector' in window)){toast('Browser tidak mendukung pembacaan barcode dari gambar. Gunakan kamera scanner.');return}
    try{
      const img=new Image();
      img.onload=async()=>{
        try{
          const formats=await BarcodeDetector.getSupportedFormats();
          detector=new BarcodeDetector({formats:formats.filter(x=>['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e'].includes(x))});
          const results=await detector.detect(img);
          if(results?.length)handleDetected(results[0].rawValue||'');
          else {setScannerStatus('Barcode tidak ditemukan pada gambar.','error');toast('Barcode tidak ditemukan.');}
        }catch(e){setScannerStatus('Gambar barcode tidak dapat dibaca.','error');toast('Gagal membaca barcode.')}
        URL.revokeObjectURL(img.src);
      };
      img.onerror=()=>toast('Gambar barcode tidak valid.');
      img.src=URL.createObjectURL(file);
    }catch(e){toast('Gagal memproses gambar barcode.')}
  }

  function openAdminBarcodeScanner(){
    const u=getCurrentUser();
    if(!u||u.role!=='admin'){toast('Scanner barcode hanya dapat dibuka oleh Administrator.');return}
    const modal=document.getElementById('adminBarcodeModal');if(!modal)return;
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
    setScannerStatus('Kamera belum aktif.','');
    setScannerResult('Belum ada scan','Hasil scan akan tampil di sini.','Menunggu barcode…',false);
  }

  function closeAdminBarcodeScanner(){
    stopScanner();
    const modal=document.getElementById('adminBarcodeModal');
    if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
  }

  function openStudentBarcode(){
    const u=getCurrentUser();
    if(!u||u.role!=='student'){toast('Login sebagai siswa untuk melihat Barcode Saya.');return}
    const modal=document.getElementById('studentBarcodeModal'),img=document.getElementById('studentBarcodeImage');
    if(!modal||!img)return;
    const account=barcodeAccount(u.nisn);
    if(!account){toast('Data barcode siswa tidak ditemukan.');return}
    document.getElementById('studentBarcodeName').textContent=account.name;
    document.getElementById('studentBarcodeNisn').textContent=account.nisn;
    document.getElementById('studentBarcodeDate').textContent='ID SISWA • XI TKJ 1';
    img.src='BARCODE%20SISWA/'+encodeURIComponent(account.nisn)+'.png';
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
  }

  function closeStudentBarcode(){
    const modal=document.getElementById('studentBarcodeModal');
    if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
  }

  window.openAdminBarcodeScanner=openAdminBarcodeScanner;
  window.closeAdminBarcodeScanner=closeAdminBarcodeScanner;
  window.openStudentBarcode=openStudentBarcode;

  document.getElementById('adminBarcodeStart')?.addEventListener('click',startScanner);
  document.getElementById('adminBarcodeStop')?.addEventListener('click',stopScanner);
  document.getElementById('adminBarcodeUpload')?.addEventListener('click',()=>document.getElementById('adminBarcodeFile')?.click());
  document.getElementById('adminBarcodeFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)decodeBarcodeImage(f);e.target.value=''});
  document.getElementById('adminBarcodeClose')?.addEventListener('click',closeAdminBarcodeScanner);
  document.getElementById('adminBarcodeModal')?.addEventListener('click',e=>{if(e.target.id==='adminBarcodeModal')closeAdminBarcodeScanner()});
  document.getElementById('studentBarcodeClose')?.addEventListener('click',closeStudentBarcode);
  document.getElementById('studentBarcodeClose2')?.addEventListener('click',closeStudentBarcode);
  document.getElementById('studentBarcodeModal')?.addEventListener('click',e=>{if(e.target.id==='studentBarcodeModal')closeStudentBarcode()});
  document.getElementById('studentBarcodeLink')?.addEventListener('click',e=>{e.preventDefault();document.getElementById('mobileMenu')?.classList.remove('show');openStudentBarcode()});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeAdminBarcodeScanner();
      closeStudentBarcode();
    }
  });
})();


/* ===== PREMIUM LOGIN MODE SWITCH ===== */
(()=>{
 const shell=document.getElementById('accountGuestView');
 if(!shell)return;
 const buttons=[...document.querySelectorAll('[data-auth-modal-view]')];
 const applyMode=(mode)=>{
   shell.classList.toggle('admin-mode',mode==='admin');
   shell.classList.toggle('student-mode',mode!=='admin');
   shell.dataset.loginMode=mode;
   document.documentElement.style.setProperty('--login-mode',mode);
   buttons.forEach(btn=>btn.classList.toggle('active',btn.dataset.authModalView===mode));
 };
 applyMode('student');
})();

/* ===== DASHBOARD CLOCK — ALWAYS ASIA/JAKARTA ===== */
(()=>{
 const update=()=>{
   const now=new Date();
   const opts={timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false};
   const dateOpts={timeZone:'Asia/Jakarta',weekday:'long',day:'2-digit',month:'long',year:'numeric'};
   const time=new Intl.DateTimeFormat('id-ID',opts).format(now);
   const date=new Intl.DateTimeFormat('id-ID',dateOpts).format(now);
   ['dashboardTime','liveClock'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=time});
   const d=document.getElementById('dashboardDate');if(d)d.textContent=date;
 };
 update();setInterval(update,1000);
})();
