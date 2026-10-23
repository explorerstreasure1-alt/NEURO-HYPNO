# Kurulum Notları

## Ekran kapalı olsa bile indirme için gerekli ayarlar

1. **Foreground Service**
   - NotificationChannel `usta_download_channel` oluşturuldu
   - Service `dataSync` foregroundServiceType ile başlatılıyor
   - Android 13+ için POST_NOTIFICATIONS izni manifest'te

2. **WakeLock**
   - `PowerManager.PARTIAL_WAKE_LOCK` ile CPU uyku engelleniyor
   - İndirme süresince aktif, bittiğinde serbest bırakılıyor

3. **Battery Optimization**
   - `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` izni eklendi
   - Kullanıcıdan "Pil optimizasyonunu devre dışı bırak" istemelisin
   - Uygulama ayarlarında manuel açma talimatı ver

4. **Android 14+**
   - `android:foregroundServiceType="dataSync"` manifest'te belirtildi
   - `startForegroundService` kullanıldı

5. **Kullanım**
   ```kotlin
   DownloadForegroundService.startDownload(context, url, "dosya.zip")
   ```
   İndirme `getExternalFilesDir()` altına kaydedilir, ekran kapalıyken devam eder.

6. **Alternatif: DownloadManager**
   Sistem API'si zaten arka planda çalışır:
   ```kotlin
   val req = DownloadManager.Request(Uri.parse(url))
       .setTitle("Usta İndirme")
       .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
       .setDestinationInExternalFilesDir(context, null, "dosya.zip")
   context.getSystemService(DownloadManager::class.java).enqueue(req)
   ```
