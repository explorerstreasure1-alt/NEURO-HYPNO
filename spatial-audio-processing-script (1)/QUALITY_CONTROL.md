# NEURO-HYPNO - Nörobilim & Dil Uzmanı Kalite Kontrol Raporu

## 1. Mevcut Durum Özeti
- Web Audio tabanlı binaural/izokronik motor
- Procedural whisper + reverb/ping-pong
- SpeechSynthesis ile yabancı dil okuma entegrasyonu
- Hypnagogic faz kontrolü
- Neuro-Imprint: A1-C1, 4'lü kafiye, 42 dk döngü
- Test ekranı, dil seçimi

## 2. Nörobilimsel Sorunlar & Düzeltmeler

### A. Derin Uyku vs. Kortikal Uyanıklık
**Sorun:** Derin frekans 2-4 Hz korteksi de kapatabilir.
**Çözüm:** `setEntrainment(2.5, 0.6)` + `binauralGain:18`. Düşük gain ile somatik gevşeme sağlanır, korteks theta’da kalır.

### B. Ses Netliği
**Sorun:** Motor noise cızırtı yapıyordu.
**Çözüm:** `speakLightWhisper` içinde `whisperGain:0`, `binauralGain:18`, voice selection, `speechSynthesis` volume 1.0.

### C. Yankı Profilleri
bodrum / sahne / otopark için wet/decay ayarı eklendi.

## 3. Dil Uzmanlığı Sorunları

### A. CEFR Uyumu
- A1-A2: Basit cümle yapıları, yavaş rate 0.85
- B1-B2: Rate 0.95, daha uzun cümleler
- C1: Rate 1.0, doğal prosodi

### B. Kafiye Tutarlılığı
Şu an rastgele seçim. İyileştirme: aynı temadan 4 satır seç.

### C. Ses Kalitesi
SpeechSynthesis yerine TTS API ile net yankı işleme önerilir.

## 4. Önerilen Geliştirmeler

1. Voice preload: `speechSynthesis.onvoiceschanged`
2. Hata yönetimi: voice bulunamazsa fallback
3. UI: Yankı tipi seçici, faz gösterge
4. Kayıt: Oturum istatistikleri
5. Pil optimizasyonu ve foreground service

## 5. Sonraki Adımlar
- TTS API entegrasyonu ile gerçek yankı işleme
- Kişiselleştirilmiş faz rampası
- A/B test verisi toplama
