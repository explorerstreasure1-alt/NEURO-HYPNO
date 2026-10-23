import type { EngineParams } from '../audio/engine';
import type { Session } from './content';
import { RHYMES } from './content';

// ── A1 → C1 müfredat: her dilde 5 seviye, her seviyede 2 kafiye örgüsü ──
export interface Quad { words: [string, string, string, string]; gloss: string; rhyme: string }

export interface LevelInfo {
  idx: number;
  code: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  theme: string;
  themeDesc: string;
  quads: [Quad, Quad];
  focus: string;
  wordsTarget: number;
  minutes: number;
  xp: number;
  theta: number;
  presetId: string;
}

export interface LangCurriculum { id: string; levels: LevelInfo[] }

const L = (
  idx: number, code: LevelInfo['code'], theme: string, themeDesc: string,
  quads: [Quad, Quad], focus: string, wordsTarget: number,
  minutes: number, xp: number, theta: number, presetId: string,
): LevelInfo => ({ idx, code, theme, themeDesc, quads, focus, wordsTarget, minutes, xp, theta, presetId });

export const CURRICULUM: LangCurriculum[] = [
  {
    id: 'ES', levels: [
      L(0, 'A1', 'İlk Ay', 'İspanyolcayla ilk temas: gökyüzü ve ev kelimeleriyle −una büyüsü.',
        [{ words: ['luna', 'cuna', 'fortuna', 'laguna'], gloss: 'ay · beşik · şans · lagün', rhyme: '−una' },
         { words: ['sol', 'rol', 'farol', 'arrebol'], gloss: 'güneş · rol · fener · gün batımı', rhyme: '−ol' }],
        'İsimler · −o/−a ayrımı', 60, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Günlük Ritim', 'Her gün yapılan şeyler: konuşmak, şarkı, dans ve rüya fiilleri.',
        [{ words: ['hablar', 'cantar', 'bailar', 'soñar'], gloss: 'konuşmak · şarkı söylemek · dans etmek · rüya görmek', rhyme: '−ar' },
         { words: ['casa', 'masa', 'taza', 'plaza'], gloss: 'ev · masa · fincan · meydan', rhyme: '−asa' }],
        'Şimdiki zaman · −ar fiiller', 150, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Hisler', 'Duygu kelimeleri kalbe işler: aşk, acı, renk ve tat.',
        [{ words: ['canción', 'nación', 'emoción', 'estación'], gloss: 'şarkı · ulus · duygu · istasyon', rhyme: '−ción' },
         { words: ['amor', 'dolor', 'color', 'sabor'], gloss: 'aşk · acı · renk · tat', rhyme: '−or' }],
        'ser/estar · duygu sıfatları', 300, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Hikâyeler', 'Anlatı zamanı: şövalyeler, denizciler ve esen rüzgârlar.',
        [{ words: ['sombrero', 'caballero', 'marinero', 'lucero'], gloss: 'şapka · şövalye · denizci · sabah yıldızı', rhyme: '−ero' },
         { words: ['tiempo', 'viento', 'talento', 'ciento'], gloss: 'zaman · rüzgâr · yetenek · yüz', rhyme: '−ento' }],
        'Geçmiş zamanlar · pretérito', 600, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Rüya Edebiyatı', 'Şiirsel derinlik: gölgeler ve alışkanlıkların felsefesi.',
        [{ words: ['costumbre', 'cumbre', 'pesadumbre', 'muchedumbre'], gloss: 'alışkanlık · zirve · keder · kalabalık', rhyme: '−umbre' },
         { words: ['sombra', 'alfombra', 'nombra', 'asombra'], gloss: 'gölge · halı · adlandırır · şaşırtır', rhyme: '−ombra' }],
        'Dilek kipi · deyimler', 1200, 45, 160, 5, 'space'),
    ],
  },
  {
    id: 'FR', levels: [
      L(0, 'A1', 'Clair de Lune', 'Ay ışığıyla Fransızca: yumuşak −ume sesleri kulağı eğitir.',
        [{ words: ['lune', 'brume', 'plume', 'écume'], gloss: 'ay · sis · tüy · köpük', rhyme: '−ume' },
         { words: ['rue', 'venue', 'avenue', 'bienvenue'], gloss: 'sokak · geliş · cadde · hoş geldin', rhyme: '−ue' }],
        'le/la · temel isimler', 60, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Café Sohbeti', 'Kafe masasında geçen sabahlar: kahve, yaz ve özgürlük.',
        [{ words: ['café', 'été', 'clé', 'liberté'], gloss: 'kahve · yaz · anahtar · özgürlük', rhyme: '−é' },
         { words: ['pain', 'vin', 'jardin', 'matin'], gloss: 'ekmek · şarap · bahçe · sabah', rhyme: '−in' }],
        'être/avoir · şimdiki zaman', 150, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Duygular', 'Kalp kelimeleri: çiçekler, acılar ve içten gelen sıcaklık.',
        [{ words: ['belle', 'elle', 'ruelle', 'hirondelle'], gloss: 'güzel · o (dişil) · dar sokak · kırlangıç', rhyme: '−elle' },
         { words: ['cœur', 'fleur', 'douleur', 'chaleur'], gloss: 'kalp · çiçek · acı · sıcaklık', rhyme: '−eur' }],
        'Sıfat uyumu · eril/dişil', 300, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Yolculuk', 'Kıyılar ve pencereler: yolculuk hikâyeleri anlatma zamanı.',
        [{ words: ['voyage', 'plage', 'image', 'nuage'], gloss: 'yolculuk · plaj · görüntü · bulut', rhyme: '−age' },
         { words: ['fenêtre', 'être', 'paraître', 'connaître'], gloss: 'pencere · olmak · görünmek · tanımak', rhyme: '−aître' }],
        'passé composé · imparfait', 600, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Hafıza', 'Tarih ve zafer: edebî Fransızcanın rüya katmanı.',
        [{ words: ['histoire', 'mémoire', 'gloire', 'victoire'], gloss: 'hikâye · hafıza · şan · zafer', rhyme: '−oire' },
         { words: ['silence', 'absence', 'essence', 'innocence'], gloss: 'sessizlik · yokluk · öz · masumiyet', rhyme: '−ence' }],
        'Subjonctif incelikleri', 1200, 45, 160, 5, 'space'),
    ],
  },
  {
    id: 'EN', levels: [
      L(0, 'A1', 'Night Light', 'Gece lambası kelimeleri: ışık, uçuş ve parlaklık.',
        [{ words: ['night', 'light', 'flight', 'bright'], gloss: 'gece · ışık · uçuş · parlak', rhyme: '−ight' },
         { words: ['dream', 'stream', 'team', 'gleam'], gloss: 'rüya · akarsu · takım · parıltı', rhyme: '−eam' }],
        'to be · tekil/çoğul', 60, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Deep Sleep', 'Derin uyku sesleri: ay, melodi ve balonlar.',
        [{ words: ['sleep', 'deep', 'keep', 'sweep'], gloss: 'uyku · derin · tutmak · süpürmek', rhyme: '−eep' },
         { words: ['moon', 'soon', 'tune', 'balloon'], gloss: 'ay · yakında · melodi · balon', rhyme: '−oon' }],
        'Simple past · düzenli/düzensiz', 150, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Inner Sound', 'İç ses katmanı: kalp, başlangıç ve derinlik.',
        [{ words: ['sound', 'ground', 'around', 'profound'], gloss: 'ses · zemin · etrafta · derin', rhyme: '−ound' },
         { words: ['heart', 'part', 'start', 'smart'], gloss: 'kalp · parça · başlangıç · zeki', rhyme: '−art' }],
        'Present perfect · for/since', 300, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Quiet Mind', 'Sessiz zihin: gölgeler, çayırlar ve kutsal alanlar.',
        [{ words: ['shadow', 'meadow', 'fallow', 'hallow'], gloss: 'gölge · çayır · nadas · kutsal', rhyme: '−ow' },
         { words: ['wonder', 'thunder', 'under', 'slumber'], gloss: 'merak · gök gürültüsü · altında · uyuklama', rhyme: '−under' }],
        'Conditionals · phrasal verbs', 600, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Lucid', 'Berrak rüya akademik katmanı: yaratım ve meditasyon.',
        [{ words: ['station', 'nation', 'creation', 'meditation'], gloss: 'istasyon · ulus · yaratım · meditasyon', rhyme: '−ation' },
         { words: ['memory', 'theory', 'story', 'glory'], gloss: 'hafıza · teori · hikâye · şan', rhyme: '−ory' }],
        'Inversion · akademik yazım', 1200, 45, 160, 5, 'space'),
    ],
  },
  {
    id: 'DE', levels: [
      L(0, 'A1', 'Nacht', 'Gece kelimeleriyle Almanca: güç, ihtişam ve nöbet.',
        [{ words: ['nacht', 'macht', 'pracht', 'wacht'], gloss: 'gece · güç · ihtişam · nöbet', rhyme: '−acht' },
         { words: ['haus', 'maus', 'strauss', 'applaus'], gloss: 'ev · fare · devekuşu · alkış', rhyme: '−aus' }],
        'der/die/das · artikeller', 60, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Licht', 'Işık katmanı: yüzler, taşlar ve yalnızlık.',
        [{ words: ['licht', 'gesicht', 'bericht', 'gewicht'], gloss: 'ışık · yüz · rapor · ağırlık', rhyme: '−icht' },
         { words: ['schein', 'stein', 'rein', 'allein'], gloss: 'parıltı · taş · saf · yalnız', rhyme: '−ein' }],
        'Perfekt · haben/sein', 150, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Traum', 'Rüya ve mekân: odalar, yolculuklar ve sessizlik.',
        [{ words: ['traum', 'raum', 'saum', 'flaum'], gloss: 'rüya · oda · kenar · tüy', rhyme: '−aum' },
         { words: ['reise', 'weise', 'leise', 'speise'], gloss: 'yolculuk · bilge · sessiz · yemek', rhyme: '−eise' }],
        'Dativ/Akkusativ · hâller', 300, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Stadt & Meer', 'Şehir ve deniz: dünyalar, paralar ve yıldızlar.',
        [{ words: ['welt', 'geld', 'held', 'zelt'], gloss: 'dünya · para · kahraman · çadır', rhyme: '−elt' },
         { words: ['stern', 'fern', 'kern', 'modern'], gloss: 'yıldız · uzak · çekirdek · modern', rhyme: '−ern' }],
        'Passiv · Konjunktiv II', 600, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Sehnsucht', 'Özlem katmanı: sonsuzluk, yalnızlık ve sırlar.',
        [{ words: ['ewigkeit', 'einsamkeit', 'dunkelheit', 'wirklichkeit'], gloss: 'sonsuzluk · yalnızlık · karanlık · gerçeklik', rhyme: '−keit' },
         { words: ['geheimnis', 'gleichnis', 'ereignis', 'zeugnis'], gloss: 'sır · benzetme · olay · karne', rhyme: '−nis' }],
        'Akademik Almanca · edebiyat', 1200, 45, 160, 5, 'space'),
    ],
  },
  {
    id: 'IT', levels: [
      L(0, 'A1', 'Luna', 'Ay ve şans: İtalyancanın şarkı gibi ilk sesleri.',
        [{ words: ['luna', 'fortuna', 'duna', 'lacuna'], gloss: 'ay · şans · kumul · boşluk', rhyme: '−una' },
         { words: ['pane', 'cane', 'domani', 'lontano'], gloss: 'ekmek · köpek · yarın · uzak', rhyme: '−ane' }],
        'il/la · −o/−a sonları', 60, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Volare', 'Uçmak: sevmek, şarkı ve rüya fiilleri.',
        [{ words: ['amare', 'cantare', 'sognare', 'volare'], gloss: 'sevmek · şarkı söylemek · rüya görmek · uçmak', rhyme: '−are' },
         { words: ['sera', 'primavera', 'bufera', 'preghiera'], gloss: 'akşam · ilkbahar · fırtına · dua', rhyme: '−era' }],
        'Presente · essere/avere', 150, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Cuore', 'Kalp katmanı: aşk, tat ve sabah tepeleri.',
        [{ words: ['amore', 'cuore', 'sapore', 'splendore'], gloss: 'aşk · kalp · tat · ihtişam', rhyme: '−ore' },
         { words: ['mattina', 'collina', 'farina', 'cascina'], gloss: 'sabah · tepe · un · çiftlik', rhyme: '−ina' }],
        'Passato prossimo', 300, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Viaggio', 'Yolculuk: mesajlar, manzaralar ve anlar.',
        [{ words: ['viaggio', 'saggio', 'messaggio', 'paesaggio'], gloss: 'yolculuk · bilge · mesaj · manzara', rhyme: '−aggio' },
         { words: ['vento', 'talento', 'momento', 'spavento'], gloss: 'rüzgâr · yetenek · an · korku', rhyme: '−ento' }],
        'Congiuntivo · istek kipleri', 600, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Anima', 'Ruh katmanı: istasyonlar, nehirler ve kokular.',
        [{ words: ['stazione', 'nazione', 'emozione', 'creazione'], gloss: 'istasyon · ulus · duygu · yaratım', rhyme: '−zione' },
         { words: ['lume', 'fiume', 'costume', 'profume'], gloss: 'ışık · nehir · gelenek · koku', rhyme: '−ume' }],
        'Periodo ipotetico · edebiyat', 1200, 45, 160, 5, 'space'),
    ],
  },
  {
    id: 'JP', levels: [
      L(0, 'A1', 'Sora · Gökyüzü', 'Gökyüzü ailesi: yıldızlı, mavi ve gece gökleri.',
        [{ words: ['sora', 'hoshizora', 'aozora', 'yozora'], gloss: 'gökyüzü · yıldızlı gök · mavi gök · gece göğü', rhyme: '−zora' },
         { words: ['hikari', 'akari', 'owari', 'yukari'], gloss: 'ışık · aydınlık · son · bağlantı', rhyme: '−ari' }],
        'Hiragana · です cümleleri', 50, 15, 40, 7, 'cathedral'),
      L(1, 'A2', 'Umi · Deniz', 'Su sesleri: deniz, yay, sis ve kalıcı şeyler.',
        [{ words: ['umi', 'yumi', 'tsumi', 'kasumi'], gloss: 'deniz · yay · günah · sis', rhyme: '−mi' },
         { words: ['kane', 'mune', 'tsune', 'fune'], gloss: 'para · göğüs · daima · gemi', rhyme: '−ne' }],
        'te-form · geçmiş zaman', 120, 20, 60, 6.5, 'cathedral'),
      L(2, 'B1', 'Koe · Sesler', 'Ses ailesi: çağrılar, kahkahalar ve gözyaşları.',
        [{ words: ['koe', 'yobigoe', 'waraigoe', 'nakigoe'], gloss: 'ses · çağrı sesi · kahkaha · ağlama sesi', rhyme: '−goe' },
         { words: ['oto', 'koto', 'makoto', 'shigoto'], gloss: 'ses · şey · samimiyet · iş', rhyme: '−oto' }],
        'Potansiyel · istek formu', 250, 25, 80, 6, 'dome'),
      L(3, 'B2', 'Kaze · Rüzgârlar', 'Rüzgâr ailesi: meltemler, deniz rüzgârı ve gece esintisi.',
        [{ words: ['kaze', 'soyokaze', 'hamakaze', 'yakaze'], gloss: 'rüzgâr · meltem · deniz rüzgârı · gece rüzgârı', rhyme: '−kaze' },
         { words: ['yubi', 'kubi', 'tabi', 'sabi'], gloss: 'parmak · boyun · yolculuk · pas', rhyme: '−bi' }],
        'Edilgen · saygı dili', 500, 35, 120, 5.5, 'cave'),
      L(4, 'C1', 'Ame · Yağmurlar', 'Yağmur şiiri: çisenti, sağanak sonrası ve sis sınırları.',
        [{ words: ['ame', 'ameagari', 'kirisame', 'murasame'], gloss: 'yağmur · yağmur sonrası · çisenti · sağanak', rhyme: '−same' },
         { words: ['kiri', 'kagiri', 'nigiri', 'onigiri'], gloss: 'sis · sınır · tutam · pirinç topu', rhyme: '−giri' }],
        'Edebi Japonca · atasözleri', 900, 45, 160, 5, 'space'),
    ],
  },
];

