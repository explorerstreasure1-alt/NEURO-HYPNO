// ============================================================
// NEURO-HYPNO · KALİTE KONTROL — 3 Nörolog/Sinirbilimci İncelemesi
// Bu dosya, uygulamanın bilimsel dürüstlük ve güvenlik denetiminin
// sonuçlarını ve buradan doğan somut ürün düzeltmelerini içerir.
// ============================================================

export interface Finding {
  sev: 'kritik' | 'orta' | 'düşük';
  text: string;
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  focus: string;
  color: string;
  avatar: string; // kısa baş harf rozeti
  findings: Finding[];
  verdict: string;
  fix: string;
}

export const EXPERTS: Expert[] = [
  {
    id: 'sleep',
    name: 'Dr. A. Yıldıran',
    title: 'Uyku Nörolojisi Uzmanı',
    focus: 'Uyku mimarisi · uyku hijyeni · arousal eşikleri',
    color: '#818cf8',
    avatar: 'AY',
    findings: [
      { sev: 'kritik', text: 'Tüm gece boyunca duyulabilir seviyede döngüye giren ses, mikro-uyanmalara (arousal) yol açarak uyku sürekliliğini böler — bu da ironik şekilde hafıza pekiştirmesini güçlendirmek yerine zayıflatabilir.' },
      { sev: 'orta', text: '"Beden uyur, bilinç açık kalır" çerçevesi dikkatli sunulmalı; bazı kullanıcılarda bu tarif uyku felci (sleep paralysis) deneyimine benzer çağrışım yapıp rahatsızlık verebilir.' },
      { sev: 'düşük', text: 'Sabit yatma saati hatırlatıcısı ve ritüel listesi iyi uygulama; sürdürülmeli.' },
    ],
    verdict: 'Uyarı: sürekli uyarana maruziyet süresi sınırlanmalı.',
    fix: 'Akıllı Söndürme (Smart Taper) eklendi: kritik pencere sonunda fısıltı ve uyarı kademeli olarak kısılıp neredeyse sessizliğe iner — tüm gece yüksek seviyede çalmaz.',
  },
  {
    id: 'memory',
    name: 'Dr. E. Karaman',
    title: 'Bilişsel Sinirbilimci · Hafıza Araştırmacısı',
    focus: 'Uyku ve hafıza pekiştirmesi · hedefli hafıza yeniden etkinleştirme (TMR)',
    color: '#34d399',
    avatar: 'EK',
    findings: [
      { sev: 'kritik', text: 'Literatür, tamamen uykuda iken YENİ ve karmaşık kelime dağarcığının "öğrenilebildiğini" desteklemiyor. Buna karşın, uyanıkken öğrenilmiş materyalin yavaş-dalga uykusunda ipuçlarla yeniden etkinleştirilmesinin (Targeted Memory Reactivation) pekiştirmeyi güçlendirdiğine dair tutarlı bulgular var.' },
      { sev: 'orta', text: 'Uygulama metinleri "uyurken dil öğren" ifadesini öğrenmenin tamamen uykuda gerçekleştiği izlenimiyle sunuyor — bu abartılı bir iddia.' },
      { sev: 'düşük', text: 'A-A-A-A kafiye tekrarı ve ertesi sabah testi (active recall) doğru yönde — pekiştirmeyi destekleyen alışkanlıklar.' },
    ],
    verdict: 'Çerçeve düzeltilmeli: "uykuda öğren" değil, "uyanıkken kodla, uykuda pekiştir".',
    fix: '"Uyanıkken Kodlama" adımı eklendi: seans başlamadan önce 60-90 saniyelik etkin hatırlama turu yapılır; gece sesi bu materyali yeniden etkinleştiren bir TMR ipucu olarak çerçevelenir. Pazarlama dili boyunca "pekiştirme" vurgusu güçlendirildi.',
  },
  {
    id: 'clinical',
    name: 'Dr. M. Soysal',
    title: 'Klinik Nörolog · Epileptoloji',
    focus: 'Ritmik uyaran güvenliği · kontrendikasyonlar · işitsel maruziyet',
    color: '#fb7185',
    avatar: 'MS',
    findings: [
      { sev: 'kritik', text: 'Uygulamada tıbbi güvenlik uyarısı / kontrendikasyon ekranı bulunmuyor. Ritmik işitsel uyaranlar (binaural/izokronik) fotosensitif epilepsiye kıyasla çok daha nadir olsa da bazı duyarlı bireylerde rahatsızlık veya tetikleyici etki bildirilmiştir.' },
      { sev: 'kritik', text: 'Hoparlör modunda "zayıf bas" tespitinde uygulanan otomatik kazanç artışı (harmonik + thump güçlendirme) işitsel güvenlik tavanı olmadan teorik olarak rahatsız edici seviyelere çıkabilir.' },
      { sev: 'orta', text: 'Gebelik, kalp pili, migren hassasiyeti, 18 yaş altı gibi gruplar için özel bir yönlendirme/uyarı yok.' },
    ],
    verdict: 'Zorunlu güvenlik onayı ve sabit kazanç tavanı olmadan yayına uygun değil.',
    fix: 'İlk kullanımda atlanamayan Güvenlik Onayı eklendi (epilepsi/gebelik/kalp pili/migren/18 yaş altı uyarıları). Hoparlör motoruna donanımdan bağımsız sabit güvenlik tavanı (gain ceiling) eklendi — kalibrasyon "artırsa" bile bu sınır aşılamaz.',
  },
  {
    id: 'chrono',
    name: 'Dr. S. Aydemir',
    title: 'Kronobiyolog · Uyku-Hafıza Zamanlama Uzmanı',
    focus: 'Hedefli hafıza yeniden etkinleştirme (TMR) tutarlılığı · ultradiyan ritim · ışık hijyeni',
    color: '#fbbf24',
    avatar: 'SA',
    findings: [
      { sev: 'kritik', text: '"Uyanıkken kodla, uykuda pekiştir" ilkesi doğru ama uygulanışı tutarsız: gece boyu 45 dakikada bir YENİ bir kafiye grubuna geçiliyor. TMR literatüründe ipucu (ses) ile hedef (kodlanan bilgi) BİREBİR eşleşmeli; kodlanmamış yeni kelimeleri uykuda çalmak "uykuda öğrenim" iddiasına geri döner ve ilk düzeltmeyi (Dr. Karaman) zayıflatır.' },
      { sev: 'orta', text: '"Ustalaşma" tek seferlik bir bayrak (mastered listesi) olarak tutuluyor; Ebbinghaus unutma eğrisi her tekrarsız geçen günde hatırlama olasılığının üstel azaldığını gösteriyor. Gerçek bir aralıklı tekrar programı (spaced repetition) yok.' },
      { sev: 'orta', text: 'Yatmadan hemen önce parlak/soğuk tonlu ekrana bakmak melatonin salınımını geciktirir (Chang ve ark., 2015). Seans ekranında ışık hijyeni önlemi bulunmuyor.' },
      { sev: 'düşük', text: 'Uyku yaklaşık 90 dakikalık ultradiyan döngüler hâlinde ilerler; döngü ortasında (derin uyku) biten bir zamanlayıcı uyku ataletine (sersemlik) yol açabilir. Zamanlayıcı seçenekleri bu döngüyle hizalı değil.' },
    ],
    verdict: 'Gece boyu yeni içerik akışı durdurulup tutarlı ipucu + gerçek aralıklı tekrar + ışık/döngü farkındalığı eklenmeli.',
    fix: 'Pekiştirme Doğruluğu (Cue-Consistency) motoru eklendi: yalnızca uyanıkken kodlanan aşama "tam pekiştirme" sesiyle çalar, kodlanmamış aşamalar kısık "pasif tanışma" olarak işaretlenir. Ebbinghaus tabanlı Bilimsel Aralıklı Tekrar (1-2-4-7-14-30-90 gün) ve sabah testine bağlı gerçek inceleme takvimi eklendi. Seans sırasında Gece Kalkanı (sıcak/koyu renk filtresi) otomatik devreye giriyor. Uyku zamanlayıcısına 90 dk döngü hizalaması ve uyku ataleti riski göstergesi eklendi.',
  },
];

