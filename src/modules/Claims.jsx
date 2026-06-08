import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, IdChip, Modal } from '../components/ui.jsx'
import { fmtMoney, fmtDate } from '../lib/domain.js'

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

export default function Claims() {
  const { db, certById, companyById, moveStage } = useStore()
  const [sel, setSel] = useState(null)

  const openSum = db.claims.filter((c) => !['Возмещён', 'Отказ'].includes(c.stage)).reduce((s, c) => s + c.claimAmount, 0)

  const cert = sel ? certById[sel.certificateId] : null
  const company = cert ? companyById[cert.companyId] : null
  const franchise = sel && cert ? Math.round((cert.sumInsured * sel.franchisePct) / 100) : 0
  const belowFranchise = sel ? sel.claimAmount < franchise : false

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Финансы" title="Убытки">
        <div className="rounded-full bg-surface px-4 py-2 text-sm shadow-soft ring-1 ring-navy-900/[0.06]">
          <span className="text-ink-muted">В работе </span>
          <span className="nums font-semibold text-rose-600">{fmtMoney(openSum)}</span>
        </div>
      </PageHeader>

      <Kanban
        pipeline="claims"
        items={db.claims}
        onMove={(id, stage) => moveStage('claims', id, stage)}
        onCardClick={setSel}
        renderCard={(c) => <ClaimCard cl={c} cert={certById[c.certificateId]} />}
      />

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.number} subtitle={cert ? `${cert.number} · ${company?.name}` : ''} wide>
        {sel && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge pipeline="claims" stage={sel.stage} />
              <Tag color="navy">{sel.insurer}</Tag>
              <Tag color="slate">{sel.type}</Tag>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Box label="Заявленный убыток" value={fmtMoney(sel.claimAmount)} />
              <Box label={`Франшиза (${sel.franchisePct}%)`} value={fmtMoney(franchise)} />
              <Box label="К возмещению" value={belowFranchise ? '—' : fmtMoney(sel.claimAmount)} accent={belowFranchise ? 'rose' : 'emerald'} />
            </div>

            {/* Franchise verdict, mirrors the Miro claim flow */}
            <div className={`rounded-2xl p-4 ring-1 ${belowFranchise ? 'bg-rose-50 ring-rose-200' : 'bg-emerald-50 ring-emerald-200'}`}>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {belowFranchise ? (
                  <><b className="text-rose-700">Ниже франшизы.</b> Возмещение не положено — карточка закрывается отказом.</>
                ) : (
                  <><b className="text-emerald-700">Выше франшизы.</b> Готовим заявление в страховую и претензионное письмо (claim letter).</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {belowFranchise && sel.stage !== 'Отказ' && (
                <button onClick={() => { moveStage('claims', sel.id, 'Отказ'); setSel({ ...sel, stage: 'Отказ' }) }} className="btn-ghost ring-1 ring-rose-200 text-rose-600">Закрыть отказом</button>
              )}
              {!belowFranchise && !['Возмещён', 'Отказ'].includes(sel.stage) && (
                <button onClick={() => { moveStage('claims', sel.id, 'Возмещён'); setSel({ ...sel, stage: 'Возмещён' }) }} className="btn-primary">Отметить возмещённым</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Box({ label, value, accent = 'navy' }) {
  const c = { navy: 'text-ink', rose: 'text-rose-600', emerald: 'text-emerald-600' }[accent]
  return (
    <div className="rounded-2xl bg-navy-50/60 p-4 ring-1 ring-navy-900/[0.05]">
      <p className="label mb-1">{label}</p>
      <p className={`nums font-display text-xl font-bold ${c}`}>{value}</p>
    </div>
  )
}
