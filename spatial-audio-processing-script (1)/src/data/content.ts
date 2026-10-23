import type { EngineParams } from '../audio/engine';

// ── Dil / kafiye setleri ──────────────────────────────────────
export interface RhymeSet {
  id: string;
  lang: string;
  langTr: string;
  words: [string, string, string, string];
  gloss: string;
  rhyme: string;
  color: string;
  progress: number; // 0-100
  nights: number;
}

export const RHYMES: RhymeSet[] = [
  { id: 'EN', lang: 'English', langTr: 'İngilizce', words: ['night', 'light', 'flight', 'bright'], gloss: 'gece · ışık · uçuş · parlak', rhyme: '−ight', color: '#fbbf24', progress: 0, nights: 0 },
  { id: 'ES', lang: 'Español', langTr: 'İspanyolca', words: ['luna', 'cuna', 'fortuna', 'laguna'], gloss: 'ay · beşik · şans · lagün', rhyme: '−una', color: '#fb7185', progress: 0, nights: 0 },
  { id: 'FR', lang: 'Français', langTr: 'Fransızca', words: ['lune', 'brume', 'plume', 'écume'], gloss: 'ay · sis · tüy · köpük', rhyme: '−ume', color: '#22d3ee', progress: 0, nights: 0 },
  { id: 'DE', lang: 'Deutsch', langTr: 'Almanca', words: ['nacht', 'macht', 'pracht', 'wacht'], gloss: 'gece · güç · ihtişam · nöbet', rhyme: '−acht', color: '#34d399', progress: 0, nights: 0 },
  { id: 'IT', lang: 'Italiano', langTr: 'İtalyanca', words: ['luna', 'fortuna', 'duna', 'lacuna'], gloss: 'ay · şans · kumul · boşluk', rhyme: '−una', color: '#4ade80', progress: 0, nights: 0 },
  { id: 'JP', lang: '日本語', langTr: 'Japonca', words: ['sora', 'hora', 'aurora', 'kokoro'], gloss: 'gökyüzü · hale · şafak · kalp', rhyme: '−ora', color: '#a78bfa', progress: 0, nights: 0 },
];

// ── Akustik mekân presetleri ──────────────────────────────────
export interface SpacePreset {
  id: string;
  name: string;
  desc: string;
  tag: string;
  gradient: string;
  glow: string;
  patch: Partial<EngineParams>;
}

export const PRESETS: SpacePreset[] = [
  {
    id: 'cathedral', name: 'Katedral', tag: 'SPEC · ÖNERİLEN',
    desc: 'Görev brifingi standardı. 2.4 sn kuyruk, %35 ıslaklık — berrak ama uzayda süzülen.',
    gradient: 'from-cyan-500/30 via-violet-600/20 to-fuchsia-500/20', glow: 'rgba(34,211,238,0.35)',
    patch: { wet: 35, decay: 2.4, delayMs: 120, feedback: 15, highCut: 6000 },
  },
  {
    id: 'cave', name: 'Kristal Mağara', tag: 'DERİN UYKU',
    desc: 'Uzun ve karanlık yansımalar. N2 konsolidasyonu için kuyruk 3.8 saniyeye uzar.',
    gradient: 'from-emerald-500/25 via-teal-600/15 to-cyan-600/20', glow: 'rgba(52,211,153,0.35)',
    patch: { wet: 52, decay: 3.8, delayMs: 160, feedback: 22, highCut: 4500 },
  },
  {
    id: 'space', name: 'Derin Uzay', tag: 'REM · RÜYA',
    desc: 'Neredeyse sonsuz salon. Kelimeler olay ufkunda eriyor — REM tekrarı için.',
    gradient: 'from-violet-600/30 via-purple-600/20 to-indigo-600/25', glow: 'rgba(167,139,250,0.4)',
    patch: { wet: 68, decay: 4.6, delayMs: 220, feedback: 30, highCut: 8000 },
  },
  {
    id: 'pillow', name: 'Yastık', tag: 'HASSAS UYKU',
    desc: 'Kısa kuyruk, düşük ıslaklık. Hafif uyuyanlar ve öğle şekerlemeleri için güvenli.',
    gradient: 'from-rose-400/25 via-pink-500/15 to-amber-400/15', glow: 'rgba(251,113,133,0.3)',
    patch: { wet: 22, decay: 1.2, delayMs: 90, feedback: 8, highCut: 5000 },
  },
  {
    id: 'dome', name: 'Yağmur Kubbesi', tag: 'YAĞMUR + SALON',
    desc: 'Kubbe yankısı ve sıcak kuyruk. Fısıltılar yağmur camında boncuklanıyor.',
    gradient: 'from-sky-500/25 via-blue-600/15 to-violet-500/20', glow: 'rgba(56,189,248,0.35)',
    patch: { wet: 45, decay: 2.9, delayMs: 140, feedback: 18, highCut: 5500 },
  },
];

