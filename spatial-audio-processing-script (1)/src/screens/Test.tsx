import { useEffect, useState } from 'react';
import { ChevronLeft, Play, Waves } from 'lucide-react';
import { useApp, buzz } from '../store';
import { engine } from '../audio/engine';
import { phrasesOf } from '../data/phrases';
import { getEndpoint, setEndpoint } from '../audio/ttsSettings';
import type { EchoProfile } from '../audio/echoChain';
import { CEFR_ORDER, LEVEL_RATE, type CEFR } from '../data/lexicon';

const LANG_MAP: Record<string, string> = {
  ES: 'es-ES', FR: 'fr-FR', EN: 'en-US', DE: 'de-DE', IT: 'it-IT', JP: 'ja-JP',
};
const ECHOES: EchoProfile[] = ['basement', 'stage', 'parking'];

export default function Test() {
  const { setTab } = useApp();
  const [lang, setLang] = useState('EN');
  const [level, setLevel] = useState<CEFR>('A1');
  const [idx, setIdx] = useState(0);
  const [echo, setEcho] = useState<EchoProfile>('basement');
  const [endpoint, setEndpointState] = useState('');
  const [realMsg, setRealMsg] = useState('');

  useEffect(() => { setEndpointState(getEndpoint() ?? ''); }, []);

  const list = phrasesOf(lang, level);
  const phrase = list[idx % list.length];

  const speak = async () => {
    buzz(10);
    const text = phrase.pattern.replace('___', 'usta');
    const ep = getEndpoint();
    for (let r = 0; r < 3; r++) {
      if (ep) {
        const mode = await engine.speakWithRealEcho(text, LANG_MAP[lang] ?? 'en-US', LEVEL_RATE[level], echo, ep);
        setRealMsg(mode === 'echo' ? 'Gerçek yankı · 3 tekrar' : 'Endpoint çalışmadı, yaklaşık yankı');
      } else {
        await engine.speakSwell(text, LANG_MAP[lang] ?? 'en-US', LEVEL_RATE[level], echo);
        setRealMsg('Yaklaşık yankı (Web Speech) · 3 tekrar');
      }
      await new Promise((r2) => setTimeout(r2, 600));
    }
  };

  const saveEndpoint = (v: string) => {
    setEndpointState(v);
    setEndpoint(v);
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

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">SEVİYE</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CEFR_ORDER.map((c) => (
          <button key={c} onClick={() => { setLevel(c); setIdx(0); }} className={chip(level === c)}>{c}</button>
        ))}
      </div>

      <div className="mb-2 font-mono text-[10px] tracking-widest text-white/40">YANKI</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {ECHOES.map((e) => (
          <button key={e} onClick={() => setEcho(e)} className={chip(echo === e)}>{e}</button>
        ))}
        <button
          onClick={async () => { buzz(10); await engine.playEchoDemo(echo); }}
          className="pressable inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-[12px] font-bold text-cyan-200"
        >
          <Waves className="h-3.5 w-3.5" /> YANKIYI DENE
        </button>
      </div>

      <div className="mb-1 font-mono text-[10px] tracking-widest text-white/40">GERÇEK YANKI İÇİN TTS ENDPOINT (opsiyonel)</div>
      <input
        value={endpoint}
        onChange={(e) => saveEndpoint(e.target.value)}
        placeholder="https://.../api/tts?text={text}&lang={lang}"
        className="mb-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white/80 outline-none focus:border-cyan-400/50"
      />
      <p className="mb-4 font-mono text-[9px] leading-relaxed text-white/30">
        Audio (mp3/wav) döndüren bir endpoint girilirse ses Convolver + ping-pong zincirinden geçer; gerçek yankı oluşur.
      </p>
      {realMsg && <p className="mb-3 font-mono text-[10px] text-emerald-300/80">{realMsg}</p>}

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
