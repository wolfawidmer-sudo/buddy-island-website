// Kleine Vorschau-Animation: zeigt, was das Island alles kann.
(function () {
  const island = document.getElementById('demoIsland');
  const label = document.getElementById('demoLabel');
  const small = document.getElementById('demoSmall');
  const caption = document.getElementById('demoCaption');
  const screen = document.querySelector('.screen');
  const cursor = document.getElementById('demoCursor');
  if (!island) return;

  const scenes = [
    { state: 'idle', label: '', caption: 'Im Ruhezustand zeigt Buddy nur seine Augen.', ms: 2600 },
    { state: 'idle', label: '', notch: true, caption: 'Nach oben gezogen wird das Island zur schwarzen Kerbe am Rand.', ms: 2600 },
    { state: 'busy', label: 'denkt …', caption: 'Frag etwas – Buddy denkt lokal oder mit Claude, OpenAI, Grok oder Gemini nach.', ms: 2400 },
    { state: 'music', label: 'Blinding Lights · The Weeknd', caption: 'Musik erscheint mit Cover, die Balken folgen dem Ton.', ms: 3000 },
    { state: 'peek', small: 'WhatsApp', label: 'Lea: Kommst du heute ins Training?', caption: 'Mitteilungen kommen oben statt unten rechts.', ms: 3200 },
    { state: 'timer', label: 'Pizza  9:58', caption: '«Stell einen Timer für die Pizza.»', ms: 2600, tick: true },
    { state: 'control', label: 'Klickt …', caption: 'Auf Wunsch bedient Buddy den PC – der Rand zeigt, dass er hinschaut.', ms: 4200, glow: true },
  ];

  let i = 0;
  let tickTimer = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(scene) {
    island.dataset.state = scene.state;
    island.classList.toggle('notch', Boolean(scene.notch));
    label.textContent = scene.label;
    small.textContent = scene.small || '';
    caption.textContent = scene.caption;
    screen.classList.toggle('glowing', Boolean(scene.glow));
    clearInterval(tickTimer);
    if (scene.tick) {
      let s = 598;
      tickTimer = setInterval(() => {
        s -= 1;
        label.textContent = `Pizza  ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      }, 1000);
    }
    if (scene.glow) moveCursor();
  }

  function moveCursor() {
    const spots = [[28, 40], [62, 55], [45, 30]];
    spots.forEach(([x, y], n) => {
      setTimeout(() => {
        cursor.style.left = `${x}%`;
        cursor.style.top = `${y}%`;
        setTimeout(() => {
          cursor.classList.remove('click');
          void cursor.offsetWidth;
          cursor.classList.add('click');
        }, 900);
      }, n * 1300);
    });
  }

  function next() {
    show(scenes[i]);
    const ms = scenes[i].ms;
    i = (i + 1) % scenes.length;
    if (!reduced) setTimeout(next, ms);
  }

  // Animation nur laufen lassen, wenn die Vorschau sichtbar ist
  let started = false;
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && !started) {
      started = true;
      next();
    }
  });
  io.observe(screen);
})();

// Vorschauen «Neu in 0.4»: Notch, Visualizer, Anbieter-Auswahl
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const notch = document.getElementById('mockNotch');
  const hint = document.getElementById('mockNotchHint');
  const bars = [...document.querySelectorAll('#mockBars i')];
  const provider = document.getElementById('mockProvider');
  const model = document.getElementById('mockModel');
  const section = document.getElementById('neu');
  if (!section || reduced) return;
  let visible = false;
  new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting); if (visible) loop(); }).observe(section);

  // Notch: abwechselnd hochziehen und zurückholen
  let up = false;
  setInterval(() => {
    if (!visible || !notch) return;
    up = !up;
    notch.classList.toggle('is-notch', up);
    if (hint) hint.textContent = up ? 'Klicken oder nach unten ziehen' : 'Nach oben ziehen';
  }, 2600);

  // Anbieter-Auswahl durchschalten
  const options = [['Lokal (Hugging Face)', 'Qwen2.5 3B · bereit'], ['Anthropic Claude', 'Automatisch'], ['OpenAI', 'gpt-4o-mini'], ['xAI Grok', 'Automatisch'], ['Google Gemini', 'gemini-2.5-flash']];
  let o = 0;
  setInterval(() => {
    if (!visible || !provider) return;
    o = (o + 1) % options.length;
    provider.style.opacity = model.style.opacity = '0';
    setTimeout(() => { provider.textContent = options[o][0]; model.textContent = options[o][1]; provider.style.opacity = model.style.opacity = '1'; }, 250);
  }, 2200);

  // Visualizer: gleiche Hüllkurve wie in der App (schneller Anstieg, langsames Abklingen)
  const ATTACK = [0.55, 0.6, 0.65, 0.6, 0.55, 0.5, 0.45];
  const DECAY = [0.05, 0.06, 0.07, 0.06, 0.05, 0.045, 0.04];
  const level = bars.map(() => 0.2);
  let raf = 0;
  function loop() {
    if (raf || !bars.length) return;
    const step = (ts) => {
      raf = 0;
      if (!visible) return;
      const beat = Math.pow(Math.max(0, Math.sin(ts / 1000 * Math.PI * 2 * (171 / 120))), 6); // 171 BPM
      bars.forEach((b, i) => {
        const band = 0.35 + 0.65 * beat * (1 - i * 0.07) + 0.18 * Math.sin(ts / (180 + i * 37) + i) * Math.random();
        const want = Math.min(1, Math.max(0.12, band));
        const cur = level[i];
        level[i] = want > cur ? cur + (want - cur) * ATTACK[i] : Math.max(want, cur - DECAY[i]);
        b.style.transform = `scaleY(${level[i].toFixed(3)})`;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
})();

// Download-Knopf direkt auf den neusten Installer zeigen lassen
(function () {
  const btn = document.getElementById('downloadBtn');
  const info = document.getElementById('downloadInfo');
  if (!btn || !window.fetch) return;
  fetch('https://api.github.com/repos/wolfawidmer-sudo/buddy-island/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((release) => {
      if (!release) return;
      const asset = (release.assets || []).find((a) => /Setup.*\.exe$/i.test(a.name));
      if (!asset) return;
      btn.href = asset.browser_download_url;
      if (info) info.textContent = `Gratis · Version ${String(release.tag_name || '').replace(/^v/, '')} · ${Math.round(asset.size / 1e6)} MB`;
    })
    .catch(() => {});
})();
