// CEFR kademeli sözlük: her dil için A1→C1 kelime ve cümle kalıpları.
// Dil uzmanı kontrolü: her seviyede 6 kelime + 6 kalıp (4'lü set için 15 farklı kombinasyon).

import { EXTRA } from './lexiconExtra';

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export const CEFR_ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const LEVEL_RATE: Record<CEFR, number> = {
  A1: 0.78,
  A2: 0.85,
  B1: 0.92,
  B2: 0.98,
  C1: 1.02,
};

export const LEVEL_TR: Record<CEFR, string> = {
  A1: 'Başlangıç',
  A2: 'Temel',
  B1: 'Orta',
  B2: 'Orta-ileri',
  C1: 'İleri',
};

export interface Entry {
  text: string;
  gloss: string;
}

interface LangBank {
  words: Record<CEFR, Entry[]>;
  phrases: Record<CEFR, Entry[]>;
}

const EN: LangBank = {
  words: {
    A1: [
      { text: 'water', gloss: 'su' },
      { text: 'house', gloss: 'ev' },
      { text: 'friend', gloss: 'arkadaş' },
      { text: 'food', gloss: 'yemek' },
    ],
    A2: [
      { text: 'travel', gloss: 'seyahat' },
      { text: 'weather', gloss: 'hava durumu' },
      { text: 'healthy', gloss: 'sağlıklı' },
      { text: 'early', gloss: 'erken' },
    ],
    B1: [
      { text: 'decision', gloss: 'karar' },
      { text: 'experience', gloss: 'deneyim' },
      { text: 'improve', gloss: 'geliştirmek' },
      { text: 'environment', gloss: 'çevre' },
    ],
    B2: [
      { text: 'achieve', gloss: 'başarmak' },
      { text: 'evidence', gloss: 'kanıt' },
      { text: 'concern', gloss: 'kaygı / ilgi alanı' },
      { text: 'significant', gloss: 'önemli / anlamlı' },
    ],
    C1: [
      { text: 'ambiguous', gloss: 'belirsiz / muğlak' },
      { text: 'coherent', gloss: 'tutarlı' },
      { text: 'undermine', gloss: 'zayıflatmak' },
      { text: 'implicit', gloss: 'örtük' },
    ],
  },
  phrases: {
    A1: [
      { text: 'I am ___', gloss: 'Ben ___' },
      { text: 'This is ___', gloss: 'Bu ___' },
      { text: 'I want ___', gloss: '___ istiyorum' },
      { text: 'Where is ___?', gloss: '___ nerede?' },
    ],
    A2: [
      { text: 'I usually ___', gloss: 'Genelde ___' },
      { text: 'Can I ___?', gloss: '___ yapabilir miyim?' },
      { text: 'I went to ___', gloss: '___ gittim' },
      { text: 'Do you like ___?', gloss: '___ sever misin?' },
    ],
    B1: [
      { text: 'I think that ___', gloss: 'Bence ___' },
      { text: 'I have been ___', gloss: '___ oldum / bulundum' },
      { text: 'It depends on ___', gloss: '___ bağlı' },
      { text: "I'd rather ___", gloss: '___ tercih ederim' },
    ],
    B2: [
      { text: 'It is likely that ___', gloss: '___ olması muhtemel' },
      { text: 'Despite ___, we continued', gloss: '___ rağmen devam ettik' },
      { text: "I'm not convinced that ___", gloss: '___ ikna olmadım' },
      { text: 'There is a growing tendency to ___', gloss: '___ yönünde artan bir eğilim var' },
    ],
    C1: [
      { text: 'Were it not for ___, we would fail', gloss: '___ olmasaydı başarısız olurduk' },
      { text: 'It could be argued that ___', gloss: '___ öne sürülebilir' },
      { text: 'There is little doubt that ___', gloss: '___ kuşku yok' },
      { text: 'Not only did ___, but it also spread', gloss: 'Sadece ___ değil, aynı zamanda yayıldı' },
    ],
  },
};

