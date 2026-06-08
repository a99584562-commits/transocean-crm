import { useState } from 'react'
import { PIPELINES, STAGE_COLORS } from '../lib/domain.js'

// Reusable kanban board with native HTML5 drag-and-drop between stages — styled
// after the РЦТО board (header above a soft drop zone, tinted accents).
export default function Kanban({ pipeline, items, onMove, renderCard, onCardClick }) {
  const stages = PIPELINES[pipeline].stages
  const [dragId, setDragId] = useState(null)
  const [overStage, setOverStage] = useState(null)

  const drop = (stageId) => {
    if (dragId != null) onMove(dragId, stageId)
    setDragId(null)
    setOverStage(null)
  }

  return (
    <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
      {stages.map((stage) => {
        const cards = items.filter((it) => it.stage === stage.id)
        const accent = STAGE_COLORS[stage.color]
        const isOver = overStage === stage.id
        return (
          <section key={stage.id} className="flex w-[300px] shrink-0 flex-col">
            {/* Stage header */}
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
              <h3 className="flex-1 truncate text-[13px] font-bold tracking-tight text-ink-900">{stage.id}</h3>
              <span className="nums grid min-w-[22px] place-items-center rounded-full bg-ink-900/[0.05] px-1.5 text-[11px] font-bold text-ink-500">
                {cards.length}
              </span>
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
              className={`flex flex-1 flex-col gap-2.5 rounded-3xl p-2 transition-colors duration-300 ${
                isOver ? 'bg-brand-500/[0.07] ring-2 ring-dashed ring-brand-500/40' : 'bg-ink-900/[0.025]'
              }`}
              style={{ minHeight: 120 }}
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
                  className={`group cursor-pointer select-none rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-ink-900/[0.04]
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
  )
}
