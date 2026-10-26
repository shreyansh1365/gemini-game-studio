// BREAKLINE — WebAudio synthesized sound effects (no audio files needed).

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(v: boolean) {
  muted = v;
}

export function isMuted() {
  return muted;
}

type ToneOpts = {
  freq: number;
  freqEnd?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
};

function tone({ freq, freqEnd, dur, type = "square", gain = 0.08, delay = 0 }: ToneOpts) {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain = 0.06, delay = 0) {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.buffer = buf;
  src.connect(g).connect(a.destination);
  src.start(t0);
}

export const sfx = {
  jump: () => tone({ freq: 320, freqEnd: 620, dur: 0.16, type: "square", gain: 0.06 }),
  land: () => noise(0.08, 0.05),
  slide: () => noise(0.22, 0.04),
  death: () => {
    tone({ freq: 300, freqEnd: 60, dur: 0.4, type: "sawtooth", gain: 0.08 });
    noise(0.2, 0.06);
  },
  finish: () => {
    tone({ freq: 523, dur: 0.12, type: "triangle", gain: 0.09 });
    tone({ freq: 659, dur: 0.12, type: "triangle", gain: 0.09, delay: 0.11 });
    tone({ freq: 784, dur: 0.2, type: "triangle", gain: 0.09, delay: 0.22 });
  },
  record: () => {
    tone({ freq: 880, dur: 0.1, type: "triangle", gain: 0.08 });
    tone({ freq: 1175, dur: 0.18, type: "triangle", gain: 0.08, delay: 0.1 });
  },
  click: () => tone({ freq: 700, freqEnd: 500, dur: 0.06, type: "square", gain: 0.04 }),
  tick: () => tone({ freq: 1000, dur: 0.03, type: "square", gain: 0.02 }),
};
