import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, Tag, IdChip, DetailModal, BoardPage } from '../components/ui.jsx'
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

function PremiumDetail({ pr, cert, company, onClose, onStage }) {
  return (
    <DetailModal
      open
      onClose={onClose}
      idLabel={pr.number}
      eyebrow={cert?.number}
      title={company?.name || 'Премия'}
      metric={fmtMoney(pr.amount)}
      metricSub="к оплате"
      pipeline="premiums"
      stage={pr.stage}
      onStage={onStage}
    >
      <div className="mx-auto max-w-[640px] space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-glow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100">Сумма премии</p>
            <p className="nums text-[30px] font-extrabold tracking-tight">{fmtMoney(pr.amount)}</p>
          </div>
          <p className="text-[12px] font-medium text-brand-100">срок {fmtDate(pr.dueDate)}</p>
        </div>
        <p className="text-center text-[12.5px] font-medium text-ink-400">
          Перемещайте премию по стадиям полосой сверху: новая → счёт выставлен → оплачен.
        </p>
      </div>
    </DetailModal>
  )
}

export default function Premiums() {
  const { db, certById, companyById, moveStage } = useStore()
  const [selId, setSelId] = useState(null)

  const total = db.premiums.reduce((s, p) => s + p.amount, 0)
  const paid = db.premiums.filter((p) => p.stage === 'Счёт оплачен').reduce((s, p) => s + p.amount, 0)

  const sel = db.premiums.find((p) => p.id === selId)
  const cert = sel ? certById[sel.certificateId] : null
  const company = cert ? companyById[cert.companyId] : null

  return (
    <BoardPage
      header={
        <PageHeader eyebrow="Финансы" title="Премии">
          <div className="rounded-full bg-surface px-4 py-2 text-[13px] font-semibold shadow-soft ring-1 ring-ink-900/[0.06]">
            <span className="text-ink-400">Собрано </span>
            <span className="nums font-extrabold text-emerald-600">{fmtMoney(paid)}</span>
            <span className="text-ink-400"> / {fmtMoney(total)}</span>
          </div>
        </PageHeader>
      }
    >
      <Kanban
        pipeline="premiums"
        items={db.premiums}
        onMove={(id, stage) => moveStage('premiums', id, stage)}
        onCardClick={(p) => setSelId(p.id)}
        sumOf={(p) => p.amount}
        renderCard={(p) => <PremiumCard pr={p} cert={certById[p.certificateId]} company={companyById[certById[p.certificateId]?.companyId]} />}
      />

      {sel && (
        <PremiumDetail
          pr={sel}
          cert={cert}
          company={company}
          onClose={() => setSelId(null)}
          onStage={(s) => moveStage('premiums', sel.id, s)}
        />
      )}
    </BoardPage>
  )
}
