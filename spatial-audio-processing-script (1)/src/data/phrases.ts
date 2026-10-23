// Geriye dönük uyumluluk katmanı.
// Asıl CEFR verisi lexicon.ts içinde. Burada eski API korunur.

import {
  CEFR_ORDER,
  LANG_NAMES,
  LEVEL_TR,
  LEVEL_RATE,
  BANKS,
  wordsOf,
  phraseBankOf,
  coverageReport,
  type CEFR,
} from './lexicon';

export { CEFR_ORDER, LANG_NAMES, LEVEL_TR, LEVEL_RATE, wordsOf, phraseBankOf, coverageReport };
export type { CEFR };

export interface Phrase {
  pattern: string;
  gloss: string;
  note: string;
}

export interface PhraseSet {
  langId: string;
  phrases: Phrase[];
}

const toPhrase = (lang: string, level: string, text: string, gloss: string): Phrase => ({
  pattern: text,
  gloss,
  note: `${LANG_NAMES[lang] ?? lang} · ${level} · ${LEVEL_TR[level as CEFR] ?? ''}`,
});

/** Seviye verilirse o seviyenin kalıpları, verilmezse tüm seviyeler */
export function phrasesOf(langId: string, level?: CEFR): Phrase[] {
  const bank = BANKS[langId] ?? BANKS.EN;
  if (level) {
    return bank.phrases[level].map((e) => toPhrase(langId, level, e.text, e.gloss));
  }
  return CEFR_ORDER.flatMap((lv) =>
    bank.phrases[lv].map((e) => toPhrase(langId, lv, e.text, e.gloss)),
  );
}

/** Tüm dillerin tüm seviyeleri */
export const PHRASE_SETS: PhraseSet[] = Object.keys(BANKS).map((langId) => ({
  langId,
  phrases: phrasesOf(langId),
}));

export const WHISPER_DELAY_SEC = 600;
export const WHISPER_RAMP_SEC = 600;
export const WHISPER_DELAY_MIN_TAIL_SEC = 120;
