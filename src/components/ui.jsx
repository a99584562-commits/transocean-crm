import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './icons.jsx'
import { ACCENTS, PIPELINES, stageMeta } from '../lib/domain.js'

// Render overlays on <body> so `position: fixed` is relative to the viewport,
// never trapped by an ancestor `transform` (that was dimming only part of the screen).
export function Portal({ children }) {
  return createPortal(children, document.body)
}

// Lock body scroll + Esc-to-close while an overlay is open.
function useOverlay(open, onClose) {
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
}

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

// Chevron stage switcher (RCTO StageBar) — click a stage to move the record.
export function StageBar({ pipeline, stage, onMove }) {
  const stages = PIPELINES[pipeline].stages
  const idx = stages.findIndex((s) => s.id === stage)
  return (
    <div className="scroll-thin flex items-stretch overflow-x-auto pb-1">
      {stages.map((s, i) => {
        const accent = ACCENTS[s.color] || ACCENTS.slate
        const passed = i <= idx
        const isCurrent = i === idx
        const clip =
          i === 0
            ? 'polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%)'
            : 'polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%, 13px 50%)'
        return (
          <button
            key={s.id}
            onClick={() => onMove(s.id)}
            title={s.id}
            className={`relative h-9 shrink-0 whitespace-nowrap text-[11.5px] font-bold transition-all duration-200 hover:brightness-105 active:scale-[0.99] ${isCurrent ? 'z-10' : ''}`}
            style={{
              backgroundColor: passed ? accent : '#eef1f6',
              color: passed ? '#ffffff' : '#7a8296',
              clipPath: clip,
              marginLeft: i === 0 ? 0 : -10,
              paddingLeft: i === 0 ? 14 : 22,
              paddingRight: 16,
              boxShadow: isCurrent ? `0 6px 16px -6px ${accent}aa` : 'none',
            }}
          >
            {s.id}
          </button>
        )
      })}
    </div>
  )
}

// Small centred modal (create forms, simple dialogs). Portaled → dims full screen.
export function Modal({ open, onClose, children, title, subtitle, wide = false }) {
  useOverlay(open, onClose)
  if (!open) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[3px] animate-[fade-up_0.25s_ease]" onClick={onClose} />
        <div
          className={`scroll-thin relative z-10 w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'} max-h-[92vh] overflow-y-auto
            rounded-t-4xl sm:rounded-4xl bg-surface shadow-lift ring-1 ring-ink-900/[0.06] animate-scale-in`}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink-900/[0.06] bg-surface/95 px-6 py-4 backdrop-blur">
            <div>
              {title && <h2 className="text-[17px] font-extrabold tracking-tight text-ink-900">{title}</h2>}
              {subtitle && <p className="text-[12.5px] font-medium text-ink-400">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700">
              <IconClose width={18} height={18} />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </Portal>
  )
}

// Large record view (~92vh) — header + optional StageBar + scrollable body + footer.
export function DetailModal({ open, onClose, idLabel, eyebrow, title, metric, metricSub, pipeline, stage, onStage, children, footer }) {
  useOverlay(open, onClose)
  if (!open) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center p-0 sm:p-6">
        <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[3px] animate-[fade-up_0.25s_ease]" onClick={onClose} />
        <div className="relative flex h-[100dvh] w-full max-w-[1060px] flex-col overflow-hidden bg-canvas shadow-lift animate-scale-in sm:h-[92vh] sm:rounded-4xl">
          <header className="flex items-start gap-3 border-b border-ink-900/[0.06] bg-white px-5 py-3.5 sm:px-6 sm:py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {idLabel && <IdChip>{idLabel}</IdChip>}
                {eyebrow && <span className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">{eyebrow}</span>}
              </div>
              <h2 className="mt-1 truncate text-[19px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[21px]">{title}</h2>
            </div>
            {metric && (
              <div className="hidden shrink-0 text-right sm:block">
                <p className="nums text-[18px] font-extrabold tracking-tight text-brand-600">{metric}</p>
                {metricSub && <p className="text-[11px] font-semibold text-ink-400">{metricSub}</p>}
              </div>
            )}
            <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-700">
              <IconClose width={18} height={18} />
            </button>
          </header>

          {pipeline && stage && onStage && (
            <div className="scroll-thin shrink-0 overflow-x-auto border-b border-ink-900/[0.06] bg-white px-5 py-2.5 sm:px-6">
              <StageBar pipeline={pipeline} stage={stage} onMove={onStage} />
            </div>
          )}

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

          {footer && <div className="shrink-0 border-t border-ink-900/[0.06] bg-white px-5 py-3.5 sm:px-6">{footer}</div>}
        </div>
      </div>
    </Portal>
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

// ── Page layout wrappers ─────────────────────────────────────────────────────
// Scrollable page (dashboard, registries, tools).
export function Page({ children, max = '1200px' }) {
  return (
    <div className="scroll-thin h-full overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto animate-fade-up" style={{ maxWidth: max }}>
        {children}
      </div>
    </div>
  )
}

// Full-height board page: fixed header band + a board that fills the rest.
export function BoardPage({ header, children }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pb-3 pt-6 sm:px-8">{header}</div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
