import { Play, Headphones, Speaker, MoonStar, Brain, BedDouble, Check, Mic, AlertTriangle, Waves, X, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { INDUCTION, MODES, ENTRAINMENT_CURVE, brainBand } from '../data/curriculum';
import { fmtClock } from '../data/content';
import type { OutputMode } from '../audio/engine';
import { Sheet, Bar, Modal } from '../components/ui';
import { BreathCircle } from '../components/visuals';

// ── mod seçici (her yerde aynı) ──
export function ModeSwitch({ compact }: { compact?: boolean }) {
  const { outputMode, setOutputMode, speakerCalib, calibrating } = useApp();
  const btn = (m: OutputMode, icon: React.ReactNode, label: string, hint: string) => {
    const on = outputMode === m;
    const isCalibratingThis = m === 'speaker' && on && calibrating;
    const needsAutoCalib = m === 'speaker' && !speakerCalib && !isCalibratingThis;
    return (
      <button
        key={m}
        onClick={() => setOutputMode(m)}
        className="pressable relative flex flex-1 items-center gap-2.5 rounded-2xl border p-3 text-left transition-all"
        style={on
          ? m === 'phones'
            ? { borderColor: 'rgba(34,211,238,0.55)', background: 'rgba(34,211,238,0.12)', boxShadow: '0 0 20px rgba(34,211,238,0.25)' }
            : { borderColor: 'rgba(232,121,249,0.55)', background: 'rgba(232,121,249,0.12)', boxShadow: '0 0 20px rgba(232,121,249,0.25)' }
          : { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.3)' }}
      >
        <span style={{ color: on ? (m === 'phones' ? '#67e8f9' : '#f0abfc') : 'rgba(255,255,255,0.4)' }}>{icon}</span>
        <span className="flex-1">
          <span className={`block text-[13px] font-bold ${on ? '' : 'text-white/55'}`}>{label}</span>
          {!compact && <span className="block font-mono text-[9.5px] text-white/40">{hint}</span>}
        </span>
        {isCalibratingThis && (
          <span className="flex items-center gap-1 rounded-full bg-fuchsia-400/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-fuchsia-200">
            <Mic className="h-2.5 w-2.5 animate-pulse" /> KALİBRE EDİLİYOR
          </span>
        )}
        {needsAutoCalib && (
          <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-amber-200">
            <AlertTriangle className="h-2.5 w-2.5" /> OTOMATİK KALİBRE
          </span>
        )}
        {on && !isCalibratingThis && !needsAutoCalib && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: m === 'phones' ? '#22d3ee' : '#e879f9', boxShadow: `0 0 8px ${m === 'phones' ? '#22d3ee' : '#e879f9'}` }} />}
      </button>
    );
  };
  return (
    <div className="flex gap-2">
      {btn('phones', <Headphones className="h-5 w-5" />, 'Kulaklık', 'Binaural · L200/R206')}
      {btn('speaker', <Speaker className="h-5 w-5" />, 'Hoparlör', speakerCalib ? (speakerCalib.weak ? 'Kalibreli · harmonik takviye' : 'Kalibreli · güçlü bas') : 'Seçince otomatik kalibre edilir')}
    </div>
  );
}

