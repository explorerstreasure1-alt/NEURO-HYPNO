// ============================================================
// GECE DÖNGÜSÜ — 7 Aşama × 4 Kelime (AAAA kafiyeli)
// Her aşama 45 dakika boyunca aktif kalır (kelimeler + onlardan türeyen
// 4 AAAA-kafiyeli cümle kalıbı tekrar eder), sonra bir sonraki aşamaya
// geçilir. 7. aşama bitince döngü başa sarar (sonsuz gece döngüsü).
// 7 aşama × 45 dk = 315 dk (5sa 15dk) — tam bir gece boyunca yeter.
// ============================================================

export interface StageWord { word: string; gloss: string }
export interface SentenceTemplate { pattern: string; gloss: string } // '___' = kelime boşluğu, cümle SONUNDA
export interface Stage { rhyme: string; words: [StageWord, StageWord, StageWord, StageWord] }
export interface LangStageSet {
  langId: string;
  templates: [SentenceTemplate, SentenceTemplate, SentenceTemplate, SentenceTemplate];
  stages: Stage[]; // tam olarak 7 aşama
}

export const STAGE_DURATION_SEC = 45 * 60; // 45 dk / aşama
export const STAGE_COUNT = 7;
export const CYCLE_TOTAL_SEC = STAGE_DURATION_SEC * STAGE_COUNT; // 315 dk

const W = (word: string, gloss: string): StageWord => ({ word, gloss });

