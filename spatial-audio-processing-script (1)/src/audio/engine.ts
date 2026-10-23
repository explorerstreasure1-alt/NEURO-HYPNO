// NEURO-HYPNO Spatial Echo Engine — Web Audio implementation
// MOD PHONES  : Binaural L/R (200/206 Hz) + wide stereo cathedral (orijinal spec)
// MOD SPEAKER : 6 Hz İzokronik nabız — 136.1 Hz Om taşıyıcı + 2./3. harmonik takviye
//               + perküsif "thump" katmanı + limiter + Mid-Side + 2-4 kHz netlik.
//
// NEDEN HARMONİK TAKVİYE? Telefon hoparlörleri fiziksel olarak ~300 Hz altını
// çok zayıf basar (küçük sürücü + port). 136.1 Hz'in tek başına "vurmaması"
// bundandır. Çözüm: 272.2 Hz (2.harmonik) ve 408.3 Hz (3.harmonik) aynı 6 Hz
// kapıyla birlikte modüle edilir — kulak bunları "eksik temel" (missing
// fundamental) illüzyonuyla 136.1 Hz'in ritmi olarak algılar, konuşma hoparlörü
// bu frekansları çok daha güçlü basar. Ayrıca kısa bir "thump" (düşük geçiren
// gürültü patlaması) her nabızda perküsif bir vuru hissi ekler.

import { EchoChain, type EchoProfile } from './echoChain';
import { loadTtsBuffer, makeEchoDemoBuffer } from './tts';
import { pickNativeVoice, androidTts, androidHasLanguage, localeOf } from './voice';

export type OutputMode = 'phones' | 'speaker';

export interface EngineParams {
  wet: number; // 0-100 %
  decay: number; // seconds RT60
  delayMs: number; // ms
  feedback: number; // 0-80 %
  highCut: number; // Hz
  binauralBase: number; // Hz (phones modu tabanı)
  binauralBeat: number; // Hz (theta — phones'ta vuruş, speaker'da kapılama hızı)
  whisperGain: number; // 0-100
  binauralGain: number; // 0-100
  masterGain: number; // 0-100
}

export const DEFAULT_PARAMS: EngineParams = {
  wet: 35,
  decay: 2.4,
  delayMs: 120,
  feedback: 15,
  highCut: 6000,
  binauralBase: 200,
  binauralBeat: 6,
  whisperGain: 80,
  binauralGain: 55,
  masterGain: 85,
};

export const ISO_CARRIER = 136.1; // Om frekansı — dünya rezonansı (temel)
export const ISO_H2 = ISO_CARRIER * 2; // 272.2 Hz — hoparlörde çok daha güçlü basar
export const ISO_H3 = ISO_CARRIER * 3; // 408.3 Hz — netlik + algılanan "vuru"
export const CLARITY_FREQ = 3000; // 2-4 kHz netlik bandı merkezi

// ── KLİNİK GÜVENLİK TAVANI ────────────────────────────────────
// Dr. M. Soysal (Klinik Nöroloji) bulgusu: "zayıf hoparlör" tespitinde
// uygulanan otomatik kazanç artışı donanımdan bağımsız sabit bir tavana
// oturtulmalı — kalibrasyon hiçbir koşulda bu sınırı aşamaz.
export const SAFE_SPEAKER_GAIN_CEILING = 0.52; // binaural/izokronik yatak için mutlak tavan
export const SAFE_PHONES_GAIN_CEILING = 0.34; // kulaklık binaural yatağı için mutlak tavan
export const CLARITY_DB = 4; // hoparlör modunda fısıltı artışı

export interface CalibLevel { freq: number; db: number; }
export interface CalibrationResult {
  levels: CalibLevel[];
  weak: boolean; // temel frekans (136.1Hz) oda/hoparlörde zayıf mı
  bestFreq: number; // en güçlü algılanan test frekansı
  baseDb: number; // 136.1 Hz ölçümü (0-255)
  bestDb: number;
  ts: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class HypnoEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  limiter: DynamicsCompressorNode | null = null;
  analyser: AnalyserNode | null = null;
  analyserTime: AnalyserNode | null = null;

  // Gerçek yankı zinciri (TTS AudioBuffer → Convolver)
  echoChain: EchoChain | null = null;

  outputMode: OutputMode = 'phones';
  speakerProfile: CalibrationResult | null = null;

  // Binaural (phones) osilatörleri
  oscL: OscillatorNode | null = null;
  oscR: OscillatorNode | null = null;
  panL: StereoPannerNode | null = null;
  panR: StereoPannerNode | null = null;
  // İzokronik (speaker) harmonik yığını
  isoH1: OscillatorNode | null = null;
  isoH2: OscillatorNode | null = null;
  isoH3: OscillatorNode | null = null;
  isoH1Gain: GainNode | null = null;
  isoH2Gain: GainNode | null = null;
  isoH3Gain: GainNode | null = null;
  thumpSrc: AudioBufferSourceNode | null = null;
  thumpFilter: BiquadFilterNode | null = null;
  thumpGain: GainNode | null = null;

  binauralGainNode: GainNode | null = null;
  binauralFilter: BiquadFilterNode | null = null;
  swellGain: GainNode | null = null;
  swellOsc: OscillatorNode | null = null;
  swellDepth: GainNode | null = null;
  // izokronik kapı: taşıyıcıyı 6 Hz zarfla %100 derinlikte aç/kapa (keskinleştirilmiş)
  isoGate: GainNode | null = null;
  isoLFO: OscillatorNode | null = null;
  isoDepth: GainNode | null = null;
  isoShaper: WaveShaperNode | null = null;
  thumpShaper: WaveShaperNode | null = null;

  // Whisper chain
  whisperSource: AudioBufferSourceNode | null = null;
  whisperInputGain: GainNode | null = null;
  whisperBus: GainNode | null = null;
  clarity: BiquadFilterNode | null = null; // 2-4kHz netlik (speaker modu)
  dryGain: GainNode | null = null;
  wetGain: GainNode | null = null;
  convolver: ConvolverNode | null = null;
  wetFilter: BiquadFilterNode | null = null; // 6kHz lowpass on tail
  whisperBand: BiquadFilterNode | null = null;
  whisperBand2: BiquadFilterNode | null = null;

