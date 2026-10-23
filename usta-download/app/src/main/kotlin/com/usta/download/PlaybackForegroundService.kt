package com.usta.download

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import androidx.core.app.NotificationCompat

/**
 * Ekran kapalıyken / uygulama arka plandayken çalmanın devam etmesi için
 * ön plan (foreground) servisi.
 *
 * - PARTIAL_WAKE_LOCK: CPU uyanık kalır, WebView'in ses grafiği beslenmeye devam eder.
 * - Sürekli bildirim: Android'in süreci öldürmesini engeller.
 * - foregroundServiceType="mediaPlayback"
 *
 * Web tarafındaki `keepAlive.ts` köprü üzerinden start/stop çağırır.
 */
class PlaybackForegroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        private const val CHANNEL_ID = "nhyp_playback_channel"
        private const val NOTIF_ID = 2001
        private const val ACTION_START = "com.usta.download.START_PLAYBACK"
        private const val ACTION_STOP = "com.usta.download.STOP_PLAYBACK"

        @Volatile
        var isRunning: Boolean = false
            private set

        fun start(context: Context) {
            val intent = Intent(context, PlaybackForegroundService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, PlaybackForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startForeground(NOTIF_ID, buildNotification())
                acquireWakeLock()
                isRunning = true
            }
            ACTION_STOP -> {
                releaseWakeLock()
                isRunning = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
            }
            else -> {
                // Sistem yeniden başlattıysa sessizce dur
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun acquireWakeLock() {
        if (wakeLock?.isHeld == true) return
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        // Süre sınırı yok: çalma bitene kadar CPU uyanık kalsın.
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NEUROHYPNO:PlaybackWakeLock").apply {
            setReferenceCounted(false)
            acquire()
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wakeLock = null
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Uyku protokolü",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Ekran kapalıyken çalmaya devam eder"
                setShowBadge(false)
                enableVibration(false)
                setSound(null, null)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val openIntent = Intent(this, WebAppActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pending = PendingIntent.getActivity(this, 0, openIntent, flags)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NEURO-HYPNO çalıyor")
            .setContentText("Ekran kapalıyken de devam eder · frekans + yankılı okuma")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pending)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onBind(intent: Intent?) = null

    override fun onDestroy() {
        releaseWakeLock()
        isRunning = false
        super.onDestroy()
    }
}
