# Usta Uygulama - Arka Plan İndirme Altyapısı

Android için ekran kapalı olsa bile çalışan indirme servisi.

## Özellikler
- Foreground Service + bildirim
- WakeLock ile CPU uyku engelleme
- Battery optimization muafiyeti
- DownloadManager entegrasyonu
- İptal / devam / resume desteği

## Kullanım
1. AndroidManifest.xml'e service ve izinler eklendi
2. DownloadForegroundService.startDownload(url, fileName)
3. Uygulama açık/kapalı fark etmez, indirme devam eder
