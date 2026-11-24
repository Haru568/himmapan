// หน้าจอทั้งหมดของเกม
(function () {
  var D = window.GameData, B = window.BossData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = Blocks.esc;
  var IMG = function (id) { return '' + id + '.webp'; };

  // ---------- สถานะผู้เล่น ----------
  var P = load('hm_player', null);
  var PROG = null;
  var SERVER = { worlds: CONFIG.OFFLINE_WORLDS.slice(), boss: null, guild: '' };
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pkey() { return P ? P.room + '-' + P.number : 'guest'; }
  function loadProg() { PROG = load('hm_prog_' + pkey(), { quests: {}, pages: ['spell-5-1'], boss: {}, seen: {} }); }
  function saveProg() { save('hm_prog_' + pkey(), PROG); }
  function totalStars() { return Object.keys(PROG.quests).reduce(function (s, k) { return s + (PROG.quests[k].stars || 0); }, 0); }
  function bossDmg() { return Object.keys(PROG.boss).reduce(function (s, k) { return s + (PROG.boss[k].dmg || 0); }, 0); }
  function xp() { return totalStars() * 10 + bossDmg(); }
  function titleOf(x) { var t = D.TITLES[0]; D.TITLES.forEach(function (tt) { if (x >= tt.xp) t = tt; }); return t; }
  function nextTitle(x) { for (var i = 0; i < D.TITLES.length; i++) if (D.TITLES[i].xp > x) return D.TITLES[i]; return null; }
  function charOf(id) { return D.CHARACTERS.filter(function (c) { return c.id === id; })[0] || D.CHARACTERS[0]; }
  function guildOf(name) { return D.GUILDS.filter(function (g) { return g.id === name; })[0]; }
  function worldOpen(n) { return SERVER.worlds.indexOf(n) >= 0; }
  function pageOpen(pg) { return PROG.pages.indexOf(pg.id) >= 0 || worldOpen(pg.week - 4); }
  function questDone(id) { return !!(PROG.quests[id] && PROG.quests[id].done); }

  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    window.scrollTo(0, 0);
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ---------- แถบบน ----------
  function topbar(el, back) {
    var c = charOf(P.character), x = xp(), t = titleOf(x), nt = nextTitle(x);
    var g = guildOf(SERVER.guild || P.guild);
    var pct = nt ? Math.round((x - t.xp) / (nt.xp - t.xp) * 100) : 100;
    el.innerHTML =
      (back ? '<button class="ibtn back" data-act="back" aria-label="ย้อนกลับ">‹</button>' : '') +
      '<div class="me"><div class="avatar" style="--c:' + c.color + '"><img src="' + IMG(c.id) + '" alt=""></div>' +
      '<div><div class="me-name">' + esc(P.name) + ' <span class="muted">เลขที่ ' + esc(P.number) + ' · ' + esc(P.room) + '</span></div>' +
      '<div class="me-title">' + esc(t.name) + ' <span class="xpbar"><i style="width:' + pct + '%"></i></span> <span class="muted">' + x + ' XP</span></div></div></div>' +
      '<div class="chips"><span class="chip star">★ ' + totalStars() + '</span>' +
      (g ? '<span class="chip guild" style="--g:' + g.color + '">กิลด์' + esc(g.id) + '</span>' : '<span class="chip muted-chip">' + (Api.online() ? 'รอครูจัดกิลด์' : 'โหมดออฟไลน์') + '</span>') +
      '</div><div class="tools">' +
      '<button class="ibtn" data-act="book" title="สมุดเวทมนตร์">📖</button>' +
      '<button class="ibtn" data-act="board" title="ตารางกิลด์">🏆</button>' +
      '<button class="ibtn" data-act="sound" title="เสียง">' + (Sfx.isMuted() ? '🔇' : '🔊') + '</button></div>';
    el.onclick = function (e) {
      var a = e.target.closest('[data-act]'); if (!a) return;
      Sfx.tap();
      if (a.dataset.act === 'back') back();
      if (a.dataset.act === 'book') openBook();
      if (a.dataset.act === 'board') openBoard();
      if (a.dataset.act === 'sound') { Sfx.toggle(); a.textContent = Sfx.isMuted() ? '🔇' : '🔊'; }
    };
  }

  // ---------- หน้าเข้าเกม ----------
  function renderLogin() {
    Fx.setScene('title');
    var sel = P ? P.character : null;
    var el = $('#screen-login');
    el.innerHTML =
      '<div class="login-wrap"><div class="logo"><div class="logo-sub">สำนักโค้ดพระฤๅษีขอต้อนรับ</div><h1>ช่างโค้ดแห่งหิมพานต์</h1>' +
      '<div class="logo-tag">ซ่อมแอป ปราบยักษ์บั๊ก ด้วยพลังแห่ง App Lab</div></div>' +
      '<div class="panel login-panel"><div class="row3">' +
      '<label>ชื่อเล่น<input id="in-name" maxlength="20" value="' + esc(P ? P.name : '') + '" placeholder="เช่น มายด์"></label>' +
      '<label>เลขที่<input id="in-num" inputmode="numeric" maxlength="2" value="' + esc(P ? P.number : '') + '" placeholder="12"></label>' +
      '<label>ห้อง<select id="in-room"><option value="">เลือกห้อง</option>' + CONFIG.ROOMS.map(function (r) { return '<option' + (P && P.room === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="pick-title">เลือกตัวละครของเจ้า</div><div class="chars">' +
      D.CHARACTERS.map(function (c) {
        return '<button class="char-card' + (sel === c.id ? ' sel' : '') + '" data-c="' + c.id + '" style="--c:' + c.color + '"><img src="' + IMG(c.id) + '" alt="' + esc(c.name) + '"><b>' + esc(c.name) + '</b><small>' + esc(c.from) + '</small></button>';
      }).join('') + '</div><div class="err" id="login-err"></div>' +
      '<button class="btn gold big" id="btn-enter">เข้าสู่หิมพานต์</button>' +
      (P ? '<button class="link" id="btn-reset">ไม่ใช่ฉัน (เปลี่ยนผู้เล่น)</button>' : '') + '</div></div>';
    el.querySelectorAll('.char-card').forEach(function (b) {
      b.onclick = function () { Sfx.tap(); sel = b.dataset.c; el.querySelectorAll('.char-card').forEach(function (x) { x.classList.toggle('sel', x === b); }); $('#login-err').textContent = ''; };
    });
    ['in-name', 'in-num', 'in-room'].forEach(function (id) { $('#' + id).addEventListener('input', function () { $('#login-err').textContent = ''; }); });
    $('#btn-enter').onclick = function () {
      var name = $('#in-name').value.trim(), num = $('#in-num').value.trim(), room = $('#in-room').value;
      var err = !name ? 'กรอกชื่อเล่นก่อน' : !/^\d{1,2}$/.test(num) ? 'กรอกเลขที่เป็นตัวเลข' : !room ? 'เลือกห้องก่อน' : !sel ? 'เลือกตัวละครก่อน' : '';
      if (err) { $('#login-err').textContent = err; Sfx.wrong(); return; }
      P = { name: name, number: String(Number(num)), room: room, character: sel, guild: P && P.room === room && P.number === String(Number(num)) ? P.guild : '' };
      save('hm_player', P); loadProg(); Sfx.right(); Sfx.music();
      syncServer().then(renderMap);
    };
    var r = $('#btn-reset'); if (r) r.onclick = function () { localStorage.removeItem('hm_player'); P = null; renderLogin(); };
    show('screen-login');
  }

  // ---------- เซิร์ฟเวอร์ ----------
  function syncServer() {
    if (!Api.online() || !P) return Promise.resolve();
    return Promise.all([Api.get('config', { room: P.room }), Api.get('student', { room: P.room, number: P.number })]).then(function (r) {
      var c = r[0], s = r[1];
      if (c && c.ok) { SERVER.worlds = c.worlds; SERVER.boss = c.boss; }
      if (s && s.ok) { SERVER.guild = s.guild || ''; P.guild = SERVER.guild; save('hm_player', P); }
    });
  }
  setInterval(function () {
    var a = document.querySelector('.screen.active');
    if (!a || !P || (a.id !== 'screen-map' && a.id !== 'screen-world')) return;
    var before = JSON.stringify([SERVER.worlds, SERVER.boss && SERVER.boss.open]);
    syncServer().then(function () {
      if (JSON.stringify([SERVER.worlds, SERVER.boss && SERVER.boss.open]) !== before) {
        if (a.id === 'screen-map') renderMap(); else renderWorld(currentWorld);
      }
    });
  }, CONFIG.POLL_CONFIG_MS);

  // ---------- แผนที่ ----------
  function renderMap() {
    Fx.setScene('map');
    var el = $('#screen-map');
    el.innerHTML = '<header class="topbar" id="tb-map"></header><div class="map-title"><h2>หิมพานต์ซิตี้</h2><p>ยักษ์บั๊กบุกเมือง! เลือกย่านเพื่อช่วยชาวเมืองซ่อมแอป</p></div><div class="map"></div>';
    topbar($('#tb-map'), function () { renderLogin(); });
    var map = $('.map', el);
    var pr = document.createElement('button');
    pr.className = 'practice-btn';
    pr.innerHTML = '<img src="' + IMG('npc-ruesi') + '" alt=""><span><b>ลานฝึกพระฤๅษี</b><small>ทบทวนความรู้ได้ไม่จำกัด</small></span>';
    pr.onclick = function () { Sfx.tap(); renderPractice(); };
    el.appendChild(pr);
    D.WORLDS.forEach(function (w) {
      var open = worldOpen(w.n);
      var stars = w.quests.reduce(function (s, q) { return s + ((PROG.quests[q] && PROG.quests[q].stars) || 0); }, 0);
      var max = w.quests.length * 3;
      var b = document.createElement('button');
      b.className = 'island ' + w.theme + (open ? '' : ' locked');
      b.style.left = w.pos.x + '%'; b.style.top = w.pos.y + '%';
      b.innerHTML = '<div class="isle-top"></div><div class="isle-label"><small>โลกที่ ' + w.n + ' · สัปดาห์ที่ ' + w.week + '</small><b>' + esc(w.name) + '</b><span>' + esc(w.topic) + '</span>' +
        (open ? (max ? '<em>★ ' + stars + ' / ' + max + '</em>' : '<em>เร็ว ๆ นี้</em>') : '<em>🔒 ยังไม่เปิด</em>') + '</div>';
      b.onclick = function () {
        if (!open) { Sfx.wrong(); Fx.shake(b); return; }
        if (!w.quests.length) { Sfx.wrong(); toast('ย่านนี้กำลังสร้าง จะเปิดในสัปดาห์ที่ ' + w.week); return; }
        Sfx.tap(); renderWorld(w.n);
      };
      map.appendChild(b);
    });
    show('screen-map');
  }

  // ---------- ย่าน ----------
  var currentWorld = 1;
  function bossGateOpen(w) {
    if (Api.online()) return !!(SERVER.boss && SERVER.boss.open && SERVER.boss.week === w.week);
    return CONFIG.OFFLINE_BOSS_AFTER_QUESTS && w.quests.every(questDone);
  }
  function renderWorld(n) {
    currentWorld = n;
    var w = D.WORLDS[n - 1];
    Fx.setScene(w.theme);
    var el = $('#screen-world');
    el.innerHTML = '<header class="topbar" id="tb-world"></header><div class="world-head"><small>โลกที่ ' + w.n + ' · ' + esc(w.topic) + '</small><h2>' + esc(w.name) + '</h2><button class="btn small practice-link">🧘 ทบทวนที่ลานฝึกพระฤๅษี</button></div><div class="npcs"></div>';
    topbar($('#tb-world'), renderMap);
    $('.practice-link', el).onclick = function () { Sfx.tap(); renderPractice(w.week, function () { renderWorld(n); }); };
    var box = $('.npcs', el);
    w.quests.forEach(function (qid, i) {
      var q = D.QUESTS[qid];
      var locked = i > 0 && !questDone(w.quests[i - 1]);
      var pr = PROG.quests[qid];
      var card = document.createElement('button');
      card.className = 'npc-card' + (locked ? ' locked' : '') + (pr && pr.done ? ' done' : '');
      card.innerHTML = '<div class="npc-img"><img src="' + IMG(q.owner) + '" alt="' + esc(q.ownerName) + '">' + (!locked && !(pr && pr.done) ? '<span class="bang">!</span>' : '') + '</div>' +
        '<div class="npc-info"><small>ภารกิจที่ ' + (i + 1) + ' · ' + esc(q.ownerName) + '</small><b>' + esc(q.title) + '</b><span>' + esc(q.appName) + '</span>' +
        '<em>' + (locked ? '🔒 ผ่านภารกิจก่อนหน้าก่อน' : pr && pr.done ? stars(pr.stars) + ' เล่นซ้ำได้' : 'แตะเพื่อเริ่มภารกิจ') + '</em></div>';
      card.onclick = function () { if (locked) { Sfx.wrong(); Fx.shake(card); return; } Sfx.tap(); startQuest(qid); };
      box.appendChild(card);
    });
    var boss = B.BOSSES[w.boss];
    var open = bossGateOpen(w);
    var beat = PROG.boss[boss.id] && PROG.boss[boss.id].won;
    var g = document.createElement('button');
    g.className = 'npc-card boss-gate' + (open ? ' open' : ' locked');
    g.innerHTML = '<div class="npc-img"><img src="' + IMG(boss.img) + '" alt="' + esc(boss.name) + '"></div><div class="npc-info"><small>บอสประจำสัปดาห์</small><b>' + esc(boss.name) + '</b>' +
      '<span>ทั้งห้องช่วยกันโจมตี</span><em>' + (open ? (beat ? 'ปราบแล้ว! เข้าไปดูได้' : '⚔ ประตูเปิดแล้ว!') : Api.online() ? '🔒 รอครูเปิดประตูบอส' : '🔒 ผ่านภารกิจให้ครบเพื่อเปิด') + '</em></div>';
    g.onclick = function () { if (!open) { Sfx.wrong(); Fx.shake(g); return; } Sfx.tap(); startBoss(w.boss); };
    box.appendChild(g);
    show('screen-world');
  }
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return '<span class="stars">' + s + '</span>'; }

  // ---------- ภารกิจ ----------
  var QS = null; // สถานะภารกิจปัจจุบัน
  function startQuest(qid) {
    var q = D.QUESTS[qid];
    var w = D.WORLDS[q.world - 1];
    Fx.setScene(w.theme);
    QS = { q: q, i: 0, wrongTotal: 0, firstPlay: !questDone(qid), t0: Date.now(), runToken: 0 };
    var el = $('#screen-quest');
    el.innerHTML =
      '<header class="topbar" id="tb-quest"></header>' +
      '<div class="quest-head"><div><small>' + esc(w.name) + ' · ' + esc(q.appName) + '</small><h2>' + esc(q.title) + '</h2></div><div class="dots" id="q-dots"></div></div>' +
      '<div class="quest-grid">' +
      '<section class="npc-col panel"><div class="speech" id="q-speech"></div><img class="npc-big" src="' + IMG(q.owner) + '" alt="' + esc(q.ownerName) + '"><div class="npc-name">' + esc(q.ownerName) + '</div></section>' +
      '<section class="phone-col panel"><div class="col-title">หน้าจอแอป <button class="mini" id="btn-ids">แสดง id</button></div><div id="q-phone"></div>' +
      '<div class="run-row"><button class="btn run" id="btn-run">▶ ลองรัน</button></div></section>' +
      '<section class="flow-col panel"><div class="col-title">ผังงาน</div><div id="q-flow"></div></section>' +
      '<section class="code-col panel"><div class="col-title">โค้ด (โหมดบล็อก App Lab)</div><div id="q-code"></div></section>' +
      '<section class="ask-col panel" id="q-ask"></section></div>';
    topbar($('#tb-quest'), function () { QS.runToken++; renderWorld(q.world); });
    $('#btn-ids').onclick = function () {
      var ph = $('#q-phone .phone'); ph.classList.toggle('show-ids');
      this.textContent = ph.classList.contains('show-ids') ? 'ซ่อน id' : 'แสดง id';
    };
    show('screen-quest');
    say(q.intro);
    renderStep();
  }
  function say(text) {
    var s = $('#q-speech'); if (!s) return;
    s.innerHTML = '';
    var i = 0, token = (say.t = (say.t || 0) + 1);
    (function type() {
      if (token !== say.t) return;
      s.textContent = text.slice(0, i); i += 2;
      if (i <= text.length + 1) setTimeout(type, 18);
    })();
  }
  function dots() {
    var d = $('#q-dots'); if (!d) return;
    d.innerHTML = QS.q.steps.map(function (s, i) { return '<i class="' + (i < QS.i ? 'done' : i === QS.i ? 'cur' : '') + '"></i>'; }).join('') + '<span>ขั้นที่ ' + (QS.i + 1) + '/' + QS.q.steps.length + '</span>';
  }

  function renderStep() {
    var st = QS.q.steps[QS.i];
    QS.st = st; QS.wrong = 0; QS.ts = Date.now(); QS.code = st.code.map(function (l) { return Object.assign({}, l); }); QS.fills = {};
    QS.runToken++;
    dots();
    Blocks.renderPhone($('#q-phone'), st.design, st.values || {}, {});
    Blocks.renderFlow($('#q-flow'), st.flow);
    drawCode();
    bindPhone();
    $('#btn-run').onclick = function () { Sfx.tap(); runCurrent(st.values || {}, st.press || firstButton(st.design)); };
    var ask = $('#q-ask');
    ask.innerHTML = '<div class="q-type">' + typeName(st.type) + '</div><div class="q-text">' + esc(st.question) + '</div><div class="q-body" id="q-body"></div><div class="feedback" id="q-fb"></div><div class="q-actions" id="q-actions"></div>';
    ({ predict: stepPredict, match: stepMatch, bug: stepBug, fill: stepFill, order: stepOrder, test: stepTest })[st.type](st);
  }
  function typeName(t) { return { predict: '🔮 ทายผล', match: '🧩 จับคู่', bug: '🐞 หาบั๊ก', fill: '✏️ เติมโค้ด', order: '🔢 เรียงลำดับ', test: '🧪 ทดสอบแอป' }[t]; }
  function firstButton(design) { var b = design.filter(function (d) { return d.type === 'button'; })[0]; return b && b.id; }
  function drawCode(opts) { Blocks.renderCode($('#q-code'), QS.code, { fills: QS.fills }); if (opts && opts.after) opts.after(); }

  function bindPhone() {
    $('#q-phone').querySelectorAll('.app-btn').forEach(function (b) {
      b.onclick = function () {
        if (QS.st.type === 'order' && !QS.orderDone) { toast('เรียงบล็อกให้ครบก่อนจึงจะรันได้'); return; }
        Sfx.tap(); runCurrent(Blocks.readValues($('#q-phone')), b.dataset.el);
      };
    });
  }
  // รันโค้ดปัจจุบันพร้อมแอนิเมชัน
  function runCurrent(values, press, speed) {
    var st = QS.st;
    if (st.type === 'order' && !QS.orderDone) { toast('เรียงบล็อกให้ครบก่อนจึงจะรันได้'); return Promise.resolve(null); }
    if (values) $('#q-phone').querySelectorAll('.app-input').forEach(function (i) { if (values[i.dataset.el] != null) i.value = values[i.dataset.el]; });
    // คืนข้อความป้ายเป็นค่าเริ่มต้นก่อนรัน
    st.design.forEach(function (d) { var e = $('#q-phone [data-el="' + d.id + '"]'); if (e && (d.type === 'label' || d.type === 'textarea')) { e.textContent = d.text; e.style.color = ''; } });
    var res = Sim.run(QS.code, st.design, Blocks.readValues($('#q-phone')), press, QS.fills);
    if (res.error && /เติมช่องว่าง/.test(res.error)) { toast('เติมช่อง ? ให้ครบก่อน'); return Promise.resolve(res); }
    var token = ++QS.runToken;
    var btn = $('#btn-run'); if (btn) btn.disabled = true;
    return Blocks.play(res.events, { root: $('#screen-quest'), phoneEl: $('#q-phone'), flow: st.flow, speed: speed || 380, cancelled: function () { return token !== QS.runToken; } })
      .then(function () { if (btn) btn.disabled = false; return res; });
  }

  function wrong(msg) {
    QS.wrong++; QS.wrongTotal++;
    Sfx.wrong(); Fx.shake($('#q-ask'));
    var fb = $('#q-fb'); fb.className = 'feedback bad'; fb.innerHTML = '<b>ยังไม่ถูก</b> ' + esc(msg || QS.st.hint);
  }
  function right(afterRun) {
    var st = QS.st;
    Sfx.right(); Fx.sparkle($('#q-ask'));
    var fb = $('#q-fb'); fb.className = 'feedback good'; fb.innerHTML = '<b>ถูกต้อง!</b>';
    say(st.explain);
    logStep();
    var act = $('#q-actions');
    act.innerHTML = '<button class="btn gold" id="btn-next">' + (QS.i < QS.q.steps.length - 1 ? 'ขั้นต่อไป ›' : 'ส่งมอบแอป ›') + '</button>';
    $('#btn-next').onclick = function () {
      Sfx.tap(); QS.runToken++;
      if (QS.i < QS.q.steps.length - 1) { QS.i++; renderStep(); } else finishQuest();
    };
    if (afterRun) afterRun();
  }
  function logStep() {
    var st = QS.st;
    Api.log(row({ quest: QS.q.id, step: QS.i + 1, stepType: st.type, attempts: QS.wrong + 1, firstTry: QS.wrong ? 0 : 1, seconds: Math.round((Date.now() - QS.ts) / 1000) }));
  }
  function row(o) {
    return Object.assign({ time: new Date().toISOString(), room: P.room, number: P.number, name: P.name, character: P.character, guild: SERVER.guild || P.guild || '', firstPlay: QS && QS.firstPlay ? 1 : 0, stars: '' }, o);
  }

  // --- ทายผล
  function stepPredict(st) {
    var body = $('#q-body');
    var order = shuffle(st.choices.map(function (c, i) { return i; }));
    function showChoices() {
      body.innerHTML = '<div class="choices">' + order.map(function (i, k) { return '<button class="choice" data-i="' + i + '"><span>' + 'กขคง'[k] + '</span>' + esc(st.choices[i]) + '</button>'; }).join('') + '</div>';
      body.querySelectorAll('.choice').forEach(function (b) {
        b.onclick = function () {
          if (QS.answered) return;
          var i = Number(b.dataset.i);
          if (i === st.answer) {
            QS.answered = true; b.classList.add('ok');
            right(function () { if (!st.showFirst) runCurrent(st.values, st.press); });
          } else { b.classList.add('no'); b.disabled = true; wrong(); }
        };
      });
    }
    QS.answered = false;
    if (st.showFirst) {
      body.innerHTML = '<div class="hint-run">กำลังรันแอปให้ดูอาการ…</div>';
      runCurrent(st.values, st.press).then(showChoices);
    } else showChoices();
  }

  // --- จับคู่ผังงานกับบล็อก
  function stepMatch(st) {
    var selF = null, matched = {}, total = Object.keys(st.pairs).length, n = 0;
    $('#q-body').innerHTML = '<div class="hint-run">แตะกล่องในผังงาน แล้วแตะบล็อกในโค้ดที่ตรงกัน · จับคู่แล้ว <b id="m-count">0</b>/' + total + '</div>';
    var root = $('#screen-quest');
    root.querySelectorAll('.fnode').forEach(function (f) {
      if (!st.pairs[f.dataset.flow]) return;
      f.classList.add('pickable');
      f.onclick = function () {
        if (matched[f.dataset.flow]) return;
        Sfx.tap(); selF = f.dataset.flow;
        root.querySelectorAll('.fnode').forEach(function (x) { x.classList.toggle('sel', x === f); });
      };
    });
    root.querySelectorAll('#q-code .line').forEach(function (ln) {
      ln.classList.add('pickable');
      ln.onclick = function () {
        var id = ln.dataset.line;
        if (!selF) { toast('แตะกล่องในผังงานก่อน'); return; }
        if (st.pairs[selF].indexOf(id) >= 0) {
          n++; var color = n;
          matched[selF] = true;
          root.querySelector('[data-flow="' + selF + '"]').classList.add('matched', 'm' + color);
          root.querySelector('[data-flow="' + selF + '"]').classList.remove('sel');
          st.pairs[selF].forEach(function (lid) { var l = root.querySelector('#q-code [data-line="' + lid + '"]'); if (l) l.classList.add('matched', 'm' + color); });
          Sfx.star(); selF = null; $('#m-count').textContent = n;
          if (n === total) right();
        } else wrong();
      };
    });
  }

  // --- หาบั๊ก
  function stepBug(st) {
    var body = $('#q-body');
    body.innerHTML = '<div class="hint-run">กำลังรันแอปให้ดูอาการ…</div>';
    var phase = 1;
    runCurrent(st.values, st.press).then(function () {
      body.innerHTML = '<div class="hint-run">👆 แตะบล็อกที่คิดว่าผิดในโค้ดด้านล่าง (กด ▶ ลองรัน ดูอาการซ้ำได้)</div>';
      armLines();
    });
    function armLines() {
      $('#screen-quest').querySelectorAll('#q-code .line').forEach(function (ln) {
        ln.classList.add('pickable');
        ln.onclick = function () {
          if (phase !== 1) return;
          if (st.badLines.indexOf(ln.dataset.line) >= 0) {
            phase = 2; Sfx.right();
            st.badLines.forEach(function (id) { var l = $('#q-code [data-line="' + id + '"]'); if (l) l.classList.add('buggy'); });
            showFix();
          } else { ln.classList.add('nope'); setTimeout(function () { ln.classList.remove('nope'); }, 600); wrong('บล็อกนี้ทำงานถูกแล้ว ลองดูบล็อกอื่น'); }
        };
      });
    }
    function showFix() {
      var order = shuffle(st.fixChoices);
      body.innerHTML = '<div class="hint-run">' + esc(st.fixQuestion) + '</div><div class="choices code-choices">' +
        order.map(function (c) { return '<button class="choice mono" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
      body.querySelectorAll('.choice').forEach(function (b) {
        b.onclick = function () {
          if (phase !== 2) return;
          if (b.dataset.v === st.fixAnswer) {
            phase = 3; b.classList.add('ok');
            QS.code = QS.code.map(function (l) { return st.badLines.indexOf(l.id) >= 0 ? Object.assign({}, l, { text: l.text.replace(st.from, st.fixAnswer) }) : l; });
            drawCode();
            $('#screen-quest').querySelectorAll('#q-code .line').forEach(function (l) { if (st.badLines.indexOf(l.dataset.line) >= 0) l.classList.add('fixed'); });
            runCurrent(st.values, st.press).then(function (res) {
              if (res && Sim.finalText(res, st.check.id) === st.check.text) right(); else wrong('แก้แล้วแต่ผลยังไม่ถูก ลองใหม่');
            });
          } else { b.classList.add('no'); b.disabled = true; wrong(); }
        };
      });
    }
  }

  // --- เติมโค้ด
  function stepFill(st) {
    var body = $('#q-body');
    var keys = Object.keys(st.blanks);
    function armSlots() {
      $('#q-code').querySelectorAll('.slot').forEach(function (s) {
        s.onclick = function () { Sfx.tap(); openPalette(s.dataset.slot); };
      });
    }
    function openPalette(k) {
      var bl = st.blanks[k];
      body.innerHTML = '<div class="hint-run">เลือกค่าสำหรับช่อง ?</div><div class="choices code-choices">' +
        shuffle(bl.choices).map(function (c) { return '<button class="choice mono' + (QS.fills[k] === c ? ' picked' : '') + '" data-v="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
      body.querySelectorAll('.choice').forEach(function (b) {
        b.onclick = function () { Sfx.tap(); QS.fills[k] = b.dataset.v; drawCode(); armSlots(); idle(); };
      });
    }
    function idle() {
      var all = keys.every(function (k) { return QS.fills[k]; });
      body.innerHTML = '<div class="hint-run">' + (all ? 'เติมครบแล้ว กดทดสอบเพื่อตรวจ หรือแตะช่องเพื่อเปลี่ยน' : '👆 แตะช่อง <span class="slot demo">?</span> ในโค้ดด้านล่าง') + '</div>';
      $('#q-actions').innerHTML = all ? '<button class="btn gold" id="btn-check">ทดสอบ</button>' : '';
      if (all) $('#btn-check').onclick = function () {
        this.disabled = true;
        runCurrent(st.values, st.press).then(function (res) {
          var ok = keys.every(function (k) { return QS.fills[k] === st.blanks[k].answer; }) && res && Sim.finalText(res, st.check.id) === st.check.text;
          if (ok) right(); else { wrong(); idle(); }
        });
      };
    }
    armSlots(); idle();
  }

  // --- เรียงลำดับ
  function stepOrder(st) {
    QS.orderDone = false;
    var placed = [];
    var full = st.code;
    function draw() {
      var lines = [];
      full.forEach(function (l) {
        if (st.wrapper.indexOf(l.id) >= 0) {
          if (l.id === st.wrapper[1]) {
            placed.forEach(function (p) { lines.push(full.filter(function (x) { return x.id === p; })[0]); });
            for (var k = placed.length; k < st.items.length; k++) lines.push({ id: 'empty' + k, cat: 'comment', indent: 1, text: '// ช่องที่ ' + (k + 1) + ' (ว่าง)' });
          }
          lines.push(l);
        }
      });
      QS.code = lines; drawCode();
      var pal = shuffleOnce.filter(function (id) { return placed.indexOf(id) < 0; });
      $('#q-body').innerHTML = '<div class="hint-run">แตะบล็อกด้านล่างตามลำดับที่ควรทำงาน</div><div class="palette">' +
        pal.map(function (id) { var l = full.filter(function (x) { return x.id === id; })[0]; return '<button class="pblk cat-' + l.cat + '" data-id="' + id + '">' + Blocks.esc(l.text) + '</button>'; }).join('') + '</div>';
      $('#q-body').querySelectorAll('.pblk').forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.id === st.items[placed.length]) {
            Sfx.star(); placed.push(b.dataset.id); draw();
            if (placed.length === st.items.length) { QS.code = full.map(function (l) { return Object.assign({}, l); }); drawCode(); QS.orderDone = true; right(function () { runCurrent(st.values || {}, st.press || firstButton(st.design)); }); }
          } else { b.classList.add('no'); setTimeout(function () { b.classList.remove('no'); }, 500); wrong(); }
        };
      });
    }
    var shuffleOnce = shuffle(st.items);
    if (shuffleOnce.join() === st.items.join()) shuffleOnce = st.items.slice().reverse();
    draw();
  }

  // --- ทดสอบ (จับคู่ค่ากรอกกับผล)
  function stepTest(st) {
    var left = st.pairs.map(function (p) { return p[0]; });
    var rightCol = shuffle(st.pairs.map(function (p) { return p[1]; }));
    var selL = null, done = 0;
    var body = $('#q-body');
    body.innerHTML = '<div class="test-grid"><div class="tcol" id="t-left">' + left.map(function (v) { return '<button class="tcell in" data-v="' + esc(v) + '">กรอก <b>' + esc(v) + '</b></button>'; }).join('') +
      '</div><div class="tcol" id="t-right">' + rightCol.map(function (v) { return '<button class="tcell out" data-v="' + esc(v) + '">' + esc(v) + '</button>'; }).join('') + '</div></div>';
    body.querySelectorAll('.tcell.in').forEach(function (b) {
      b.onclick = function () { if (b.classList.contains('matched')) return; Sfx.tap(); selL = b.dataset.v; body.querySelectorAll('.tcell.in').forEach(function (x) { x.classList.toggle('sel', x === b); }); };
    });
    body.querySelectorAll('.tcell.out').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('matched')) return;
        if (selL == null) { toast('แตะค่าที่กรอกทางซ้ายก่อน'); return; }
        var exp = st.pairs.filter(function (p) { return p[0] === selL; })[0][1];
        if (exp === b.dataset.v) {
          done++; var lb = body.querySelector('.tcell.in[data-v="' + CSS.escape(selL) + '"]');
          lb.classList.add('matched', 'm' + done); lb.classList.remove('sel'); b.classList.add('matched', 'm' + done);
          var v = {}; v[st.inputId] = selL; runCurrent(v, st.press, 150);
          Sfx.star(); selL = null;
          if (done === st.pairs.length) setTimeout(function () { right(); }, 900);
        } else { b.classList.add('no'); setTimeout(function () { b.classList.remove('no'); }, 500); wrong(); }
      };
    });
  }

  // --- จบภารกิจ
  function finishQuest() {
    var q = QS.q;
    var s = QS.wrongTotal === 0 ? 3 : QS.wrongTotal <= 2 ? 2 : 1;
    var prev = PROG.quests[q.id];
    var first = !prev || !prev.done;
    if (first) PROG.quests[q.id] = { done: true, stars: s, wrong: QS.wrongTotal, at: Date.now() };
    var newPages = (q.unlockPages || []).filter(function (p) { return PROG.pages.indexOf(p) < 0; });
    PROG.pages = PROG.pages.concat(newPages);
    saveProg();
    Api.log(row({ quest: q.id, step: 'สรุป', stepType: 'complete', attempts: QS.wrongTotal, firstTry: '', seconds: Math.round((Date.now() - QS.t0) / 1000), stars: s }));
    Sfx.win(); Fx.confetti();
    var pagesHtml = newPages.map(function (id) { var p = window.SpellPages.filter(function (x) { return x.id === id; })[0]; return '<div class="unlock">📖 ปลดล็อกสมุดเวทมนตร์: <b>' + esc(p.title) + '</b></div>'; }).join('');
    modal('<div class="win"><img src="' + IMG(q.owner) + '" class="win-npc" alt=""><img src="' + IMG(P.character) + '" class="win-me" alt="">' +
      '<h2>ภารกิจสำเร็จ!</h2><p>' + esc(q.ownerName) + ': ขอบใจมาก ศิษย์สำนักพระฤๅษี!</p>' +
      '<div class="big-stars">' + [0, 1, 2].map(function (i) { return '<span class="bs' + (i < s ? ' on' : '') + '" style="animation-delay:' + (0.3 + i * 0.35) + 's">★</span>'; }).join('') + '</div>' +
      '<div class="muted">' + (first ? '+' + (s * 10) + ' XP' : 'เล่นซ้ำเพื่อฝึก (ดาวนับจากครั้งแรก)') + ' · ตอบผิดรวม ' + QS.wrongTotal + ' ครั้ง</div>' + pagesHtml +
      '<div class="modal-actions"><button class="btn" data-close="book">เปิดสมุดเวทมนตร์</button><button class="btn gold" data-close="world">กลับย่าน</button></div></div>', function (act) {
      if (act === 'book') { renderWorld(q.world); openBook(newPages[0]); } else renderWorld(q.world);
    });
    [0, 1, 2].forEach(function (i) { if (i < s) setTimeout(Sfx.star, 300 + i * 350); });
  }

  // ---------- บอส ----------
  var BS = null;
  function startBoss(bid) {
    var boss = B.BOSSES[bid];
    var w = D.WORLDS[boss.world - 1];
    Fx.setScene('boss');
    var online = Api.online();
    PROG.boss[bid] = PROG.boss[bid] || { dmg: 0, won: false, localHp: 100 };
    BS = { boss: boss, w: w, queue: shuffle(boss.pool.map(function (q, i) { return i; })), tries: 0, wait: false, online: online,
      max: online ? (SERVER.boss && SERVER.boss.hp) || B.DEFAULT_HP : 100,
      hp: online ? (SERVER.boss && SERVER.boss.remaining != null ? SERVER.boss.remaining : B.DEFAULT_HP) : PROG.boss[bid].localHp, poll: null, done: false };
    var el = $('#screen-boss');
    el.innerHTML = '<header class="topbar" id="tb-boss"></header>' +
      '<div class="boss-stage"><div class="boss-name"><small>บอสสัปดาห์ที่ ' + boss.week + '</small><h2>' + esc(boss.name) + '</h2></div>' +
      '<div class="hpbar"><i id="hp-fill"></i><span id="hp-text"></span></div>' +
      '<div class="taunt" id="taunt"></div><img id="boss-img" class="boss-img" src="' + IMG(boss.img) + '" alt="' + esc(boss.name) + '">' +
      '<img class="boss-me" src="' + IMG(P.character) + '" alt=""></div>' +
      '<div class="boss-bottom"><section class="panel boss-q" id="boss-q"></section><section class="panel boss-side" id="boss-side"></section></div>';
    topbar($('#tb-boss'), function () { stopBoss(); renderWorld(w.n); });
    show('screen-boss');
    hpDraw(); taunt(); nextQ(); side();
    if (online) BS.poll = setInterval(function () { refreshBoard(); }, CONFIG.POLL_BOARD_MS);
    BS.tauntTimer = setInterval(taunt, 9000);
  }
  function stopBoss() { if (BS) { clearInterval(BS.poll); clearInterval(BS.tauntTimer); BS.done = true; } }
  function hpDraw() {
    var pct = Math.max(0, BS.hp / BS.max * 100);
    $('#hp-fill').style.width = pct + '%';
    $('#hp-text').textContent = 'พลังชีวิต ' + Math.max(0, BS.hp) + ' / ' + BS.max + (BS.online ? ' (ทั้งห้อง)' : '');
  }
  function taunt() { var t = $('#taunt'); if (!t || !BS) return; t.textContent = BS.boss.taunts[Math.floor(Math.random() * BS.boss.taunts.length)]; t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
  function nextQ() {
    if (BS.done) return;
    if (!BS.queue.length) BS.queue = shuffle(BS.boss.pool.map(function (q, i) { return i; }));
    BS.cur = BS.queue.shift(); BS.tries = 0; askQ();
  }
  function askQ() {
    var q = BS.boss.pool[BS.cur];
    var order = shuffle([0, 1, 2, 3]);
    var box = $('#boss-q');
    box.innerHTML = '<div class="q-type">⚔ ตอบให้ถูกเพื่อโจมตี</div><div class="q-text">' + esc(q.q) + '</div><div class="choices">' +
      order.map(function (i, k) { return '<button class="choice" data-i="' + i + '"><span>' + 'กขคง'[k] + '</span>' + esc(q.choices[i]) + '</button>'; }).join('') + '</div><div class="feedback" id="b-fb"></div>';
    box.querySelectorAll('.choice').forEach(function (b) {
      b.onclick = function () {
        if (BS.wait || BS.done) return;
        if (Number(b.dataset.i) === 0) { b.classList.add('ok'); attack(BS.tries === 0 ? B.DMG_FIRST : B.DMG_RETRY); setTimeout(nextQ, 700); }
        else {
          b.classList.add('no'); BS.tries++; Sfx.wrong(); Fx.shake(box);
          var fb = $('#b-fb');
          if (BS.tries >= 2) {
            box.querySelector('.choice[data-i="0"]').classList.add('ok');
            fb.className = 'feedback bad'; fb.textContent = 'คำตอบที่ถูกเป็นสีเขียว จำไว้นะ';
            waitThen(nextQ);
          } else { fb.className = 'feedback bad'; fb.textContent = 'ยักษ์หลบได้! รอสักครู่แล้วลองข้อนี้อีกครั้ง'; waitThen(askQ); }
        }
      };
    });
  }
  function waitThen(fn) {
    BS.wait = true; var n = B.WRONG_WAIT;
    var fb = $('#b-fb'); var base = fb.textContent;
    var t = setInterval(function () {
      n--; if (fb) fb.textContent = base + ' (' + n + ')';
      if (n <= 0) { clearInterval(t); BS.wait = false; if (!BS.done) fn(); }
    }, 1000);
  }
  function attack(dmg) {
    if (BS.done) return;
    Sfx.hit();
    var img = $('#boss-img'); Fx.shake(img); img.classList.add('hurt'); setTimeout(function () { img.classList.remove('hurt'); }, 300);
    var r = img.getBoundingClientRect();
    Fx.floatText(r.left + r.width * (0.3 + Math.random() * 0.4), r.top + r.height * 0.3, '-' + dmg, 'dmg');
    $('#screen-boss .boss-me').classList.remove('lunge'); void $('#screen-boss .boss-me').offsetWidth; $('#screen-boss .boss-me').classList.add('lunge');
    var pb = PROG.boss[BS.boss.id]; pb.dmg += dmg;
    BS.hp -= dmg;
    if (!BS.online) pb.localHp = Math.max(0, BS.hp);
    saveProg(); hpDraw(); side();
    Api.log(row({ quest: 'boss-' + BS.boss.id, step: BS.cur + 1, stepType: 'boss', attempts: BS.tries + 1, firstTry: BS.tries ? 0 : 1, seconds: '', stars: '' }));
    if (BS.online) {
      Api.hit({ room: P.room, week: BS.boss.week, guild: SERVER.guild || '', number: P.number, damage: dmg }).then(function (res) {
        if (res && res.ok && res.remaining != null) { BS.hp = Math.min(BS.hp, res.remaining); hpDraw(); }
        if (BS.hp <= 0) bossWin();
      });
    } else if (BS.hp <= 0) bossWin();
  }
  function refreshBoard() {
    Api.get('board', { room: P.room }).then(function (b) {
      if (!b || !b.ok || !BS) return;
      if (b.boss && b.boss.week === BS.boss.week) { BS.hp = b.boss.remaining; BS.max = b.boss.hp; hpDraw(); }
      BS.board = b; side();
      if (BS.hp <= 0) bossWin();
    });
  }
  function side() {
    var el = $('#boss-side'); if (!el) return;
    var pb = PROG.boss[BS.boss.id];
    var html = '<div class="col-title">ผลงานของเจ้า</div><div class="big-num">' + pb.dmg + '</div><div class="muted">ความเสียหายที่ทำได้</div>';
    if (BS.board && BS.board.guilds) {
      var max = Math.max.apply(null, BS.board.guilds.map(function (g) { return g.boss || 0; }).concat([1]));
      html += '<div class="col-title" style="margin-top:12px">กิลด์ไหนโจมตีมากสุด</div>' + BS.board.guilds.map(function (g) {
        var gg = guildOf(g.guild) || { color: '#888' };
        return '<div class="gbar"><span>' + esc(g.guild) + '</span><i style="width:' + Math.round((g.boss || 0) / max * 100) + '%;background:' + gg.color + '"></i><b>' + (g.boss || 0) + '</b></div>';
      }).join('');
    } else if (!BS.online) html += '<p class="muted small">โหมดออฟไลน์: ตีบอสคนเดียว เชื่อมต่อ Google Sheet เพื่อตีพร้อมทั้งห้อง</p>';
    el.innerHTML = html;
  }
  function bossWin() {
    if (BS.done) return;
    stopBoss();
    PROG.boss[BS.boss.id].won = true; saveProg();
    var img = $('#boss-img'); if (img) img.classList.add('defeated');
    Sfx.win(); Fx.confetti(140);
    setTimeout(function () {
      modal('<div class="win"><h2>ปราบ' + esc(BS.boss.name) + 'สำเร็จ!</h2><p>หิมพานต์ซิตี้ปลอดภัยแล้ว ขอบใจทุกคนที่ร่วมมือกัน</p><div class="big-num">' + PROG.boss[BS.boss.id].dmg + '</div><div class="muted">ความเสียหายของเจ้า (+XP)</div>' +
        '<div class="modal-actions"><button class="btn gold" data-close="world">กลับย่าน</button></div></div>', function () { renderWorld(BS.w.n); });
    }, 1200);
  }


  // ---------- ลานฝึกพระฤๅษี (ทบทวน ไม่นับคะแนนกิลด์) ----------
  var PR = null;
  function renderPractice(week, back) {
    var weeks = D.WORLDS.filter(function (w) { return worldOpen(w.n); }).map(function (w) { return w.week; });
    if (!weeks.length) weeks = [5];
    week = weeks.indexOf(week) >= 0 ? week : weeks[weeks.length - 1];
    var boss = Object.keys(B.BOSSES).map(function (k) { return B.BOSSES[k]; }).filter(function (b) { return b.week === week; })[0];
    Fx.setScene('title');
    PR = { week: week, boss: boss, queue: shuffle(boss.pool.map(function (q, i) { return i; })), done: 0, right: 0, streak: 0, best: 0, back: back || renderMap };
    var el = $('#screen-practice');
    el.innerHTML = '<header class="topbar" id="tb-practice"></header>' +
      '<div class="world-head"><small>ทบทวนได้ไม่จำกัด ไม่นับคะแนนกิลด์</small><h2>ลานฝึกพระฤๅษี</h2>' +
      '<div class="week-tabs">' + weeks.map(function (w) { return '<button class="chip wk' + (w === week ? ' on' : '') + '" data-w="' + w + '">สัปดาห์ที่ ' + w + '</button>'; }).join('') + '</div></div>' +
      '<div class="practice-grid"><section class="panel pr-side"><div class="speech" id="pr-speech"></div><img class="npc-big" src="' + IMG('npc-ruesi') + '" alt="พระฤๅษี"><div class="pr-stats" id="pr-stats"></div></section>' +
      '<section class="panel pr-main" id="pr-main"></section></div>';
    topbar($('#tb-practice'), PR.back);
    el.querySelectorAll('.wk').forEach(function (b) { b.onclick = function () { Sfx.tap(); renderPractice(Number(b.dataset.w), PR.back); }; });
    show('screen-practice');
    prSay('มาฝึกกันเถิดศิษย์ ตอบผิดไม่เป็นไร อ่านคำอธิบายแล้วลองข้อต่อไป');
    prStats(); prNext();
  }
  function prSay(t) { var s = $('#pr-speech'); if (s) s.textContent = t; }
  function prStats() {
    $('#pr-stats').innerHTML = '<div><b>' + PR.right + '/' + PR.done + '</b><span>ตอบถูก</span></div><div><b>🔥 ' + PR.streak + '</b><span>ถูกติดกัน</span></div><div><b>' + PR.best + '</b><span>สถิติสูงสุด</span></div>';
  }
  function prNext() {
    if (!PR.queue.length) PR.queue = shuffle(PR.boss.pool.map(function (q, i) { return i; }));
    var qi = PR.queue.shift(), q = PR.boss.pool[qi];
    var order = shuffle([0, 1, 2, 3]);
    var box = $('#pr-main');
    box.innerHTML = '<div class="q-type">📜 คำถามทบทวน สัปดาห์ที่ ' + PR.week + '</div><div class="q-text">' + esc(q.q) + '</div><div class="choices">' +
      order.map(function (i, k) { return '<button class="choice" data-i="' + i + '"><span>' + 'กขคง'[k] + '</span>' + esc(q.choices[i]) + '</button>'; }).join('') +
      '</div><div class="feedback" id="pr-fb"></div><div class="q-actions" id="pr-act"></div>';
    var answered = false;
    box.querySelectorAll('.choice').forEach(function (b) {
      b.onclick = function () {
        if (answered) return; answered = true;
        var ok = Number(b.dataset.i) === 0;
        PR.done++;
        box.querySelectorAll('.choice').forEach(function (c) { c.disabled = true; if (c.dataset.i === '0') c.classList.add('ok'); });
        var fb = $('#pr-fb');
        if (ok) { PR.right++; PR.streak++; PR.best = Math.max(PR.best, PR.streak); Sfx.right(); Fx.sparkle(b); fb.className = 'feedback good'; fb.innerHTML = '<b>ถูกต้อง!</b> ' + esc(PR.boss.why[qi]); prSay(PR.streak >= 3 ? 'ถูกติดกัน ' + PR.streak + ' ข้อแล้ว เก่งมาก!' : 'ดีมาก ไปข้อต่อไปกัน'); }
        else { b.classList.add('no'); PR.streak = 0; Sfx.wrong(); fb.className = 'feedback bad'; fb.innerHTML = '<b>ยังไม่ถูก</b> ' + esc(PR.boss.why[qi]); prSay('ไม่เป็นไร คำตอบที่ถูกเป็นสีเขียว อ่านเพิ่มในสมุดเวทมนตร์ได้นะ'); }
        prStats();
        var page = PR.boss.page[qi];
        $('#pr-act').innerHTML = '<button class="btn" id="pr-book">📖 อ่านในสมุด</button><button class="btn gold" id="pr-next">ข้อต่อไป ›</button>';
        $('#pr-book').onclick = function () { Sfx.tap(); openBook(page); };
        $('#pr-next').onclick = function () { Sfx.tap(); prNext(); };
        Api.log(row({ quest: 'practice-w' + PR.week, step: qi + 1, stepType: 'practice', attempts: 1, firstTry: ok ? 1 : 0, seconds: '', firstPlay: 0 }));
      };
    });
  }

  // ---------- สมุดเวทมนตร์ ----------
  function openBook(focus) {
    var pages = window.SpellPages;
    var unlocked = pages.filter(pageOpen);
    var cur = focus || (unlocked[unlocked.length - 1] || pages[0]).id;
    function draw() {
      var p = pages.filter(function (x) { return x.id === cur; })[0];
      var open = pageOpen(p);
      var content = '';
      if (open) {
        content = (p.body || []).map(function (b) { return '<p>' + b + '</p>'; }).join('');
        if (p.table) content += '<table class="spell-table">' + p.table.map(function (r, i) { return '<tr>' + r.map(function (c) { return (i ? '<td>' : '<th>') + esc(c) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</table>';
        if (p.code) content += '<div class="book-code" id="book-code"></div>';
      } else content = '<div class="locked-page">🔒 หน้านี้ยังไม่ปลดล็อก<br><small>หน้านี้จะเปิดเมื่อครูเปิดโลกของสัปดาห์ที่ ' + p.week + '</small></div>';
      $('#modal-box').innerHTML = '<div class="book"><div class="book-side"><img src="' + IMG('npc-ruesi') + '" alt="พระฤๅษี"><h3>สมุดเวทมนตร์</h3>' +
        pages.map(function (x) { var o = pageOpen(x); return '<button class="bk-tab' + (x.id === cur ? ' cur' : '') + (o ? '' : ' lock') + '" data-p="' + x.id + '">' + (o ? '' : '🔒 ') + 'สัปดาห์ ' + x.week + ': ' + esc(o ? x.title : '???') + '</button>'; }).join('') +
        '</div><div class="book-page"><h2>' + esc(open ? p.title : '???') + '</h2>' + content + '</div><button class="ibtn close" data-close="x" aria-label="ปิด">✕</button></div>';
      if (open && p.code) Blocks.renderCode($('#book-code'), p.code.map(function (c, i) { return { id: 'k' + i, cat: c[0], indent: c[1], text: c[2] }; }));
      $('#modal-box').querySelectorAll('.bk-tab').forEach(function (b) { b.onclick = function () { Sfx.tap(); cur = b.dataset.p; draw(); }; });
    }
    modal('', null); draw();
  }

  // ---------- ตารางกิลด์ ----------
  function openBoard() {
    modal('<div class="board"><h2>🏆 ตารางกิลด์</h2><div id="board-body" class="muted">กำลังโหลด…</div><div class="modal-actions"><button class="btn small" id="btn-csv">ดาวน์โหลดผลในเครื่อง (ครู)</button><button class="btn gold" data-close="x">ปิด</button></div></div>', null);
    $('#btn-csv').onclick = function () { Api.exportCsv(); };
    var body = $('#board-body');
    if (!Api.online()) {
      body.innerHTML = '<p>โหมดออฟไลน์: ยังไม่ได้เชื่อม Google Sheet จึงยังไม่มีตารางกิลด์</p><div class="me-stats"><div><b>' + totalStars() + '</b><span>ดาว</span></div><div><b>' + xp() + '</b><span>XP</span></div><div><b>' + esc(titleOf(xp()).name) + '</b><span>ฉายา</span></div></div>';
      return;
    }
    Api.get('board', { room: P.room }).then(function (b) {
      if (!b || !b.ok) { body.textContent = 'โหลดไม่สำเร็จ ลองใหม่อีกครั้ง'; return; }
      var gs = b.guilds.slice().sort(function (a, c) { return c.score - a.score; });
      var mine = SERVER.guild || P.guild;
      body.innerHTML = '<div class="ranks">' + gs.map(function (g, i) {
        var gg = guildOf(g.guild) || { color: '#888' };
        return '<div class="rank' + (g.guild === mine ? ' mine' : '') + '" style="--g:' + gg.color + '"><span class="pos">' + (i + 1) + '</span><b>กิลด์' + esc(g.guild) + '</b><span class="score">' + g.score + ' คะแนน</span></div>';
      }).join('') + '</div>' + (mine ? '<div class="col-title">สมาชิกกิลด์' + esc(mine) + '</div><div class="members">' +
        ((gs.filter(function (g) { return g.guild === mine; })[0] || { members: [] }).members.map(function (m) {
          return '<div class="member"><span>เลขที่ ' + esc(m.number) + ' ' + esc(m.name) + '</span><span>' + esc(titleOf(m.xp).name) + ' · ' + m.xp + ' XP</span></div>';
        }).join('')) + '</div>' : '<p class="muted">ครูยังไม่ได้จัดกิลด์ให้เจ้า</p>');
    });
  }

  // ---------- โมดัลและข้อความ ----------
  function modal(html, onClose) {
    var m = $('#modal'); m.classList.add('open');
    if (html) $('#modal-box').innerHTML = html;
    m.onclick = function (e) {
      var c = e.target.closest('[data-close]');
      if (c || e.target === m) { m.classList.remove('open'); Sfx.tap(); if (onClose) onClose(c ? c.dataset.close : 'x'); }
    };
  }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  // ---------- เริ่มเกม ----------
  Fx.initParticles();
  document.addEventListener('pointerdown', function once() { if (P) Sfx.music(); document.removeEventListener('pointerdown', once); });
  if (P) { loadProg(); syncServer().then(renderMap); } else { renderLogin(); }
  window.HM = { renderPractice: renderPractice, renderMap: renderMap, renderWorld: renderWorld, startQuest: startQuest, startBoss: startBoss, openBook: openBook, state: function () { return { P: P, PROG: PROG, SERVER: SERVER }; } };
})();