// ── Seanslar ──────────────────────────────────────────────────
export interface Session {
  id: string;
  title: string;
  sub: string;
  lang: string;
  langTr: string;
  level: string;
  levelTr: string;
  minutes: number;
  words: [string, string, string, string];
  gloss: string;
  presetId: string;
  theta: number;
  plays: string;
  rating: number;
  accent: string;
  gradient: string;
  desc: string;
  badge?: string;
}

export const SESSIONS: Session[] = [
  {
    id: 'gece-01', title: 'Gece 01 · Ay ve Kıyı', sub: 'Başlangıç serisi', lang: 'ES', langTr: 'İspanyolca',
    level: 'A1', levelTr: 'Başlangıç', minutes: 20, words: ['luna', 'cuna', 'fortuna', 'laguna'],
    gloss: 'ay · beşik · şans · lagün', presetId: 'cathedral', theta: 6, plays: '48B', rating: 4.9,
    accent: '#22d3ee', gradient: 'from-cyan-500 via-blue-600 to-violet-700',
    desc: 'İlk gece protokolü. −una kafiyesi katedralde dört tur atar, teta dalgası seni N1 penceresine taşır.',
    badge: 'EN POPÜLER',
  },
  {
    id: 'sina-gece', title: 'Sınav Gecesi Yoğun', sub: 'Kampa gir', lang: 'EN', langTr: 'İngilizce',
    level: 'B1', levelTr: 'Orta', minutes: 35, words: ['night', 'light', 'flight', 'bright'],
    gloss: 'gece · ışık · uçuş · parlak', presetId: 'cave', theta: 7, plays: '31B', rating: 4.8,
    accent: '#fbbf24', gradient: 'from-amber-400 via-orange-500 to-rose-600',
    desc: 'Yarın sınav var, bu gece beyin mesaide. −ight kafiyesi mağarada yankılanır, sabah kelimeler cebinde.',
    badge: 'YOĞUN',
  },
  {
    id: 'ruya-tekrar', title: 'Rüya Tekrarı', sub: 'REM derinliği', lang: 'FR', langTr: 'Fransızca',
    level: 'B1', levelTr: 'Orta', minutes: 45, words: ['lune', 'brume', 'plume', 'écume'],
    gloss: 'ay · sis · tüy · köpük', presetId: 'space', theta: 5.5, plays: '22B', rating: 4.9,
    accent: '#a78bfa', gradient: 'from-violet-500 via-purple-600 to-indigo-800',
    desc: 'REM evresine ayarlı uzun seans. −ume sesleri rüyanın içine sızar, sabah Fransızca düşünürsün.',
  },
  {
    id: 'sekerleme', title: 'Öğle Şekerlemesi', sub: 'Güç uykusu', lang: 'ES', langTr: 'İspanyolca',
    level: 'A1', levelTr: 'Başlangıç', minutes: 10, words: ['sol', 'rol', 'farol', 'arrebol'],
    gloss: 'güneş · rol · fener · gün batımı', presetId: 'pillow', theta: 6, plays: '56B', rating: 4.7,
    accent: '#fb7185', gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    desc: '10 dakikada tam şarj. Yastık presetinde fısıltılar seni uyandırmadan N1\'e bırakır.',
    badge: 'HIZLI',
  },
  {
    id: 'derin-kilit', title: 'Derin Kilit · 90', sub: 'Tam döngü', lang: 'DE', langTr: 'Almanca',
    level: 'B2', levelTr: 'İleri', minutes: 90, words: ['nacht', 'macht', 'pracht', 'wacht'],
    gloss: 'gece · güç · ihtişam · nöbet', presetId: 'cave', theta: 4, plays: '12B', rating: 5.0,
    accent: '#34d399', gradient: 'from-emerald-400 via-teal-600 to-cyan-800',
    desc: 'Tam bir uyku döngüsü. 90 dakika boyunca −acht kafiyesi derin uykuya kilitlenir.',
    badge: 'PRO',
  },
  {
    id: 'paris', title: "Paris'e Uyuyarak", sub: 'Seyahat seti', lang: 'FR', langTr: 'Fransızca',
    level: 'A2', levelTr: 'Temel', minutes: 25, words: ['rue', 'venue', 'avenue', 'bienvenue'],
    gloss: 'sokak · geliş · cadde · hoş geldin', presetId: 'cathedral', theta: 6, plays: '18B', rating: 4.8,
    accent: '#38bdf8', gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    desc: 'Uçaktan inmeden Paris\'te kaybolma. Seyahat kelimeleri katedral akustiğinde.',
  },
  {
    id: 'kyoto', title: 'Kyoto Rüyası', sub: 'Yağmur kubbesi', lang: 'JP', langTr: 'Japonca',
    level: 'B1', levelTr: 'Orta', minutes: 30, words: ['sora', 'hora', 'aurora', 'kokoro'],
    gloss: 'gökyüzü · hale · şafak · kalp', presetId: 'dome', theta: 6.5, plays: '15B', rating: 4.9,
    accent: '#e879f9', gradient: 'from-fuchsia-500 via-purple-600 to-violet-800',
    desc: 'Yağmurlu bir Kyoto gecesi. −ora sesleri kubbede yağmur gibi süzülür.',
    badge: 'YENİ',
  },
  {
    id: 'tam-dongu', title: 'Tam Gece Döngüsü', sub: 'Uyku + tekrar', lang: 'IT', langTr: 'İtalyanca',
    level: 'A2', levelTr: 'Temel', minutes: 60, words: ['luna', 'fortuna', 'duna', 'lacuna'],
    gloss: 'ay · şans · kumul · boşluk', presetId: 'space', theta: 6, plays: '9B', rating: 4.8,
    accent: '#4ade80', gradient: 'from-green-400 via-emerald-600 to-teal-800',
    desc: 'Bir saatlik derin protokol. İtalyanca −una kafiyesi uzay salonunda sonsuz tura girer.',
  },
];

