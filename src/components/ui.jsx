import { useEffect } from 'react'
import { IconClose } from './icons.jsx'
import { ACCENTS, stageMeta } from '../lib/domain.js'

// Tinted pill — text in the accent colour, faint accent background (RCTO style).
export function Tag({ color = 'slate', hex, dot = false, children, className = '' }) {
  const c = hex || ACCENTS[color] || ACCENTS.slate
  return (
    <span className={`chip ${className}`} style={{ color: c, backgroundColor: c + '16' }}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />}
      {children}
    </span>
  )
}

// Monospace id/number chip, like the РЦТО deal-id pill.
export function IdChip({ children, className = '' }) {
  return (
    <span className={`rounded-md bg-ink-900/[0.05] px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-tight text-ink-500 ${className}`}>
      {children}
    </span>
  )
}

export function StageBadge({ pipeline, stage, className = '' }) {
  const m = stageMeta(pipeline, stage)
  return (
    <span className={`chip ${className}`} style={{ color: m.accent, backgroundColor: m.accent + '16' }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.accent }} />
      {stage}
    </span>
  )
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
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-[fade-up_0.3s_ease]" onClick={onClose} />
      <div
        className={`scroll-thin relative z-10 w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'} max-h-[92vh] overflow-y-auto
          rounded-t-4xl sm:rounded-4xl bg-surface shadow-lift ring-1 ring-ink-900/[0.06] animate-scale-in`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-900/[0.06] bg-surface/90 px-6 py-4 backdrop-blur">
          <div>
            {title && <h2 className="text-[17px] font-extrabold tracking-tight text-ink-900">{title}</h2>}
            {subtitle && <p className="text-[12.5px] font-medium text-ink-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700"
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
      {hint && <span className="mt-1 block text-[11px] font-medium text-ink-400">{hint}</span>}
    </label>
  )
}

export function Stat({ label, value, sub, accent = 'brand', icon: Icon }) {
  const c = ACCENTS[accent] || ACCENTS.brand
  return (
    <div className="card group p-5 transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="label">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ color: c, backgroundColor: c + '14' }}>
            <Icon width={17} height={17} />
          </span>
        )}
      </div>
      <p className="nums mt-2.5 text-[28px] font-extrabold leading-none tracking-tight text-ink-900">{value}</p>
      {sub && <p className="mt-1.5 text-[12.5px] font-medium text-ink-400">{sub}</p>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
        <h1 className="mt-0.5 text-[22px] font-extrabold tracking-tight text-ink-900 sm:text-[26px]">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function Empty({ children }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ink-900/10 py-10 text-center text-[13px] font-medium text-ink-400">
      {children}
    </div>
  )
}
