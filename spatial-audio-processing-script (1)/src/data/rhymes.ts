import {
  CEFR_ORDER,
  LEVEL_RATE,
  wordsOf,
  phraseBankOf,
  type CEFR,
  type Entry,
} from './lexicon';

export { CEFR_ORDER, LEVEL_RATE };
export type { CEFR, Entry };

export interface RhymeSet {
  level: CEFR;
  lines: string[];
  gloss: string[];
  words: string[];
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickUnique<T>(arr: T[], count: number, rnd: () => number): T[] {
  if (arr.length === 0) return [];
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < count) {
    if (pool.length === 0) pool.push(...arr); // havuz küçükse başa dön
    const i = Math.floor(rnd() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

/**
 * Her çalıştırmada farklı 4'lü set.
 * Kalıplar seviyeye uygun; boşluklar aynı seviyenin kelimeleriyle doldurulur.
 */
export function generateRhymeSet(langId: string, level: CEFR, seed?: number): RhymeSet {
  const rnd = mulberry32(seed ?? Date.now());

  const phrases = pickUnique(phraseBankOf(langId, level), 4, rnd);
  const words = pickUnique(wordsOf(langId, level), 4, rnd);

  const lines = phrases.map((p: Entry, i) => {
    const w = words[i % words.length];
    return p.text.includes('___') ? p.text.replace('___', w.text) : `${p.text} · ${w.text}`;
  });

  const gloss = phrases.map((p: Entry, i) => {
    const w = words[i % words.length];
    return p.gloss.includes('___') ? p.gloss.replace('___', w.gloss) : `${p.gloss} · ${w.gloss}`;
  });

  return { level, lines, gloss, words: words.map((w) => w.text) };
}

/** Sadece kelime modu için 4'lü set */
export function generateWordSet(langId: string, level: CEFR, seed?: number): RhymeSet {
  const rnd = mulberry32(seed ?? Date.now());
  const words = pickUnique(wordsOf(langId, level), 4, rnd);
  return {
    level,
    lines: words.map((w) => w.text),
    gloss: words.map((w) => w.gloss),
    words: words.map((w) => w.text),
  };
}
