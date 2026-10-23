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

## 4c. 10. Dakika Yankılı Okuma — KÖK NEDEN DÜZELTMESİ

**Şikâyet:** "10 dakika geçiyor, frekanstan sonra dile girmiyor."

**Kök neden:** 10. dakika tetikleyicisi yalnızca `engine.setWhisperOn(true)` çağırıyordu.
Bu, **anlamsız prosedürel gürültü** üretiyordu; gerçek kelime/cümle hiç okunmuyordu.
Yeni `whisperSession.ts` hiçbir yerden çağrılmıyordu.

**Düzeltme (yeni akış):**

```
oynatma başlar
  → 10. dk (kısa seanslarda ölçekli) tetik
  → engine.setWhisperOn(false)              (gürültü kapatıldı)
  → startWhisperSession({ langId, level })  (GERÇEK okuma)
       → CEFR havuzundan 4'lü set
       → her satır 3 kez
       → TTS → AudioBuffer → Convolver + ping-pong (gerçek yankı)
       → endpoint yoksa Web Speech (swell) yedeği
```

* Seçilen dil otomatik: `current.lang` → `en-US / es-ES / fr-FR / de-DE / it-IT / ja-JP`
* Seviye: oturumun CEFR seviyesi (A1→C1), hız `LEVEL_RATE × dil çarpanı`
* Dil bazlı kalite: `LANG_TUNING` (DE 0.94×, JP 0.93×, FR 0.98×; kısa yankı `stage`)
* 10 dk rampı gerçek sese uygulanıyor (`getVolume`), alt sınır %10 (Android'de tam sessize düşmesin)
* Player'a **"HEMEN DENE · 10 DK BEKLEMEDEN"** düğmesi eklendi
* Canlı satır göstergesi: gerçekten çalan satır + "gerçek yankı" / "cihaz sesi yedeği"

### Ek kalite düzeltmeleri (aynı tur)

| # | Sorun | Düzeltme |
|---|-------|----------|
| 1 | Aynı satır 3 kez okunurken TTS 3 kez indiriliyordu (gecikme + kota) | `tts.ts` buffer önbelleği |
| 2 | 180+ karakter satırlarda TTS 200 karakter sınırına takılıyordu | cümle/kelime sınırından parçalama + tek buffer'da birleştirme |
| 3 | Endpoint çökünce her satırda 2×9 sn bekleme | devre kesici (60 sn) + 6.5 sn timeout |
| 4 | Konuşma bitince `master` hep 0.79'a dönüyordu (seans ayarını eziyordu) | `restoreMaster()` — önceki seviyeye döner |
| 5 | Okuma sahnesi seansın teta/binaural ayarını eziyordu | `preserveScene=true` |
| 6 | `stopAll()` konuşmayı/yankıyı kesmiyordu | speechSynthesis.cancel + echo stop + restore |
| 7 | Düşük kaliteli ses (eSpeak/compact) seçilebiliyordu | Google/Natural/Neural önceliği, eSpeak cezası |
| 8 | Endpoint'te `{text}` yoksa metin gitmiyordu | sorgu parametresi otomatik ekleniyor |
| 9 | `stopAll()` yankı kaynaklarını durdurmuyordu (pause'da ses sızıyordu) | aktif kaynak seti + yumuşak fade-out |

## 4d. EKRAN KAPALI / ARKA PLAN

**Hedef:** telefonun ekranı kapansa da frekans + yankılı okuma devam etsin.

Web tarafı:
* `keepAlive.ts` — sessiz ama gerçekten çalan `<audio loop>` (medya oturumu canlı), MediaSession meta verisi + kilit ekranı play/pause, Screen Wake Lock.
* `whisperSession.ts` — gerçek yankı yolunda ses **Web Audio saatiyle önceden zamanlanır** (`AudioBufferSourceNode.start(when)`). Böylece arka planda `setTimeout` kısıtlansa bile okuma sürer.
* Yatak (frekans) `duckBed(süre)` ile konuşma boyunca kısılır, sonra geri yükselir.

Android tarafı (`usta-download`):
* `PlaybackForegroundService` — `foregroundServiceType="mediaPlayback"`, süresiz `PARTIAL_WAKE_LOCK`, sürekli bildirim.
* `WebAppActivity` — `mediaPlaybackRequiresUserGesture=false`, `onPause`'da WebView **durdurulmuyor**, `AndroidBridge.startPlayback()/stopPlayback()` JS köprüsü.
* Manifest: `FOREGROUND_SERVICE_MEDIA_PLAYBACK` izni + servis tanımı.

Bilinen sınır: Web Speech (cihaz sesi) yedeği arka planda Android tarafından kısılabilir; **gerçek yankı yolu (TTS endpoint)** arka planda güvenilirdir.

## 4e. AKSAN GÜVENLİĞİ — "Türk sesiyle İngilizce" hatasının kökü

**Belirti:** İngilizce metin Türk aksanıyla okunuyordu.

**Kök neden:** Android WebView'de `speechSynthesis.getVoices()` çoğu zaman **boş dizi**
döner. Eski kod `voice = null` kaldığında `utter.lang` yazıp devam ediyordu; motor da
sistemin **varsayılan (Türkçe) sesini** kullanıyordu. Yani "aksan" değil, yanlış ses.

**Yeni mimari (tek doğruluk kaynağı: `src/audio/voice.ts`):**

1. **Sunucu TTS'i (birincil):** `/api/tts` → Google native ses → `AudioBuffer` →
   `ConvolverNode` + ping-pong → **ana dili aksanı + gerçek yankı + swell**.
2. **Android yerel sentezi (çevrimdışı birincil):** `TtsBridge.synthesize()` metni
   WAV'a yazar → Base64 → `decodeAudioData` → aynı yankı zinciri.
   Dil her çağrıda **açıkça** `Locale.forLanguageTag(...)` ile ayarlanır.
   O dilin sesi yoksa `false` döner.
3. **Android doğrudan okuma:** `speak()` — yalnızca doğru locale varsa.
4. **Web Speech (son çare):** `pickNativeVoice()` yalnızca **hedef dilin** sesini
   kabul eder. Ses yoksa **hiç okumaz** ve kullanıcıya bildirir.
   İngilizce olmayan metin asla İngilizce sese düşmez (eski `fallbackToEnglish`
   kaldırıldı; `/api/tts` de bilinmeyen dilde 400 döner).

**Görünürlük:** Hızlı Test ekranı seçilen dil için bulunan native sesi gösterir
(`ANA DİLİ SESİ · en-US`) ve "ENDPOINT BAĞLANTISINI KONTROL ET" ile TTS sunucusunu
sınar. Ses yoksa uyarı verir; sessiz kalmayı yanlış aksana tercih eder.

**Prosodi koruması:** Swell artık kelime kelime değil, **cümlenin tamamına**
uygulanır (`EchoChain.startSource(..., swell)` → `0.35 → 1.0 → 0.35`). Kelime
bölmek tonlamayı/aksanı bozuyordu.

**Yatak kısma:** Konuşma sırasında master `0.79 → 0.24` (maskelenme azalır, aksan
net duyulur), sonra `restoreMaster()`.

## 4f. NÖROBİLİM GEREKÇESİ (özet)

| Katman | Uygulama | Gerekçe |
|---|---|---|
| Uyku yatağı | 136.1 Hz taşıyıcı + 2./3. harmonik, 6 Hz kapı | Küçük hoparlörde "eksik temel" ile delta ritmi duyulur |
| Binaural | L 200 / R 206 Hz (6 Hz fark) | Beyin sapı üstü iki kulak arası fark → delta eşikleme |
| Kodlama | 10. dk sonrası 3 tekrarlı, yankılı okuma | Uyku öncesi TMR penceresi + işitsel pekiştirme |
| Aralık | Her satır arası 2.4 sn, set arası 42 dk | Konsolidasyon aralığı; tekrar baskısı yerine seyreltme |
| Yankı | RT60 2.4s bodrum / sahne / otopark | Uzamsal ipucu, dikkat çekmeden işitsel belirginlik |

> Not: 1.5/3/6 Hz üçlü delta yığını bir sonraki sürümde yatak modülasyonu olarak
> eklenecek; şu an 6 Hz izokronik kapı + binaural 6 Hz aktiftir.

## 5. Sonraki Adımlar (öneri)

1. `onboundary` ile kelime bazlı vurgu ve zamanlama.
2. Faz geçişlerini oturum zaman çizelgesine bağlama (0–10–20–42 dk).
3. Kulaklık/hoparlör otomatik algılama ve kalibrasyon hatırlatıcısı.
4. Oturum günlüğü + sabah hatırlama testi ile etkinlik ölçümü.
5. Uzun cümleler için TTS parçalama (190 karakter sınırı) ve cümle birleştirme.
