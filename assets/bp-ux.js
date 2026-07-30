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
  function savedInfo() { return read('bp_saved', null); }
  function setSaved(email) { write('bp_saved', { email: email || '', at: Date.now() }); }

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
    // History is captured even when signed out, so an anonymous visitor's
    // exploration can be surfaced (and offered to save) on exit intent.
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
    // Keep anything the user starred; clear the rest.
    var h = history(), s = stars();
    var keptHist = {}, keptStars = {};
    Object.keys(h).forEach(function (k) {
      if (s[k]) { keptHist[k] = h[k]; keptStars[k] = true; }
    });
    write(LS_HIST, keptHist);
    write(LS_STAR, keptStars);
    renderDrawer();
    decorateProgress();
  }

  // Record that a content page was explored (no media progress needed).
  // Never clobbers an entry that already has real playback progress.
  function recordView(item) {
    if (!item || !item.id) return;
    var h = history();
    var prev = h[item.id] || {};
    if (prev.duration) { prev.updated = Date.now(); h[item.id] = prev; write(LS_HIST, h); return; }
    h[item.id] = {
      id: item.id,
      title: item.title || prev.title || 'Untitled',
      type: item.type || prev.type || 'Page',
      url: item.url || prev.url || item.id,
      thumb: item.thumb || prev.thumb || '',
      progress: prev.progress || 0,
      position: prev.position || 0,
      duration: prev.duration || 0,
      updated: Date.now()
    };
    write(LS_HIST, h);
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
    + '.bpux-drawer[hidden]{display:none}'
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
    // exit-intent save modal
    + '.bpux-mscrim{position:fixed;inset:0;background:rgba(10,16,24,.55);z-index:100001;opacity:0;transition:opacity .22s;display:flex;align-items:center;justify-content:center;padding:20px}'
    + '.bpux-mscrim[hidden]{display:none}'
    + '.bpux-mscrim.show{opacity:1}'
    + '.bpux-modal{background:#fff;border-radius:20px;max-width:400px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.35);padding:30px 28px 26px;transform:translateY(14px) scale(.98);transition:transform .22s cubic-bezier(.2,.8,.2,1);font-family:Inter,system-ui,sans-serif}'
    + '.bpux-mscrim.show .bpux-modal{transform:none}'
    + '.bpux-modal .em{font-size:1.7rem;margin-bottom:10px}'
    + '.bpux-modal h3{font-size:1.25rem;font-weight:800;color:#1a1a1a;letter-spacing:-.01em;margin:0 0 8px}'
    + '.bpux-modal p{font-size:.88rem;color:#6b6b6b;line-height:1.5;margin:0 0 18px}'
    + '.bpux-modal .cnt{font-weight:700;color:#1a1a1a}'
    + '.bpux-form{display:flex;flex-direction:column;gap:10px}'
    + '.bpux-form input{font-family:inherit;font-size:.9rem;padding:12px 14px;border:1px solid #d9d5cd;border-radius:10px;outline:none;transition:border-color .15s}'
    + '.bpux-form input:focus{border-color:#2a9fd6}'
    + '.bpux-form .save{background:#1a1a1a;color:#fff;border:0;font-size:.9rem;font-weight:700;padding:13px;border-radius:100px;cursor:pointer;transition:background .15s}'
    + '.bpux-form .save:hover{background:#000}'
    + '.bpux-mno{margin-top:12px;width:100%;background:none;border:0;color:#9a9a9a;font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit}'
    + '.bpux-mno:hover{color:#6b6b6b}'
    + '.bpux-mnote{font-size:.72rem;color:#a7a7a7;text-align:center;margin-top:12px}'
    // rewatch / relisten nudge (shown at >=80% complete)
    + '.bpux-rewatch-wrap{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap;animation:bpux-fade .3s ease}'
    + '.bpux-rewatch-txt{font-size:.85rem;color:#6b6b6b}'
    + '.bpux-rewatch{display:inline-flex;align-items:center;gap:8px;background:#1a1a1a;color:#fff;font-size:.82rem;font-weight:600;padding:9px 16px;border-radius:100px;border:0;cursor:pointer;font-family:Inter,system-ui,sans-serif;transition:background .15s}'
    + '.bpux-rewatch:hover{background:#000}'
    + '.bpux-rewatch svg{width:15px;height:15px;fill:currentColor}'
    + '@keyframes bpux-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}'
    + '@media(max-width:520px){.bpux-status{display:none}}';

  function injectStyle() {
    var s = document.createElement('style');
    s.id = 'bpux-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---- UI: widget ----
  var rootEl, switchEl, statusEl, profileBtn, drawerEl, scrimEl, mscrimEl;

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
      + '<div class="bpux-dfoot"><button class="bpux-clear">Clear history (keeps starred)</button></div>';
    document.body.appendChild(drawerEl);
    drawerEl.querySelector('.bpux-close').addEventListener('click', closeDrawer);
    drawerEl.querySelector('.bpux-clear').addEventListener('click', clearHistory);
  }

  function openDrawer(force) {
    // force === true opens even when signed out (used by exit intent).
    // Event objects passed by click handlers are not === true, so normal
    // toggle/profile clicks still require auth.
    if (force !== true && !isAuthed()) return;
    renderDrawer();
    scrimEl.hidden = false; drawerEl.hidden = false;
    requestAnimationFrame(function () { scrimEl.classList.add('show'); drawerEl.classList.add('show'); });
  }
  function closeDrawer() {
    scrimEl.classList.remove('show'); drawerEl.classList.remove('show');
    setTimeout(function () { scrimEl.hidden = true; drawerEl.hidden = true; }, 280);
  }

  // ---- exit-intent save modal ----
  function buildModal() {
    mscrimEl = document.createElement('div');
    mscrimEl.className = 'bpux-mscrim';
    mscrimEl.hidden = true;
    mscrimEl.innerHTML =
      '<div class="bpux-modal" role="dialog" aria-modal="true" aria-label="Save your progress">'
      + '<div class="em">📖</div>'
      + '<h3>Save your place before you go</h3>'
      + '<p>You explored <span class="cnt">a few things</span> here. Drop your email and we\'ll keep your history and progress so you can pick up right where you left off.</p>'
      + '<form class="bpux-form" novalidate>'
      + '<input type="email" name="email" placeholder="you@example.com" autocomplete="email" required>'
      + '<button type="submit" class="save">Save my progress</button>'
      + '</form>'
      + '<button class="bpux-mno" type="button">No thanks, keep exploring</button>'
      + '<div class="bpux-mnote">Demo only — nothing leaves this device.</div>'
      + '</div>';
    document.body.appendChild(mscrimEl);

    var form = mscrimEl.querySelector('.bpux-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (form.email.value || '').trim();
      setSaved(email);
      setAuthed(true);
      reflectAuth();
      closeSaveModal();
      if (drawerEl.hidden) openDrawer(true); else renderDrawer();
    });
    mscrimEl.querySelector('.bpux-mno').addEventListener('click', closeSaveModal);
    mscrimEl.addEventListener('click', function (e) { if (e.target === mscrimEl) closeSaveModal(); });
  }

  function openSaveModal() {
    if (!mscrimEl) return;
    var n = sortedHistory().length;
    var cnt = mscrimEl.querySelector('.cnt');
    if (cnt) cnt.textContent = n + (n === 1 ? ' item' : ' items');
    mscrimEl.hidden = false;
    requestAnimationFrame(function () { mscrimEl.classList.add('show'); });
    var inp = mscrimEl.querySelector('input');
    if (inp) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 260);
  }
  function closeSaveModal() {
    if (!mscrimEl) return;
    mscrimEl.classList.remove('show');
    setTimeout(function () { mscrimEl.hidden = true; }, 240);
  }

  function seenExit() { try { return sessionStorage.getItem('bpux_exit') === '1'; } catch (e) { return false; } }
  function markExit() { try { sessionStorage.setItem('bpux_exit', '1'); } catch (e) {} }

  function armExitIntent() {
    document.addEventListener('mouseout', function (e) {
      if (e.relatedTarget || e.toElement) return;   // still inside the window
      if (e.clientY > 0) return;                     // only when leaving toward the top
      if (isAuthed() || savedInfo()) return;         // already captured
      if (seenExit()) return;                        // once per session
      if (!sortedHistory().length) return;           // nothing worth saving yet
      markExit();
      openDrawer(true);
      openSaveModal();
    });
  }

  // ---- record that the current content page was explored ----
  function recordCurrentView() {
    var player = document.querySelector('mux-player');
    if (player) {
      var pid = player.getAttribute('playback-id') || '';
      var title = player.getAttribute('metadata-video-title')
        || document.title.replace(/\s*[—-]\s*BibleProject.*$/i, '').trim();
      recordView({ id: pageId(), title: title, type: 'Video', url: pageId(), thumb: pid ? muxThumb(pid) : '' });
      return;
    }
    var art = document.querySelector('article.article');
    if (art) {
      var h1 = art.querySelector('h1');
      var img = art.querySelector('.hero-img');
      recordView({ id: pageId(), title: h1 ? h1.textContent.trim() : document.title,
        type: 'Article', url: pageId(), thumb: (img && img.getAttribute('src')) || '' });
    }
  }

  function pctLabel(it) {
    if (!it.duration) return it.type === 'Article' ? 'Read' : 'Explored';
    if (it.progress >= 0.95) return it.type === 'Podcast' ? 'Finished' : 'Watched';
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
        + (it.duration ? '<div class="bpux-bar"><span style="width:' + Math.round(it.progress * 100) + '%"></span></div>' : '')
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

  // ---- rewatch / relisten nudge (>=80% complete) ----
  var REWATCH_AT = 0.8;
  function rewindIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>';
  }

  function showVideoRewatch(player) {
    if (document.getElementById('bpux-rewatch')) return;
    var wrap = document.createElement('div');
    wrap.className = 'bpux-rewatch-wrap';
    wrap.id = 'bpux-rewatch';
    wrap.innerHTML = '<span class="bpux-rewatch-txt">Finished — worth a second watch?</span>'
      + '<button class="bpux-rewatch" type="button">' + rewindIcon() + 'Watch again</button>';
    var anchor = player.closest('.video-player-wrap') || player.parentNode;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    else document.body.appendChild(wrap);
    wrap.querySelector('.bpux-rewatch').addEventListener('click', function () {
      try { player.currentTime = 0; player.play(); } catch (e) {}
      wrap.remove();
    });
  }

  function showPodcastRewatch(row) {
    var host = row.querySelector('.ep-info') || row.querySelector('.player-meta');
    if (!host || host.querySelector('.bpux-rewatch-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'bpux-rewatch-wrap';
    wrap.innerHTML = '<button class="bpux-rewatch" type="button">' + rewindIcon() + 'Listen again</button>';
    host.appendChild(wrap);
    wrap.querySelector('.bpux-rewatch').addEventListener('click', function (e) {
      e.stopPropagation();
      var audio = document.getElementById('podAudio');
      var btn = row.querySelector('.ep-play, .play-btn');
      if (btn && btn.classList.contains('playing')) {
        try { if (audio) audio.currentTime = 0; if (audio && audio.paused) audio.play(); } catch (err) {}
      } else if (btn) {
        btn.click(); // page script switches to this episode and plays from the top
      }
    });
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
    function checkRewatch() {
      var d = player.duration || 0, t = player.currentTime || 0;
      if (d > 0 && t / d >= REWATCH_AT) showVideoRewatch(player);
    }
    player.addEventListener('loadedmetadata', function () {
      tryResume(); applyResume();
      // a video revisited after it was (nearly) finished shows the nudge on load
      var it = history()[item.id];
      if (it && it.progress >= REWATCH_AT) showVideoRewatch(player);
    });

    var save = saveThrottled(function () {
      recordProgress(item, player.currentTime || 0, player.duration || 0);
    });
    player.addEventListener('timeupdate', function () { save(); checkRewatch(); });
    ['pause', 'ended', 'seeked'].forEach(function (ev) {
      player.addEventListener(ev, function () {
        recordProgress(item, player.currentTime || 0, player.duration || 0);
        checkRewatch();
      });
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
    function checkRewatch() {
      var d = audio.duration || 0, t = audio.currentTime || 0;
      if (d <= 0 || t / d < REWATCH_AT) return;
      var row = currentRow(); if (row) showPodcastRewatch(row);
    }
    var save = saveThrottled(function () {
      var row = currentRow(); if (!row) return;
      var meta = episodeMeta(row);
      recordProgress({ id: episodeId(row), title: meta.title, type: 'Podcast', url: pageId(), thumb: meta.thumb },
        audio.currentTime || 0, audio.duration || 0);
    });
    audio.addEventListener('timeupdate', function () { save(); checkRewatch(); });
    ['pause', 'ended'].forEach(function (ev) {
      audio.addEventListener(ev, function () {
        var row = currentRow(); if (!row) return;
        var meta = episodeMeta(row);
        recordProgress({ id: episodeId(row), title: meta.title, type: 'Podcast', url: pageId(), thumb: meta.thumb },
          audio.currentTime || 0, audio.duration || 0);
        checkRewatch();
      });
    });
  }

  // ---- boot ----
  function boot() {
    injectStyle();
    buildWidget();
    buildModal();
    recordCurrentView();
    trackVideo();
    trackPodcast();
    decorateProgress();
    armExitIntent();
    // keep listing decorations fresh if cards load late
    setTimeout(decorateProgress, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
