# RRR100 2026 — Race Plan

Offline-capable web app for the Run Rabbit Run 100, Steamboat Springs, 18–19
September 2026. Tortoise division, 9:00 am Friday start.

Built for a crew of ten who need to know where to be and when, a runner who
needs a plan, and pacers who need their leg. Works with no signal.

---

## Three links, one app

| Who | Send them | What they get |
|---|---|---|
| **Crew** | `?crew` | Next stop, all stops, schedule, info. No settings, no choices. |
| **Pacers** | `?pacer` | They tap their name and get only their leg. |
| **You** | `?runner` | Everything, plus the Profile tab where you set the plan up. |

The bare link shows a chooser. Whichever they pick is remembered.

> Being replaced by a single door — one link, the app asks who you are once and
> works the rest out from the shared team list. That depends on sync, which is
> why sync landed first.

## Just want to look at it?

Download `index.html` and double-click. Everything is inlined in that one file,
so it runs off your disk with no server.

Offline caching and the shared plan both need `http(s)`, so from `file://` you
get a local-only preview. The Profile tab says so.

---

## Deploy

```bash
git add -A && git commit -m "update" && git push
```

Then **Settings → Pages → Deploy from a branch → main / (root)**.

Only `index.html` and `sw.js` affect what people see. `sw.js` carries the cache
version and is what pushes an update to phones that already installed it —
forget it and someone who installed last week keeps seeing the old build.
`build.py` bumps it automatically.

## Add to a phone home screen

- **iPhone:** open in Safari → Share → Add to Home Screen
- **Android:** Chrome → menu → Install app

Tell everyone to open it once on wifi before leaving town, so the cache fills and
the plan syncs down.

---

## Backend

Supabase holds the shared plan. Setup lives in `supabase/SETUP.md`.

| Table | Holds | Written by |
|---|---|---|
| `plan` | One JSON row: team, aid station assignments, notes, schedule additions, bib, selected schedule | You and the crew chief, rarely |
| `splits` | One row per aid station visit | Anyone on the crew, constantly, on race day |
| `heartbeat` | Something for the keep-alive job to touch | A GitHub Action, twice a week |

**They are separate on purpose.** In one blob, a split logged at Dry Lake would
overwrite a note being edited at the same moment and one of the two writes would
vanish. Splits upsert a row at a time, so two people logging different stations
cannot collide.

**What syncs:** team, aid station overrides, notes, schedule additions, bib,
selected plan.
**What stays on the device:** gear ticks (ten people toggling one packing list is
chaos) and which person this phone is.

**localStorage remains the source of truth for rendering.** Supabase is a layer
on top — push what changed, pull what others changed. Every write hits local
first and the network second, so a failed request cannot lose data. If Supabase
is unreachable the app behaves exactly as it did before it existed.

### Keeping it awake

Free projects pause after 7 days of no traffic and return HTTP 540 on everything
until manually restored. Nine quiet days between the crew meeting and race
morning is entirely plausible, and ten people would all hit an error at once.

`.github/workflows/keepalive.yml` pings twice a week. Add `SUPABASE_URL` and
`SUPABASE_ANON_KEY` as repository secrets. **Also pay for September and cancel in
October** — a GitHub Action can fail silently and you would not find out until it
mattered.

### Timing feed

`supabase/functions/runner/index.ts` fetches Kandu Timing server-side (the
browser cannot, cross-origin) and returns this runner's checkpoint times as JSON,
cached 60 seconds.

Two hard limits, both from the sport rather than the code:

- **Mats record arrival, never departure.** Every cutoff is enforced on
  departure. Only the crew can supply that.
- **Seventeen-mile blind spot.** No mats at Lane of Pain, none at Billy's
  inbound. Miles 63.9 to 80.8 are invisible — the Emerald loop, the Spring Creek
  climb and the whole Grouse ascent, most of it in the dark.

So crew logging is the mechanism and Kandu fills gaps. The function fails soft:
any error returns `ok:false` and the app carries on.

`sDB` is date-stamped — 2025 was `2025_09_12_rrr`, so 2026 should be
`2026_09_18_rrr`. Confirm race week; it lives in `SUPA.db` in `src/data.js`.

---

## Editing

Source lives in `src/`. **Do not edit `index.html`** — it is generated.

```
src/shell.html   markup + all CSS  (<!--DATA--> and <!--APP--> markers)
src/data.js      config, stations, sections, crew, pacers, gear, events
src/app.js       all logic
build.py         inlines the three into index.html, bumps the sw.js cache
```

```bash
python3 build.py            # build + bump cache version
python3 build.py --nobump   # build without bumping (local testing)
```

Splitting these apart matters: several bugs in early sessions came from
search-and-replace patterns matching in both the CSS and the JavaScript of one
giant file. That class of mistake is now structurally impossible.

**Never put escape sequences in a search pattern.** The source holds literal `·`
and `’`, not `\u00b7` and `\u2019`. Patterns using escapes match nothing and fail
silently — that caused three separate bugs.

## Files

| File | Upload? |
|---|---|
| `index.html` | **Yes** — regenerated every build |
| `sw.js` | **Yes** — carries the cache version |
| `src/`, `build.py` | Optional, but keeps the repo the single source |
| `supabase/`, `.github/` | Optional — docs and infrastructure |
| `manifest.webmanifest`, icons, manual PDF | Only when they change |
| `RRR100.gpx` | The course file every number derives from. Do **not** add it to the service worker cache — 9 MB nobody will open |

---

## The numbers

Distances, elevations, per-section climb and the profile all come from the
official CalTopo export: 90,692 track points, waypoints snapped to within 10 m.

- **101.2 miles measured**, 17,850 ft ascent, 17,825 ft descent.
- **The manual's 20,391 ft is wrong** by about 14%. Identical ascent and descent
  to the foot is a spreadsheet, not a measurement.
- **Mileages shown are the manual's**, not the GPX's, because that is what the
  signs and the volunteers say. The GPX puts every station about 0.8 mi earlier;
  terrain between stations is stretched under 1% so markers land correctly.
- **Low-point elevations come from the GPX**, which reads higher than the manual
  at the bottom — 7,070 ft at the start against 6,886, and 7,497 at Fish Creek
  against 6,952. Worth asking the RDs about.

Four schedules are selectable and re-time the whole app, including crew leave-by
and pacer on/off times: **Goal 29:38** (your tracker), **2025 field 30:11** (68
real finishers), **Steady 32:00**, **Cutoff 36:00**.

## Notes

- Times are pinned to `America/Denver` regardless of a phone's timezone.
- Aid station coordinates are snapped to the GPX. Map links use lat/lon rather
  than place names so they resolve from an offline map.
- **Directions deliberately omitted** for Summit Lake and Fish Creek Falls. A map
  app would route the crew up Buffalo Pass Road above Dry Lake, which
  disqualifies the runner. Both show a red warning and the written route instead.
- The crew's next stop advances on **leave-by** time, not arrival — the useful
  moment is when they need to get in the car.
- Before race day the log buttons open a time picker rather than stamping "now",
  since "now" is 45 days negative and would poison every projection.
- Print styles turn Profile → Pre-race crew plan into an A4 handout.
