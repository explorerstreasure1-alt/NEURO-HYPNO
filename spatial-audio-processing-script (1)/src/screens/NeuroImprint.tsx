import { useRef, useState } from 'react';
import { ChevronLeft, Play, Square } from 'lucide-react';
import { useApp, buzz } from '../store';
import { startNeuroImprint, stopNeuroImprint } from '../audio/neuroImprint';
import { CEFR_ORDER, type CEFR } from '../data/rhymes';

const LANGUAGES = ['EN', 'ES', 'FR', 'DE', 'IT', 'JP'];

export default function NeuroImprint() {
  const { setTab } = useApp();
  const [lang, setLang] = useState('EN');
  const [level, setLevel] = useState<CEFR>('A1');
  const [mode, setMode] = useState<'words' | 'sentences' | 'both'>('both');
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string[]>([]);
  const [setNo, setSetNo] = useState(0);
  const [min, setMin] = useState(42);
  const runRef = useRef(0);

  const start = async () => {
    if (running) return;
    buzz(10);
    setRunning(true);
    runRef.current++;
    await startNeuroImprint({
      langId: lang,
      level,
      mode,
      setDurationMin: min,
      onSet: (info) => {
        setSetNo(info.index);
        setCurrent(info.lines);
      },
    });
    setRunning(false);
  };

  const stop = () => {
    buzz(10);
    stopNeuroImprint();
    setRunning(false);
  };

  const chip = (active: boolean) =>
    `pressable rounded-xl px-3 py-2 text-[13px] font-bold border ${
      active ? 'bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-100' : 'bg-white/5 border-white/10 text-white/60'
    }`;

  return (
    <div className="min-h-dvh bg-[#07031c] px-4 pt-safe text-white">
      <div className="flex items-center gap-2 py-3">
        <button onClick={() => setTab('home')} className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
          <ChevronLeft className="h-5 w-5 text-white/75" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9px] tracking-[0.3em] text-white/45">NÖRO-İMPRİNT</div>
          <div className="text-[16px] font-bold">Hafızaya Yükleme</div>
        </div>
        <button
          onClick={() => setTab('test')}
          className="pressable shrink-0 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wide text-cyan-200"
        >
          HIZLI TEST
        </button>
      </div>

      <p className="mb-4 text-[12px] leading-relaxed text-white/50">
        Beden uyur, beyin theta’da kalır. Net yankılı sesle kelime ve cümleler işlenir.
        Her set {min} dakika sürer, sonra yeni 4’lü kafiyeye geçer.
      </p>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">DİL</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <button key={l} onClick={() => setLang(l)} className={chip(lang === l)}>{l}</button>
        ))}
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">SEVİYE (CEFR)</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CEFR_ORDER.map((c) => (
          <button key={c} onClick={() => setLevel(c)} className={chip(level === c)}>{c}</button>
        ))}
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">MOD</div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setMode('words')} className={chip(mode === 'words')}>Kelimeler</button>
        <button onClick={() => setMode('sentences')} className={chip(mode === 'sentences')}>Cümleler</button>
        <button onClick={() => setMode('both')} className={chip(mode === 'both')}>İkisi</button>
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">SET SÜRESİ</div>
      <div className="mb-5 flex flex-wrap gap-2">
        {[10, 24, 42, 60].map((m) => (
          <button key={m} onClick={() => setMin(m)} className={chip(min === m)}>{m} dk</button>
        ))}
      </div>

      {running ? (
        <button onClick={stop} className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500/90 py-3.5 text-[15px] font-bold">
          <Square className="h-4 w-4" /> DURDUR
        </button>
      ) : (
        <button onClick={start} className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3.5 text-[15px] font-bold">
          <Play className="h-4 w-4 fill-current" /> BAŞLAT
        </button>
      )}

      {current.length > 0 && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="font-mono text-[10px] tracking-widest text-white/40">
            SET {setNo} · {level} · {lang}
          </div>
          <div className="mt-2 space-y-1.5">
            {current.map((line, i) => (
              <div key={i} className="text-[14px] leading-snug text-white/85">• {line}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 font-mono text-[9px] leading-relaxed text-white/25">
        Yankı: bodrum / sahne / otopark · Arka planda 1.5 Hz delta devam eder
      </div>
    </div>
  );
}
