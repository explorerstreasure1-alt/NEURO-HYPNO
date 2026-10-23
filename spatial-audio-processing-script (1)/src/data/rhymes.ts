import { phrasesOf, type Phrase } from './phrases';

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface RhymeSet {
  level: CEFR;
  lines: string[];
  gloss: string[];
}

export const CEFR_ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** CEFR seviyesine göre konuşma hızı (dil uzmanı ayarı) */
export const LEVEL_RATE: Record<CEFR, number> = {
  A1: 0.78,
  A2: 0.85,
  B1: 0.92,
  B2: 0.98,
  C1: 1.02,
};

/**
 * Seviyeye uygun kalıp havuzu.
 * Veri setindeki 6 kalıp zorluk sırasına göre indekslenir:
 * 0-1 temel, 2-3 orta, 4-5 ileri.
 */
const LEVEL_POOL: Record<CEFR, number[]> = {
  A1: [0, 1, 3],
  A2: [0, 1, 2, 3],
  B1: [1, 2, 3, 4],
  B2: [2, 3, 4, 5],
  C1: [3, 4, 5],
};

function pickPool(langId: string, level: CEFR): Phrase[] {
  const all = phrasesOf(langId);
  const idxs = LEVEL_POOL[level] ?? LEVEL_POOL.A1;
  const pool = idxs.map((i) => all[i % all.length]).filter(Boolean);
  return pool.length ? pool : all;
}

/** Her çalıştırmada farklı 4'lü kafiye (tekrarsız satırlar) */
export function generateRhymeSet(langId: string, level: CEFR, seed?: number): RhymeSet {
  const rnd = mulberry32(seed ?? Date.now());
  const pool = pickPool(langId, level);

  const used = new Set<number>();
  const four: Phrase[] = [];
  let guard = 0;
  while (four.length < 4 && guard < 200) {
    guard++;
    const i = Math.floor(rnd() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    four.push(pool[i]);
  }
  // Havuz 4'ten küçükse tekrar doldur
  while (four.length < 4) four.push(pool[four.length % pool.length]);

  return {
    level,
    lines: four.map((p) => p.pattern.replace('___', 'usta')),
    gloss: four.map((p) => p.gloss.replace('___', 'usta')),
  };
}

/** Mini PRNG — deterministik tekrar üretim */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
