/* ============================================================
   BibleProject Sandbox — Authenticated Experience (concept)
   A single, self-contained script included on every page.
   Persists state in localStorage, injects a top-right auth
   toggle + profile drawer, tracks video/podcast progress,
   records watch history, and supports starring history items.
   ============================================================ */
(function () {
  'use strict';

  var LS_AUTH = 'bp_auth';
  var LS_HIST = 'bp_history';
  var LS_STAR = 'bp_stars';

  // ---- storage helpers ----
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function isAuthed() { return read(LS_AUTH, false) === true; }
  function setAuthed(v) { write(LS_AUTH, !!v); }
  function history() { return read(LS_HIST, {}); }
  function stars() { return read(LS_STAR, {}); }

  // ---- id / url helpers ----
  function normId(pathname) {
    var p = pathname.replace(/index\.html$/i, '');
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }
  function pageId() { return normId(location.pathname); }
  function resolveHref(href) {
    try { return normId(new URL(href, location.href).pathname); } catch (e) { return null; }
  }
  function muxThumb(pid) {
    return 'https://image.mux.com/' + pid + '/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop';
  }

  // ---- history model ----
  function recordProgress(item, position, duration) {
    if (!isAuthed()) return;
    if (!duration || duration < 1) return;
    var h = history();
    var prev = h[item.id] || {};
    var progress = Math.min(1, Math.max(0, position / duration));
    // never let progress go backwards on a resume-seek glitch unless meaningful
    h[item.id] = {
      id: item.id,
      title: item.title || prev.title || 'Untitled',
      type: item.type || prev.type || 'Video',
      url: item.url || prev.url || item.id,
      thumb: item.thumb || prev.thumb || '',
      progress: progress,
      position: position,
      duration: duration,
      updated: Date.now()
    };
    write(LS_HIST, h);
    decorateProgress();
    if (drawerEl && !drawerEl.hidden) renderDrawer();
  }
  function toggleStar(id) {
    var s = stars();
    if (s[id]) delete s[id]; else s[id] = true;
    write(LS_STAR, s);
    renderDrawer();
    decorateProgress();
  }
  function clearHistory() {
    write(LS_HIST, {});
    write(LS_STAR, {});
    renderDrawer();
    decorateProgress();
  }

  function sortedHistory() {
    var h = history(), s = stars();
    var arr = Object.keys(h).map(function (k) { return h[k]; });
    arr.sort(function (a, b) {
      var sa = s[a.id] ? 1 : 0, sb = s[b.id] ? 1 : 0;
      if (sa !== sb) return sb - sa;            // starred first
      return b.updated - a.updated;             // then most recent
    });
    return arr;
  }

  // ---- UI: styles ----
  var CSS = ''
    + '#bpux-root{position:fixed;top:10px;right:14px;z-index:99999;font-family:Inter,system-ui,sans-serif}'
    + '.bpux-pill{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(0,0,0,.1);box-shadow:0 4px 18px rgba(0,0,0,.14);border-radius:100px;padding:5px 8px 5px 12px}'
    + '.bpux-status{font-size:.72rem;font-weight:700;color:#1a1a1a;letter-spacing:.02em;white-space:nowrap}'
    + '.bpux-switch{position:relative;width:40px;height:22px;border-radius:100px;border:0;background:#c9c9c9;cursor:pointer;transition:background .18s;flex-shrink:0;padding:0}'
    + '.bpux-switch[aria-checked="true"]{background:#2a9fd6}'
    + '.bpux-knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .18s;box-shadow:0 1px 3px rgba(0,0,0,.3)}'
    + '.bpux-switch[aria-checked="true"] .bpux-knob{left:20px}'
    + '.bpux-profile{border:0;background:#1a1a1a;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0}'
    + '.bpux-profile:hover{background:#000}'
    + '.bpux-scrim{position:fixed;inset:0;background:rgba(10,16,24,.45);z-index:99998;opacity:0;transition:opacity .25s}'
    + '.bpux-scrim.show{opacity:1}'
    + '.bpux-drawer{position:fixed;top:0;right:0;height:100%;width:380px;max-width:92vw;background:#fff;z-index:99999;box-shadow:-14px 0 40px rgba(0,0,0,.2);transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif}'
    + '.bpux-drawer.show{transform:none}'
    + '.bpux-dhead{display:flex;align-items:center;gap:12px;padding:20px;border-bottom:1px solid #eee}'
    + '.bpux-dhead .av{width:42px;height:42px;border-radius:50%;background:#2a9fd6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}'
    + '.bpux-dhead h2{font-size:1.05rem;font-weight:800;margin:0;color:#1a1a1a}'
    + '.bpux-dhead p{font-size:.76rem;color:#6b6b6b;margin:0}'
    + '.bpux-close{margin-left:auto;border:0;background:#f2f2f2;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;color:#333}'
    + '.bpux-close:hover{background:#e6e6e6}'
    + '.bpux-dbody{flex:1;overflow-y:auto;padding:8px 12px 20px}'
    + '.bpux-sectlabel{font-size:.66rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9a9a9a;padding:16px 8px 8px}'
    + '.bpux-item{display:flex;gap:12px;padding:10px 8px;border-radius:12px;text-decoration:none;color:inherit;cursor:pointer}'
    + '.bpux-item:hover{background:#f7f5f0}'
    + '.bpux-thumb{width:96px;height:54px;border-radius:8px;object-fit:cover;background:#0d1a26;flex-shrink:0;position:relative;overflow:hidden}'
    + '.bpux-thumb .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#4a7ea0;font-size:1.1rem}'
    + '.bpux-imeta{flex:1;min-width:0}'
    + '.bpux-itype{font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2a9fd6}'
    + '.bpux-ititle{font-size:.86rem;font-weight:700;line-height:1.3;color:#1a1a1a;margin:1px 0 6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
    + '.bpux-bar{height:4px;border-radius:100px;background:#e6e2da;overflow:hidden}'
    + '.bpux-bar span{display:block;height:100%;background:#2a9fd6;border-radius:100px}'
    + '.bpux-pct{font-size:.68rem;color:#6b6b6b;margin-top:4px}'
    + '.bpux-star{border:0;background:none;cursor:pointer;font-size:1.1rem;line-height:1;color:#cfcabf;align-self:flex-start;padding:2px}'
    + '.bpux-star.on{color:#f5b301}'
    + '.bpux-empty{text-align:center;color:#9a9a9a;font-size:.85rem;padding:48px 20px}'
    + '.bpux-empty .big{font-size:2rem;margin-bottom:8px}'
    + '.bpux-dfoot{padding:14px 20px;border-top:1px solid #eee}'
    + '.bpux-clear{width:100%;border:1px solid #e0ddd8;background:#fff;color:#6b6b6b;font-size:.8rem;font-weight:600;padding:10px;border-radius:100px;cursor:pointer}'
    + '.bpux-clear:hover{background:#faf6ef}'
    // on-page progress overlays
    + '.bpux-cardbar{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(0,0,0,.35);z-index:3}'
    + '.bpux-cardbar span{display:block;height:100%;background:#2a9fd6}'
    + '.bpux-cardstar{position:absolute;top:8px;right:8px;z-index:4;color:#f5b301;font-size:1rem;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}'
    + '.bpux-epbar{height:4px;border-radius:100px;background:#e6e2da;overflow:hidden;margin-top:8px;max-width:280px}'
    + '.bpux-epbar span{display:block;height:100%;background:#2a9fd6}'
    + '.bpux-resume{display:inline-flex;align-items:center;gap:8px;background:#eaf5fb;border:1px solid #bfe4f5;color:#12557a;font-size:.8rem;font-weight:600;padding:8px 14px;border-radius:100px;margin-bottom:14px}'
    + '@media(max-width:520px){.bpux-status{display:none}}';

  function injectStyle() {
    var s = document.createElement('style');
    s.id = 'bpux-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---- UI: widget ----
  var rootEl, switchEl, statusEl, profileBtn, drawerEl, scrimEl;

  function buildWidget() {
    rootEl = document.createElement('div');
    rootEl.id = 'bpux-root';
    rootEl.innerHTML =
      '<div class="bpux-pill">'
      + '<button class="bpux-switch" role="switch" aria-checked="false" aria-label="Toggle demo sign-in"><span class="bpux-knob"></span></button>'
      + '<span class="bpux-status">Signed out</span>'
      + '<button class="bpux-profile" hidden aria-label="Open your profile">You</button>'
      + '</div>';
    document.body.appendChild(rootEl);
    switchEl = rootEl.querySelector('.bpux-switch');
    statusEl = rootEl.querySelector('.bpux-status');
    profileBtn = rootEl.querySelector('.bpux-profile');

    switchEl.addEventListener('click', function () {
      var next = !isAuthed();
      setAuthed(next);
      reflectAuth();
      if (next) openDrawer(); else closeDrawer();
    });
    profileBtn.addEventListener('click', openDrawer);

    buildDrawer();
    reflectAuth();
  }

  function reflectAuth() {
    var on = isAuthed();
    switchEl.setAttribute('aria-checked', on ? 'true' : 'false');
    statusEl.textContent = on ? 'Signed in' : 'Signed out';
    profileBtn.hidden = !on;
    decorateProgress();
    applyResume();
  }

  function buildDrawer() {
    scrimEl = document.createElement('div');
    scrimEl.className = 'bpux-scrim';
    scrimEl.hidden = true;
    scrimEl.addEventListener('click', closeDrawer);
    document.body.appendChild(scrimEl);

    drawerEl = document.createElement('div');
    drawerEl.className = 'bpux-drawer';
    drawerEl.hidden = true;
    drawerEl.innerHTML =
      '<div class="bpux-dhead">'
      + '<span class="av">You</span>'
      + '<div><h2>Your Profile</h2><p>Demo account · progress saved on this device</p></div>'
      + '<button class="bpux-close" aria-label="Close">&times;</button>'
      + '</div>'
      + '<div class="bpux-dbody" id="bpux-dbody"></div>'
      + '<div class="bpux-dfoot"><button class="bpux-clear">Clear watch history</button></div>';
    document.body.appendChild(drawerEl);
    drawerEl.querySelector('.bpux-close').addEventListener('click', closeDrawer);
    drawerEl.querySelector('.bpux-clear').addEventListener('click', clearHistory);
  }

  function openDrawer() {
    if (!isAuthed()) return;
    renderDrawer();
    scrimEl.hidden = false; drawerEl.hidden = false;
    requestAnimationFrame(function () { scrimEl.classList.add('show'); drawerEl.classList.add('show'); });
  }
  function closeDrawer() {
    scrimEl.classList.remove('show'); drawerEl.classList.remove('show');
    setTimeout(function () { scrimEl.hidden = true; drawerEl.hidden = true; }, 280);
  }

  function pctLabel(it) {
    if (it.progress >= 0.95) return 'Watched';
    if (it.progress <= 0.01) return 'Just started';
    return Math.round(it.progress * 100) + '% complete';
  }

  function renderDrawer() {
    var body = document.getElementById('bpux-dbody');
    if (!body) return;
    var items = sortedHistory(), s = stars();
    if (!items.length) {
      body.innerHTML = '<div class="bpux-empty"><div class="big">📺</div>Nothing watched yet.<br>Play a video or podcast episode and it will show up here.</div>';
      return;
    }
    var anyStar = items.some(function (i) { return s[i.id]; });
    var html = '';
    var wroteStarLabel = false, wroteHistLabel = false;
    items.forEach(function (it) {
      var starred = !!s[it.id];
      if (anyStar && starred && !wroteStarLabel) { html += '<div class="bpux-sectlabel">★ Starred</div>'; wroteStarLabel = true; }
      if (anyStar && !starred && !wroteHistLabel) { html += '<div class="bpux-sectlabel">History</div>'; wroteHistLabel = true; }
      if (!anyStar && !wroteHistLabel) { html += '<div class="bpux-sectlabel">Watch history</div>'; wroteHistLabel = true; }
      var thumb = it.thumb
        ? '<img class="bpux-thumb" src="' + it.thumb + '" alt="" onerror="this.outerHTML=\'<div class=&quot;bpux-thumb&quot;><span class=&quot;ph&quot;>' + (it.type === 'Podcast' ? '🎧' : '▶') + '</span></div>\'">'
        : '<div class="bpux-thumb"><span class="ph">' + (it.type === 'Podcast' ? '🎧' : '▶') + '</span></div>';
      html += ''
        + '<div class="bpux-item" data-go="' + it.url + '">'
        + thumb
        + '<div class="bpux-imeta">'
        + '<div class="bpux-itype">' + it.type + '</div>'
        + '<div class="bpux-ititle">' + it.title + '</div>'
        + '<div class="bpux-bar"><span style="width:' + Math.round(it.progress * 100) + '%"></span></div>'
        + '<div class="bpux-pct">' + pctLabel(it) + '</div>'
        + '</div>'
        + '<button class="bpux-star ' + (starred ? 'on' : '') + '" data-star="' + it.id + '" aria-label="Star" title="Star for quick reference">' + (starred ? '★' : '☆') + '</button>'
        + '</div>';
    });
    body.innerHTML = html;
    body.querySelectorAll('[data-star]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); toggleStar(b.getAttribute('data-star')); });
    });
    body.querySelectorAll('[data-go]').forEach(function (row) {
      row.addEventListener('click', function () { var u = row.getAttribute('data-go'); if (u) location.href = u; });
    });
  }

  // ---- on-page progress decorations ----
  function decorateProgress() {
    // clear old
    document.querySelectorAll('.bpux-cardbar,.bpux-cardstar,.bpux-epbar').forEach(function (n) { n.remove(); });
    if (!isAuthed()) return;
    var h = history(), s = stars();

    // video-card listing
    document.querySelectorAll('a.video-card[href]').forEach(function (card) {
      var id = resolveHref(card.getAttribute('href'));
      var it = id && h[id];
      if (!it) return;
      var thumb = card.querySelector('.video-card-thumb');
      if (!thumb) return;
      var bar = document.createElement('div');
      bar.className = 'bpux-cardbar';
      bar.innerHTML = '<span style="width:' + Math.round(it.progress * 100) + '%"></span>';
      thumb.appendChild(bar);
      if (s[id]) { var st = document.createElement('div'); st.className = 'bpux-cardstar'; st.textContent = '★'; thumb.appendChild(st); }
    });

    // podcast episode rows
    document.querySelectorAll('.ep[data-ep],.player-card').forEach(function (row) {
      var id = episodeId(row);
      var it = id && h[id];
      if (!it) return;
      var host = row.querySelector('.ep-info') || row.querySelector('.player-meta');
      if (!host) return;
      var bar = document.createElement('div');
      bar.className = 'bpux-epbar';
      bar.innerHTML = '<span style="width:' + Math.round(it.progress * 100) + '%"></span>';
      host.appendChild(bar);
    });
  }

  function applyResume() {
    if (!isAuthed()) return;
    var player = document.querySelector('mux-player');
    if (!player) return;
    var it = history()[pageId()];
    if (!it || it.position < 5 || it.progress >= 0.95) return;
    var mins = Math.floor(it.position / 60), secs = Math.round(it.position % 60);
    if (document.getElementById('bpux-resume')) return;
    var note = document.createElement('div');
    note.className = 'bpux-resume';
    note.id = 'bpux-resume';
    note.innerHTML = '↺ Resumed from ' + mins + ':' + (secs < 10 ? '0' : '') + secs;
    var wrap = player.closest('.video-player-wrap') || player.parentNode;
    if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(note, wrap.nextSibling);
  }

  // ---- media tracking ----
  function saveThrottled(fn) {
    var last = 0;
    return function () { var now = Date.now(); if (now - last > 2500) { last = now; fn(); } };
  }

  function trackVideo() {
    var player = document.querySelector('mux-player');
    if (!player) return;
    var pid = player.getAttribute('playback-id') || '';
    var title = player.getAttribute('metadata-video-title')
      || (document.querySelector('.video-title') && document.querySelector('.video-title').textContent.trim())
      || document.title.replace(/\s*[—-]\s*BibleProject.*$/i, '').trim();
    var item = { id: pageId(), title: title, type: 'Video', url: pageId(), thumb: pid ? muxThumb(pid) : '' };

    var resumed = false;
    function tryResume() {
      if (resumed) return; resumed = true;
      if (!isAuthed()) return;
      var it = history()[item.id];
      if (it && it.position > 5 && it.progress < 0.95) {
        try { player.currentTime = it.position; } catch (e) {}
      }
    }
    player.addEventListener('loadedmetadata', function () { tryResume(); applyResume(); });

    var save = saveThrottled(function () {
      recordProgress(item, player.currentTime || 0, player.duration || 0);
    });
    player.addEventListener('timeupdate', save);
    ['pause', 'ended', 'seeked'].forEach(function (ev) {
      player.addEventListener(ev, function () { recordProgress(item, player.currentTime || 0, player.duration || 0); });
    });
  }

  function episodeId(row) {
    var base = pageId();
    if (row.classList && row.classList.contains('player-card')) return base + 'ep-0';
    var n = row.getAttribute && row.getAttribute('data-ep');
    return n != null ? base + 'ep-' + n : null;
  }
  function episodeMeta(row) {
    if (row.classList.contains('player-card')) {
      var t = row.querySelector('.player-title');
      var img = row.querySelector('.player-cover');
      return { title: t ? t.textContent.trim() : 'Latest episode', thumb: img ? img.src : '' };
    }
    var et = row.querySelector('.ep-title');
    return { title: et ? et.textContent.trim() : 'Episode', thumb: '' };
  }

  function trackPodcast() {
    var audio = document.getElementById('podAudio');
    if (!audio) return;
    function currentRow() {
      var b = document.querySelector('.play-btn.playing, .ep-play.playing');
      if (!b) return null;
      return b.closest('.ep[data-ep]') || b.closest('.player-card');
    }
    var save = saveThrottled(function () {
      var row = currentRow(); if (!row) return;
      var meta = episodeMeta(row);
      recordProgress({ id: episodeId(row), title: meta.title, type: 'Podcast', url: pageId(), thumb: meta.thumb },
        audio.currentTime || 0, audio.duration || 0);
    });
    audio.addEventListener('timeupdate', save);
    ['pause', 'ended'].forEach(function (ev) {
      audio.addEventListener(ev, function () {
        var row = currentRow(); if (!row) return;
        var meta = episodeMeta(row);
        recordProgress({ id: episodeId(row), title: meta.title, type: 'Podcast', url: pageId(), thumb: meta.thumb },
          audio.currentTime || 0, audio.duration || 0);
      });
    });
  }

  // ---- boot ----
  function boot() {
    injectStyle();
    buildWidget();
    trackVideo();
    trackPodcast();
    decorateProgress();
    // keep listing decorations fresh if cards load late
    setTimeout(decorateProgress, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