const ES: LangBank = {
  words: {
    A1: [
      { text: 'agua', gloss: 'su' },
      { text: 'casa', gloss: 'ev' },
      { text: 'amigo', gloss: 'arkadaş' },
      { text: 'comida', gloss: 'yemek' },
    ],
    A2: [
      { text: 'viaje', gloss: 'seyahat' },
      { text: 'tiempo', gloss: 'hava / zaman' },
      { text: 'sano', gloss: 'sağlıklı' },
      { text: 'temprano', gloss: 'erken' },
    ],
    B1: [
      { text: 'decisión', gloss: 'karar' },
      { text: 'experiencia', gloss: 'deneyim' },
      { text: 'mejorar', gloss: 'geliştirmek' },
      { text: 'medio ambiente', gloss: 'çevre' },
    ],
    B2: [
      { text: 'lograr', gloss: 'başarmak' },
      { text: 'prueba', gloss: 'kanıt' },
      { text: 'preocupación', gloss: 'kaygı' },
      { text: 'significativo', gloss: 'anlamlı' },
    ],
    C1: [
      { text: 'ambiguo', gloss: 'belirsiz' },
      { text: 'coherente', gloss: 'tutarlı' },
      { text: 'socavar', gloss: 'zayıflatmak' },
      { text: 'implícito', gloss: 'örtük' },
    ],
  },
  phrases: {
    A1: [
      { text: 'Soy ___', gloss: 'Ben ___' },
      { text: 'Esto es ___', gloss: 'Bu ___' },
      { text: 'Quiero ___', gloss: '___ istiyorum' },
      { text: '¿Dónde está ___?', gloss: '___ nerede?' },
    ],
    A2: [
      { text: 'Normalmente ___', gloss: 'Genelde ___' },
      { text: '¿Puedo ___?', gloss: '___ yapabilir miyim?' },
      { text: 'Fui a ___', gloss: '___ gittim' },
      { text: '¿Te gusta ___?', gloss: '___ sever misin?' },
    ],
    B1: [
      { text: 'Creo que ___', gloss: 'Bence ___' },
      { text: 'He estado en ___', gloss: '___ bulundum' },
      { text: 'Depende de ___', gloss: '___ bağlı' },
      { text: 'Preferiría ___', gloss: '___ tercih ederim' },
    ],
    B2: [
      { text: 'Es probable que ___', gloss: '___ olması muhtemel' },
      { text: 'A pesar de ___, seguimos', gloss: '___ rağmen devam ettik' },
      { text: 'No estoy convencido de que ___', gloss: '___ ikna olmadım' },
      { text: 'Existe una tendencia creciente a ___', gloss: '___ artan bir eğilim var' },
    ],
    C1: [
      { text: 'De no ser por ___, fallaríamos', gloss: '___ olmasaydı başarısız olurduk' },
      { text: 'Se podría argumentar que ___', gloss: '___ öne sürülebilir' },
      { text: 'Poco se duda de que ___', gloss: '___ kuşku yok' },
      { text: 'No solo ___, sino que también se extendió', gloss: 'Sadece ___ değil, aynı zamanda yayıldı' },
    ],
  },
};

