import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, IdChip, Modal } from '../components/ui.jsx'
import { fmtMoney, fmtDate, daysUntil } from '../lib/domain.js'

function PremiumCard({ pr, cert, company }) {
  const d = daysUntil(pr.dueDate)
  const overdue = pr.stage !== 'Счёт оплачен' && d != null && d < 0
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <IdChip>{pr.number}</IdChip>
        <span className={`nums text-[13px] font-extrabold tracking-tight ${pr.stage === 'Счёт оплачен' ? 'text-emerald-600' : 'text-ink-900'}`}>
          {fmtMoney(pr.amount)}
        </span>
      </div>
      <h4 className="mt-2 truncate text-[14px] font-bold tracking-tight text-ink-900">{cert?.number}</h4>
      <p className="mt-0.5 truncate text-[12px] font-medium text-ink-400">{company?.name}</p>
      {pr.stage !== 'Счёт оплачен' && (
        <p className={`mt-2.5 border-t border-ink-900/[0.05] pt-2.5 text-[11px] font-semibold ${overdue ? 'text-rose-600' : 'text-ink-400'}`}>
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
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-glow">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100">Сумма премии</p>
                <p className="nums text-[26px] font-extrabold tracking-tight">{fmtMoney(sel.amount)}</p>
              </div>
              <p className="text-[12px] font-medium text-brand-100">срок {fmtDate(sel.dueDate)}</p>
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
