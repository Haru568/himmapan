// เรียก Apps Script และคิวส่งข้อมูล (เล่นต่อได้แม้ออฟไลน์)
var Api = (function () {
  var QKEY = 'hm_queue';
  function online() { return !!(CONFIG.API_URL); }
  function loadQ() { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; } }
  function saveQ(q) { try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch (e) {} }

  function get(action, params) {
    if (!online()) return Promise.resolve(null);
    var qs = Object.keys(params || {}).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(CONFIG.API_URL + '?action=' + action + (qs ? '&' + qs : ''))
      .then(function (r) { return r.json(); })
      .catch(function () { return null; });
  }
  function post(body) {
    if (!online()) return Promise.resolve(null);
    return fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  // บันทึกผลการเล่น: เข้าคิวก่อนเสมอ แล้วค่อยส่ง
  function log(row) {
    var q = loadQ(); q.push(row); saveQ(q);
    flush();
  }
  var flushing = false;
  function flush() {
    if (!online() || flushing) return;
    var q = loadQ(); if (!q.length) return;
    flushing = true;
    var batch = q.slice(0, 50);
    post({ action: 'log', rows: batch }).then(function (res) {
      if (res && res.ok) { var rest = loadQ().slice(batch.length); saveQ(rest); }
    }).catch(function () {}).then(function () { flushing = false; });
  }
  setInterval(flush, 15000);
  window.addEventListener('online', flush);

  function hit(data) {
    if (!online()) return Promise.resolve(null);
    return post(Object.assign({ action: 'hit' }, data)).catch(function () { return null; });
  }

  // ดาวน์โหลดผลในเครื่องเป็น CSV (ใช้เมื่อเล่นแบบออฟไลน์)
  function exportCsv() {
    var all = [];
    try { all = JSON.parse(localStorage.getItem('hm_log_all') || '[]'); } catch (e) {}
    var cols = ['time', 'room', 'number', 'name', 'character', 'guild', 'quest', 'step', 'stepType', 'attempts', 'firstTry', 'seconds', 'firstPlay', 'stars'];
    var lines = [cols.join(',')].concat(all.map(function (r) {
      return cols.map(function (c) { return '"' + String(r[c] == null ? '' : r[c]).replace(/"/g, '""') + '"'; }).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'himmapan-results.csv'; a.click();
  }
  function keepLocal(row) {
    try {
      var all = JSON.parse(localStorage.getItem('hm_log_all') || '[]'); all.push(row);
      localStorage.setItem('hm_log_all', JSON.stringify(all));
    } catch (e) {}
  }

  return { online: online, get: get, log: function (r) { keepLocal(r); log(r); }, hit: hit, flush: flush, exportCsv: exportCsv };
})();