export const LANG_STAGE_SETS: LangStageSet[] = [
  {
    langId: 'ES',
    templates: [
      { pattern: 'Esta noche sueño con ___', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: 'Siento una suave ___', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: 'En mi mente aparece ___', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: 'Todo se convierte en ___', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−una', words: [W('luna', 'ay'), W('cuna', 'beşik'), W('fortuna', 'şans'), W('laguna', 'lagün')] },
      { rhyme: '−ar', words: [W('hablar', 'konuşmak'), W('cantar', 'şarkı söylemek'), W('bailar', 'dans etmek'), W('soñar', 'rüya görmek')] },
      { rhyme: '−or', words: [W('amor', 'aşk'), W('dolor', 'acı'), W('color', 'renk'), W('sabor', 'tat')] },
      { rhyme: '−ero', words: [W('sombrero', 'şapka'), W('caballero', 'şövalye'), W('marinero', 'denizci'), W('lucero', 'sabah yıldızı')] },
      { rhyme: '−ento', words: [W('viento', 'rüzgâr'), W('talento', 'yetenek'), W('momento', 'an'), W('convento', 'manastır')] },
      { rhyme: '−umbre', words: [W('costumbre', 'alışkanlık'), W('cumbre', 'zirve'), W('pesadumbre', 'keder'), W('muchedumbre', 'kalabalık')] },
      { rhyme: '−ombra', words: [W('sombra', 'gölge'), W('alfombra', 'halı'), W('nombra', 'adlandırır'), W('asombra', 'şaşırtır')] },
    ],
  },
  {
    langId: 'FR',
    templates: [
      { pattern: 'Ce soir, je rêve de ___', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: 'Je sens une douce ___', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: 'Dans mon esprit apparaît ___', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: 'Tout se transforme en ___', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−ume', words: [W('lune', 'ay'), W('brume', 'sis'), W('plume', 'tüy'), W('écume', 'köpük')] },
      { rhyme: '−é', words: [W('café', 'kahve'), W('été', 'yaz'), W('clé', 'anahtar'), W('liberté', 'özgürlük')] },
      { rhyme: '−elle', words: [W('belle', 'güzel'), W('elle', 'o (dişil)'), W('ruelle', 'dar sokak'), W('hirondelle', 'kırlangıç')] },
      { rhyme: '−eur', words: [W('cœur', 'kalp'), W('fleur', 'çiçek'), W('douleur', 'acı'), W('chaleur', 'sıcaklık')] },
      { rhyme: '−age', words: [W('voyage', 'yolculuk'), W('plage', 'plaj'), W('image', 'görüntü'), W('nuage', 'bulut')] },
      { rhyme: '−oire', words: [W('histoire', 'hikâye'), W('mémoire', 'hafıza'), W('gloire', 'şan'), W('victoire', 'zafer')] },
      { rhyme: '−ence', words: [W('silence', 'sessizlik'), W('absence', 'yokluk'), W('essence', 'öz'), W('innocence', 'masumiyet')] },
    ],
  },
  {
    langId: 'EN',
    templates: [
      { pattern: 'Tonight I dream of ___', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: 'I feel a gentle ___', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: 'In my mind appears ___', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: 'Everything turns into ___', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−ight', words: [W('night', 'gece'), W('light', 'ışık'), W('flight', 'uçuş'), W('bright', 'parlak')] },
      { rhyme: '−eep', words: [W('sleep', 'uyku'), W('deep', 'derin'), W('keep', 'tutmak'), W('sweep', 'süpürmek')] },
      { rhyme: '−oon', words: [W('moon', 'ay'), W('soon', 'yakında'), W('tune', 'melodi'), W('balloon', 'balon')] },
      { rhyme: '−ound', words: [W('sound', 'ses'), W('ground', 'zemin'), W('around', 'etrafta'), W('profound', 'derin')] },
      { rhyme: '−art', words: [W('heart', 'kalp'), W('part', 'parça'), W('start', 'başlangıç'), W('smart', 'zeki')] },
      { rhyme: '−ow', words: [W('shadow', 'gölge'), W('meadow', 'çayır'), W('fallow', 'nadas'), W('hallow', 'kutsal')] },
      { rhyme: '−ory', words: [W('memory', 'hafıza'), W('theory', 'teori'), W('story', 'hikâye'), W('glory', 'şan')] },
    ],
  },
  {
    langId: 'DE',
    templates: [
      { pattern: 'Heute Nacht träume ich von ___', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: 'Ich fühle eine sanfte ___', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: 'In meinem Geist erscheint ___', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: 'Alles verwandelt sich in ___', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−acht', words: [W('nacht', 'gece'), W('macht', 'güç'), W('pracht', 'ihtişam'), W('wacht', 'nöbet')] },
      { rhyme: '−icht', words: [W('licht', 'ışık'), W('gesicht', 'yüz'), W('bericht', 'rapor'), W('gewicht', 'ağırlık')] },
      { rhyme: '−ein', words: [W('schein', 'parıltı'), W('stein', 'taş'), W('rein', 'saf'), W('allein', 'yalnız')] },
      { rhyme: '−aum', words: [W('traum', 'rüya'), W('raum', 'oda'), W('saum', 'kenar'), W('flaum', 'tüy')] },
      { rhyme: '−eise', words: [W('reise', 'yolculuk'), W('weise', 'bilge'), W('leise', 'sessiz'), W('speise', 'yemek')] },
      { rhyme: '−ern', words: [W('stern', 'yıldız'), W('fern', 'uzak'), W('kern', 'çekirdek'), W('modern', 'modern')] },
      { rhyme: '−eit', words: [W('ewigkeit', 'sonsuzluk'), W('einsamkeit', 'yalnızlık'), W('dunkelheit', 'karanlık'), W('wirklichkeit', 'gerçeklik')] },
    ],
  },
  {
    langId: 'IT',
    templates: [
      { pattern: 'Stanotte sogno ___', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: 'Sento una dolce ___', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: 'Nella mia mente appare ___', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: 'Tutto si trasforma in ___', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−una', words: [W('luna', 'ay'), W('fortuna', 'şans'), W('duna', 'kumul'), W('lacuna', 'boşluk')] },
      { rhyme: '−ane', words: [W('pane', 'ekmek'), W('cane', 'köpek'), W('rane', 'kurbağalar'), W('montane', 'dağlık')] },
      { rhyme: '−are', words: [W('amare', 'sevmek'), W('cantare', 'şarkı söylemek'), W('sognare', 'rüya görmek'), W('volare', 'uçmak')] },
      { rhyme: '−ore', words: [W('amore', 'aşk'), W('cuore', 'kalp'), W('sapore', 'tat'), W('splendore', 'ihtişam')] },
      { rhyme: '−ina', words: [W('mattina', 'sabah'), W('collina', 'tepe'), W('farina', 'un'), W('cascina', 'çiftlik')] },
      { rhyme: '−aggio', words: [W('viaggio', 'yolculuk'), W('saggio', 'bilge'), W('messaggio', 'mesaj'), W('paesaggio', 'manzara')] },
      { rhyme: '−zione', words: [W('stazione', 'istasyon'), W('nazione', 'ulus'), W('emozione', 'duygu'), W('creazione', 'yaratım')] },
    ],
  },
  {
    langId: 'JP',
    templates: [
      { pattern: '今夜 ___ を夢見る', gloss: 'Bu gece ___ hayalini kuruyorum' },
      { pattern: '優しい ___ を感じる', gloss: 'Yumuşak bir ___ hissediyorum' },
      { pattern: '心に ___ が浮かぶ', gloss: 'Zihnimde ___ beliriyor' },
      { pattern: '全てが ___ に変わる', gloss: 'Her şey ___ dönüşüyor' },
    ],
    stages: [
      { rhyme: '−zora', words: [W('sora', 'gökyüzü'), W('hoshizora', 'yıldızlı gök'), W('aozora', 'mavi gök'), W('yozora', 'gece göğü')] },
      { rhyme: '−ari', words: [W('hikari', 'ışık'), W('akari', 'aydınlık'), W('owari', 'son'), W('yukari', 'bağlantı')] },
      { rhyme: '−mi', words: [W('umi', 'deniz'), W('yumi', 'yay'), W('tsumi', 'günah'), W('kasumi', 'sis')] },
      { rhyme: '−ne', words: [W('kane', 'çan'), W('mune', 'göğüs'), W('tsune', 'daima'), W('fune', 'gemi')] },
      { rhyme: '−goe', words: [W('koe', 'ses'), W('yobigoe', 'çağrı sesi'), W('waraigoe', 'kahkaha'), W('nakigoe', 'ağlama sesi')] },
      { rhyme: '−kaze', words: [W('kaze', 'rüzgâr'), W('soyokaze', 'meltem'), W('hamakaze', 'deniz rüzgârı'), W('yakaze', 'gece rüzgârı')] },
      { rhyme: '−same', words: [W('ame', 'yağmur'), W('ameagari', 'yağmur sonrası'), W('kirisame', 'çisenti'), W('murasame', 'sağanak')] },
    ],
  },
];

export function stageSetOf(langId: string): LangStageSet {
  return LANG_STAGE_SETS.find((s) => s.langId === langId) ?? LANG_STAGE_SETS[0];
}

/** Geçen süreye göre hangi aşamadayız (0-6), 7. aşama bitince başa sarar. */
export function stageIndexAt(elapsedSec: number): number {
  return Math.floor(Math.max(0, elapsedSec) / STAGE_DURATION_SEC) % STAGE_COUNT;
}

/** Mevcut aşamada kalan süre (sn). */
export function stageTimeLeft(elapsedSec: number): number {
  return STAGE_DURATION_SEC - (Math.max(0, elapsedSec) % STAGE_DURATION_SEC);
}

/** Döngü kaç kere tamamlandı (0 = ilk tur). */
export function cycleLapsAt(elapsedSec: number): number {
  return Math.floor(Math.max(0, elapsedSec) / CYCLE_TOTAL_SEC);
}

export interface ResolvedStage {
  idx: number; // 0-6
  rhyme: string;
  words: string[]; // 4, AAAA kafiyeli
  glosses: string[]; // 4
  sentences: { pattern: string; gloss: string }[]; // 4, AAAA kafiyeli (kelimeler cümle sonunda)
}

/** idx'teki aşamayı kelime + ondan türeyen 4 AAAA-kafiyeli cümleyle çözer. */
export function resolveStage(langId: string, idx: number): ResolvedStage {
  const set = stageSetOf(langId);
  const safeIdx = ((idx % set.stages.length) + set.stages.length) % set.stages.length;
  const st = set.stages[safeIdx];
  const sentences = st.words.map((w, i) => {
    const t = set.templates[i % set.templates.length];
    return { pattern: t.pattern.replace('___', w.word), gloss: t.gloss.replace('___', w.gloss) };
  });
  return {
    idx: safeIdx,
    rhyme: st.rhyme,
    words: st.words.map((w) => w.word),
    glosses: st.words.map((w) => w.gloss),
    sentences,
  };
}
