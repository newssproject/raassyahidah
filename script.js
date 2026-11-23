// ===== Data galeri (foto ada di assets/foto) =====
const CATEGORIES = {
  'kegiatan-kelas':        { label: 'Kegiatan Kelas', dot: '#FFD93B', n: 13 },
  'sentra-balok':          { label: 'Sentra Balok', dot: '#8ED1FC', n: 8 },
  'market-day':            { label: 'Cooking and Market Day', dot: '#FF8FAB', n: 8 },
  'hari-nasional':         { label: 'Hari Nasional', dot: '#7ED9A9', n: 10, order: [9, 10, 1, 2, 3, 4, 5, 6, 7, 8],
                             caps: ['Hari Kartini', 'Hari Kartini', 'Hari Kartini', '17 Agustus', '17 Agustus', '17 Agustus', 'Hari Batik', 'Hari Pahlawan', 'Hari Ayah', 'Hari Ayah'] },
  'pawai':                 { label: 'Pawai', dot: '#8ED1FC', n: 12 },
  'manasik-haji':          { label: 'Manasik Haji', dot: '#FF8FAB', n: 8, ext: ['png', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg'], layout: 'rows', order: [3, 2, 4, 6, 7, 1, 5, 8] },
  'belajar-quran':         { label: 'Belajar Qur\'an', dot: '#7ED9A9', n: 8 },
  'idul-adha':             { label: 'Idul Adha & Fitri', dot: '#7ED9A9', n: 10 },
  'fun-trip':              { label: 'Fun Trip', dot: '#C9B6FF', n: 7 },
  'porseni':               { label: 'Porseni', dot: '#FFB86B', n: 4 },
  'pentas-seni':           { label: 'Pentas Seni', dot: '#FFD93B', n: 5 },
  'parsel-lebaran':        { label: 'Membuat Parsel Lebaran', dot: '#FF8FAB', n: 6, ext: ['png', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg'] },
  'parenting':             { label: 'Parenting', dot: '#7ED9A9', n: 6 },
};

const photos = [];
for (const [key, c] of Object.entries(CATEGORIES)) {
  const nums = c.order || Array.from({ length: c.n }, (_, k) => k + 1);
  for (const i of nums) {
    const ext = Array.isArray(c.ext) ? c.ext[i - 1] : (c.ext || 'jpg');
    photos.push({ src: `assets/foto/${key}-${i}.${ext}`, cat: key, label: (c.caps && c.caps[i - 1]) || c.label });
  }
}

// selotip warna-warni & kemiringan polaroid
const TAPES = [
  'repeating-linear-gradient(45deg, rgba(255,143,171,.8) 0 8px, rgba(255,214,226,.8) 8px 16px)',
  'repeating-linear-gradient(45deg, rgba(142,209,252,.8) 0 8px, rgba(226,244,255,.8) 8px 16px)',
  'repeating-linear-gradient(45deg, rgba(255,217,59,.85) 0 8px, rgba(255,246,204,.85) 8px 16px)',
  'repeating-linear-gradient(45deg, rgba(126,217,169,.8) 0 8px, rgba(227,248,238,.8) 8px 16px)',
  'repeating-linear-gradient(45deg, rgba(201,182,255,.8) 0 8px, rgba(240,234,255,.8) 8px 16px)',
];
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5];

const galleryEl = document.getElementById('gallery');
const filtersEl = document.getElementById('filters');
const moreBtn = document.getElementById('moreBtn');
const PAGE = 999; // semua foto langsung tampil
let current = Object.keys(CATEGORIES)[0];
let shown = PAGE;
let visibleList = [];

function renderFilters() {
  const all = Object.entries(CATEGORIES).map(([k, c]) => [k, c.label, c.dot]);
  filtersEl.innerHTML = all.map(([k, l, d]) =>
    `<button data-cat="${k}" style="--dot:${d}" class="${k === current ? 'active' : ''}">${l}</button>`).join('');
}

// foto galeri muncul satu-satu saat di-scroll
const photoIO = new IntersectionObserver(entries => {
  let k = 0;
  entries.forEach(en => {
    // keluar layar → reset, jadi pas di-scroll balik animasinya main lagi
    if (!en.isIntersecting) { en.target.classList.remove('g-in'); return; }
    en.target.style.setProperty('--gd', `${k++ * 110}ms`);
    en.target.classList.add('g-in');
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

function renderGallery() {
  visibleList = photos.filter(p => p.cat === current);
  galleryEl.classList.toggle('rows', CATEGORIES[current].layout === 'rows');
  const list = visibleList.slice(0, shown);
  galleryEl.innerHTML = list.map((p, i) =>
    `<figure class="polaroid" data-i="${i}" style="--r:${TILTS[i % TILTS.length]}deg;--tape:${TAPES[i % TAPES.length]}">
       <img src="${p.src}" alt="${p.label}" loading="lazy">
       <figcaption>${p.label}</figcaption>
     </figure>`).join('');
  moreBtn.style.display = shown < visibleList.length ? '' : 'none';
  galleryEl.querySelectorAll('.polaroid').forEach(el => photoIO.observe(el));
}

filtersEl.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  current = b.dataset.cat;
  shown = PAGE;
  renderFilters();
  renderGallery();
});
moreBtn.addEventListener('click', () => { shown += PAGE; renderGallery(); });

renderFilters();
renderGallery();

// ===== Lightbox =====
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
let lbList = [];
let lbIndex = 0;

function openLB(list, i) {
  lbList = list; lbIndex = i; showLB();
  lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function showLB() {
  const item = lbList[lbIndex];
  lbImg.src = item.src; lbImg.alt = item.label; lbCap.textContent = item.label;
  const multi = lbList.length > 1;
  document.getElementById('lbPrev').style.display = multi ? '' : 'none';
  document.getElementById('lbNext').style.display = multi ? '' : 'none';
}
function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
function step(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; showLB(); }

galleryEl.addEventListener('click', e => {
  const f = e.target.closest('figure');
  if (f) openLB(visibleList.slice(0, shown), +f.dataset.i);
});
document.querySelectorAll('[data-lightbox]').forEach(fig => {
  fig.addEventListener('click', () => {
    const group = [...fig.parentElement.querySelectorAll('[data-lightbox]')];
    openLB(group.map(g => ({ src: g.dataset.src, label: g.querySelector('figcaption')?.textContent || '' })), group.indexOf(fig));
  });
});
document.getElementById('lbClose').onclick = closeLB;
document.getElementById('lbPrev').onclick = () => step(-1);
document.getElementById('lbNext').onclick = () => step(1);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

// ===== Judul huruf loncat-loncat warna-warni =====
const COLORS = ['#ffffff', '#FF8FAB', '#8ED1FC', '#7ED9A9', '#C9B6FF', '#FFB86B'];
document.querySelectorAll('.bouncy').forEach(el => {
  let n = 0;
  el.innerHTML = [...el.textContent].map(ch =>
    ch === ' ' ? ' ' : `<span style="--i:${n};--c:${COLORS[n++ % COLORS.length]}">${ch}</span>`).join('');
});

// ===== Syabee ngobrol =====
const bubble = document.getElementById('bubble');
const LINES = ['Halo teman-teman!', 'Aku Syabee!', 'Yuk belajar sambil main!', 'Selamat datang!', 'Jangan lupa berdoa ya', 'Kamu hebat!'];
let li = 0;
function nextLine() {
  li = (li + 1) % LINES.length;
  bubble.textContent = LINES[li];
  bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
}
setInterval(nextLine, 3200);
document.querySelector('.mascot-bee').addEventListener('click', e => { nextLine(); burst(e.clientX, e.clientY); });

// ===== Kilau di kursor & konfeti saat klik =====
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;
const SHAPES = ['star', 'heart', 'star'];
const COLS = ['#FFD93B', '#FF8FAB', '#8ED1FC', '#7ED9A9', '#C9B6FF'];

function sparkle(x, y, dist, size) {
  const s = document.createElement('span');
  s.className = 'sparkle';
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  s.innerHTML = `<svg style="fill:${COLS[Math.floor(Math.random() * COLS.length)]}"><use href="#${shape}"/></svg>`;
  const a = Math.random() * Math.PI * 2;
  s.style.left = x - size / 2 + 'px'; s.style.top = y - size / 2 + 'px';
  s.style.width = size + 'px'; s.style.height = size + 'px';
  s.style.setProperty('--dx', Math.cos(a) * dist + 'px');
  s.style.setProperty('--dy', Math.sin(a) * dist - 20 + 'px');
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 900);
}
function burst(x, y) {
  for (let i = 0; i < 10; i++) sparkle(x, y, 50 + Math.random() * 50, 14 + Math.random() * 10);
}
if (!reduce) {
  if (fine) {
    let last = 0;
    window.addEventListener('mousemove', e => {
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      sparkle(e.clientX, e.clientY, 20, 12);
    }, { passive: true });
  }
  document.addEventListener('click', e => {
    if (e.target.closest('.btn, .card, .misi, .filters button, .grad, .hero-stats div')) burst(e.clientX, e.clientY);
  });
}

// ===== Menu mobile =====
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
links.addEventListener('click', e => { if (e.target.closest('a')) { toggle.classList.remove('open'); links.classList.remove('open'); } });

// ===== Animasi muncul saat scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Tombol lebah ke atas =====
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 600), { passive: true });

// ===== Hanya satu video diputar sekaligus =====
document.querySelectorAll('video').forEach(v => v.addEventListener('play', () => {
  document.querySelectorAll('video').forEach(o => { if (o !== v) o.pause(); });
}));

document.getElementById('year').textContent = new Date().getFullYear();

// =========================================================
//  ANIMASI TAMBAHAN
// =========================================================
if (!reduce) {
  // muncul bergantian (stagger) + variasi gaya muncul
  const groups = [
    ['.cards', 'pop'], ['.misi-grid', 'pop'], ['.info-grid', 'pop'], ['.highlights', ''],
    ['.video-grid', 'pop'], ['.guru-grid', 'pop'], ['.fee-grid', 'from-left'], ['.values', 'from-right'],
  ];
  groups.forEach(([sel, cls]) => {
    document.querySelectorAll(sel).forEach(g => {
      [...g.children].forEach((el, i) => {
        el.style.setProperty('--d', `${i * 0.12}s`);
        if (cls && el.classList.contains('reveal')) el.classList.add(cls);
      });
    });
  });
  document.querySelectorAll('.about-photos, .wisuda-text').forEach(el => el.classList.add('from-left'));
  document.querySelectorAll('.about-text, .grad-strip').forEach(el => el.classList.add('from-right'));

  // urutan loncat ikon
  ['.cards', '.misi-grid', '.timeline', '.info-grid', '.values', '.highlights', '.grad-strip', '.guru-grid'].forEach(sel => {
    document.querySelectorAll(sel).forEach(g => [...g.children].forEach((el, i) => {
      el.style.setProperty('--n', i);
      el.querySelectorAll('.card-icon, .misi-ic, .t-ic, .info-ic, .v-ic, svg').forEach(x => x.style.setProperty('--n', i));
    }));
  });

  // lebah-lebah terbang lewat di berbagai section
  const roamSpots = ['#tentang', '#visi-misi', '#program', '#guru', '#galeri', '#video', '#wisuda', '#daftar'];
  roamSpots.forEach((sel, i) => {
    const sec = document.querySelector(sel);
    if (!sec) return;
    const rev = i % 2 === 1;
    const top = 15 + (i * 23) % 60;
    const dur = 18 + (i * 5) % 12;
    sec.insertAdjacentHTML('afterbegin',
      `<svg class="fly-bee roam${rev ? ' rev' : ''}" style="top:${top}%;animation-duration:${dur}s;animation-delay:-${i * 3}s" aria-hidden="true"><use href="#bee"/></svg>`);
  });

  // gelembung sabun
  document.querySelectorAll('.visimisi, .wisuda, .videos, .posters').forEach(sec => {
    let html = '';
    for (let i = 0; i < 7; i++) {
      const size = 14 + Math.random() * 30;
      html += `<span class="soap" aria-hidden="true" style="left:${Math.random() * 95}%;width:${size}px;height:${size}px;animation-duration:${9 + Math.random() * 9}s;animation-delay:-${Math.random() * 15}s"></span>`;
    }
    sec.insertAdjacentHTML('afterbegin', html);
  });

  // angka di header menghitung naik
  const counters = document.querySelectorAll('.hero-stats b');
  counters.forEach(b => {
    const m = b.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    const target = +m[1], suffix = m[2];
    let start = null;
    b.textContent = '0' + suffix;
    const tick = t => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1400, 1);
      b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 500);
  });
}

// garis madu progres scroll (dengan lebah kecil di ujungnya)
document.body.insertAdjacentHTML('afterbegin', '<div class="honey-progress" id="honeyBar" aria-hidden="true"><svg><use href="#bee"/></svg></div>');
const honeyBar = document.getElementById('honeyBar');
const updateBar = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  honeyBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
};
window.addEventListener('scroll', updateBar, { passive: true });
updateBar();

