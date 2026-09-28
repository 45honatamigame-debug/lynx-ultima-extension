// Fabula containment sound palette — procedural SCP / Control / analog-horror inspired audio.
// No external audio files are required; every cue is built from filtered noise, low sine layers,
// mechanical transients and restrained resonances so the UI does not sound like an 8-bit game.

const EPS = 0.0001;

// v2.60: low-latency, anti-stack playback state.
// Each AudioContext gets a small monophonic mixer per cue family so rapid UI changes
// retrigger cleanly instead of layering several long procedural sounds on top of each other.
const NOISE_BUFFER_CACHE = new WeakMap();
const PLAYBACK_STATE = new WeakMap();
let standaloneContext = null;
let standaloneResumePromise = null;
let standalonePendingCue = null;

const CUE_POLICY = Object.freeze({
  message:   { channel: "ui",       cooldownMs: 80,  priority: 10 },
  status:    { channel: "ui",       cooldownMs: 90,  priority: 14 },
  clock:     { channel: "ui",       cooldownMs: 95,  priority: 12 },
  clockup:   { channel: "ui",       cooldownMs: 90,  priority: 16 },
  clockdown: { channel: "ui",       cooldownMs: 90,  priority: 16 },
  roll:      { channel: "roll",     cooldownMs: 90,  priority: 25 },
  critical:  { channel: "roll",     cooldownMs: 180, priority: 70, blockMs: 320 },
  hpup:      { channel: "resource", cooldownMs: 135, priority: 22 },
  hpdown:    { channel: "resource", cooldownMs: 135, priority: 28 },
  mpup:      { channel: "resource", cooldownMs: 120, priority: 21 },
  mpdown:    { channel: "resource", cooldownMs: 120, priority: 23 },
  ipup:      { channel: "resource", cooldownMs: 120, priority: 20 },
  ipdown:    { channel: "resource", cooldownMs: 120, priority: 22 },
  fpup:      { channel: "resource", cooldownMs: 120, priority: 19 },
  fpdown:    { channel: "resource", cooldownMs: 120, priority: 21 },
  arcana:    { channel: "magic",    cooldownMs: 180, priority: 42 },
  zero:      { channel: "magic",    cooldownMs: 220, priority: 48 },
  initiative:{ channel: "scene",    cooldownMs: 170, priority: 44 },
  turnmine:  { channel: "scene",    cooldownMs: 220, priority: 64, blockMs: 260 },
  immune:    { channel: "resource", cooldownMs: 130, priority: 34 },
  crisis:    { channel: "resource", cooldownMs: 260, priority: 62, blockMs: 180 },
  spawn:     { channel: "scene",    cooldownMs: 180, priority: 38 },
  phase:     { channel: "scene",    cooldownMs: 300, priority: 58, blockMs: 260 },
  surrender: { channel: "outcome",  cooldownMs: 450, priority: 82, blockMs: 850,  interruptAll: true },
  defeated:  { channel: "outcome",  cooldownMs: 450, priority: 90, blockMs: 900,  interruptAll: true },
  sacrifice: { channel: "outcome",  cooldownMs: 800, priority: 100, blockMs: 2050, interruptAll: true },
});

function wallNow() {
  try { return globalThis.performance?.now?.() ?? Date.now(); } catch { return Date.now(); }
}

function playbackState(ctx) {
  let s = PLAYBACK_STATE.get(ctx);
  if (!s) {
    s = { channels: new Map(), lastCueAt: new Map(), blockUntil: 0, blockPriority: 0 };
    PLAYBACK_STATE.set(ctx, s);
  }
  return s;
}

function fadeOutCue(rec, t, fade = 0.018) {
  if (!rec?.gainNode?.gain) return;
  try {
    const p = rec.gainNode.gain;
    const current = Math.max(EPS, Number(p.value) || 1);
    p.cancelScheduledValues(t);
    p.setValueAtTime(current, t);
    p.exponentialRampToValueAtTime(EPS, t + fade);
  } catch {}
}