const FR: LangBank = {
  words: {
    A1: [
      { text: 'eau', gloss: 'su' },
      { text: 'maison', gloss: 'ev' },
      { text: 'ami', gloss: 'arkadaş' },
      { text: 'nourriture', gloss: 'yemek' },
    ],
    A2: [
      { text: 'voyage', gloss: 'seyahat' },
      { text: 'temps', gloss: 'hava / zaman' },
      { text: 'sain', gloss: 'sağlıklı' },
      { text: 'tôt', gloss: 'erken' },
    ],
    B1: [
      { text: 'décision', gloss: 'karar' },
      { text: 'expérience', gloss: 'deneyim' },
      { text: 'améliorer', gloss: 'geliştirmek' },
      { text: 'environnement', gloss: 'çevre' },
    ],
    B2: [
      { text: 'atteindre', gloss: 'başarmak / ulaşmak' },
      { text: 'preuve', gloss: 'kanıt' },
      { text: 'inquiétude', gloss: 'kaygı' },
      { text: 'significatif', gloss: 'anlamlı' },
    ],
    C1: [
      { text: 'ambigu', gloss: 'belirsiz' },
      { text: 'cohérent', gloss: 'tutarlı' },
      { text: 'saper', gloss: 'zayıflatmak' },
      { text: 'implicite', gloss: 'örtük' },
    ],
  },
  phrases: {
    A1: [
      { text: 'Je suis ___', gloss: 'Ben ___' },
      { text: "C'est ___", gloss: 'Bu ___' },
      { text: 'Je veux ___', gloss: '___ istiyorum' },
      { text: 'Où est ___ ?', gloss: '___ nerede?' },
    ],
    A2: [
      { text: "D'habitude ___", gloss: 'Genelde ___' },
      { text: 'Puis-je ___ ?', gloss: '___ yapabilir miyim?' },
      { text: 'Je suis allé à ___', gloss: '___ gittim' },
      { text: 'Tu aimes ___ ?', gloss: '___ sever misin?' },
    ],
    B1: [
      { text: 'Je pense que ___', gloss: 'Bence ___' },
      { text: "J'ai été à ___", gloss: '___ bulundum' },
      { text: 'Cela dépend de ___', gloss: '___ bağlı' },
      { text: 'Je préférerais ___', gloss: '___ tercih ederim' },
    ],
    B2: [
      { text: 'Il est probable que ___', gloss: '___ olması muhtemel' },
      { text: 'Malgré ___, nous avons continué', gloss: '___ rağmen devam ettik' },
      { text: "Je ne suis pas convaincu que ___", gloss: '___ ikna olmadım' },
      { text: 'Il y a une tendance croissante à ___', gloss: '___ artan bir eğilim var' },
    ],
    C1: [
      { text: "Sans ___, nous échouerions", gloss: '___ olmasaydı başarısız olurduk' },
      { text: "On pourrait soutenir que ___", gloss: '___ öne sürülebilir' },
      { text: 'Il ne fait aucun doute que ___', gloss: '___ hiç kuşku yok' },
      { text: 'Non seulement ___, mais cela s’est aussi répandu', gloss: 'Sadece ___ değil, aynı zamanda yayıldı' },
    ],
  },
};

const DE: LangBank = {
  words: {
    A1: [
      { text: 'Wasser', gloss: 'su' },
      { text: 'Haus', gloss: 'ev' },
      { text: 'Freund', gloss: 'arkadaş' },
      { text: 'Essen', gloss: 'yemek' },
    ],
    A2: [
      { text: 'Reise', gloss: 'seyahat' },
      { text: 'Wetter', gloss: 'hava durumu' },
      { text: 'gesund', gloss: 'sağlıklı' },
      { text: 'früh', gloss: 'erken' },
    ],
    B1: [
      { text: 'Entscheidung', gloss: 'karar' },
      { text: 'Erfahrung', gloss: 'deneyim' },
      { text: 'verbessern', gloss: 'geliştirmek' },
      { text: 'Umwelt', gloss: 'çevre' },
    ],
    B2: [
      { text: 'erreichen', gloss: 'başarmak' },
      { text: 'Beweis', gloss: 'kanıt' },
      { text: 'Sorge', gloss: 'kaygı' },
      { text: 'bedeutend', gloss: 'önemli' },
    ],
    C1: [
      { text: 'mehrdeutig', gloss: 'belirsiz' },
      { text: 'kohärent', gloss: 'tutarlı' },
      { text: 'untergraben', gloss: 'zayıflatmak' },
      { text: 'implizit', gloss: 'örtük' },
    ],
  },
  phrases: {
    A1: [
      { text: 'Ich bin ___', gloss: 'Ben ___' },
      { text: 'Das ist ___', gloss: 'Bu ___' },
      { text: 'Ich möchte ___', gloss: '___ istiyorum' },
      { text: 'Wo ist ___?', gloss: '___ nerede?' },
    ],
    A2: [
      { text: 'Normalerweise ___', gloss: 'Genelde ___' },
      { text: 'Kann ich ___?', gloss: '___ yapabilir miyim?' },
      { text: 'Ich bin nach ___ gefahren', gloss: '___ gittim' },
      { text: 'Magst du ___?', gloss: '___ sever misin?' },
    ],
    B1: [
      { text: 'Ich glaube, dass ___', gloss: 'Bence ___' },
      { text: 'Ich war schon in ___', gloss: '___ bulundum' },
      { text: 'Es hängt von ___ ab', gloss: '___ bağlı' },
      { text: 'Ich würde lieber ___', gloss: '___ tercih ederim' },
    ],
    B2: [
      { text: 'Es ist wahrscheinlich, dass ___', gloss: '___ olması muhtemel' },
      { text: 'Trotz ___ haben wir weitergemacht', gloss: '___ rağmen devam ettik' },
      { text: 'Ich bin nicht überzeugt, dass ___', gloss: '___ ikna olmadım' },
      { text: 'Es gibt eine wachsende Tendenz zu ___', gloss: '___ artan bir eğilim var' },
    ],
    C1: [
      { text: 'Ohne ___ würden wir scheitern', gloss: '___ olmasaydı başarısız olurduk' },
      { text: 'Es ließe sich argumentieren, dass ___', gloss: '___ öne sürülebilir' },
      { text: 'Es besteht kein Zweifel, dass ___', gloss: '___ hiç kuşku yok' },
      { text: 'Nicht nur ___, sondern es breitete sich auch aus', gloss: 'Sadece ___ değil, aynı zamanda yayıldı' },
    ],
  },
};

