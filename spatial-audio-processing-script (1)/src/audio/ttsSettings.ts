import { getTtsEndpoint } from './tts';

const KEY = 'neurohypno.tts.endpoint';
const AUTO = '/api/tts?text={text}&lang={lang}';

function isLocalHost(): boolean {
  try {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '' || h === '0.0.0.0';
  } catch {
    return true;
  }
}

export function getEndpoint(): string | null {
  // 1) kullanıcı ayarı
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch { /* noop */ }

  // 2) build-time env
  const env = getTtsEndpoint();
  if (env) return env;

  // 3) Vercel'de otomatik /api/tts
  if (!isLocalHost()) return AUTO;

  return null;
}

export function setEndpoint(value: string) {
  try {
    const v = value.trim();
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch { /* noop */ }
}

export function hasRealEcho(): boolean {
  return !!getEndpoint();
}