// ===== Akhirussanah makin meriah =====
(() => {
  const sec = document.getElementById('wisuda');
  if (!sec) return;
  const COLORS = ['#FFD93B', '#FF8FAB', '#8ED1FC', '#7ED9A9', '#C9B6FF', '#FFB86B'];
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // bendera segitiga di atas section
  let flags = '';
  for (let i = 0; i < 22; i++) flags += `<span style="--c:${COLORS[i % COLORS.length]};--i:${i}"></span>`;
  sec.insertAdjacentHTML('afterbegin', `<div class="bunting" aria-hidden="true">${flags}</div>`);

  // konfeti jatuh terus
  let conf = '';
  for (let i = 0; i < 34; i++) {
    const shape = pick(['', 'round', 'long']);
    conf += `<i class="confetto ${shape}" aria-hidden="true" style="left:${Math.random() * 100}%;background:${pick(COLORS)};animation-duration:${6 + Math.random() * 7}s,${1.2 + Math.random() * 1.6}s;animation-delay:-${Math.random() * 12}s,0s"></i>`;
  }
  sec.insertAdjacentHTML('afterbegin', conf);

  // topi toga dilempar ke atas
  let caps = '';
  [12, 48, 84].forEach((x, i) => {
    caps += `<svg class="toss-cap" aria-hidden="true" style="left:${x}%;animation-delay:${i * 1.6}s"><use href="#i-cap"/></svg>`;
  });
  sec.insertAdjacentHTML('afterbegin', caps);

  // bintang berkelip di sekitar foto wisuda
  const strip = sec.querySelector('.grad-strip');
  if (strip) {
    let tw = '';
    for (let i = 0; i < 9; i++) {
      tw += `<svg class="twinkle" aria-hidden="true" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;fill:${pick(COLORS)};animation-delay:-${Math.random() * 3}s"><use href="#star"/></svg>`;
    }
    strip.insertAdjacentHTML('beforeend', tw);
    strip.querySelectorAll('.grad').forEach((g, i) => g.style.setProperty('--n', i));
  }

  // klik foto wisuda → ledakan konfeti
  sec.querySelectorAll('.grad').forEach(g => g.addEventListener('click', e => {
    const r = sec.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('i');
      p.className = 'burst';
      const ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 110;
      p.style.cssText = `left:${x}px;top:${y}px;background:${pick(COLORS)};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 40}px;--rot:${Math.random() * 720 - 360}deg`;
      sec.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }));
})();

