import { useMemo, useState } from 'react';
import {
  Search, Play, Star, Clock, ChevronRight, Wand2, Waves,
  Check, Sparkles, Signal,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { SESSIONS, PRESETS, RHYMES, presetOf } from '../data/content';
import type { Session } from '../data/content';
import { CURRICULUM, langColor, langTr } from '../data/curriculum';
import { SectionHead, Chip, Sheet, MSlider } from '../components/ui';
import { EqBars } from '../components/visuals';

type Filter = 'all' | 'begin' | 'mid' | 'adv' | 'short' | 'long';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'begin', label: 'Başlangıç' },
  { id: 'mid', label: 'Orta' },
  { id: 'adv', label: 'İleri' },
  { id: 'short', label: 'Kısa · <25dk' },
  { id: 'long', label: 'Uzun · 45dk+' },
];

export default function Explore() {
  const { selectSession, setPlayerOpen, playing, current, applyPreset, setBuilderOpen, setCurrLang, unlocked } = useApp();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');

  const list = useMemo(() => {
    return SESSIONS.filter((s) => {
      const hit = !q || `${s.title} ${s.langTr} ${s.words.join(' ')}`.toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr'));
      if (!hit) return false;
      if (f === 'begin') return s.level === 'A1' || s.level === 'A2';
      if (f === 'mid') return s.level === 'B1';
      if (f === 'adv') return s.level === 'B2' || s.level === 'C1';
      if (f === 'short') return s.minutes < 25;
      if (f === 'long') return s.minutes >= 45;
      return true;
    });
  }, [q, f]);

  const featured = list[0] ?? SESSIONS[0];

  const play = (s: Session) => {
    buzz(20);
    selectSession(s, true);
    setPlayerOpen(true);
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      <header className="anim-fadeUp pt-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Kütüphane · {SESSIONS.length} seans</div>
        <h1 className="mt-0.5 text-[24px] font-bold tracking-tight">Bu gece <span className="font-serif font-normal italic text-cyan-200">ne dinliyorsun?</span></h1>
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <Search className="h-[18px] w-[18px] shrink-0 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Dil, seans, kelime ara… (luna, rüya, B1)"
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((x) => (
            <Chip key={x.id} active={f === x.id} onClick={() => { buzz(8); setF(x.id); }}>{x.label}</Chip>
          ))}
        </div>
      </header>

      {/* ── öne çıkan ── */}
      {featured && (
        <button onClick={() => play(featured)} className="pressable anim-fadeUp stagger-1 relative block w-full overflow-hidden rounded-[28px] border border-white/12 text-left">
          <div className={`absolute inset-0 bg-gradient-to-br ${featured.gradient} opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="relative p-5 pt-16">
            {featured.badge && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.2em] text-white backdrop-blur">
                ★ {featured.badge}
              </span>
            )}
            <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-white drop-shadow-lg">{featured.title}</h2>
            <p className="mt-1 font-serif text-[15px] italic text-white/85">{featured.words.join(' · ')}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-black">
                <Play className="h-4 w-4 fill-current" /> Hemen Başlat
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 font-mono text-[11px] text-white backdrop-blur">
                <Clock className="h-3 w-3" /> {featured.minutes}dk
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 font-mono text-[11px] text-white backdrop-blur">
                <Star className="h-3 w-3 fill-current text-amber-300" /> {featured.rating}
              </span>
            </div>
          </div>
        </button>
      )}

      {/* ── seans kurucu girişi ── */}
      <button
        onClick={() => { buzz(15); setBuilderOpen(true); }}
        className="pressable anim-fadeUp stagger-2 glass-deep flex w-full items-center gap-3.5 rounded-[24px] p-4 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-[0_0_24px_rgba(232,121,249,0.4)]">
          <Wand2 className="h-6 w-6 text-white" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold">Kendi seansını kur</span>
          <span className="block text-[12px] text-white/50">Dil + mekân + teta + süre — 20 saniyede</span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/40" />
      </button>

      {/* ── müfredat ── */}
      <section className="anim-fadeUp stagger-2">
        <SectionHead title="Müfredat · A1 → C1" sub="Hiçbiri kilitli değil — istediğin seviyeden başla" />
        <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {CURRICULUM.map((c) => {
            const done = unlocked[c.id] ?? 0;
            const codes = ['A1', 'A2', 'B1', 'B2', 'C1'];
            const col = langColor(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setCurrLang(c.id)}
                className="pressable glass w-[172px] shrink-0 snap-start rounded-3xl p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-[11px] font-bold" style={{ color: col }}>{c.id}</span>
                  {done >= 5
                    ? <span className="font-mono text-[9px] font-bold tracking-widest text-amber-300">★ USTA</span>
                    : <span className="font-mono text-[9px] text-white/35">{done}/5 tamam</span>}
                </div>
                <div className="mt-2.5 text-[14px] font-bold">{langTr(c.id)}</div>
                <div className="font-mono text-[10px]" style={{ color: col }}>
                  {done >= 5 ? 'C1 tamamlandı' : `her seviye açık · önerilen: ${codes[Math.min(4, done)]}`}
                </div>
                <div className="mt-2.5 flex gap-1.5">
                  {codes.map((cd, i) => (
                    <span
                      key={cd}
                      className="h-2 flex-1 rounded-full"
                      style={i < done
                        ? { background: col }
                        : i === done && done < 5
                          ? { background: `${col}55`, boxShadow: `0 0 8px ${col}` }
                          : { background: 'rgba(255,255,255,0.12)' }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 font-mono text-[9px] tracking-wider text-white/40">A1 · A2 · B1 · B2 · C1</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── mekânlar ── */}
      <section className="anim-fadeUp stagger-3">
        <SectionHead title="Akustik mekânlar" sub="Dokun ve anında uygula" />
        <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
          {PRESETS.map((p) => {
            const active = presetOf(current).id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`pressable relative w-[168px] shrink-0 snap-start overflow-hidden rounded-3xl border p-4 text-left ${active ? 'border-cyan-300/50' : 'border-white/10'}`}
                style={{ boxShadow: active ? `0 0 28px ${p.glow}` : 'none' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <Waves className="h-5 w-5 text-white/80" />
                    {active && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400"><Check className="h-3 w-3 text-black" strokeWidth={3} /></span>}
                  </div>
                  <div className="mt-6 text-[15px] font-bold text-white">{p.name}</div>
                  <div className="font-mono text-[9px] tracking-widest text-white/60">{p.tag}</div>
                  <div className="mt-1.5 font-mono text-[9.5px] text-white/55">
                    wet {p.patch.wet}% · {p.patch.decay}s · {p.patch.delayMs}ms
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── liste ── */}
      <section className="anim-fadeUp stagger-4 space-y-2.5">
        <SectionHead title="Tüm seanslar" sub={`${list.length} sonuç`} />
        {list.map((s) => {
          const isCurrent = current.id === s.id;
          return (
            <div key={s.id} className={`glass flex items-center gap-3 rounded-[22px] p-3 ${isCurrent ? 'border-cyan-300/30' : ''}`}>
              <button onClick={() => play(s)} className="pressable relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  {isCurrent && playing
                    ? <EqBars playing n={4} color="linear-gradient(180deg,#fff,#ffffff88)" />
                    : <Play className="h-6 w-6 fill-white text-white drop-shadow" />}
                </div>
              </button>
              <button onClick={() => play(s)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[14px] font-bold">{s.title}</span>
                  {s.badge && <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-white/70">{s.badge}</span>}
                </div>
                <div className="mt-0.5 truncate font-mono text-[10.5px] text-white/45">
                  {s.langTr} · {s.levelTr} · θ {s.theta} Hz · {s.minutes}dk
                </div>
                <div className="mt-0.5 truncate font-serif text-[12.5px] italic text-white/60">{s.words.join(' · ')}</div>
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="flex items-center gap-1 font-mono text-[10px] text-white/50">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />{s.rating}
                </span>
                <span className="font-mono text-[9px] text-white/30">{s.plays}</span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-white/25" />
            <p className="mt-2 text-[14px] font-semibold text-white/70">Sonuç bulunamadı</p>
            <p className="mt-1 text-[12px] text-white/40">Farklı bir kelime dene ya da kendi seansını kur.</p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-[0.25em] text-white/25">
        <Signal className="h-3 w-3" /> TÜM SEANSLAR 48 kHz · UYKU GÜVENLİKLİ
      </div>
    </div>
  );
}

// ── Seans kurucu (global sheet) ───────────────────────────────
export function BuilderSheet() {
  const { builderOpen, setBuilderOpen, selectSession, setPlayerOpen, setTab } = useApp();
  const [langId, setLangId] = useState('EN');
  const [presetId, setPresetId] = useState('cathedral');
  const [mins, setMins] = useState(20);
  const [theta, setTheta] = useState(6);

  const lang = RHYMES.find((l) => l.id === langId) ?? RHYMES[0];
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];

  const start = () => {
    const custom: Session = {
      id: `custom-${Date.now()}`,
      title: `${lang.langTr} · Özel Seans`,
      sub: 'Sana özel',
      lang: lang.id, langTr: lang.langTr,
      level: 'B1', levelTr: 'Özel',
      minutes: mins,
      words: lang.words,
      gloss: lang.gloss,
      presetId: preset.id,
      theta,
      plays: 'yeni', rating: 5.0,
      accent: lang.color,
      gradient: 'from-violet-500 via-fuchsia-600 to-cyan-500',
      desc: `${preset.name} mekânında ${lang.langTr} ${lang.rhyme} kafiyesi — ${mins} dakika, θ ${theta} Hz.`,
      badge: 'ÖZEL',
    };
    setBuilderOpen(false);
    selectSession(custom, true);
    setPlayerOpen(true);
    setTab('home');
  };

  return (
    <Sheet open={builderOpen} onClose={() => setBuilderOpen(false)}>
      <div className="space-y-5 px-5 pb-8 pt-2">
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-fuchsia-300">SEANS KURUCU</div>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight">Geceni <span className="font-serif font-normal italic text-fuchsia-200">tasarla</span></h2>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">01 · DİL + KAFİYE</div>
          <div className="grid grid-cols-3 gap-2">
            {RHYMES.map((l) => (
              <button
                key={l.id}
                onClick={() => { buzz(10); setLangId(l.id); }}
                className={`pressable rounded-2xl border p-3 text-center ${langId === l.id ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/30'}`}
              >
                <div className="font-mono text-[12px] font-bold" style={{ color: l.color }}>{l.id}</div>
                <div className="mt-0.5 truncate text-[11px] text-white/60">{l.langTr}</div>
                <div className="font-mono text-[9px] text-white/30">{l.rhyme}</div>
              </button>
            ))}
          </div>
          <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-center">
            <span className="font-serif text-[16px] italic" style={{ color: lang.color }}>{lang.words.join(' · ')}</span>
            <div className="font-mono text-[10px] text-white/40">{lang.gloss}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">02 · MEKÂN</div>
          <div className="space-y-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => { buzz(10); setPresetId(p.id); }}
                className={`pressable flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${presetId === p.id ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/30'}`}
              >
                <span className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${p.gradient}`} />
                <span className="flex-1">
                  <span className="block text-[13.5px] font-bold">{p.name}</span>
                  <span className="block font-mono text-[10px] text-white/45">wet {p.patch.wet}% · {p.patch.decay}s · {p.patch.delayMs}ms</span>
                </span>
                {presetId === p.id && <Check className="h-4 w-4 shrink-0 text-emerald-300" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">03 · SÜRE</div>
          <div className="grid grid-cols-6 gap-1.5">
            {[10, 20, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => { buzz(8); setMins(m); }}
                className={`pressable rounded-xl border py-2.5 font-mono text-[12px] font-bold tabular-nums ${mins === m ? 'border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-100' : 'border-white/10 bg-black/30 text-white/45'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">04 · TETA FREKANSI</div>
          <MSlider label="Binaural vuruş" value={theta} min={2} max={12} step={0.5} unit="Hz" color="#34d399" hint="önerilen 6" onChange={setTheta} />
        </div>

        <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/8 p-3 text-center text-[11.5px] leading-relaxed text-indigo-100/80">
          🔒 İlk 10 dakika sessiz teta girişi · 10. dakikada mikro fısıltı başlar, 20. dakikada tam ritmik seviyeye ulaşır
        </div>
        <button
          onClick={start}
          className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-600 to-cyan-500 py-4 text-[15px] font-bold shadow-[0_10px_36px_rgba(232,121,249,0.35)]"
        >
          <Play className="h-5 w-5 fill-current" /> SEANSI BAŞLAT · {mins}DK
        </button>
        <div className="text-center font-mono text-[10px] text-white/35">
          {lang.langTr} · {preset.name} · θ {theta} Hz · akıllı faz geçişi açık
        </div>
      </div>
    </Sheet>
  );
}