// ── Otomatik faz protokolü (seans içi otomasyon) ──────────────
export interface PhaseAuto {
  name: string;
  sub: string;
  at: number; // 0-1 seans ilerlemesi
  note: string;
  patch: Partial<EngineParams>;
}

export const PHASE_AUTO: PhaseAuto[] = [
  { name: 'Giriş', sub: 'Işıklar sönüyor', at: 0, note: 'Teta yatağı −18 dB\'de beliriyor', patch: { whisperGain: 62, binauralGain: 45, wet: 30 } },
  { name: 'N1 Penceresi', sub: 'HATIRLAMA İPUCU', at: 0.12, note: 'Tam katedral · uyanıkken kodlanan kelimeler yeniden etkinleşiyor (TMR)', patch: { whisperGain: 85, binauralGain: 60, wet: 38 } },
  { name: 'N2 Örgü', sub: 'Pekiştirme', at: 0.35, note: 'Islaklık %45\'e çiçekleniyor', patch: { whisperGain: 74, wet: 45, decay: 2.8 } },
  { name: 'Akıllı Söndürme', sub: 'Uyku koruması', at: 0.6, note: 'Fısıltılar −12 dB yatağın altına, uyku sürekliliği için kademeli azalıyor', patch: { whisperGain: 45, binauralGain: 70, wet: 50 } },
  { name: 'Rüya Yankısı', sub: 'REM tekrarı', at: 0.82, note: 'Ping-pong genişliyor · çok kısık düzeyde yankı sürüyor', patch: { whisperGain: 65, delayMs: 150, feedback: 22, wet: 42 } },
];

// ── İstatistik / rozet / ipuçları ─────────────────────────────
export const WEEK_MIN: { d: string; v: number }[] = [
  { d: 'Pzt', v: 35 }, { d: 'Sal', v: 50 }, { d: 'Çar', v: 20 }, { d: 'Per', v: 60 },
  { d: 'Cum', v: 45 }, { d: 'Cmt', v: 90 }, { d: 'Paz', v: 30 },
];

export const ACHIEVEMENTS = [
  { id: 'ilk-gece', title: 'İlk Gece', desc: 'İlk seansı tamamla', target: 1, have: 1 },
  { id: 'yedi', title: '7 Gece Serisi', desc: 'Aralıksız 7 gece', target: 7, have: 5 },
  { id: 'yuz-kelime', title: '100 Kelime', desc: '100 kelime pekiştir', target: 100, have: 64 },
  { id: 'derin-dalis', title: 'Derin Dalış', desc: '90 dk seans bitir', target: 1, have: 0 },
  { id: 'uc-dil', title: 'Üç Dilli Rüya', desc: '3 dilde seans yap', target: 3, have: 2 },
  { id: 'safak', title: 'Şafak Kuşu', desc: '5 sabah testi geç', target: 5, have: 3 },
];

export const DREAM_TIPS = [
  'Kulaklık şart: teta vuruşu ve ping-pong yalnızca stereo ile çalışır.',
  'Oda ne kadar karanlık, N1 penceresi o kadar geniş.',
  'Aynı kafiye setini 3 gece üst üste dinle — beyin deseni kilitler.',
  'Sabah testini erteleme: ilk 10 dakika hatırlama zirvesidir.',
  'Telefonu uçak moduna al. Bildirim, hipnagojik hali bıçak gibi keser.',
  'Fısıltı anlaşılmayacak kadar derinse ıslaklığı %30\'a çek.',
];

export const RITUALS = [
  { id: 'kulaklik', title: 'Kulaklığı tak', sub: 'Stereo · rahat yatış' },
  { id: 'isik', title: 'Işıkları söndür', sub: 'Tam karanlık ideal' },
  { id: 'sessiz', title: 'Telefonu sessize al', sub: 'Rahatsız etme açık' },
  { id: 'pozisyon', title: 'Yan yatışa geç', sub: 'Derin nefes × 3' },
];

export function presetOf(s: Session): SpacePreset {
  return PRESETS.find((p) => p.id === s.presetId) ?? PRESETS[0];
}

export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
