// Vercel Edge Function — TTS proxy
// /api/tts?text=merhaba&lang=tr  → audio/mpeg
// Amaç: tarayıcıda CORS'a takılmadan TTS sesini AudioBuffer'a alabilmek.

export const config = { runtime: 'edge' };

const MAX_CHARS = 190;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });
}

async function tryGoogle(text: string, lang: string): Promise<Response | null> {
  const url =
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
      Accept: 'audio/mpeg,*/*',
    },
  });

  if (!res.ok) return null;
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('audio') && !type.includes('mpeg')) return null;
  return res;
}

async function tryStreamElements(text: string, lang: string): Promise<Response | null> {
  const voiceByLang: Record<string, string> = {
    tr: 'Filiz', en: 'Brian', de: 'Vicki', fr: 'Céline',
    es: 'Conchita', it: 'Carla', ja: 'Mizuki', pt: 'Vitoria', ru: 'Tatyana',
  };
  const voice = voiceByLang[lang] ?? 'Brian';
  const url =
    'https://api.streamelements.com/kappa/v2/speech' +
    `?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;

  const res = await fetch(url, { headers: { Accept: 'audio/mpeg,*/*' } });
  if (!res.ok) return null;
  return res;
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('text') ?? '').trim();
  const lang = (searchParams.get('lang') ?? 'en').split('-')[0].toLowerCase();

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
  const text = raw.slice(0, MAX_CHARS);

  try {
    const audio = (await tryGoogle(text, lang)) ?? (await tryStreamElements(text, lang));
    if (!audio) return json(502, { error: 'TTS sağlayıcı yanıt vermedi' });

    const bytes = await audio.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'public, max-age=86400',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}