/* ====== MUSIK LATAR (taman) ====== */
(() => {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('musicBtn');
  if (!audio || !btn) return;
  audio.volume = 0.45;
  audio.loop = true;

  let wantOn = true;                         // musik selalu nyala, kecuali pengunjung sendiri yang mute

  const sync = () => btn.classList.toggle('on', !audio.paused);
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);

  const EVENTS = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'click', 'keydown'];
  const stopUnlock = () => EVENTS.forEach(t => removeEventListener(t, unlock, true));
  const tryPlay = () => audio.play().then(() => { sync(); stopUnlock(); }).catch(() => {});

  // browser sering blok autoplay bersuara → terus coba di setiap interaksi sampai berhasil bunyi
  function unlock(e) {
    if (btn.contains(e.target)) return;      // klik tombol diurus sendiri
    if (wantOn && audio.paused) tryPlay();
  }
  EVENTS.forEach(t => addEventListener(t, unlock, true));

  // layar pembuka: klik "Masuk" (atau di mana aja di layarnya) → musik nyala & layar hilang
  const splash = document.getElementById('splash');
  if (splash) {
    document.body.classList.add('splash-open');
    splash.addEventListener('click', () => {
      tryPlay();
      splash.classList.add('out');
      document.body.classList.remove('splash-open');
      setTimeout(() => splash.remove(), 600);
    }, { once: true });
  } else {
    tryPlay();
  }

  // tombol speaker = satu-satunya cara matiin musik
  btn.addEventListener('click', () => {
    btn.classList.add('touched');
    wantOn = audio.paused;
    if (wantOn) tryPlay(); else audio.pause();
  });

  // kalau musik berhenti sendiri (misal balik dari tab lain), nyalain lagi
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && wantOn && audio.paused) tryPlay();
  });
  audio.addEventListener('ended', () => { if (wantOn) { audio.currentTime = 0; tryPlay(); } });
})();
