# NEURO-HYPNO — Uyurken Dil Öğren

Yabancı dil kelime ve cümlelerini **her dilin kendi ana dili aksanıyla**, yankılı ve
kısıktan yükseğe yükselen bir ses zarfıyla okuyan; arka planda derin uyku
frekansı sürdüren web + Android uygulaması.

## Klasörler

| Yol | İçerik |
|---|---|
| `spatial-audio-processing-script (1)/` | React + Vite web uygulaması ve `api/tts.ts` |
| `usta-download/` | Android WebView kabuğu (Kotlin, foreground service, yerel TTS) |
| `api/tts.ts` | Vercel Edge TTS proxy'sinin kök kopyası |

## Web

```powershell
cd "spatial-audio-processing-script (1)"
npm install
npm run dev      # geliştirme
npm run build    # dist/index.html (tek dosya)
```

## Vercel'e dağıtım

İki kurulum da desteklenir:

**A) Project Root Directory = depo kökü (önerilen)**
`vercel.json` derlemeyi ve çıktı klasörünü ayarlar; `api/tts.ts` kökte olduğu için
`/api/tts` yayınlanır.

**B) Project Root Directory = `spatial-audio-processing-script (1)`**
Bu klasördeki `api/tts.ts` otomatik fonksiyon olur.

Dağıtımdan sonra doğrula:

```
https://<projen>.vercel.app/api/tts?text=hello&lang=en
```

`audio/mpeg` dönmeli. 404 dönüyorsa kök dizin ayarı yanlıştır.

## Android

`usta-download/APK_KURULUM.md` dosyasına bak. Varsayılan olarak web uygulaması APK
içine gömülür (`assets/index.html`); ses, telefonun kendi TTS motorundan **doğru dil
etiketiyle** üretilir ve gerçek yankıdan geçirilir. İnternet gerekmez.

## Aksan kuralı

> Bir dilin metni asla başka bir dilin sesiyle okunmaz.

Ses yoksa uygulama **sessiz kalır ve uyarır**; yanlış aksanla okumaz.
Ayrıntı: `spatial-audio-processing-script (1)/QUALITY_CONTROL.md` bölüm 4e.
