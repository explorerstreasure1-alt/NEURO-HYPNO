import { useEffect, useState } from 'react';
import { ChevronLeft, Play, Waves, Mic } from 'lucide-react';
import { useApp, buzz } from '../store';
import { engine } from '../audio/engine';
import { phrasesOf } from '../data/phrases';
import { getEndpoint, setEndpoint } from '../audio/ttsSettings';
import type { EchoProfile } from '../audio/echoChain';
import { CEFR_ORDER, LEVEL_RATE, type CEFR } from '../data/lexicon';
import { wordsOf } from '../data/lexicon';
import { localeOf, nativeVoiceName, androidHasLanguage } from '../audio/voice';

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
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => { setEndpointState(getEndpoint() ?? ''); }, []);

  useEffect(() => {
    const target = localeOf(LANG_MAP[lang] ?? 'en-US');
    const update = () => setVoiceName(nativeVoiceName(target));
    update();
    try {
      speechSynthesis?.addEventListener?.('voiceschanged', update);
      return () => speechSynthesis?.removeEventListener?.('voiceschanged', update);
    } catch {
      return undefined;
    }
  }, [lang]);

  const list = phrasesOf(lang, level);
  const phrase = list[idx % list.length];
  const sampleWord = wordsOf(lang, level)[idx % Math.max(1, wordsOf(lang, level).length)]?.text ?? '';

  const speak = async () => {
    buzz(10);
    const target = localeOf(LANG_MAP[lang] ?? 'en-US');
    const text = phrase.pattern.includes('___') ? phrase.pattern.replace('___', sampleWord) : phrase.pattern;
    const ep = getEndpoint();
    for (let r = 0; r < 3; r++) {
      if (ep) {
        const mode = await engine.speakWithRealEcho(text, target, LEVEL_RATE[level], echo, ep);
        setRealMsg(
          mode === 'echo'
            ? '✅ Ana dili sesi (gerçek TTS) · Convolver yankı · 3 tekrar'
            : mode === 'silent'
              ? '⛔ Ana dili sesi yok — yanlış aksanla okumamak için sustu'
              : '⚠️ TTS ulaşılamadı, cihaz sesi (ana dili varsa) kullanıldı',
        );
      } else {
        const ok = await engine.speakSwell(text, target, LEVEL_RATE[level], echo);
        setRealMsg(ok ? '⚠️ Endpoint yok · cihazın ana dili sesi kullanıldı' : '⛔ Bu dil için ana dili sesi yok — okuma atlandı');
      }
      await new Promise((r2) => setTimeout(r2, 600));
    }
  };

  const checkEndpoint = async () => {
    const ep = getEndpoint();
    if (!ep) { setRealMsg('Endpoint tanımlı değil (yerel geliştirme modu)'); return; }
    setChecking(true);
    const url = ep
      .replace('{text}', encodeURIComponent('Hello, this is the native voice test.'))
      .replace('{lang}', encodeURIComponent(localeOf(LANG_MAP[lang] ?? 'en-US')));
    try {
      const res = await fetch(url);
      setRealMsg(res.ok ? `✅ Endpoint hazır · ${res.status} · ${res.headers.get('content-type') ?? ''}` : `⛔ Endpoint hata · HTTP ${res.status}`);
    } catch {
      setRealMsg('⛔ Endpoint ulaşılamıyor · CORS veya adres hatası');
    } finally {
      setChecking(false);
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

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <Mic className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${voiceName ? 'text-emerald-300' : 'text-amber-300'}`} />
        <div className="min-w-0">
          <div className="font-mono text-[9px] tracking-widest text-white/35">ANA DİLİ SESİ · {localeOf(LANG_MAP[lang] ?? 'en-US')}</div>
          <div className={`truncate text-[11.5px] ${voiceName ? 'text-emerald-200/90' : 'text-amber-200/90'}`}>
            {voiceName ?? (androidHasLanguage(localeOf(LANG_MAP[lang] ?? 'en-US')) ? 'Android yerel TTS (ana dili) hazır' : 'Bulunamadı — yanlış aksanla okunmaz, TTS endpoint kullanılır')}
          </div>
        </div>
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
      <p className="mb-2 font-mono text-[9px] leading-relaxed text-white/30">
        Audio (mp3/wav) döndüren bir endpoint girilirse ses Convolver + ping-pong zincirinden geçer; gerçek yankı oluşur.
        Endpoint yoksa cihazın <b>ana dili sesi</b> kullanılır; o da yoksa yanlış aksanla okumamak için okuma atlanır.
      </p>
      <button
        onClick={checkEndpoint}
        disabled={checking}
        className="pressable mb-3 w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 py-2 font-mono text-[10px] tracking-widest text-cyan-200 disabled:opacity-50"
      >
        {checking ? 'KONTROL EDİLİYOR…' : 'ENDPOINT BAĞLANTISINI KONTROL ET'}
      </button>
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
