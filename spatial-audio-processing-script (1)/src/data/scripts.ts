export const MAIN_PY = `# ============================================================
#  NEURO-HYPNO // Phase-Shift Hypnagogic Language Acquisition Engine
#  Module: spatial_reverb_engine.py
#  ------------------------------------------------------------
#  Channel 1 — Target Language Whisper → Hypnagogic Spatialization
#  Spec: Large Hall / Cathedral · 35% wet / 65% dry · RT60 2.4s
#        Ping-pong 120 ms @ 15% fb · 6 kHz high-cut on wet tail
#        + 6 Hz Theta Binaural Bed + A-A-A-A Rhyme Whisper Layers
# ============================================================

import numpy as np
from scipy import signal
from pydub import AudioSegment
from pedalboard import Pedalboard, Reverb, Delay, HighpassFilter, LowpassFilter, Gain

SR = 48000          # project sample-rate (sleep-lab master)
RT60 = 2.4          # seconds — soft lingering tail
WET = 0.35          # 35% wet
DRY = 0.65          # 65% dry
DELAY_MS = 120      # ping-pong drift L→R
FEEDBACK = 0.15     # 15% feedback
HIGHCUT_HZ = 6000   # roll-off on reverb tail (no harsh sibilance)
THETA_HZ = 6        # binaural beat frequency
CARRIER_HZ = 200    # L=200 Hz / R=206 Hz

# ------------------------------------------------------------
# 1. LOADERS — pydub → float32 numpy (mono → stereo later)
# ------------------------------------------------------------
def load_voice(path: str) -> np.ndarray:
    seg: AudioSegment = AudioSegment.from_file(path).set_frame_rate(SR).set_channels(1)
    arr = np.array(seg.get_array_of_samples(), dtype=np.float32)
    peak = np.max(np.abs(arr)) + 1e-9
    return (arr / peak * 0.89).astype(np.float32)  # normalize, keep headroom

# ------------------------------------------------------------
# 2. CATHEDRAL IMPULSE — synthesized large-hall IR, RT60 = 2.4 s
#    Exponential noise decay: env = exp(-6.908 * t / RT60)
# ------------------------------------------------------------
def cathedral_ir(rt60: float = RT60, sr: int = SR, predelay_ms: float = 18.0):
    n = int(sr * rt60 * 1.4)
    ir = np.random.randn(2, n).astype(np.float32) * 0.5
    pre = int(sr * predelay_ms / 1000)
    t = np.arange(n) / sr
    env = np.exp(-6.908 * np.clip(t - pre / sr, 0, None) / rt60).astype(np.float32)
    env[:pre] = 0.0
    ir *= env[None, :]
    # darken tail progressively (air absorption of a cathedral)
    b, a = signal.butter(1, 0.35, btype="low")
    ir = signal.lfilter(b, a, ir, axis=1).astype(np.float32)
    return ir

def apply_cathedral_reverb(dry: np.ndarray, ir: np.ndarray) -> np.ndarray:
    """Stereo convolution reverb via FFT (dream-like, immersive)."""
    stereo = np.stack([dry, dry], axis=0)
    wet = np.stack([
        signal.fftconvolve(stereo[ch], ir[ch], mode="full")[: len(dry)]
        for ch in range(2)
    ], axis=0)
    # normalize wet to dry peak so 35/65 blend is predictable
    wet /= (np.max(np.abs(wet)) + 1e-9)
    wet *= np.max(np.abs(dry)) + 1e-9
    return wet.astype(np.float32)

# ------------------------------------------------------------
# 3. HYPNAGOGIC WET-CHAIN — 6 kHz lowpass on the TAIL ONLY
#    Voice stays intelligible; space stays soft.
# ------------------------------------------------------------
def soft_highcut(wet_stereo: np.ndarray, cutoff: float = HIGHCUT_HZ, sr: int = SR):
    sos = signal.butter(4, cutoff, btype="low", fs=sr, output="sos")
    return signal.sosfilt(sos, wet_stereo, axis=1).astype(np.float32)

# ------------------------------------------------------------
# 4. PING-PONG ECHO — 120 ms, 15% cross-feedback
#    Slight L→R drift stimulates both hemispheres.
# ------------------------------------------------------------
def ping_pong(wet: np.ndarray, delay_ms: float = DELAY_MS,
              fb: float = FEEDBACK, sr: int = SR, mix: float = 0.45):
    d = int(sr * delay_ms / 1000)
    out = wet.copy()
    # cross-coupled comb: L feeds R, R feeds L
    for _ in range(3):  # 3 audible hops, then it dissolves into the hall
        shifted_l = np.zeros_like(out[0])
        shifted_r = np.zeros_like(out[1])
        shifted_l[d:] = out[1][:-d] * fb
        shifted_r[d:] = out[0][:-d] * fb
        out[0] += shifted_l
        out[1] += shifted_r
    return (wet * (1 - mix) + out * mix).astype(np.float32)

# ------------------------------------------------------------
# 5. PEDALBOARD POLISH — room glue + breath + DC safety
#    (Spotify pedalboard: fast, sleep-safe dynamics)
# ------------------------------------------------------------
def pedalboard_glue(mix_stereo: np.ndarray, sr: int = SR) -> np.ndarray:
    board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=70),       # remove rumble / mic thump
        LowpassFilter(cutoff_frequency_hz=14000),     # sleep-safe ceiling
        Reverb(room_size=0.88, damping=0.62,          # cathedral glue (subtle!)
               wet_level=0.12, dry_level=0.88, width=1.0),
        Delay(delay_seconds=0.12, feedback=0.08, mix=0.10),
        Gain(gain_db=-1.5),                           # headroom for binaural bed
    ])
    return board(mix_stereo, sample_rate=sr).astype(np.float32)

# ------------------------------------------------------------
# 6. THETA BED — 6 Hz binaural beats (L 200 Hz / R 206 Hz)
#    + slow 0.1 Hz breathing swell so the bed "floats".
# ------------------------------------------------------------
def theta_bed(dur_s: float, sr: int = SR, base: float = CARRIER_HZ,
              beat: float = THETA_HZ, level_db: float = -18.0):
    n = int(dur_s * sr)
    t = np.arange(n) / sr
    amp = 10 ** (level_db / 20)
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * 0.1 * t)   # 6 breaths / min
    left = np.sin(2 * np.pi * base * t) * swell * amp
    right = np.sin(2 * np.pi * (base + beat) * t) * swell * amp
    # 3 s raised-cosine fades — never click a sleeping brain
    f = int(3 * sr)
    fade = 0.5 * (1 - np.cos(np.pi * np.arange(f) / f))
    left[:f] *= fade; right[:f] *= fade
    left[-f:] *= fade[::-1]; right[-f:] *= fade[::-1]
    return np.stack([left, right]).astype(np.float32)

# ------------------------------------------------------------
# 7. A-A-A-A LAYERS — 4 rhyme whispers, staggered like echoes
#    e.g. ES: "luna · cuna · fortuna · laguna" (all rhyme in -una)
# ------------------------------------------------------------
def stack_aaaa(layers: list[np.ndarray], sr: int = SR,
               stagger_ms: float = 260.0) -> np.ndarray:
    """Each layer is already spatialized; stagger + duck under layer 0."""
    n = max(len(l) for l in layers) + int(sr * stagger_ms / 1000) * 3
    mix = np.zeros(2 * n, dtype=np.float32).reshape(2, n)
    gains = [1.0, 0.55, 0.42, 0.34]  # lead + dissolving echoes
    for i, mono in enumerate(layers[:4]):
        off = int(i * stagger_ms / 1000 * sr)
        g = gains[i]
        # mono → slight stereo spread per layer (different "places" in hall)
        pan = [-0.25, -0.08, 0.12, 0.3][i]
        l_g, r_g = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        mix[0, off: off + len(mono)] += mono * g * l_g
        mix[1, off: off + len(mono)] += mono * g * r_g
    return mix

# ------------------------------------------------------------
# 8. MASTER RENDER — the full hypnagogic mix
# ------------------------------------------------------------
def render(voice_paths: list[str], out_path: str, bed_minutes: float = 10.0):
    print("◉ NEURO-HYPNO render — cathedral spatialization")
    ir = cathedral_ir()

    spatial_layers = []
    for i, p in enumerate(voice_paths[:4]):
        print(f"  ▸ CH1.{i+1} {p} → hall 2.4s · wet 35% · pp 120ms")
        dry = load_voice(p)
        wet = apply_cathedral_reverb(dry, ir)     # large hall
        wet = soft_highcut(wet)                   # 6 kHz tail roll-off
        wet = ping_pong(wet)                      # hemisphere drift
        dry_st = np.stack([dry, dry])             # dual-mono dry
        mlen = min(dry_st.shape[1], wet.shape[1])
        mix = dry_st[:, :mlen] * DRY + wet[:, :mlen] * WET
        mix = pedalboard_glue(mix)
        spatial_layers.append(mix.mean(axis=0))   # collapse for AAAA stack

    aaaa = stack_aaaa(spatial_layers)
    # loop / trim AAAA bed to session length
    total = int(bed_minutes * 60 * SR)
    looped = np.zeros((2, total), dtype=np.float32)
    pos = 0
    while pos < total:
        chunk = min(aaaa.shape[1], total - pos)
        looped[:, pos: pos + chunk] += aaaa[:, :chunk] * 0.8
        pos += chunk

    theta = theta_bed(bed_minutes * 60)           # 6 Hz binaural bed
    master = looped * 0.72 + theta                # whispers float ON the bed
    master /= (np.max(np.abs(master)) + 1e-9)     # safety normalize
    master = (master * 0.89 * 32767).astype(np.int16)

    interleaved = np.empty(master.shape[1] * 2, dtype=np.int16)
    interleaved[0::2] = master[0]
    interleaved[1::2] = master[1]
    out = AudioSegment(interleaved.tobytes(), frame_rate=SR,
                       sample_width=2, channels=2)
    out.export(out_path, format="wav")
    print(f"✔ exported → {out_path}  ({bed_minutes:.0f} min · 48 kHz · 16-bit)")
    print("  spec: HALL 2.4s · WET 35/65 · PP 120ms/15% · LP 6k · θ 6 Hz")

if __name__ == "__main__":
    render(
        ["whisper_luna.wav", "whisper_cuna.wav",
         "whisper_fortuna.wav", "whisper_laguna.wav"],
        out_path="neuro_hypno_session.wav",
        bed_minutes=10,
    )
`;

