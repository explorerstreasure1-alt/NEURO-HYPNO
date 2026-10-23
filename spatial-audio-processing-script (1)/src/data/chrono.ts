// ============================================================
// KRONOBİYOLOJİ YARDIMCILARI
// ------------------------------------------------------------
// 1) Ultradiyan uyku döngüsü (~90 dk): Uyku, yaklaşık 90 dakikalık
//    NREM→REM döngüleri hâlinde ilerler. Bir döngünün ORTASINDA
//    (yavaş-dalga/derin uyku bölgesinde) uyandırılmak "uyku ataleti"
//    (sleep inertia) denen ağırlık/sersemlik hissine yol açar; döngü
//    SINIRINA yakın uyanmak çok daha kolaydır (Dement & Kleitman, 1957;
//    popülerleştiren: Richard Wiseman'ın "90 dakika kuralı").
// 2) Akşam mavi ışık/ekran parlaklığı: Kısa dalga boylu ışık melatonin
//    salınımını geciktirir (Chang et al., 2015, PNAS). Bu yüzden seans
//    sırasında ekranı koyulaştırıp sıcak tonlamaya çekmek ("Gece Kalkanı")
//    hem bilimsel hem pratik bir iyileştirmedir.
// ============================================================

export const ULTRADIAN_CYCLE_MIN = 90;

export interface CycleAssessment {
  fullCycles: number; // tam döngü sayısı (90 dk katları)
  remainderMin: number; // döngü içi kalan dakika
  risk: 'düşük' | 'orta' | 'yüksek'; // uyku ataleti riski
  note: string;
}

/**
 * Verilen süre (dk) bir uyku döngüsünün neresine denk geliyor, oradan
 * uyku ataleti riskini kabaca tahmin eder. Döngünün ilk %20'si (hafif
 * uyku) ve son %15'i (REM'e yakın) düşük risk; orta kesim (derin uyku
 * penceresi, ~dk 25-70) yüksek risk.
 */
export function assessCycleEnd(minutes: number): CycleAssessment {
  const fullCycles = Math.floor(minutes / ULTRADIAN_CYCLE_MIN);
  const remainderMin = minutes % ULTRADIAN_CYCLE_MIN;
  const pos = remainderMin / ULTRADIAN_CYCLE_MIN; // 0..1 döngü içi konum

  let risk: CycleAssessment['risk'];
  let note: string;
  if (remainderMin === 0) {
    risk = 'düşük';
    note = `${fullCycles} tam uyku döngüsü — döngü sınırında bitiyor, uyanması kolay`;
  } else if (pos < 0.2 || pos > 0.85) {
    risk = 'düşük';
    note = 'Döngü kenarına yakın bitiyor — hafif uykuda, uyanması kolay';
  } else if (pos < 0.45 || pos > 0.7) {
    risk = 'orta';
    note = 'Döngü ortasına yakın — hafif sersemlik olasılığı var';
  } else {
    risk = 'yüksek';
    note = 'Muhtemel derin uyku penceresi — uyku ataleti (sersemlik) riski yüksek';
  }
  return { fullCycles, remainderMin, risk, note };
}

export function nearestFullCycleMinutes(minutes: number): number {
  return Math.max(ULTRADIAN_CYCLE_MIN, Math.round(minutes / ULTRADIAN_CYCLE_MIN) * ULTRADIAN_CYCLE_MIN);
}

export const RISK_COLOR: Record<CycleAssessment['risk'], string> = {
  'düşük': '#34d399',
  'orta': '#fbbf24',
  'yüksek': '#fb7185',
};
