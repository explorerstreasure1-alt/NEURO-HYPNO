// Vercel Edge Function — TTS proxy
// /api/tts?text=merhaba&lang=tr  → audio/mpeg
// Amaç: tarayıcıda CORS'a takılmadan TTS sesini AudioBuffer'a alabilmek.
//
// AKSAN KURALI (dil uzmanı + nörobilim):
//   Her dil KENDİ ana dili konuşuruyla okunur. İngilizce ses ile İspanyolca
//   okumak "yabancı aksan" değil, yanlış telaffuz üretir. Bu yüzden bilinmeyen
//   dilde İngilizce sese DÜŞÜLMEZ; sağlayıcı atlanır.

export const config = { runtime: 'edge' };

const MAX_CHARS = 190;

// Desteklenen diller → sağlayıcı parametreleri
const LANGS: Record<string, { google: string; seVoice: string; label: string }> = {
  tr: { google: 'tr', seVoice: 'Filiz', label: 'Türkçe' },
  en: { google: 'en', seVoice: 'Brian', label: 'English' },
  es: { google: 'es', seVoice: 'Conchita', label: 'Español' },
  fr: { google: 'fr', seVoice: 'Céline', label: 'Français' },
  de: { google: 'de', seVoice: 'Vicki', label: 'Deutsch' },
  it: { google: 'it', seVoice: 'Carla', label: 'Italiano' },
  ja: { google: 'ja', seVoice: 'Mizuki', label: '日本語' },
  pt: { google: 'pt', seVoice: 'Vitoria', label: 'Português' },
  ru: { google: 'ru', seVoice: 'Tatyana', label: 'Русский' },
  ar: { google: 'ar', seVoice: '', label: 'العربية' },
  nl: { google: 'nl', seVoice: '', label: 'Nederlands' },
  pl: { google: 'pl', seVoice: '', label: 'Polski' },
  ko: { google: 'ko', seVoice: '', label: '한국어' },
  zh: { google: 'zh-CN', seVoice: '', label: '中文' },
};

function normalizeLang(raw: string): string {
  const base = (raw || '').toLowerCase().split('-')[0];
  // AKSAN KURALI: desteklenmeyen dilde İngilizceye düşmek yok.
  return LANGS[base] ? base : '';
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });
}

async function tryGoogle(text: string, lang: string, attempt = 0): Promise<Response | null> {
  const L = LANGS[lang];
  const qs = new URLSearchParams({
    ie: 'UTF-8',
    client: 'tw-ob',
    tl: L.google,
    q: text,
    ttsspeed: '0.92', // doğal ama net; A1 için istemci tarafında ayrıca yavaşlatılıyor
  });

  const res = await fetch(`https://translate.google.com/translate_tts?${qs.toString()}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
      Accept: 'audio/mpeg,*/*',
    },
  });

  if (!res.ok) {
    // Geçici 429/5xx → bir kez daha dene
    if (attempt < 1 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 260));
      return tryGoogle(text, lang, attempt + 1);
    }
    return null;
  }
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('audio') && !type.includes('mpeg')) return null;
  return res;
}

async function tryStreamElements(text: string, lang: string): Promise<Response | null> {
  const voice = LANGS[lang].seVoice;
  if (!voice) return null; // o dilde ana dili sesi yok → yanlış aksanla okumaktansa atla

  const url =
    'https://api.streamelements.com/kappa/v2/speech' +
    `?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;

  // Sağlayıcı ölmüş olabilir (401) — 3.5 sn'den fazla bekletme.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch(url, { headers: { Accept: 'audio/mpeg,*/*' }, signal: ctrl.signal });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('text') ?? '').trim();
  const lang = normalizeLang(searchParams.get('lang') ?? 'en');

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,OPTIONS',
        'access-control-allow-headers': '*',
      },
    });
  }

  if (!raw) return json(400, { error: 'text gerekli' });
  if (!lang) return json(400, { error: 'desteklenmeyen dil — yanlış aksanla okumamak için atlandı' });
  const text = raw.slice(0, MAX_CHARS);

  try {
    const audio = (await tryGoogle(text, lang)) ?? (await tryStreamElements(text, lang));
    if (!audio) return json(502, { error: 'TTS sağlayıcı yanıt vermedi', lang });

    const bytes = await audio.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'public, max-age=86400, immutable',
        'access-control-allow-origin': '*',
        'x-tts-lang': lang,
        'x-tts-voice': LANGS[lang].label,
      },
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}
