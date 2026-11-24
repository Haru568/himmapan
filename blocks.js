// วาดบล็อกแบบ App Lab ผังงาน และมือถือจำลอง พร้อมเล่นแอนิเมชันการรัน
var Blocks = (function () {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function codeHTML(text, fills, slotLabel) {
    var parts = String(text).split(/(\{\{\d+\}\})/);
    return parts.map(function (p) {
      var m = p.match(/^\{\{(\d+)\}\}$/);
      if (!m) return esc(p).replace(/(&quot;[^&]*?&quot;)/g, '<span class="str">$1</span>');
      var v = fills && fills[m[1]];
      return '<span class="slot' + (v ? ' filled' : '') + '" data-slot="' + m[1] + '">' + (v ? esc(v) : (slotLabel || '?')) + '</span>';
    }).join('');
  }

  // lines: [{id,cat,indent,text}]
  function renderCode(el, lines, opts) {
    opts = opts || {};
    var stack = [];
    var html = lines.map(function (l) {
      var t = l.text.trim();
      var open = /\{$/.test(t) && !/^\}/.test(t);
      var mid = /^\}\s*else\s*\{$/.test(t);
      var close = /^\}/.test(t) && !mid;
      while (stack.length > l.indent) stack.pop();
      var rails = stack.map(function (c) { return '<i class="rail cat-' + c + '"></i>'; }).join('');
      var cls = 'blk cat-' + l.cat + (open || mid ? ' open' : '') + (close ? ' close' : '') + (l.cat === 'comment' ? ' comment' : '');
      if (open && !mid) stack.push(l.cat);
      return '<div class="line" data-line="' + l.id + '">' + rails + '<div class="' + cls + '"><span class="code">' + codeHTML(l.text, opts.fills) + '</span></div></div>';
    }).join('');
    el.innerHTML = '<div class="code-area">' + html + '</div>';
  }

  // flow: [{id,shape,text,link}]
  function renderFlow(el, flow) {
    el.innerHTML = '<div class="flow">' + flow.map(function (f, i) {
      return (i ? '<div class="farrow"></div>' : '') +
        '<div class="fnode shape-' + f.shape + '" data-flow="' + f.id + '"><span>' + esc(f.text) + '</span></div>';
    }).join('') + '</div>';
  }

  // design: [{type,id,text,placeholder,title}] values: {id:value}
  function renderPhone(el, design, values, opts) {
    opts = opts || {};
    var items = design.map(function (d) {
      var tag = '<span class="idtag">' + esc(d.id) + '</span>';
      if (d.type === 'label') return '<div class="app-el">' + '<div class="app-label' + (d.title ? ' title' : '') + '" data-el="' + d.id + '">' + esc(d.text) + '</div>' + tag + '</div>';
      if (d.type === 'input') return '<div class="app-el"><input class="app-input" data-el="' + d.id + '" placeholder="' + esc(d.placeholder || '') + '" value="' + esc(values && values[d.id] != null ? values[d.id] : '') + '">' + tag + '</div>';
      if (d.type === 'button') return '<div class="app-el"><button class="app-btn" data-el="' + d.id + '">' + esc(d.text) + '</button>' + tag + '</div>';
      if (d.type === 'textarea') return '<div class="app-el"><div class="app-area" data-el="' + d.id + '">' + esc(d.text || '') + '</div>' + tag + '</div>';
      return '';
    }).join('');
    el.innerHTML = '<div class="phone' + (opts.showIds ? ' show-ids' : '') + '"><div class="notch"></div><div class="pscreen">' + items + '</div></div>' +
      '<div class="console" aria-live="polite"><div class="console-title">Debug Console</div><div class="console-body"></div></div>';
  }

  function readValues(phoneEl) {
    var v = {};
    phoneEl.querySelectorAll('.app-input').forEach(function (i) { v[i.dataset.el] = i.value; });
    return v;
  }

  function clearHL(root) { root.querySelectorAll('.hl').forEach(function (e) { e.classList.remove('hl'); }); }

  function log(phoneEl, msg, cls) {
    var b = phoneEl.querySelector('.console-body'); if (!b) return;
    var d = document.createElement('div'); d.className = 'cline ' + (cls || ''); d.textContent = msg; b.appendChild(d);
    b.scrollTop = b.scrollHeight;
  }

  // เล่นเหตุการณ์จาก Sim.run ทีละขั้น
  async function play(events, ctx) {
    var speed = ctx.speed || 420;
    var lineToFlow = {};
    (ctx.flow || []).forEach(function (f) { (f.link || []).forEach(function (l) { (lineToFlow[l] = lineToFlow[l] || []).push(f.id); }); });
    var root = ctx.root;
    var body = ctx.phoneEl.querySelector('.console-body'); if (body) body.innerHTML = '';
    for (var i = 0; i < events.length; i++) {
      if (ctx.cancelled && ctx.cancelled()) return;
      var e = events[i];
      if (e.t === 'line') {
        clearHL(root);
        var ln = root.querySelector('[data-line="' + e.id + '"]'); if (ln) ln.classList.add('hl');
        (lineToFlow[e.id] || []).forEach(function (fid) { var f = root.querySelector('[data-flow="' + fid + '"]'); if (f) f.classList.add('hl'); });
        if (window.Sfx) Sfx.step();
        await sleep(speed);
      } else if (e.t === 'set') {
        var el = ctx.phoneEl.querySelector('[data-el="' + e.id + '"]');
        if (el) { el.textContent = e.text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
      } else if (e.t === 'prop') {
        var el2 = ctx.phoneEl.querySelector('[data-el="' + e.id + '"]'); if (el2 && e.prop === 'text-color') el2.style.color = e.val;
      } else if (e.t === 'press') {
        var b = ctx.phoneEl.querySelector('[data-el="' + e.id + '"]');
        if (b) { b.classList.add('pressed'); await sleep(220); b.classList.remove('pressed'); }
        log(ctx.phoneEl, 'กดปุ่ม ' + e.id, 'info');
      } else if (e.t === 'warn') {
        log(ctx.phoneEl, '⚠ ' + e.msg, 'warn');
      } else if (e.t === 'nothing') {
        log(ctx.phoneEl, 'กดปุ่มแล้ว แต่ไม่มีโค้ดทำงานเลย', 'warn');
      } else if (e.t === 'loop') {
        log(ctx.phoneEl, '✖ โปรแกรมวนไม่รู้จบ! ต้องหยุดเอง', 'err');
      } else if (e.t === 'error') {
        log(ctx.phoneEl, '✖ ' + e.msg, 'err');
      }
    }
    await sleep(speed);
    clearHL(root);
  }

  return { renderCode: renderCode, renderFlow: renderFlow, renderPhone: renderPhone, readValues: readValues, play: play, log: log, esc: esc, codeHTML: codeHTML, clearHL: clearHL };
})();
