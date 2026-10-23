// ============================================================
// BİLİMSEL ARALIKLI TEKRAR — Ebbinghaus Unutma Eğrisi + Test Etkisi
// ------------------------------------------------------------
// Dayanak: Hermann Ebbinghaus'un unutma eğrisi, yeni bilginin zamanla
// üstel olarak unutulduğunu; ancak doğru aralıklarla tekrar edilen
// bilginin "hatırlama eğrisini" her seferinde düzleştirdiğini gösterir
// (spacing effect). Buna ek olarak "testing effect" (Roediger & Karpicke,
// 2006) edilgen tekrardan çok aktif hatırlamanın (flashcard, kendi kendini
// sınama) kalıcılığı güçlendirdiğini gösteriyor — uygulamadaki sabah testi
// zaten bunu yapıyor, ama şimdi GERÇEK bir programa bağlanıyor.
// ============================================================

export interface SrsCard {
  word: string;
  gloss: string;
  langId: string;
  reps: number; // başarılı ardışık tekrar sayısı
  lapses: number; // unutma sayısı
  dueTs: number; // sıradaki tekrarın zamanı (ms epoch)
  lastReviewTs: number;
}

export type SrsDeck = Record<string, SrsCard>; // key = `${langId}:${word}`

// Klasik aralıklı tekrar programı (gün): 1, 2, 4, 7, 14, 30, 90
// (Pimsleur/SuperMemo-ilhamlı, basitleştirilmiş sabit aralık dizisi)
export const SRS_INTERVALS_DAYS = [1, 2, 4, 7, 14, 30, 90];
const DAY_MS = 24 * 60 * 60 * 1000;

export function srsKey(langId: string, word: string): string {
  return `${langId}:${word}`;
}

export function srsIntervalDays(reps: number): number {
  const idx = Math.min(reps, SRS_INTERVALS_DAYS.length - 1);
  return SRS_INTERVALS_DAYS[Math.max(0, idx)];
}

/** Yeni kelimeyi ilk kez deste kaydına ekler (henüz tekrar edilmemiş). */
export function newSrsCard(langId: string, word: string, gloss: string, now = Date.now()): SrsCard {
  return { word, gloss, langId, reps: 0, lapses: 0, dueTs: now + DAY_MS, lastReviewTs: 0 };
}

/** Test sonucuna göre kartı yeniden zamanlar (basitleştirilmiş SM-2 mantığı). */
export function reviewSrsCard(card: SrsCard, known: boolean, now = Date.now()): SrsCard {
  if (known) {
    const reps = card.reps + 1;
    const days = srsIntervalDays(reps);
    return { ...card, reps, dueTs: now + days * DAY_MS, lastReviewTs: now };
  }
  // Unutma (lapse): program sıfırlanır ama tamamen başa dönmez — ertesi gün tekrar.
  return { ...card, reps: Math.max(0, card.reps - 1), lapses: card.lapses + 1, dueTs: now + DAY_MS, lastReviewTs: now };
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.dueTs <= now;
}

export function daysUntilDue(card: SrsCard, now = Date.now()): number {
  return Math.max(0, Math.ceil((card.dueTs - now) / DAY_MS));
}

export function dueCards(deck: SrsDeck, now = Date.now()): SrsCard[] {
  return Object.values(deck).filter((c) => isDue(c, now)).sort((a, b) => a.dueTs - b.dueTs);
}

/** Ebbinghaus eğrisi: tekrar olmadan hatırlama olasılığı (yaklaşık model, R = e^-t/S). */
export function retentionAt(hoursSinceReview: number, stability = 24): number {
  return Math.exp(-hoursSinceReview / stability);
}
