import {
  Flame, Moon, Clock3, Languages, Trophy, ChevronRight,
  Brain, Sparkles, TrendingUp, BedDouble, GraduationCap,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { WEEK_MIN, ACHIEVEMENTS } from '../data/content';
import { SectionHead, Ring, Bar } from '../components/ui';
import { WeekBars, RetentionCurve, SleepStages } from '../components/visuals';

export default function Stats() {
  const { streak, nights, totalMin, words, xp, level, levelPct, startQuiz, setTab } = useApp();

  const unlocked = ACHIEVEMENTS.filter((a) => a.have >= a.target).length;

  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      <header className="anim-fadeUp pt-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Beyin paneli</div>
        <h1 className="mt-0.5 text-[24px] font-bold tracking-tight">Uykun <span className="font-serif font-normal italic text-emerald-200">çalışıyor.</span></h1>
      </header>

      {/* ── seri kartı ── */}
      <section className="anim-fadeUp stagger-1 relative overflow-hidden rounded-[28px] border border-orange-400/25 bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-[0_0_30px_rgba(251,146,60,0.45)]">
            <Flame className="h-8 w-8 fill-white/20 text-white" />
          </span>
          <div className="flex-1">
            <div className="text-[34px] font-bold leading-none tracking-tight">{streak} <span className="text-[15px] font-medium text-white/50">gece serisi</span></div>
            <div className="mt-1.5 text-[12px] text-white/55">Kişisel rekor: 11 gece · devam et, rüya zinciri kırılmasın</div>
          </div>
        </div>
        <div className="relative mt-4 flex gap-1.5">
          {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => {
            const on = i < 5;
            return (
              <div key={i} className={`flex h-9 flex-1 items-center justify-center rounded-xl border text-[12px] font-bold ${on ? 'border-orange-300/50 bg-orange-400/25 text-orange-100' : 'border-white/10 bg-black/30 text-white/30'}`}>
                {d}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── halkalar ── */}
      <section className="anim-fadeUp stagger-2 grid grid-cols-3 gap-2.5">
        {[
          { l: 'Dinleme', v: `${totalMin}`, u: 'dk', pct: 72, c: '#22d3ee', i: <Clock3 className="h-4 w-4" /> },
          { l: 'Kelime', v: `${words}`, u: '', pct: 64, c: '#a78bfa', i: <Languages className="h-4 w-4" /> },
          { l: 'Gece', v: `${nights}`, u: '', pct: 47, c: '#e879f9', i: <Moon className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.l} className="glass flex flex-col items-center rounded-3xl py-4">
            <Ring pct={s.pct} size={76} stroke={7} color={s.c}>
              <div className="text-center">
                <div className="font-mono text-[16px] font-bold leading-none">{s.v}<span className="text-[9px] font-normal text-white/40">{s.u}</span></div>
              </div>
            </Ring>
            <div className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold text-white/70">
              <span style={{ color: s.c }}>{s.i}</span>{s.l}
            </div>
          </div>
        ))}
      </section>

      {/* ── seviye ── */}
      <section className="anim-fadeUp stagger-3 glass-deep rounded-[24px] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-mono text-[15px] font-bold">{level}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold">Seviye {level} · Rüya Gezgini</span>
              <span className="font-mono text-[11px] text-fuchsia-300">{xp} XP</span>
            </div>
            <div className="mt-2"><Bar pct={levelPct} color="#e879f9" /></div>
            <div className="mt-1 font-mono text-[10px] text-white/40">SONRAKİ SEVİYEYE %{100 - levelPct} · {300 - (xp % 300)} XP</div>
          </div>
        </div>
      </section>

      {/* ── haftalık ── */}
      <section className="anim-fadeUp stagger-3 glass rounded-[24px] p-4">
        <SectionHead
          title="Bu hafta" sub="Gece başına dinleme dakikası"
          right={<span className="flex items-center gap-1 font-mono text-[11px] text-emerald-300"><TrendingUp className="h-3.5 w-3.5" /> +%18</span>}
        />
        <div className="mt-3"><WeekBars data={WEEK_MIN} /></div>
      </section>

      {/* ── hatırlama eğrisi ── */}
      <section className="anim-fadeUp stagger-4 glass rounded-[24px] p-4">
        <SectionHead
          title="Hatırlama eğrisi" sub="Hipnagojik tekrar vs klasik ezber"
          right={<Brain className="h-4 w-4 text-cyan-300" />}
        />
        <div className="mt-2"><RetentionCurve /></div>
        <div className="mt-2 flex gap-4 font-mono text-[10px]">
          <span className="flex items-center gap-1.5 text-white/60"><span className="h-2 w-6 rounded-full bg-cyan-400" /> HYPNO + tekrar</span>
          <span className="flex items-center gap-1.5 text-white/40"><span className="h-0.5 w-6 bg-white/30" style={{ backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.4) 50%,transparent 50%)', backgroundSize: '6px 2px' }} /> klasik ezber</span>
        </div>
      </section>

      {/* ── uyku evreleri ── */}
      <section className="anim-fadeUp stagger-4 glass rounded-[24px] p-4">
        <SectionHead
          title="Dün geceki uyku" sub="Tahmini evre dağılımı"
          right={<BedDouble className="h-4 w-4 text-violet-300" />}
        />
        <div className="mt-3"><SleepStages /></div>
        <p className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-[12px] leading-relaxed text-white/65">
          <b className="text-violet-200">N1 penceren 43 dakika sürdü</b> — ortalamanın %22 üstü.
          Katedral presetinde geçirilen bu süre, kelime kilitlenmesini hızlandırır.
        </p>
      </section>

      {/* ── sabah testi CTA ── */}
      <button
        onClick={() => { buzz(15); startQuiz(); }}
        className="pressable anim-fadeUp stagger-5 flex w-full items-center gap-3.5 rounded-[24px] border border-amber-300/25 bg-gradient-to-r from-amber-500/20 to-orange-500/10 p-4 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
          <GraduationCap className="h-6 w-6 text-white" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold">Sabah hatırlama testi</span>
          <span className="block text-[12px] text-white/50">Dünkü kelimeler · 1 dakika · +bonus XP</span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/40" />
      </button>

      {/* ── rozetler ── */}
      <section className="anim-fadeUp stagger-5">
        <SectionHead
          title="Rozetler" sub={`${unlocked}/${ACHIEVEMENTS.length} kilit açıldı`}
          right={<Trophy className="h-4 w-4 text-amber-300" />}
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const done = a.have >= a.target;
            const pct = Math.min(100, (a.have / a.target) * 100);
            return (
              <div key={a.id} className={`rounded-3xl border p-4 ${done ? 'border-amber-300/30 bg-gradient-to-br from-amber-500/15 to-transparent' : 'glass'}`}>
                <div className="flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${done ? 'bg-gradient-to-br from-amber-300 to-orange-500' : 'bg-white/8'}`}>
                    {done ? <Trophy className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white/30" />}
                  </span>
                  <span className={`font-mono text-[10px] tabular-nums ${done ? 'text-amber-200' : 'text-white/35'}`}>{a.have}/{a.target}</span>
                </div>
                <div className={`mt-2.5 text-[13.5px] font-bold ${done ? '' : 'text-white/60'}`}>{a.title}</div>
                <div className="text-[11px] text-white/40">{a.desc}</div>
                <div className="mt-2"><Bar pct={pct} color={done ? '#fbbf24' : '#64748b'} h={4} /></div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => { buzz(10); setTab('explore'); }}
        className="pressable anim-fadeUp stagger-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 py-3.5 text-[13px] font-bold text-white/75"
      >
        Yeni seansla seriyi büyüt <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
