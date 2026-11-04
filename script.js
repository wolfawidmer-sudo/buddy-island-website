// Holt Version, Download-Link und Neuigkeiten vom neusten Release. Ohne Netz bleibt der Link
// auf die Release-Seite und der Text unverändert. Kein weiteres JavaScript nötig.
(function () {
  const REPO = 'wolfawidmer-sudo/buddy-island';
  const fmtMB = (b) => `${Math.round(b / 1e6)} MB`;

  function renderNews(data, version) {
    const list = document.getElementById('newsList');
    if (!list || !data || !Array.isArray(data.versions)) return;
    const entry = data.versions.find((v) => v.version === version) || data.versions[0];
    if (!entry || !Array.isArray(entry.highlights)) return;
    list.textContent = '';
    for (const h of entry.highlights.slice(0, 6)) {
      const li = document.createElement('li');
      const t = document.createElement('h3');
      t.textContent = h.title;
      const p = document.createElement('p');
      p.textContent = h.text;
      li.append(t, p);
      list.appendChild(li);
    }
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel) return null;
      const version = String(rel.tag_name || '').replace(/^v/, '');
      const exe = (rel.assets || []).find((a) => /\.exe$/i.test(a.name));
      for (const el of document.querySelectorAll('[data-version]')) el.textContent = `Version ${version}`;
      if (exe) {
        for (const a of document.querySelectorAll('[data-download]')) a.href = exe.browser_download_url;
        for (const el of document.querySelectorAll('[data-size]')) el.textContent = ` · ${fmtMB(exe.size)}`;
        for (const el of document.querySelectorAll('[data-size-text]')) el.textContent = ` (${fmtMB(exe.size)})`;
      }
      return fetch(`https://raw.githubusercontent.com/${REPO}/main/whats-new.json`).then((r) => (r.ok ? r.json() : null)).then((d) => renderNews(d, version));
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
