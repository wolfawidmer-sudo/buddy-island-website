// Buddy Island – Website. Kein Framework, alles optional: ohne JavaScript bleibt die Seite vollständig lesbar.
document.documentElement.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Navigation: Insel klappt auf kleinen Bildschirmen auf, aktiver Abschnitt ist markiert ----------
(function () {
  const nav = document.getElementById('nav');
  const toggle = nav && nav.querySelector('.nav-toggle');
  if (!nav) return;
  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    }
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });

  const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
  if (!links.length) return;
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const visible = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) visible.set(e.target.id, e.isIntersecting);
    const current = sections.find((s) => visible.get(s.id));
    links.forEach((a) => a.setAttribute('aria-current', String(Boolean(current) && a.getAttribute('href') === `#${current.id}`)));
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
})();

// ---------- Hero: echte Zustände des Islands nacheinander ----------
(function () {
  const demo = document.getElementById('heroDemo');
  if (!demo) return;
  const caption = document.getElementById('heroCaption');
  const imgs = [...demo.querySelectorAll('[data-scene]')];
  const scenes = [
    { id: 'idle', ms: 2600, text: 'Im Ruhezustand zeigt Buddy nur seine Augen.' },
    { id: 'music', ms: 4200, text: 'Läuft Musik, zeigt Buddy das Cover und der Bildschirmrand leuchtet im Takt.' },
    { id: 'notify', ms: 3400, text: 'Neue Nachrichten erscheinen kurz oben, wo du hinschaust.' },
    { id: 'timer', ms: 2600, text: 'Ein laufender Timer zeigt seinen Fortschritt unter den Augen.' },
    { id: 'open', ms: 5200, text: 'Ein Klick öffnet die Insel: Frag Buddy, was du wissen willst.' },
  ];
  let i = 0;
  let timer = 0;
  let running = false;
  function show(scene) {
    imgs.forEach((img) => img.classList.toggle('active', img.dataset.scene === scene.id));
    demo.classList.toggle('music', scene.id === 'music');
    if (caption) caption.textContent = scene.text;
  }
  function step() {
    show(scenes[i]);
    timer = setTimeout(step, scenes[i].ms);
    i = (i + 1) % scenes.length;
  }
  if (reduced) { show(scenes[4]); return; }
  show(scenes[0]);
  // Nur laufen, solange die Vorschau sichtbar ist (spart Rechenzeit)
  if (!('IntersectionObserver' in window)) { step(); return; }
  new IntersectionObserver((entries) => {
    const on = entries.some((e) => e.isIntersecting);
    if (on && !running) { running = true; step(); }
    if (!on && running) { running = false; clearTimeout(timer); }
  }, { threshold: 0.2 }).observe(demo);
})();

// ---------- Funktionen: Reiter (Pfeiltasten, Pos1, Ende) ----------
(function () {
  const list = document.querySelector('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, n) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: n + 1, ArrowLeft: n - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
    });
  });
})();

// ---------- Fragen: weiches Auf- und Zuklappen ----------
(function () {
  for (const details of document.querySelectorAll('.faq details')) {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.answer');
    let anim = null;
    summary.addEventListener('click', (e) => {
      if (reduced || !answer.animate) return;
      e.preventDefault();
      anim?.cancel();
      if (details.open) {
        anim = answer.animate([{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' });
        anim.onfinish = () => { details.open = false; anim = null; };
      } else {
        details.open = true;
        const h = answer.offsetHeight;
        anim = answer.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 320, easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  }
})();

// ---------- Sanftes Erscheinen (einmal pro Block) ----------
(function () {
  const blocks = document.querySelectorAll('.section > h2, .section > .section-lead, .news-panel, .tabs, .steps li, .note, .privacy, .faq, .closing-island');
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  blocks.forEach((b, n) => { b.dataset.reveal = ''; b.style.transitionDelay = b.matches('.steps li') ? `${(n % 4) * 70}ms` : ''; io.observe(b); });
})();

// ---------- Immer die neuste Version: Download, Versionsnummer und «Neu in …» von GitHub ----------
// Neuigkeiten stehen in whats-new.json im App-Repository (eine Quelle für Website und Release-Notizen).
(function () {
  const REPO = 'wolfawidmer-sudo/buddy-island';
  if (!window.fetch) return;
  const parts = (v) => String(v || '').replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const cmp = (a, b) => { const x = parts(a); const y = parts(b); for (let k = 0; k < 3; k += 1) if (x[k] !== y[k]) return x[k] - y[k]; return 0; };

  function setVersion(version) {
    document.querySelectorAll('[data-version]').forEach((n) => { n.textContent = `Version ${version}`; });
    document.querySelectorAll('[data-version-short]').forEach((n) => { n.textContent = parts(version).slice(0, 2).join('.'); });
  }

  function renderNews(data, version) {
    const list = document.getElementById('newsList');
    if (!list || !data || !Array.isArray(data.versions)) return;
    const [maj, min] = parts(version);
    // Alle Einträge der neusten Hauptversion (z. B. 0.7.0 und 0.7.1), neueste zuerst, nichts Unveröffentlichtes
    const items = data.versions
      .filter((v) => { const [a, b] = parts(v.version); return a === maj && b === min && cmp(v.version, version) <= 0; })
      .sort((a, b) => cmp(b.version, a.version))
      .flatMap((v) => v.highlights || [])
      .slice(0, 6);
    if (!items.length) return;
    list.textContent = '';
    for (const h of items) {
      const li = document.createElement('li');
      const t = document.createElement('h3'); t.textContent = h.title;
      const p = document.createElement('p'); p.textContent = h.text;
      li.append(t, p);
      list.appendChild(li);
    }
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((release) => {
      if (!release) return null;
      const version = String(release.tag_name || '').replace(/^v/, '');
      if (version) setVersion(version);
      const date = document.getElementById('newsDate');
      if (date && release.published_at) date.textContent = new Date(release.published_at).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
      const asset = (release.assets || []).find((a) => /Setup.*\.exe$/i.test(a.name));
      if (asset) {
        document.querySelectorAll('[data-download]').forEach((a) => { a.href = asset.browser_download_url; });
        document.querySelectorAll('[data-size]').forEach((n) => { n.textContent = ` (${Math.round(asset.size / 1e6)} MB)`; });
      }
      return fetch(`https://raw.githubusercontent.com/${REPO}/main/whats-new.json`).then((r) => (r.ok ? r.json() : null)).then((data) => renderNews(data, version));
    })
    .catch(() => {});
})();
