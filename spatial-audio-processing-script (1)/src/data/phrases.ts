// ============================================================
// CÜMLE KALIPLARI — Gecikmeli fısıltı fazında (10. dakikadan sonra)
// "okunan" yabancı dil cümle kalıpları. Sesli motor bunları gerçek TTS
// olarak değil, fısıltılı/yankılı prozodi deseni olarak temsil eder;
// bu liste kullanıcıya NE'nin fısıldandığını metinle gösterir.
// ============================================================

export interface Phrase {
  pattern: string; // hedef dilde cümle kalıbı
  gloss: string; // Türkçe anlamı
  note: string; // yapı/kullanım notu
}

export interface PhraseSet {
  langId: string;
  phrases: Phrase[];
}

export const PHRASE_SETS: PhraseSet[] = [
  {
    langId: 'ES',
    phrases: [
      { pattern: 'Me gustaría ___', gloss: '___ isterdim', note: 'Nazik istek kalıbı' },
      { pattern: '¿Dónde está ___?', gloss: '___ nerede?', note: 'Yer sorma kalıbı' },
      { pattern: 'Creo que ___', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı' },
      { pattern: 'Voy a ___', gloss: '___ yapacağım', note: 'Yakın gelecek kalıbı' },
      { pattern: '¿Puedes ayudarme con ___?', gloss: '___ konusunda yardım eder misin?', note: 'Rica kalıbı' },
      { pattern: 'Hace tiempo que ___', gloss: 'Uzun zamandır ___', note: 'Süre anlatma kalıbı' },
    ],
  },
  {
    langId: 'FR',
    phrases: [
      { pattern: "J'aimerais ___", gloss: '___ isterdim', note: 'Nazik istek kalıbı' },
      { pattern: 'Où se trouve ___?', gloss: '___ nerede bulunuyor?', note: 'Yer sorma kalıbı' },
      { pattern: 'Je pense que ___', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı' },
      { pattern: 'Je vais ___', gloss: '___ yapacağım', note: 'Yakın gelecek kalıbı' },
      { pattern: 'Pourriez-vous ___?', gloss: '___ yapabilir misiniz?', note: 'Kibar rica kalıbı' },
      { pattern: 'Cela fait longtemps que ___', gloss: 'Uzun zamandır ___', note: 'Süre anlatma kalıbı' },
    ],
  },
  {
    langId: 'EN',
    phrases: [
      { pattern: 'I would like to ___', gloss: '___ istiyorum', note: 'Nazik istek kalıbı' },
      { pattern: 'Where is the nearest ___?', gloss: 'En yakın ___ nerede?', note: 'Yer sorma kalıbı' },
      { pattern: 'I think that ___', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı' },
      { pattern: "I'm going to ___", gloss: '___ yapacağım', note: 'Yakın gelecek kalıbı' },
      { pattern: 'Could you help me with ___?', gloss: '___ konusunda yardım eder misiniz?', note: 'Rica kalıbı' },
      { pattern: "It's been a while since ___", gloss: 'Uzun zamandır ___', note: 'Süre anlatma kalıbı' },
    ],
  },
  {
    langId: 'DE',
    phrases: [
      { pattern: 'Ich hätte gern ___', gloss: '___ isterdim', note: 'Nazik istek kalıbı' },
      { pattern: 'Wo ist ___?', gloss: '___ nerede?', note: 'Yer sorma kalıbı' },
      { pattern: 'Ich glaube, dass ___', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı' },
      { pattern: 'Ich werde ___', gloss: '___ yapacağım', note: 'Gelecek zaman kalıbı' },
      { pattern: 'Könnten Sie mir mit ___ helfen?', gloss: '___ konusunda bana yardım eder misiniz?', note: 'Kibar rica kalıbı' },
      { pattern: 'Es ist schon lange her, dass ___', gloss: 'Uzun zamandır ___', note: 'Süre anlatma kalıbı' },
    ],
  },
  {
    langId: 'IT',
    phrases: [
      { pattern: 'Vorrei ___', gloss: '___ isterdim', note: 'Nazik istek kalıbı' },
      { pattern: 'Dov\'è ___?', gloss: '___ nerede?', note: 'Yer sorma kalıbı' },
      { pattern: 'Penso che ___', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı' },
      { pattern: 'Sto per ___', gloss: '___ yapmak üzereyim', note: 'Yakın gelecek kalıbı' },
      { pattern: 'Potresti aiutarmi con ___?', gloss: '___ konusunda bana yardım eder misin?', note: 'Rica kalıbı' },
      { pattern: 'È da tanto che ___', gloss: 'Uzun zamandır ___', note: 'Süre anlatma kalıbı' },
    ],
  },
  {
    langId: 'JP',
    phrases: [
      { pattern: '___ がほしいです', gloss: '___ istiyorum', note: 'İstek kalıbı (~ga hoshii desu)' },
      { pattern: '___ はどこですか', gloss: '___ nerede?', note: 'Yer sorma kalıbı (~wa doko desu ka)' },
      { pattern: '___ と思います', gloss: 'Bence ___', note: 'Fikir bildirme kalıbı (~to omoimasu)' },
      { pattern: '___ つもりです', gloss: '___ yapmayı planlıyorum', note: 'Niyet kalıbı (~tsumori desu)' },
      { pattern: '___ を手伝ってくれますか', gloss: '___ konusunda yardım eder misin?', note: 'Rica kalıbı (~o tetsudatte)' },
      { pattern: 'ずっと ___', gloss: 'Uzun zamandır ___', note: 'Süreklilik kalıbı (zutto ~)' },
    ],
  },
];

export function phrasesOf(langId: string): Phrase[] {
  return PHRASE_SETS.find((p) => p.langId === langId)?.phrases ?? PHRASE_SETS[0].phrases;
}

// Gecikmeli fısıltı: 10. dakikada neredeyse sessizden devreye girer,
// sonraki 10 dakika boyunca yavaşça tam ritmik seviyeye yükselir.
// Böylece standart akış: 0-10dk sessiz frekans inişi, 10-20dk fısıltı rampası.
export const WHISPER_DELAY_SEC = 600;
export const WHISPER_RAMP_SEC = 600;
// Çok kısa seanslarda (ör. 10dk şekerleme) orantılı küçültme payı.
export const WHISPER_DELAY_MIN_TAIL_SEC = 120; // en az bu kadar fısıltı süresi kalsın