  // Ping-pong
  ppInput: GainNode | null = null;
  ppDelayL: DelayNode | null = null;
  ppDelayR: DelayNode | null = null;
  ppFbL: GainNode | null = null;
  ppFbR: GainNode | null = null;
  ppPanL: StereoPannerNode | null = null;
  ppPanR: StereoPannerNode | null = null;
  ppMix: GainNode | null = null;

  // M/S oda bloğu (telefon hoparlörü için)
  msDry: GainNode | null = null;
  msWet: GainNode | null = null;
  msMid: GainNode | null = null;
  msSide: GainNode | null = null;

  // Drift LFO
  driftOsc: OscillatorNode | null = null;
  driftGain: GainNode | null = null;
  driftPanner: StereoPannerNode | null = null;

  binauralOn = false;
  whisperOn = false;
  params: EngineParams = { ...DEFAULT_PARAMS };
  whisperBuffer: AudioBuffer | null = null; // kısa AAAA kafiye önizlemesi
  sentenceBuffer: AudioBuffer | null = null; // ana gece döngüsü: cümle kalıbı fısıltısı
  useSentenceMode = true; // true: cümle kalıpları çalar, false: AAAA kafiye
  noiseBuffer: AudioBuffer | null = null;

  get isRunning() {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  async ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return this.ctx;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC({ latencyHint: 'interactive' });
    this.buildGraph();
    this.applyOutputMode(true);
    return this.ctx;
  }

  private makeShaperCurve(k: number): Float32Array<ArrayBuffer> {
    // tanh tabanlı yumuşak-kare biçimlendirme: sinüsü keskinleştirir (tıksız)
    const n = 1024;
    const curve = new Float32Array(new ArrayBuffer(n * 4));
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    return curve;
  }