const LANG_GRADIENT: Record<string, string> = {
  ES: 'from-rose-400 via-pink-500 to-fuchsia-600',
  FR: 'from-sky-400 via-blue-500 to-indigo-600',
  EN: 'from-amber-400 via-orange-500 to-rose-600',
  DE: 'from-emerald-400 via-teal-600 to-cyan-800',
  IT: 'from-green-400 via-emerald-600 to-teal-800',
  JP: 'from-fuchsia-500 via-purple-600 to-violet-800',
};

export function langColor(id: string): string {
  return RHYMES.find((r) => r.id === id)?.color ?? '#a78bfa';
}
export function langTr(id: string): string {
  return RHYMES.find((r) => r.id === id)?.langTr ?? id;
}

export function levelOf(langId: string, idx: number): LevelInfo {
  const lang = CURRICULUM.find((c) => c.id === langId) ?? CURRICULUM[0];
  return lang.levels[Math.min(4, Math.max(0, idx))];
}

/** Seviyeden çalınabilir seans üret */
export function levelSession(langId: string, idx: number, quadIdx = 0): Session {
  const lv = levelOf(langId, idx);
  const q = lv.quads[quadIdx] ?? lv.quads[0];
  return {
    id: `lvl-${langId}-${idx}-${quadIdx}`,
    title: `${lv.code} · ${lv.theme}`,
    sub: `${langTr(langId)} müfredatı`,
    lang: langId, langTr: langTr(langId),
    level: lv.code, levelTr: lv.theme,
    minutes: lv.minutes,
    words: q.words, gloss: q.gloss,
    presetId: lv.presetId, theta: lv.theta,
    plays: 'müfredat', rating: 5.0,
    accent: langColor(langId),
    gradient: LANG_GRADIENT[langId] ?? 'from-violet-500 to-fuchsia-600',
    desc: `${lv.themeDesc} Odak: ${lv.focus}.`,
    badge: lv.code,
  };
}

