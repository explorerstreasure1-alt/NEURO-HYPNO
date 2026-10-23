# APK Oluşturma ve Kurulum

## 1. Web uygulamasını derle

```powershell
cd "spatial-audio-processing-script (1)"
npm install
npm run build
```

Bu, `dist/index.html` dosyasını üretir (tek dosya, tüm JS/CSS içinde).

## 2. Android Studio ile aç
* `usta-download` klasörünü Android Studio'da Import Project ile aç
* Gradle sync yap

Gradle, `preBuild` adımında `dist/index.html` dosyasını otomatik olarak
`app/src/main/assets/index.html` içine kopyalar (`syncWebAssets` görevi).

## 3. Uygulama nereden açılacak?

**Varsayılan (önerilen): gömülü sürüm.** `appUrl` boş bırakılır, APK içindeki
`assets/index.html` açılır. İnternet gerekmez; ses, telefonun **kendi TTS
motorundan doğru dil etiketiyle** üretilir (bkz. `TtsBridge.kt`).
Yankı ve swell Web Audio'da gerçek `ConvolverNode` ile uygulanır.

Uzak sürüm (Vercel) kullanmak istersen:

```powershell
cd usta-download
./gradlew assembleDebug -PappUrl=https://senin-app.vercel.app
```

Bu durumda `/api/tts` de denenir (Google TTS, en doğal aksan).

## 4. Logo değiştir
* `app/src/main/res/drawable/ic_launcher.xml` dosyasını kendi logo png/svg'n ile değiştir
* veya `AndroidManifest.xml` `android:icon` güncelle

## 5. Pil optimizasyonu
Uygulama ilk açıldığında Ayarlar > Pil > Kısıtlamalar'dan uygulamayı "Optimize etme" yap.
`PlaybackForegroundService` süresiz `PARTIAL_WAKE_LOCK` tutar; ekran kapalıyken
okuma devam eder.

## 6. APK derle
* Build > Generate Signed Bundle / APK
* Release seç, keystore oluştur
* APK `app/build/outputs/apk/release/app-release.apk` altında oluşur

## 7. Telefone kur
* Telefonda Ayarlar > Güvenlik > Bilinmeyen kaynaklara izin ver
* APK'ya tıkla, kurulum yap
* Uygulama logosu ile ana ekranda görünür

## Ses paketleri (aksen için şart)

Uygulama **yanlış aksanla okumaz**. Bir dil için ses yoksa o dil sessiz kalır.

* Ayarlar > Sistem > Diller ve giriş > Metin okuma (TTS) > Google Konuşma Hizmetleri
* "Ses verilerini yükle" → İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Japonca
* İnternetli sesleri indirirsen daha doğal tonlama elde edilir

## Notlar
* Android 13+ için bildirim izni ilk kullanımda istenir
* Android 11+ için `AndroidManifest.xml` içinde TTS motoru `<queries>` ile görünür kılınır
* `TtsBridge.synthesize()` metni WAV'a yazar, web tarafı bunu `AudioBuffer` olarak
  çözüp yankı zincirine verir — bu yüzden yerel TTS bile gerçek yankı alır
