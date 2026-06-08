import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, Modal } from '../components/ui.jsx'
import { fmtMoney, fmtDate, daysUntil } from '../lib/domain.js'

function PremiumCard({ pr, cert, company }) {
  const d = daysUntil(pr.dueDate)
  const overdue = pr.stage !== 'Счёт оплачен' && d != null && d < 0
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">{pr.number}</p>
          <p className="truncate text-[12px] text-ink-muted">{cert?.number} · {company?.name}</p>
        </div>
        <Tag color={pr.stage === 'Счёт оплачен' ? 'emerald' : 'violet'}>{fmtMoney(pr.amount)}</Tag>
      </div>
      {pr.stage !== 'Счёт оплачен' && (
        <p className={`text-[11px] ${overdue ? 'text-rose-600' : 'text-ink-muted'}`}>
          срок оплаты {fmtDate(pr.dueDate)}{overdue ? ' · просрочено' : ''}
        </p>
      )}
    </div>
  )
}

export default function Premiums() {
  const { db, certById, companyById, moveStage } = useStore()
  const [sel, setSel] = useState(null)

  const total = db.premiums.reduce((s, p) => s + p.amount, 0)
  const paid = db.premiums.filter((p) => p.stage === 'Счёт оплачен').reduce((s, p) => s + p.amount, 0)

  const cert = sel ? certById[sel.certificateId] : null
  const company = cert ? companyById[cert.companyId] : null

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Финансы" title="Премии">
        <div className="rounded-full bg-surface px-4 py-2 text-sm shadow-soft ring-1 ring-navy-900/[0.06]">
          <span className="text-ink-muted">Собрано </span>
          <span className="nums font-semibold text-emerald-600">{fmtMoney(paid)}</span>
          <span className="text-ink-muted"> / {fmtMoney(total)}</span>
        </div>
      </PageHeader>

      <Kanban
        pipeline="premiums"
        items={db.premiums}
        onMove={(id, stage) => moveStage('premiums', id, stage)}
        onCardClick={setSel}
        renderCard={(p) => <PremiumCard pr={p} cert={certById[p.certificateId]} company={companyById[certById[p.certificateId]?.companyId]} />}
      />

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.number} subtitle={cert ? `${cert.number} · ${company?.name}` : ''}>
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <StageBadge pipeline="premiums" stage={sel.stage} />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-4 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-300">Сумма премии</p>
                <p className="nums font-display text-2xl font-bold">{fmtMoney(sel.amount)}</p>
              </div>
              <p className="text-[12px] text-navy-100">срок {fmtDate(sel.dueDate)}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {sel.stage === 'Новая премия' && (
                <button onClick={() => { moveStage('premiums', sel.id, 'Счёт выставлен'); setSel({ ...sel, stage: 'Счёт выставлен' }) }} className="btn-ghost ring-1 ring-navy-900/10">Выставить счёт</button>
              )}
              {sel.stage !== 'Счёт оплачен' && (
                <button onClick={() => { moveStage('premiums', sel.id, 'Счёт оплачен'); setSel({ ...sel, stage: 'Счёт оплачен' }) }} className="btn-primary">Отметить оплаченным</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
