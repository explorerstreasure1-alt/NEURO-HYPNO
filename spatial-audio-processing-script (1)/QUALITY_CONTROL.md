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

## 4. Gerçek Yankı (tamamlandı)

Önceki sınır: `SpeechSynthesis` çıktısı Web Audio'ya sokulamıyordu.

Çözüm:
* `api/tts.ts` — Vercel Edge Function. Google TTS, başarısızsa StreamElements'e düşer. CORS açık, `audio/mpeg` döner.
* `src/audio/tts.ts` — `fetch → arrayBuffer → decodeAudioData`.
* `src/audio/echoChain.ts` — gerçek grafik:
  `input → dry → limiter → out`
  `input → preDelay → convolver(RT60 IR) → damp → wet → limiter`
  `input → ping-pong delay L/R (feedback + pan) → limiter`
* `engine.speakWithRealEcho()` — buffer'ı bu zincirden geçirir. Endpoint yoksa/başarısızsa Web Speech'e düşer.
* `engine.playEchoDemo()` — ağ olmadan yankıyı kanıtlayan vokal benzeri test buffer'ı.

Yankı profilleri (gerçek IR):
| Profil | RT60 | Pre-delay | Wet | Damp | Ping-pong |
|---|---|---|---|---|---|
| Bodrum | 2.2 s | 20 ms | 0.46 | 4.2 kHz | 110 ms / 0.22 |
| Sahne | 1.4 s | 12 ms | 0.32 | 6.8 kHz | 80 ms / 0.14 |
| Otopark | 3.0 s | 32 ms | 0.55 | 3.2 kHz | 150 ms / 0.30 |

Devreye alma: Vercel'de proje kökü uygulama klasörü olmalı ki `/api/tts` yayınlansın.
Yerelde test için: `npx vercel dev` veya Test ekranındaki endpoint alanına kendi URL'ni gir.

## 4b. CEFR Yeterlilik Denetimi (dil uzmanı)

Eski durum: dil başına yalnızca 6 kalıp, seviye ayrımı yok — **yetersizdi**.
Yeni durum: `src/data/lexicon.ts` + `src/data/lexiconExtra.ts`

| Dil | A1 | A2 | B1 | B2 | C1 | Toplam |
|---|---|---|---|---|---|---|
| İngilizce | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |
| İspanyolca | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |
| Fransızca | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |
| Almanca | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |
| İtalyanca | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |
| Japonca | 6+6 | 6+6 | 6+6 | 6+6 | 6+6 | 60 |

Toplam: **180 kelime + 180 cümle kalıbı** (her dil/seviye 6 kelime + 6 kalıp).
4'lü set için kombinasyon: C(6,4) = **15 farklı kalıp grubu** × kelime eşleşmeleri.

* Kalıplardaki `___` boşlukları **aynı seviyenin** kelimeleriyle doldurulur (pedagojik doğruluk).
* Kelime modunda `generateWordSet()` 4 kelime + Türkçe karşılık üretir.
* Cümle modunda `generateRhymeSet()` 4 kalıp + 4 kelime birleştirir.
* Her satır varsayılan **3 kez** okunur (`repeat: 3`), tekrarlar arası 700 ms, satırlar arası 2.2 s.

## 5. Sonraki Adımlar (öneri)

1. `onboundary` ile kelime bazlı vurgu ve zamanlama.
2. Faz geçişlerini oturum zaman çizelgesine bağlama (0–10–20–42 dk).
3. Kulaklık/hoparlör otomatik algılama ve kalibrasyon hatırlatıcısı.
4. Oturum günlüğü + sabah hatırlama testi ile etkinlik ölçümü.
5. Uzun cümleler için TTS parçalama (190 karakter sınırı) ve cümle birleştirme.
