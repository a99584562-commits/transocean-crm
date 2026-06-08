import { useEffect } from 'react'
import { IconClose } from './icons.jsx'
import { STAGE_COLORS, stageMeta } from '../lib/domain.js'

export function StageBadge({ pipeline, stage, className = '' }) {
  const m = stageMeta(pipeline, stage)
  return (
    <span className={`chip ${m.bg} ${m.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {stage}
    </span>
  )
}

export function Tag({ color = 'slate', children, className = '' }) {
  const m = STAGE_COLORS[color] || STAGE_COLORS.slate
  return <span className={`chip ${m.bg} ${m.text} ${className}`}>{children}</span>
}

export function Modal({ open, onClose, children, title, subtitle, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-navy-900/30 backdrop-blur-sm animate-[fade-up_0.3s_ease]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'} max-h-[92vh] overflow-y-auto
          rounded-t-3xl sm:rounded-3xl bg-surface shadow-soft-lg ring-1 ring-navy-900/[0.06] animate-scale-in`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-navy-900/[0.06] bg-surface/90 px-6 py-4 backdrop-blur">
          <div>
            {title && <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-navy-50"
          >
            <IconClose width={18} height={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  )
}

export function Stat({ label, value, sub, accent = 'navy' }) {
  const accents = {
    navy: 'text-navy-700',
    teal: 'text-teal-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
  }
  return (
    <div className="card group p-5 transition-all duration-500 ease-spring hover:shadow-soft-lg hover:-translate-y-0.5">
      <p className="label">{label}</p>
      <p className={`nums mt-2 font-display text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {sub && <p className="mt-1 text-[13px] text-ink-muted">{sub}</p>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="label mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold text-ink sm:text-[28px]">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function Empty({ children }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-navy-900/10 py-10 text-center text-sm text-ink-muted">
      {children}
    </div>
  )
}