function prepareCue(ctx, cue, volume = 1) {
  const policy = CUE_POLICY[cue] || CUE_POLICY.message;
  const s = playbackState(ctx);
  const nowWall = wallNow();
  const nowAudio = ctx.currentTime;
  const last = Number(s.lastCueAt.get(cue)) || -Infinity;
  if (nowWall - last < policy.cooldownMs) return null;

  if (nowAudio < s.blockUntil && policy.priority < s.blockPriority) return null;
  s.lastCueAt.set(cue, nowWall);

  if (policy.interruptAll) {
    for (const rec of s.channels.values()) fadeOutCue(rec, nowAudio, cue === "sacrifice" ? 0.025 : 0.018);
    s.channels.clear();
  } else {
    const previous = s.channels.get(policy.channel);
    if (previous) fadeOutCue(previous, nowAudio, 0.014);
  }

  const master = masterBus(ctx, 0.74 * clamp(volume, 0, 1));
  const cueGain = ctx.createGain();
  cueGain.gain.setValueAtTime(1, nowAudio);
  cueGain.connect(master);
  const rec = { cue, channel: policy.channel, gainNode: cueGain, startedAt: nowAudio };
  s.channels.set(policy.channel, rec);

  if (policy.blockMs) {
    s.blockUntil = Math.max(s.blockUntil, nowAudio + policy.blockMs / 1000);
    s.blockPriority = Math.max(s.blockPriority, policy.priority);
  } else if (nowAudio >= s.blockUntil) {
    s.blockPriority = 0;
  }

  // Tiny look-ahead only; 1 ms keeps Web Audio scheduling stable without perceptible lag.
  return { dest: cueGain, t: nowAudio + 0.001, policy };
}

export const CONTAINMENT_SOUND_DURATIONS = Object.freeze({
  message: 0.34,
  roll: 0.52,
  critical: 1.05,
  hpup: 0.50,
  hpdown: 0.58,
  status: 0.30,
  spawn: 0.82,
  phase: 1.45,
  clock: 0.42,
  clockup: 0.34,
  clockdown: 0.36,
  mpup: 0.42,
  mpdown: 0.42,
  ipup: 0.38,
  ipdown: 0.38,
  fpup: 0.40,
  fpdown: 0.40,
  arcana: 0.78,
  zero: 0.92,
  initiative: 0.62,
  turnmine: 0.86,
  immune: 0.48,
  crisis: 0.92,
  surrender: 1.16,
  defeated: 1.08,
  sacrifice: 2.25,
});

export function createContainmentContext(existing = null) {
  if (existing && existing.state !== "closed") return existing;
  const C = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!C) return null;
  try { return new C(); } catch { return null; }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Number(v) || 0)); }

function masterBus(ctx, volume = 1) {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-20, ctx.currentTime);
  comp.knee.setValueAtTime(18, ctx.currentTime);
  comp.ratio.setValueAtTime(5, ctx.currentTime);
  comp.attack.setValueAtTime(0.004, ctx.currentTime);
  comp.release.setValueAtTime(0.18, ctx.currentTime);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(clamp(volume, 0, 1), ctx.currentTime);
  comp.connect(gain);
  gain.connect(ctx.destination);
  return comp;
}

