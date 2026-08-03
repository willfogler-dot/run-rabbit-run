/* RRR100 2026 — app logic */
(function () {
  'use strict';

  var START = new Date(RACE.startISO).getTime();
  var MIN = 60000;
  var state = { plan: 'tgt', splits: {}, checks: {}, theme: 'dark' };

  /* ---------- storage (degrades to memory if blocked) ---------- */
  var mem = {};
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v); return v;
    } catch (e) {
      if (v === undefined) return mem[k] === undefined ? null : mem[k];
      mem[k] = v; return v;
    }
  }
  function load() {
    try { state.splits = JSON.parse(ls('rrr.splits') || '{}') || {}; } catch (e) { state.splits = {}; }
    try { state.checks = JSON.parse(ls('rrr.checks') || '{}') || {}; } catch (e) { state.checks = {}; }
    state.plan = ls('rrr.plan') || 'tgt';
    state.theme = ls('rrr.theme') || 'dark';
  }
  function save(k) { ls('rrr.' + k, typeof state[k] === 'string' ? state[k] : JSON.stringify(state[k])); }

  /* ---------- time helpers ---------- */
  var fTime = new Intl.DateTimeFormat('en-US', { timeZone: RACE.tz, hour: 'numeric', minute: '2-digit' });
  var fDay = new Intl.DateTimeFormat('en-US', { timeZone: RACE.tz, weekday: 'short' });

  function clockOf(min) {                       // elapsed min -> "1:00a Sat"
    if (min == null || !isFinite(min)) return '—';
    var d = new Date(START + min * MIN);
    var t = fTime.format(d).replace(' AM', 'a').replace(' PM', 'p').replace(/^0/, '');
    return t + ' ' + fDay.format(d);
  }
  function hm(min) {                            // elapsed min -> "17:30"
    if (min == null || !isFinite(min)) return '—';
    var neg = min < 0; min = Math.abs(min);
    var h = Math.floor(min / 60), m = Math.round(min % 60);
    if (m === 60) { m = 0; h++; }
    return (neg ? '−' : '') + h + ':' + String(m).padStart(2, '0');
  }
  function nowMin() { return (Date.now() - START) / MIN; }

  /* ---------- projection ---------- */
  function planMin(s) { return s[state.plan]; }

  // returns array of {min, src:'plan'|'log'|'proj'}
  function project() {
    var out = STATIONS.map(function (s) { return { min: planMin(s), src: 'plan' }; });
    var lastIdx = -1;
    STATIONS.forEach(function (s, i) {
      var k = String(s.mi) + '@' + i;
      if (state.splits[k] != null) { out[i] = { min: state.splits[k], src: 'log' }; lastIdx = i; }
    });
    if (lastIdx > 0) {
      var pL = planMin(STATIONS[lastIdx]), aL = out[lastIdx].min;
      var ratio = pL > 0 ? aL / pL : 1;
      for (var j = lastIdx + 1; j < STATIONS.length; j++) {
        if (out[j].src === 'log') continue;
        out[j] = { min: aL + (planMin(STATIONS[j]) - pL) * ratio, src: 'proj' };
      }
    }
    return out;
  }

  // interpolate mile at a given elapsed time, using the projection
  function mileAt(min, proj) {
    if (min <= 0) return 0;
    var last = STATIONS.length - 1;
    if (min >= proj[last].min) return STATIONS[last].mi;
    for (var i = 1; i <= last; i++) {
      if (min <= proj[i].min) {
        var a = proj[i - 1].min, b = proj[i].min;
        var f = b > a ? (min - a) / (b - a) : 0;
        return STATIONS[i - 1].mi + f * (STATIONS[i].mi - STATIONS[i - 1].mi);
      }
    }
    return STATIONS[last].mi;
  }

  /* ---------- elevation profile ---------- */
  var MI_MAX = 101.8, EL_MIN = 6400, EL_MAX = 10800;

  function drawProfile() {
    var svg = document.getElementById('profile');
    var W = Math.max(300, svg.clientWidth || svg.parentNode.clientWidth || 360);
    var H = W < 480 ? 208 : 250;
    var padL = 34, padR = 10, padT = 16, padB = 22;
    var iw = W - padL - padR, ih = H - padT - padB;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.removeAttribute('preserveAspectRatio');

    var X = function (mi) { return padL + (mi / MI_MAX) * iw; };
    var Y = function (ft) { return padT + ih - ((ft - EL_MIN) / (EL_MAX - EL_MIN)) * ih; };

    var proj = project();
    var e = [];
    function tag(n, a, inner) {
      var s = '<' + n;
      for (var k in a) s += ' ' + k + '="' + a[k] + '"';
      return inner == null ? s + '/>' : s + '>' + inner + '</' + n + '>';
    }

    // clip path from the profile area
    var area = 'M' + X(0) + ',' + Y(EL_MIN);
    PROFILE.forEach(function (p) { area += ' L' + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
    area += ' L' + X(MI_MAX) + ',' + Y(EL_MIN) + ' Z';
    e.push('<defs><clipPath id="pc"><path d="' + area + '"/></clipPath></defs>');

    // night bands
    RACE.dark.forEach(function (d) {
      var m0 = mileAt(d[0], proj), m1 = mileAt(d[1], proj);
      if (m1 <= m0) return;
      e.push(tag('rect', { x: X(m0).toFixed(1), y: padT, width: (X(m1) - X(m0)).toFixed(1), height: ih, fill: 'var(--night)', opacity: '.9' }));
    });

    // horizontal grid + labels
    for (var ft = 7000; ft <= 10500; ft += 1000) {
      e.push(tag('line', { x1: padL, y1: Y(ft).toFixed(1), x2: W - padR, y2: Y(ft).toFixed(1), stroke: 'var(--line)', 'stroke-width': 1 }));
      e.push(tag('text', { x: padL - 5, y: (Y(ft) + 3.5).toFixed(1), fill: 'var(--dim-2)', 'font-size': 8.5, 'text-anchor': 'end', 'font-family': 'var(--mono)' }, (ft / 1000) + 'k'));
    }

    // topo hatch under the profile
    var hatch = '';
    for (var h = EL_MIN; h <= EL_MAX; h += 200) {
      hatch += tag('line', { x1: padL, y1: Y(h).toFixed(1), x2: W - padR, y2: Y(h).toFixed(1), stroke: 'var(--gold)', 'stroke-width': .7, opacity: '.16' });
    }
    e.push(tag('g', { 'clip-path': 'url(#pc)' }, tag('rect', { x: padL, y: padT, width: iw, height: ih, fill: 'var(--gold)', opacity: '.055' }) + hatch));

    // profile line
    var line = PROFILE.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ');
    e.push(tag('path', { d: line, fill: 'none', stroke: 'var(--gold)', 'stroke-width': 1.9, 'stroke-linejoin': 'round' }));

    // aid stations
    STATIONS.forEach(function (s, i) {
      if (s.mi === 0) return;
      var x = X(s.mi), y = Y(s.elev);
      var risky = s.cut != null && proj[i].min > s.cut - 60;
      var over = s.cut != null && proj[i].min > s.cut;
      var col = over ? 'var(--alarm)' : (s.major ? 'var(--gold-2)' : 'var(--gold)');
      e.push(tag('line', { x1: x.toFixed(1), y1: y.toFixed(1), x2: x.toFixed(1), y2: padT + ih, stroke: col, 'stroke-width': s.major ? 1.1 : .7, opacity: s.major ? '.5' : '.28' }));
      e.push(tag('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: s.major ? 3.2 : 2.1, fill: col, stroke: 'var(--ink-2)', 'stroke-width': 1 }));
      if (over || risky) e.push(tag('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 6, fill: 'none', stroke: 'var(--alarm)', 'stroke-width': 1.2, opacity: over ? '.95' : '.5' }));
    });

    // live / projected position
    var nm = nowMin();
    if (nm > 0 && nm < RACE.limit + 120) {
      var pm = mileAt(nm, proj);
      var pe = elevAt(pm);
      e.push(tag('line', { x1: X(pm).toFixed(1), y1: padT, x2: X(pm).toFixed(1), y2: (padT + ih).toFixed(1), stroke: 'var(--sky)', 'stroke-width': 1.4 }));
      e.push(tag('circle', { cx: X(pm).toFixed(1), cy: Y(pe).toFixed(1), r: 4.5, fill: 'var(--sky)', stroke: 'var(--ink-2)', 'stroke-width': 1.5 }));
      var lx = Math.min(Math.max(X(pm), padL + 20), W - padR - 26);
      e.push(tag('text', { x: lx.toFixed(1), y: padT - 4, fill: 'var(--sky)', 'font-size': 9, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-weight': 700 }, pm.toFixed(1) + 'mi'));
    }

    // mile axis
    [0, 20, 40, 60, 80, 100].forEach(function (m) {
      e.push(tag('text', { x: X(m).toFixed(1), y: H - 6, fill: 'var(--dim-2)', 'font-size': 8.5, 'text-anchor': m === 0 ? 'start' : (m === 100 ? 'end' : 'middle'), 'font-family': 'var(--mono)' }, m));
    });

    svg.innerHTML = e.join('');
    svg.onclick = function (ev) {
      var r = svg.getBoundingClientRect();
      var mi = ((ev.clientX - r.left) / r.width * W - padL) / iw * MI_MAX;
      var sec = SECTIONS.find(function (s) { return mi >= s.from && mi <= s.to; }) || SECTIONS[0];
      openSection(sec);
    };
  }

  function elevAt(mi) {
    for (var i = 1; i < PROFILE.length; i++) {
      if (mi <= PROFILE[i][0]) {
        var a = PROFILE[i - 1], b = PROFILE[i];
        var f = b[0] > a[0] ? (mi - a[0]) / (b[0] - a[0]) : 0;
        return a[1] + f * (b[1] - a[1]);
      }
    }
    return PROFILE[PROFILE.length - 1][1];
  }

  /* ---------- header + next-stop ---------- */
  function tick() {
    var el = document.getElementById('clock'), sub = document.getElementById('clockSub');
    var nm = nowMin(), proj = project();
    el.className = 'clock num ' + (nm < 0 ? 'pre' : (nm > RACE.limit ? 'done' : 'live'));

    if (nm < 0) {
      var s = Math.floor(-nm * 60);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
      el.textContent = d > 0 ? d + 'd ' + h + 'h ' + String(m).padStart(2, '0') + 'm'
        : String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
      sub.textContent = 'until the gun · 9:00 AM Fri 18 Sep';
    } else if (nm > RACE.limit + 60) {
      el.textContent = '36:00';
      sub.textContent = 'race complete';
    } else {
      el.textContent = hm(nm) + ':' + String(Math.floor((nm * 60) % 60)).padStart(2, '0');
      sub.textContent = 'elapsed · ' + mileAt(nm, proj).toFixed(1) + ' mi projected';
    }

    // next hard gate
    var g = null;
    for (var i = 0; i < STATIONS.length; i++) {
      if (STATIONS[i].cut != null && (nm < 0 || proj[i].min > nm)) { g = { s: STATIONS[i], p: proj[i] }; break; }
    }
    var lbl = document.getElementById('hrLbl'), val = document.getElementById('hrVal');
    if (g) {
      var buf = g.s.cut - g.p.min;
      lbl.textContent = 'Buffer @ ' + g.s.mi;
      val.textContent = hm(buf);
      val.style.color = buf < 0 ? 'var(--alarm)' : (buf < 60 ? 'var(--alarm)' : (buf < 120 ? 'var(--gold)' : 'var(--paper-2)'));
    } else { lbl.textContent = 'Gates'; val.textContent = 'clear'; val.style.color = 'var(--ok)'; }

    renderNext(proj, nm);
  }

  function renderNext(proj, nm) {
    var idx = 0;
    for (var i = 0; i < STATIONS.length; i++) { if (proj[i].min > nm) { idx = i; break; } idx = i; }
    if (nm < 0) idx = 1;
    var s = STATIONS[idx], p = proj[idx];
    var buf = s.cut != null ? s.cut - p.min : null;
    var flags = [];
    if (s.bag) flags.push('<span class="badge k">Drop bag</span>');
    if (s.crew) flags.push('<span class="badge b">Crew</span>');
    if (s.pacer) flags.push('<span class="badge g">Pacer swap</span>');
    document.getElementById('nextCard').innerHTML =
      '<div class="mi num">' + (nm < 0 ? 'FIRST STOP' : 'NEXT') + ' · MILE ' + s.mi.toFixed(1) + '</div>' +
      '<h3>' + s.name + '</h3>' +
      '<div class="pills" style="gap:5px">' + (flags.join('') || '<span class="badge" style="background:var(--line);color:var(--dim)">Runner only</span>') + '</div>' +
      (s.note ? '<p style="font-size:13.5px;color:var(--dim);margin-top:10px">' + s.note + '</p>' : '') +
      '<div class="next-grid">' +
      '<div><div class="k">Projected</div><div class="v">' + clockOf(p.min) + '</div></div>' +
      '<div><div class="k">Cutoff</div><div class="v" style="color:' + (s.cut != null ? 'var(--alarm)' : 'var(--dim-2)') + '">' + (s.cut != null ? clockOf(s.cut) : 'none') + '</div></div>' +
      '<div><div class="k">Buffer</div><div class="v" style="color:' + (buf == null ? 'var(--dim-2)' : (buf < 60 ? 'var(--alarm)' : 'var(--ok)')) + '">' + (buf == null ? '—' : hm(buf)) + '</div></div>' +
      '</div>';
  }

  /* ---------- table ---------- */
  function renderTable() {
    var proj = project();
    var h = '<thead><tr><th>Mi</th><th>Aid station</th><th>Elev</th><th>B/C/P</th><th>Plan</th><th>Cutoff</th><th>Buf</th></tr></thead><tbody>';
    STATIONS.forEach(function (s, i) {
      var p = proj[i], buf = s.cut != null ? s.cut - p.min : null;
      var cls = ['tap'];
      if (s.major) cls.push('major');
      if (p.src === 'log') cls.push('logged');
      if (buf != null && buf < 0) cls.push('risk');
      h += '<tr class="' + cls.join(' ') + '" data-i="' + i + '">' +
        '<td class="num">' + s.mi.toFixed(1) + '</td>' +
        '<td class="nm">' + s.name + (p.src === 'log' ? ' <span class="badge k">logged</span>' : '') + (s.est ? ' <span class="badge" style="background:var(--line);color:var(--dim-2)">est</span>' : '') + '</td>' +
        '<td class="num">' + s.elev.toLocaleString() + '</td>' +
        '<td><div class="flagset">' +
        '<span class="flag' + (s.bag ? ' on b' : '') + '">B</span>' +
        '<span class="flag' + (s.crew ? ' on' : '') + '">C</span>' +
        '<span class="flag' + (s.pacer ? ' on p' : '') + '">P</span></div></td>' +
        '<td class="' + (p.src === 'log' ? '' : 'tgt') + '">' + clockOf(p.min) + '</td>' +
        '<td class="' + (s.cut != null ? 'cut' : '') + '">' + (s.cut != null ? clockOf(s.cut) : '—') + '</td>' +
        '<td style="color:' + (buf == null ? 'var(--dim-2)' : (buf < 0 ? 'var(--alarm)' : (buf < 60 ? 'var(--alarm)' : 'var(--ok)'))) + '">' + (buf == null ? '—' : hm(buf)) + '</td>' +
        '</tr>';
    });
    var t = document.getElementById('asTable');
    t.innerHTML = h + '</tbody>';
    t.querySelectorAll('tr.tap').forEach(function (tr) {
      tr.onclick = function () { openSplit(+tr.dataset.i); };
    });
  }

  /* ---------- charts ---------- */
  function renderBuffers() {
    var proj = project(), max = 300;
    var nm = nowMin();
    var all = STATIONS.map(function (s, i) { return { s: s, b: s.cut != null ? s.cut - proj[i].min : null, past: nm > proj[i].min }; })
      .filter(function (r) { return r.b != null; });
    var rows = all.filter(function (r) { return !r.past; });
    var cleared = all.length - rows.length;
    var el = document.getElementById('bufferBars');
    if (!rows.length) {
      el.innerHTML = '<p style="font-family:var(--mono);font-size:13px;color:var(--ok);margin:0">All ' + all.length + ' gates cleared.</p>';
      return;
    }
    el.innerHTML = (cleared ? '<p style="font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ok);margin:0 0 4px">' + cleared + ' gate' + (cleared > 1 ? 's' : '') + ' cleared · ' + rows.length + ' ahead</p>' : '') +
      rows.map(function (r) {
      var b = Math.max(0, Math.min(r.b, max));
      var col = r.b < 0 ? 'var(--alarm)' : (r.b < 60 ? 'var(--alarm)' : (r.b < 120 ? 'var(--gold)' : 'var(--ok)'));
      return '<div class="bar-row"><div class="bar-lbl">' + r.s.mi.toFixed(1) + ' ' + r.s.name.replace(' Hall', '').replace('Mount ', 'Mt ') + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + (b / max * 100).toFixed(1) + '%;background:' + col + '"></div></div>' +
        '<div class="bar-val" style="color:' + col + '">' + hm(r.b) + '</div></div>';
      }).join('');
  }

  function renderGrades() {
    var max = 700;
    document.getElementById('gradeBars').innerHTML = SECTIONS.map(function (s) {
      var e0 = elevAt(s.from), e1 = elevAt(s.to), d = s.to - s.from;
      var g = (e1 - e0) / d;
      var w = Math.min(Math.abs(g) / max, 1) * 50;
      var up = g >= 0;
      return '<div class="bar-row"><div class="bar-lbl">' + s.n + '. ' + s.title.split(' → ')[1].replace('Mount ', 'Mt ') + '</div>' +
        '<div class="bar-mid"><div class="zero"></div>' +
        '<div class="seg" style="' + (up ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%;background:' + (up ? 'var(--gold)' : 'var(--sky)') + '"></div></div>' +
        '<div class="bar-val" style="color:' + (up ? 'var(--gold)' : 'var(--sky)') + '">' + (up ? '+' : '−') + Math.abs(Math.round(g)) + '</div></div>';
    }).join('');
  }

  /* ---------- static renders ---------- */
  function renderSections() {
    document.getElementById('sections').innerHTML = SECTIONS.map(function (s) {
      return '<div class="acc" data-n="' + s.n + '">' +
        '<button class="acc-hd" aria-expanded="false"><span class="acc-n num">' + String(s.n).padStart(2, '0') + '</span>' +
        '<span class="acc-t"><span class="t">' + s.title + '</span><span class="s">' + s.sub + '</span></span>' +
        '<span class="acc-chev">▶</span></button>' +
        '<div class="acc-bd">' + s.body + '</div></div>';
    }).join('');
    document.querySelectorAll('#sections .acc-hd').forEach(function (b) {
      b.onclick = function () {
        var a = b.parentNode, open = a.classList.toggle('open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    });
  }

  function renderCrew() {
    document.getElementById('crewRota').innerHTML = CREW.map(function (c) {
      var leave = (c.drive && c.mi != null) ? leaveBy(c.mi, c.drive) : null;
      return '<div class="card" style="' + (c.key ? 'border-left:3px solid var(--gold)' : (c.rest ? 'border-left:3px solid var(--sky)' : '')) + '">' +
        '<div class="card-hd"><h3>' + c.n + '. ' + c.where + '</h3>' +
        '<span class="badge ' + (c.rest ? 'b' : 'g') + '">' + c.win + '</span></div>' +
        '<p style="font-size:13.5px;color:var(--paper-2)">' + c.note + '</p>' +
        (leave ? '<div class="note" style="margin-bottom:0"><span class="eyebrow">Leave town by</span> <b class="num" style="font-size:15px">' + leave + '</b> &nbsp;·&nbsp; ' + c.drive + ' min drive' + (c.drive >= 120 ? ' — plus 30 min slack' : '') + '</div>' : '') +
        (c.opt ? '<div class="eyebrow" style="margin-top:8px">Optional</div>' : '') +
        '</div>';
    }).join('');

    document.getElementById('crewDrive').innerHTML = DRIVES.map(function (d) {
      return '<div class="card"><div class="card-hd"><h3>' + d.to + '</h3><span class="badge ' + (d.warn ? 'r' : 'b') + '">' + d.t + '</span></div>' +
        '<p style="font-size:13.5px">' + d.dir + '</p>' +
        '<div class="' + (d.warn ? 'warn' : 'note') + '" style="margin-bottom:0">' + (d.warn ? '<b>' + d.tag + '</b>' : d.tag) + '</div></div>';
    }).join('');
  }

  function leaveBy(mi, driveMin) {
    var proj = project(), i = STATIONS.findIndex(function (s) { return s.mi === mi; });
    if (i < 0) return null;
    var slack = driveMin >= 120 ? 30 : 20;
    return clockOf(proj[i].min - driveMin - slack);
  }

  function renderPacers() {
    document.getElementById('pacerLegs').innerHTML = PACERS.map(function (p) {
      var a = STATIONS.find(function (s) { return s.mi === p.from; });
      var b = STATIONS.find(function (s) { return s.mi === p.to; });
      var proj = project();
      var ia = STATIONS.indexOf(a), ib = STATIONS.indexOf(b);
      return '<div class="card" style="' + (p.key ? 'border-left:3px solid var(--gold)' : '') + '">' +
        '<div class="card-hd"><h3>Pacer ' + p.n + ' — ' + p.title + '</h3><span class="badge g">' + p.dist + '</span></div>' +
        '<div class="next-grid" style="margin:2px 0 12px">' +
        '<div><div class="k">On at</div><div class="v">' + clockOf(proj[ia].min) + '</div></div>' +
        '<div><div class="k">Off at</div><div class="v">' + clockOf(proj[ib].min) + '</div></div>' +
        '<div><div class="k">Est. time</div><div class="v">' + hm(proj[ib].min - proj[ia].min) + '</div></div>' +
        '</div>' +
        '<p style="font-size:13.5px">' + p.body + '</p>' +
        '<div class="note" style="margin-bottom:0"><span class="eyebrow">Who you need</span><br>' + p.need + '</div></div>';
    }).join('');
  }

  function renderKit() {
    var mg = document.getElementById('mandatory');
    mg.innerHTML = MANDATORY.map(function (t, i) {
      var k = 'mg' + i;
      return '<label class="chk"><input type="checkbox" data-k="' + k + '"' + (state.checks[k] ? ' checked' : '') + '><span>' + t + '</span></label>';
    }).join('');

    document.getElementById('dropBags').innerHTML = DROPBAGS.map(function (b, bi) {
      var body = (b.warn ? '<div class="warn">' + b.warn + '</div>' : '');
      (b.lists || []).forEach(function (l, li) {
        body += '<h4 style="font-size:11px;font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin:14px 0 4px">' + l.h + '</h4>';
        body += l.items.map(function (it, ii) {
          var k = 'db' + bi + '_' + li + '_' + ii;
          return '<label class="chk"><input type="checkbox" data-k="' + k + '"' + (state.checks[k] ? ' checked' : '') + '><span>' + it + '</span></label>';
        }).join('');
      });
      return '<div class="card"><div class="card-hd"><h3>' + b.name + '</h3><span class="badge ' + (b.crewOnly ? 'r' : 'b') + '">' + b.tag + '</span></div>' + body + '</div>';
    }).join('');

    document.getElementById('carries').innerHTML = CARRIES.map(function (c, i) {
      var last = i === CARRIES.length - 1;
      return '<div style="padding:10px 0;border-bottom:' + (last ? '0' : '1px solid var(--line)') + '">' +
        '<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">' +
        '<b style="font-size:13.5px">' + c.seg + '</b><span class="badge ' + (c.hi ? 'r' : 'b') + '">' + c.d + '</span></div>' +
        '<p style="font-size:13px;color:var(--dim);margin-top:4px">' + c.note + '</p></div>';
    }).join('');

    document.getElementById('schedule').innerHTML = SCHEDULE.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>';
    }).join('');

    document.getElementById('rules').innerHTML = RULES.map(function (r, i) {
      return '<div style="padding:11px 0;border-bottom:' + (i === RULES.length - 1 ? '0' : '1px solid var(--line)') + '">' +
        '<b style="font-size:13.5px;display:block;margin-bottom:3px">' + r.r + '</b>' +
        '<span style="font-size:13px;color:var(--dim)">' + r.d + '</span></div>';
    }).join('');

    document.getElementById('questions').innerHTML = QUESTIONS.map(function (q) { return '<li style="margin-bottom:8px">' + q + '</li>'; }).join('');

    document.querySelectorAll('input[type=checkbox][data-k]').forEach(function (cb) {
      cb.onchange = function () {
        state.checks[cb.dataset.k] = cb.checked; save('checks');
        var n = MANDATORY.filter(function (_, i) { return state.checks['mg' + i]; }).length;
        document.getElementById('mgCount').textContent = n + '/5';
      };
    });
    var n = MANDATORY.filter(function (_, i) { return state.checks['mg' + i]; }).length;
    document.getElementById('mgCount').textContent = n + '/5';
  }

  /* ---------- modal ---------- */
  var modal = document.getElementById('modal'), sheet = document.getElementById('sheet');
  function closeModal() { modal.classList.remove('on'); }
  modal.onclick = function (e) { if (e.target === modal) closeModal(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  function openSection(sec) {
    sheet.innerHTML = '<div class="sheet-grip"></div>' +
      '<div class="eyebrow">Section ' + String(sec.n).padStart(2, '0') + ' · mile ' + sec.from + '–' + sec.to + '</div>' +
      '<h2 style="font-size:20px;margin:6px 0 3px">' + sec.title + '</h2>' +
      '<div class="eyebrow" style="color:var(--gold)">' + sec.sub + '</div>' +
      '<div style="margin-top:14px;font-size:14px;line-height:1.62;color:var(--paper-2)">' + sec.body + '</div>' +
      '<button class="btn" style="width:100%;margin-top:16px" id="mClose">Close</button>';
    modal.classList.add('on');
    document.getElementById('mClose').onclick = closeModal;
  }

  function openSplit(i) {
    var s = STATIONS[i], proj = project(), key = String(s.mi) + '@' + i;
    var cur = state.splits[key];
    var d = new Date(START + (cur != null ? cur : proj[i].min) * MIN);
    var parts = new Intl.DateTimeFormat('en-CA', { timeZone: RACE.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
    var g = {}; parts.forEach(function (p) { g[p.type] = p.value; });
    var dv = g.year + '-' + g.month + '-' + g.day, tv = (g.hour === '24' ? '00' : g.hour) + ':' + g.minute;

    sheet.innerHTML = '<div class="sheet-grip"></div>' +
      '<div class="eyebrow">Mile ' + s.mi.toFixed(1) + '</div>' +
      '<h2 style="font-size:21px;margin:5px 0 2px">' + s.name + '</h2>' +
      '<div class="eyebrow">' + s.elev.toLocaleString() + ' ft' + (s.cut != null ? ' · cutoff ' + clockOf(s.cut) : ' · no posted cutoff') + '</div>' +
      (s.note ? '<p style="font-size:13.5px;color:var(--dim);margin-top:12px">' + s.note + '</p>' : '') +
      '<div class="fld"><label>Actual arrival (Mountain Time)</label><div class="row2">' +
      '<input type="date" id="sd" value="' + dv + '"><input type="time" id="st" value="' + tv + '"></div></div>' +
      '<div class="pills" style="margin-top:6px">' +
      '<button class="btn pri" id="sNow" style="flex:1">Arrived now</button>' +
      '<button class="btn" id="sSave" style="flex:1">Save time</button></div>' +
      (cur != null ? '<button class="btn ghost" id="sDel" style="width:100%;margin-top:8px">Remove logged split</button>' : '') +
      '<p style="font-size:12px;color:var(--dim);margin-top:14px">Logging a split re-projects every station after it at your observed pace ratio, and flags anything you would miss. Stored on this device only.</p>' +
      '<button class="btn ghost" style="width:100%;margin-top:10px" id="mClose">Close</button>';
    modal.classList.add('on');

    function commit(min) {
      state.splits[key] = min; save('splits'); closeModal(); refresh();
    }
    document.getElementById('sNow').onclick = function () { commit(Math.round(nowMin())); };
    document.getElementById('sSave').onclick = function () {
      var dd = document.getElementById('sd').value, tt = document.getElementById('st').value;
      if (!dd || !tt) return;
      var ms = new Date(dd + 'T' + tt + ':00-06:00').getTime();
      commit(Math.round((ms - START) / MIN));
    };
    if (cur != null) document.getElementById('sDel').onclick = function () {
      delete state.splits[key]; save('splits'); closeModal(); refresh();
    };
    document.getElementById('mClose').onclick = closeModal;
  }

  /* ---------- wiring ---------- */
  function refresh() { drawProfile(); renderTable(); renderBuffers(); renderGrades(); renderCrew(); renderPacers(); tick(); }

  document.querySelectorAll('.tab').forEach(function (t) {
    t.onclick = function () {
      document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('on'); });
      document.querySelectorAll('.view').forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      document.getElementById('v-' + t.dataset.view).classList.add('on');
      window.scrollTo(0, 0);
      if (t.dataset.view === 'now') drawProfile();
    };
  });

  document.querySelectorAll('[data-plan]').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('[data-plan]').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); state.plan = b.dataset.plan; save('plan'); refresh();
    };
  });

  document.getElementById('clearSplits').onclick = function () {
    if (!Object.keys(state.splits).length) return;
    state.splits = {}; save('splits'); refresh();
  };

  var themeBtn = document.getElementById('themeBtn');
  function applyTheme() {
    document.body.classList.toggle('light', state.theme === 'light');
    themeBtn.textContent = state.theme === 'light' ? 'Switch to night mode' : 'Switch to day mode';
    var m = document.querySelector('meta[name=theme-color]');
    if (m) m.setAttribute('content', state.theme === 'light' ? '#F3F1EA' : '#0B0F14');
    drawProfile();
  }
  themeBtn.onclick = function () { state.theme = state.theme === 'light' ? 'dark' : 'light'; save('theme'); applyTheme(); };

  var wl = null, wakeBtn = document.getElementById('wakeBtn');
  wakeBtn.onclick = function () {
    if (!('wakeLock' in navigator)) { wakeBtn.textContent = 'Keep screen awake: not supported'; return; }
    if (wl) { wl.release(); wl = null; wakeBtn.textContent = 'Keep screen awake: off'; return; }
    navigator.wakeLock.request('screen').then(function (l) {
      wl = l; wakeBtn.textContent = 'Keep screen awake: ON';
      l.addEventListener('release', function () { wl = null; wakeBtn.textContent = 'Keep screen awake: off'; });
    }).catch(function () { wakeBtn.textContent = 'Keep screen awake: blocked'; });
  };

  document.getElementById('cacheManual').onclick = function () {
    var msg = document.getElementById('cacheMsg');
    if (!('caches' in window)) { msg.textContent = 'Offline storage not available in this browser.'; return; }
    msg.textContent = 'Downloading…';
    caches.open('rrr-docs-v1').then(function (c) { return c.add('2026-RRR-Manual.pdf'); })
      .then(function () { msg.textContent = 'Manual saved. It will open without a signal.'; })
      .catch(function () { msg.textContent = 'Could not save the manual — check your connection and try again.'; });
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function () {
      document.getElementById('swState').textContent = 'offline ready';
      document.getElementById('swState').className = 'badge k';
    }).catch(function () {
      document.getElementById('swState').textContent = 'online only';
      document.getElementById('swState').className = 'badge r';
    });
  } else {
    document.getElementById('swState').textContent = 'online only';
    document.getElementById('swState').className = 'badge r';
  }

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawProfile, 150); });

  load();
  document.querySelectorAll('[data-plan]').forEach(function (b) { b.classList.toggle('on', b.dataset.plan === state.plan); });
  applyTheme();
  renderSections(); renderKit(); refresh();
  setInterval(tick, 1000);
})();