const IT: LangBank = {
  words: {
    A1: [
      { text: 'acqua', gloss: 'su' },
      { text: 'casa', gloss: 'ev' },
      { text: 'amico', gloss: 'arkadaş' },
      { text: 'cibo', gloss: 'yemek' },
    ],
    A2: [
      { text: 'viaggio', gloss: 'seyahat' },
      { text: 'tempo', gloss: 'hava / zaman' },
      { text: 'sano', gloss: 'sağlıklı' },
      { text: 'presto', gloss: 'erken' },
    ],
    B1: [
      { text: 'decisione', gloss: 'karar' },
      { text: 'esperienza', gloss: 'deneyim' },
      { text: 'migliorare', gloss: 'geliştirmek' },
      { text: 'ambiente', gloss: 'çevre' },
    ],
    B2: [
      { text: 'raggiungere', gloss: 'başarmak' },
      { text: 'prova', gloss: 'kanıt' },
      { text: 'preoccupazione', gloss: 'kaygı' },
      { text: 'significativo', gloss: 'anlamlı' },
    ],
    C1: [
      { text: 'ambiguo', gloss: 'belirsiz' },
      { text: 'coerente', gloss: 'tutarlı' },
      { text: 'minare', gloss: 'zayıflatmak' },
      { text: 'implicito', gloss: 'örtük' },
    ],
  },
  phrases: {
    A1: [
      { text: 'Sono ___', gloss: 'Ben ___' },
      { text: 'Questo è ___', gloss: 'Bu ___' },
      { text: 'Voglio ___', gloss: '___ istiyorum' },
      { text: 'Dov’è ___?', gloss: '___ nerede?' },
    ],
    A2: [
      { text: 'Di solito ___', gloss: 'Genelde ___' },
      { text: 'Posso ___?', gloss: '___ yapabilir miyim?' },
      { text: 'Sono andato a ___', gloss: '___ gittim' },
      { text: 'Ti piace ___?', gloss: '___ sever misin?' },
    ],
    B1: [
      { text: 'Penso che ___', gloss: 'Bence ___' },
      { text: 'Sono stato a ___', gloss: '___ bulundum' },
      { text: 'Dipende da ___', gloss: '___ bağlı' },
      { text: 'Preferirei ___', gloss: '___ tercih ederim' },
    ],
    B2: [
      { text: 'È probabile che ___', gloss: '___ olması muhtemel' },
      { text: 'Nonostante ___, abbiamo continuato', gloss: '___ rağmen devam ettik' },
      { text: 'Non sono convinto che ___', gloss: '___ ikna olmadım' },
      { text: 'C’è una tendenza crescente a ___', gloss: '___ artan bir eğilim var' },
    ],
    C1: [
      { text: 'Se non fosse per ___, falliremmo', gloss: '___ olmasaydı başarısız olurduk' },
      { text: 'Si potrebbe sostenere che ___', gloss: '___ öne sürülebilir' },
      { text: 'Non c’è dubbio che ___', gloss: '___ hiç kuşku yok' },
      { text: 'Non solo ___, ma si è anche diffuso', gloss: 'Sadece ___ değil, aynı zamanda yayıldı' },
    ],
  },
};

