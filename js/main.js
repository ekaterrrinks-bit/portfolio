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

  /* ================= ФОНОВАЯ МУЗЫКА (Web Audio) ================= */
  const TRACKS = [
    { name: 'Неоновый драйв', bpm: 112, bass: [45, 45, 45, 45, 41, 41, 41, 41, 43, 43, 43, 43, 48, 48, 48, 48],
      arp: [69, 72, 76, 81, 76, 72, 69, 72, 76, 84, 81, 76, 72, 76, 72, 69], style: 'synth' },
    { name: 'Аврора', bpm: 88, bass: [42, 42, 47, 45, 40, 40, 44, 42],
      arp: [66, 69, 73, 78, 73, 69, 66, 69, 71, 74, 78, 83, 78, 74, 71, 74], style: 'pad' },
    { name: 'Лунная тропа', bpm: 96, bass: [36, 36, 38, 36, 43, 43, 41, 41],
      arp: [60, 62, 64, 67, 62, 60, 64, 67, 59, 62, 64, 67, 60, 64, 67, 72], style: 'warm' },
  ];

  const Player = {
    ctx: null, master: null, playing: false, trackIdx: 0,
    step: 0, schedTime: 0, totalSteps: 48 * 16, timer: null,
    stepMs: () => 60000 / TRACKS[Player.trackIdx].bpm / 4,

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.28;
        this.master.connect(this.ctx.destination);
        const n = this.ctx.sampleRate * 0.5;
        const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        this.noise = b;
      }
      return this.ctx;
    },
    midi(m) { return 440 * Math.pow(2, (m - 69) / 12); },
    env(g, t, a, d, peak) {
      g.setValueAtTime(0.0001, t);
      g.linearRampToValueAtTime(peak, t + a);
      g.exponentialRampToValueAtTime(0.0001, t + a + d);
    },
    tone(type, freq, t, dur, peak, filterF) {
      const o = this.ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      const g = this.ctx.createGain();
      this.env(g, t, 0.008, dur, peak);
      if (filterF) {
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = filterF;
        o.connect(f); f.connect(g);
      } else o.connect(g);
      g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.05);
    },
    hitNoise(t, dur, peak, hp) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = hp;
      const g = this.ctx.createGain();
      this.env(g, t, 0.002, dur, peak);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + dur + 0.05);
    },
    kick(t) {
      const o = this.ctx.createOscillator(); o.type = 'sine';
      const g = this.ctx.createGain();
      const gg = g.gain;
      gg.setValueAtTime(0.75, t);
      gg.exponentialRampToValueAtTime(0.001, t + 0.26);
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.2);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.3);
    },

    schedule(t, step) {
      const tr = TRACKS[this.trackIdx];
      const bar = Math.floor(step / 16) % 8;
      const s = step % 16;
      const ms = this.stepMs() / 1000;
      const root = tr.bass[bar % tr.bass.length];

      if (tr.style === 'pad') {
        this.tone('sine', this.midi(root), t, ms, 0.4);
      } else {
        this.tone('triangle', this.midi(root), t, ms * 0.9, 0.32);
        this.tone('sine', this.midi(root) * 2, t, ms * 0.9, 0.1);
      }

      const n = tr.arp[s];
      if (tr.style === 'pad') this.tone('sine', this.midi(n) * 2, t, ms * 1.3, 0.07, 1400);
      else this.tone(tr.style === 'warm' ? 'triangle' : 'square', this.midi(n), t, ms * 0.85, 0.12, 2400);

      if (s % 4 === 0) this.kick(t);
      if (s % 4 === 2) this.hitNoise(t, 0.05, 0.1, 6500);

      // мягкие аккорды
      const chords = [[60, 64, 67], [57, 60, 64], [55, 59, 62], [53, 57, 60]];
      if (tr.style !== 'synth') {
        const acc = chords[bar % 4];
        const g = this.ctx.createGain();
        this.env(g.gain, t, 0.6, ms * 14, 0.05);
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = 800 + s * 30;
        acc.forEach((m) => {
          const o = this.ctx.createOscillator();
          o.type = 'sawtooth'; o.frequency.value = this.midi(m + (bar % 2) * 12);
          o.connect(f); o.start(t); o.stop(t + ms * 16);
        });
        f.connect(g); g.connect(this.master);
      }
    },

    tick() {
      const t = this.ctx.currentTime;
      while (this.schedTime < t + 0.22) {
        this.schedule(this.schedTime, this.step % this.totalSteps);
        this.step++;
        this.schedTime += this.stepMs() / 1000;
      }
    },

    start() {
      const ctx = this.ensure();
      ctx.resume();
      this.schedTime = ctx.currentTime;
      this.playing = true;
      this.timer = setInterval(() => this.tick(), 40);
      this.ui();
    },
    pause() {
      this.playing = false;
      clearInterval(this.timer);
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
      Player.step = 0;
      if (Player.playing && Player.ctx) Player.schedTime = Player.ctx.currentTime;
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