import { useState } from 'react'
import { PIPELINES, STAGE_COLORS } from '../lib/domain.js'

// Reusable kanban board with native HTML5 drag-and-drop between stages.
// props:
//   pipeline  – key in PIPELINES
//   items     – array with a `stage` field
//   onMove(id, stage)
//   renderCard(item) → JSX
//   onCardClick(item)
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
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
      {stages.map((stage) => {
        const cards = items.filter((it) => it.stage === stage.id)
        const c = STAGE_COLORS[stage.color]
        const isOver = overStage === stage.id
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOverStage(stage.id)
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
            onDrop={() => drop(stage.id)}
            className={`flex w-[280px] shrink-0 flex-col rounded-2xl p-2 transition-colors duration-300 ease-spring
              ${isOver ? 'bg-teal-50 ring-1 ring-teal-300' : 'bg-navy-50/50'}`}
          >
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-[12px] font-semibold text-ink-soft">{stage.id}</span>
              </div>
              <span className="nums grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-ink-muted ring-1 ring-navy-900/[0.05]">
                {cards.length}
              </span>
            </div>

            <div className="flex min-h-[60px] flex-col gap-2">
              {cards.map((it) => (
                <div
                  key={it.id}
                  draggable
                  onDragStart={() => setDragId(it.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverStage(null)
                  }}
                  onClick={() => onCardClick?.(it)}
                  className={`cursor-pointer rounded-xl bg-surface p-3 shadow-soft ring-1 ring-navy-900/[0.05]
                    transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-soft-lg
                    ${dragId === it.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  {renderCard(it)}
                </div>
              ))}
              {cards.length === 0 && (
                <div className="grid place-items-center rounded-xl border border-dashed border-navy-900/10 py-5 text-[11px] text-ink-muted">
                  перетащите сюда
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
