import { engine } from './engine';
import { generateRhymeSet, generateWordSet, LEVEL_RATE, type CEFR } from '../data/rhymes';
import { rampToPhase } from './hypnagogic';
import { getEndpoint } from './ttsSettings';
import type { EchoProfile } from './echoChain';

export type ImprintMode = 'words' | 'sentences' | 'both';

export interface ImprintOptions {
  langId?: string;
  level?: CEFR;
  mode?: ImprintMode;
  setDurationMin?: number; // her setin süresi (dk)
  repeat?: number;         // her satır kaç kez okunur (varsayılan 3)
  echo?: EchoProfile;
  realEcho?: boolean;      // TTS → Convolver (gerçek yankı)
  onSet?: (info: { index: number; lines: string[]; gloss: string[]; level: CEFR }) => void;
  onMode?: (mode: 'echo' | 'fallback' | 'silent') => void;
}

const LANG_MAP: Record<string, string> = {
  ES: 'es-ES', FR: 'fr-FR', EN: 'en-US', DE: 'de-DE', IT: 'it-IT', JP: 'ja-JP',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runToken = 0;

/** Devam eden imprint döngüsünü durdurur */
export function stopNeuroImprint() {
  runToken++;
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  engine.setWhisperOn(false);
  engine.stopEcho();
}

export async function startNeuroImprint(opts: ImprintOptions = {}) {
  const {
    langId = 'EN',
    level = 'A1',
    mode = 'both',
    setDurationMin = 42,
    repeat = 3,
    echo = 'basement',
    realEcho = true,
    onSet,
    onMode,
  } = opts;

  const endpoint = getEndpoint();
  const useReal = realEcho;

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
    const seed = Date.now() + index * 7919;

    const sentenceSet = generateRhymeSet(langId, level, seed);
    const wordSet = generateWordSet(langId, level, seed + 13);

    const set =
      mode === 'words' ? wordSet :
      mode === 'sentences' ? sentenceSet :
      { ...sentenceSet, lines: [...sentenceSet.lines, ...wordSet.lines], gloss: [...sentenceSet.gloss, ...wordSet.gloss] };

    onSet?.({ index, lines: set.lines, gloss: set.gloss, level });

    // Her satır `repeat` kez okunur (varsayılan 3)
    for (const line of set.lines) {
      if (myToken !== runToken) return;

      for (let r = 0; r < repeat; r++) {
        if (myToken !== runToken) return;

        if (useReal) {
          const used = await engine.speakWithRealEcho(line, lang, rate, echo, endpoint);
          onMode?.(used);
          if (used === 'silent') return; // yanlış aksanla okumak yerine dur
        } else {
          const ok = await engine.speakSwell(line, lang, rate, echo);
          if (!ok) {
            onMode?.('silent');
            return; // ana dili sesi yok → sessiz döngü yerine dur
          }
        }

        await sleep(700); // tekrarlar arası kısa nefes
      }

      await sleep(2200); // satırlar arası
    }

    // Set arası bekleme
    const waited = await interruptibleSleep(setDurationMin * 60 * 1000, () => myToken !== runToken);
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
