import { Play, Check, Clock3, Languages, Zap, RotateCcw, Crown, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../store';
import { CURRICULUM, langColor, langTr } from '../data/curriculum';
import { Sheet, Bar } from '../components/ui';

export function CurriculumSheet() {
  const { currLang, setCurrLang, unlocked, startLevel, playing, current } = useApp();
  const open = currLang !== null;
  const lang = CURRICULUM.find((c) => c.id === currLang) ?? CURRICULUM[0];
  const done = currLang ? (unlocked[currLang] ?? 0) : 0;
  const color = langColor(lang.id);
  const mastered = done >= 5;

  return (
    <Sheet open={open} onClose={() => setCurrLang(null)} tall>
      <div className="px-5 pb-8 pt-1">
        {/* başlık */}
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color }}>MÜFREDAT · A1 → C1</div>
          <h2 className="mt-1 text-[24px] font-bold tracking-tight">{langTr(lang.id)}</h2>
          <p className="mt-1 font-mono text-[11px] text-white/45">
            {mastered ? 'USTA SEVİYESİ · TÜM YOL TAMAM' : `${done}/5 seviye tamamlandı · hepsi dinlenebilir`}
          </p>
          <div className="mx-auto mt-3 max-w-[280px]"><Bar pct={(done / 5) * 100} color={color} /></div>
        </div>

        {/* kilit yok uyarısı */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <Sparkles className="h-4.5 w-4.5 text-emerald-300" />
          </span>
          <p className="text-[12px] leading-relaxed text-emerald-100/85">
            <b>Hiçbir seviye kilitli değil.</b> İstediğin dilden, istediğin seviyeden (A1…C1) hemen başla —
            sıra takip etmek zorunda değilsin.
          </p>
        </div>

        {mastered && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/20 to-orange-500/10 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500">
              <Crown className="h-5 w-5 text-white" />
            </span>
            <p className="text-[12.5px] leading-snug text-amber-100/90">
              <b>C1 Ustası.</b> Bu dilde rüya görüyorsun. Tekrar seansları bilgiyi taze tutar.
            </p>
          </div>
        )}

        {/* yol */}
        <div className="relative mt-5">
          <div className="absolute bottom-6 left-[27px] top-6 w-[2px] rounded-full bg-white/8" />
          <div
            className="absolute left-[27px] top-6 w-[2px] rounded-full transition-all"
            style={{ height: `calc((100% - 48px) * ${done / 5})`, background: `linear-gradient(180deg, ${color}, ${color}66)`, boxShadow: `0 0 12px ${color}` }}
          />
          <div className="space-y-3">
            {lang.levels.map((lv) => {
              const isDone = lv.idx < done;
              const isSuggested = lv.idx === done && !mastered;
              const isPlayingThis = playing && current.id === `lvl-${lang.id}-${lv.idx}-0`;
              return (
                <div key={lv.code} className="relative flex gap-3.5">
                  {/* düğüm */}
                  <span
                    className="z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border font-mono text-[13px] font-bold"
                    style={isDone
                      ? { borderColor: 'rgba(52,211,153,0.5)', background: 'rgba(52,211,153,0.15)', color: '#6ee7b7' }
                      : isSuggested
                        ? { borderColor: `${color}88`, background: `${color}22`, color, boxShadow: `0 0 24px ${color}55` }
                        : { borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                  >
                    {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : lv.code}
                    {isSuggested && <span className="mt-0.5 font-mono text-[7px] tracking-widest opacity-70">ÖNERİLEN</span>}
                    {isDone && <span className="font-mono text-[8px]">{lv.code}</span>}
                  </span>
                  {/* kart — her zaman açık, her zaman çalınabilir */}
                  <div
                    className={`flex-1 rounded-3xl border p-4 ${isSuggested ? 'glass-deep' : 'glass'}`}
                    style={isSuggested ? { borderColor: `${color}44` } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg px-2 py-1 font-mono text-[10px] font-bold" style={{ background: `${color}22`, color }}>
                        {lv.code}
                      </span>
                      <h3 className="text-[15px] font-bold">{lv.theme}</h3>
                      {isPlayingThis && <span className="ml-auto font-mono text-[9px] tracking-widest text-emerald-300">● ÇALIYOR</span>}
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/50">{lv.themeDesc}</p>
                    <div className="mt-2 rounded-2xl border border-white/8 bg-black/40 p-2.5">
                      <div className="font-serif text-[14px] italic" style={{ color }}>{lv.quads[0].words.join(' · ')}</div>
                      <div className="mt-0.5 font-mono text-[9.5px] text-white/40">{lv.quads[0].gloss}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-white/45">
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{lv.minutes}dk</span>
                      <span className="flex items-center gap-1"><Languages className="h-3 w-3" />{lv.wordsTarget} kelime</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />+{lv.xp} XP</span>
                      <span>θ {lv.theta}Hz</span>
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] text-white/35">ODAK: {lv.focus.toUpperCase()}</div>
                    <button
                      onClick={() => startLevel(lang.id, lv.idx)}
                      className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13.5px] font-bold"
                      style={isSuggested
                        ? { background: `linear-gradient(90deg, ${color}, ${color}99)`, color: '#000', boxShadow: `0 8px 28px ${color}55` }
                        : { border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {isDone ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                      {isDone ? 'Tekrar Dinle' : `${lv.code} Seansını Başlat`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setCurrLang(null)}
          className="pressable mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/12 bg-white/5 py-3 text-[13px] font-bold text-white/70"
        >
          Kapat <ChevronRight className="h-4 w-4 rotate-90" />
        </button>
      </div>
    </Sheet>
  );
}
