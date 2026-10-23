import { useMemo } from 'react';
import {
  Flame, Bell, Moon, Play, Pause, ChevronRight, GraduationCap,
  Wand2, Timer, Headphones, Sparkles, Zap, ArrowRight, Brain, Rocket,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { RHYMES, DREAM_TIPS, RITUALS } from '../data/content';
import { ModeSwitch } from './Induction';
import { Mic, AlertTriangle, Lock as LockIcon, Target, BookOpenCheck, Brain as BrainIcon } from 'lucide-react';
import { SectionHead, Ring, Bar, Done } from '../components/ui';
import { EqBars } from '../components/visuals';
import { assessCycleEnd } from '../data/chrono';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Günaydın';
  if (h >= 12 && h < 18) return 'İyi günler';
  if (h >= 18 && h < 23) return 'İyi akşamlar';
  return 'İyi geceler';
}

function fmtMin(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m} dk ${s}sn` : `${s}sn`;
}

export default function Home() {
  const {
    setTab, playing, requestPlay, current, setPlayerOpen, sleepTimerMin, setSleepTimer,
    streak, xp, level, levelPct, ritual, toggleRitual, ritualDone, liveWord,
    startQuiz, setBuilderOpen, bedtimeCountdown, pushToast, remaining,
    setCurrLang, setIndOpen, unlocked, outputMode, speakerCalib, setCalibModalOpen,
    startEncoding, encodingDoneForCurrent, setScienceOpen,
    induction, whisperArmed, whisperCountdown, whisperLevelPct, whisperRampProgress,
    stage, stageCount, stageTimeLeftSec, stageDurationSec, cycleLaps,
    stageIsManual, jumpToStage, setStageAuto,
    reinforcementActive, srsDueCount, startReviewQuiz,
  } = useApp();

  const today = useMemo(
    () => new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  );
  const tip = DREAM_TIPS[new Date().getDate() % DREAM_TIPS.length];
  const readiness = 62 + ritualDone * 9 + (playing ? 5 : 0);
  const cycleRisk = useMemo(() => assessCycleEnd(sleepTimerMin), [sleepTimerMin]);

  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      {/* ── başlık ── */}
      <header className="anim-fadeUp flex items-center gap-3 pt-2">
        <button
          onClick={() => { buzz(10); setTab('profile'); }}
          className="pressable relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600/50 to-fuchsia-600/40"
        >
          <Brain className="h-6 w-6 text-violet-100" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#07031c] bg-gradient-to-br from-cyan-400 to-violet-500 font-mono text-[9px] font-bold">
            {level}
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{today}</div>
          <h1 className="truncate text-[19px] font-bold tracking-tight">{greeting()}, <span className="font-serif font-normal italic text-violet-200">rüya gezgini</span></h1>
        </div>
        <button onClick={() => { buzz(10); setTab('stats'); }} className="pressable flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-2">
          <Flame className="h-4 w-4 text-orange-300" />
          <span className="font-mono text-[13px] font-bold text-orange-200">{streak}</span>
        </button>
        <button onClick={() => { buzz(10); pushToast('Bu gece 23:30 seans hatırlatıcısı kurulu', 'info'); }} className="pressable relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Bell className="h-[18px] w-[18px] text-white/70" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
        </button>
      </header>

      {/* ── bu gecenin seansı ── */}
      <section className="anim-fadeUp stagger-1 relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-[#151045] via-[#0d0830] to-[#07031c] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-cyan-300">
            <Moon className="h-3.5 w-3.5" /> BU GECE · {current.langTr.toUpperCase()}
          </div>
          <button onClick={() => setTab('explore')} className="pressable flex items-center gap-1 font-mono text-[10px] tracking-widest text-white/50">
            DEĞİŞTİR <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <button onClick={() => setPlayerOpen(true)} className="relative mt-3 block w-full text-left">
          <h2 className="text-[24px] font-bold leading-tight tracking-tight">{current.title}</h2>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/55">{current.desc}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/70">θ {current.theta} Hz</span>
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/70">HALL 2.4s</span>
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/70">WET 35%</span>
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-white/70">PP 120ms</span>
          </div>
        </button>
        {/* zamanlayıcı */}
        <div className="relative mt-4 flex items-center gap-2">
          <Timer className="h-4 w-4 shrink-0 text-white/40" />
          <div className="flex flex-1 gap-1.5">
            {[10, 20, 45, 90].map((m) => (
              <button
                key={m}
                onClick={() => setSleepTimer(m)}
                className={`pressable relative flex-1 rounded-xl border py-2 font-mono text-[12px] font-bold tabular-nums ${sleepTimerMin === m ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-black/30 text-white/45'}`}
              >
                {m}
                {m === 90 && <span className="absolute -top-1.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-1.5 flex items-center gap-1.5 font-mono text-[9.5px]" style={{ color: cycleRisk.risk === 'düşük' ? '#34d399' : cycleRisk.risk === 'orta' ? '#fbbf24' : '#fb7185' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: cycleRisk.risk === 'düşük' ? '#34d399' : cycleRisk.risk === 'orta' ? '#fbbf24' : '#fb7185' }} />
          {cycleRisk.note}
        </div>
        <div className="relative mt-3 flex items-center gap-3">
          <button
            onClick={requestPlay}
            className="pressable flex h-[60px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 text-[15px] font-bold tracking-wide shadow-[0_10px_36px_rgba(139,92,246,0.45)]"
          >
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            {playing ? 'SEANSI DURAKLAT' : 'UYKUYA DAL · BAŞLAT'}
          </button>
          <button onClick={() => setPlayerOpen(true)} className="pressable flex h-[60px] w-[60px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/15 bg-white/5">
            <EqBars playing={playing} n={4} />
            <span className="font-mono text-[8px] tracking-widest text-white/50">{playing ? 'CANLI' : 'MİKS'}</span>
          </button>
        </div>
        {!playing && (
          <button
            onClick={() => { buzz(10); startEncoding(); }}
            className="pressable relative mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-500/8 py-2.5 font-mono text-[10.5px] font-bold tracking-wide text-cyan-100"
          >
            {encodingDoneForCurrent ? '✓ Uyanıkken kodlandı — tekrar et' : '📖 Önce 60sn uyanıkken kodla (önerilen)'}
          </button>
        )}
        {playing && !induction && (
          <div className="relative mt-3 flex items-center justify-between font-mono text-[10px] tracking-widest">
            <span className="text-emerald-300">● YAYINDA · {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} KALDI</span>
            <span className={whisperArmed ? 'text-indigo-300' : 'text-white/35'}>
              {whisperArmed ? `🗣️ FISILTI %${whisperLevelPct}${whisperRampProgress >= 1 ? ' · TAM SEVİYE' : ' · YÜKSELİYOR'}` : `🔒 FISILTI ${Math.floor(whisperCountdown / 60)}:${String(whisperCountdown % 60).padStart(2, '0')}`}
            </span>
          </div>
        )}
        {playing && induction && (
          <div className="relative mt-3 font-mono text-[10px] tracking-widest text-emerald-300">
            ● YAYINDA · {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} KALDI
          </div>
        )}
        {!playing && (
          <div className="relative mt-3 flex items-center gap-1.5 font-mono text-[10px] text-white/35">
            <LockIcon className="h-3 w-3" /> {current.langTr} fısıltısı 10. dakikada mikro seviyede başlar, 20. dakikada tam ritme ulaşır
          </div>
        )}
      </section>

      {/* ── bilim & güvenlik bandı ── */}
      <button
        onClick={() => setScienceOpen(true)}
        className="pressable anim-fadeUp stagger-1 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-3.5 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 font-mono text-[10px] font-bold text-emerald-300">QC</span>
        <span className="flex-1 text-[11.5px] leading-snug text-white/70">
          <b className="text-emerald-200">Kalite Kontrol geçti</b> — 4 nörolog/sinirbilimci incelemesi · pekiştirme doğruluğu + aralıklı tekrar eklendi
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
      </button>

      {/* ── çıkış modu ── */}
      <section className="anim-fadeUp stagger-2 glass rounded-[24px] p-4">
        <SectionHead
          title="Çıkış modu"
          sub={outputMode === 'phones' ? 'Binaural · L 200 / R 206 Hz' : 'İzokronik · 136.1 Hz Om + M/S oda'}
        />
        <div className="mt-3"><ModeSwitch /></div>
        {outputMode === 'speaker' && (
          <button
            onClick={() => { buzz(12); setCalibModalOpen(true); }}
            className={`pressable mt-2.5 flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left ${speakerCalib ? 'border-emerald-400/25 bg-emerald-500/8' : 'border-amber-300/30 bg-amber-500/10'}`}
          >
            {speakerCalib ? <Mic className="h-4 w-4 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
            <span className="flex-1 text-[12px] font-semibold text-white/80">
              {speakerCalib
                ? `Kalibreli · ${speakerCalib.weak ? 'harmonik takviye aktif' : 'güçlü bas tespit edildi'}`
                : 'Hoparlör kalibre ediliyor…'}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-cyan-300">{speakerCalib ? 'YENİDEN' : 'OTOMATİK'}</span>
          </button>
        )}
      </section>

      {/* ── hipnagojik iniş ── */}
      <section className="anim-fadeUp stagger-2">
        <button
          onClick={() => setIndOpen(true)}
          className="pressable relative block w-full overflow-hidden rounded-[28px] border border-violet-400/30 bg-gradient-to-br from-indigo-600/35 via-violet-600/25 to-fuchsia-600/20 p-5 text-left shadow-[0_16px_50px_rgba(99,102,241,0.25)]"
        >
          <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="relative flex items-center gap-3.5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-[0_0_28px_rgba(139,92,246,0.5)]">
              <Rocket className="h-7 w-7 text-white" />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-violet-200">
                REHBERLİ PROGRAM · 10′
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px]">2 MODDA DA</span>
              </span>
              <span className="mt-1 block text-[19px] font-bold leading-tight">Hipnagojik İniş</span>
              <span className="block text-[12px] text-white/60">Beden uyur · bilinç açık · 10 dk frekans inişi</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/50" />
          </div>
          <div className="relative mt-3.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[20%] rounded-full bg-indigo-400" />
            </div>
            <span className="font-mono text-[9px] text-white/45">BEDEN → %96 UYKU</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="ml-auto h-full w-[90%] rounded-full bg-fuchsia-400" />
            </div>
            <span className="font-mono text-[9px] text-white/45">BİLİNÇ → %90 AÇIK</span>
          </div>
        </button>
      </section>

      {/* ── hızlı eylemler ── */}
      <section className="anim-fadeUp stagger-2 grid grid-cols-4 gap-2.5">
        {[
          { l: 'Seans Kur', i: <Wand2 className="h-5 w-5" />, c: '#e879f9', fn: () => setBuilderOpen(true), badge: 0 },
          { l: 'Sabah Testi', i: <GraduationCap className="h-5 w-5" />, c: '#fbbf24', fn: startQuiz, badge: 0 },
          { l: 'Aralıklı Tekrar', i: <BrainIcon className="h-5 w-5" />, c: '#a78bfa', fn: startReviewQuiz, badge: srsDueCount },
          { l: 'Kütüphane', i: <Headphones className="h-5 w-5" />, c: '#34d399', fn: () => setTab('explore'), badge: 0 },
        ].map((a) => (
          <button key={a.l} onClick={a.fn} className="pressable glass relative flex flex-col items-center gap-1.5 rounded-2xl py-3.5">
            {a.badge > 0 && (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[9px] font-bold text-black">
                {a.badge}
              </span>
            )}
            <span style={{ color: a.c }}>{a.i}</span>
            <span className="text-[10.5px] font-semibold text-white/75">{a.l}</span>
          </button>
        ))}
      </section>

      {/* ── hazırlık + ritüel ── */}
      <section className="anim-fadeUp stagger-3 glass rounded-[24px] p-4">
        <div className="flex items-center gap-4">
          <Ring pct={readiness} size={72} stroke={7} color="#a78bfa">
            <span className="font-mono text-[14px] font-bold">%{readiness}</span>
          </Ring>
          <div className="flex-1">
            <SectionHead title="Uyku hazırlığı" sub={`Yatma saatine ${bedtimeCountdown} kaldı`} />
            <div className="mt-2"><Bar pct={(ritualDone / 4) * 100} color="#a78bfa" /></div>
            <div className="mt-1 font-mono text-[10px] text-white/40">RİTÜEL {ritualDone}/4 · SEVİYE {level} · {xp} XP</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {RITUALS.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRitual(r.id)}
              className={`pressable flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all ${ritual[r.id] ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-white/10 bg-black/25'}`}
            >
              <Done on={!!ritual[r.id]} />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-white/90">{r.title}</span>
                <span className="block truncate text-[10px] text-white/40">{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── diller ── */}
      <section className="anim-fadeUp stagger-4">
        <div className="px-0.5">
          <SectionHead
            title="Dillerim" sub="Hangisine rüya kuruyorsun?"
            right={<button onClick={() => setTab('explore')} className="pressable flex items-center gap-0.5 text-[12px] font-semibold text-cyan-300">Tümü <ArrowRight className="h-3.5 w-3.5" /></button>}
          />
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {RHYMES.map((l) => {
            const done = unlocked[l.id] ?? 0;
            const codes = ['A1', 'A2', 'B1', 'B2', 'C1'];
            return (
              <button
                key={l.id}
                onClick={() => setCurrLang(l.id)}
                className="pressable glass w-[148px] shrink-0 snap-start rounded-3xl p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-[11px] font-bold" style={{ color: l.color }}>{l.id}</span>
                  <span className="rounded-full bg-white/8 px-2 py-0.5 font-mono text-[9px] font-bold" style={{ color: l.color }}>
                    {done >= 5 ? 'USTA' : codes[Math.min(4, done)]}
                  </span>
                </div>
                <div className="mt-2.5 text-[14px] font-bold">{l.langTr}</div>
                <div className="font-mono text-[10px] text-white/40">{l.lang} · {done}/5 seviye</div>
                <div className="mt-2.5"><Bar pct={(done / 5) * 100} color={l.color} h={5} /></div>
                <div className="mt-1 font-mono text-[10px] text-white/45">Müfredata gir →</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── gece döngüsü: 7 aşama × 45dk ── */}
      <section className="anim-fadeUp stagger-5 glass-deep overflow-hidden rounded-[24px] p-4">
        <SectionHead
          title={`Aşama ${stage.idx + 1}/${stageCount} · ${stage.rhyme} kafiyesi`}
          sub={playing ? `${current.langTr} · ${fmtMin(stageTimeLeftSec)} sonra sıradaki aşama` : `${current.langTr} · her aşama 45 dk sürer, 7 aşama sonra başa sarar`}
          right={<Zap className="h-4 w-4 text-amber-300" />}
        />
        {reinforcementActive ? (
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/12 px-3 py-1 font-mono text-[9.5px] font-bold tracking-wide text-emerald-200">
            <Target className="h-3 w-3" /> TMR PEKİŞTİRME · bu kelimeleri az önce kodladın
          </span>
        ) : (
          <button
            onClick={() => { buzz(10); startEncoding(); }}
            className="pressable mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-500/12 px-3 py-1 font-mono text-[9.5px] font-bold tracking-wide text-amber-200"
          >
            <BookOpenCheck className="h-3 w-3" /> PASİF TANIŞMA · kodlanmadı, ses kısık · şimdi kodla →
          </button>
        )}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {stage.words.map((w, i) => {
            const live = playing && liveWord === i;
            return (
              <div
                key={w}
                className="rounded-2xl border px-1 py-3 text-center transition-all"
                style={live
                  ? { borderColor: `${current.accent}88`, background: `${current.accent}1a`, boxShadow: `0 0 20px ${current.accent}44` }
                  : { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.3)' }}
              >
                <div className="font-mono text-[9px] text-white/35">A{i + 1}</div>
                <div className="truncate font-serif text-[16px] italic" style={{ color: live ? current.accent : '#fff' }}>{w}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 text-center font-mono text-[10.5px] text-white/40">{stage.glosses.join(' · ')}</p>
        <div className="mt-3 flex items-center gap-1.5">
          {Array.from({ length: stageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => jumpToStage(i)}
              className="pressable h-2.5 flex-1 overflow-hidden rounded-full bg-white/10"
              aria-label={`Aşama ${i + 1}'e atla`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={i < stage.idx
                  ? { width: '100%', background: current.accent, opacity: 0.4 }
                  : i === stage.idx
                    ? { width: playing && !stageIsManual ? `${(1 - stageTimeLeftSec / stageDurationSec) * 100}%` : '100%', background: current.accent }
                    : { width: '0%' }}
              />
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[9px] text-white/35">Bir aşamaya dokun, anında oraya atla — kilitli değil</span>
          {stageIsManual && (
            <button onClick={setStageAuto} className="pressable shrink-0 font-mono text-[9px] font-bold text-cyan-300">
              OTOYA DÖN
            </button>
          )}
        </div>
        {cycleLaps > 0 && (
          <div className="mt-2 text-center font-mono text-[9.5px] tracking-widest text-emerald-300">
            ✓ {cycleLaps}. TUR TAMAMLANDI · DÖNGÜ TEKRARLIYOR
          </div>
        )}
      </section>

      {/* ── seviye + ipucu ── */}
      <section className="anim-fadeUp stagger-6 grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="glass flex items-center gap-3 rounded-[24px] p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-fuchsia-300" />
          <p className="text-[12px] leading-relaxed text-white/60"><b className="text-white/85">Rüya ipucu —</b> {tip}</p>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-2 font-mono text-[9px] tracking-[0.25em] text-white/25">
        <span className="h-px w-8 bg-white/10" /> SEVİYE {level} · %{levelPct} <span className="h-px w-8 bg-white/10" />
      </div>
      <div className="px-1"><Bar pct={levelPct} color="#e879f9" h={5} /></div>
      <div className="h-1" />
    </div>
  );
}