export interface FixItem {
  title: string;
  before: string;
  after: string;
  owner: string; // expert id
}

export const FIXES_APPLIED: FixItem[] = [
  {
    title: 'Akıllı Söndürme (Smart Taper)',
    before: 'Seans sonuna kadar sabit/yüksek seviyede çalardı.',
    after: 'Kritik pencere sonunda (ilk ~12 dk veya seans süresinin %60\'ı) fısıltı ve uyaran otomatik olarak kademeli kısılır; uyku sürekliliği korunur.',
    owner: 'sleep',
  },
  {
    title: 'Uyanıkken Kodlama Adımı',
    before: 'Kelimeler yalnızca uykuda "öğreniliyormuş" gibi sunuluyordu.',
    after: 'Seans öncesi 60-90sn etkin hatırlama turu eklendi; gece sesi artık bilimsel olarak desteklenen bir pekiştirme (TMR) ipucu olarak konumlandırıldı.',
    owner: 'memory',
  },
  {
    title: 'Zorunlu Güvenlik Onayı',
    before: 'Herhangi bir tıbbi uyarı / kontrendikasyon ekranı yoktu.',
    after: 'İlk sesli seanstan önce atlanamayan onay ekranı: epilepsi, gebelik, kalp pili, migren, 18 yaş altı ve "rahatsızlık hissedersen durdur" uyarıları.',
    owner: 'clinical',
  },
  {
    title: 'Hoparlör Güvenlik Tavanı',
    before: 'Zayıf hoparlör tespitinde kazanç artışı teorik olarak sınırsızdı.',
    after: 'Motor seviyesinde sabit maksimum kazanç tavanı eklendi — kalibrasyon hiçbir zaman bu sınırı aşamaz.',
    owner: 'clinical',
  },
  {
    title: 'Dürüst Pazarlama Dili',
    before: '"Kritik filtrenin altından geçiyor" gibi sözde-bilimsel ifadeler.',
    after: 'Faz notları "pekiştirme / gevşeme / hatırlama ipucu" gibi temellendirilmiş dile çevrildi.',
    owner: 'memory',
  },
  {
    title: 'Pekiştirme Doğruluğu (Cue-Consistency)',
    before: 'Gece boyu 45 dakikada bir kodlanmamış yeni kafiye grupları çalınıyordu — TMR ilkesiyle çelişiyordu.',
    after: 'Yalnızca az önce uyanıkken kodladığın aşama tam ses seviyesinde "TMR Pekiştirme" olarak çalar; henüz kodlanmamış aşamalar otomatik kısılıp dürüstçe "Pasif Tanışma" olarak etiketlenir ve tek dokunuşla kodlanabilir.',
    owner: 'chrono',
  },
  {
    title: 'Bilimsel Aralıklı Tekrar (Ebbinghaus)',
    before: '"Ustalaşma" kalıcı bir bayraktı; zamanla unutma hiç hesaba katılmıyordu.',
    after: '1-2-4-7-14-30-90 günlük aralıklı tekrar programı eklendi; her kelimenin "sıradaki tekrar" tarihi hesaplanıyor, vadesi gelenler ayrı bir inceleme turunda test ediliyor.',
    owner: 'chrono',
  },
  {
    title: 'Gece Kalkanı (Işık Hijyeni)',
    before: 'Seans sırasında ekran parlaklığı/renk sıcaklığı hiç değişmiyordu.',
    after: 'Seans başladığında ekrana otomatik sıcak/koyu bir filtre (Night Shield) uygulanıyor; akıllı söndürme fazında filtre daha da koyulaşıyor.',
    owner: 'chrono',
  },
  {
    title: '90 Dakikalık Uyku Döngüsü Hizalaması',
    before: 'Zamanlayıcı seçenekleri keyfi (10/20/30/45/60/90) sunuluyordu.',
    after: '90 dakika "tam döngü" olarak işaretlendi; diğer sürelerde döngü-içi bitiş noktasına göre uyku ataleti riski (düşük/orta/yüksek) gösteriliyor.',
    owner: 'chrono',
  },
];