// ── mikrofonla hoparlör kalibrasyonu (global — hoparlör seçilince otomatik açılır) ──
export function SpeakerCalibration() {
  const { calibModalOpen, setCalibModalOpen, runCalibration, calibrating, calibLive, speakerCalib } = useApp();
  const [done, setDone] = useState(false);
  const autoStarted = useRef(false);

  const start = async () => {
    setDone(false);
    await runCalibration();
    setDone(true);
  };

  // Hoparlör modu otomatik açtığında kalibrasyonu kendiliğinden başlat (tek seferlik).
  useEffect(() => {
    if (calibModalOpen && !calibrating && !done && !autoStarted.current) {
      autoStarted.current = true;
      start();
    }
    if (!calibModalOpen) {
      autoStarted.current = false;
      setDone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calibModalOpen]);

  const onClose = () => setCalibModalOpen(false);

  return (
    <Modal open={calibModalOpen} onClose={onClose} dismiss={!calibrating}>
      <div className="glass-deep relative overflow-hidden rounded-[28px] p-6 text-center">
        {!calibrating && (
          <button onClick={onClose} className="pressable absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5">
            <X className="h-4 w-4 text-white/60" />
          </button>
        )}
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border ${calibrating ? 'animate-pulse border-fuchsia-400/50 bg-fuchsia-500/20' : 'border-violet-400/30 bg-violet-500/15'}`}>
          <Mic className="h-8 w-8 text-fuchsia-200" />
        </span>
        <h2 className="mt-4 text-[20px] font-bold">Hoparlör Kalibrasyonu</h2>
        <p className="mx-auto mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-white/55">
          Telefon hoparlörleri düşük frekansları zayıf basar — bu yüzden 136 Hz "vurmuyormuş" gibi hissedilir.
          Mikrofon 5 test tonunu dinleyip motoru <b className="text-white/85">senin cihazına göre</b> ayarlar.
        </p>

        {!calibrating && !done && (
          <>
            <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-500/10 p-3 text-left text-[11.5px] leading-relaxed text-amber-100/90">
              📵 Odayı sessize al · telefonu masaya koy · mikrofonu kapatma
            </div>
            <button onClick={start} className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3.5 text-[14px] font-bold">
              <Mic className="h-4 w-4" /> Kalibrasyonu Başlat
            </button>
          </>
        )}

        {calibrating && (
          <div className="mt-5 space-y-2">
            {[136.1, 204.15, 272.2, 340.25, 408.3].map((f) => {
              const r = calibLive.find((l) => Math.abs(l.freq - f) < 0.5);
              return (
                <div key={f} className="flex items-center gap-2.5">
                  <span className="w-14 shrink-0 text-left font-mono text-[10px] text-white/50">{f.toFixed(0)}Hz</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-300"
                      style={{ width: r ? `${r.pct}%` : '4%', opacity: r ? 1 : 0.3 }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-white/40">{r ? `${r.pct}%` : '…'}</span>
                </div>
              );
            })}
            <div className="pt-1 font-mono text-[10px] tracking-widest text-fuchsia-300">DİNLENİYOR · SESSİZ KAL</div>
          </div>
        )}

        {done && speakerCalib && (
          <div className="anim-fadeUp mt-4">
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${speakerCalib.weak ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
              {speakerCalib.weak ? <Waves className="h-6 w-6 text-amber-300" /> : <ShieldCheck className="h-6 w-6 text-emerald-300" />}
            </span>
            <p className="mt-3 text-[13.5px] font-bold">
              {speakerCalib.weak ? 'Zayıf bas tespit edildi' : 'Hoparlör güçlü basıyor'}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/55">
              {speakerCalib.weak
                ? `Motor otomatik ayarlandı: 2. ve 3. harmonik (272/408 Hz) + perküsif "thump" katmanı güçlendirildi. Teta nabzı artık net hissedilecek.`
                : `Temel frekans (${speakerCalib.bestFreq.toFixed(0)} Hz civarı) net basıyor, harmonik takviyesi hafif tutuldu.`}
            </p>
            <button onClick={onClose} className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-[13.5px] font-bold text-black">
              Tamam, Devam Et
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── uçuş öncesi sayfası ──
export function InductionSheet() {
  const { indOpen, setIndOpen, startInduction, outputMode, current, speakerCalib, setCalibModalOpen } = useApp();
  const mode = MODES.find((m) => m.id === outputMode) ?? MODES[0];

  return (
    <Sheet open={indOpen} onClose={() => setIndOpen(false)} tall>
      <div className="px-5 pb-8 pt-1">
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-violet-300">REHBERLİ PROGRAM · 10 DAKİKA</div>
          <h2 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">
            Hipnagojik <span className="font-serif font-normal italic text-violet-200">İniş</span>
          </h2>
          <p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-relaxed text-white/55">
            Bedeni hızla uyutup bilinci açık tutan 5 fazlı iniş. <b className="text-white/85">10. dakikada</b>
            <b className="text-white/85"> yarı-uyanık, yarı-uykuda</b> rüya hâlindesin —
            <b className="text-white/85"> kulaklıkla da hoparlörle de</b> çalışır.
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/45">
            <span>BU GECE HANGİ ÇIKIŞ?</span>
            {outputMode === 'speaker' && (
              <button onClick={() => setCalibModalOpen(true)} className="pressable flex items-center gap-1 text-amber-300">
                <Mic className="h-3 w-3" /> {speakerCalib ? 'YENİDEN KALİBRE ET' : 'KALİBRE ET'}
              </button>
            )}
          </div>
          <ModeSwitch />
          <p className="mt-2 rounded-2xl border border-white/8 bg-black/30 p-3 text-[12px] leading-relaxed text-white/55">
            <b style={{ color: outputMode === 'phones' ? '#67e8f9' : '#f0abfc' }}>{mode.title}:</b> {mode.desc}
            <span className="mt-1 block font-mono text-[10.5px] text-white/40">💡 {mode.tip}</span>
          </p>
          {outputMode === 'speaker' && !speakerCalib && (
            <button onClick={() => setCalibModalOpen(true)} className="pressable mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 py-3 text-[12.5px] font-bold text-amber-100">
              <Mic className="h-4 w-4" /> Önce Hoparlörünü Kalibre Et · 15sn
            </button>
          )}
        </div>

        {/* frekans eğrisi */}
        <div className="mt-4 rounded-3xl border border-violet-400/20 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet-300">FREKANS İNİŞ EĞRİSİ</span>
            <span className="font-mono text-[10px] text-white/40">10 → 6 Hz</span>
          </div>
          <svg viewBox="0 0 320 92" className="mt-2 w-full">
            <defs>
              <linearGradient id="freqCurve" x1="0" x2="1">
                <stop offset="0" stopColor="#22d3ee" /><stop offset="0.6" stopColor="#a78bfa" /><stop offset="1" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            {[18, 46, 74].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />)}
            <path d="M8,14 C55,22 92,34 138,50 C178,64 224,76 268,72 C292,70 306,66 314,64 L314,88 L8,88 Z" fill="rgba(167,139,250,0.14)" />
            <path d="M8,14 C55,22 92,34 138,50 C178,64 224,76 268,72 C292,70 306,66 314,64" fill="none" stroke="url(#freqCurve)" strokeWidth="3" strokeLinecap="round" />
            {ENTRAINMENT_CURVE.map((a) => {
              const x = 8 + (a.sec / 600) * 306;
              const y = 14 + (10 - a.hz) * 12;
              return <g key={a.sec}><circle cx={x} cy={y} r="3.5" fill="#fff" /><text x={x} y={Math.max(10, y - 7)} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="8" fontFamily="monospace">{a.hz.toFixed(1)}</text></g>;
            })}
          </svg>
          <div className="flex justify-between font-mono text-[9px] text-white/35">
            <span>0dk ALFA</span><span>4dk EŞİK</span><span>6dk TETA</span><span>8dk DERİN</span><span>10dk ÇAPA</span>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-white/50">
            Frekans basamak gibi atlamaz; her saniye eğri üzerinde kayar. 8. dakikadaki kısa 5.4 Hz derin temas sonrası 6 Hz'e dönerek beden uykuda, bilinç açık hâli hedeflenir.
          </p>
        </div>

        <div className="mb-2 mt-4 font-mono text-[10px] tracking-[0.25em] text-white/45">5 FAZ × 2 DAKİKA · {current.langTr.toUpperCase()} KELİMELER</div>
        <SpeakerCalibration />
        <div className="space-y-2">
          {INDUCTION.map((p, i) => (
            <div key={p.name} className={`glass flex items-center gap-3 rounded-2xl p-3 ${i === 4 ? 'border-fuchsia-400/30' : ''}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 font-mono text-[11px] font-bold text-white/70">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-bold">{p.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-white/40">2:00</span>
                </div>
                <div className="truncate font-mono text-[10px] text-violet-300/80">{p.sub}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <BedDouble className="h-3 w-3 shrink-0 text-indigo-300" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${p.body}%` }} />
                  </div>
                  <span className="w-7 text-right font-mono text-[9px] tabular-nums text-white/40">{p.body}</span>
                  <Brain className="h-3 w-3 shrink-0 text-fuchsia-300" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-fuchsia-400" style={{ width: `${p.mind}%` }} />
                  </div>
                  <span className="w-7 text-right font-mono text-[9px] tabular-nums text-white/40">{p.mind}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 font-mono text-[9.5px] text-white/40">
          <span className="flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-indigo-400" /> BEDEN UYKUDA</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-6 rounded-full bg-fuchsia-400" /> BİLİNÇ AÇIK</span>
        </div>

        <button
          onClick={startInduction}
          className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 py-4 text-[15px] font-bold shadow-[0_10px_36px_rgba(139,92,246,0.45)]"
        >
          <Play className="h-5 w-5 fill-current" /> İNİŞE BAŞLA · 10′
        </button>
        <div className="mt-2 text-center font-mono text-[10px] text-white/35">
          10→8.2→7→6.1→5.4→6 Hz sürekli frekans inişi · otomatik faz geçişleri · {mode.sub}
        </div>
      </div>
    </Sheet>
  );
}

// ── oynatıcı içi rehber paneli ──
export function InductionPanel() {
  const { indPhase, indPhaseLeft, induction, outputMode, liveTheta, thetaDepth, descentProgress } = useApp();
  if (!induction) return null;
  const p = INDUCTION[indPhase];
  const left = fmtClock(indPhaseLeft);
  const band = brainBand(liveTheta);

  return (
    <div className="glass-deep mt-4 overflow-hidden rounded-3xl p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-violet-300">
          <MoonStar className="h-4 w-4" /> HİPNAGOJİK İNİŞ
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 font-mono text-[9px] tracking-widest text-white/60">
          {outputMode === 'phones' ? <Headphones className="h-3 w-3 text-cyan-300" /> : <Speaker className="h-3 w-3 text-fuchsia-300" />}
          {outputMode === 'phones' ? 'BİNAURAL' : 'İZOKRONİK'}
        </span>
      </div>

      {/* faz noktaları */}
      <div className="mt-3 flex gap-1.5">
        {INDUCTION.map((ph, i) => {
          const done = i < indPhase;
          const now = i === indPhase;
          return (
            <div key={ph.name} className="flex-1 text-center">
              <div
                className="flex h-9 items-center justify-center rounded-xl border font-mono text-[11px] font-bold"
                style={now
                  ? { borderColor: 'rgba(167,139,250,0.6)', background: 'rgba(167,139,250,0.18)', color: '#ddd6fe' }
                  : done ? { borderColor: 'rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.10)', color: '#6ee7b7' }
                    : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.3)' }}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : now ? left : `${i + 1}`}
              </div>
              <div className={`mt-1 text-[9px] font-bold leading-tight ${now ? 'text-violet-200' : done ? 'text-emerald-300/70' : 'text-white/30'}`}>{ph.name}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-center">
        <div className="font-mono text-[10px] tracking-[0.25em] text-fuchsia-300">{p.sub}</div>
        <p className="mx-auto mt-1 max-w-[300px] text-[12.5px] leading-relaxed text-white/60">{p.note}</p>
      </div>

      <div className="mt-3 rounded-2xl border border-white/8 bg-black/30 p-3.5">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-white/40">CANLI SÜRÜKLENME</div>
            <div className="mt-1 font-mono text-[24px] font-bold leading-none tabular-nums" style={{ color: band.color }}>
              {liveTheta.toFixed(2)} Hz
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] font-bold" style={{ color: band.color }}>{band.name}</div>
            <div className="mt-1 font-mono text-[9px] text-white/40">nabız derinliği %{Math.round(thetaDepth * 100)}</div>
          </div>
        </div>
        <div className="mt-3"><Bar pct={descentProgress * 100} color={band.color} /></div>
        <div className="mt-1.5 flex justify-between font-mono text-[8.5px] text-white/35">
          <span>0dk · 10 Hz</span><span>6dk · 6.1 Hz</span><span>10dk · 6 Hz çapa</span>
        </div>
      </div>

      {/* nefes */}
      {p.breath && (
        <div className="mt-2 flex flex-col items-center">
          <BreathCircle size={148} />
          <div className="mt-1 font-mono text-[9.5px] tracking-[0.25em] text-white/40">4 SN AL · 4 SN TUT · 6 SN VER</div>
        </div>
      )}

      {/* beden / bilinç */}
      <div className="mt-3 space-y-2.5 rounded-2xl border border-white/8 bg-black/30 p-3.5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-200"><BedDouble className="h-3.5 w-3.5" /> Beden uykuda</span>
            <span className="font-mono font-bold tabular-nums text-indigo-200">%{p.body}</span>
          </div>
          <Bar pct={p.body} color="#818cf8" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-semibold text-fuchsia-200"><Brain className="h-3.5 w-3.5" /> Bilinç açık</span>
            <span className="font-mono font-bold tabular-nums text-fuchsia-200">%{p.mind}</span>
          </div>
          <Bar pct={p.mind} color="#e879f9" />
        </div>
      </div>

      {indPhase === 4 && (
        <p className="mt-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-black/25 p-3 text-[11px] leading-relaxed text-white/45">
          💬 Bu, derin bir gevşeme tarifidir — tehlikeli ya da zorunlu bir hedef değil. Rahatsız hissedersen
          istediğin an durdurabilirsin; çoğu kişi bu noktada zaten doğal uykuya geçer.
        </p>
      )}
    </div>
  );
}
