# NEURO-HYPNO — Kalite Kontrol Raporu (Nörobilim + Dil Uzmanı)

Tarih: 2026-10-23 · `npm run build` ✅ · `npx tsc --noEmit` ✅

---

## 1. Bulunan Gerçek Hatalar ve Düzeltmeleri

| # | Hata | Etki | Düzeltme |
|---|------|------|----------|
| 1 | `setEntrainment` alt sınırı 2 Hz | 1.5 Hz derin delta **hiç çalışmıyordu** (2 Hz'e kırpılıyordu) | Alt sınır 0.5 Hz |
| 2 | `speakLightWhisper` içinde `this.ctx!` | Motor açılmadan çağrılırsa **çökme** | `await this.ensure()` eklendi, async yapıldı |
| 3 | `pickVoice()` tanımsızdı / `getVoice()` | Derleme hatası riski | `loadVoices()` + `speakRaw()` ile yeniden yazıldı |
| 4 | Ses listesi ilk çağrıda boş | **Hiç okumama** (sessiz başarısızlık) | `voiceschanged` + 1.2 s timeout ile bekleniyor |
| 5 | `onend` bazı tarayıcıda tetiklenmiyor | Döngü kilitlenmesi | `speakRaw` içinde güvenlik zaman aşımı |
| 6 | `Test` / `NeuroImprint` ekranları hiçbir yere bağlı değildi | Kullanıcı **test edemiyordu** | `Tab`'a `imprint` + `test` eklendi, Home'a giriş kartı |
| 7 | `rhymes.ts` CEFR seviyesini yok sayıyordu | A1 ile C1 aynı zorlukta | `LEVEL_POOL` + `LEVEL_RATE` |
| 8 | `neuroImprint` sonsuz özyineleme | Uzun oturumda bellek şişmesi | `while` döngüsü + `stopNeuroImprint()` |
| 9 | `rampToPhase` taşıyıcıyı kaydırmıyordu, kullanılmayan değişken | Geçiş yoktu | `oscL/oscR` `setTargetAtTime` ile gerçek rampa |
| 10 | Yankılı okuma sırasında `master` 0.95'e çıkıyordu | Yatak konuşmayı **maskeliyordu** (cızırtı hissi) | Konuşma sırasında yatak 0.30'a kısılıyor |

---

## 2. Nörobilimsel Değerlendirme

* **Hedef durum:** beden uykuda (somatik gevşeme), korteks theta'da (hipnagojik pencere).
* **Taşıyıcı:** 196–200 Hz. Kulaklıkta L/R ayrımı, hoparlörde izokronik harmonik yığın.
* **Beat:** uyanıklık 10 Hz → uyku 2.5 Hz. Derin faz 1.5 Hz, artık gerçekten uygulanıyor.
* **Güvenlik tavanları:** `SAFE_SPEAKER_GAIN_CEILING = 0.52`, `SAFE_PHONES_GAIN_CEILING = 0.34` korunuyor.
* **Konuşma sırasında yatak kısma:** işitsel maskeleme azaltıldı → kelime anlaşılırlığı arttı. TMR (targeted memory reactivation) için doğru yaklaşım.
* **Uyarı:** 1.5 Hz + yüksek ses uzun süre kullanılmamalı; `disclaimer` ekranı zorunlu kalmalı.

## 3. Dil Uzmanı Değerlendirmesi

* **CEFR hızları:** A1 0.78 · A2 0.85 · B1 0.92 · B2 0.98 · C1 1.02
* **Kalıp havuzu:** A1 en basit 3 kalıp, C1 ileri 3 kalıp. Her set 4 **tekrarsız** satır.
* **Swell okuma:** cümle kelimelere bölünür, ses `0.35 → 1.0 → 0.35` sinüs zarfıyla okunur (kısıktan yükseğe, yüksekten kısığa).
* **Yankı:** bodrum (RT60 2.2 s), sahne (1.8 s), otopark (2.5 s). Netlik için wet %38–48 aralığında tutuldu.
* **Bilinen sınır:** `SpeechSynthesis` çıktısı Web Audio grafiğine sokulamıyor; yankı, motorun reverb yatağı ile birlikte çalışıyor. Gerçek "sesin kendisi yankılanıyor" etkisi için TTS'i dosya olarak alıp `decodeAudioData` ile `ConvolverNode`'a bağlamak gerekir (sonraki adım).

## 4. Sonraki Adımlar (öneri)

1. TTS → AudioBuffer → Convolver zinciri (gerçek yankı).
2. `onboundary` ile kelime bazlı vurgu ve zamanlama.
3. Faz geçişlerini oturum zaman çizelgesine bağlama (0–10–20–42 dk).
4. Kulaklık/hoparlör otomatik algılama ve kalibrasyon hatırlatıcısı.
5. Oturum günlüğü + sabah hatırlama testi ile etkinlik ölçümü.
