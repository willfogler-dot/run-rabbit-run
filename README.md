# RRR100 2026 — Race Plan

Offline-capable web app for the Run Rabbit Run 100, Steamboat Springs, 18–19 September 2026.
Tortoise division, 9:00 AM Friday start.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "RRR100 race plan"
git branch -M main
git remote add origin https://github.com/<you>/rrr100.git
git push -u origin main
```

Then: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
Live at `https://<you>.github.io/rrr100/` in a minute or two.

The service worker requires HTTPS or localhost. GitHub Pages serves HTTPS, so it works.
Relative paths are used throughout, so the repo can sit at any subpath.

## Add to a phone home screen

- **iPhone:** open in Safari (not Chrome) → Share → Add to Home Screen.
- **Android:** open in Chrome → menu → Add to Home screen / Install app.

Launching from the home screen runs it full-screen with no browser chrome, and the
service worker serves everything from cache when there is no signal. Tell every crew
member to open it once on wifi before leaving town so the cache populates.

The official manual PDF is 8 MB and is **not** cached on install. Kit tab →
"Save manual for offline" pulls it down on demand.

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup and all styles |
| `data.js` | Aid stations, elevation profile, section narratives, crew, pacers, gear |
| `app.js` | Clock, projections, SVG profile, split logging |
| `sw.js` | Service worker — network-first, cache fallback |
| `manifest.webmanifest` | PWA manifest |
| `2026-RRR-Manual.pdf` | Official runner's manual v1.1, 29 July 2026 |

## Updating

Content lives in `data.js` — edit and push. If a change does not appear on a phone that
has already installed it, bump `SHELL` in `sw.js` (`rrr-shell-v1` → `v2`) and push; the
new worker will wipe the old cache on activation.

Cutoffs and pace columns come from the 2026 manual. **Re-check the manual after entries
close on 7 September** — the RDs update it and say so.

## Notes

- Times are pinned to `America/Denver` regardless of a phone's timezone setting.
- Logged splits and checklists are stored per-device in `localStorage` and do **not**
  sync between crew phones. That is deliberate — no backend, so it works offline.
- The elevation profile is schematic: official aid-station elevations with the terrain
  between them interpolated from the course descriptions. It is right in shape and
  magnitude, not survey-accurate.
- Interpolated arrival estimates for Billy's Rabbit Hole and Lane of Pain are marked
  `est` — the manual publishes no pace figures for those stations.