// ── çıkış modu bilgisi ──
export interface ModeInfo {
  id: 'phones' | 'speaker';
  title: string;
  sub: string;
  desc: string;
  specs: { k: string; v: string }[];
  tip: string;
}

export const MODES: ModeInfo[] = [
  {
    id: 'phones',
    title: 'Kulaklık Modu',
    sub: 'BİNAURAL · REFERANS',
    desc: 'Sol 200 Hz / sağ 206 Hz — 6 Hz vuruş beynin içinde oluşur. Geniş stereo katedral ve ping-pong tam güçte.',
    specs: [
      { k: 'MOTOR', v: 'Binaural L200/R206' },
      { k: 'VURUŞ', v: 'θ 6 Hz (kafada)' },
      { k: 'SAHNE', v: 'Geniş stereo · PP 120ms' },
      { k: 'FİLTRE', v: 'Kuyruk 6 kHz' },
    ],
    tip: 'Kulak içi veya kapalı kulaklık önerilir.',
  },
  {
    id: 'speaker',
    title: 'Hoparlör Modu',
    sub: 'İZOKRONİK · ODA',
    desc: '136.1 Hz Om taşıyıcı + 2./3. harmonik takviye (272/408 Hz) ve perküsif "thump" ile küçük hoparlörde bile nabız net hissedilir. M/S daraltma + 2–4 kHz netlik.',
    specs: [
      { k: 'MOTOR', v: 'İzokronik + harmonik x3' },
      { k: 'KAPILAMA', v: '6 Hz · %100 keskin' },
      { k: 'SAHNE', v: 'M/S · mid +15%' },
      { k: 'NETLİK', v: '+4 dB @ 3 kHz' },
    ],
    tip: 'İlk kullanımda mikrofonla hoparlörünü kalibre et — frekans dengesini cihazına göre ayarlar.',
  },
];