  private makeNoiseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const n = Math.floor(rate * 2);
    const buf = ctx.createBuffer(1, n, rate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private buildGraph() {
    const ctx = this.ctx!;
    // Master + limiter (speaker modunda sabit, net ve yüksek algılanan ses için)
    this.master = ctx.createGain();
    this.master.gain.value = this.params.masterGain / 100 * 0.9;
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -8;
    this.limiter.knee.value = 6;
    this.limiter.ratio.value = 5;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.22;
    this.master.connect(this.limiter);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;
    this.analyserTime = ctx.createAnalyser();
    this.analyserTime.fftSize = 4096;
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.analyserTime);

    // ---- M/S oda bloğu ----
    this.msDry = ctx.createGain();
    this.msWet = ctx.createGain();
    this.msDry.gain.value = 1;
    this.msWet.gain.value = 0;
    this.analyserTime.connect(this.msDry);
    this.msDry.connect(ctx.destination);

    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    this.analyserTime.connect(splitter);
    this.msMid = ctx.createGain();
    this.msMid.gain.value = 1.15;
    const midL = ctx.createGain(); midL.gain.value = 0.5;
    const midR = ctx.createGain(); midR.gain.value = 0.5;
    splitter.connect(midL, 0); splitter.connect(midR, 1);
    midL.connect(this.msMid); midR.connect(this.msMid);
    this.msSide = ctx.createGain();
    this.msSide.gain.value = 0.3;
    const sideL = ctx.createGain(); sideL.gain.value = 0.5;
    const sideR = ctx.createGain(); sideR.gain.value = -0.5;
    splitter.connect(sideL, 0); splitter.connect(sideR, 1);
    sideL.connect(this.msSide); sideR.connect(this.msSide);
    const outL = ctx.createGain();
    const outR = ctx.createGain();
    const sideInv = ctx.createGain(); sideInv.gain.value = -1;
    this.msMid.connect(outL);
    this.msSide.connect(outL);
    this.msMid.connect(outR);
    this.msSide.connect(sideInv);
    sideInv.connect(outR);
    outL.connect(merger, 0, 0);
    outR.connect(merger, 0, 1);
    merger.connect(this.msWet);
    this.msWet.connect(ctx.destination);

    // ---- Binaural (phones) / İzokronik harmonik yığını (speaker) ----
    this.binauralGainNode = ctx.createGain();
    this.binauralGainNode.gain.value = 0.0;
    this.binauralFilter = ctx.createBiquadFilter();
    this.binauralFilter.type = 'lowpass';
    this.binauralFilter.frequency.value = 900;

    // keskinleştirilmiş kapı: sine LFO → waveshaper (yumuşak-kare) → derinlik → kapı
    this.isoGate = ctx.createGain();
    this.isoGate.gain.value = 1.0;
    this.isoLFO = ctx.createOscillator();
    this.isoLFO.type = 'sine';
    this.isoLFO.frequency.value = this.params.binauralBeat;
    this.isoShaper = ctx.createWaveShaper();
    this.isoShaper.curve = this.makeShaperCurve(1.0); // phones'ta nötr (şeffaf)
    this.isoShaper.oversample = '2x';
    this.isoDepth = ctx.createGain();
    this.isoDepth.gain.value = 0.0;
    this.isoLFO.connect(this.isoShaper);
    this.isoShaper.connect(this.isoDepth);
    this.isoDepth.connect(this.isoGate.gain);
    this.isoLFO.start();

    // 0.08 Hz nefes dalgası: yatak, solunum ritmine yakın yavaşça kabarır/iner.
    // Bu, ani seviye değişimi yapmadan otonom gevşemeyi destekleyen genlik katmanıdır.
    this.swellGain = ctx.createGain();
    this.swellGain.gain.value = 1.0;
    this.swellOsc = ctx.createOscillator();
    this.swellOsc.type = 'sine';
    this.swellOsc.frequency.value = 0.08;
    this.swellDepth = ctx.createGain();
    this.swellDepth.gain.value = 0.07;
    this.swellOsc.connect(this.swellDepth);
    this.swellDepth.connect(this.swellGain.gain);
    this.swellOsc.start();

    this.isoGate.connect(this.binauralGainNode);
    this.binauralGainNode.connect(this.swellGain);
    this.swellGain.connect(this.binauralFilter);
    this.binauralFilter.connect(this.master);

    // phones: binaural çifti
    this.oscL = ctx.createOscillator();
    this.oscL.type = 'sine';
    this.oscL.frequency.value = this.params.binauralBase;
    this.oscR = ctx.createOscillator();
    this.oscR.type = 'sine';
    this.oscR.frequency.value = this.params.binauralBase + this.params.binauralBeat;
    this.panL = ctx.createStereoPanner();
    this.panL.pan.value = -1;
    this.panR = ctx.createStereoPanner();
    this.panR.pan.value = 1;
    const mixL = ctx.createGain(); mixL.gain.value = 0.5;
    const mixR = ctx.createGain(); mixR.gain.value = 0.5;
    this.oscL.connect(this.panL);
    this.oscR.connect(this.panR);
    this.panL.connect(mixL);
    this.panR.connect(mixR);
    mixL.connect(this.isoGate);
    mixR.connect(this.isoGate);
    this.oscL.start();
    this.oscR.start();

    // speaker: harmonik yığın — temel + 2. + 3. harmonik (tümü merkezde, mono)
    this.isoH1 = ctx.createOscillator(); this.isoH1.type = 'sine'; this.isoH1.frequency.value = ISO_CARRIER;
    this.isoH2 = ctx.createOscillator(); this.isoH2.type = 'sine'; this.isoH2.frequency.value = ISO_H2;
    this.isoH3 = ctx.createOscillator(); this.isoH3.type = 'triangle'; this.isoH3.frequency.value = ISO_H3;
    this.isoH1Gain = ctx.createGain(); this.isoH1Gain.gain.value = 0;
    this.isoH2Gain = ctx.createGain(); this.isoH2Gain.gain.value = 0;
    this.isoH3Gain = ctx.createGain(); this.isoH3Gain.gain.value = 0;
    this.isoH1.connect(this.isoH1Gain); this.isoH1Gain.connect(this.isoGate);
    this.isoH2.connect(this.isoH2Gain); this.isoH2Gain.connect(this.isoGate);
    this.isoH3.connect(this.isoH3Gain); this.isoH3Gain.connect(this.isoGate);
    this.isoH1.start(); this.isoH2.start(); this.isoH3.start();

    // speaker: perküsif "thump" — bant geçiren gürültü, keskin kapıyla tetiklenir
    this.noiseBuffer = this.makeNoiseBuffer();
    this.thumpSrc = ctx.createBufferSource();
    this.thumpSrc.buffer = this.noiseBuffer;
    this.thumpSrc.loop = true;
    this.thumpFilter = ctx.createBiquadFilter();
    this.thumpFilter.type = 'bandpass';
    this.thumpFilter.frequency.value = 170;
    this.thumpFilter.Q.value = 1.1;
    this.thumpShaper = ctx.createWaveShaper();
    this.thumpShaper.curve = this.makeShaperCurve(6.0); // çok keskin → belirgin "vuru"
    this.thumpGain = ctx.createGain();
    this.thumpGain.gain.value = 0; // speaker modunda açılır
    const thumpGateGain = ctx.createGain(); thumpGateGain.gain.value = 1;
    this.isoLFO.connect(this.thumpShaper);
    this.thumpShaper.connect(thumpGateGain.gain);
    this.thumpSrc.connect(this.thumpFilter);
    this.thumpFilter.connect(thumpGateGain);
    thumpGateGain.connect(this.thumpGain);
    // ÖNEMLİ: binauralFilter yerine binauralGainNode'a bağlanır — böylece
    // tek "durdur/başlat" ikonu (setBinauralOn) hoparlör modundaki thump
    // katmanını da dahil ederek TÜM sesi gerçekten susturur/başlatır.
    this.thumpGain.connect(this.binauralGainNode);
    this.thumpSrc.start();

    // ---- Whisper chain ----
    this.whisperInputGain = ctx.createGain();
    this.whisperInputGain.gain.value = 1.0;

    this.whisperBand = ctx.createBiquadFilter();
    this.whisperBand.type = 'bandpass';
    this.whisperBand.frequency.value = 1400;
    this.whisperBand.Q.value = 0.9;
    this.whisperBand2 = ctx.createBiquadFilter();
    this.whisperBand2.type = 'bandpass';
    this.whisperBand2.frequency.value = 3200;
    this.whisperBand2.Q.value = 1.1;

    const formantMix = ctx.createGain();
    formantMix.gain.value = 1.0;
    this.whisperInputGain.connect(this.whisperBand);
    this.whisperInputGain.connect(this.whisperBand2);
    this.whisperBand.connect(formantMix);
    this.whisperBand2.connect(formantMix);

    this.whisperBus = ctx.createGain();
    this.whisperBus.gain.value = this.params.whisperGain / 100;

    this.clarity = ctx.createBiquadFilter();
    this.clarity.type = 'peaking';
    this.clarity.frequency.value = CLARITY_FREQ;
    this.clarity.Q.value = 0.9;
    this.clarity.gain.value = 0;

    this.driftPanner = ctx.createStereoPanner();
    this.driftOsc = ctx.createOscillator();
    this.driftOsc.type = 'sine';
    this.driftOsc.frequency.value = 0.5;
    this.driftGain = ctx.createGain();
    this.driftGain.gain.value = 0.55;
    this.driftOsc.connect(this.driftGain);
    this.driftGain.connect(this.driftPanner.pan);
    this.driftOsc.start();
    formantMix.connect(this.driftPanner);

    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 1 - this.params.wet / 100;
    this.driftPanner.connect(this.dryGain);
    this.dryGain.connect(this.whisperBus);

    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.makeImpulse(this.params.decay);
    this.wetFilter = ctx.createBiquadFilter();
    this.wetFilter.type = 'lowpass';
    this.wetFilter.frequency.value = this.params.highCut;
    this.wetFilter.Q.value = 0.4;
    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = this.params.wet / 100;

    this.ppInput = ctx.createGain();
    this.ppInput.gain.value = 1.0;
    this.ppDelayL = ctx.createDelay(2.0);
    this.ppDelayR = ctx.createDelay(2.0);
    this.ppDelayL.delayTime.value = this.params.delayMs / 1000;
    this.ppDelayR.delayTime.value = this.params.delayMs / 1000;
    this.ppFbL = ctx.createGain();
    this.ppFbR = ctx.createGain();
    this.ppFbL.gain.value = this.params.feedback / 100;
    this.ppFbR.gain.value = this.params.feedback / 100;
    this.ppPanL = ctx.createStereoPanner();
    this.ppPanL.pan.value = -0.85;
    this.ppPanR = ctx.createStereoPanner();
    this.ppPanR.pan.value = 0.85;
    this.ppMix = ctx.createGain();
    this.ppMix.gain.value = 0.9;

    this.driftPanner.connect(this.convolver);
    this.convolver.connect(this.wetFilter);
    this.wetFilter.connect(this.wetGain);
    this.wetGain.connect(this.ppInput);
    this.ppInput.connect(this.ppDelayL);
    this.ppDelayL.connect(this.ppPanL);
    this.ppPanL.connect(this.ppMix);
    this.ppDelayL.connect(this.ppFbL);
    this.ppFbL.connect(this.ppDelayR);
    this.ppDelayR.connect(this.ppPanR);
    this.ppPanR.connect(this.ppMix);
    this.ppDelayR.connect(this.ppFbR);
    this.ppFbR.connect(this.ppDelayL);
    const wetThrough = ctx.createGain();
    wetThrough.gain.value = 0.55;
    this.wetGain.connect(wetThrough);
    wetThrough.connect(this.whisperBus);
    this.ppMix.connect(this.whisperBus);

    this.whisperBus.connect(this.clarity);
    this.clarity.connect(this.master);

    this.whisperBuffer = this.makeWhisperBuffer();
    this.sentenceBuffer = this.makeSentenceWhisperBuffer();
  }

