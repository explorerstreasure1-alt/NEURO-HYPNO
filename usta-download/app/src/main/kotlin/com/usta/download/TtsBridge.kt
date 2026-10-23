package com.usta.download

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Base64
import android.webkit.JavascriptInterface
import java.io.File
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

/**
 * Android yerel TTS köprüsü.
 *
 * İki mod:
 *  1) `speak(...)`  → doğrudan hoparlörden okur (yankısız yedek yol).
 *  2) `synthesize(...)` → metni WAV dosyasına sentezler, Base64 döndürür.
 *     Web tarafı bunu AudioBuffer'a çevirip ConvolverNode'dan geçirir:
 *     **ana dili aksanı + gerçek yankı + ekran kapalıyken çalma**.
 *
 * NEDEN: WebView'in `speechSynthesis` listesi boş dönebiliyor ve sistem
 * varsayılan (ör. Türkçe) sesle İngilizce metni okuyabiliyordu. Bu köprü
 * her çağrıda dili AÇIKÇA ayarlar; o dilin sesi yoksa `false` döner ve
 * web tarafı YANLIŞ AKSANLA okumaz.
 */
class TtsBridge(context: Context) {

    private val cacheDir: File = context.cacheDir

    private var tts: TextToSpeech? = null

    @Volatile
    private var ready = false

    @Volatile
    private var failed = false

    private data class Pending(
        val text: String,
        val tag: String,
        val rate: Float,
        val volume: Float,
    )

    private data class Synth(
        val id: String,
        val text: String,
        val tag: String,
        val rate: Float,
    )

    private val queue = ArrayDeque<Pending>()
    private val synthQueue = ArrayDeque<Synth>()

    private var currentId: String? = null

    /** id → Base64 WAV (hazır) */
    private val results = ConcurrentHashMap<String, String>()

    /** id → hata */
    private val errors = ConcurrentHashMap.newKeySet<String>()

    /** id → dosya (sentez sürüyor) */
    private val files = ConcurrentHashMap<String, File>()

