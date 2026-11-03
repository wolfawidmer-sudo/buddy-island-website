# Buddy Island – Website

Die Website von [Buddy Island](https://github.com/wolfawidmer-sudo/buddy-island), einem kleinen Claude-Assistenten im Stil der Dynamic Island für Windows.

**Live:** https://wolfawidmer-sudo.github.io/buddy-island-website/

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite mit animierter Vorschau, Funktionen, Installation, Datenschutz, FAQ |
| `privacy.html` | Datenschutzerklärung |
| `style.css` | Gestaltung |
| `script.js` | Vorschau-Animation und Download-Knopf |
| `img/` | Screenshots und Vorschaubild |

Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Download-Knopf

Der Knopf fragt beim Laden die GitHub-API nach dem neusten Release des Quellcode-Repos und zeigt direkt auf den Installer. Neue Versionen erscheinen also automatisch, sobald im Repo `buddy-island` ein Release veröffentlicht ist.

## Veröffentlichen

Jeder Push auf `main` veröffentlicht die Seite über GitHub Pages (siehe `.github/workflows/pages.yml`).

Lokal ansehen: `index.html` im Browser öffnen.
