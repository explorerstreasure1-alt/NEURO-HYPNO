import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { Toast } from '../store';

// ── başlık ──
export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h3 className="text-[17px] font-bold tracking-tight text-white">{title}</h3>
        {sub && <p className="mt-0.5 text-[12px] text-white/45">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ── hap filtre ──
export function Chip({ active, onClick, children, color = '#22d3ee' }: {
  active?: boolean; onClick?: () => void; children: ReactNode; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="pressable shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold"
      style={active
        ? { borderColor: `${color}66`, background: `${color}1f`, color, boxShadow: `0 0 18px ${color}33` }
        : { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)' }}
    >
      {children}
    </button>
  );
}

// ── anahtar ──
export function Toggle({ on, onClick, color = '#34d399' }: { on: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="pressable relative h-8 w-[52px] shrink-0 rounded-full border transition-all"
      style={{
        background: on ? `${color}33` : 'rgba(255,255,255,0.07)',
        borderColor: on ? `${color}66` : 'rgba(255,255,255,0.12)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white transition-all"
        style={{
          left: on ? 'calc(100% - 28px)' : '4px',
          boxShadow: on ? `0 0 14px ${color}` : '0 2px 6px rgba(0,0,0,0.5)',
        }}
      />
    </button>
  );
}

// ── dokunmatik kaydırıcı ──
export function MSlider({ label, value, min, max, step, unit, color, hint, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; color: string; hint?: string; onChange: (v: number) => void;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-2 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white/85">
          {label}
          {hint && <span className="ml-2 font-mono text-[10px] font-normal text-white/35">{hint}</span>}
        </div>
        <div className="font-mono text-[14px] font-bold tabular-nums" style={{ color }}>
          {typeof value === 'number' && value < 100 && step < 1 ? value.toFixed(1) : value}
          <span className="ml-1 text-[10px] font-medium text-white/40">{unit}</span>
        </div>
      </div>
      <input
        type="range" className="touch-slider" min={min} max={max} step={step} value={value}
        style={{ ['--p' as string]: `${p}%`, ['--fill' as string]: color }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

// ── alt sayfa (bottom sheet) ──
export function Sheet({ open, onClose, children, tall }: {
  open: boolean; onClose: () => void; children: ReactNode; tall?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-fadeIn absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px]">
        <div className={`anim-sheetUp overflow-hidden rounded-t-[28px] border-x border-t border-white/12 bg-[#0a0524] shadow-[0_-20px_80px_rgba(0,0,0,0.6)] ${tall ? 'h-[92dvh]' : 'max-h-[86dvh]'} flex flex-col`}>
          <div className="flex justify-center pb-1 pt-3" onClick={onClose}>
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── ortalanmış iletişim ──
export function Modal({ open, onClose, children, dismiss = true }: {
  open: boolean; onClose: () => void; children: ReactNode; dismiss?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="anim-fadeIn absolute inset-0 bg-black/75" onClick={() => dismiss && onClose()} />
      <div className="anim-popIn relative mx-auto w-full max-w-[400px]">{children}</div>
    </div>
  );
}

// ── bildirimler ──
export function Toasts({ list }: { list: Toast[] }) {
  const color = (k: Toast['kind']) =>
    k === 'success' ? '#34d399' : k === 'theta' ? '#a78bfa' : k === 'warn' ? '#fbbf24' : '#22d3ee';
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[148px] z-[70] mx-auto flex w-full max-w-[440px] flex-col items-center gap-2 px-6">
      {list.map((t) => (
        <div
          key={t.id}
          className="anim-popIn flex items-center gap-2 rounded-full border bg-black/85 py-2.5 pl-3.5 pr-4 shadow-2xl backdrop-blur-xl"
          style={{ borderColor: `${color(t.kind)}55`, boxShadow: `0 8px 32px ${color(t.kind)}33` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color(t.kind), boxShadow: `0 0 8px ${color(t.kind)}` }} />
          <span className="text-[12px] font-medium text-white/90">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── ilerleme halkası ──
export function Ring({ pct, size = 64, stroke = 6, color = '#22d3ee', children }: {
  pct: number; size?: number; stroke?: number; color?: string; children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (Math.min(100, Math.max(0, pct)) / 100) * c}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ── çizgi ilerleme ──
export function Bar({ pct, color = '#22d3ee', h = 6 }: { pct: number; color?: string; h?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/10" style={{ height: h }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 10px ${color}66` }}
      />
    </div>
  );
}

// ── ayar satırı ──
export function Row({ icon, title, sub, right, onClick }: {
  icon: ReactNode; title: string; sub?: string; right?: ReactNode; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left ${onClick ? 'pressable' : ''}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-white/90">{title}</span>
        {sub && <span className="block truncate text-[11px] text-white/40">{sub}</span>}
      </span>
      {right}
    </button>
  );
}

// ── onay rozeti ──
export function Done({ on, color = '#34d399' }: { on: boolean; color?: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all"
      style={on
        ? { background: `${color}2e`, borderColor: `${color}88`, boxShadow: `0 0 12px ${color}44` }
        : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}
    >
      {on && <Check className="h-4 w-4" style={{ color }} strokeWidth={3} />}
    </span>
  );
}