    init {
        try {
            tts = TextToSpeech(context.applicationContext) { status ->
                ready = status == TextToSpeech.SUCCESS
                failed = !ready
                if (ready) {
                    tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(utteranceId: String?) {
                            currentId = utteranceId
                        }

                        override fun onDone(utteranceId: String?) {
                            if (currentId == utteranceId) currentId = null
                            if (utteranceId != null && utteranceId.startsWith(FILE_PREFIX)) {
                                finishFile(utteranceId.removePrefix(FILE_PREFIX))
                            }
                        }

                        @Deprecated("Deprecated in Java")
                        override fun onError(utteranceId: String?) {
                            if (currentId == utteranceId) currentId = null
                            if (utteranceId != null && utteranceId.startsWith(FILE_PREFIX)) {
                                errors.add(utteranceId.removePrefix(FILE_PREFIX))
                            }
                        }

                        override fun onError(utteranceId: String?, errorCode: Int) {
                            if (currentId == utteranceId) currentId = null
                            if (utteranceId != null && utteranceId.startsWith(FILE_PREFIX)) {
                                errors.add(utteranceId.removePrefix(FILE_PREFIX))
                            }
                        }
                    })
                    flushQueues()
                }
            }
        } catch (_: Exception) {
            failed = true
        }
    }

    private fun localeOf(tag: String): Locale = Locale.forLanguageTag(tag.replace('_', '-'))

    private fun languageOk(engine: TextToSpeech, locale: Locale): Boolean {
        return try {
            when (engine.isLanguageAvailable(locale)) {
                TextToSpeech.LANG_AVAILABLE,
                TextToSpeech.LANG_COUNTRY_AVAILABLE,
                TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE -> true
                else -> false
            }
        } catch (_: Exception) {
            false
        }
    }

    // ── Doğrudan okuma (yankısız) ──────────────────────────────────

    @JavascriptInterface
    fun isLanguageAvailable(tag: String): Boolean {
        val engine = tts ?: return false
        if (!ready) return !failed
        return languageOk(engine, localeOf(tag))
    }

    @JavascriptInterface
    fun speak(text: String, tag: String, rate: Float, volume: Float): Boolean {
        if (failed) return false
        val item = Pending(text, tag, rate, volume)
        if (!ready) {
            queue.addLast(item)
            return true
        }
        return speakNow(item)
    }

    private fun speakNow(item: Pending): Boolean {
        val engine = tts ?: return false
        return try {
            val locale = localeOf(item.tag)
            if (!languageOk(engine, locale)) return false

            engine.language = locale
            engine.setSpeechRate(item.rate.coerceIn(0.5f, 2.0f))
            engine.setPitch(1.0f)

            val params = Bundle().apply {
                putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, item.volume.coerceIn(0f, 1f))
            }
            val id = "nhyp-${System.currentTimeMillis()}"
            currentId = id
            engine.speak(item.text, TextToSpeech.QUEUE_ADD, params, id) == TextToSpeech.SUCCESS
        } catch (_: Exception) {
            false
        }
    }

    // ── Dosyaya sentez (gerçek yankı için) ─────────────────────────

    /**
     * Metni WAV olarak sentezler. Sonucu `takeResult(id)` ile al.
     * @return false → dil/cihaz desteklemiyor (web tarafı yanlış aksanla okumaz)
     */
    @JavascriptInterface
    fun synthesize(id: String, text: String, tag: String, rate: Float): Boolean {
        if (failed) return false
        if (text.isBlank()) {
            errors.add(id)
            return false
        }
        val item = Synth(id, text, tag, rate)
        if (!ready) {
            synthQueue.addLast(item)
            return true
        }
        return synthNow(item)
    }

    private fun synthNow(item: Synth): Boolean {
        val engine = tts ?: return false
        return try {
            val locale = localeOf(item.tag)
            if (!languageOk(engine, locale)) {
                errors.add(item.id)
                return false
            }

            engine.language = locale
            engine.setSpeechRate(item.rate.coerceIn(0.5f, 2.0f))
            engine.setPitch(1.0f)

            val file = File(cacheDir, "nh_tts_${item.id}.wav")
            files[item.id] = file

            val params = Bundle().apply {
                putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1f)
            }
            val ok = engine.synthesizeToFile(item.text, params, file, FILE_PREFIX + item.id) ==
                TextToSpeech.SUCCESS
            if (!ok) {
                files.remove(item.id)
                errors.add(item.id)
            }
            ok
        } catch (_: Exception) {
            files.remove(item.id)
            errors.add(item.id)
            false
        }
    }

    private fun finishFile(id: String) {
        val file = files.remove(id) ?: run {
            errors.add(id)
            return
        }
        try {
            if (!file.exists() || file.length() <= 44L) {
                errors.add(id)
                return
            }
            val bytes = file.readBytes()
            results[id] = Base64.encodeToString(bytes, Base64.NO_WRAP)
        } catch (_: Exception) {
            errors.add(id)
        } finally {
            try {
                file.delete()
            } catch (_: Exception) {
            }
        }
    }

    /**
     * Sentez sonucunu döndürür.
     *  ''    → henüz hazır değil
     *  'ERR' → başarısız / dil yok
     *  diğer → Base64 WAV
     */
    @JavascriptInterface
    fun takeResult(id: String): String {
        results.remove(id)?.let { return it }
        if (errors.remove(id)) return "ERR"
        if (!files.containsKey(id) && !synthQueue.any { it.id == id }) {
            // hiç başlamamış → hata
            return "ERR"
        }
        return ""
    }

    @JavascriptInterface
    fun cancelSynthesis(id: String) {
        files.remove(id)?.let {
            try {
                it.delete()
            } catch (_: Exception) {
            }
        }
        results.remove(id)
        errors.remove(id)
        synthQueue.removeAll { it.id == id }
    }

    private fun flushQueues() {
        while (ready && queue.isNotEmpty()) {
            speakNow(queue.removeFirst())
        }
        while (ready && synthQueue.isNotEmpty()) {
            synthNow(synthQueue.removeFirst())
        }
    }

    @JavascriptInterface
    fun isSpeaking(): Boolean {
        return try {
            tts?.isSpeaking == true || currentId != null || queue.isNotEmpty()
        } catch (_: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun stopSpeaking() {
        try {
            queue.clear()
            currentId = null
            tts?.stop()
        } catch (_: Exception) {
        }
    }

    fun shutdown() {
        try {
            queue.clear()
            synthQueue.clear()
            files.values.forEach { runCatching { it.delete() } }
            files.clear()
            results.clear()
            errors.clear()
            tts?.stop()
            tts?.shutdown()
        } catch (_: Exception) {
        }
        tts = null
        ready = false
    }

    companion object {
        private const val FILE_PREFIX = "file:"
    }
}
