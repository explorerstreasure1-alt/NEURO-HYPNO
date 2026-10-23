// CEFR havuzunu genişletme: her dil/seviye için +2 kelime, +2 kalıp.
// lexicon.ts bunları ana bankaya ekler.

export type ExtraMap = Record<string, {
  words: Record<string, [string, string][]>;
  phrases: Record<string, [string, string][]>;
}>;

export const EXTRA: ExtraMap = {
  EN: {
    words: {
      A1: [['book', 'kitap'], ['family', 'aile']],
      A2: [['market', 'pazar / market'], ['ticket', 'bilet']],
      B1: [['opportunity', 'fırsat'], ['responsible', 'sorumlu']],
      B2: [['assumption', 'varsayım'], ['reluctant', 'isteksiz']],
      C1: [['plausible', 'akla yatkın'], ['notwithstanding', 'buna rağmen']],
    },
    phrases: {
      A1: [['How much is ___?', '___ ne kadar?'], ['I have ___', 'Bende ___ var']],
      A2: [['I need to ___', '___ yapmam gerek'], ['What time is ___?', '___ saat kaçta?']],
      B1: [['I am used to ___', '___ alışkınım'], ['It seems that ___', '___ gibi görünüyor']],
      B2: [['___ is unlikely to', '___ olası değil'], ['One of the main reasons is ___', 'Ana nedenlerden biri ___']],
      C1: [['___ tends to be overlooked', '___ gözden kaçma eğilimindedir'], ['This raises the question of ___', 'Bu ___ sorusunu doğuruyor']],
    },
  },
  ES: {
    words: {
      A1: [['libro', 'kitap'], ['familia', 'aile']],
      A2: [['mercado', 'pazar'], ['billete', 'bilet']],
      B1: [['oportunidad', 'fırsat'], ['responsable', 'sorumlu']],
      B2: [['suposición', 'varsayım'], ['reacio', 'isteksiz']],
      C1: [['plausible', 'akla yatkın'], ['no obstante', 'buna rağmen']],
    },
    phrases: {
      A1: [['¿Cuánto cuesta ___?', '___ ne kadar?'], ['Tengo ___', 'Bende ___ var']],
      A2: [['Necesito ___', '___ yapmam gerek'], ['¿A qué hora es ___?', '___ saat kaçta?']],
      B1: [['Estoy acostumbrado a ___', '___ alışkınım'], ['Parece que ___', '___ gibi görünüyor']],
      B2: [['Es poco probable que ___', '___ olası değil'], ['Una de las razones principales es ___', 'Ana nedenlerden biri ___']],
      C1: [['___ suele pasarse por alto', '___ gözden kaçma eğilimindedir'], ['Esto plantea la cuestión de ___', 'Bu ___ sorusunu doğuruyor']],
    },
  },
  FR: {
    words: {
      A1: [['livre', 'kitap'], ['famille', 'aile']],
      A2: [['marché', 'pazar'], ['billet', 'bilet']],
      B1: [['occasion', 'fırsat'], ['responsable', 'sorumlu']],
      B2: [['hypothèse', 'varsayım'], ['réticent', 'isteksiz']],
      C1: [['plausible', 'akla yatkın'], ['néanmoins', 'buna rağmen']],
    },
    phrases: {
      A1: [['Combien coûte ___ ?', '___ ne kadar?'], ["J'ai ___", 'Bende ___ var']],
      A2: [['Je dois ___', '___ yapmam gerek'], ['À quelle heure est ___ ?', '___ saat kaçta?']],
      B1: [["J'ai l'habitude de ___", '___ alışkınım'], ['Il semble que ___', '___ gibi görünüyor']],
      B2: [['Il est peu probable que ___', '___ olası değil'], ["L'une des principales raisons est ___", 'Ana nedenlerden biri ___']],
      C1: [['___ a tendance à être négligé', '___ gözden kaçma eğilimindedir'], ['Cela soulève la question de ___', 'Bu ___ sorusunu doğuruyor']],
    },
  },
  DE: {
    words: {
      A1: [['Buch', 'kitap'], ['Familie', 'aile']],
      A2: [['Markt', 'pazar'], ['Fahrkarte', 'bilet']],
      B1: [['Gelegenheit', 'fırsat'], ['verantwortlich', 'sorumlu']],
      B2: [['Annahme', 'varsayım'], ['zögernd', 'isteksiz']],
      C1: [['plausibel', 'akla yatkın'], ['nichtsdestotrotz', 'buna rağmen']],
    },
    phrases: {
      A1: [['Wie viel kostet ___?', '___ ne kadar?'], ['Ich habe ___', 'Bende ___ var']],
      A2: [['Ich muss ___', '___ yapmam gerek'], ['Um wie viel Uhr ist ___?', '___ saat kaçta?']],
      B1: [['Ich bin an ___ gewöhnt', '___ alışkınım'], ['Es scheint, dass ___', '___ gibi görünüyor']],
      B2: [['Es ist unwahrscheinlich, dass ___', '___ olası değil'], ['Einer der Hauptgründe ist ___', 'Ana nedenlerden biri ___']],
      C1: [['___ wird oft übersehen', '___ gözden kaçma eğilimindedir'], ['Das wirft die Frage auf, ob ___', 'Bu ___ sorusunu doğuruyor']],
    },
  },
  IT: {
    words: {
      A1: [['libro', 'kitap'], ['famiglia', 'aile']],
      A2: [['mercato', 'pazar'], ['biglietto', 'bilet']],
      B1: [['opportunità', 'fırsat'], ['responsabile', 'sorumlu']],
      B2: [['ipotesi', 'varsayım'], ['riluttante', 'isteksiz']],
      C1: [['plausibile', 'akla yatkın'], ['ciononostante', 'buna rağmen']],
    },
    phrases: {
      A1: [['Quanto costa ___?', '___ ne kadar?'], ['Ho ___', 'Bende ___ var']],
      A2: [['Devo ___', '___ yapmam gerek'], ['A che ora è ___?', '___ saat kaçta?']],
      B1: [['Sono abituato a ___', '___ alışkınım'], ['Sembra che ___', '___ gibi görünüyor']],
      B2: [['È improbabile che ___', '___ olası değil'], ['Una delle ragioni principali è ___', 'Ana nedenlerden biri ___']],
      C1: [['___ tende a essere trascurato', '___ gözden kaçma eğilimindedir'], ['Ciò solleva la questione di ___', 'Bu ___ sorusunu doğuruyor']],
    },
  },
  JP: {
    words: {
      A1: [['本', 'kitap (hon)'], ['家族', 'aile (kazoku)']],
      A2: [['市場', 'pazar (ichiba)'], ['切符', 'bilet (kippu)']],
      B1: [['機会', 'fırsat (kikai)'], ['責任', 'sorumluluk (sekinin)']],
      B2: [['仮定', 'varsayım (katei)'], ['気が進まない', 'isteksiz (ki ga susumanai)']],
      C1: [['もっともらしい', 'akla yatkın (mottomorashii)'], ['それにもかかわらず', 'buna rağmen (sore ni mo kakawarazu)']],
    },
    phrases: {
      A1: [['___ はいくらですか', '___ ne kadar?'], ['___ を持っています', 'Bende ___ var']],
      A2: [['___ しなければなりません', '___ yapmam gerek'], ['___ は何時ですか', '___ saat kaçta?']],
      B1: [['___ に慣れています', '___ alışkınım'], ['___ ようです', '___ gibi görünüyor']],
      B2: [['___ 可能性は低いです', '___ olası değil'], ['主な理由の一つは ___ です', 'Ana nedenlerden biri ___']],
      C1: [['___ は見落とされがちです', '___ gözden kaçma eğilimindedir'], ['これは ___ という問題を提起します', 'Bu ___ sorusunu doğuruyor']],
    },
  },
};
