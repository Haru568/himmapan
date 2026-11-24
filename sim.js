// ตัวจำลอง App Lab: รันโค้ดของภารกิจแล้วคืนรายการเหตุการณ์สำหรับแอนิเมชัน
(function (root) {
  var LOOP_LIMIT = 1000;

  function fillBlanks(text, fills) {
    return text.replace(/\{\{(\d+)\}\}/g, function (_, n) {
      return fills && fills[n] != null ? fills[n] : '__BLANK__';
    });
  }

  function instrument(line, fills) {
    var t = fillBlanks(line.text, fills).trim();
    var id = JSON.stringify(line.id);
    if (!t || t.indexOf('//') === 0) return t;
    if (/^(if|while|for)\b/.test(t) && /\{$/.test(t)) {
      var loop = /^(while|for)\b/.test(t);
      return '__line(' + id + '); ' + t + (loop ? ' __tick(); __line(' + id + ');' : '');
    }
    if (/^\}\s*else\s*\{$/.test(t)) return t + ' __line(' + id + ');';
    if (t.indexOf('onEvent(') === 0) return t + ' __line(' + id + ');';
    if (t.charAt(0) === '}') return t;
    return '__line(' + id + '); ' + t;
  }

  function compile(lines, fills) {
    return lines.map(function (l) { return instrument(l, fills); }).join('\n');
  }

  // design: [{type,id,text,placeholder}] ; values: {inputId: 'text'}
  function createApp(design, values) {
    var els = {};
    design.forEach(function (d) {
      els[d.id] = { type: d.type, text: d.text || '', value: '', color: null };
    });
    Object.keys(values || {}).forEach(function (k) { if (els[k]) els[k].value = String(values[k]); });
    return els;
  }

  function LoopError() { this.loop = true; }

  // รันโค้ดทั้งหมด (ลงทะเบียน onEvent) แล้วกดปุ่มตาม press
  function run(lines, design, values, press, fills) {
    var app = createApp(design, values);
    var events = [];
    var handlers = {};
    var ticks = 0;
    function warn(msg) { events.push({ t: 'warn', msg: msg }); }
    var api = {
      onEvent: function (id, type, fn) {
        if (!app[id]) { warn('ไม่พบ id: "' + id + '" ในหน้าจอ'); return; }
        handlers[id + ':' + type] = fn;
      },
      getNumber: function (id) {
        if (!app[id]) { warn('ไม่พบ id: "' + id + '" ในหน้าจอ'); return undefined; }
        var v = String(app[id].value).trim();
        return v === '' ? NaN : Number(v);
      },
      getText: function (id) {
        if (!app[id]) { warn('ไม่พบ id: "' + id + '" ในหน้าจอ'); return undefined; }
        return String(app[id].value || app[id].text);
      },
      setText: function (id, text) {
        if (!app[id]) { warn('ไม่พบ id: "' + id + '" ในหน้าจอ'); return; }
        app[id].text = String(text);
        events.push({ t: 'set', id: id, text: String(text) });
      },
      setProperty: function (id, prop, val) {
        if (!app[id]) { warn('ไม่พบ id: "' + id + '" ในหน้าจอ'); return; }
        if (prop === 'text-color') app[id].color = val;
        events.push({ t: 'prop', id: id, prop: prop, val: val });
      },
      __line: function (id) { events.push({ t: 'line', id: id }); },
      __tick: function () { if (++ticks > LOOP_LIMIT) throw new LoopError(); }
    };
    var src = compile(lines, fills);
    var result = { events: events, app: app, error: null, loop: false };
    if (src.indexOf('__BLANK__') >= 0) { result.error = 'ยังเติมช่องว่างไม่ครบ'; return result; }
    function guard(fn) {
      try { fn(); } catch (e) {
        if (e && e.loop) { result.loop = true; events.push({ t: 'loop' }); }
        else { result.error = String(e && e.message || e); events.push({ t: 'error', msg: result.error }); }
      }
    }
    var f;
    try {
      f = new Function('onEvent', 'getNumber', 'getText', 'setText', 'setProperty', '__line', '__tick', src);
    } catch (e) {
      result.error = 'โค้ดผิดรูปแบบ: ' + e.message;
      events.push({ t: 'error', msg: result.error });
      return result;
    }
    guard(function () { f(api.onEvent, api.getNumber, api.getText, api.setText, api.setProperty, api.__line, api.__tick); });
    if (press && !result.error && !result.loop) {
      events.push({ t: 'press', id: press });
      var h = handlers[press + ':click'];
      if (h) guard(function () { ticks = 0; h(); });
      else events.push({ t: 'nothing', id: press });
    }
    result.handled = !!(press && handlers[press + ':click']);
    return result;
  }

  // ค่าข้อความสุดท้ายของ id หลังรัน
  function finalText(res, id) { return res.app[id] ? res.app[id].text : undefined; }

  var Sim = { run: run, compile: compile, fillBlanks: fillBlanks, finalText: finalText, LOOP_LIMIT: LOOP_LIMIT };
  if (typeof module !== 'undefined' && module.exports) module.exports = Sim;
  else root.Sim = Sim;
})(this);
