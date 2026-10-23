package com.usta.download

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * Web uygulamasını tam ekran WebView içinde çalıştırır.
 *
 * Ekran kapalıyken çalmaya devam etmesi için:
 *  - `mediaPlaybackRequiresUserGesture = false`
 *  - `PlaybackForegroundService` (PARTIAL_WAKE_LOCK + sürekli bildirim)
 *  - `AndroidBridge` JS köprüsü (web tarafı keepAlive.ts çağırır)
 *  - Activity arka plana geçerken WebView DURDURULMAZ (onPause'da webView.onPause yok).
 */
class WebAppActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var ttsBridge: TtsBridge

    /**
     * Boş bırakılırsa APK içindeki gömülü web uygulaması (`assets/index.html`) açılır.
     * Doluysa uzak adres (ör. Vercel) yüklenir — o zaman `/api/tts` de kullanılabilir.
     *
     * build.gradle içinden: `-PappUrl=https://senin-app.vercel.app`
     */
    private val appUrl: String = BuildConfig.APP_URL

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mediaPlaybackRequiresUserGesture = false
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.javaScriptCanOpenWindowsAutomatically = true
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            }
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            ttsBridge = TtsBridge(this@WebAppActivity)
            addJavascriptInterface(Bridge(), "AndroidBridge")

            if (appUrl.isBlank()) {
                // Gömülü sürüm: internet olmadan da çalışır, TTS cihazdan gelir.
                loadUrl("file:///android_asset/index.html")
            } else {
                loadUrl(appUrl)
            }
        }

        setContentView(webView)
    }

    /** Web tarafının çağırdığı köprü. */
    inner class Bridge {
        @JavascriptInterface
        fun startPlayback() {
            PlaybackForegroundService.start(this@WebAppActivity)
        }

        @JavascriptInterface
        fun stopPlayback() {
            PlaybackForegroundService.stop(this@WebAppActivity)
        }

        @JavascriptInterface
        fun isPlaying(): Boolean = PlaybackForegroundService.isRunning

        // ── Yerel TTS (doğru aksan) ────────────────────────────────
        @JavascriptInterface
        fun speak(text: String, tag: String, rate: Float, volume: Float): Boolean {
            return ttsBridge.speak(text, tag, rate, volume)
        }

        @JavascriptInterface
        fun isLanguageAvailable(tag: String): Boolean = ttsBridge.isLanguageAvailable(tag)

        @JavascriptInterface
        fun isSpeaking(): Boolean = ttsBridge.isSpeaking()

        @JavascriptInterface
        fun stopSpeaking() {
            ttsBridge.stopSpeaking()
        }

        // ── Dosyaya sentez → Web Audio'da gerçek yankı ─────────────
        @JavascriptInterface
        fun synthesize(id: String, text: String, tag: String, rate: Float): Boolean {
            return ttsBridge.synthesize(id, text, tag, rate)
        }

        @JavascriptInterface
        fun takeResult(id: String): String = ttsBridge.takeResult(id)

        @JavascriptInterface
        fun cancelSynthesis(id: String) {
            ttsBridge.cancelSynthesis(id)
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
    }

    // NOT: onPause'da webView.onPause() ÇAĞRILMIYOR.
    // Ekran kapanınca JS/ses grafiği durmasın diye WebView çalışır bırakılır.

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        try {
            ttsBridge.shutdown()
        } catch (_: Exception) {
        }
        try {
            webView.destroy()
        } catch (_: Exception) {
        }
        PlaybackForegroundService.stop(this)
        super.onDestroy()
    }
}
