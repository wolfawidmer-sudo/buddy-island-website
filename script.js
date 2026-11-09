// Holt Version, Download-Link und Neuigkeiten vom neusten Release im öffentlichen Release-Repo.
// Der Code von Buddy ist privat; Neuigkeiten kommen darum aus dem Release-Text («## Neu»).
// Ohne Netz bleibt der Link auf die Release-Seite und der Text unverändert.
(function () {
  const REPO = 'wolfawidmer-sudo/buddy-island-releases';
  const fmtMB = (b) => `${Math.round(b / 1e6)} MB`;

  // Liest «- **Titel**: Text»-Zeilen aus dem Abschnitt «## Neu» des Release-Texts.
  function parseNews(body) {
    const items = [];
    let inNew = false;
    for (const line of String(body || '').split(/\r?\n/)) {
      if (/^##\s+/.test(line)) {
        inNew = /^##\s+Neu\b/i.test(line);
        continue;
      }
      if (!inNew) continue;
      const m = /^\s*[-*]\s+\*\*(.+?)\*\*\s*:?\s*(.*)$/.exec(line);
      if (m) items.push({ title: m[1].trim(), text: m[2].trim() });
    }
    return items;
  }

  const series = (v) => String(v).split('.').slice(0, 2).join('.');

  function item(h) {
    const li = document.createElement('li');
    const t = document.createElement('h3');
    t.textContent = h.title;
    const p = document.createElement('p');
    p.textContent = h.text;
    li.append(t, p);
    return li;
  }

  // Gleiche Hauptversion (z. B. 0.13.1 zu 0.13): Highlights auf der Seite bleiben, Neues kommt oben dazu.
  // Neue Hauptversion: Liste wird ersetzt.
  function renderNews(items, version) {
    const list = document.getElementById('newsList');
    if (!list || !items.length) return;
    const sameSeries = list.dataset.series === series(version);
    const known = new Set([...list.querySelectorAll('h3')].map((h) => h.textContent.trim()));
    const fresh = sameSeries ? items.filter((h) => !known.has(h.title)) : items;
    if (!sameSeries) {
      list.textContent = '';
      for (const el of document.querySelectorAll('[data-series-label]')) el.textContent = `Version ${series(version)}`;
    }
    const first = list.firstChild;
    for (const h of fresh.slice(0, 6)) list.insertBefore(item(h), sameSeries ? first : null);
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel) return;
      const version = String(rel.tag_name || '').replace(/^v/, '');
      const exe = (rel.assets || []).find((a) => /\.exe$/i.test(a.name));
      for (const el of document.querySelectorAll('[data-version]')) el.textContent = `Version ${version}`;
      if (exe) {
        for (const a of document.querySelectorAll('[data-download]')) a.href = exe.browser_download_url;
        for (const el of document.querySelectorAll('[data-size]')) el.textContent = ` · ${fmtMB(exe.size)}`;
        for (const el of document.querySelectorAll('[data-size-text]')) el.textContent = ` (${fmtMB(exe.size)})`;
      }
      renderNews(parseNews(rel.body), version);
    })
    .catch(() => {});

  // Direktlink auf eine Frage (z. B. #faq-key): aufklappen
  function openTarget() {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', openTarget);
  openTarget();
})();
