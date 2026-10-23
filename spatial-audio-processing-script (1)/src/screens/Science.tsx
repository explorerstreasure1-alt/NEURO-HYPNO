import { useState } from 'react';
import {
  ShieldCheck, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2,
  FileText, Stethoscope, Brain, Moon, Clock,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { EXPERTS, FIXES_APPLIED } from '../data/science';
import { Sheet } from '../components/ui';

const SEV_COLOR: Record<string, string> = { kritik: '#fb7185', orta: '#fbbf24', düşük: '#34d399' };
const FOCUS_ICON: Record<string, React.ReactNode> = {
  sleep: <Moon className="h-5 w-5" />,
  memory: <Brain className="h-5 w-5" />,
  clinical: <Stethoscope className="h-5 w-5" />,
  chrono: <Clock className="h-5 w-5" />,
};

export function ScienceSheet() {
  const { scienceOpen, setScienceOpen, setDisclaimerOpen } = useApp();
  const [open, setOpen] = useState<string | null>('sleep');

  return (
    <Sheet open={scienceOpen} onClose={() => setScienceOpen(false)} tall>
      <div className="px-5 pb-8 pt-1">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15">
            <ShieldCheck className="h-7 w-7 text-emerald-300" />
          </span>
          <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-emerald-300">KALİTE KONTROL RAPORU</div>
          <h2 className="mt-1 text-[24px] font-bold tracking-tight">4 Uzman <span className="font-serif font-normal italic text-emerald-200">İncelemesi</span></h2>
          <p className="mx-auto mt-2 max-w-[320px] text-[12.5px] leading-relaxed text-white/55">
            Uygulama; uyku nörolojisi, bilişsel sinirbilim ve klinik nöroloji bakış açısıyla gözden geçirildi.
            Aşağıda bulgular ve buradan doğan somut düzeltmeler yer alıyor.
          </p>
        </div>

        {/* özet rozet */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: 'BULGU', v: EXPERTS.reduce((a, e) => a + e.findings.length, 0), c: '#fbbf24' },
            { l: 'KRİTİK', v: EXPERTS.reduce((a, e) => a + e.findings.filter((f) => f.sev === 'kritik').length, 0), c: '#fb7185' },
            { l: 'UYGULANAN DÜZELTME', v: FIXES_APPLIED.length, c: '#34d399' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-black/30 py-3 text-center">
              <div className="font-mono text-[20px] font-bold" style={{ color: s.c }}>{s.v}</div>
              <div className="font-mono text-[8px] tracking-wider text-white/40">{s.l}</div>
            </div>
          ))}
        </div>

        {/* uzmanlar */}
        <div className="mt-5 space-y-2.5">
          <div className="font-mono text-[10px] tracking-[0.25em] text-white/45">UZMAN BULGULARI</div>
          {EXPERTS.map((e) => {
            const isOpen = open === e.id;
            return (
              <div key={e.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                <button
                  onClick={() => { buzz(8); setOpen(isOpen ? null : e.id); }}
                  className="pressable flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-mono text-[11px] font-bold" style={{ borderColor: `${e.color}44`, background: `${e.color}1a`, color: e.color }}>
                    {e.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold">{e.name}</span>
                    <span className="block truncate text-[11px] text-white/45">{e.title}</span>
                  </span>
                  <span style={{ color: e.color }}>{FOCUS_ICON[e.id]}</span>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-white/40" /> : <ChevronRight className="h-4 w-4 text-white/40" />}
                </button>
                {isOpen && (
                  <div className="anim-fadeUp space-y-3 border-t border-white/8 p-4 pt-3">
                    <div className="font-mono text-[9.5px] tracking-widest text-white/35">ODAK: {e.focus.toUpperCase()}</div>
                    <div className="space-y-2">
                      {e.findings.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${SEV_COLOR[f.sev]}22` }}>
                            <AlertTriangle className="h-3 w-3" style={{ color: SEV_COLOR[f.sev] }} />
                          </span>
                          <p className="text-[12px] leading-relaxed text-white/65">
                            <span className="mr-1.5 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider" style={{ background: `${SEV_COLOR[f.sev]}22`, color: SEV_COLOR[f.sev] }}>
                              {f.sev.toUpperCase()}
                            </span>
                            {f.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border p-3" style={{ borderColor: `${e.color}33`, background: `${e.color}0d` }}>
                      <div className="font-mono text-[9px] tracking-widest" style={{ color: e.color }}>VERDİ</div>
                      <p className="mt-1 text-[12px] italic leading-relaxed text-white/70">"{e.verdict}"</p>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <p className="text-[12px] leading-relaxed text-emerald-100/85"><b>Uygulanan düzeltme:</b> {e.fix}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* düzeltme günlüğü */}
        <div className="mt-6">
          <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-white/45">DEĞİŞİKLİK GÜNLÜĞÜ · ÖNCE / SONRA</div>
          <div className="space-y-2">
            {FIXES_APPLIED.map((f) => {
              const owner = EXPERTS.find((e) => e.id === f.owner)!;
              return (
                <div key={f.title} className="rounded-2xl border border-white/8 bg-black/30 p-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" style={{ color: owner.color }} />
                    <span className="text-[13px] font-bold">{f.title}</span>
                    <span className="ml-auto font-mono text-[8px] tracking-wider" style={{ color: owner.color }}>{owner.avatar}</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed">
                    <div className="flex gap-2 text-white/40"><span className="shrink-0 font-mono text-[9px] text-rose-300/70">ÖNCE</span>{f.before}</div>
                    <div className="flex gap-2 text-white/75"><span className="shrink-0 font-mono text-[9px] text-emerald-300/70">SONRA</span>{f.after}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => { setScienceOpen(false); setDisclaimerOpen(true); }}
          className="pressable mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-500/10 py-3.5 text-[13px] font-bold text-rose-100"
        >
          Güvenlik Uyarısını Yeniden Oku
        </button>
      </div>
    </Sheet>
  );
}