// ── 10 dakikalık hızlandırılmış hipnagojik iniş ──
// Hedef: ilk 10 dakika içinde bedeni uykuya, bilinci açıklığa kilitlemek
// (yarı-uyku/yarı-uyanık "hipnagojik çapa" hâli). 5 faz × 2 dakika.
export interface InductionPhase {
  name: string;
  sub: string;
  secs: number; // bu fazın süresi (sn)
  body: number; // beden uykuda % (hedef)
  mind: number; // bilinç açık % (hedef)
  breath: boolean; // nefes kılavuzu göster
  note: string;
  patch: Partial<EngineParams>;
}

export const INDUCTION_PHASE_SECS = 120; // 2 dk / faz
export const INDUCTION_TOTAL = INDUCTION_PHASE_SECS * 5; // 10 dk

// ── 10 DAKİKALIK FREKANS İNİŞ EĞRİSİ ───────────────────────
// Ani frekans sıçraması yok: alfa gevşemesinden (10 Hz) teta eşiğine
// (6 Hz), kısa derin temas (5.4 Hz) ve bilinç çapası için tekrar 6 Hz'e
// yumuşak (smoothstep) kayış. Amaç 10. dakikada yarı-uyku/yarı-uyanık eşik.
export interface EntrainmentAnchor { sec: number; hz: number; depth: number }
export const ENTRAINMENT_CURVE: EntrainmentAnchor[] = [
  { sec: 0, hz: 10.0, depth: 0.72 },
  { sec: 60, hz: 9.0, depth: 0.78 },
  { sec: 120, hz: 8.2, depth: 0.84 },
  { sec: 240, hz: 7.0, depth: 0.92 },
  { sec: 360, hz: 6.1, depth: 1.0 },
  { sec: 480, hz: 5.4, depth: 0.96 },
  { sec: 540, hz: 5.8, depth: 0.94 },
  { sec: 600, hz: 6.0, depth: 0.92 },
];

