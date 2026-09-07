(() => {
  'use strict';

  /* ================= УТИЛИТЫ ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let toastTm;
  const toast = (html, ms = 2200) => {
    const t = $('#toast');
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTm);
    toastTm = setTimeout(() => t.classList.remove('show'), ms);
  };
  const pad = (n) => String(n).padStart(2, '0');

  /* ================= ПРЕЛОАДЕР ================= */
  const preloader = $('#preloader');
  const body = document.body;
  if (preloader) {
    body.classList.add('no-scroll');
    const timeline = () => {
      body.classList.add('loaded');
      setTimeout(() => preloader.classList.add('stage-black'), 1700);
      setTimeout(() => preloader.classList.add('stage-white'), 2450);
      setTimeout(() => preloader.classList.add('done'), 2800);
      setTimeout(() => { preloader.remove(); body.classList.remove('no-scroll'); }, 3700);
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
    Promise.all([fontsReady, new Promise((r) => setTimeout(r, 2200))]).then(timeline);
  } else {
    body.classList.add('loaded');
  }

  /* ================= ЧАСЫ ================= */
  const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const tickClock = () => {
    const d = new Date();
    $('#clockTime').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    $('#clockDate').textContent = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* ================= ПЕРЕЛИСТЫВАНИЕ СЕКЦИЙ ================= */
  let currentPane = 'home';
  const CONTROLS = '.nav-item';

  function setActiveUI(name) {
    $$(CONTROLS).forEach((el) => el.classList.toggle('active', el.dataset.pane === name));
  }

  function showPane(name) {
    if (name === currentPane) { if (name === 'skills') animateBars(); return; }
    const active = $('.pane.active');
    const next = $(`.pane[data-pane="${name}"]`);
    if (!next) return;

    if (active && active !== next) {
      active.classList.remove('active');
      active.classList.add('out');
      active.addEventListener('animationend', () => active.classList.remove('out'), { once: true });
    }
    next.classList.remove('out');
    next.classList.add('active');
    currentPane = name;
    setActiveUI(name);
    if (name === 'skills') setTimeout(animateBars, 80);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $$(CONTROLS).forEach((el) => el.addEventListener('click', () => showPane(el.dataset.pane)));
  $$('[data-go]').forEach((el) => el.addEventListener('click', () => showPane(el.dataset.go)));

  $$('[data-soon]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toast('<i class="fa-solid fa-lock"></i> скоро появится');
    });
  });

  /* ================= ПРОГРЕСС-БАРЫ ================= */
  let barsAnimated = false;
  function animateBars() {
    if (barsAnimated) return;
    $$('.bar span').forEach((span) => { span.style.width = (span.dataset.level || 0) + '%'; });
    barsAnimated = true;
  }

  /* ================= УТИЛИТЫ ПИНГВИНОВ ================= */
  const MATRIX_LOCK = 50;
  const badge = $('#coinBadge');
  const coinN = $('#tokenCount');
  let tokens = Math.max(0, +(localStorage.getItem('flax_tokens') || 0));

  const bumpBadge = () => {
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  };
  const syncTokens = () => {
    coinN.textContent = tokens;
    $('#matrixToggle').disabled = tokens < MATRIX_LOCK;
    $('#mbLabel').textContent = tokens < MATRIX_LOCK ? 'матрица 🔒' : 'матрица';
  };
  const addTokens = (n) => {
    tokens += n;
    localStorage.setItem('flax_tokens', tokens);
    coinN.textContent = tokens;
    bumpBadge();
    syncTokens();
  };
  syncTokens();

  const pinguLayer = $('#pinguLayer');
  const catchPingu = (p) => {
    const r = p.getBoundingClientRect();
    p.remove();
    const gain = 1 + Math.floor(Math.random() * 3);
    const coin = document.createElement('div');
    coin.className = 'coin-fly';
    coin.style.left = (r.left + r.width / 2) + 'px';
    coin.style.top = (r.top + r.height / 2) + 'px';
    coin.innerHTML = '<span>🪙</span><b>+' + gain + '</b>';
    document.body.appendChild(coin);
    coin.addEventListener('animationend', () => coin.remove());
    addTokens(gain);
  };
  const spawnPingu = () => {
    const p = document.createElement('div');
    p.className = 'pingu';
    p.textContent = '🐧';
    p.style.left = Math.max(8, Math.random() * (innerWidth - 70)) + 'px';
    p.style.fontSize = (22 + Math.random() * 22) + 'px';
    p.style.setProperty('--dur', (5 + Math.random() * 4) + 's');
    p.style.setProperty('--drift', ((Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 90)).toFixed(0) + 'px');
    p.style.setProperty('--rot', ((Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 14)).toFixed(1) + 'deg');
    p.addEventListener('pointerdown', (e) => { e.stopPropagation(); catchPingu(p); });
    pinguLayer.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  };
  const schedulePingu = () => {
    if (!document.hidden && pinguLayer.children.length <= 5) spawnPingu();
    setTimeout(schedulePingu, 3400 + Math.random() * 5200);
  };
  setTimeout(schedulePingu, 3200);

  /* ================= ФОН ИЗ 0 И 1 ================= */
  const mcv = $('#matrixBg');
  const mctx = mcv.getContext('2d');
  const mFont = 16;
  let mDrops = [], mTimer = null;

  const sizeMatrix = () => {
    mcv.width = innerWidth;
    mcv.height = innerHeight;
    mDrops = Array(Math.ceil(mcv.width / mFont)).fill(1);
  };
  const mFrame = () => {
    mctx.fillStyle = 'rgba(5, 6, 12, 0.09)';
    mctx.fillRect(0, 0, mcv.width, mcv.height);
    mctx.fillStyle = '#30e0d0';
    mctx.font = mFont + 'px monospace';
    for (let i = 0; i < mDrops.length; i++) {
      mctx.fillText(Math.random() > 0.5 ? '1' : '0', i * mFont, mDrops[i] * mFont);
      if (mDrops[i] * mFont > mcv.height && Math.random() > 0.975) mDrops[i] = 0;
      mDrops[i]++;
    }
  };
  const startMatrix = () => { sizeMatrix(); clearInterval(mTimer); mTimer = setInterval(mFrame, 55); };
  const stopMatrix = () => { clearInterval(mTimer); mTimer = null; };

  $('#matrixToggle').addEventListener('click', () => {
    if ($('#matrixToggle').disabled) return;
    const on = document.body.classList.toggle('matrix-on');
    $('#mbLabel').textContent = on ? 'матрица: вкл' : 'матрица';
    if (on) startMatrix(); else stopMatrix();
  });
  addEventListener('resize', () => { if (document.body.classList.contains('matrix-on')) sizeMatrix(); });

  /* ==================== ФОНОВАЯ МУЗЫКА (лицензированные mp3) ==================== */
  const TRACKS = [
    { file: 'music/aries-beats-chill-trap.mp3', name: 'Aries Beats — Chill Trap', by: 'Aries Beats / auboutdufil.com', lic: 'CC BY 4.0' },
    { file: 'music/kaneel-chill-chill.mp3', name: 'Kaneel — Chill Chill', by: 'Kaneel / Camomille', lic: 'CC BY-NC-ND 4.0' },
    { file: 'music/dimdj-late-edit.mp3', name: 'dim.dj — Late Edit', by: 'dim.dj / digilog', lic: 'CC BY-NC-ND 4.0' },
  ];

  const Player = {
    audio: null, playing: false, trackIdx: 0,

    ensure() {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = 0.55;
      }
      return this.audio;
    },
    start() {
      const a = this.ensure();
      a.src = TRACKS[this.trackIdx].file;
      a.play();
      this.playing = true;
      this.ui();
    },
    pause() {
      if (this.audio) this.audio.pause();
      this.playing = false;
      this.ui();
    },
    toggle() {
      if (this.playing) this.pause();
      else this.start();
    },
    ui() {
      $('#disc').classList.toggle('paused', !this.playing);
      $('#playBtn i').className = this.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      $('#plStatus').textContent = this.playing ? 'музыка играет' : 'музыка выключена';
      $('#plTitle').textContent = TRACKS[this.trackIdx].name;
      $('#plAttr').textContent = TRACKS[this.trackIdx].by + ' · ' + TRACKS[this.trackIdx].lic;
      $('#musicToggle').classList.toggle('on', this.playing);
      $('#pbLabel').textContent = this.playing ? 'выключить' : 'музыка';
      $$('.p-track').forEach((b, i) => b.classList.toggle('active', i === this.trackIdx));
    },
  };

  $('#playBtn').addEventListener('click', () => {
    Player.toggle();
    hideHint();
  });
  $('#musicToggle').addEventListener('click', () => {
    Player.toggle();
    hideHint();
  });
  $$('.p-track').forEach((b) => {
    b.addEventListener('click', () => {
      Player.trackIdx = +b.dataset.k;
      if (Player.playing) Player.start();
      Player.ui();
    });
  });

  /* Подсказка про музыку */
  const hint = $('#hint');
  let hintTm;
  function hideHint() { hint.classList.remove('show'); clearTimeout(hintTm); }
  hintTm = setTimeout(() => hint.classList.add('show'), 4600);
  setTimeout(hideHint, 11000);
  document.addEventListener('click', () => { if (Player.playing) hideHint(); }, true);
})();