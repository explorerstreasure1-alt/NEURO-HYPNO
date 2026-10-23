import { BookOpenCheck, ChevronRight, SkipForward, Lightbulb, Sparkles } from 'lucide-react';
import { useApp, buzz } from '../store';
import { Sheet, Bar } from '../components/ui';

/**
 * UYANIKKEN KODLAMA — Dr. E. Karaman (Bilişsel Sinirbilim) düzeltmesi.
 * Bilim: Uykuda YENİ kelime öğrenimi desteklenmiyor; fakat uyanıkken
 * kodlanmış materyalin uykuda ipuçla yeniden etkinleştirilmesi (TMR)
 * pekiştirmeyi güçlendiriyor. Bu yüzden gece sesi başlamadan önce kısa,
 * etkin bir hatırlama turu yapılır — "uyurken öğren" değil, "uyanıkken
 * kodla, uykuda pekiştir".
 */
export function EncodingSheet() {
  const {
    encodingOpen, encodingIdx, encodingRevealed, current, revealEncoding, nextEncoding, closeEncoding, skipToSleep,
    encodingWords, encodingGlosses,
  } = useApp();
  if (!encodingOpen) return null;
  const word = encodingWords[encodingIdx];
  const gloss = encodingGlosses[encodingIdx] ?? encodingGlosses[0];
  const isLast = encodingIdx + 1 >= encodingWords.length;

  return (
    <Sheet open={encodingOpen} onClose={closeEncoding}>
      <div className="px-5 pb-8 pt-1 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15">
          <BookOpenCheck className="h-7 w-7 text-cyan-300" />
        </span>
        <div className="mt-3 font-mono text-[10px] tracking-[0.3em] text-cyan-300">UYANIKKEN KODLAMA · 60-90SN</div>
        <h2 className="mt-1 text-[21px] font-bold tracking-tight">Önce <span className="font-serif font-normal italic text-cyan-200">uyanıkken</span> öğren</h2>
        <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-relaxed text-white/55">
          Bilim şunu gösteriyor: yeni kelimeler uykuda değil, <b className="text-white/80">şimdi, uyanıkken</b> kodlanır.
          Gece sesi az sonra bu kelimeleri bir hatırlama ipucu olarak yeniden etkinleştirecek.
        </p>

        <div className="mx-auto mt-5 max-w-[280px]">
          <div className="mb-1.5 flex justify-between font-mono text-[10px] text-white/35">
            <span>{encodingIdx + 1}/{encodingWords.length}</span>
            <span>{current.langTr}</span>
          </div>
          <Bar pct={((encodingIdx + (encodingRevealed ? 0.5 : 0)) / encodingWords.length) * 100} color="#22d3ee" />
        </div>

        <button
          onClick={revealEncoding}
          className="pressable mt-5 block w-full rounded-3xl border border-white/12 bg-black/40 px-4 py-9"
        >
          <div className="font-mono text-[9.5px] tracking-[0.25em] text-white/40">SESLİ TEKRARLA · ANLAMINI HATIRLA</div>
          <div className="mt-2 font-serif text-[40px] italic leading-none" style={{ color: current.accent }}>{word}</div>
          <div className="mt-4 min-h-[30px]">
            {encodingRevealed
              ? <span className="anim-ticker inline-block rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-1.5 text-[15px] font-bold text-emerald-200">{gloss}</span>
              : <span className="flex items-center justify-center gap-1.5 font-mono text-[11px] tracking-widest text-white/35"><Lightbulb className="h-3.5 w-3.5" /> GÖRMEK İÇİN DOKUN</span>}
          </div>
        </button>

        {encodingRevealed ? (
          <button
            onClick={() => { buzz(10); nextEncoding(); }}
            className="pressable anim-fadeUp mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-4 text-[14.5px] font-bold"
          >
            {isLast ? <><Sparkles className="h-4 w-4" /> Kodlama Tamam · Uykuya Geç</> : <>Sıradaki Kelime <ChevronRight className="h-4 w-4" /></>}
          </button>
        ) : (
          <p className="mt-4 font-mono text-[10px] text-white/30">KELİMEYİ YÜKSEK SESLE TEKRARLA, SONRA KARTA DOKUN</p>
        )}

        <button
          onClick={() => { buzz(8); skipToSleep(); }}
          className="pressable mt-3 flex w-full items-center justify-center gap-1.5 font-mono text-[11px] tracking-widest text-white/35"
        >
          <SkipForward className="h-3.5 w-3.5" /> ATLA, DOĞRUDAN UYKUYA GEÇ
        </button>
      </div>
    </Sheet>
  );
}
