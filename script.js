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
    { state: 'busy', label: 'denkt …', caption: 'Frag etwas: Buddy denkt lokal oder mit Claude, OpenAI, Grok oder Gemini nach.', ms: 2400 },
    { state: 'music', label: 'Midnight Drive · Nova Lane', caption: 'Läuft Musik, folgen Balken und Bildschirmrand dem echten Ton.', ms: 4200, music: true },
    { state: 'peek', small: 'WhatsApp', label: 'Lea: Kommst du heute ins Training?', caption: 'Mitteilungen kommen oben statt unten rechts.', ms: 3200 },
    { state: 'timer', label: 'Pizza  9:58', caption: '«Stell einen Timer für die Pizza.»', ms: 2600, tick: true },
    { state: 'control', label: 'Klickt …', caption: 'Bedient Buddy länger den PC, leuchtet der Rand.', ms: 4200, glow: true },
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
    screen.classList.toggle('music', Boolean(scene.music));
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

// Immer die neuste Version: Download-Knopf, Versionsnummern und «Neu in …» kommen von GitHub.
// Neuigkeiten stehen in whats-new.json im App-Repository (eine Quelle für Website und Release-Notizen).
(function () {
  const REPO = 'wolfawidmer-sudo/buddy-island';
  const btn = document.getElementById('downloadBtn');
  const info = document.getElementById('downloadInfo');
  const list = document.getElementById('newsList');
  const date = document.getElementById('newsDate');
  if (!window.fetch) return;

  const parts = (v) => String(v || '').replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const cmp = (a, b) => { const x = parts(a); const y = parts(b); for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
  const getJson = (url) => fetch(url, { headers: { Accept: 'application/vnd.github+json' } }).then((r) => (r.ok ? r.json() : null));

  function setVersion(version) {
    const short = parts(version).slice(0, 2).join('.');
    document.querySelectorAll('[data-version]').forEach((n) => { n.textContent = `Version ${version}`; });
    document.querySelectorAll('[data-version-short]').forEach((n) => { n.textContent = short; });
  }

  function renderNews(data, version) {
    if (!list || !data || !Array.isArray(data.versions)) return;
    const [maj, min] = parts(version);
    // Alle Einträge der neusten Hauptversion (z. B. 0.7.0 und 0.7.1), neueste zuerst, nichts Unveröffentlichtes
    const entries = data.versions.filter((v) => { const [a, b] = parts(v.version); return a === maj && b === min && cmp(v.version, version) <= 0; })
      .sort((a, b) => cmp(b.version, a.version));
    const items = [];
    for (const e of entries) {
      for (const h of e.highlights || []) items.push({ ...h, fix: e.version !== `${maj}.${min}.0` && entries.length > 1 });
    }
    if (!items.length) return;
    list.textContent = '';
    for (const h of items.slice(0, 6)) {
      const card = document.createElement('article');
      card.className = 'news-item' + (h.fix ? ' fix' : '');
      const t = document.createElement('h3'); t.textContent = h.title;
      const p = document.createElement('p'); p.textContent = h.text;
      card.append(t, p);
      list.appendChild(card);
    }
  }

  getJson(`https://api.github.com/repos/${REPO}/releases/latest`).then((release) => {
    if (!release) return;
    const version = String(release.tag_name || '').replace(/^v/, '');
    if (version) setVersion(version);
    if (date && release.published_at) {
      date.textContent = new Date(release.published_at).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const asset = (release.assets || []).find((a) => /Setup.*\.exe$/i.test(a.name));
    if (asset && btn) {
      btn.href = asset.browser_download_url;
      if (info) info.textContent = `Gratis · ${Math.round(asset.size / 1e6)} MB`;
    }
    return fetch(`https://raw.githubusercontent.com/${REPO}/main/whats-new.json`).then((r) => (r.ok ? r.json() : null)).then((data) => renderNews(data, version));
  }).catch(() => {});
})();