  // ---------- çıkış modu ----------
  setOutputMode(mode: OutputMode) {
    this.outputMode = mode;
    if (this.ctx) this.applyOutputMode(false);
  }

  setSpeakerProfile(profile: CalibrationResult | null) {
    this.speakerProfile = profile;
    if (this.ctx && this.outputMode === 'speaker') this.applyOutputMode(false);
  }

  private applyOutputMode(instant: boolean) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const tc = instant ? 0.01 : 0.4;
    const sp = this.outputMode === 'speaker';
    const p = this.params;
    // zayıf kabul: kalibrasyon yoksa ya da ölçüm zayıfsa güvenli varsayım = zayıf
    const weak = this.speakerProfile ? this.speakerProfile.weak : true;

    if (sp) {
      // İZOKRONİK MOD: harmonik yığın devrede, binaural L/R kapalı
      this.oscL?.frequency.setTargetAtTime(ISO_CARRIER, t, tc);
      this.oscR?.frequency.setTargetAtTime(ISO_CARRIER, t, tc);
      this.panL?.pan.setTargetAtTime(0, t, tc);
      this.panR?.pan.setTargetAtTime(0, t, tc);
      this.isoLFO?.frequency.setTargetAtTime(p.binauralBeat, t, tc);
      // %100 derinlik, keskin kapı (speaker'da belirgin "nabız" hissi)
      this.isoShaper!.curve = this.makeShaperCurve(2.6);
      this.isoGate?.gain.setTargetAtTime(0.5, t, tc);
      this.isoDepth?.gain.setTargetAtTime(0.5, t, tc);
      this.binauralFilter?.frequency.setTargetAtTime(760, t, tc);
      // harmonik dengesi: zayıf hoparlörde temel kısılır, harmonikler + thump öne çıkar
      this.isoH1Gain?.gain.setTargetAtTime(weak ? 0.55 : 0.95, t, tc);
      this.isoH2Gain?.gain.setTargetAtTime(weak ? 0.62 : 0.4, t, tc);
      this.isoH3Gain?.gain.setTargetAtTime(weak ? 0.42 : 0.22, t, tc);
      this.thumpGain?.gain.setTargetAtTime(weak ? 0.5 : 0.28, t, tc);
    } else {
      // BİNAURAL MOD: harmonik yığın + thump kapalı, L/R ayrımı tam
      this.oscL?.frequency.setTargetAtTime(p.binauralBase, t, tc);
      this.oscR?.frequency.setTargetAtTime(p.binauralBase + p.binauralBeat, t, tc);
      this.panL?.pan.setTargetAtTime(-1, t, tc);
      this.panR?.pan.setTargetAtTime(1, t, tc);
      this.isoShaper!.curve = this.makeShaperCurve(1.0);
      this.isoDepth?.gain.setTargetAtTime(0, t, tc);
      this.isoGate?.gain.setTargetAtTime(1, t, tc);
      this.binauralFilter?.frequency.setTargetAtTime(900, t, tc);
      this.isoH1Gain?.gain.setTargetAtTime(0, t, tc);
      this.isoH2Gain?.gain.setTargetAtTime(0, t, tc);
      this.isoH3Gain?.gain.setTargetAtTime(0, t, tc);
      this.thumpGain?.gain.setTargetAtTime(0, t, tc);
    }
    if (this.msDry && this.msWet) {
      this.msDry.gain.setTargetAtTime(sp ? 0 : 1, t, tc);
      this.msWet.gain.setTargetAtTime(sp ? 1 : 0, t, tc);
    }
    if (this.clarity) this.clarity.gain.setTargetAtTime(sp ? CLARITY_DB : 0, t, tc);
    if (this.limiter) this.limiter.threshold.setTargetAtTime(sp ? -6 : -10, t, tc);
  }

  // ---------- Mikrofonla hoparlör kalibrasyonu ----------
  /**
   * Telefon mikrofonuyla gerçek zamanlı hoparlör tepkisini ölçer.
   * 5 test tonu (136.1 → 408.3 Hz) sırayla çalınır, mikrofon FFT'siyle
   * algılanan seviye ölçülür. Mikrofon ASLA hoparlöre bağlanmaz (geri
   * besleme/çınlama olmaz) — sadece analiz için kullanılır.
   */
  async calibrateSpeaker(onTone?: (f: number, i: number, total: number, levelPct: number) => void): Promise<CalibrationResult> {
    await this.ensure();
    const ctx = this.ctx!;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    const micSource = ctx.createMediaStreamSource(stream);
    const micAnalyser = ctx.createAnalyser();
    micAnalyser.fftSize = 2048;
    micAnalyser.smoothingTimeConstant = 0.15;
    micSource.connect(micAnalyser); // yalnızca analiz — destination'a BAĞLANMAZ

    const freqs = [ISO_CARRIER, 204.15, ISO_H2, 340.25, ISO_H3];
    const testOsc = ctx.createOscillator();
    const testGain = ctx.createGain();
    testGain.gain.value = 0;
    testOsc.connect(testGain);
    testGain.connect(this.master!);
    testOsc.start();

    const data = new Uint8Array(micAnalyser.frequencyBinCount);
    const binHz = ctx.sampleRate / micAnalyser.fftSize;
    const results: CalibLevel[] = [];

    for (let i = 0; i < freqs.length; i++) {
      const f = freqs[i];
      testOsc.frequency.setTargetAtTime(f, ctx.currentTime, 0.01);
      testGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.02);
      await sleep(180); // hoparlör + mikrofon oturması
      micAnalyser.getByteFrequencyData(data as unknown as Uint8Array<ArrayBuffer>);
      const bin = Math.round(f / binHz);
      let sum = 0, count = 0;
      for (let b = Math.max(0, bin - 2); b <= bin + 2 && b < data.length; b++) { sum += data[b]; count++; }
      const level = count ? sum / count : 0;
      results.push({ freq: f, db: level });
      onTone?.(f, i, freqs.length, level / 255);
      testGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      await sleep(120);
    }

    testOsc.stop(); testOsc.disconnect(); testGain.disconnect();
    stream.getTracks().forEach((tr) => tr.stop());
    micSource.disconnect(); micAnalyser.disconnect();

    const base = results[0]?.db ?? 0;
    const best = results.reduce((a, b) => (b.db > a.db ? b : a), results[0]);
    const weak = base < best.db * 0.6 || base < 45;
    const profile: CalibrationResult = { levels: results, weak, bestFreq: best.freq, baseDb: base, bestDb: best.db, ts: Date.now() };
    this.setSpeakerProfile(profile);
    return profile;
  }

  /** Generate stereo cathedral impulse with exponential decay (RT60). */
  private makeImpulse(rt60: number): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * rt60 * 1.4));
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      const pre = Math.floor(rate * 0.018);
      for (let i = 0; i < len; i++) {
        if (i < pre) { d[i] = 0; continue; }
        const t = (i - pre) / rate;
        const env = Math.exp(-6.908 * t / rt60);
        const n = (Math.random() * 2 - 1);
        const early = i < rate * 0.12 ? 1.4 : 1.0;
        d[i] = n * env * early * 0.5;
      }
    }
    return buf;
  }

  /** Procedural A-A-A-A rhyme whisper: 4 breathy "ah" bursts per bar, dreamy. */
  /** Kısa A-A-A-A kafiye döngüsü (önizleme / sabah testi referansı için). */
  private makeWhisperBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const dur = 12;
    const buf = ctx.createBuffer(1, Math.floor(rate * dur), rate);
    const d = buf.getChannelData(0);
    const burst = (center: number, length: number, amp: number, vowelShift: number) => {
      const start = Math.floor((center - length / 2) * rate);
      const end = Math.floor((center + length / 2) * rate);
      for (let i = start; i < end; i++) {
        if (i < 0 || i >= d.length) continue;
        const t = (i - start) / (end - start);
        const env = Math.sin(Math.PI * t) ** 1.4;
        const noise = Math.random() * 2 - 1;
        const shimmer = 0.6 + 0.4 * Math.sin(2 * Math.PI * (vowelShift * t + i / rate * 90));
        const breath = 0.35 * Math.sin(2 * Math.PI * t * 3) * Math.random();
        d[i] += (noise * 0.75 + breath) * env * amp * shimmer;
      }
    };
    const bars = 3;
    for (let b = 0; b < bars; b++) {
      const off = b * 4;
      burst(off + 0.55, 0.62, 0.85, 1.0);
      burst(off + 1.45, 0.62, 0.8, 1.08);
      burst(off + 2.35, 0.66, 0.82, 0.94);
      burst(off + 3.25, 0.78, 0.9, 1.02);
      burst(off + 3.85, 0.3, 0.14, 0.6);
    }
    let peak = 0.0001;
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    const g = 0.9 / peak;
    for (let i = 0; i < d.length; i++) d[i] *= g;
    return buf;
  }

  /**
   * CÜMLE KALIBI FISILTISI — ana gece döngüsü.
   * A-A-A-A tekli kafiye yerine, gerçek bir cümlenin prozodisini taklit eden
   * çok-kelimeli öbekler üretir: kısa "kelime" patlamaları arasında mikro
   * boşluklar (kelime arası nefes), öbek sonunda daha uzun bir "cümle sonu"
   * sessizliği. Katedral reverb + ping-pong zincirinden geçerek yankılı ve
   * fısıltılı çıkar — bilinçaltına "okunuyormuş" hissi verir.
   */
  private makeSentenceWhisperBuffer(seed = 1): AudioBuffer {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const dur = 24; // 24s ritmik döngü: kelimeler → cümle → tekrar → cümle
    const buf = ctx.createBuffer(1, Math.floor(rate * dur), rate);
    const d = buf.getChannelData(0);

    const word = (center: number, length: number, amp: number, pitch: number) => {
      const start = Math.floor((center - length / 2) * rate);
      const end = Math.floor((center + length / 2) * rate);
      for (let i = start; i < end; i++) {
        if (i < 0 || i >= d.length) continue;
        const t = (i - start) / (end - start);
        const env = Math.sin(Math.PI * t) ** 1.3;
        const noise = Math.random() * 2 - 1;
        const shimmer = 0.55 + 0.45 * Math.sin(2 * Math.PI * (pitch * t + i / rate * 110 + seed));
        const breath = 0.3 * Math.sin(2 * Math.PI * t * 4) * Math.random();
        d[i] += (noise * 0.78 + breath) * env * amp * shimmer;
      }
    };

    // Tutarlı ritim: vurgu kalıbı güçlü-zayıf-orta-güçlü. Son kelime daha
    // uzun ve belirgin; böylece yankı kuyruğu cümle vurgusunu taşır.
    const accents = [1.0, 0.68, 0.8, 1.12];
    const wordCycle = (start: number, baseAmp: number, pitch: number) => {
      for (let i = 0; i < 4; i++) {
        const isLast = i === 3;
        word(start + i * 0.86, isLast ? 0.52 : 0.38, baseAmp * accents[i], pitch + i * 0.05);
      }
    };
    const sentenceCycle = (start: number, baseAmp: number, pitch: number) => {
      let cursor = start;
      for (let i = 0; i < 5; i++) {
        const isLast = i === 4;
        const len = isLast ? 0.56 : 0.3 + (i % 3) * 0.045;
        word(cursor + len / 2, len, baseAmp * (isLast ? 1.14 : accents[i % 4]), pitch + i * 0.045);
        cursor += 0.62;
      }
    };

    // 24 saniyelik tekrar mimarisi:
    // kelimeler → cümle → sessiz nefes → kelimeler (daha yumuşak) → cümle.
    wordCycle(0.75, 0.88, 0.92 + (seed % 5) * 0.03);
    sentenceCycle(4.75, 0.82, 1.02);
    wordCycle(10.65, 0.7, 0.88);
    sentenceCycle(14.9, 0.76, 0.97);
    // 19.8-24 sn arası yalnızca nefes/sessizlik: yankının boşlukta erimesi için.

    let peak = 0.0001;
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    const g = 0.92 / peak;
    for (let i = 0; i < d.length; i++) d[i] *= g;
    return buf;
  }

  /** Seçili dile göre cümle kalıbı fısıltısını yeniden üretir (gece başına çeşitlilik). */
  regenerateSentenceWhisper(seed?: number) {
    if (!this.ctx) return;
    this.sentenceBuffer = this.makeSentenceWhisperBuffer(seed ?? Math.ceil(Math.random() * 97));
    if (this.whisperOn) this.setWhisperOn(true); // çalıyorsa yeni buffer'la yeniden başlat
  }

  setSentenceMode(on: boolean) {
    this.useSentenceMode = on;
  }

  // ---------- transport ----------
  /**
   * @param delayWhisper true ise fısıltı hemen açılmaz — çağıran taraf
   * (store) 10 dakikalık gecikmeden sonra setWhisperOn(true) çağırır.
   */
  async startAll(delayWhisper = false) {
    await this.ensure();
    this.setBinauralOn(true);
    if (!delayWhisper) this.setWhisperOn(true);
  }
  async stopAll() {
    // Konuşma + yankı kuyruğu da kesilsin (önceki sürümde ses devam ediyordu)
    try {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    } catch { /* noop */ }
    this.stopEcho();
    this.restoreMaster();
    this.setBinauralOn(false);
    this.setWhisperOn(false);
  }

  setBinauralOn(on: boolean) {
    if (!this.ctx || !this.binauralGainNode) return;
    this.binauralOn = on;
    const t = this.ctx.currentTime;
    const ceiling = this.outputMode === 'speaker' ? SAFE_SPEAKER_GAIN_CEILING : SAFE_PHONES_GAIN_CEILING;
    const boost = this.outputMode === 'speaker' ? 0.46 : 0.32; // speaker'da daha güçlü algılanan seviye
    const target = on ? Math.min(ceiling, (this.params.binauralGain / 100) * boost) : 0.0;
    this.binauralGainNode.gain.cancelScheduledValues(t);
    this.binauralGainNode.gain.setTargetAtTime(target, t, on ? 1.0 : 0.4);
  }

  /**
   * Canlı sürüklenme frekansını yumuşakça kaydırır.
   * Kulaklıkta sağ osilatör, hoparlörde 6 Hz civarı kapılama LFO'su güncellenir.
   * depth (0.5-1), hoparlörde nabız belirginliğini ölçekler; güvenlik tavanını aşmaz.
   */
  setEntrainment(freq: number, depth = 1) {
    // 0.5 Hz'e kadar izin ver — derin delta / SWS bandı (kalite kontrol düzeltmesi)
    const f = Math.min(14, Math.max(0.5, freq));
    this.params.binauralBeat = f;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const d = Math.min(1, Math.max(0.5, depth));
    if (this.outputMode === 'speaker') {
      this.isoLFO?.frequency.setTargetAtTime(f, t, 0.75);
      this.isoDepth?.gain.setTargetAtTime(0.5 * d, t, 0.75);
    } else if (this.oscL && this.oscR) {
      this.oscL.frequency.setTargetAtTime(this.params.binauralBase, t, 0.75);
      this.oscR.frequency.setTargetAtTime(this.params.binauralBase + f, t, 0.75);
    }
  }

  setWhisperOn(on: boolean) {
    if (!this.ctx || !this.whisperInputGain) return;
    this.whisperOn = on;
    if (on) {
      if (this.whisperSource) { try { this.whisperSource.stop(); } catch {} this.whisperSource.disconnect(); }
      const src = this.ctx.createBufferSource();
      src.buffer = this.useSentenceMode ? (this.sentenceBuffer ?? this.whisperBuffer) : this.whisperBuffer;
      src.loop = true;
      src.playbackRate.value = 1.0;
      const fade = this.ctx.createGain();
      fade.gain.value = 0;
      src.connect(fade);
      fade.connect(this.whisperInputGain);
      src.start();
      fade.gain.setTargetAtTime(1.0, this.ctx.currentTime, 1.4);
      this.whisperSource = src;
      (this as any)._whisperFade = fade;
    } else {
      const src = this.whisperSource;
      const fade = (this as any)._whisperFade as GainNode | undefined;
      if (src && fade && this.ctx) {
        fade.gain.setTargetAtTime(0, this.ctx.currentTime, 0.35);
        const s = src;
        setTimeout(() => { try { s.stop(); } catch {} try { s.disconnect(); } catch {} }, 1400);
        this.whisperSource = null;
      }
    }
  }

  // ---------- params ----------
  update(patch: Partial<EngineParams>) {
    Object.assign(this.params, patch);
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const p = this.params;
    if (this.dryGain && this.wetGain) {
      this.dryGain.gain.setTargetAtTime(1 - p.wet / 100, t, 0.1);
      this.wetGain.gain.setTargetAtTime(p.wet / 100, t, 0.1);
    }
    if (this.wetFilter) this.wetFilter.frequency.setTargetAtTime(p.highCut, t, 0.1);
    if (this.ppDelayL && this.ppDelayR) {
      this.ppDelayL.delayTime.setTargetAtTime(p.delayMs / 1000, t, 0.1);
      this.ppDelayR.delayTime.setTargetAtTime(p.delayMs / 1000, t, 0.1);
    }
    if (this.ppFbL && this.ppFbR) {
      this.ppFbL.gain.setTargetAtTime(p.feedback / 100, t, 0.1);
      this.ppFbR.gain.setTargetAtTime(p.feedback / 100, t, 0.1);
    }
    if (this.outputMode === 'speaker') {
      if (this.isoLFO) this.isoLFO.frequency.setTargetAtTime(p.binauralBeat, t, 0.2);
    } else if (this.oscL && this.oscR) {
      this.oscL.frequency.setTargetAtTime(p.binauralBase, t, 0.2);
      this.oscR.frequency.setTargetAtTime(p.binauralBase + p.binauralBeat, t, 0.2);
    }
    if (this.whisperBus) this.whisperBus.gain.setTargetAtTime(p.whisperGain / 100, t, 0.15);
    if (this.master) this.master.gain.setTargetAtTime(p.masterGain / 100 * 0.9, t, 0.15);
    if (this.binauralGainNode && this.binauralOn) {
      const ceiling = this.outputMode === 'speaker' ? SAFE_SPEAKER_GAIN_CEILING : SAFE_PHONES_GAIN_CEILING;
      const boost = this.outputMode === 'speaker' ? 0.46 : 0.32;
      this.binauralGainNode.gain.setTargetAtTime(Math.min(ceiling, (p.binauralGain / 100) * boost), t, 0.2);
    }
  }

  setDecay(rt60: number) {
    this.params.decay = rt60;
    if (this.ctx && this.convolver) {
      const newIR = this.makeImpulse(rt60);
      this.convolver.buffer = newIR;
    }
  }

  getFreq(data: Uint8Array<ArrayBuffer>) {
    this.analyser?.getByteFrequencyData(data as unknown as Uint8Array<ArrayBuffer>);
  }
  getTime(data: Uint8Array<ArrayBuffer>) {
    this.analyserTime?.getByteTimeDomainData(data as unknown as Uint8Array<ArrayBuffer>);
  }

  /**
   * Okuma sahnesini hazırlar.
   * preserveScene=true ise mevcut seans parametrelerine DOKUNMAZ (sadece yatağı kısar).
   * Bu, 10. dakikada devreye giren fısıltının seansın teta/gain ayarlarını
   * ezmesini engeller (tutarlılık düzeltmesi).
   */
  private async prepareSpeechScene(echo: string, preserveScene = false) {
    await this.ensure();

    if (!preserveScene) {
      const profiles: Record<string, { wet: number; decay: number }> = {
        basement: { wet: 45, decay: 2.2 },
        stage: { wet: 38, decay: 1.8 },
        parking: { wet: 48, decay: 2.5 },
      };
      const p = profiles[echo] ?? profiles.basement;

      // Arka planda derin delta; konuşmayı örtmeyecek kadar düşük
      this.setEntrainment(1.5, 0.5);
      this.update({ wet: p.wet, whisperGain: 0, binauralGain: 8, masterGain: 88 });
      this.setDecay(p.decay);
      this.setBinauralOn(true);
      this.setWhisperOn(false);
    }

    // Konuşma süresince yatağı kıs (önceki seviyeyi sakla)
    if (this.master && this.ctx) {
      this.preSpeechMaster = this.master.gain.value || 0.79;
      this.master.gain.setTargetAtTime(0.24, this.ctx.currentTime, 0.2);
    }
  }

  /** Konuşma sonrası yatağı eski seviyesine döndür */
  private restoreMaster() {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.preSpeechMaster, this.ctx.currentTime, 0.8);
    }
  }

  private preSpeechMaster = 0.79;

  /**
   * Tek bir ifadeyi okur.
   * @returns true → gerçekten okundu, false → ana dili sesi yok (YANLIŞ AKSANLA OKUNMAZ)
   */
  private async speakRaw(text: string, lang: string, rate: number, volume = 1.0): Promise<boolean> {
    // 1) Android yerel TTS köprüsü — dil etiketi zorunlu, yanlış ses yok
    const bridge = androidTts();
    if (bridge && androidHasLanguage(lang)) {
      const ok = await new Promise<boolean>((resolve) => {
        try {
          bridge.speak(text, localeOf(lang), rate, Math.max(0, Math.min(1, volume)));
          const started = Date.now();
          const poll = () => {
            let speaking = true;
            try { speaking = !!bridge.isSpeaking?.(); } catch { speaking = false; }
            if (!speaking) return resolve(true);
            if (Date.now() - started > 20_000) {
              try { bridge.stopSpeaking?.(); } catch { /* noop */ }
              return resolve(true);
            }
            setTimeout(poll, 120);
          };
          setTimeout(poll, 150);
        } catch {
          resolve(false);
        }
      });
      if (ok) return true;
    }

    // 2) Web Speech — SADECE ana dili sesi varsa
    if (typeof speechSynthesis === 'undefined') return false;
    await this.loadVoices();

    const voice = pickNativeVoice(lang);
    if (!voice) {
      console.warn(
        `[AKSAN] ${lang} için ana dili sesi yok. Yanlış aksanla okumak yerine okuma atlandı. ` +
        `Çözüm: /api/tts (gerçek TTS) veya cihaza ${localeOf(lang)} ses paketi kur.`,
      );
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice.lang || localeOf(lang);
      utter.voice = voice;
      utter.rate = rate;
      utter.pitch = 1.0;
      utter.volume = Math.max(0, Math.min(1, volume));

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve(true);
      };
      utter.onend = done;
      utter.onerror = (e) => {
        console.warn('[TTS] okuma hatası:', e.error, lang, text);
        done();
      };
      // Bazı tarayıcılar onend'i tetiklemez — güvenlik zaman aşımı
      const guard = Math.max(3000, (text.length / Math.max(0.5, rate)) * 140);
      setTimeout(done, guard);

      speechSynthesis.speak(utter);
    });
  }

  // Yabancı dil kelime/cümle okuma + yankılı sahne
  async speakLightWhisper(text: string, lang = 'tr-TR', rate = 0.92, echo = 'basement'): Promise<boolean> {
    await this.prepareSpeechScene(echo);
    await this.loadVoices();

    try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 60)); // ilk isteğin yutulmasını önle

    const ok = await this.speakRaw(text, lang, rate, 1.0);

    this.restoreMaster();
    return ok;
  }

  /**
   * Kısıktan yükseğe → yüksekten kısığa "swell" okuma.
   * Ana dili sesi yoksa false döner ve HİÇ okumaz (yanlış aksan yok).
   */
  async speakSwell(
    text: string,
    lang = 'tr-TR',
    rate = 0.92,
    echo = 'basement',
    volume = 1.0,
    preserveScene = false,
  ): Promise<boolean> {
    await this.prepareSpeechScene(echo, preserveScene);
    await this.loadVoices();

    try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 60));

    const words = text.split(/\s+/).filter(Boolean);
    const n = words.length;
    let any = false;

    for (let i = 0; i < n; i++) {
      // 0.35 → 1.0 → 0.35 sinüs zarfı × dış ölçek
      const pos = n <= 1 ? 0.5 : i / (n - 1);
      const env = 0.35 + 0.65 * Math.sin(Math.PI * pos);
      const vol = Math.max(0, Math.min(1, env * volume));
      const ok = await this.speakRaw(words[i], lang, rate, vol);
      any = any || ok;
      await new Promise((r) => setTimeout(r, 90));
    }

    this.restoreMaster();
    return any;
  }

  // ── GERÇEK YANKI ─────────────────────────────────────────────
  private ensureEchoChain(profile: EchoProfile): EchoChain {
    if (!this.echoChain && this.ctx) {
      this.echoChain = new EchoChain(this.ctx, profile);
    }
    if (this.echoChain && this.echoChain.currentProfile !== profile) {
      this.echoChain.setProfile(profile);
    }
    return this.echoChain!;
  }

  /**
   * TTS'i AudioBuffer olarak alır, Convolver + ping-pong zincirinden geçirir.
   * Sesin KENDİSİ yankılanır. Endpoint yoksa/başarısızsa Web Speech'e düşer.
   */
  async speakWithRealEcho(
    text: string,
    lang = 'tr-TR',
    rate = 0.92,
    echo: EchoProfile = 'basement',
    endpoint?: string | null,
    volume = 1.0,
    preserveScene = false,
  ): Promise<'echo' | 'fallback' | 'silent'> {
    await this.ensure();
    const ctx = this.ctx!;
    await this.prepareSpeechScene(echo, preserveScene);

    const buffer = await loadTtsBuffer(ctx, text, lang, endpoint);
    if (!buffer) {
      const ok = await this.speakSwell(text, lang, rate, echo, volume, preserveScene);
      return ok ? 'fallback' : 'silent';
    }

    const chain = this.ensureEchoChain(echo);
    await chain.play(buffer, Math.max(0, Math.min(1, volume)));

    this.restoreMaster();
    return 'echo';
  }

  /** Yankı zinciri testi: kelime değil, vokal benzeri örnek */
  async playEchoDemo(echo: EchoProfile = 'basement') {
    await this.ensure();
    const ctx = this.ctx!;
    await this.prepareSpeechScene(echo);
    this.master?.gain.setTargetAtTime(0.30, ctx.currentTime, 0.2);

    const buf = makeEchoDemoBuffer(ctx);
    await this.ensureEchoChain(echo).play(buf, 0.9);

    this.restoreMaster();
  }

  stopEcho() {
    this.echoChain?.stopAll();
  }

  // ── Arka plan (ekran kapalı) zamanlaması ─────────────────────
  /** AudioContext'i garanti eder (kullanıcı jesti sonrası çağrılmalı). */
  async ensureContext(): Promise<AudioContext> {
    await this.ensure();
    return this.ctx!;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  /**
   * TTS buffer'ını Web Audio saatiyle ileri bir ana yerleştirir.
   * setTimeout kısıtlamasından (ekran kapalı / arka plan) etkilenmez.
   */
  scheduleEchoBuffer(buffer: AudioBuffer, when: number, echo: EchoProfile, volume = 1.0, swell = true): number {
    const chain = this.ensureEchoChain(echo);
    return chain.schedule(buffer, when, Math.max(0, Math.min(1, volume)), swell);
  }

  /** Yatağı belirtilen süre boyunca kısar, sonra eski seviyeye döndürür. */
  duckBed(seconds: number) {
    if (!this.master || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.preSpeechMaster = this.master.gain.value || 0.79;
    this.master.gain.cancelScheduledValues(t);
    // Konuşma netliği: yatak %30 → %22 (maskeleme azalır, aksan duyulur)
    this.master.gain.setTargetAtTime(0.22, t, 0.2);
    this.master.gain.setTargetAtTime(this.preSpeechMaster, t + Math.max(0.3, seconds), 0.8);
  }

  // Ses listesini garantiye al (Chrome'da ilk çağrıda boş döner)
  private voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
  private loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof speechSynthesis === 'undefined') return Promise.resolve([]);
    const existing = speechSynthesis.getVoices();
    if (existing.length) return Promise.resolve(existing);
    if (this.voicesReady) return this.voicesReady;

    this.voicesReady = new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        speechSynthesis.onvoiceschanged = null;
        resolve(speechSynthesis.getVoices());
      };
      speechSynthesis.onvoiceschanged = finish;
      setTimeout(finish, 1200); // güvenlik zaman aşımı
    });
    return this.voicesReady;
  }
}

export const engine = new HypnoEngine();