export const REQUIREMENTS_TXT = `# NEURO-HYPNO — spatial reverb engine
# Python 3.10+ · tested on 3.11
pedalboard==0.9.13      # Spotify audio FX (glue reverb / filters)
pydub==0.25.1           # voice file I/O (needs ffmpeg on PATH)
scipy==1.12.0           # cathedral IR + 6 kHz SOS lowpass + FFT conv
numpy==1.26.4           # AAAA stacking / binaural synthesis
soundfile==0.12.1       # optional: fast WAV read/write
ffmpeg                  # system binary — brew install ffmpeg / apt install ffmpeg
`;

export const ARCHITECTURE_TXT = `NEURO-HYPNO // SIGNAL FLOW — CH1 TARGET WHISPER
═══════════════════════════════════════════════════════════════

  whisper_luna.wav ──┐
  whisper_cuna.wav ──┼─► pydub load (48 kHz mono, normalize −1 dB)
  whisper_fortuna ───┤         │
  whisper_laguna.wav ┘         ▼
                     ┌─────────────────────┐
                     │ CATHEDRAL IR 2.4 s  │  FFT convolution, stereo
                     │ predelay 18 ms      │  env = exp(−6.908·t/RT60)
                     └────────┬────────────┘
                              ▼
                     ┌─────────────────────┐
                     │ TAIL LOWPASS 6 kHz  │  4th-order Butterworth (SOS)
                     │ (wet only!)         │  kills harsh sibilance
                     └────────┬────────────┘
                              ▼
                     ┌─────────────────────┐
                     │ PING-PONG 120 ms    │  L⇄R cross-feedback 15%
                     │ 3 hops, mix 45%     │  hemisphere drift
                     └────────┬────────────┘
                              ▼
              ┌─── DRY 65% ────┴──── WET 35% ────┐
              │   (dual-mono, intelligible)      │
              ▼                                  ▼
       pedalboard glue: HP 70 Hz → LP 14 kHz
                       → room 0.88 → delay 0.12 → gain −1.5 dB
                              │
                              ▼
                     ┌─────────────────────┐
                     │ AAAA STACK          │  stagger 260 ms
                     │ gains 1/.55/.42/.34 │  pans −.25/−.08/+.12/+.30
                     └────────┬────────────┘
                              ▼  ×0.72
                     ┌─────────────────────┐
                     │ + THETA BED 10 min  │  L 200 Hz / R 206 Hz = 6 Hz beat
                     │ −18 dB, 0.1 Hz swell │  3 s raised-cosine fades
                     └────────┬────────────┘
                              ▼
                    normalize → 16-bit → neuro_hypno_session.wav
                              48 kHz stereo · sleep-safe · loopable
`;

