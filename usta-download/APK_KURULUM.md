# APK Oluşturma ve Kurulum

## 1. Android Studio ile aç
* `usta-download` klasörünü Android Studio'da Import Project ile aç
* Gradle sync yap

## 2. Logo değiştir
* `app/src/main/res/drawable/ic_launcher.xml` dosyasını kendi logo png/svg'n ile değiştir
* veya `AndroidManifest.xml` `android:icon` güncelle

## 3. Web adresini ayarla
* `WebAppActivity.kt` içindeki `webView.loadUrl` satırını Vercel linkin ile değiştir
* Örnek: `https://frekans-yabanci-dil.vercel.app`

## 4. Pil optimizasyonu
Uygulama ilk açıldığında ayarlar > Pil > Kısıtlamalar'dan Usta'yı "Optimize etme" yap
Veya kodda `BatteryOptHelper.requestIgnoreBatteryOptimizations` çağrısı ekle

## 5. APK derle
* Build > Generate Signed Bundle / APK
* Release seç, keystore oluştur
* APK `app/build/outputs/apk/release/app-release.apk` altında oluşur

## 6. Telefone kur
* Telefonda Ayarlar > Güvenlik > Bilinmeyen kaynaklara izin ver
* APK'ya tıkla, kurulum yap
* Uygulama logosu ile ana ekranda görünür
* Uygulamayı açtığında WebView içinde Vercel sayfan yüklenir
* İçeride "İndirme Başlat" butonu tıklandığında DownloadForegroundService çalışır, ekran kapansa bile indirme devam eder, bildirimde ilerleme görünür

## Notlar
* Android 13+ için bildirim izni ilk kullanımda istenir
* Büyük dosya indirmelerde `PARTIAL_WAKE_LOCK` + Foreground Service kombinasyonu kesintisiz çalışma sağlar
* DownloadManager alternatifi daha az kod ister ama ilerleme kontrolü kısıtlıdır