const JP: LangBank = {
  words: {
    A1: [
      { text: '水', gloss: 'su (mizu)' },
      { text: '家', gloss: 'ev (ie)' },
      { text: '友達', gloss: 'arkadaş (tomodachi)' },
      { text: '食べ物', gloss: 'yemek (tabemono)' },
    ],
    A2: [
      { text: '旅行', gloss: 'seyahat (ryokou)' },
      { text: '天気', gloss: 'hava durumu (tenki)' },
      { text: '健康', gloss: 'sağlık (kenkou)' },
      { text: '早い', gloss: 'erken (hayai)' },
    ],
    B1: [
      { text: '決定', gloss: 'karar (kettei)' },
      { text: '経験', gloss: 'deneyim (keiken)' },
      { text: '改善する', gloss: 'geliştirmek (kaizen suru)' },
      { text: '環境', gloss: 'çevre (kankyou)' },
    ],
    B2: [
      { text: '達成する', gloss: 'başarmak (tassei suru)' },
      { text: '証拠', gloss: 'kanıt (shouko)' },
      { text: '懸念', gloss: 'kaygı (kenen)' },
      { text: '重要', gloss: 'önemli (juuyou)' },
    ],
    C1: [
      { text: '曖昧', gloss: 'belirsiz (aimai)' },
      { text: '一貫した', gloss: 'tutarlı (ikkanshita)' },
      { text: '暗黙の', gloss: 'örtük (anmoku no)' },
      { text: '論争', gloss: 'tartışma (ronsou)' },
    ],
  },
  phrases: {
    A1: [
      { text: '___ がほしいです', gloss: '___ istiyorum' },
      { text: 'これは ___ です', gloss: 'Bu ___' },
      { text: '___ はどこですか', gloss: '___ nerede?' },
      { text: '私は ___ です', gloss: 'Ben ___' },
    ],
    A2: [
      { text: '___ に行きました', gloss: '___ gittim' },
      { text: '___ が好きです', gloss: '___ seviyorum' },
      { text: '___ できますか', gloss: '___ yapabilir misin?' },
      { text: '天気は ___ です', gloss: 'Hava ___' },
    ],
    B1: [
      { text: '___ と思います', gloss: 'Bence ___' },
      { text: '___ を改善したいです', gloss: '___ geliştirmek istiyorum' },
      { text: '___ によります', gloss: '___ bağlı' },
      { text: '___ したことがあります', gloss: 'Daha önce ___ yaptım' },
    ],
    B2: [
      { text: '___ 可能性が高いです', gloss: '___ olması muhtemel' },
      { text: '___ にもかかわらず続けました', gloss: '___ rağmen devam ettik' },
      { text: '___ に納得していません', gloss: '___ ikna olmadım' },
      { text: '___ という傾向があります', gloss: '___ yönünde eğilim var' },
    ],
    C1: [
      { text: '___ がなければ失敗します', gloss: '___ olmasaydı başarısız oluruz' },
      { text: '___ と言えるでしょう', gloss: '___ denebilir' },
      { text: '___ は疑いの余地がありません', gloss: '___ hiç kuşku yok' },
      { text: '___ だけでなく広がりました', gloss: 'Sadece ___ değil, yayıldı' },
    ],
  },
};

export const BANKS: Record<string, LangBank> = {
  EN, ES, FR, DE, IT, JP,
};

// Genişletme paketini ana bankaya ekle
for (const langId of Object.keys(EXTRA)) {
  const bank = BANKS[langId];
  if (!bank) continue;
  for (const level of CEFR_ORDER) {
    const w = EXTRA[langId].words[level];
    if (w) bank.words[level].push(...w.map(([text, gloss]) => ({ text, gloss })));
    const p = EXTRA[langId].phrases[level];
    if (p) bank.phrases[level].push(...p.map(([text, gloss]) => ({ text, gloss })));
  }
}

export const LANG_NAMES: Record<string, string> = {
  EN: 'İngilizce',
  ES: 'İspanyolca',
  FR: 'Fransızca',
  DE: 'Almanca',
  IT: 'İtalyanca',
  JP: 'Japonca',
};

export function wordsOf(langId: string, level: CEFR): Entry[] {
  return BANKS[langId]?.words[level] ?? BANKS.EN.words[level];
}

export function phraseBankOf(langId: string, level: CEFR): Entry[] {
  return BANKS[langId]?.phrases[level] ?? BANKS.EN.phrases[level];
}

/** CEFR yeterlilik özeti — her dil/seviye için kaç kelime ve kalıp var */
export function coverageReport() {
  return Object.keys(BANKS).map((lang) => ({
    lang,
    levels: CEFR_ORDER.map((level) => ({
      level,
      words: BANKS[lang].words[level].length,
      phrases: BANKS[lang].phrases[level].length,
    })),
  }));
}
