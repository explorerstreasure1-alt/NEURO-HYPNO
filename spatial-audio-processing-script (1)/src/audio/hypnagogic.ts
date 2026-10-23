// Yarı uyku / uyanıklık hâli için frekans şablonu
export type SleepPhase = 'wake' | 'drowsy' | 'hypnagogic' | 'light';

export interface PhaseConfig {
  theta: number;      // 4-7 Hz
  binauralBase: number;
  wet: number;
  whisperGain: number;
  binauralGain: number;
  masterGain: number;
}

export const PHASE_MAP: Record<SleepPhase, PhaseConfig> = {
  wake:      { theta: 10, binauralBase: 200, wet: 25, whisperGain: 20, binauralGain: 15, masterGain: 85 },
  drowsy:    { theta: 8,  binauralBase: 200, wet: 35, whisperGain: 40, binauralGain: 30, masterGain: 85 },
  hypnagogic:{ theta: 6,  binauralBase: 200, wet: 50, whisperGain: 60, binauralGain: 45, masterGain: 88 },
  light:     { theta: 4.5,binauralBase: 196, wet: 60, whisperGain: 70, binauralGain: 55, masterGain: 90 },
};

export function getPhaseConfig(phase: SleepPhase): PhaseConfig {
  return PHASE_MAP[phase];
}

// Yavaş frekans kaydırma: hedefe 90 sn'de var
export function rampToPhase(engine:any, target: SleepPhase, durationSec=90){
  const cfg = PHASE_MAP[target];
  const t = engine.ctx?.currentTime ?? 0;
  engine.update({
    wet: cfg.wet,
    whisperGain: cfg.whisperGain,
    binauralGain: cfg.binauralGain,
    masterGain: cfg.masterGain,
  });
  engine.setEntrainment(cfg.theta, 0.9);
  // binauralBase yavaş kaydırma
  // motor içinde hedef frekansa setTargetAtTime yapılır
}
