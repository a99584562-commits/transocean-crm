import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { Modal, IdChip } from './ui.jsx'
import { previewText, downloadFilled, ENTITY_LABELS } from '../lib/docs.js'
import { IconDoc, IconCheck } from './icons.jsx'

// Pick a template for `entity`, preview it filled from `record`, download .docx.
export default function GenerateDialog({ open, onClose, entity, record }) {
  const store = useStore()
  const templates = store.db.templates.filter((t) => t.entity === entity)
  const [pickId, setPick] = useState(templates[0]?.id)
  const tpl = templates.find((t) => t.id === pickId) || templates[0]

  const text = useMemo(() => {
    if (!tpl || !record) return ''
    try { return previewText(tpl, record, store) } catch (e) { return 'Ошибка: ' + (e?.message || e) }
  }, [tpl, record, store])

  return (
    <Modal open={open} onClose={onClose} title="Сформировать документ" subtitle={`${ENTITY_LABELS[entity]} ${record?.number || ''}`} wide>
      {templates.length === 0 ? (
        <p className="rounded-xl bg-amber-50 px-3 py-3 text-[13px] font-medium text-amber-700">
          Для этого типа карточек пока нет шаблонов. Создайте их в разделе «Шаблоны».
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[230px_1fr]">
          {/* Template list */}
          <div className="space-y-1.5">
            <p className="label mb-1">Шаблон</p>
            {templates.map((t) => {
              const active = t.id === tpl?.id
              return (
                <button
                  key={t.id}
                  onClick={() => setPick(t.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold ring-1 transition-all ${
                    active ? 'bg-brand-50 text-brand-700 ring-brand-500/30' : 'bg-white text-ink-700 ring-ink-900/[0.06] hover:bg-ink-900/[0.03]'
                  }`}
                >
                  <IconDoc width={16} height={16} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{t.name}</span>
                  {active && <IconCheck width={15} height={15} className="shrink-0 text-brand-600" />}
                </button>
              )
            })}
          </div>

          {/* Preview */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="label">Предпросмотр с подстановкой</p>
              <IdChip>{record?.number}</IdChip>
            </div>
            <pre className="scroll-thin max-h-[46vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-canvas p-4 font-mono text-[11.5px] leading-relaxed text-ink-700 ring-1 ring-ink-900/[0.06]">
              {text}
            </pre>
            <div className="mt-3 flex justify-end">
              <button onClick={() => downloadFilled(tpl, record, store)} className="btn-primary">
                <IconDoc width={16} height={16} /> Скачать .docx
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
