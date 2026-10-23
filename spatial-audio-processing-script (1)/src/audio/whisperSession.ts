// 10. dakikada devreye giren "gerçek sesli fısıltı" okuyucusu.
// Ana seansın (teta + binaural) parametrelerine DOKUNMAZ; sadece konuşma
// sırasında yatağı kısar. Seçilen dilin CEFR havuzundan 4'lü set üretir,
// her satırı varsayılan 3 kez yankılı okur.
//
// EKRAN KAPALI / ARKA PLAN:
//   Gerçek yankı yolunda ses, Web Audio saatiyle (AudioBufferSourceNode.start(when))
//   önceden zamanlanır. Böylece setTimeout kısıtlaması olsa bile okuma sürer.

import { engine } from './engine';
import { loadTtsBuffer } from './tts';
import { generateRhymeSet, generateWordSet, LEVEL_RATE, type CEFR } from '../data/rhymes';
import type { EchoProfile } from './echoChain';
import type { ImprintMode } from './neuroImprint';

export interface WhisperSessionOptions {
  langId: string;
  level?: CEFR;
  mode?: ImprintMode;
  repeat?: number;
  echo?: EchoProfile;
  endpoint?: string | null;
  /** 0-1 arası anlık ses ölçeği (10 dk rampası) */
  getVolume?: () => number;
  onLine?: (info: { line: string; gloss: string; index: number; real: boolean }) => void;
}

export const TTS_LANG: Record<string, string> = {
  EN: 'en-US',
  ES: 'es-ES',
  FR: 'fr-FR',
  DE: 'de-DE',
  IT: 'it-IT',
  JP: 'ja-JP',
};

// Dil bazlı kalite ayarı: hız çarpanı + varsayılan yankı profili.
// Uzun/patlayıcı ünsüzlü dillerde daha kısa yankı (stage) daha net duyulur.
export const LANG_TUNING: Record<string, { rateScale: number; echo: EchoProfile }> = {
  EN: { rateScale: 1.0, echo: 'basement' },
  ES: { rateScale: 1.0, echo: 'stage' },
  FR: { rateScale: 0.98, echo: 'stage' },
  DE: { rateScale: 0.94, echo: 'stage' },
  IT: { rateScale: 1.0, echo: 'stage' },
  JP: { rateScale: 0.93, echo: 'stage' },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let token = 0;
let running = false;

export function stopWhisperSession() {
  token++;
  running = false;
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  } catch { /* noop */ }
  engine.stopEcho();
}

export function isWhisperSessionRunning() {
  return running;
}

export async function startWhisperSession(opts: WhisperSessionOptions): Promise<void> {
  stopWhisperSession();

  const my = ++token;
  running = true;

  const {
    langId,
    level = 'A1',
    mode = 'both',
    repeat = 3,
    endpoint = null,
    getVolume = () => 1,
    onLine,
  } = opts;

  const tuning = LANG_TUNING[langId] ?? LANG_TUNING.EN;
  const echo = opts.echo ?? tuning.echo;
  const lang = TTS_LANG[langId] ?? 'en-US';
  const rate = (LEVEL_RATE[level] ?? 0.85) * tuning.rateScale;
  const useReal = !!endpoint;

  let round = 0;
  let lineNo = 0;

  while (my === token) {
    round++;
    const seed = Date.now() + round * 6151;

    const sentenceSet = generateRhymeSet(langId, level, seed);
    const wordSet = generateWordSet(langId, level, seed + 29);

    const set =
      mode === 'words' ? wordSet :
      mode === 'sentences' ? sentenceSet :
      {
        ...sentenceSet,
        lines: [...sentenceSet.lines, ...wordSet.lines],
        gloss: [...sentenceSet.gloss, ...wordSet.gloss],
      };

    if (useReal) {
      const done = await playScheduled(set.lines, set.gloss, {
        my,
        repeat,
        lang,
        rate,
        echo,
        endpoint: endpoint!,
        getVolume,
        onLine,
        nextIndex: () => lineNo++,
      });
      if (done) return;

      // Endpoint hiç çalışmadıysa Web Speech'e düş
      if (!running) return;
      if (my !== token) return;
      await playSpoken(set.lines, set.gloss, {
        my, repeat, lang, rate, echo, getVolume, onLine, nextIndex: () => lineNo++,
      });
    } else {
      await playSpoken(set.lines, set.gloss, {
        my, repeat, lang, rate, echo, getVolume, onLine, nextIndex: () => lineNo++,
      });
    }

    if (my !== token) return;
    await sleep(4000);
  }
}

