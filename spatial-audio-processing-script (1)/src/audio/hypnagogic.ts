// Yarı uyku / uyanıklık hâli için frekans şablonu
export type SleepPhase = 'wake' | 'drowsy' | 'hypnagogic' | 'light';

export interface PhaseConfig {
  theta: number;        // hedef binaural beat (Hz)
  binauralBase: number; // taşıyıcı (Hz)
  wet: number;
  whisperGain: number;
  binauralGain: number;
  masterGain: number;
}

export const PHASE_MAP: Record<SleepPhase, PhaseConfig> = {
  wake:       { theta: 10,  binauralBase: 200, wet: 25, whisperGain: 20, binauralGain: 15, masterGain: 85 },
  drowsy:     { theta: 8,   binauralBase: 200, wet: 35, whisperGain: 40, binauralGain: 30, masterGain: 85 },
  hypnagogic: { theta: 6,   binauralBase: 200, wet: 50, whisperGain: 45, binauralGain: 40, masterGain: 88 },
  light:      { theta: 2.5, binauralBase: 196, wet: 60, whisperGain: 55, binauralGain: 50, masterGain: 90 },
};

export function getPhaseConfig(phase: SleepPhase): PhaseConfig {
  return PHASE_MAP[phase];
}

/**
 * Hedef faza yumuşak geçiş.
 * engine.ensure() çağrılmadan ctx yoksa yalnızca parametreler saklanır.
 */
export async function rampToPhase(engine: any, target: SleepPhase, durationSec = 90) {
  const cfg = PHASE_MAP[target];
  await engine.ensure();

  const ctx = engine.ctx;
  const t = ctx ? ctx.currentTime : 0;

  engine.update({
    wet: cfg.wet,
    whisperGain: cfg.whisperGain,
    binauralGain: cfg.binauralGain,
    masterGain: cfg.masterGain,
    binauralBase: cfg.binauralBase,
  });

  // Beat frekansını hedefe taşı (kademeli)
  engine.setEntrainment(cfg.theta, 0.8);

  // Taşıyıcıyı da yumuşakça kaydır
  const oscL = engine.oscL;
  const oscR = engine.oscR;
  if (ctx && oscL && oscR && durationSec > 0) {
    const tc = Math.min(10, durationSec / 6);
    oscL.frequency.setTargetAtTime(cfg.binauralBase, t, tc);
    oscR.frequency.setTargetAtTime(cfg.binauralBase + cfg.theta, t, tc);
  }
}