export const SPEAKER_PY = `# ============================================================
#  NEURO-HYPNO // Ambient Speaker & Small Room Optimization
#  Module: speaker_mode_engine.py  (NO HEADPHONES MODE)
#  ------------------------------------------------------------
#  Frekans motoru: Binaural → 6 Hz İzokronik nabız
#  Taşıyıcı: 136.1 Hz (Om) + 2./3. HARMONİK TAKVİYE (272.2 / 408.3 Hz)
#  Neden harmonik? Telefon hoparlörleri ~300 Hz altını fiziksel olarak
#  zayıf basar — bu yüzden 136.1 Hz tek başına "vurmaz". Çözüm: aynı 6 Hz
#  kapıyla modüle edilen üst harmonikler + kısa perküsif "thump" eklenir;
#  kulak bunları "eksik temel" (missing fundamental) illüzyonuyla 136.1 Hz
#  ritmi olarak algılar — küçük sürücü bu frekansları çok daha güçlü basar.
#  Kapılama: 6 Hz keskinleştirilmiş zarf (tanh), %100 derinlik
#  Sahne: Mid-Side daraltma + 2-4 kHz fısıltı netliği + limiter
# ============================================================

import numpy as np
from scipy import signal
from pydub import AudioSegment
from pedalboard import Pedalboard, LowpassFilter, HighpassFilter, Gain, PeakFilter, Compressor

SR = 48000
ISO_RATE = 6.0          # teta kapılama hızı (Hz)
CARRIER = 136.1         # Om taşıyıcı / temel (Hz)
H2, H3 = CARRIER * 2, CARRIER * 3   # 272.2 Hz, 408.3 Hz — hoparlörde güçlü basar
SIDE_WIDTH = 0.30       # M/S yan kanal daraltma (oda uyumu)
MID_GAIN_DB = 1.3       # merkez güçlendirme (telefon hoparlörü)
CLARITY_FREQ = 3000     # 2-4 kHz netlik bandı merkezi
CLARITY_DB = 4.0        # fısıltı artışı (düşük oda sesinde anlaşılırlık)

def _sharp_gate(t: np.ndarray, rate: float, k: float = 2.6) -> np.ndarray:
    """Sinüsü tanh ile keskinleştirip 0..1 kapıya çevirir — daha BELİRGİN nabız."""
    raw = np.sin(2 * np.pi * rate * t)
    sharp = np.tanh(k * raw) / np.tanh(k)
    return 0.5 + 0.5 * sharp

# ------------------------------------------------------------
# 1. İZOKRONİK YATAK (HARMONİK TAKVİYELİ) — hoparlörde garanti hissedilir
#    weak=True ise (ölçülen bas zayıfsa) temel kısılır, harmonikler +
#    thump öne çıkar; weak=False ise temel baskın kalır.
# ------------------------------------------------------------
def isochronic_bed(dur_s: float, sr: int = SR, carrier: float = CARRIER,
                   rate: float = ISO_RATE, level_db: float = -14.0,
                   weak_speaker: bool = True):
    n = int(dur_s * sr)
    t = np.arange(n) / sr
    amp = 10 ** (level_db / 20)
    gate = _sharp_gate(t, rate, k=2.6)                # keskin %100 derinlik kapı

    w1, w2, w3 = (0.55, 0.62, 0.42) if weak_speaker else (0.95, 0.4, 0.22)
    tone = (np.sin(2 * np.pi * carrier * t) * w1
          + np.sin(2 * np.pi * H2 * t) * w2
          + signal.sawtooth(2 * np.pi * H3 * t, width=0.5) * w3 * 0.6)

    # perküsif "thump": bant geçirgen gürültü, aynı keskin kapıyla tetiklenir
    noise = np.random.randn(n)
    sos = signal.butter(2, [120, 220], btype="band", fs=sr, output="sos")
    thump = signal.sosfilt(sos, noise) * (gate ** 3) * (0.5 if weak_speaker else 0.25)

    mono = ((tone * gate + thump) * amp).astype(np.float32)
    # açılış/kapanış: 3 sn raised-cosine (tıklamasız uyku)
    f = int(3 * sr)
    fade = 0.5 * (1 - np.cos(np.pi * np.arange(f) / f))
    mono[:f] *= fade
    mono[-f:] *= fade[::-1]
    return np.stack([mono, mono])  # dual-mono → odaya eşit yayılır

# ------------------------------------------------------------
# 1b. MİKROFON KALİBRASYONU (opsiyonel, canlı uygulamada gerçek zamanlı)
#     Beş test tonu çalınır, kayıt mikrofonundan FFT ile seviye ölçülür.
#     base_db << best_db ise hoparlör "zayıf" kabul edilir → weak_speaker=True.
# ------------------------------------------------------------
def analyze_calibration_recording(rec: np.ndarray, sr: int = SR) -> dict:
    freqs = [CARRIER, 204.15, H2, 340.25, H3]
    n = len(rec)
    spec = np.abs(np.fft.rfft(rec * np.hanning(n)))
    bin_hz = sr / n
    levels = {f: float(spec[int(f / bin_hz)]) for f in freqs}
    base, best = levels[CARRIER], max(levels.values())
    weak = base < best * 0.6
    return {"levels": levels, "weak": weak, "best_freq": max(levels, key=levels.get)}

# ------------------------------------------------------------
# 2. MID-SIDE ODA İŞLEME — akıllı telefon hoparlörleri için
#    Mid = (L+R)/2 güçlendir · Side = (L-R)/2 daraltılır.
#    Sonuç: küçük sürücüde faz iptali yok, fısıltı odada sabit.
# ------------------------------------------------------------
def mid_side_room(stereo: np.ndarray, side: float = SIDE_WIDTH,
                  mid_db: float = MID_GAIN_DB) -> np.ndarray:
    mid = (stereo[0] + stereo[1]) / 2 * 10 ** (mid_db / 20)
    s = (stereo[0] - stereo[1]) / 2 * side
    return np.stack([mid + s, mid - s]).astype(np.float32)

# ------------------------------------------------------------
# 3. FISILTI NETLİĞİ — 2-4 kHz raf yükseltme (yalnızca CH1)
#    Düşük oda sesinde ünsüzler kaybolmasın diye +4 dB @ 3 kHz.
#    Kullanıcıyı uyandırmayacak kadar nazik, anlaşılacak kadar net.
# ------------------------------------------------------------
def whisper_clarity(voice_mono: np.ndarray, sr: int = SR,
                    freq: float = CLARITY_FREQ, db: float = CLARITY_DB):
    sos = signal.butter(2, [2000, 4000], btype="band", fs=sr, output="sos")
    presence = signal.sosfilt(sos, voice_mono)
    blend = voice_mono + presence * (10 ** (db / 20) - 1) * 0.5
    board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=180),   # küçük sürücü uğultu temizliği
        PeakFilter(cutoff_frequency_hz=freq, gain_db=db * 0.5, q=0.9),
        LowpassFilter(cutoff_frequency_hz=12000),  # oda güvenli tavan
    ])
    stereo = np.stack([blend, blend]).astype(np.float32)
    return board(stereo, sample_rate=sr).astype(np.float32)

# ------------------------------------------------------------
# 4. ODA MASTER — izokronik + net fısıltı + M/S sahne
# ------------------------------------------------------------
def render_speaker(voice_paths: list[str], out_path: str, minutes: float = 10.0,
                   calibration: dict | None = None):
    weak = calibration["weak"] if calibration else True  # ölçüm yoksa güvenli varsayım
    print("◉ NEURO-HYPNO speaker render — izokronik oda modu (10 dk hızlı iniş)")
    print(f"  taşıyıcı {CARRIER}/{H2:.1f}/{H3:.1f} Hz · kapılama {ISO_RATE} Hz · zayıf_hoparlör={weak}")

    total = int(minutes * 60 * SR)
    bed = isochronic_bed(minutes * 60, weak_speaker=weak)
    mix = np.zeros((2, total), dtype=np.float32)

    for i, p in enumerate(voice_paths[:4]):
        seg = AudioSegment.from_file(p).set_frame_rate(SR).set_channels(1)
        arr = np.array(seg.get_array_of_samples(), dtype=np.float32)
        arr = arr / (np.max(np.abs(arr)) + 1e-9) * 0.89
        print(f"  ▸ CH1.{i+1} {p} → netlik +{CLARITY_DB}dB @ {CLARITY_FREQ/1000:.0f}k")
        clear = whisper_clarity(arr)
        # AAAA istifleme: 260 ms gecikme + azalan kazanç
        off = int(i * 0.26 * SR)
        g = [1.0, 0.55, 0.42, 0.34][i]
        n = min(clear.shape[1], total - off)
        mix[:, off: off + n] += clear[:, :n] * g * 0.8

    mix = mid_side_room(mix)                       # oda sahnesi
    pre = (mix * 0.72 + bed).T                     # fısıltı nabzın üstünde yüzer
    board = Pedalboard([Compressor(threshold_db=-8, ratio=5, attack_ms=2, release_ms=220)])
    master = board(pre.T, sample_rate=SR)           # limiter: küçük hoparlörde tutarlı yükseklik
    master /= (np.max(np.abs(master)) + 1e-9)
    master = (master * 0.92 * 32767).astype(np.int16)

    interleaved = np.empty(master.shape[1] * 2, dtype=np.int16)
    interleaved[0::2] = master[0]
    interleaved[1::2] = master[1]
    out = AudioSegment(interleaved.tobytes(), frame_rate=SR,
                       sample_width=2, channels=2)
    out.export(out_path, format="wav")
    print(f"✔ exported → {out_path}")
    print("  spec: ISO 136.1/272.2/408.3 Hz · M/S 0.30 · +4dB@3k · limiter · kulaklıksız oda")

if __name__ == "__main__":
    # Opsiyonel: önce mic ile kaydedilen test tonlarını analiz et
    # calib = analyze_calibration_recording(load_voice("calib_recording.wav"))
    render_speaker(
        ["whisper_luna.wav", "whisper_cuna.wav",
         "whisper_fortuna.wav", "whisper_laguna.wav"],
        out_path="neuro_hypno_speaker.wav",
        minutes=10,          # ilk 10 dakikada yarı-uyku/yarı-uyanık hedefi
        calibration=None,    # {"weak": True, ...} → analyze_calibration_recording çıktısı
    )
`;

