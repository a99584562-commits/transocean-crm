import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, Tag, IdChip, DetailModal, BoardPage } from '../components/ui.jsx'
import { fmtMoney } from '../lib/domain.js'

function ClaimCard({ cl, cert }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <IdChip>{cl.number}</IdChip>
        <span className="nums text-[13px] font-extrabold tracking-tight text-rose-600">{fmtMoney(cl.claimAmount)}</span>
      </div>
      <h4 className="mt-2 truncate text-[14px] font-bold tracking-tight text-ink-900">{cl.type}</h4>
      <p className="mt-0.5 truncate text-[12px] font-medium text-ink-400">{cert?.number} · {cl.insurer}</p>
      {!cl.docsComplete && (
        <div className="mt-2.5 border-t border-ink-900/[0.05] pt-2.5">
          <Tag color="amber" dot>нет документов</Tag>
        </div>
      )}
    </div>
  )
}

function Box({ label, value, accent = 'navy' }) {
  const c = { navy: 'text-ink-900', rose: 'text-rose-600', emerald: 'text-emerald-600' }[accent]
  return (
    <div className="rounded-2xl bg-canvas p-4 ring-1 ring-ink-900/[0.05]">
      <p className="label mb-1">{label}</p>
      <p className={`nums text-[20px] font-extrabold tracking-tight ${c}`}>{value}</p>
    </div>
  )
}

function ClaimDetail({ cl, cert, company, onClose, onStage }) {
  const franchise = cert ? Math.round((cert.sumInsured * cl.franchisePct) / 100) : 0
  const belowFranchise = cl.claimAmount < franchise
  return (
    <DetailModal
      open
      onClose={onClose}
      idLabel={cl.number}
      eyebrow={cl.insurer}
      title={cl.type}
      metric={fmtMoney(cl.claimAmount)}
      metricSub="заявлено"
      pipeline="claims"
      stage={cl.stage}
      onStage={onStage}
      footer={
        <div className="mx-auto flex max-w-[820px] flex-wrap justify-end gap-2">
          {belowFranchise && cl.stage !== 'Отказ' && (
            <button onClick={() => onStage('Отказ')} className="btn-ghost ring-1 ring-rose-200 text-rose-600">Закрыть отказом</button>
          )}
          {!belowFranchise && !['Возмещён', 'Отказ'].includes(cl.stage) && (
            <button onClick={() => onStage('Возмещён')} className="btn-primary">Отметить возмещённым</button>
          )}
        </div>
      }
    >
      <div className="mx-auto max-w-[820px] space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-ink-400">{company?.name}</span>
          {!cl.docsComplete && <Tag color="amber" dot>нет документов</Tag>}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Box label="Заявленный убыток" value={fmtMoney(cl.claimAmount)} />
          <Box label={`Франшиза (${cl.franchisePct}%)`} value={fmtMoney(franchise)} />
          <Box label="К возмещению" value={belowFranchise ? '—' : fmtMoney(cl.claimAmount)} accent={belowFranchise ? 'rose' : 'emerald'} />
        </div>

        <div className={`rounded-2xl p-4 ring-1 ${belowFranchise ? 'bg-rose-50 ring-rose-200' : 'bg-emerald-50 ring-emerald-200'}`}>
          <p className="text-[13.5px] leading-relaxed text-ink-700">
            {belowFranchise ? (
              <><b className="text-rose-700">Ниже франшизы.</b> Возмещение не положено — карточка закрывается отказом.</>
            ) : (
              <><b className="text-emerald-700">Выше франшизы.</b> Готовим заявление в страховую и претензионное письмо (claim letter).</>
            )}
          </p>
        </div>
      </div>
    </DetailModal>
  )
}

export default function Claims() {
  const { db, certById, companyById, moveStage } = useStore()
  const [selId, setSelId] = useState(null)

  const openSum = db.claims.filter((c) => !['Возмещён', 'Отказ'].includes(c.stage)).reduce((s, c) => s + c.claimAmount, 0)

  const sel = db.claims.find((c) => c.id === selId)
  const cert = sel ? certById[sel.certificateId] : null
  const company = cert ? companyById[cert.companyId] : null

  return (
    <BoardPage
      header={
        <PageHeader eyebrow="Финансы" title="Убытки">
          <div className="rounded-full bg-surface px-4 py-2 text-[13px] font-semibold shadow-soft ring-1 ring-ink-900/[0.06]">
            <span className="text-ink-400">В работе </span>
            <span className="nums font-extrabold text-rose-600">{fmtMoney(openSum)}</span>
          </div>
        </PageHeader>
      }
    >
      <Kanban
        pipeline="claims"
        items={db.claims}
        onMove={(id, stage) => moveStage('claims', id, stage)}
        onCardClick={(c) => setSelId(c.id)}
        sumOf={(c) => c.claimAmount}
        renderCard={(c) => <ClaimCard cl={c} cert={certById[c.certificateId]} />}
      />

      {sel && (
        <ClaimDetail
          cl={sel}
          cert={cert}
          company={company}
          onClose={() => setSelId(null)}
          onStage={(s) => moveStage('claims', sel.id, s)}
        />
      )}
    </BoardPage>
  )
}
