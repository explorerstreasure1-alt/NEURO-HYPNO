import { useEffect, useRef } from 'react';
import { engine } from '../audio/engine';

// ── Teta küresi: canlı analizörle nefes alan halka evreni ──
export function OrbCanvas({ playing, beat = 6, size = 208 }: { playing: boolean; beat?: number; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const beatRef = useRef(beat);
  beatRef.current = beat;
  const playRef = useRef(playing);
  playRef.current = playing;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    let t = 0;
    const freq = new Uint8Array(1024);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const S = size * dpr;
    cv.width = S; cv.height = S;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2, cy = S / 2;

      let energy = 0.25;
      try {
        if (playRef.current && (engine as any).analyser) {
          (engine as any).analyser.getByteFrequencyData(freq as any);
          let sum = 0;
          for (let i = 0; i < 120; i++) sum += freq[i];
          energy = 0.25 + (sum / 120 / 255) * 0.9;
        } else {
          energy = 0.25 + 0.08 * Math.sin(t * 1.3);
        }
      } catch { /* simüle */ }

      const breathe = 1 + 0.06 * Math.sin(t * (beatRef.current / 3)) * (playRef.current ? 1.6 : 0.7);

      // dış hale
      const halo = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, S * 0.5);
      halo.addColorStop(0, 'rgba(139,92,246,0)');
      halo.addColorStop(0.55, `rgba(139,92,246,${0.16 * energy})`);
      halo.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, S, S);

      // yörünge halkaları
      const rings = [
        { r: 0.30, w: 2.5, c1: '#22d3ee', c2: '#a78bfa', sp: 0.35, n: 3 },
        { r: 0.375, w: 1.6, c1: '#a78bfa', c2: '#e879f9', sp: -0.22, n: 5 },
        { r: 0.45, w: 1.1, c1: '#e879f9', c2: '#22d3ee', sp: 0.14, n: 7 },
      ];
      rings.forEach((R, ri) => {
        const Rr = S * R.r * breathe;
        // hayalet çember
        ctx.beginPath();
        ctx.arc(cx, cy, Rr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // dönen yaylar
        for (let i = 0; i < R.n; i++) {
          const a0 = t * R.sp * 2 + (i * Math.PI * 2) / R.n + ri;
          const a1 = a0 + 0.7 + energy * 0.5;
          const g = ctx.createLinearGradient(cx - Rr, cy - Rr, cx + Rr, cy + Rr);
          g.addColorStop(0, R.c1);
          g.addColorStop(1, R.c2);
          ctx.beginPath();
          ctx.arc(cx, cy, Rr, a0, a1);
          ctx.strokeStyle = g;
          ctx.lineWidth = R.w * dpr;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 12 * dpr * energy;
          ctx.shadowColor = R.c1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // çekirdek
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.2 * breathe);
      core.addColorStop(0, `rgba(255,255,255,${0.5 + energy * 0.3})`);
      core.addColorStop(0.35, `rgba(232,121,249,${0.35 * energy})`);
      core.addColorStop(0.7, `rgba(139,92,246,${0.18 * energy})`);
      core.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.2 * breathe, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={ref} style={{ width: size, height: size }} />;
}

// ── Dalga şeridi ──
export function ScopeCanvas({ playing, height = 72 }: { playing: boolean; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const playRef = useRef(playing);
  playRef.current = playing;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    let t = 0;
    const time = new Uint8Array(2048);
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const draw = () => {
      const W = (cv.width = cv.clientWidth * dpr);
      const H = (cv.height = (cv.clientHeight || height) * dpr);
      ctx.clearRect(0, 0, W, H);
      t += 0.03;
      let live = false;
      try {
        if (playRef.current && (engine as any).analyserTime) {
          (engine as any).analyserTime.getByteTimeDomainData(time as any);
          live = true;
        }
      } catch { /* simüle */ }

      // ayna dalgalar
      const waves = [
        { amp: 0.30, color: 'rgba(34,211,238,0.9)', w: 2 },
        { amp: 0.18, color: 'rgba(232,121,249,0.55)', w: 1.4, off: 1.4 },
      ];
      const mid = H / 2;
      waves.forEach((wv) => {
        ctx.beginPath();
        ctx.lineWidth = wv.w * dpr;
        ctx.strokeStyle = wv.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.shadowColor = wv.color;
        for (let x = 0; x <= W; x += 3) {
          let y: number;
          if (live && !wv.off) {
            y = mid + ((time[Math.floor((x / W) * time.length)] - 128) / 128) * H * wv.amp;
          } else {
            const p = x / W;
            y = mid + Math.sin(p * Math.PI * 2 * 6 + t * 2.2 + (wv.off ?? 0)) * H * wv.amp * (live ? 1 : 0.35)
              + Math.sin(p * Math.PI * 2 * 2 + t) * H * 0.05;
          }
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className="h-full w-full" style={{ height }} />;
}

// ── Nefes çemberi: 4sn al · 4sn tut · 6sn ver (14sn döngü) ──
export function BreathCircle({ size = 148 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const S = size * dpr;
    cv.width = S; cv.height = S;
    const t0 = performance.now();

    const draw = () => {
      const t = ((performance.now() - t0) / 1000) % 14;
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2, cy = S / 2;
      const R = S * 0.38;

      let phase: 'AL' | 'TUT' | 'VER';
      let scale: number;
      let left: number;
      let color: string;
      if (t < 4) { phase = 'AL'; scale = 0.72 + 0.28 * (t / 4); left = Math.ceil(4 - t); color = '#22d3ee'; }
      else if (t < 8) { phase = 'TUT'; scale = 1; left = Math.ceil(8 - t); color = '#a78bfa'; }
      else { phase = 'VER'; scale = 1 - 0.28 * ((t - 8) / 6); left = Math.ceil(14 - t); color = '#e879f9'; }

      const r = R * scale;

      // dış hale
      const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.5);
      halo.addColorStop(0, 'rgba(0,0,0,0)');
      halo.addColorStop(1, `${color}2e`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, S, S);

      // hayalet tam çember
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // nefes çemberi
      const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      g.addColorStop(0, color);
      g.addColorStop(1, '#ffffff');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = g;
      ctx.lineWidth = 3 * dpr;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 18 * dpr;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // iç dolgu
      const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      fill.addColorStop(0, `${color}30`);
      fill.addColorStop(1, `${color}08`);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // metin
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${15 * dpr}px "Space Grotesk", sans-serif`;
      ctx.fillText(phase, cx, cy - 2 * dpr);
      ctx.fillStyle = color;
      ctx.font = `700 ${22 * dpr}px "JetBrains Mono", monospace`;
      ctx.fillText(String(left), cx, cy + 24 * dpr);

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={ref} style={{ width: size, height: size }} />;
}

// ── Ekolayzer çubukları ──
export function EqBars({ playing, n = 5, color = 'linear-gradient(180deg,#22d3ee,#a78bfa)' }: {
  playing: boolean; n?: number; color?: string;
}) {
  return (
    <div className="flex h-6 items-end gap-[3px]">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full"
          style={{
            height: '100%',
            background: color,
            opacity: playing ? 1 : 0.25,
            animation: playing ? `eq ${0.6 + (i % 4) * 0.16}s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.08}s`,
            transform: playing ? undefined : 'scaleY(0.3)',
          }}
        />
      ))}
    </div>
  );
}

// ── Haftalık dakika grafiği ──
export function WeekBars({ data }: { data: { d: string; v: number }[] }) {
  const max = Math.max(...data.map((x) => x.v));
  const today = (new Date().getDay() + 6) % 7;
  return (
    <div className="flex h-36 items-end justify-between gap-2 px-1">
      {data.map((b, i) => (
        <div key={b.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className={`font-mono text-[9px] tabular-nums ${i === today ? 'text-cyan-300' : 'text-white/30'}`}>{b.v}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${Math.max(8, (b.v / max) * 100)}%`,
                background: i === today
                  ? 'linear-gradient(180deg,#22d3ee,#0e7490)'
                  : 'linear-gradient(180deg,rgba(167,139,250,0.75),rgba(167,139,250,0.25))',
                boxShadow: i === today ? '0 0 16px rgba(34,211,238,0.4)' : 'none',
              }}
            />
          </div>
          <span className={`text-[10px] font-semibold ${i === today ? 'text-cyan-200' : 'text-white/35'}`}>{b.d}</span>
        </div>
      ))}
    </div>
  );
}

// ── Hatırlama eğrisi ──
export function RetentionCurve() {
  return (
    <svg viewBox="0 0 300 120" className="w-full">
      <defs>
        <linearGradient id="rcH" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 50, 80, 110].map((y) => (
        <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      <path d="M0,18 C60,20 120,45 170,62 C220,79 260,86 300,92 L300,120 L0,120 Z" fill="url(#rcH)" />
      <path d="M0,18 C60,20 120,45 170,62 C220,79 260,86 300,92" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M0,18 C50,40 100,75 160,98 C210,114 260,117 300,118" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <circle cx="170" cy="62" r="4" fill="#22d3ee" />
      <circle cx="170" cy="62" r="8" fill="none" stroke="#22d3ee" strokeOpacity="0.4" />
      <text x="180" y="56" fill="#a5f3fc" fontSize="9" fontFamily="monospace">+3 gece tekrar</text>
      <text x="6" y="14" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="monospace">HATIRLAMA</text>
      <text x="252" y="116" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace">7 GÜN</text>
    </svg>
  );
}

// ── Uyku evreleri ──
export function SleepStages() {
  const stages = [
    { l: 'Uyanık', v: 6, c: '#64748b' },
    { l: 'N1', v: 10, c: '#22d3ee' },
    { l: 'N2', v: 34, c: '#a78bfa' },
    { l: 'Derin', v: 28, c: '#6366f1' },
    { l: 'REM', v: 22, c: '#e879f9' },
  ];
  return (
    <div>
      <div className="flex h-9 w-full gap-1 overflow-hidden rounded-xl">
        {stages.map((s) => (
          <div key={s.l} className="relative flex items-center justify-center overflow-hidden" style={{ width: `${s.v}%`, background: `${s.c}2e`, border: `1px solid ${s.c}44` }}>
            <span className="text-[9px] font-bold" style={{ color: s.c }}>{s.l}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-white/35">
        <span>DÜN GECE · 7sa 12dk</span>
        <span className="text-violet-300">N1 PENCERESİ 43dk</span>
      </div>
    </div>
  );
}
