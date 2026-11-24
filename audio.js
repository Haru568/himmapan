// เสียงสังเคราะห์ด้วย Web Audio (ไม่ใช้ไฟล์)
var Sfx = (function () {
  var ctx = null, muted = false, musicTimer = null, musicGain = null;
  try { muted = localStorage.getItem('hm_mute') === '1'; } catch (e) {}
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when) {
    if (muted) return; var c = ac(); if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  var S = {
    tap: function () { tone(660, 0.08, 'triangle', 0.08); },
    step: function () { tone(880, 0.06, 'sine', 0.05); },
    right: function () { tone(784, 0.12, 'triangle', 0.12); tone(1175, 0.18, 'triangle', 0.12, 0.09); },
    wrong: function () { tone(220, 0.18, 'sine', 0.1); tone(196, 0.22, 'sine', 0.08, 0.1); },
    win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.25, 'triangle', 0.12, i * 0.09); }); },
    hit: function () { tone(120, 0.15, 'sawtooth', 0.12); tone(80, 0.25, 'square', 0.06, 0.03); },
    star: function () { tone(1568, 0.15, 'sine', 0.1); },
    toggle: function () { muted = !muted; try { localStorage.setItem('hm_mute', muted ? '1' : '0'); } catch (e) {} if (muted) S.stopMusic(); else S.music(); return muted; },
    isMuted: function () { return muted; },
    // ดนตรีพื้นหลังสเกลห้าเสียงแบบไทย วนเบา ๆ
    music: function () {
      if (muted || musicTimer) return; var c = ac(); if (!c) return;
      var scale = [392, 440, 523, 587, 659, 784, 880], i = 0;
      var pattern = [0, 2, 3, 2, 4, 3, 2, 0, 1, 2, 4, 5, 4, 2, 3, 1];
      musicTimer = setInterval(function () {
        if (muted) return;
        var n = scale[pattern[i % pattern.length]];
        tone(n, 0.5, 'sine', 0.025); if (i % 4 === 0) tone(n / 2, 0.9, 'triangle', 0.02);
        i++;
      }, 420);
    },
    stopMusic: function () { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
  };
  return S;
})();
