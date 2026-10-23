import { Brain, HeartPulse, Baby, Zap, Ear, BookOpen, ShieldCheck, Check } from 'lucide-react';
import { useApp, buzz } from '../store';
import { DISCLAIMER_POINTS } from '../data/science';
import { Modal } from '../components/ui';

const ICONS: Record<string, React.ReactNode> = {
  brain: <Brain className="h-4 w-4" />,
  heart: <HeartPulse className="h-4 w-4" />,
  baby: <Baby className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  ear: <Ear className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
};

export function DisclaimerModal() {
  const { disclaimerOpen, setDisclaimerOpen, disclaimerAccepted, acceptDisclaimer } = useApp();
  // İlk kez kabul edilmemişse kapatılamaz (mandatory); sonradan tekrar okumak için dismiss edilebilir.
  const mandatory = !disclaimerAccepted;

  return (
    <Modal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} dismiss={!mandatory}>
      <div className="glass-deep max-h-[88dvh] overflow-y-auto rounded-[28px] p-6">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15">
            <ShieldCheck className="h-7 w-7 text-rose-300" />
          </span>
          <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-rose-300">
            {mandatory ? 'DEVAM ETMEDEN ÖNCE' : 'GÜVENLİK UYARISI'}
          </div>
          <h2 className="mt-1 text-[21px] font-bold tracking-tight">Güvenlik & Kapsam Onayı</h2>
          <p className="mx-auto mt-2 max-w-[310px] text-[12.5px] leading-relaxed text-white/55">
            Bu klinik nöroloji incelemesi sonucu eklendi. Ritmik ses/titreşim uyaranları çoğu kullanıcı için güvenlidir,
            ancak bazı durumlarda dikkat gerektirir.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {DISCLAIMER_POINTS.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/30 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
                {ICONS[p.icon]}
              </span>
              <p className="text-[12px] leading-relaxed text-white/65">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-500/10 p-3 text-[11.5px] leading-relaxed text-amber-100/90">
          ⚠️ Herhangi bir rahatsızlık, baş dönmesi, çarpıntı ya da kaygı hissedersen seansı hemen durdur ve gerekirse hekimine danış.
        </div>

        <button
          onClick={() => { buzz(15); acceptDisclaimer(); }}
          className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 py-4 text-[14.5px] font-bold shadow-[0_10px_32px_rgba(244,63,94,0.35)]"
        >
          <Check className="h-5 w-5" /> Okudum, Anladım ve Kabul Ediyorum
        </button>
        {!mandatory && (
          <button onClick={() => setDisclaimerOpen(false)} className="pressable mt-2 flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/5 py-3 text-[12.5px] font-bold text-white/70">
            Kapat
          </button>
        )}
        <div className="mt-3 text-center font-mono text-[9.5px] text-white/30">
          NEURO-HYPNO tıbbi bir cihaz değildir · eğlence/sağlıklı yaşam amaçlı deneysel bir araçtır.
        </div>
      </div>
    </Modal>
  );
}
