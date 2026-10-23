// Gerçek yankı zinciri: ConvolverNode + ping-pong delay + limiter
// TTS'ten gelen AudioBuffer bu grafiğe girer, sesin KENDİSİ yankılanır.

export type EchoProfile = 'basement' | 'stage' | 'parking';

interface EchoSpec {
  rt60: number;      // saniye
  preDelay: number;  // saniye
  wet: number;       // 0-1
  damp: number;      // Hz — kuyruk tiz kesimi
  ppDelay: number;   // ping-pong gecikmesi (s)
  ppFeedback: number;
}

export const ECHO_SPECS: Record<EchoProfile, EchoSpec> = {
  basement: { rt60: 2.2, preDelay: 0.020, wet: 0.46, damp: 4200, ppDelay: 0.11, ppFeedback: 0.22 },
  stage:    { rt60: 1.4, preDelay: 0.012, wet: 0.32, damp: 6800, ppDelay: 0.08, ppFeedback: 0.14 },
  parking:  { rt60: 3.0, preDelay: 0.032, wet: 0.55, damp: 3200, ppDelay: 0.15, ppFeedback: 0.30 },
};

/** Beton/bodrum karakterli impulse response üretir */
function makeImpulse(ctx: AudioContext, spec: EchoSpec): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.max(1, Math.floor(rate * spec.rt60 * 1.15));
  const buf = ctx.createBuffer(2, len, rate);

  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    const pre = Math.floor(rate * spec.preDelay);

    for (let i = pre; i < len; i++) {
      const t = (i - pre) / rate;
      // eksponansiyel sönüm (RT60)
      const env = Math.exp((-6.9078 * t) / spec.rt60);
      // yansıma yoğunluğu: erken yansımalar daha güçlü
      const early = t < 0.09 ? 1.5 : 1.0;
      const noise = Math.random() * 2 - 1;
      d[i] = noise * env * early * 0.6;
      // seyrek "duvar" yansımaları
      if (i % Math.floor(rate * 0.021) === 0) d[i] += (Math.random() * 2 - 1) * env * 0.9;
    }
    // pre-delay bölgesi sessiz
    for (let i = 0; i < pre; i++) d[i] = 0;
  }
  return buf;
}

export class EchoChain {
  readonly ctx: AudioContext;
  private input: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private preDelay: DelayNode;
  private convolver: ConvolverNode;
  private damp: BiquadFilterNode;
  private limiter: DynamicsCompressorNode;
  private ppL: DelayNode;
  private ppR: DelayNode;
  private ppFbL: GainNode;
  private ppFbR: GainNode;
  private ppPanL: StereoPannerNode;
  private ppPanR: StereoPannerNode;
  private ppGain: GainNode;
  private profile: EchoProfile = 'basement';

  constructor(ctx: AudioContext, profile: EchoProfile = 'basement') {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();

    this.preDelay = ctx.createDelay(0.2);
    this.convolver = ctx.createConvolver();
    this.damp = ctx.createBiquadFilter();
    this.damp.type = 'lowpass';

    this.ppL = ctx.createDelay(1.0);
    this.ppR = ctx.createDelay(1.0);
    this.ppFbL = ctx.createGain();
    this.ppFbR = ctx.createGain();
    this.ppPanL = ctx.createStereoPanner();
    this.ppPanR = ctx.createStereoPanner();
    this.ppPanL.pan.value = -0.85;
    this.ppPanR.pan.value = 0.85;
    this.ppGain = ctx.createGain();

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -6;
    this.limiter.knee.value = 6;
    this.limiter.ratio.value = 4;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;

    // kuru
    this.input.connect(this.dry);
    this.dry.connect(this.limiter);

    // ıslak: pre-delay → convolver → damp → wet
    this.input.connect(this.preDelay);
    this.preDelay.connect(this.convolver);
    this.convolver.connect(this.damp);
    this.damp.connect(this.wet);
    this.wet.connect(this.limiter);

    // ping-pong
    this.input.connect(this.ppL);
    this.ppL.connect(this.ppPanL);
    this.ppPanL.connect(this.ppGain);
    this.ppL.connect(this.ppFbL);
    this.ppFbL.connect(this.ppR);
    this.ppR.connect(this.ppPanR);
    this.ppPanR.connect(this.ppGain);
    this.ppR.connect(this.ppFbR);
    this.ppFbR.connect(this.ppL);
    this.ppGain.connect(this.limiter);

    this.limiter.connect(ctx.destination);

    this.setProfile(profile);
  }

  setProfile(profile: EchoProfile) {
    this.profile = profile;
    const spec = ECHO_SPECS[profile];
    const t = this.ctx.currentTime;

    // impulse response'u yeniden üret
    this.convolver.buffer = makeImpulse(this.ctx, spec);
    this.preDelay.delayTime.setTargetAtTime(spec.preDelay, t, 0.05);
    this.damp.frequency.setTargetAtTime(spec.damp, t, 0.05);

    this.wet.gain.setTargetAtTime(spec.wet, t, 0.08);
    this.dry.gain.setTargetAtTime(1 - spec.wet * 0.55, t, 0.08);

    this.ppL.delayTime.setTargetAtTime(spec.ppDelay, t, 0.05);
    this.ppR.delayTime.setTargetAtTime(spec.ppDelay * 1.18, t, 0.05);
    this.ppFbL.gain.setTargetAtTime(spec.ppFeedback, t, 0.05);
    this.ppFbR.gain.setTargetAtTime(spec.ppFeedback, t, 0.05);
    this.ppGain.gain.setTargetAtTime(spec.wet * 0.45, t, 0.05);
  }

  /** Buffer'ı gerçek yankıdan geçirerek çalar; bitince resolve olur */
  play(buffer: AudioBuffer, gain = 1.0): Promise<void> {
    return new Promise((resolve) => {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const g = this.ctx.createGain();
      g.gain.value = gain;

      src.connect(g);
      g.connect(this.input);

      src.onended = () => {
        try { src.disconnect(); g.disconnect(); } catch { /* noop */ }
        resolve();
      };

      src.start();
    });
  }

  /** Çalan kaynağı kes */
  stopAll() {
    // BufferSource'lar kendi onended'leriyle temizlenir; limiter'ı sustur
    this.limiter.threshold.setTargetAtTime(-60, this.ctx.currentTime, 0.02);
    setTimeout(() => {
      this.limiter.threshold.setTargetAtTime(-6, this.ctx.currentTime, 0.05);
    }, 120);
  }

  get currentProfile() {
    return this.profile;
  }
}
