// Module-level singleton: undefined = not yet attempted, null = unavailable.
let _ctx: AudioContext | null | undefined = undefined;

function getCtx(): AudioContext | null {
  if (_ctx !== undefined) return _ctx;
  try {
    const AC =
      typeof window !== 'undefined' &&
      ((window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    _ctx = AC ? new AC() : null;
  } catch {
    _ctx = null;
  }
  return _ctx;
}

// Unlock the AudioContext on the first user gesture. Call from a pointerdown/keydown handler.
export function resume(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    void c.resume();
  }
}

// Short percussive wooden click — noise burst with fast exponential decay, ~40ms.
export function playTap(): void {
  const c = getCtx();
  if (!c) return;
  const dur = 0.04;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1500;
  filter.Q.value = 2;
  const gain = c.createGain();
  gain.gain.value = 0.4;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
}

// Three ascending sine tones: R→Y→G mapped to C5→E5→G5 (low→high), total ~0.9s.
export function playWinChime(): void {
  const c = getCtx();
  if (!c) return;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.22;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.46);
  });
}

// Short celebratory accent layered after the win chime (C6→E6→G6).
export function playUnderPar(): void {
  const c = getCtx();
  if (!c) return;
  const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = c.currentTime + 0.85 + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}
