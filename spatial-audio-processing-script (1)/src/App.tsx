import { useEffect } from 'react';
import {
  House, Compass, Activity, User, Play, Pause, X, Trophy,
  GraduationCap, BookOpen, ChevronRight, Brain, MoonStar,
  Sparkles, Headphones, ShieldCheck, FlaskConical,
} from 'lucide-react';
import { AppProvider, useApp, buzz } from './store';
import type { Tab } from './store';
import { PHASE_AUTO } from './data/content';
import { Toasts, Bar } from './components/ui';
import { EqBars } from './components/visuals';
import Home from './screens/Home';
import Explore, { BuilderSheet } from './screens/Explore';
import Stats from './screens/Stats';
import Profile from './screens/Profile';
import Player from './screens/Player';
import Onboarding from './screens/Onboarding';
import { CurriculumSheet } from './screens/Curriculum';
import { InductionSheet, SpeakerCalibration } from './screens/Induction';
import { DisclaimerModal } from './screens/Disclaimer';
import { ScienceSheet } from './screens/Science';
import { EncodingSheet } from './screens/Encoding';

// ── mini oynatıcı ──
function MiniPlayer() {
  const { playing, requestPlay, current, setPlayerOpen, playerOpen, progress, phaseIdx } = useApp();
  if (!playing || playerOpen) return null;
  return (
    <div className="fixed inset-x-0 bottom-[86px] z-40 mx-auto w-full max-w-[480px] px-4">
      <button
        onClick={() => { buzz(10); setPlayerOpen(true); }}
        className="glass-deep block w-full overflow-hidden rounded-2xl p-2.5 text-left shadow-[0_12px_44px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center gap-3">
          <span className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${current.gradient}`}>
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <EqBars playing n={4} color="linear-gradient(180deg,#fff,#ffffff77)" />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold">{current.title}</span>
            <span className="block font-mono text-[10px]" style={{ color: current.accent }}>
              FAZ {phaseIdx + 1}/5 · {PHASE_AUTO[phaseIdx].name.toUpperCase()}
            </span>
          </span>
          <span
            role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); requestPlay(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') requestPlay(); }}
            className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black"
          >
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
          </span>
        </div>
        <div className="mt-2"><Bar pct={progress * 100} color={current.accent} h={3} /></div>
      </button>
    </div>
  );
}

// ── sekme çubuğu ──
function TabBar() {
  const { tab, setTab, playing, requestPlay, playerOpen } = useApp();
  if (playerOpen) return null;

  const item = (id: Tab, label: string, icon: React.ReactNode) => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        className="pressable flex flex-1 flex-col items-center gap-1 py-1.5"
      >
        <span className={active ? 'text-cyan-300' : 'text-white/35'}>{icon}</span>
        <span className={`text-[10px] font-bold ${active ? 'text-cyan-200' : 'text-white/35'}`}>{label}</span>
        {active && <span className="h-1 w-6 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
      </button>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="tabbar-blur mx-auto w-full max-w-[480px] rounded-t-[26px] border-x border-t border-white/10 px-2 pb-safe pt-1.5">
        <div className="flex items-end">
          {item('home', 'Bugün', <House className="h-[22px] w-[22px]" />)}
          {item('explore', 'Keşfet', <Compass className="h-[22px] w-[22px]" />)}
          <div className="flex flex-1 flex-col items-center gap-1 pb-1">
            <button
              onClick={requestPlay}
              className="pressable -mt-7 flex h-[62px] w-[62px] items-center justify-center rounded-full border-4 border-[#06021a] bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_8px_32px_rgba(139,92,246,0.55)]"
              aria-label={playing ? 'Duraklat' : 'Başlat'}
            >
              {playing ? <Pause className="h-6 w-6 fill-white text-white" /> : <Play className="ml-0.5 h-6 w-6 fill-white text-white" />}
            </button>
            <span className={`text-[10px] font-bold ${playing ? 'text-fuchsia-200' : 'text-white/35'}`}>{playing ? 'CANLI' : 'UYKU'}</span>
          </div>
          {item('stats', 'İlerleme', <Activity className="h-[22px] w-[22px]" />)}
          {item('profile', 'Profil', <User className="h-[22px] w-[22px]" />)}
        </div>
      </div>
    </div>
  );
}

// ── sabah testi ──
function QuizModal() {
  const { quizOpen, quizCards, quizIdx, quizReveal, revealQuiz, answerQuiz, closeQuiz, reviewMode } = useApp();
  if (!quizOpen || quizCards.length === 0) return null;
  const card = quizCards[quizIdx];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="anim-fadeIn absolute inset-0 bg-black/80" onClick={closeQuiz} />
      <div className="anim-popIn glass-deep relative w-full max-w-[400px] rounded-[28px] p-6 text-center">
        <button onClick={closeQuiz} className="pressable absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5">
          <X className="h-4 w-4 text-white/60" />
        </button>
        <div className="font-mono text-[10px] tracking-[0.3em] text-amber-300">{reviewMode ? 'ARALIKLI TEKRAR · EBBINGHAUS' : 'SABAH HATIRLAMA TESTİ'}</div>
        <div className="mt-2 font-mono text-[11px] text-white/40">{quizIdx + 1} / {quizCards.length}</div>
        <div className="mt-3"><Bar pct={((quizIdx + (quizReveal ? 0.5 : 0)) / quizCards.length) * 100} color="#fbbf24" /></div>
        <button onClick={revealQuiz} className="pressable mt-5 block w-full rounded-3xl border border-white/12 bg-black/40 px-4 py-8">
          <div className="font-mono text-[10px] tracking-[0.25em] text-white/40">BU KELİME NE DEMEK?</div>
          <div className="mt-2 font-serif text-[38px] italic leading-none text-white">{card.word}</div>
          <div className="mt-4 min-h-[28px]">
            {quizReveal
              ? <span className="anim-ticker inline-block rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-1.5 text-[15px] font-bold text-emerald-200">{card.gloss}</span>
              : <span className="font-mono text-[11px] tracking-widest text-white/35">GÖRMEK İÇİN DOKUN</span>}
          </div>
        </button>
        {quizReveal ? (
          <div className="anim-fadeUp mt-4 grid grid-cols-2 gap-2.5">
            <button onClick={() => answerQuiz(false)} className="pressable rounded-2xl border border-rose-400/30 bg-rose-500/15 py-4 text-[14px] font-bold text-rose-200">
              Unuttum
              <span className="block text-[10px] font-normal text-rose-200/60">tekrar sıraya al</span>
            </button>
            <button onClick={() => answerQuiz(true)} className="pressable rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-[14px] font-bold text-white shadow-[0_8px_28px_rgba(52,211,153,0.35)]">
              Bildim!
              <span className="block text-[10px] font-normal text-white/70">+6 XP</span>
            </button>
          </div>
        ) : (
          <p className="mt-4 font-mono text-[10px] text-white/30">ÖNCE ANLAMINI TAHMİN ET, SONRA KARTA DOKUN</p>
        )}
      </div>
    </div>
  );
}

// ── seans özeti ──
function RecapModal() {
  const { recap, closeRecap, setTab, startQuiz } = useApp();
  if (!recap) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="anim-fadeIn absolute inset-0 bg-black/80" onClick={closeRecap} />
      <div className="anim-popIn glass-deep relative w-full max-w-[400px] overflow-hidden rounded-[28px] p-6 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_36px_rgba(251,191,36,0.45)]">
          <Trophy className="h-8 w-8 text-white" />
        </span>
        <h2 className="relative mt-4 text-[22px] font-bold">Seans tamamlandı</h2>
        <p className="relative mt-1 font-mono text-[11px] text-white/45">{recap.sessionTitle.toUpperCase()}</p>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[
            { v: `+${recap.xp}`, l: 'XP', c: '#e879f9' },
            { v: `${recap.minutes}`, l: 'dakika', c: '#22d3ee' },
            { v: `+${recap.words}`, l: 'kelime', c: '#34d399' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-black/40 py-3">
              <div className="font-mono text-[19px] font-bold" style={{ color: s.c }}>{s.v}</div>
              <div className="font-mono text-[9px] tracking-widest text-white/40">{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div className="relative mt-4 space-y-2">
          <button
            onClick={() => { closeRecap(); startQuiz(); }}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[14px] font-bold text-black"
          >
            <GraduationCap className="h-4.5 w-4.5" /> Sabah Testine Gir
          </button>
          <button
            onClick={() => { closeRecap(); setTab('profile'); }}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-[14px] font-bold text-white/85"
          >
            <BookOpen className="h-4 w-4" /> Rüyayı Günlüğe Yaz <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── masaüstü yan panelleri ──
function SidePanels() {
  return (
    <>
      <aside className="fixed left-8 top-1/2 hidden w-[290px] -translate-y-1/2 xl:block">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20">
            <Brain className="h-6 w-6 text-cyan-300" />
          </span>
          <div>
            <div className="text-[16px] font-bold tracking-[0.18em]">NEURO-HYPNO</div>
            <div className="font-mono text-[9px] tracking-[0.28em] text-white/40">MOBİL GECE KONSOLU</div>
          </div>
        </div>
        <p className="mt-5 font-serif text-[19px] italic leading-snug text-white/70">
          “Telefonunu yastığa koy, kulaklığı tak. Gerisini teta dalgası halleder.”
        </p>
        <div className="mt-6 space-y-2.5 font-mono text-[10.5px]">
          {[
            ['HALL', 'Katedral · RT60 2.4s', '#a78bfa'],
            ['MİKS', '%35 ıslak / %65 kuru', '#22d3ee'],
            ['YANKI', 'Ping-pong 120ms · %15', '#34d399'],
            ['FİLTRE', 'Kuyruk tiz kesimi 6kHz', '#fbbf24'],
            ['YATAK', 'Teta 6 Hz · L200/R206', '#e879f9'],
          ].map(([k, v, c]) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <span className="font-bold" style={{ color: c }}>{k}</span>
              <span className="text-white/55">{v}</span>
            </div>
          ))}
        </div>
      </aside>
      <aside className="fixed right-8 top-1/2 hidden w-[290px] -translate-y-1/2 xl:block">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-white/45">
            <MoonStar className="h-4 w-4 text-violet-300" /> GECE PROTOKOLÜ
          </div>
          <div className="mt-3 space-y-2">
            {PHASE_AUTO.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5 text-[12px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/8 font-mono text-[10px] font-bold text-white/60">{i + 1}</span>
                <span className="font-semibold text-white/80">{p.name}</span>
                <span className="ml-auto font-mono text-[10px] text-white/35">%{Math.round(p.at * 100)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {[
            [<Headphones key="h" className="h-4 w-4 text-amber-300" />, 'Kulaklıkla dinle — stereo şart'],
            [<ShieldCheck key="s" className="h-4 w-4 text-emerald-300" />, 'Uyku güvenli tavan · −1 dB'],
            [<FlaskConical key="f" className="h-4 w-4 text-cyan-300" />, 'Canlı motor · anında mikser'],
          ].map(([icon, t], i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[12px] text-white/60">
              {icon}{t}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] text-white/25">
          <Sparkles className="h-3 w-3" /> TELEFONDA TAM EKRAN DENE
        </div>
      </aside>
    </>
  );
}

function Shell() {
  const { tab, playing, toasts, onboarded, disclaimerAccepted, disclaimerOpen, setDisclaimerOpen } = useApp();

  // İlk kez açılışta (ya da güncelleme sonrası eski kullanıcılarda) zorunlu
  // güvenlik onayını otomatik göster — Dr. M. Soysal (Klinik Nöroloji) bulgusu.
  useEffect(() => {
    if (onboarded && !disclaimerAccepted && !disclaimerOpen) {
      const t = setTimeout(() => setDisclaimerOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, [onboarded, disclaimerAccepted, disclaimerOpen, setDisclaimerOpen]);

  return (
    <div className="app-surface relative min-h-dvh bg-[#01000c] text-slate-100">
      {/* ambiyans */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-800/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-600/10 blur-[100px]" />
        <div className="absolute bottom-40 right-0 h-72 w-72 rounded-full bg-fuchsia-700/10 blur-[100px]" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      <SidePanels />

      {/* telefon sütunu */}
      <div className="relative mx-auto min-h-dvh w-full max-w-[480px] border-white/8 bg-gradient-to-b from-[#0a0628]/60 to-[#030014]/90 sm:border-x">
        <div key={tab} className="anim-fadeIn pb-[112px] pt-2">
          {tab === 'home' && <Home />}
          {tab === 'explore' && <Explore />}
          {tab === 'stats' && <Stats />}
          {tab === 'profile' && <Profile />}
        </div>
        {playing && <div className="h-[70px]" />}
      </div>

      <MiniPlayer />
      <TabBar />
      <Player />
      <BuilderSheet />
      <CurriculumSheet />
      <InductionSheet />
      <SpeakerCalibration />
      <QuizModal />
      <RecapModal />
      <EncodingSheet />
      <ScienceSheet />
      <DisclaimerModal />
      <Toasts list={toasts} />
      <Onboarding />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