function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

export function entrainmentAt(elapsedSec: number): { hz: number; depth: number } {
  const s = Math.min(600, Math.max(0, elapsedSec));
  for (let i = 0; i < ENTRAINMENT_CURVE.length - 1; i++) {
    const a = ENTRAINMENT_CURVE[i];
    const b = ENTRAINMENT_CURVE[i + 1];
    if (s >= a.sec && s <= b.sec) {
      const k = smoothstep((s - a.sec) / Math.max(1, b.sec - a.sec));
      return { hz: a.hz + (b.hz - a.hz) * k, depth: a.depth + (b.depth - a.depth) * k };
    }
  }
  const last = ENTRAINMENT_CURVE[ENTRAINMENT_CURVE.length - 1];
  return { hz: last.hz, depth: last.depth };
}

/** Normal seanslarda da ilk 10 dakika 10 Hz'den seansın hedef teta değerine iner. */
export function sessionThetaAt(elapsedSec: number, targetHz: number): { hz: number; depth: number } {
  const target = Math.min(7.5, Math.max(4, targetHz || 6));
  if (elapsedSec >= 600) return { hz: target, depth: 1 };
  const k = smoothstep(elapsedSec / 600);
  return { hz: 10 + (target - 10) * k, depth: 0.8 + 0.2 * k };
}

