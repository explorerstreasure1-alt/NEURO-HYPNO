// TTS sesini AudioBuffer'a çevirir. Böylece ses ConvolverNode'dan geçebilir.
// Sağlayıcı, VITE_TTS_ENDPOINT ile yapılandırılır:
//   https://senin-api.vercel.app/api/tts?text={text}&lang={lang}
// Endpoint yoksa veya hata verirse null döner (çağıran taraf Web Speech'e düşer).
//
// Kalite notları:
//  * Aynı satır 3 kez tekrar okunduğu için buffer CACHE'lenir → ağ gecikmesi yok.
//  * 180 karakterden uzun metinler cümle sınırından parçalanır ve tek buffer'da
//    birleştirilir (Google TTS 200 karakter sınırı).
//  * Endpoint'te {text}/{lang} yoksa sorgu parametresi olarak eklenir.

const DEFAULT_TIMEOUT = 6500;
const MAX_CHARS = 180;
const CHUNK_GAP_SEC = 0.12;

export function getTtsEndpoint(): string | null {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
    return env.VITE_TTS_ENDPOINT?.trim() || null;
  } catch {
    return null;
  }
}

function buildUrl(endpoint: string, text: string, lang: string): string {
  const hasText = endpoint.includes('{text}');
  const hasLang = endpoint.includes('{lang}');
  let url = endpoint
    .replace('{text}', encodeURIComponent(text))
    .replace('{lang}', encodeURIComponent(lang));

  if (!hasText || !hasLang) {
    const sep = url.includes('?') ? '&' : '?';
    if (!hasText) url += `${sep}text=${encodeURIComponent(text)}`;
    if (!hasLang) url += `${url.includes('?') ? '&' : '?'}lang=${encodeURIComponent(lang)}`;
  }
  return url;
}

/** Uzun metni cümle/kelime sınırından parçalar (TTS karakter limiti). */
export function splitForTts(text: string, max = MAX_CHARS): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean ? [clean] : [];

  // 1) cümlelere böl
  const sentences = clean.match(/[^.!?…;]+[.!?…;]*/g) ?? [clean];
  const out: string[] = [];
  let cur = '';

  const pushCur = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = '';
  };

  for (const s of sentences) {
    const part = s.trim();
    if (!part) continue;
    if ((cur + ' ' + part).trim().length <= max) {
      cur = cur ? `${cur} ${part}` : part;
      continue;
    }
    pushCur();
    if (part.length <= max) {
      cur = part;
    } else {
      // 2) hâlâ uzun → kelimelere böl
      for (const w of part.split(' ')) {
        if ((cur + ' ' + w).trim().length <= max) {
          cur = cur ? `${cur} ${w}` : w;
        } else {
          pushCur();
          cur = w;
        }
      }
    }
  }
  pushCur();
  return out;
}

function concatBuffers(ctx: AudioContext, parts: AudioBuffer[]): AudioBuffer {
  const channels = Math.min(...parts.map((p) => p.numberOfChannels));
  const gap = Math.floor(ctx.sampleRate * CHUNK_GAP_SEC);
  const total = parts.reduce((n, p) => n + p.length, 0) + gap * Math.max(0, parts.length - 1);

  const out = ctx.createBuffer(Math.max(1, channels), total, ctx.sampleRate);
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    for (let c = 0; c < channels; c++) {
      out.getChannelData(c).set(parts[i].getChannelData(c), offset);
    }
    offset += parts[i].length;
    if (i < parts.length - 1) offset += gap;
  }
  return out;
}

// ── önbellek ──────────────────────────────────────────────────
const cache = new Map<string, AudioBuffer>();
const MAX_CACHE = 80;

export function clearTtsCache() {
  cache.clear();
  endpointDownUntil = 0;
}

// Endpoint çöktüyse her satırda 2×9 sn beklemeyi engelleyen devre kesici
let endpointDownUntil = 0;

export function isTtsAvailable(): boolean {
  return Date.now() >= endpointDownUntil;
}

async function fetchChunk(ctx: AudioContext, endpoint: string, text: string, lang: string): Promise<AudioBuffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(buildUrl(endpoint, text, lang), { signal: controller.signal });
    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength < 512) throw new Error('TTS yanıtı çok kısa');
    return await ctx.decodeAudioData(bytes);
  } catch (e) {
    console.warn('[TTS] parça başarısız:', e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadTtsBuffer(
  ctx: AudioContext,
  text: string,
  lang: string,
  endpointOverride?: string | null,
): Promise<AudioBuffer | null> {
  const endpoint = endpointOverride ?? getTtsEndpoint();
  if (!endpoint) return null;
  if (!isTtsAvailable()) return null;

  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;

  const key = `${lang}::${clean}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const chunks = splitForTts(clean);
  const parts: AudioBuffer[] = [];

  for (const chunk of chunks) {
    const buf = await fetchChunk(ctx, endpoint, chunk, lang);
    if (!buf) {
      // Endpoint'i 60 sn devre dışı bırak → anında Web Speech'e düş
      endpointDownUntil = Date.now() + 60_000;
      return null;
    }
    parts.push(buf);
  }

  if (parts.length === 0) return null;

  const merged = parts.length === 1 ? parts[0] : concatBuffers(ctx, parts);

  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, merged);
  return merged;
}

/**
 * Ağ olmadan yankı zincirini test etmek için kısa bir vokal benzeri buffer.
 * Kelime değildir; sadece "sesin kendisi yankılanıyor" etkisini kanıtlar.
 */
export function makeEchoDemoBuffer(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const dur = 1.6;
  const len = Math.floor(rate * dur);
  const buf = ctx.createBuffer(1, len, rate);
  const d = buf.getChannelData(0);

  // üç hece: "ah - oh - ee" formant yaklaşımı
  const syllables = [
    { start: 0.05, dur: 0.34, f0: 132, f1: 730, f2: 1090 },
    { start: 0.52, dur: 0.34, f0: 118, f1: 570, f2: 840 },
    { start: 0.99, dur: 0.42, f0: 146, f1: 300, f2: 2200 },
  ];

  for (const s of syllables) {
    const a = Math.floor(s.start * rate);
    const b = Math.floor((s.start + s.dur) * rate);
    for (let i = a; i < b && i < len; i++) {
      const t = (i - a) / (b - a);
      const env = Math.sin(Math.PI * t) ** 1.2;
      const time = i / rate;
      // glottal kaynak: harmonik yığın
      let v = 0;
      for (let h = 1; h <= 12; h++) {
        v += Math.sin(2 * Math.PI * s.f0 * h * time) / (h * 1.6);
      }
      // iki formant bölgesi
      const formant =
        Math.sin(2 * Math.PI * s.f1 * time) * 0.35 +
        Math.sin(2 * Math.PI * s.f2 * time) * 0.18;
      d[i] = (v * 0.5 + formant) * env * 0.28;
    }
  }

  // normalize
  let peak = 0.0001;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(d[i]));
  const g = 0.85 / peak;
  for (let i = 0; i < len; i++) d[i] *= g;

  return buf;
}
