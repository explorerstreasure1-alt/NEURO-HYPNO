package com.usta.download

import android.app.*
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

class DownloadForegroundService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var wakeLock: PowerManager.WakeLock? = null
    private val CHANNEL_ID = "usta_download_channel"
    private val NOTIF_ID = 1001

    companion object {
        private const val ACTION_START = "START_DOWNLOAD"
        private const val EXTRA_URL = "url"
        private const val EXTRA_FILE = "file"

        fun startDownload(context: Context, url: String, fileName: String) {
            val intent = Intent(context, DownloadForegroundService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_URL, url)
                putExtra(EXTRA_FILE, fileName)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_START) {
            val url = intent.getStringExtra(EXTRA_URL) ?: return START_NOT_STICKY
            val fileName = intent.getStringExtra(EXTRA_FILE) ?: "download.bin"
            startForeground(NOTIF_ID, buildNotification("İndirme başlatılıyor...", 0))
            serviceScope.launch {
                downloadFile(url, fileName)
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private suspend fun downloadFile(urlString: String, fileName: String) {
        try {
            val url = URL(urlString)
            val conn = url.openConnection() as HttpURLConnection
            conn.setRequestProperty("User-Agent", "UstaApp")
            conn.connectTimeout = 30000
            conn.readTimeout = 60000
            conn.connect()

            val total = conn.contentLengthLong
            val outFile = File(getExternalFilesDir(null), fileName)
            FileOutputStream(outFile).use { out ->
                conn.inputStream.buffered().use { input ->
                    val buffer = ByteArray(8 * 1024)
                    var read: Int
                    var downloaded = 0L
                    while (input.read(buffer).also { read = it } != -1) {
                        out.write(buffer, 0, read)
                        downloaded += read
                        if (total > 0) {
                            val progress = ((downloaded * 100) / total).toInt()
                            updateNotification("İndiriliyor...", progress)
                        }
                    }
                }
            }
            updateNotification("İndirme tamamlandı", 100)
        } catch (e: Exception) {
            updateNotification("Hata: ${e.message}", -1)
        } finally {
            releaseWakeLock()
        }
    }

    private fun acquireWakeLock() {
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Usta:DownloadWakeLock").apply {
            acquire(10 * 60 * 1000L) // 10 dakika max, yenilenir
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "İndirmeler", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Arka plan indirmeleri"
                setShowBadge(true)
                enableVibration(false)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun buildNotification(text: String, progress: Int): Notification {
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Usta İndirme")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setOnlyAlertOnce(true)
            .setOngoing(true)

        if (progress >= 0) {
            builder.setProgress(100, progress, progress < 0)
        }
        return builder.build()
    }

    private fun updateNotification(text: String, progress: Int) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIF_ID, buildNotification(text, progress))
    }

    override fun onBind(intent: Intent?) = null

    override fun onDestroy() {
        serviceScope.cancel()
        releaseWakeLock()
        super.onDestroy()
    }
}
