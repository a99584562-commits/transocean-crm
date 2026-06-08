import { useState } from 'react'
import { sourcesForEntity, FIELD_GROUPS } from '../lib/docs.js'
import { IconCheck } from './icons.jsx'

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch { /* noop */ }
    document.body.removeChild(ta)
  }
}

// onInsert(snippet) → insert mode; without it → copy mode.
export default function FieldCatalog({ entity, onInsert }) {
  const [hit, setHit] = useState(null)
  const insertMode = typeof onInsert === 'function'
  const sources = sourcesForEntity(entity)

  function act(tag) {
    const snippet = `{${tag}}`
    if (insertMode) onInsert(snippet)
    else copy(snippet)
    setHit(tag)
    setTimeout(() => setHit((h) => (h === tag ? null : h)), 1100)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-brand-50/70 px-3 py-2 text-[11px] font-medium leading-snug text-brand-800">
        {insertMode ? 'Нажмите на поле — метка вставится в текст в месте курсора.' : 'Нажмите на поле — метка скопируется. Вставьте её в свой Word-бланк.'}
      </div>
      {FIELD_GROUPS.map((group) => {
        const items = sources.filter((s) => s.group === group)
        if (!items.length) return null
        return (
          <div key={group}>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-400">{group}</div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((s) => {
                const active = hit === s.tag
                return (
                  <button
                    key={s.tag}
                    onClick={() => act(s.tag)}
                    title={`{${s.tag}}`}
                    className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 text-left text-[11.5px] font-semibold ring-1 transition-all active:scale-95 ${
                      active ? 'bg-emerald-50 text-emerald-700 ring-emerald-300' : 'bg-white text-ink-700 ring-ink-900/[0.08] hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-500/30'
                    }`}
                  >
                    <span className="truncate">{s.label}</span>
                    {active ? <IconCheck width={13} height={13} /> : <span className="font-mono text-[10px] text-ink-300 group-hover:text-brand-400">{`{${s.tag}}`}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