export function brainBand(hz: number): { name: string; desc: string; color: string } {
  if (hz >= 8) return { name: 'ALFA GEVŞEME', desc: 'Zihin sakinleşiyor, beden bırakıyor', color: '#22d3ee' };
  if (hz >= 5) return { name: 'TETA EŞİĞİ', desc: 'Yarı-uyku / yarı-uyanık hipnagojik alan', color: '#e879f9' };
  return { name: 'DERİN SINIR', desc: 'Uykuya geçiş kuvvetleniyor', color: '#818cf8' };
}

export const INDUCTION: InductionPhase[] = [
  {
    name: 'Bırak', sub: '10 → 8.2 Hz · Alfa inişi', secs: INDUCTION_PHASE_SECS, body: 24, mind: 96, breath: true,
    note: '4sn al · 4sn tut · 6sn ver — frekans alfa bandından aşağı kayıyor (0-2dk)',
    patch: { whisperGain: 58, binauralGain: 55, binauralBeat: 10, wet: 28, delayMs: 110 },
  },
  {
    name: 'Ağırlaş', sub: '8.2 → 7 Hz · Eşik yaklaşımı', secs: INDUCTION_PHASE_SECS, body: 55, mind: 90, breath: true,
    note: 'Ayaklardan başa ağırlık dalgası — nabız derinliği artıyor (2-4dk)',
    patch: { whisperGain: 74, binauralGain: 64, binauralBeat: 8.2, wet: 34, delayMs: 120 },
  },
  {
    name: 'Eşik', sub: '7 → 6.1 Hz · TETA PENCERESİ', secs: INDUCTION_PHASE_SECS, body: 78, mind: 80, breath: false,
    note: 'Dakika 4-6: frekans teta eşiğine kilitleniyor, kodlanan kelimeler ipucuyla canlanıyor',
    patch: { whisperGain: 90, binauralGain: 70, binauralBeat: 7, wet: 40, delayMs: 120 },
  },
  {
    name: 'Sürüklen', sub: '6.1 → 5.4 Hz · Derin temas', secs: INDUCTION_PHASE_SECS, body: 90, mind: 70, breath: false,
    note: 'Frekans kısa süre derin sınıra iniyor — beden dakika 8\'e dek neredeyse uyur',
    patch: { whisperGain: 62, binauralGain: 78, binauralBeat: 6.1, wet: 46, delayMs: 140 },
  },
  {
    name: 'Çapa', sub: '5.4 → 6 Hz · Bilinç çapası', secs: INDUCTION_PHASE_SECS, body: 96, mind: 90, breath: false,
    note: 'Dakika 8-10: 6 Hz çapası — beden uykuda, farkındalık açık ve sabit',
    patch: { whisperGain: 78, binauralGain: 66, binauralBeat: 5.4, wet: 42, delayMs: 150, feedback: 24 },
  },
];

export function inductionPhaseAt(elapsedSec: number): number {
  return Math.min(4, Math.floor(elapsedSec / INDUCTION_PHASE_SECS));
}
export function inductionPhaseLeft(elapsedSec: number): number {
  return INDUCTION_PHASE_SECS - (elapsedSec % INDUCTION_PHASE_SECS);
}