function driveCurve(amount = 2.5) {
  const n = 256;
  const curve = new Float32Array(n);
  const k = Math.max(0.01, amount) * 18;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / (n - 1) - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

function envelope(param, t, dur, peak, attack = 0.008, hold = 0.08) {
  const end = t + Math.max(0.02, dur);
  const a = Math.min(Math.max(0.001, attack), dur * 0.35);
  const h = Math.min(Math.max(a + 0.001, hold), Math.max(a + 0.002, dur * 0.68));
  param.cancelScheduledValues(t);
  param.setValueAtTime(EPS, t);
  param.exponentialRampToValueAtTime(Math.max(EPS, peak), t + a);
  param.setValueAtTime(Math.max(EPS, peak * 0.72), t + h);
  param.exponentialRampToValueAtTime(EPS, end);
}

function tone(ctx, dest, t, dur, {
  from = 220, to = from, gain = 0.05, type = "sine", detune = 0,
  filter = 0, filterType = "lowpass", q = 0.7, attack = 0.01, hold = 0.08, drive = 0,
} = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.detune.setValueAtTime(detune, t);
  o.frequency.setValueAtTime(Math.max(10, from), t);
  if (to && to !== from) o.frequency.exponentialRampToValueAtTime(Math.max(10, to), t + dur);
  let last = o;
  if (filter > 0) {
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.setValueAtTime(filter, t);
    f.Q.setValueAtTime(q, t);
    last.connect(f); last = f;
  }
  if (drive > 0) {
    const ws = ctx.createWaveShaper();
    ws.curve = driveCurve(drive);
    ws.oversample = "2x";
    last.connect(ws); last = ws;
  }
  last.connect(g); g.connect(dest);
  envelope(g.gain, t, dur, gain, attack, hold);
  o.start(t); o.stop(t + dur + 0.02);
  return o;
}

function noiseBuffer(ctx, dur, color = "white") {
  // Cache by context / colour / 50 ms duration bucket. Reusing buffers removes the
  // allocation + random-generation hitch that was most noticeable during rapid HP edits.
  const bucket = Math.max(0.05, Math.ceil(Math.max(0.02, dur) * 20) / 20);
  let cache = NOISE_BUFFER_CACHE.get(ctx);
  if (!cache) { cache = new Map(); NOISE_BUFFER_CACHE.set(ctx, cache); }
  const key = `${color}:${bucket.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const length = Math.max(64, Math.ceil(ctx.sampleRate * bucket));
  const b = ctx.createBuffer(1, length, ctx.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    if (color === "brown") {
      last = (last + 0.018 * w) / 1.018;
      d[i] = last * 3.2;
    } else if (color === "pink") {
      last = last * 0.88 + w * 0.12;
      d[i] = last * 1.5;
    } else d[i] = w;
  }
  cache.set(key, b);
  return b;
}

function noise(ctx, dest, t, dur, {
  gain = 0.04, color = "white", type = "bandpass", freq = 900, freqEnd = 0,
  q = 0.8, attack = 0.004, hold = 0.06, drive = 0,
} = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, dur, color);
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(Math.max(20, freq), t);
  if (freqEnd > 0 && freqEnd !== freq) f.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
  f.Q.setValueAtTime(q, t);
  const g = ctx.createGain();
  src.connect(f);
  let last = f;
  if (drive > 0) {
    const ws = ctx.createWaveShaper();
    ws.curve = driveCurve(drive);
    ws.oversample = "2x";
    last.connect(ws); last = ws;
  }
  last.connect(g); g.connect(dest);
  envelope(g.gain, t, dur, gain, attack, hold);
  src.start(t); src.stop(t + dur + 0.02);
  return src;
}

function relay(ctx, dest, t, gain = 0.055, low = false) {
  noise(ctx, dest, t, 0.055, { gain, type: low ? "lowpass" : "highpass", freq: low ? 620 : 1800, q: 0.4, attack: 0.001, hold: 0.01, drive: 1.2 });
  tone(ctx, dest, t, 0.065, { from: low ? 92 : 410, to: low ? 64 : 280, gain: gain * 0.5, filter: low ? 220 : 1200, attack: 0.001, hold: 0.012 });
}

function subHit(ctx, dest, t, gain = 0.12, dur = 0.42, from = 72, to = 34) {
  tone(ctx, dest, t, dur, { from, to, gain, filter: 150, filterType: "lowpass", attack: 0.003, hold: 0.045, drive: 1.8 });
  noise(ctx, dest, t, Math.min(0.20, dur), { gain: gain * 0.50, color: "brown", type: "lowpass", freq: 180, freqEnd: 75, q: 0.5, attack: 0.001, hold: 0.025, drive: 1.8 });
}

function metal(ctx, dest, t, gain = 0.05, base = 310, dur = 0.56) {
  noise(ctx, dest, t, Math.min(0.16, dur), { gain: gain * 0.9, type: "bandpass", freq: base * 3.1, freqEnd: base * 1.7, q: 5.5, attack: 0.001, hold: 0.015, drive: 2.0 });
  [1, 1.47, 2.18].forEach((m, i) => {
    tone(ctx, dest, t + i * 0.009, dur * (1 - i * 0.11), {
      from: base * m, to: base * m * 0.93, gain: gain * [0.75, 0.46, 0.28][i],
      type: "sine", filter: Math.min(5200, base * m * 2.4), q: 1.2, attack: 0.002, hold: 0.018,
      detune: i === 1 ? -7 : i === 2 ? 11 : 0,
    });
  });
}

function radioSweep(ctx, dest, t, dur, gain = 0.045, from = 420, to = 1900) {
  noise(ctx, dest, t, dur, { gain, color: "pink", type: "bandpass", freq: from, freqEnd: to, q: 3.8, attack: 0.008, hold: dur * 0.30, drive: 1.1 });
}

function carrierDrop(ctx, dest, t, dur, gain = 0.05, from = 310, to = 115) {
  tone(ctx, dest, t, dur, { from, to, gain, type: "sine", filter: 950, q: 1.0, attack: 0.02, hold: dur * 0.28, drive: 0.5 });
  tone(ctx, dest, t + 0.01, dur * 0.92, { from: from * 1.006, to: to * 0.992, gain: gain * 0.42, type: "sine", filter: 800, attack: 0.025, hold: dur * 0.26, detune: -5 });
}

export function playContainmentSound(ctx, kind = "message", { volume = 1 } = {}) {
  if (!ctx || ctx.state === "closed") return 0;
  const cue = CONTAINMENT_SOUND_DURATIONS[kind] ? kind : "message";
  const dur = CONTAINMENT_SOUND_DURATIONS[cue];
  // Do not queue nodes while the context is suspended. The caller resumes first and then
  // fires only the newest pending cue, preventing a burst of delayed sounds on resume.
  if (ctx.state === "suspended") return 0;
  const prepared = prepareCue(ctx, cue, volume);
  if (!prepared) return 0;
  const { dest, t } = prepared;

  switch (cue) {
    case "message":
      relay(ctx, dest, t, 0.050);
      noise(ctx, dest, t + 0.025, 0.19, { gain: 0.030, color: "pink", type: "bandpass", freq: 1180, freqEnd: 760, q: 3.2, attack: 0.003, hold: 0.055, drive: 0.8 });
      tone(ctx, dest, t + 0.018, 0.22, { from: 360, to: 286, gain: 0.026, filter: 760, attack: 0.004, hold: 0.035 });
      break;

    case "roll":
      relay(ctx, dest, t, 0.042);
      relay(ctx, dest, t + 0.085, 0.035);
      relay(ctx, dest, t + 0.17, 0.030);
      radioSweep(ctx, dest, t + 0.025, 0.34, 0.044, 360, 2350);
      tone(ctx, dest, t + 0.04, 0.40, { from: 104, to: 82, gain: 0.042, filter: 220, attack: 0.008, hold: 0.07, drive: 1.0 });
      break;

    case "critical":
      subHit(ctx, dest, t, 0.125, 0.58, 78, 32);
      metal(ctx, dest, t + 0.035, 0.078, 330, 0.76);
      radioSweep(ctx, dest, t + 0.055, 0.52, 0.052, 2400, 520);
      tone(ctx, dest, t + 0.13, 0.64, { from: 188, to: 146, gain: 0.050, type: "sine", filter: 510, attack: 0.012, hold: 0.22, drive: 1.6 });
      tone(ctx, dest, t + 0.15, 0.62, { from: 199, to: 153, gain: 0.031, type: "sine", filter: 530, attack: 0.012, hold: 0.20, detune: 6 });
      relay(ctx, dest, t + 0.69, 0.045, true);
      break;

    case "hpup":
      noise(ctx, dest, t, 0.22, { gain: 0.022, color: "pink", type: "bandpass", freq: 530, freqEnd: 1250, q: 2.8, attack: 0.01, hold: 0.06 });
      tone(ctx, dest, t + 0.02, 0.34, { from: 190, to: 272, gain: 0.034, filter: 650, attack: 0.015, hold: 0.08 });
      tone(ctx, dest, t + 0.095, 0.27, { from: 284, to: 354, gain: 0.023, filter: 780, attack: 0.012, hold: 0.055, detune: -4 });
      relay(ctx, dest, t + 0.31, 0.025);
      break;

    case "hpdown":
      subHit(ctx, dest, t, 0.105, 0.42, 70, 38);
      noise(ctx, dest, t + 0.005, 0.28, { gain: 0.052, color: "brown", type: "lowpass", freq: 540, freqEnd: 140, q: 0.7, attack: 0.002, hold: 0.035, drive: 2.1 });
      metal(ctx, dest, t + 0.025, 0.034, 245, 0.42);
      break;

    case "status":
      relay(ctx, dest, t, 0.046);
      relay(ctx, dest, t + 0.078, 0.027, true);
      noise(ctx, dest, t + 0.018, 0.16, { gain: 0.023, color: "pink", type: "bandpass", freq: 920, freqEnd: 620, q: 4.0, attack: 0.002, hold: 0.035 });
      break;

    case "spawn":
      subHit(ctx, dest, t, 0.105, 0.48, 62, 31);
      relay(ctx, dest, t + 0.035, 0.050, true);
      metal(ctx, dest, t + 0.09, 0.038, 205, 0.52);
      noise(ctx, dest, t + 0.10, 0.56, { gain: 0.035, color: "pink", type: "bandpass", freq: 360, freqEnd: 1180, q: 1.8, attack: 0.018, hold: 0.16 });
      break;

    case "phase":
      tone(ctx, dest, t, 1.30, { from: 68, to: 37, gain: 0.082, filter: 180, attack: 0.035, hold: 0.44, drive: 1.5 });
      radioSweep(ctx, dest, t + 0.08, 0.92, 0.046, 280, 1850);
      metal(ctx, dest, t + 0.16, 0.047, 178, 0.90);
      noise(ctx, dest, t + 0.72, 0.48, { gain: 0.030, color: "brown", type: "lowpass", freq: 380, freqEnd: 90, q: 0.5, attack: 0.02, hold: 0.15, drive: 1.3 });
      break;

    case "clock":
      relay(ctx, dest, t, 0.052);
      relay(ctx, dest, t + 0.145, 0.036, true);
      tone(ctx, dest, t + 0.015, 0.28, { from: 96, to: 64, gain: 0.034, filter: 190, attack: 0.003, hold: 0.025, drive: 1.0 });
      noise(ctx, dest, t + 0.148, 0.16, { gain: 0.021, type: "bandpass", freq: 1240, freqEnd: 720, q: 5, attack: 0.001, hold: 0.018 });
      break;

    case "clockup":
      relay(ctx, dest, t, 0.040);
      tone(ctx, dest, t + 0.018, 0.22, { from: 112, to: 185, gain: 0.030, filter: 520, attack: 0.003, hold: 0.038 });
      tone(ctx, dest, t + 0.085, 0.18, { from: 224, to: 310, gain: 0.020, filter: 780, attack: 0.004, hold: 0.032 });
      noise(ctx, dest, t + 0.055, 0.13, { gain: 0.018, type: "bandpass", freq: 1050, freqEnd: 1600, q: 4.6, attack: 0.001, hold: 0.018 });
      break;

    case "clockdown":
      relay(ctx, dest, t, 0.040, true);
      tone(ctx, dest, t + 0.012, 0.26, { from: 188, to: 86, gain: 0.034, filter: 420, attack: 0.003, hold: 0.04, drive: 0.7 });
      noise(ctx, dest, t + 0.075, 0.16, { gain: 0.022, color: "brown", type: "lowpass", freq: 520, freqEnd: 150, q: 0.7, attack: 0.002, hold: 0.02 });
      break;

    case "mpup":
      radioSweep(ctx, dest, t, 0.24, 0.026, 480, 1700);
      tone(ctx, dest, t + 0.018, 0.30, { from: 246, to: 382, gain: 0.030, filter: 900, attack: 0.012, hold: 0.06 });
      relay(ctx, dest, t + 0.25, 0.020);
      break;

    case "mpdown":
      radioSweep(ctx, dest, t, 0.28, 0.030, 1500, 360);
      tone(ctx, dest, t + 0.015, 0.30, { from: 360, to: 180, gain: 0.032, filter: 760, attack: 0.008, hold: 0.055, drive: 0.7 });
      break;

    case "ipup":
      relay(ctx, dest, t, 0.030);
      tone(ctx, dest, t + 0.018, 0.26, { from: 320, to: 520, gain: 0.026, type: "triangle", filter: 1200, attack: 0.006, hold: 0.045 });
      noise(ctx, dest, t + 0.08, 0.14, { gain: 0.018, type: "bandpass", freq: 1900, freqEnd: 2600, q: 5.5, attack: 0.001, hold: 0.018 });
      break;

    case "ipdown":
      relay(ctx, dest, t, 0.032, true);
      tone(ctx, dest, t + 0.015, 0.27, { from: 480, to: 210, gain: 0.028, type: "triangle", filter: 980, attack: 0.004, hold: 0.04 });
      break;

    case "fpup":
      tone(ctx, dest, t, 0.30, { from: 154, to: 246, gain: 0.034, filter: 620, attack: 0.012, hold: 0.08, drive: 0.9 });
      metal(ctx, dest, t + 0.055, 0.024, 410, 0.22);
      break;

    case "fpdown":
      tone(ctx, dest, t, 0.32, { from: 242, to: 126, gain: 0.036, filter: 480, attack: 0.008, hold: 0.06, drive: 1.0 });
      noise(ctx, dest, t + 0.035, 0.18, { gain: 0.022, color: "pink", type: "bandpass", freq: 680, freqEnd: 300, q: 2.4, attack: 0.002, hold: 0.035 });
      break;

    case "arcana":
      relay(ctx, dest, t, 0.032);
      radioSweep(ctx, dest, t + 0.04, 0.54, 0.043, 520, 2600);
      [0, 0.08, 0.17].forEach((d, i) => tone(ctx, dest, t + d, 0.42 - i * 0.04, { from: [220, 330, 495][i], to: [294, 440, 660][i], gain: [0.026,0.021,0.016][i], type: "sine", filter: 1800, attack: 0.018, hold: 0.12, detune: i ? -5 : 4 }));
      metal(ctx, dest, t + 0.42, 0.024, 520, 0.28);
      break;

    case "zero":
      subHit(ctx, dest, t, 0.085, 0.36, 92, 46);
      radioSweep(ctx, dest, t + 0.04, 0.62, 0.050, 360, 3000);
      metal(ctx, dest, t + 0.16, 0.042, 360, 0.58);
      break;

    case "initiative":
      relay(ctx, dest, t, 0.044);
      relay(ctx, dest, t + 0.12, 0.034);
      tone(ctx, dest, t + 0.02, 0.44, { from: 138, to: 220, gain: 0.040, filter: 620, attack: 0.006, hold: 0.08, drive: 1.0 });
      noise(ctx, dest, t + 0.16, 0.22, { gain: 0.026, type: "bandpass", freq: 920, freqEnd: 1420, q: 4.2, attack: 0.002, hold: 0.036 });
      break;

    case "turnmine":
      relay(ctx, dest, t, 0.056);
      relay(ctx, dest, t + 0.18, 0.044);
      tone(ctx, dest, t + 0.025, 0.50, { from: 220, to: 440, gain: 0.050, filter: 1200, attack: 0.008, hold: 0.18, drive: 0.8 });
      tone(ctx, dest, t + 0.17, 0.42, { from: 330, to: 660, gain: 0.028, filter: 1600, attack: 0.006, hold: 0.12, detune: 7 });
      metal(ctx, dest, t + 0.46, 0.030, 620, 0.30);
      break;

    case "immune":
      subHit(ctx, dest, t, 0.075, 0.30, 84, 52);
      noise(ctx, dest, t + 0.015, 0.32, { gain: 0.049, color: "pink", type: "bandpass", freq: 1650, freqEnd: 310, q: 4.5, attack: 0.002, hold: 0.045, drive: 1.8 });
      relay(ctx, dest, t + 0.27, 0.035, true);
      break;

    case "crisis":
      subHit(ctx, dest, t, 0.095, 0.23, 67, 42);
      subHit(ctx, dest, t + 0.31, 0.085, 0.26, 64, 39);
      noise(ctx, dest, t + 0.04, 0.70, { gain: 0.035, color: "pink", type: "bandpass", freq: 820, freqEnd: 390, q: 2.5, attack: 0.015, hold: 0.22, drive: 1.3 });
      tone(ctx, dest, t + 0.10, 0.65, { from: 198, to: 154, gain: 0.039, filter: 440, attack: 0.02, hold: 0.26, drive: 1.3 });
      break;

    case "surrender":
      relay(ctx, dest, t, 0.036, true);
      carrierDrop(ctx, dest, t + 0.035, 0.86, 0.047, 292, 118);
      noise(ctx, dest, t + 0.04, 0.84, { gain: 0.033, color: "pink", type: "bandpass", freq: 1050, freqEnd: 260, q: 2.8, attack: 0.018, hold: 0.23, drive: 1.0 });
      relay(ctx, dest, t + 0.88, 0.030, true);
      break;

    case "defeated":
      subHit(ctx, dest, t, 0.145, 0.58, 76, 27);
      noise(ctx, dest, t + 0.008, 0.72, { gain: 0.055, color: "brown", type: "lowpass", freq: 820, freqEnd: 72, q: 0.55, attack: 0.002, hold: 0.07, drive: 2.2 });
      metal(ctx, dest, t + 0.045, 0.052, 172, 0.78);
      carrierDrop(ctx, dest, t + 0.26, 0.56, 0.026, 205, 74);
      break;

    case "sacrifice":
      // Deliberately the most severe cue: containment alarm, subharmonic collapse,
      // corroded radio static and a long metallic death-rattle.
      tone(ctx, dest, t, 2.08, { from: 52, to: 24, gain: 0.145, filter: 130, attack: 0.018, hold: 0.76, drive: 2.4 });
      subHit(ctx, dest, t + 0.02, 0.135, 0.52, 86, 31);
      subHit(ctx, dest, t + 0.58, 0.105, 0.46, 72, 28);
      [0.12, 0.48, 0.86].forEach((d, i) => {
        tone(ctx, dest, t + d, 0.60, { from: 182 - i * 14, to: 124 - i * 18, gain: 0.052 - i * 0.006, filter: 470, attack: 0.015, hold: 0.24, drive: 1.8, detune: i ? -9 : 8 });
        tone(ctx, dest, t + d + 0.012, 0.58, { from: 193 - i * 13, to: 131 - i * 17, gain: 0.030, filter: 490, attack: 0.015, hold: 0.23, detune: -6 });
      });
      noise(ctx, dest, t + 0.035, 1.48, { gain: 0.068, color: "pink", type: "bandpass", freq: 2380, freqEnd: 180, q: 2.7, attack: 0.006, hold: 0.52, drive: 2.1 });
      metal(ctx, dest, t + 0.18, 0.066, 142, 1.42);
      noise(ctx, dest, t + 1.22, 0.72, { gain: 0.050, color: "brown", type: "lowpass", freq: 520, freqEnd: 54, q: 0.55, attack: 0.008, hold: 0.18, drive: 2.4 });
      relay(ctx, dest, t + 1.94, 0.045, true);
      break;
  }

  return dur;
}

export function playStandaloneContainmentSound(kind = "message", { volume = 1 } = {}) {
  standaloneContext = createContainmentContext(standaloneContext);
  const ctx = standaloneContext;
  if (!ctx) return false;
  const cue = CONTAINMENT_SOUND_DURATIONS[kind] ? kind : "message";

  const fire = () => {
    if (!standaloneContext || standaloneContext.state === "closed") return;
    playContainmentSound(standaloneContext, cue, { volume });
  };

  if (ctx.state === "suspended") {
    // Coalesce every event received while Web Audio is waking into the latest cue only.
    standalonePendingCue = { cue, volume };
    if (!standaloneResumePromise) {
      standaloneResumePromise = ctx.resume()
        .then(() => {
          const pending = standalonePendingCue;
          standalonePendingCue = null;
          if (pending) playContainmentSound(ctx, pending.cue, { volume: pending.volume });
        })
        .catch(() => {})
        .finally(() => { standaloneResumePromise = null; });
    }
    return true;
  }

  fire();
  return true;
}

