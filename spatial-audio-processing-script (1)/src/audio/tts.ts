// TTS sesini AudioBuffer'a çevirir. Böylece ses ConvolverNode'dan geçebilir.
// Sağlayıcı, VITE_TTS_ENDPOINT ile yapılandırılır:
//   https://senin-api.vercel.app/api/tts?text={text}&lang={lang}
// Endpoint yoksa veya hata verirse null döner (çağıran taraf Web Speech'e düşer).

const DEFAULT_TIMEOUT = 9000;

export function getTtsEndpoint(): string | null {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
    return env.VITE_TTS_ENDPOINT?.trim() || null;
  } catch {
    return null;
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

  const url = endpoint
    .replace('{text}', encodeURIComponent(text))
    .replace('{lang}', encodeURIComponent(lang));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength < 512) throw new Error('TTS yanıtı çok kısa');
    return await ctx.decodeAudioData(bytes);
  } catch (e) {
    console.warn('[TTS] endpoint başarısız, Web Speech fallback:', e);
    return null;
  } finally {
    clearTimeout(timer);
  }
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