interface PlayCtx {
  my: number;
  repeat: number;
  lang: string;
  rate: number;
  echo: EchoProfile;
  getVolume: () => number;
  onLine?: (info: { line: string; gloss: string; index: number; real: boolean }) => void;
  nextIndex: () => number;
}

/**
 * Gerçek yankı + önceden zamanlama.
 * @returns true → oturum durduruldu
 */
async function playScheduled(
  lines: string[],
  gloss: string[],
  p: PlayCtx & { endpoint: string },
): Promise<boolean> {
  const ctx = await engine.ensureContext();
  const t0 = ctx.currentTime;

  type Slot = { line: string; gloss: string; at: number; index: number };
  const slots: Slot[] = [];

  let t = t0 + 0.35;
  let scheduled = 0;

  for (let i = 0; i < lines.length; i++) {
    if (p.my !== token) return true;

    const line = lines[i];
    const gl = gloss[i] ?? '';

    for (let r = 0; r < p.repeat; r++) {
      if (p.my !== token) return true;

      const buf = await loadTtsBuffer(ctx, line, p.lang, p.endpoint);
      if (!buf) {
        // İlk satır bile gelmediyse çağıran taraf Web Speech'e düşer
        if (scheduled === 0) return false;
        break;
      }

      const when = Math.max(t, ctx.currentTime + 0.12);
      const vol = Math.max(0.10, Math.min(1, p.getVolume()));
      const dur = engine.scheduleEchoBuffer(buf, when, p.echo, vol);

      if (r === 0) slots.push({ line, gloss: gl, at: when, index: p.nextIndex() });

      t = when + dur + (r < p.repeat - 1 ? 0.75 : 2.4);
      scheduled++;

      // Yatağı konuşma boyunca kıs (her birkaç satırda bir uzat)
      if (scheduled === 1 || scheduled % 4 === 0) {
        engine.duckBed(Math.max(20, t - ctx.currentTime + 1.5));
      }
    }
  }

  if (scheduled === 0) return false;

  const total = Math.max(0.5, t - ctx.currentTime);
  engine.duckBed(total + 1.0);

  // UI takibi: gerçek zamana göre hangi satır çalıyor
  let cursor = 0;
  while (p.my === token && engine.getContext() === ctx) {
    const now = ctx.currentTime;
    while (cursor < slots.length && slots[cursor].at <= now) {
      p.onLine?.({ line: slots[cursor].line, gloss: slots[cursor].gloss, index: slots[cursor].index, real: true });
      cursor++;
    }
    if (cursor >= slots.length && now >= t) break;
    await sleep(400);
  }

  return p.my !== token;
}

/** Web Speech ile sıralı okuma (endpoint yoksa / çökerse) */
async function playSpoken(lines: string[], gloss: string[], p: PlayCtx): Promise<void> {
  for (let i = 0; i < lines.length; i++) {
    if (p.my !== token) return;

    const line = lines[i];
    const gl = gloss[i] ?? '';
    p.onLine?.({ line, gloss: gl, index: p.nextIndex(), real: false });

    for (let r = 0; r < p.repeat; r++) {
      if (p.my !== token) return;

      // Android'de çok düşük volume tamamen sessize alınabilir → alt sınır.
      const vol = Math.max(0.10, Math.min(1, p.getVolume()));
      await engine.speakSwell(line, p.lang, p.rate, p.echo, vol, true);

      if (p.my !== token) return;
      await sleep(750);
    }

    if (p.my !== token) return;
    await sleep(2400);
  }
}
