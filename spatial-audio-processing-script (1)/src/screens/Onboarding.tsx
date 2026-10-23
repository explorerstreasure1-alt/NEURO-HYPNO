import { useState } from 'react';
import {
  Brain, ChevronRight, Waves, MoonStar, Play, Check,
  Headphones, Sparkles, Moon,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { RHYMES } from '../data/content';
import { levelSession } from '../data/curriculum';
import { OrbCanvas } from '../components/visuals';

export default function Onboarding() {
  const { onboarded, completeOnboarding, selectSession, updateSettings, settings } = useApp();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('EN');

  if (onboarded) return null;

  const next = () => { buzz(12); setStep((s) => Math.min(3, s + 1)); };

  const finish = () => {
    // A1'den başlıyoruz ama hiçbir seviye kilitli değil — müfredatta istediğin an atlayabilirsin.
    selectSession(levelSession(lang, 0), false);
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#030014]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-700/25 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute bottom-20 right-0 h-64 w-64 rounded-full bg-fuchsia-600/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-6 pb-8 pt-safe">
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/25 to-fuchsia-500/25">
              <Brain className="h-4.5 w-4.5 text-cyan-300" />
            </span>
            <span className="text-[13px] font-bold tracking-[0.2em]">NEURO-HYPNO</span>
          </div>
          <button onClick={finish} className="pressable font-mono text-[11px] tracking-widest text-white/40">GEÇ →</button>
        </div>

        {/* ilerleme */}
        <div className="mt-5 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-400' : ''}`} style={{ width: i <= step ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center py-6">
          {step === 0 && (
            <div key="s0" className="anim-fadeUp text-center">
              <div className="mx-auto w-fit"><OrbCanvas playing={false} size={190} /></div>
              <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight">
                Uyurken <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">dil öğren.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-white/60">
                Bilinçle uyku arasındaki <em className="font-serif italic text-fuchsia-200">hipnagojik pencerede</em> beynin
                dile en açık hali. Biz o pencereye fısıldıyoruz.
              </p>
              <div className="mt-5 flex justify-center gap-2 font-mono text-[10px]">
                {['θ 6 Hz', 'HALL 2.4s', 'AAAA'].map((c) => (
                  <span key={c} className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-white/60">{c}</span>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div key="s1" className="anim-fadeUp text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-cyan-400/30 bg-cyan-500/15 shadow-[0_0_50px_rgba(34,211,238,0.25)]">
                <Waves className="h-10 w-10 text-cyan-300" />
              </span>
              <h1 className="mt-5 text-[30px] font-bold leading-tight tracking-tight">10 dakika sonra <span className="font-serif font-normal italic text-cyan-200">fısıltı başlar</span></h1>
              <p className="mx-auto mt-3 max-w-[330px] text-[14px] leading-relaxed text-white/60">
                Önce zihin sakinleşir; <b className="text-white/90">10. dakikada</b> seçtiğin dilin cümle kalıpları
                büyük-salon yankısıyla fısıldanmaya başlar — <b className="text-white/90">%35 ıslak, %65 berrak,</b>
                anlaşılır ama uzayda süzülür, bilinçaltına işlenir.
              </p>
              <div className="mx-auto mt-5 max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                <div className="flex h-9">
                  <div className="flex w-[55%] items-center justify-center bg-white/8 font-mono text-[9px] font-bold text-white/50">0-10DK SESSİZ GİRİŞ</div>
                  <div className="flex flex-1 items-center justify-center bg-cyan-500/40 font-mono text-[9px] font-bold">FISILTI YANKILI</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div key="s2" className="anim-fadeUp text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-violet-400/30 bg-violet-500/15 shadow-[0_0_50px_rgba(167,139,250,0.3)]">
                <MoonStar className="h-10 w-10 text-violet-300" />
              </span>
              <h1 className="mt-5 text-[30px] font-bold leading-tight tracking-tight">90 dakikada <span className="font-serif font-normal italic text-violet-200">rüya</span></h1>
              <div className="mx-auto mt-5 max-w-[330px] space-y-2 text-left">
                {[
                  ['N1 Penceresi', 'Zirve edinim · tam katedral', '#e879f9'],
                  ['N2 Örgü', 'Konsolidasyon · %45 ıslaklık', '#a78bfa'],
                  ['Derin Kilit', 'Fısıltılar yatağın altında', '#6366f1'],
                  ['Rüya Yankısı', 'REM · kelimeler rüyada', '#22d3ee'],
                ].map(([t, d, c]) => (
                  <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
                    <div>
                      <div className="text-[13px] font-bold">{t}</div>
                      <div className="text-[11px] text-white/45">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mx-auto mt-4 flex max-w-[300px] items-start gap-2 text-left text-[12px] text-white/50">
                <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                İki mod var: kulaklıkta binaural vuruş, hoparlörde 136.1 Hz izokronik nabız — ikisi de seni teta'ya taşır.
              </p>
            </div>
          )}

          {step === 3 && (
            <div key="s3" className="anim-fadeUp">
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-fuchsia-400/30 bg-fuchsia-500/15">
                  <Moon className="h-8 w-8 text-fuchsia-200" />
                </span>
                <h1 className="mt-4 text-[28px] font-bold tracking-tight">Geceni <span className="font-serif font-normal italic text-fuchsia-200">kuralım</span></h1>
              </div>
              <div className="mt-5 font-mono text-[10px] tracking-[0.25em] text-white/45">HANGİ DİLLE RÜYA GÖRECEKSİN?</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {RHYMES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { buzz(10); setLang(l.id); }}
                    className={`pressable rounded-2xl border p-3 text-center ${lang === l.id ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/30'}`}
                  >
                    <div className="font-mono text-[13px] font-bold" style={{ color: l.color }}>{l.id}</div>
                    <div className="mt-0.5 truncate text-[11px] text-white/60">{l.langTr}</div>
                    {lang === l.id && <Check className="mx-auto mt-1 h-3.5 w-3.5 text-emerald-300" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-emerald-300/80">
                ✓ Hiçbiri kilitli değil — sonra dilediğin an dil/seviye değiştirebilirsin
              </p>
              <div className="mt-4 font-mono text-[10px] tracking-[0.25em] text-white/45">YATMA SAATİN?</div>
              <div className="mt-2 flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                <span className="text-[14px] text-white/70">Her gece hatırlat</span>
                <input
                  type="time"
                  value={settings.bedtime}
                  onChange={(e) => updateSettings({ bedtime: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black/50 px-3 py-2 font-mono text-[16px] font-bold text-cyan-200 focus:border-cyan-300/50 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {step < 3 ? (
            <button
              onClick={next}
              className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[15px] font-bold text-black"
            >
              Devam Et <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 py-4 text-[15px] font-bold shadow-[0_10px_40px_rgba(139,92,246,0.5)]"
            >
              <Play className="h-5 w-5 fill-current" /> İlk Geceye Başla · +20 XP
            </button>
          )}
          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-white/30">
            <Sparkles className="h-3 w-3" /> 2 dakikada kurulum · kredi kartı yok · rüya garantili
          </div>
        </div>
      </div>
    </div>
  );
}
