# Buddy Island – Website

Die Website von [Buddy Island](https://github.com/wolfawidmer-sudo/buddy-island), einem kleinen Claude-Assistenten im Stil der Dynamic Island für Windows.

**Live:** https://wolfawidmer-sudo.github.io/buddy-island-website/

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite mit animierter Vorschau, «Neu in …», vier Kernfunktionen, Installation, Datenschutz, FAQ |
| `privacy.html` | Datenschutzerklärung |
| `style.css` | Gestaltung |
| `script.js` | Vorschau-Animation, Download-Knopf, Version und Neuigkeiten |
| `img/` | Screenshots und Vorschaubild |

Reines HTML, CSS und JavaScript, ohne Build-Schritt.

## Immer die neuste Version

Der Knopf fragt beim Laden die GitHub-API nach dem neusten Release des Quellcode-Repos und zeigt direkt auf den Installer. Neue Versionen erscheinen also automatisch, sobald im Repo `buddy-island` ein Release veröffentlicht ist.

Auch die Versionsnummern und der Abschnitt «Neu in …» kommen von dort: Die Seite liest `whats-new.json` aus dem App-Repo und zeigt alle Punkte der neusten Hauptversion (z. B. 0.7.0 und 0.7.1), aber nie etwas, das noch nicht veröffentlicht ist. Neue Punkte trägt man also nur in `whats-new.json` ein; die Website muss dafür nicht angepasst werden. Ohne Internet zur GitHub-API bleibt der zuletzt eingetragene Stand im HTML stehen.

## Veröffentlichen

Jeder Push auf `main` veröffentlicht die Seite über GitHub Pages (siehe `.github/workflows/pages.yml`).

Lokal ansehen: `index.html` im Browser öffnen.
