import { useState } from 'react'
import { PIPELINES, STAGE_COLORS, fmtMoney } from '../lib/domain.js'

// Full-height kanban board with native HTML5 drag-and-drop — styled after the
// РЦТО board (columns fill the viewport height and scroll independently).
// props: pipeline, items, onMove(id,stage), renderCard(item), onCardClick(item),
//        sumOf?(item) → number  (shows a per-column total like РЦТО)
export default function Kanban({ pipeline, items, onMove, renderCard, onCardClick, sumOf }) {
  const stages = PIPELINES[pipeline].stages
  const [dragId, setDragId] = useState(null)
  const [overStage, setOverStage] = useState(null)

  const drop = (stageId) => {
    if (dragId != null) onMove(dragId, stageId)
    setDragId(null)
    setOverStage(null)
  }

  return (
    <div className="scroll-thin flex-1 overflow-x-auto overflow-y-hidden px-5 pb-5 sm:px-8">
      <div className="flex h-full min-w-max gap-3.5">
        {stages.map((stage) => {
          const cards = items.filter((it) => it.stage === stage.id)
          const accent = STAGE_COLORS[stage.color]
          const isOver = overStage === stage.id
          const total = sumOf ? cards.reduce((s, it) => s + (sumOf(it) || 0), 0) : 0
          return (
            <section key={stage.id} className="flex h-full w-[316px] shrink-0 flex-col">
              {/* Stage header */}
              <div className="mb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                  <h3 className="flex-1 truncate text-[13px] font-bold tracking-tight text-ink-900">{stage.id}</h3>
                  <span className="nums grid min-w-[22px] place-items-center rounded-full bg-ink-900/[0.05] px-1.5 text-[11px] font-bold text-ink-500">
                    {cards.length}
                  </span>
                </div>
                {sumOf && total > 0 && (
                  <p className="nums mt-1 pl-[18px] text-[11px] font-bold" style={{ color: accent }}>{fmtMoney(total)}</p>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!isOver) setOverStage(stage.id)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setOverStage((s) => (s === stage.id ? null : s))
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  drop(stage.id)
                }}
                className={`scroll-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-3xl p-2 transition-colors duration-300 ${
                  isOver ? 'bg-brand-500/[0.07] ring-2 ring-dashed ring-brand-500/40' : 'bg-ink-900/[0.025]'
                }`}
              >
                {cards.map((it) => (
                  <article
                    key={it.id}
                    draggable
                    onDragStart={() => setDragId(it.id)}
                    onDragEnd={() => {
                      setDragId(null)
                      setOverStage(null)
                    }}
                    onClick={() => onCardClick?.(it)}
                    className={`group shrink-0 cursor-pointer select-none rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-ink-900/[0.04]
                      transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-500/30
                      active:scale-[0.98] ${dragId === it.id ? 'dragging' : ''}`}
                  >
                    {renderCard(it)}
                  </article>
                ))}
                {cards.length === 0 && (
                  <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-ink-900/10 py-8 text-[11px] font-medium text-ink-300">
                    Перетащите сюда
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
