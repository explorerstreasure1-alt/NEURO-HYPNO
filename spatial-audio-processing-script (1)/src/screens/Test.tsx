import { useState } from 'react';
import { ChevronLeft, Play } from 'lucide-react';
import { useApp, buzz } from '../store';
import { engine } from '../audio/engine';
import { phrasesOf } from '../data/phrases';

const LANG_MAP: Record<string, string> = {
  ES: 'es-ES', FR: 'fr-FR', EN: 'en-US', DE: 'de-DE', IT: 'it-IT', JP: 'ja-JP',
};
const ECHOES = ['basement', 'stage', 'parking'] as const;

export default function Test() {
  const { setTab } = useApp();
  const [lang, setLang] = useState('EN');
  const [idx, setIdx] = useState(0);
  const [echo, setEcho] = useState<(typeof ECHOES)[number]>('basement');

  const list = phrasesOf(lang);
  const phrase = list[idx % list.length];

  const speak = async () => {
    buzz(10);
    const text = phrase.pattern.replace('___', 'usta');
    await engine.speakSwell(text, LANG_MAP[lang] ?? 'en-US', 0.9, echo);
  };

  const chip = (active: boolean) =>
    `pressable rounded-xl px-3 py-2 text-[13px] font-bold border ${
      active ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-100' : 'bg-white/5 border-white/10 text-white/60'
    }`;

  return (
    <div className="min-h-dvh bg-[#07031c] px-4 pt-safe text-white">
      <div className="flex items-center gap-2 py-3">
        <button onClick={() => setTab('imprint')} className="pressable flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5">
          <ChevronLeft className="h-5 w-5 text-white/75" />
        </button>
        <div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-white/45">HIZLI TEST</div>
          <div className="text-[16px] font-bold">Anında Dinle</div>
        </div>
      </div>

      <p className="mb-4 text-[12px] text-white/50">Beklemeden tek kelime/cümle dinle.</p>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">DİL</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(LANG_MAP).map((k) => (
          <button key={k} onClick={() => { setLang(k); setIdx(0); }} className={chip(lang === k)}>{k}</button>
        ))}
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">YANKI</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {ECHOES.map((e) => (
          <button key={e} onClick={() => setEcho(e)} className={chip(echo === e)}>{e}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="font-mono text-[10px] tracking-widest text-white/35">{lang} · {phrase.note}</div>
        <div className="mt-2 text-[20px] font-bold leading-snug">{phrase.pattern}</div>
        <div className="mt-1 text-[14px] text-white/55">{phrase.gloss}</div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => setIdx((i) => (i + 1) % list.length)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[13px] font-bold text-white/70">
            Sonraki
          </button>
          <button onClick={speak} className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 py-2.5 text-[13px] font-bold">
            <span className="inline-flex items-center gap-1.5"><Play className="h-3.5 w-3.5 fill-current" /> OKU</span>
          </button>
        </div>
      </div>
    </div>
  );
}
