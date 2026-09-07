(() => {
  'use strict';

  /* ================= УТИЛИТЫ ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toast = (html, ms = 2200) => {
    const t = $('#toast');
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toast._tm);
    toast._tm = setTimeout(() => t.classList.remove('show'), ms);
  };
  const pad = (n) => String(n).padStart(2, '0');
  const fmtTime = (sec) => {
    sec = Math.max(0, Math.floor(sec));
    return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
  };

  /* Год в подвале-нет-подвала, но пусть будет */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
      setTimeout(() => {
        preloader.remove();
        body.classList.remove('no-scroll');
      }, 3700);
    };
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
    Promise.all([fontsReady, new Promise((r) => setTimeout(r, 2200))]).then(timeline);
  } else {
    body.classList.add('loaded');
  }

  /* ================= НАВИГАЦИЯ (перелистывание) ================= */
  const CONTROLS = '.menubar-item, .sidebar-item, .dock-item';
  let currentPane = 'home';

  function setActiveUI(name) {
    $$(CONTROLS).forEach((el) => {
      el.classList.toggle('active', el.dataset.pane === name);
    });
  }

  function showPane(name, { skipAni = false } = {}) {
    if (name === currentPane) {
      if (name === 'skills') animateBars();
      return;
    }
    const active = $('.content-pane.active');
    const next = $(`.content-pane[data-pane="${name}"]`);
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
    window.dispatchEvent(new CustomEvent('pane:change', { detail: name }));
    if (name === 'skills') setTimeout(animateBars, 60);
  }

  $$(CONTROLS).forEach((el) => {
    el.addEventListener('click', () => showPane(el.dataset.pane));
  });

  /* Соцсети-"скоро" */
  $$('[data-soon]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toast('<i class="fa-solid fa-lock"></i> скоро появится');
    });
  });

  /* Дорожки света в шапке окна — чисто декоративно */
  ['close', 'min', 'max'].forEach(() => '');
  $('.light.close') && $('.light.close').addEventListener('click', () => toast('окно не шатается, вы же видите?'));
  $('.light.min') && $('.light.min').addEventListener('click', () => showPane('home'));

  /* ================= ЧАСЫ И UPTIME ================= */
  const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  function tickClock() {
    const d = new Date();
    $('#clockTime').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    $('#clockDate').textContent = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  const t0 = Date.now();
  setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    $('#uptime').textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
  }, 1000);

  /* ================= ПРОГРЕСС-БАРЫ ================= */
  let barsAnimated = false;
  function animateBars() {
    if (barsAnimated) return;
    $$('#skillCard .bar span').forEach((span) => {
      span.style.width = (span.dataset.level || 0) + '%';
    });
    barsAnimated = true;
  }

  /* ================= МУЗЫКА (Web Audio синтез) ================= */
  const TRACKS = [
    { id: 'neon', name: 'Неоновый драйв', bpm: 118, key: 'Am',
      bass: [45, 45, 45, 45, 41, 41, 41, 41, 48, 48, 48, 48, 43, 43, 43, 43],
      arp: [69, 72, 76, 81, 76, 72, 69, 72, 76, 84, 81, 76, 72, 76, 72, 69],
      chord: [60, 64, 67], style: 'arp' },
    { id: 'aurora', name: 'Аврора', bpm: 92, key: 'F#m',
      bass: [42, 42, 47, 45, 40, 40, 44, 42],
      arp: [66, 69, 73, 78, 73, 69, 66, 69, 71, 74, 78, 83, 78, 74, 71, 74],
      chord: [57, 60, 64], style: 'pad' },
    { id: 'night', name: 'Ночная смена', bpm: 100, key: 'Cmaj7',
      bass: [36, 36, 38, 36, 43, 43, 41, 41],
      arp: [60, 62, 64, 67, 62, 60, 64, 67, 59, 62, 64, 67, 60, 64, 67, 72],
      chord: [60, 64, 67], style: 'lofi' },
  ];

  const Music = {
    ctx: null,
    master: null,
    playing: false,
    trackIdx: 0,
    step: 0,
    stepMs: () => 60000 / TRACKS[Music.trackIdx].bpm / 4,
    totalSteps: 48 * 16,
    schedTime: 0,
    timer: null,
    uiTimer: null,

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.45;
        this.master.connect(this.ctx.destination);
        this.noiseBuf = this.makeNoise();
      }
      return this.ctx;
    },

    makeNoise() {
      const n = this.ctx.sampleRate * 0.5;
      const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const out = b.getChannelData(0);
      for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
      return b;
    },

    midi(m) { return 440 * Math.pow(2, (m - 69) / 12); },

    env(gainNode, t, a, d, peak) {
      const g = gainNode.gain;
      g.setValueAtTime(0.0001, t);
      g.linearRampToValueAtTime(peak, t + a);
      g.exponentialRampToValueAtTime(0.0001, t + a + d);
    },

    osc(type, freq, t, dur, peak, dest, filterFreq) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = this.ctx.createGain();
      this.env(g, t, 0.01, dur, peak);
      if (filterFreq) {
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = filterFreq;
        o.connect(f); f.connect(g);
      } else o.connect(g);
      g.connect(dest || this.master);
      o.start(t); o.stop(t + dur + 0.05);
    },

    noise(t, dur, peak, hp) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = hp || 6000;
      const g = this.ctx.createGain();
      this.env(g, t, 0.002, dur, peak);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + dur + 0.05);
    },

    playNote(t, freq, dur, peak, type, filterFreq) {
      this.osc(type || 'sawtooth', freq, t, dur, peak, this.master, filterFreq);
    },

    kick(t) {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      const g = this.ctx.createGain();
      const gg = g.gain;
      gg.setValueAtTime(0.9, t);
      gg.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.22);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.3);
    },

    hat(t, open) {
      this.noise(t, open ? 0.25 : 0.05, open ? 0.25 : 0.12, 7000);
    },

    snare(t) {
      this.noise(t, 0.16, 0.35, 1700);
      this.osc('triangle', 180, t, 0.1, 0.25);
    },

    scheduleStep(t, step) {
      const tr = TRACKS[this.trackIdx];
      const bar = Math.floor(step / 16) % 16;
      const s = step % 16;
      const stepSec = this.stepMs() / 1000;

      const root = tr.bass[bar % tr.bass.length];
      const bassFreq = this.midi(root);
      const bassType = tr.style === 'pad' ? 'sine' : 'triangle';

      this.bass(root, t, bassFreq, stepSec, bassType);

      if (tr.style === 'arp' || tr.style === 'lofi') {
        const n = tr.arp[s];
        this.playNote(t, this.midi(n), stepSec * 0.9, 0.16 * (tr.style === 'lofi' ? 0.5 : 1),
          tr.style === 'lofi' ? 'triangle' : 'square', 2600);
      } else {
        const n = tr.arp[s];
        this.playNote(t, this.midi(n) * 2, stepSec * 1.4, 0.1, 'sine', 1200);
      }

      if (s % 4 === 0) this.kick(t);
      if (s % (tr.style === 'pad' ? 8 : 4) === 2) this.hat(t, false);
      if (tr.style === 'arp' && s >= 12) this.hat(t, true);

      if (tr.style === 'pad' || tr.style === 'lofi') {
        const cg = this.ctx.createGain();
        cg.gain.setValueAtTime(0.0001, t);
        cg.gain.linearRampToValueAtTime(0.12, t + 0.5);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + stepSec * 15);
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 900 + (s * 40);
        tr.chord.forEach((m, i) => {
          const o = this.ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = this.midi(m + (bar % 2) * 12);
          o.connect(f);
          if (i === 1) {
            const det = this.ctx.createOscillator();
            det.type = 'sawtooth'; det.frequency.value = this.midi(m + 12) * 1.002;
            det.connect(f); det.start(t); det.stop(t + stepSec * 16);
          }
          o.start(t); o.stop(t + stepSec * 16);
        });
        f.connect(cg); cg.connect(this.master);
      }
    },

    bass(root, t, freq, stepSec, type) {
      if (root) {
        this.osc(type, freq, t, stepSec * 0.92, 0.4, this.master, 700);
        this.osc('sine', freq * 2, t, stepSec * 0.92, 0.12);
      }
    },

    start() {
      const ctx = this.ensure();
      ctx.resume();
      this.schedTime = ctx.currentTime;
      this.playing = true;
      this.timer = setInterval(() => this.tick(), 40);
      this.uiTimer = setInterval(() => this.updateUI(), 180);
      this.updateUI(true);
      this.render();
    },

    tick() {
      const t = this.ctx.currentTime;
      while (this.schedTime < t + 0.22) {
        this.scheduleStep(this.schedTime, this.step % this.totalSteps);
        this.step++;
        this.schedTime += this.stepMs() / 1000;
      }
    },

    pause() {
      this.playing = false;
      clearInterval(this.timer);
      clearInterval(this.uiTimer);
      this.render();
      this.updateUI(true);
    },

    toggle() {
      if (this.playing) this.pause();
      else this.start();
      this.render();
    },

    setTrack(i) {
      if (this.trackIdx === i && this.playing) { this.pause(); return; }
      this.trackIdx = i;
      this.step = 0;
      if (this.ctx) this.schedTime = this.ctx.currentTime;
      this.render();
    },

    seek(frac) {
      if (!this.ctx) return;
      this.step = Math.floor(frac * this.totalSteps);
      this.schedTime = this.ctx.currentTime;
      this.updateUI(true);
    },

    updateUI(force) {
      const t = TRACKS[this.trackIdx];
      const frac = this.totalSteps ? this.step / this.totalSteps : 0;
      const sec = frac * this.totalSteps * this.stepMs() / 1000;
      const total = this.totalSteps * this.stepMs() / 1000;
      if (force || $('#scrubFill')) {
        $('#scrubFill').style.width = (frac * 100) + '%';
        $('#timeBox').textContent = `${fmtTime(sec)} / ${fmtTime(total)}`;
      }
      if (force) {
        $('#nowTitle').textContent = t.name;
        $('#nowArtist').textContent = `flaxss-jams · ${t.key} · ${t.bpm} BPM`;
        $('#nowStatus').textContent = this.playing ? 'играет' : 'на паузе';
      }
    },

    render() {
      const disc = $('#disc');
      disc.classList.toggle('paused', !this.playing);
      $('#playBtn i').className = this.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      const chip = $('#musicChip');
      chip.classList.toggle('playing', this.playing);
      $('#chipLabel').textContent = this.playing ? TRACKS[this.trackIdx].name.toLowerCase() : 'выкл';

      $$('#trackList .track-row').forEach((row, i) => {
        const is = i === this.trackIdx;
        row.classList.toggle('active', is);
        row.querySelector('.track-play-ico').className =
          is && this.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        row.querySelector('.track-idx').textContent =
          is && this.playing ? '▶' : pad(i + 1);
      });
    },
  };

  /* Рендер плейлиста */
  const trackList = $('#trackList');
  TRACKS.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'track-row';
    row.dataset.idx = i;
    row.innerHTML = `
      <div class="track-meta">
        <span class="track-idx">${pad(i + 1)}</span>
        <div>
          <div class="track-name">${t.name}</div>
          <div class="track-artist">${t.artist || 'flaxss-jams'} · ${t.key}</div>
        </div>
      </div>
      <span class="track-bpm">${t.bpm} BPM</span>
      <i class="track-play-ico fa-solid fa-play"></i>`;
    row.addEventListener('click', () => {
      if (i === Music.trackIdx) Music.toggle();
      else { Music.setTrack(i); if (!Music.playing) Music.toggle(); }
    });
    trackList.appendChild(row);
  });

  $('#playBtn').addEventListener('click', () => Music.toggle());
  $('#musicChip').addEventListener('click', () => {
    if (!Music.playing && !Music.ctx) {
      Music.trackIdx = (Music.trackIdx + 1) % TRACKS.length;
    }
    Music.toggle();
  });
  $('#scrub').addEventListener('click', (e) => {
    const r = $('#scrub').getBoundingClientRect();
    Music.seek((e.clientX - r.left) / r.width);
    if (!Music.playing && Music.ctx) Music.updateUI(true);
  });

  /* Обновляем всё при смене панели */
  window.addEventListener('pane:change', (e) => {
    if (e.detail === 'music') Music.updateUI(true);
  });

  /* Приветственный тост */
  setTimeout(() => toast('<i class="fa-brands fa-linux"></i> добро пожаловать в моё окно'), 4100);
})();