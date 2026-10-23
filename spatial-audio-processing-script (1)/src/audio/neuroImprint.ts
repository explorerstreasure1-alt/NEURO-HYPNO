import { engine } from './engine';
import { generateRhymeSet, LEVEL_RATE, type CEFR } from '../data/rhymes';
import { rampToPhase } from './hypnagogic';
import { getEndpoint } from './ttsSettings';
import type { EchoProfile } from './echoChain';

export type ImprintMode = 'words' | 'sentences' | 'both';

export interface ImprintOptions {
  langId?: string;
  level?: CEFR;
  mode?: ImprintMode;
  setDurationMin?: number; // her 4'lü setin süresi
  echo?: EchoProfile;
  realEcho?: boolean;      // TTS → Convolver (gerçek yankı)
  onSet?: (info: { index: number; lines: string[]; level: CEFR }) => void;
  onMode?: (mode: 'echo' | 'fallback') => void;
}

const LANG_MAP: Record<string, string> = {
  ES: 'es-ES', FR: 'fr-FR', EN: 'en-US', DE: 'de-DE', IT: 'it-IT', JP: 'ja-JP',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runToken = 0;

/** Devam eden imprint döngüsünü durdurur */
export function stopNeuroImprint() {
  runToken++;
  speechSynthesis?.cancel();
  engine.setWhisperOn(false);
}

export async function startNeuroImprint(opts: ImprintOptions = {}) {
  const {
    langId = 'EN',
    level = 'A1',
    mode = 'both',
    setDurationMin = 42,
    echo = 'basement',
    realEcho = true,
    onSet,
    onMode,
  } = opts;

  const endpoint = getEndpoint();
  const useReal = realEcho && !!endpoint;

  const myToken = ++runToken;

  // 1) Bedeni uyut, beyni theta'da tut
  await rampToPhase(engine, 'hypnagogic', 60);
  if (myToken !== runToken) return;

  // 2) Net, yankılı okuma ayarları
  engine.update({ wet: 45, highCut: 7000, whisperGain: 0, binauralGain: 10, masterGain: 88 });

  const lang = LANG_MAP[langId] ?? 'en-US';
  const rate = LEVEL_RATE[level] ?? 0.85;

  let index = 0;
  while (myToken === runToken) {
    index++;
    const set = generateRhymeSet(langId, level, Date.now() + index * 7919);
    onSet?.({ index, lines: set.lines, level });

    const lines =
      mode === 'sentences' ? set.lines :
      mode === 'words' ? set.lines.slice(0, 2) :
      set.lines;

    // Okuma turu: satırlar arası nefes payı
    for (const line of lines) {
      if (myToken !== runToken) return;

      if (useReal) {
        // Gerçek yankı; endpoint çökerse engine kendi içinde Web Speech'e düşer
        const used = await engine.speakWithRealEcho(line, lang, rate, echo, endpoint);
        onMode?.(used);
      } else {
        await engine.speakSwell(line, lang, rate, echo);
      }

      await sleep(2600);
    }

    // Set arası bekleme (42 dk)
    const totalWait = setDurationMin * 60 * 1000;
    const waited = await interruptibleSleep(totalWait, () => myToken !== runToken);
    if (waited) return;
  }
}

function interruptibleSleep(ms: number, shouldStop: () => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (shouldStop()) return resolve(true);
      if (Date.now() - start >= ms) return resolve(false);
      setTimeout(tick, 1000);
    };
    tick();
  });
}
