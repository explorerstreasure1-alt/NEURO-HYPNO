// Ekran kapalıyken / uygulama arka plandayken sesin devam etmesi için
// "canlı tutma" katmanı:
//   1) Sessiz ama gerçekten çalan bir <audio> döngüsü (medya oturumu canlı kalır)
//   2) MediaSession meta verisi + kilit ekranı kontrolleri
//   3) Screen Wake Lock (tarayıcı destekliyorsa)
//   4) Android WebView köprüsü (foreground service + PARTIAL_WAKE_LOCK)

let silentAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let wakeLock: any = null;
let meta: { title: string; artist: string } | null = null;
let handlers: { onPlay?: () => void; onPause?: () => void } = {};
let listening = false;

/** 1 saniyelik sessiz WAV üretir (medya oturumunu canlı tutmak için). */
function makeSilentWavUrl(): string {
  const sampleRate = 8000;
  const samples = sampleRate; // 1 sn
  const dataSize = samples * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);      // PCM
  view.setUint16(22, 1, true);      // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  // örnekler zaten 0 (sessiz)

  const blob = new Blob([buf], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function ensureAudio(): HTMLAudioElement | null {
  if (typeof document === 'undefined') return null;
  if (silentAudio) return silentAudio;

  try {
    objectUrl = makeSilentWavUrl();
    const a = document.createElement('audio');
    a.src = objectUrl;
    a.loop = true;
    a.volume = 0.02;      // tam 0 bazı tarayıcılarda "sessiz" sayılıp askıya alınır
    a.setAttribute('playsinline', 'true');
    a.setAttribute('webkit-playsinline', 'true');
    a.style.position = 'fixed';
    a.style.width = '1px';
    a.style.height = '1px';
    a.style.opacity = '0';
    a.style.pointerEvents = 'none';
    a.id = 'nhyp-keepalive';
    document.body.appendChild(a);
    silentAudio = a;
  } catch (e) {
    console.warn('[keepAlive] sessiz audio kurulamadı', e);
  }
  return silentAudio;
}

function androidBridge(): any {
  return (globalThis as any)?.AndroidBridge ?? null;
}

async function acquireWakeLock() {
  try {
    const nav = navigator as any;
    if (nav?.wakeLock?.request) {
      wakeLock = await nav.wakeLock.request('screen');
    }
  } catch { /* desteklenmiyor / reddedildi */ }
}

async function releaseWakeLock() {
  try {
    await wakeLock?.release?.();
  } catch { /* noop */ }
  wakeLock = null;
}

function onVisibility() {
  // Screen Wake Lock sekme gizlenince otomatik bırakılır → geri gelince tekrar al
  if (document.visibilityState === 'visible' && silentAudio && !silentAudio.paused) {
    void acquireWakeLock();
  }
}

export function startKeepAlive(opts: { title?: string; artist?: string } = {}) {
  meta = { title: opts.title ?? 'NEURO-HYPNO', artist: opts.artist ?? 'Nöro-İmprint' };

  const a = ensureAudio();
  if (a) {
    a.play().catch(() => { /* kullanıcı jesti bekleniyor olabilir */ });
  }

  try {
    const ms = (navigator as any).mediaSession;
    if (ms && typeof MediaMetadata !== 'undefined') {
      ms.metadata = new MediaMetadata({ title: meta.title, artist: meta.artist, album: 'NEURO-HYPNO' });
    }
    if (ms) {
      ms.playbackState = 'playing';
      ms.setActionHandler?.('play', () => {
        void (silentAudio?.play?.());
        handlers.onPlay?.();
      });
      ms.setActionHandler?.('pause', () => handlers.onPause?.());
    }
  } catch { /* noop */ }

  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility);
    listening = true;
  }

  void acquireWakeLock();

  // Android: foreground service + wake lock
  try { androidBridge()?.startPlayback?.(); } catch { /* noop */ }
}

export function setKeepAliveHandlers(h: { onPlay?: () => void; onPause?: () => void }) {
  handlers = h;
}

export function updateKeepAliveMeta(opts: { title?: string; artist?: string }) {
  meta = { title: opts.title ?? meta?.title ?? 'NEURO-HYPNO', artist: opts.artist ?? meta?.artist ?? '' };
  try {
    const ms = (navigator as any).mediaSession;
    if (ms && typeof MediaMetadata !== 'undefined') {
      ms.metadata = new MediaMetadata({ title: meta.title, artist: meta.artist, album: 'NEURO-HYPNO' });
    }
  } catch { /* noop */ }
}

export function stopKeepAlive() {
  try { silentAudio?.pause?.(); } catch { /* noop */ }
  try { androidBridge()?.stopPlayback?.(); } catch { /* noop */ }

  try {
    const ms = (navigator as any).mediaSession;
    if (ms) ms.playbackState = 'paused';
  } catch { /* noop */ }

  void releaseWakeLock();
}

export function disposeKeepAlive() {
  stopKeepAlive();
  if (listening) {
    try { document.removeEventListener('visibilitychange', onVisibility); } catch { /* noop */ }
    listening = false;
  }
  if (silentAudio) {
    try { silentAudio.remove(); } catch { /* noop */ }
    silentAudio = null;
  }
  if (objectUrl) {
    try { URL.revokeObjectURL(objectUrl); } catch { /* noop */ }
    objectUrl = null;
  }
}
