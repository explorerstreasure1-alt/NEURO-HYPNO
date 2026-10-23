import { useState } from 'react';
import {
  Bell, Vibrate, MoonStar, AudioWaveform, ChevronRight, Crown,
  BookOpen, Plus, FlaskConical, Copy, Check, ShieldCheck, Trash2,
  SlidersHorizontal, FileCode2, Sparkles, PenLine, X, Stethoscope,
} from 'lucide-react';
import { useApp, buzz } from '../store';
import { MAIN_PY, SPEAKER_PY } from '../data/scripts';
import { SectionHead, Row, Toggle, MSlider, Bar, Sheet } from '../components/ui';

const MOODS = ['Berrak rüya', 'Derin uyku', 'Hafif uyku', 'Kelime rüyası', 'Uyanık kaldım'];

export default function Profile() {
  const {
    settings, updateSettings, xp, level, streak, journal, addJournal,
    params, patch, pushToast, resetAll, bedtimeCountdown,
    setScienceOpen, setDisclaimerOpen,
  } = useApp();
  const [labOpen, setLabOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeTab, setCodeTab] = useState<'spatial' | 'speaker'>('spatial');
  const [journalOpen, setJournalOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [mood, setMood] = useState(MOODS[0]);

  const activeCode = codeTab === 'spatial' ? MAIN_PY : SPEAKER_PY;
  const activeName = codeTab === 'spatial' ? 'spatial_reverb_engine.py' : 'speaker_mode_engine.py';
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(activeCode); } catch { /* yok */ }
    setCopied(true);
    pushToast(`${activeName} kopyalandı`, 'success');
    setTimeout(() => setCopied(false), 1800);
  };

  const saveJournal = () => {
    addJournal(draft, mood);
    setDraft('');
    setJournalOpen(false);
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-2">
      {/* ── kullanıcı ── */}
      <header className="anim-fadeUp flex items-center gap-3.5 pt-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/15 bg-gradient-to-br from-violet-600/60 via-purple-600/40 to-fuchsia-600/40 text-[24px] font-bold">
          R
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight">Rüya Gezgini</h1>
          <div className="mt-0.5 font-mono text-[11px] text-white/45">SEVİYE {level} · {xp} XP · {streak} GECE SERİSİ</div>
          <div className="mt-1.5"><Bar pct={(xp % 300) / 3} color="#e879f9" h={4} /></div>
        </div>
      </header>

      {/* ── pro ── */}
      <button
        onClick={() => { buzz(15); pushToast('PRO yakında: sınırsız seans + çevrimdışı paketler', 'info'); }}
        className="pressable anim-fadeUp stagger-1 relative block w-full overflow-hidden rounded-[24px] border border-amber-300/30 bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-fuchsia-500/15 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_24px_rgba(251,191,36,0.4)]">
            <Crown className="h-6 w-6 text-white" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">NEURO-HYPNO PRO</span>
            <span className="block text-[12px] text-white/55">90dk döngüler · çevrimdışı · öncelikli rüya analizi</span>
          </span>
          <ChevronRight className="h-5 w-5 text-white/40" />
        </div>
      </button>

      {/* ── uyku ayarları ── */}
      <section className="anim-fadeUp stagger-2 space-y-2">
        <SectionHead title="Uyku ayarları" sub={`Yatma saatine ${bedtimeCountdown} kaldı`} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
              <MoonStar className="h-5 w-5 text-violet-300" />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-white/90">Yatma saati</span>
              <span className="block text-[11px] text-white/40">Hatırlatıcı 30 dk önceden gelir</span>
            </span>
            <input
              type="time"
              value={settings.bedtime}
              onChange={(e) => { updateSettings({ bedtime: e.target.value }); }}
              className="rounded-xl border border-white/15 bg-black/50 px-3 py-2 font-mono text-[15px] font-bold text-cyan-200 focus:border-cyan-300/50 focus:outline-none"
            />
          </div>
        </div>
        <Row
          icon={<Bell className="h-5 w-5 text-amber-300" />} title="Seans hatırlatıcısı" sub="Yatma saatinden önce nazik dürtme"
          right={<Toggle on={settings.reminders} onClick={() => { buzz(10); updateSettings({ reminders: !settings.reminders }); }} />}
        />
        <Row
          icon={<Vibrate className="h-5 w-5 text-cyan-300" />} title="Dokunsal geri bildirim" sub="Faz geçişlerinde hafif titreşim"
          right={<Toggle on={settings.haptics} onClick={() => updateSettings({ haptics: !settings.haptics })} />}
        />
        <Row
          icon={<AudioWaveform className="h-5 w-5 text-fuchsia-300" />} title="Yumuşak kapanış" sub="Son 90 saniyede sesi soldur"
          right={<Toggle on={settings.fadeOut} onClick={() => { buzz(10); updateSettings({ fadeOut: !settings.fadeOut }); }} />}
        />
      </section>

      {/* ── rüya günlüğü ── */}
      <section className="anim-fadeUp stagger-3 space-y-2">
        <SectionHead
          title="Rüya günlüğü" sub={`${journal.length} kayıt`}
          right={
            <button onClick={() => { buzz(12); setJournalOpen(true); }} className="pressable flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-3.5 py-2 text-[12px] font-bold">
              <Plus className="h-3.5 w-3.5" /> Yaz
            </button>
          }
        />
        {journal.slice(0, 3).map((j) => (
          <div key={j.id} className="glass rounded-[20px] p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-cyan-300" />
              <span className="font-mono text-[10px] tracking-widest text-white/40">{j.date.toUpperCase()}</span>
              <span className="ml-auto rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-1 font-mono text-[9px] text-violet-200">{j.mood}</span>
            </div>
            <p className="mt-2 font-serif text-[14.5px] italic leading-relaxed text-white/75">“{j.text}”</p>
          </div>
        ))}
      </section>

      {/* ── ses laboratuvarı ── */}
      <section className="anim-fadeUp stagger-4 space-y-2">
        <SectionHead title="Ses laboratuvarı" sub="Canlı motor · değişiklik anında duyulur" />
        <Row
          icon={<SlidersHorizontal className="h-5 w-5 text-emerald-300" />}
          title="İnce ayar konsolu" sub={`wet ${params.wet}% · ${params.decay.toFixed(1)}s · ${params.delayMs}ms · θ ${params.binauralBeat}Hz`}
          right={<ChevronRight className="h-5 w-5 text-white/35" />}
          onClick={() => { buzz(12); setLabOpen(true); }}
        />
        <Row
          icon={<FileCode2 className="h-5 w-5 text-amber-300" />}
          title="Sentez betikleri" sub="spatial + speaker · pedalboard + scipy"
          right={<ChevronRight className="h-5 w-5 text-white/35" />}
          onClick={() => { buzz(12); setCodeOpen(true); }}
        />
      </section>

      {/* ── bilim & güvenlik ── */}
      <section className="anim-fadeUp stagger-5 space-y-2">
        <SectionHead title="Bilim & Güvenlik" sub="4 nörolog/sinirbilimci kalite kontrolü" />
        <Row
          icon={<Stethoscope className="h-5 w-5 text-emerald-300" />}
          title="Kalite Kontrol Raporu" sub="Bulgular + uygulanan düzeltmeler"
          right={<ChevronRight className="h-5 w-5 text-white/35" />}
          onClick={() => setScienceOpen(true)}
        />
        <Row
          icon={<ShieldCheck className="h-5 w-5 text-rose-300" />}
          title="Güvenlik Onayını Tekrar Oku" sub="Kontrendikasyonlar · epilepsi/gebelik/kalp pili"
          right={<ChevronRight className="h-5 w-5 text-white/35" />}
          onClick={() => setDisclaimerOpen(true)}
        />
      </section>

      <section className="anim-fadeUp stagger-5 rounded-[24px] border border-emerald-400/20 bg-emerald-500/8 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
          <p className="text-[12px] leading-relaxed text-white/60">
            <b className="text-emerald-200">Uyku güvenli:</b> tüm seanslar −1 dB tavan, tıklamasız
            geçişler ve 6 kHz kuyruk filtresiyle üretilir. Kritik pencere sonrası <b className="text-emerald-200">Akıllı Söndürme</b> devreye
            girer — fısıltı yastığın altından geliyormuş gibi olup kademeli kısılır, tüm gece yüksek çalmaz.
          </p>
        </div>
      </section>

      <button
        onClick={() => { buzz([30, 50, 30]); resetAll(); }}
        className="pressable anim-fadeUp stagger-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/10 py-3.5 text-[13px] font-bold text-rose-200"
      >
        <Trash2 className="h-4 w-4" /> Tüm veriyi sıfırla
      </button>
      <div className="pb-2 text-center font-mono text-[9px] tracking-[0.3em] text-white/25">
        NEURO-HYPNO v2.4 · SOMNOLİNGUİSTİK AR-GE
      </div>

      {/* ── laboratuvar sayfası ── */}
      <Sheet open={labOpen} onClose={() => setLabOpen(false)}>
        <div className="space-y-3 px-5 pb-8 pt-2">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-300">CANLI MOTOR</div>
            <h2 className="mt-1 text-[20px] font-bold">İnce ayar <span className="font-serif font-normal italic text-emerald-200">konsolu</span></h2>
          </div>
          <MSlider label="Islak / Kuru" value={params.wet} min={0} max={80} step={1} unit="%" color="#22d3ee" hint="spec %35" onChange={(v) => patch({ wet: v })} />
          <MSlider label="Kuyruk RT60" value={params.decay} min={0.4} max={5} step={0.1} unit="sn" color="#e879f9" hint="spec 2.4" onChange={(v) => patch({ decay: v })} />
          <MSlider label="Ping-Pong" value={params.delayMs} min={40} max={400} step={5} unit="ms" color="#34d399" hint="spec 120" onChange={(v) => patch({ delayMs: v })} />
          <MSlider label="Yankı geri besleme" value={params.feedback} min={0} max={60} step={1} unit="%" color="#a78bfa" hint="spec %15" onChange={(v) => patch({ feedback: v })} />
          <MSlider label="Kuyruk tiz kesimi" value={params.highCut} min={2000} max={14000} step={100} unit="Hz" color="#fbbf24" hint="spec 6k" onChange={(v) => patch({ highCut: v })} />
          <MSlider label="Teta vuruşu" value={params.binauralBeat} min={2} max={12} step={0.5} unit="Hz" color="#34d399" hint="spec 6" onChange={(v) => patch({ binauralBeat: v })} />
          <MSlider label="Ana ses" value={params.masterGain} min={0} max={100} step={1} unit="" color="#fb7185" onChange={(v) => patch({ masterGain: v })} />
          <button
            onClick={() => { patch({ wet: 35, decay: 2.4, delayMs: 120, feedback: 15, highCut: 6000, binauralBeat: 6 }); pushToast('Spec değerlerine dönüldü', 'success'); }}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-[13px] font-bold text-white/80"
          >
            <FlaskConical className="h-4 w-4" /> SPEC'E SIFIRLA
          </button>
        </div>
      </Sheet>

      {/* ── kod sayfası ── */}
      <Sheet open={codeOpen} onClose={() => setCodeOpen(false)} tall>
        <div className="flex items-center gap-2 px-5 pb-2">
          <button
            onClick={() => setCodeTab('spatial')}
            className={`pressable rounded-lg px-3 py-1.5 font-mono text-[10.5px] ${codeTab === 'spatial' ? 'bg-cyan-500/20 text-cyan-200' : 'text-white/40'}`}
          >
            🎧 spatial…
          </button>
          <button
            onClick={() => setCodeTab('speaker')}
            className={`pressable rounded-lg px-3 py-1.5 font-mono text-[10.5px] ${codeTab === 'speaker' ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'text-white/40'}`}
          >
            🔊 speaker…
          </button>
          <button onClick={copyCode} className="pressable ml-auto flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/75">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'KOPYALANDI' : 'KOPYALA'}
          </button>
        </div>
        <div className="px-5 pb-2 font-mono text-[10px] text-white/40">
          {activeName} · {codeTab === 'spatial' ? 'kulaklık · binaural + katedral' : 'hoparlör · izokronik 136.1 Hz + M/S'}
        </div>
        <pre className="mx-4 mb-6 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[10.5px] leading-relaxed text-slate-300">
          {activeCode.slice(0, 6000)}{activeCode.length > 6000 ? '\n\n# … devamı masaüstü konsolda …' : ''}
        </pre>
      </Sheet>

      {/* ── günlük yazma ── */}
      <Sheet open={journalOpen} onClose={() => setJournalOpen(false)}>
        <div className="space-y-4 px-5 pb-8 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-bold">Rüyanı <span className="font-serif font-normal italic text-cyan-200">yakala</span></h2>
            <button onClick={() => setJournalOpen(false)} className="pressable flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5">
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => { buzz(8); setMood(m); }}
                className={`pressable rounded-full border px-3 py-2 text-[12px] font-semibold ${mood === m ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100' : 'border-white/10 bg-black/30 text-white/50'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/12 bg-black/40 p-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder="Bu gece ne gördün? Hangi kelimeler rüyana girdi?"
              className="w-full resize-none rounded-xl bg-transparent p-3 font-serif text-[15px] italic text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <button
            onClick={saveJournal}
            disabled={!draft.trim()}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-4 text-[15px] font-bold disabled:opacity-40"
          >
            <PenLine className="h-4 w-4" /> GÜNLÜĞE İŞLE · +8 XP
          </button>
          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-white/35">
            <Sparkles className="h-3 w-3" /> Sabah ilk 10 dakika yazılanlar 3× kalıcı olur
          </div>
        </div>
      </Sheet>
    </div>
  );
}
