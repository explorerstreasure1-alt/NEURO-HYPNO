import {
  ChevronDown, Play, Pause, SkipBack, SkipForward, Timer,
  MoonStar, Sparkles, Volume2, ListMusic, Wand2, GraduationCap,
} from 'lucide-react';
import { Lock, Mic2, Target, BookOpenCheck } from 'lucide-react';
import { useApp, buzz } from '../store';
import { SESSIONS, PHASE_AUTO, presetOf, fmtClock } from '../data/content';
import { INDUCTION, brainBand } from '../data/curriculum';
import { assessCycleEnd, RISK_COLOR } from '../data/chrono';
import { ModeSwitch, InductionPanel } from './Induction';
import { Toggle, MSlider, Bar } from '../components/ui';
import { OrbCanvas, ScopeCanvas, EqBars } from '../components/visuals';

export default function Player() {
  const {
    playerOpen, setPlayerOpen, playing, requestPlay, current, selectSession,
    params, patch, elapsed, totalSecs, remaining, progress, phaseIdx,
    sleepTimerMin, setSleepTimer, smartWake, setSmartWake, autoPhase, setAutoPhase,
    liveWord, setTab, startQuiz, setBuilderOpen,
    outputMode, induction, indPhase, taperActive,
    whisperArmed, whisperDelaySec, whisperCountdown, whisperLiveIdx,
    whisperRampProgress, whisperLevelPct, whisperFullAtSec,
    stage, stageCount, stageTimeLeftSec, stageDurationSec, cycleLaps,
    stageIsManual, jumpToStage, setStageAuto,
    reinforcementActive, startEncoding,
    liveTheta, thetaDepth, descentProgress,
  } = useApp();

  if (!playerOpen) return null;
  const preset = presetOf(current);
  const idx = SESSIONS.findIndex((s) => s.id === current.id);

  const step = (dir: 1 | -1) => {
    const next = SESSIONS[(idx + dir + SESSIONS.length) % SESSIONS.length];
    selectSession(next, playing);
    if (!playing) setPlayerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => setPlayerOpen(false)} />
      <div className="anim-sheetUp absolute inset-0 mx-auto flex w-full max-w-[480px] flex-col overflow-hidden bg-[#07031c]">
        {/* arka plan */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${current.gradient} opacity-25`} />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="noise-overlay pointer-events-none absolute inset-0" />

        {/* başlık */}
        <div className="relative flex items-center justify-between px-4 pb-1 pt-safe">
          <button onClick={() => { buzz(10); setPlayerOpen(false); }} className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
            <ChevronDown className="h-5 w-5 text-white/75" />
          </button>
          <div className="text-center">
            <div className="font-mono text-[9px] tracking-[0.3em] text-white/45">ŞİMDİ ÇALINIYOR</div>
            <div className="font-mono text-[10px] tracking-widest" style={{ color: current.accent }}>
              {!playing ? '○ DURAKLATILDI' : induction
                ? `● İNİŞ ${indPhase + 1}/5 · ${INDUCTION[indPhase].name.toUpperCase()}`
                : `● FAZ ${phaseIdx + 1}/5 · ${PHASE_AUTO[phaseIdx].name.toUpperCase()}`}
            </div>
          </div>
          <button onClick={() => { buzz(10); setBuilderOpen(true); }} className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
            <Wand2 className="h-4 w-4 text-fuchsia-300" />
          </button>
        </div>

        <div className="no-scrollbar relative flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          {/* küre */}
          <div className="relative mx-auto mt-1 w-fit">
            <OrbCanvas playing={playing} beat={liveTheta} size={216} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[26px] font-bold tabular-nums text-white text-glow-violet">θ{liveTheta.toFixed(1)}</span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-white/50">CANLI FREKANS</span>
            </div>
            {playing && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <EqBars playing n={7} />
              </div>
            )}
          </div>

          {/* başlık + kelime bandı */}
          <div className="mt-4 text-center">
            <h2 className="text-[21px] font-bold leading-tight tracking-tight">{current.title}</h2>
            <p className="mt-0.5 font-mono text-[11px] text-white/45">{current.langTr} · {current.levelTr} · {preset.name}</p>
            {!induction && (
              <p className="mt-1 font-mono text-[10px] tracking-widest text-indigo-300/80">
                AŞAMA {stage.idx + 1}/{stageCount} · {stage.rhyme} KAFİYESİ{cycleLaps > 0 ? ` · ${cycleLaps}. TUR` : ''}
              </p>
            )}
            {!induction && (
              reinforcementActive ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/12 px-3 py-1 font-mono text-[9.5px] font-bold tracking-wide text-emerald-200">
                  <Target className="h-3 w-3" /> TMR PEKİŞTİRME · uyanıkken kodladığın kelimeler
                </span>
              ) : (
                <button
                  onClick={() => { buzz(10); startEncoding(); }}
                  className="pressable mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-500/12 px-3 py-1 font-mono text-[9.5px] font-bold tracking-wide text-amber-200"
                >
                  <BookOpenCheck className="h-3 w-3" /> PASİF TANIŞMA · kısık ses · şimdi kodla →
                </button>
              )
            )}
            <div key={`${stage.idx}-${liveWord}`} className="anim-ticker mt-3 flex items-center justify-center gap-2">
              {(induction ? current.words : stage.words).map((w, i) => (
                <span
                  key={w}
                  className="rounded-full border px-3 py-1.5 font-serif text-[15px] italic transition-all"
                  style={liveWord === i
                    ? { borderColor: `${current.accent}99`, color: current.accent, background: `${current.accent}14`, boxShadow: `0 0 18px ${current.accent}44` }
                    : { borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.4)' }}
                >
                  {w}
                </span>
              ))}
            </div>
            {!induction && (
              <div className="mx-auto mt-3 max-w-[300px]">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: stageCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToStage(i)}
                      className="pressable h-2 flex-1 overflow-hidden rounded-full bg-white/10"
                      aria-label={`Aşama ${i + 1}'e atla`}
                    >
                      <div
                        className="h-full rounded-full"
                        style={i < stage.idx
                          ? { width: '100%', background: current.accent, opacity: 0.4 }
                          : i === stage.idx
                            ? { width: playing && !stageIsManual ? `${(1 - stageTimeLeftSec / stageDurationSec) * 100}%` : '100%', background: current.accent }
                            : { width: '0%' }}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] text-white/35">
                  <span>{playing && !stageIsManual ? `Sıradaki aşama: ${fmtClock(stageTimeLeftSec)}` : 'Bir noktaya dokun, anında atla'}</span>
                  {stageIsManual && (
                    <button onClick={setStageAuto} className="pressable font-bold text-cyan-300">OTOYA DÖN</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── gecikmeli fısıltı: cümle kalıpları 10dk sonra, yankılı ── */}
          {!induction && (
            <div className="mt-4">
              {!whisperArmed ? (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Lock className="h-4 w-4 text-white/45" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] tracking-[0.2em] text-white/50">SESSİZ GİRİŞ</div>
                      <div className="text-[13px] font-bold text-white/85">
                        {playing ? `${fmtClock(whisperCountdown)} sonra mikro seviyede başlar` : 'Başlayınca önce 10 dk sessiz giriş'}
                      </div>
                    </div>
                    <Mic2 className="h-4 w-4 shrink-0 text-white/25" />
                  </div>
                  <div className="mt-3"><Bar pct={whisperDelaySec > 0 ? (Math.min(elapsed, whisperDelaySec) / whisperDelaySec) * 100 : 0} color="#818cf8" h={4} /></div>
                  <div className="mt-2.5 flex justify-between font-mono text-[9px] text-white/40">
                    <span>{fmtClock(whisperDelaySec)} · mikro giriş</span>
                    <span>{fmtClock(whisperFullAtSec)} · tam ritmik seviye</span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-white/45">
                    <b className="text-white/70">{current.langTr}</b> kelime ve cümleleri aniden başlamaz;
                    neredeyse sessizden, yankılı fısıltıyla yavaşça yükselir.
                  </p>
                </div>
              ) : (
                <div className="anim-fadeUp overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 p-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-indigo-200">
                    <Mic2 className="h-3.5 w-3.5" /> CANLI FISILTI · {current.langTr.toUpperCase()} KELİME/CÜMLE
                    <span className="ml-auto flex items-center gap-1 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> YANKILI</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between font-mono text-[9px] text-white/45">
                      <span>{whisperRampProgress >= 1 ? 'TAM RİTMİK SEVİYE' : 'SESSİZDEN YÜKSELİYOR'}</span>
                      <span>%{whisperLevelPct}</span>
                    </div>
                    <div className="mt-1.5"><Bar pct={whisperRampProgress * 100} color="#a78bfa" h={5} /></div>
                  </div>
                  {(() => {
                    const ph = stage.sentences[whisperLiveIdx % stage.sentences.length];
                    return (
                      <div key={`${stage.idx}-${whisperLiveIdx}`} className="anim-ticker mt-2.5">
                        <div className="font-serif text-[19px] italic leading-snug" style={{ color: current.accent }}>{ph.pattern}</div>
                        <div className="mt-1 text-[12.5px] text-white/65">{ph.gloss}</div>
                        <div className="mt-1 font-mono text-[9.5px] text-white/35">AAAA kafiye: {stage.rhyme} · aşama {stage.idx + 1}/{stageCount}</div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* çıkış modu + yatak okuması */}
          <div className="mt-4">
            <ModeSwitch compact />
            <div className="mt-2 text-center font-mono text-[10px] tracking-widest text-white/45">
              {outputMode === 'phones'
                ? `BİNAURAL θ ${liveTheta.toFixed(1)} Hz · L ${params.binauralBase.toFixed(0)} / R ${(params.binauralBase + liveTheta).toFixed(0)}`
                : `İZOKRONİK ${liveTheta.toFixed(1)} Hz · TAŞIYICI 136.1 Hz · M/S ODA`}
            </div>
          </div>

          {/* 10 dakikalık frekans inişi */}
          {(() => {
            const band = brainBand(liveTheta);
            return (
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.25em] text-white/40">10 DK FREKANS İNİŞİ</div>
                    <div className="mt-1 text-[20px] font-bold leading-none" style={{ color: band.color }}>
                      {liveTheta.toFixed(1)} Hz <span className="text-[11px] text-white/45">{band.name}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-white/45">
                    <div>DERİNLİK %{Math.round(thetaDepth * 100)}</div>
                    <div>{descentProgress >= 1 ? 'EŞİK SABİT' : `${Math.floor(descentProgress * 100)}% tamam`}</div>
                  </div>
                </div>
                <div className="mt-3"><Bar pct={descentProgress * 100} color={band.color} /></div>
                <div className="mt-2 flex justify-between font-mono text-[9px] text-white/35">
                  <span>0dk · 10 Hz</span><span>6dk · 6.1 Hz</span><span>10dk · hedef eşik</span>
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-white/50">{band.desc}. Frekans ani değişmez; her saniye yumuşakça kayar.</p>
              </div>
            );
          })()}

          <InductionPanel />

          {/* dalga */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <ScopeCanvas playing={playing} height={64} />
          </div>

          {/* ilerleme */}
          <div className="mt-3">
            <Bar pct={progress * 100} color={current.accent} />
            <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-white/45">
              <span>{fmtClock(elapsed)}</span>
              <span>−{fmtClock(remaining)}</span>
              <span>{fmtClock(totalSecs)}</span>
            </div>
            {taperActive && (
              <div className="anim-fadeUp mt-2 flex items-center justify-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 py-1.5 font-mono text-[9.5px] tracking-wide text-indigo-200">
                🌙 Akıllı Söndürme aktif — uyku sürekliliği için seviye kademeli kısılıyor
              </div>
            )}
          </div>

          {/* kontroller */}
          <div className="mt-2 flex items-center justify-center gap-6">
            <button onClick={() => step(-1)} className="pressable flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <SkipBack className="h-5 w-5 fill-current text-white/80" />
            </button>
            <button
              onClick={requestPlay}
              className="pressable flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white text-black shadow-[0_0_44px_rgba(255,255,255,0.3)]"
            >
              {playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
            </button>
            <button onClick={() => step(1)} className="pressable flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <SkipForward className="h-5 w-5 fill-current text-white/80" />
            </button>
          </div>

          {/* zamanlayıcı */}
          <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-white/50">
                <Timer className="h-4 w-4 text-cyan-300" /> UYKU ZAMANLAYICI
              </span>
              <span className="font-mono text-[11px] font-bold text-cyan-200">{sleepTimerMin} DK</span>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {[10, 20, 30, 45, 60, 90].map((m) => {
                const isFullCycle = m === 90;
                return (
                  <button
                    key={m}
                    onClick={() => setSleepTimer(m)}
                    className={`pressable relative flex-1 rounded-xl border py-2 font-mono text-[11.5px] font-bold tabular-nums ${sleepTimerMin === m ? 'border-cyan-300/60 bg-cyan-500/25 text-cyan-100' : 'border-white/10 bg-white/5 text-white/45'}`}
                  >
                    {m}
                    {isFullCycle && <span className="absolute -top-1.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />}
                  </button>
                );
              })}
            </div>
            {(() => {
              const c = assessCycleEnd(sleepTimerMin);
              return (
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[9.5px]" style={{ color: RISK_COLOR[c.risk] }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: RISK_COLOR[c.risk] }} />
                  90dk döngü · uyku ataleti riski: {c.risk.toUpperCase()} — {c.note}
                </div>
              );
            })()}
            <div className="mt-3 space-y-2.5 border-t border-white/8 pt-3">
              <div className="flex items-center gap-2.5">
                <MoonStar className="h-4 w-4 shrink-0 text-violet-300" />
                <span className="flex-1 text-[12.5px] font-medium text-white/75">Akıllı uyanış <span className="text-white/35">· hafif uykuda bitir</span></span>
                <Toggle on={smartWake} onClick={() => { buzz(10); setSmartWake(!smartWake); }} color="#a78bfa" />
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-fuchsia-300" />
                <span className="flex-1 text-[12.5px] font-medium text-white/75">Otomatik faz geçişi <span className="text-white/35">· 5 evre</span></span>
                <Toggle on={autoPhase} onClick={() => { buzz(10); setAutoPhase(!autoPhase); }} color="#e879f9" />
              </div>
            </div>
          </div>

          {/* fazlar */}
          <div className="mt-4">
            <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">PROTOKOL · {autoPhase ? 'OTOMATİK' : 'MANUEL'}</div>
            <div className="flex gap-1.5">
              {PHASE_AUTO.map((p, i) => {
                const done = i < phaseIdx;
                const now = i === phaseIdx;
                return (
                  <div
                    key={p.name}
                    className="flex-1 rounded-2xl border p-2 text-center"
                    style={now
                      ? { borderColor: `${current.accent}77`, background: `${current.accent}14` }
                      : done ? { borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }
                        : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}
                  >
                    <div className={`font-mono text-[9px] font-bold ${now ? '' : done ? 'text-emerald-300' : 'text-white/30'}`} style={now ? { color: current.accent } : undefined}>
                      {now ? '●' : done ? '✓' : `${Math.round(p.at * 100)}%`}
                    </div>
                    <div className={`mt-0.5 text-[9.5px] font-bold leading-tight ${now || done ? 'text-white/85' : 'text-white/35'}`}>{p.name}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center font-mono text-[10px] text-white/40">{PHASE_AUTO[phaseIdx].note}</p>
          </div>

          {/* hızlı mikser */}
          <div className="mt-4 space-y-2.5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/45">HIZLI MİKSER</div>
            <MSlider label="Islaklık" value={params.wet} min={0} max={80} step={1} unit="%" color="#22d3ee" hint="35" onChange={(v) => patch({ wet: v })} />
            <MSlider label="Kuyruk" value={params.decay} min={0.4} max={5} step={0.1} unit="sn" color="#e879f9" hint="2.4" onChange={(v) => patch({ decay: v })} />
            <MSlider label="Ping-Pong" value={params.delayMs} min={40} max={400} step={5} unit="ms" color="#34d399" hint="120" onChange={(v) => patch({ delayMs: v })} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-white/50" />
                <input
                  type="range" className="mini-slider" min={0} max={100} value={params.masterGain}
                  style={{ ['--p' as string]: `${params.masterGain}%`, ['--fill' as string]: '#fb7185' }}
                  onChange={(e) => patch({ masterGain: parseFloat(e.target.value) })}
                />
                <span className="w-8 text-right font-mono text-[12px] font-bold tabular-nums text-white/70">{params.masterGain}</span>
              </div>
            </div>
          </div>

          {/* sıradaki */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-white/45">
              <ListMusic className="h-3.5 w-3.5" /> SIRADAKİ
            </div>
            <div className="space-y-2">
              {SESSIONS.filter((s) => s.id !== current.id).slice(0, 2).map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSession(s, playing)}
                  className="pressable flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-2.5 text-left"
                >
                  <span className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${s.gradient}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold">{s.title}</span>
                    <span className="block font-mono text-[10px] text-white/40">{s.langTr} · {s.minutes}dk · θ {s.theta}Hz</span>
                  </span>
                  <Play className="h-4 w-4 shrink-0 text-white/40" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2 pb-4">
            <button onClick={() => { setPlayerOpen(false); startQuiz(); }} className="pressable flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-500/10 py-3 text-[12.5px] font-bold text-amber-100">
              <GraduationCap className="h-4 w-4" /> Sabah Testi
            </button>
            <button onClick={() => { setPlayerOpen(false); setTab('explore'); }} className="pressable flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 py-3 text-[12.5px] font-bold text-white/80">
              Kütüphaneye Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
