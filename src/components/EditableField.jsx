import { useEffect, useRef, useState } from 'react'
import { fmtMoney, fmtDate } from '../lib/domain.js'

// Inline-editable field. Click to edit; Enter/blur commits, Esc cancels.
// type: text | textarea | number | money | date | select | bool
// options (select): [{ value, label }]
export default function EditableField({ value, type = 'text', options = [], onChange, placeholder = '—', align = 'right' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)

  useEffect(() => setDraft(value), [value])
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select?.()
    }
  }, [editing])

  const num = (v) => (v === '' || v == null ? null : Number(v))
  const commit = (raw) => {
    setEditing(false)
    const v = type === 'number' || type === 'money' ? num(raw) : raw
    if (v !== value) onChange?.(v)
  }

  if (type === 'bool') {
    return (
      <button
        type="button"
        onClick={() => onChange?.(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ease-spring ${value ? 'bg-brand-600' : 'bg-ink-900/15'}`}
        aria-pressed={value}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-spring ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    )
  }

  const display = () => {
    if (value === '' || value == null) return placeholder
    if (type === 'money') return fmtMoney(value)
    if (type === 'date') return fmtDate(value)
    if (type === 'select') {
      const o = options.find((x) => String(x.value) === String(value))
      return o ? o.label : String(value)
    }
    return String(value)
  }

  const base = `w-full min-w-[120px] rounded-lg bg-white px-2.5 py-1 text-[13.5px] font-semibold text-ink-900 outline-none ring-1 ring-brand-500 ${align === 'right' ? 'text-right' : ''}`

  if (editing) {
    if (type === 'select') {
      return (
        <select ref={ref} value={value ?? ''} onChange={(e) => commit(e.target.value)} onBlur={() => setEditing(false)} className={base + ' !text-left'}>
          {options.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
        </select>
      )
    }
    if (type === 'textarea') {
      return (
        <textarea
          ref={ref}
          rows={3}
          value={draft ?? ''}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          className={base + ' resize-none !text-left leading-snug'}
        />
      )
    }
    return (
      <input
        ref={ref}
        type={type === 'date' ? 'date' : type === 'number' || type === 'money' ? 'number' : 'text'}
        value={draft ?? ''}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(draft)
          if (e.key === 'Escape') setEditing(false)
        }}
        placeholder={placeholder}
        className={base}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Изменить"
      className={`group/ef inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13.5px] font-semibold transition-colors duration-200 hover:bg-brand-50 ${value === '' || value == null ? 'text-ink-300' : 'text-ink-900'}`}
    >
      <span className="truncate">{display()}</span>
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-ink-300 opacity-0 transition-opacity group-hover/ef:opacity-100">
        <path d="M4 20h4L18 10l-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
