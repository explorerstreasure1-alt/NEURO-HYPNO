// Ses / aksan politikası — tek doğruluk kaynağı.
//
// KURAL: Bir dilin metni ASLA başka bir dilin sesiyle okunmaz.
// Türkçe varsayılan sesle İngilizce okumak "aksan" değil, yanlış telaffuzdur.
// Ana dili sesi yoksa: önce HTTP TTS (Google/StreamElements) denenir,
// o da yoksa okuma atlanır ve kullanıcıya açıkça söylenir.

export const LOCALE: Record<string, string> = {
  TR: 'tr-TR',
  EN: 'en-US',
  ES: 'es-ES',
  FR: 'fr-FR',
  DE: 'de-DE',
  IT: 'it-IT',
  JP: 'ja-JP',
  PT: 'pt-PT',
  RU: 'ru-RU',
  AR: 'ar-SA',
  NL: 'nl-NL',
  PL: 'pl-PL',
  KO: 'ko-KR',
  ZH: 'zh-CN',
};

export function localeOf(langIdOrTag: string): string {
  if (!langIdOrTag) return 'en-US';
  if (langIdOrTag.includes('-') || langIdOrTag.includes('_')) return langIdOrTag.replace('_', '-');
  return LOCALE[langIdOrTag.toUpperCase()] ?? 'en-US';
}

function norm(tag: string): string {
  return (tag || '').replace('_', '-').toLowerCase();
}

function qualityScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (n.includes('google')) s += 50;
  if (n.includes('natural') || n.includes('neural')) s += 45;
  if (n.includes('microsoft')) s += 20;
  if (n.includes('siri')) s += 30;
  if (n.includes('espeak') || n.includes('compact') || n.includes('pico')) s -= 80;
  if (!v.localService) s += 15; // ağ sesleri genelde daha doğal
  return s;
}

export function allVoices(): SpeechSynthesisVoice[] {
  try {
    if (typeof speechSynthesis === 'undefined') return [];
    return speechSynthesis.getVoices() ?? [];
  } catch {
    return [];
  }
}

/** Verilen dil etiketi için ana dili sesi. Yoksa null (asla başka dilin sesi). */
export function pickNativeVoice(langTag: string): SpeechSynthesisVoice | null {
  const target = norm(localeOf(langTag));
  const base = target.split('-')[0];
  const voices = allVoices();
  if (voices.length === 0) return null;

  const exact = voices.filter((v) => norm(v.lang) === target);
  const sameLang = voices.filter((v) => norm(v.lang).split('-')[0] === base);
  const pool = exact.length ? exact : sameLang;
  if (pool.length === 0) return null;

  return [...pool].sort((a, b) => qualityScore(b) - qualityScore(a))[0];
}

export function nativeVoiceName(langTag: string): string | null {
  const v = pickNativeVoice(langTag);
  return v ? `${v.name} (${v.lang})` : null;
}

export function hasNativeVoice(langTag: string): boolean {
  return pickNativeVoice(langTag) != null;
}

/** Aynı dil ailesinden olsa bile yanlış aksan riski olan etiketleri ayıkla. */
export function isNativeTag(voiceLang: string, targetTag: string): boolean {
  return norm(localeOf(voiceLang)).split('-')[0] === norm(localeOf(targetTag)).split('-')[0];
}

/** Android köprüsü var mı? */
export function androidTts(): any {
  const b = (globalThis as any)?.AndroidBridge;
  return b && typeof b.speak === 'function' ? b : null;
}

export function androidHasLanguage(langTag: string): boolean {
  const b = androidTts();
  if (!b || typeof b.isLanguageAvailable !== 'function') return false;
  try {
    return !!b.isLanguageAvailable(localeOf(langTag));
  } catch {
    return false;
  }
}