export const DISCLAIMER_POINTS: { icon: string; text: string }[] = [
  { icon: 'brain', text: 'Epilepsi veya nöbet geçmişiniz varsa ritmik ses/titreşim uyaranlarını kullanmadan önce doktorunuza danışın.' },
  { icon: 'heart', text: 'Kalp pili veya implante edilmiş elektronik cihazınız varsa tıbbi onay almadan kullanmayın.' },
  { icon: 'baby', text: 'Gebelik döneminde veya 18 yaş altı kullanıcılarda ebeveyn/hekim gözetimi önerilir.' },
  { icon: 'zap', text: 'Migren, vertigo veya ışığa/sese aşırı duyarlılık öyküsü varsa düşük seviyeyle başlayın, rahatsızlık hissedince hemen durdurun.' },
  { icon: 'ear', text: 'Ses seviyesini her zaman uyurken kulağa/odaya zarar vermeyecek şekilde düşük tutun — bu bir işitsel cihaz güvenlik sınırı değildir.' },
  { icon: 'book', text: 'Bu uygulama bir tıbbi cihaz değildir ve dil öğrenimini uyanıkken çalışmanın yerine koymaz; bilimsel çerçevesi "uyanıkken kodla, uykuda pekiştir" ilkesine dayanır.' },
];

export const CRITICAL_WINDOW_RATIO = 0.6; // seans süresinin bu oranından sonra taper başlar
export const CRITICAL_WINDOW_MAX_SEC = 720; // ya da en geç 12 dakikada (hangisi önce gelirse)
