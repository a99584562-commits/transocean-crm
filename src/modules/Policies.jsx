import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, IdChip, Modal, DetailModal, Field, BoardPage, ViewToggle, ListView } from '../components/ui.jsx'
import GenerateDialog from '../components/GenerateDialog.jsx'
import { IconPlus, IconCalendar, IconDoc } from '../components/icons.jsx'
import { fmtDate, daysUntil, suggestPolicyStage, uid, INSURERS } from '../lib/domain.js'

function PolicyCard({ p, company }) {
  const d = daysUntil(p.endDate)
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <IdChip>{p.number}</IdChip>
        {p.autoRenew ? (
          <Tag color="emerald" dot>авто</Tag>
        ) : (
          <Tag color={d != null && d <= 30 ? 'rose' : d != null && d <= 60 ? 'amber' : 'slate'}>
            {d != null ? `${d} дн.` : 'ручное'}
          </Tag>
        )}
      </div>
      <h4 className="mt-2 truncate text-[14px] font-bold tracking-tight text-ink-900">{company?.name}</h4>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-400">
        <IconCalendar width={13} height={13} />
        до {fmtDate(p.endDate)}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-ink-900/[0.05] pt-2.5">
        <Tag color="brand">{p.insurer}</Tag>
      </div>
    </div>
  )
}

function Info({ label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="label mb-1">{label}</p>
      <p className="text-[13.5px] font-semibold text-ink-900">{value || '—'}</p>
    </div>
  )
}

function PolicyDetail({ p, onClose, onGenerate }) {
  const { companyById, update } = useStore()
  const company = companyById[p.companyId]
  const d = daysUntil(p.endDate)
  const suggested = suggestPolicyStage(p)
  return (
    <DetailModal
      open
      onClose={onClose}
      idLabel={p.number}
      eyebrow={p.insurer}
      title={company?.name}
      metric={`${p.baseRate}%`}
      metricSub="базовая ставка"
      pipeline="policies"
      stage={p.stage}
      onStage={(s) => update('policies', p.id, { stage: s })}
      footer={
        <div className="mx-auto flex max-w-[760px] justify-start">
          <button onClick={() => onGenerate(p)} className="btn-ghost ring-1 ring-ink-900/10"><IconDoc width={16} height={16} /> Сформировать документ</button>
        </div>
      }
    >
      <div className="mx-auto max-w-[760px] space-y-5">
        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <Info label="Груз" value={p.cargo} />
          <Info label="Базовая ставка" value={`${p.baseRate}%`} />
          <Info label="Начало действия" value={fmtDate(p.startDate)} />
          <Info label="Окончание" value={`${fmtDate(p.endDate)} (${d} дн.)`} />
          <Info label="Условия страхования" value={p.conditions} full />
        </div>

        <div className="card p-5">
          <p className="label mb-2">Правило стадии (как на схеме)</p>
          <p className="text-[13.5px] leading-relaxed text-ink-700">
            {p.autoRenew ? (
              <>Поле <b>«автопродление»</b> включено — полис остаётся на стадии <b>«Полис оформлен»</b> до закрытия.</>
            ) : (
              <>Автопродление выключено — таймер двигает стадию на <b>«60 дней»</b>, затем <b>«30 дней»</b> до окончания. Рекомендуемая стадия сейчас: <b>{suggested}</b>.</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => update('policies', p.id, { autoRenew: !p.autoRenew })} className="btn-ghost ring-1 ring-ink-900/10">
              {p.autoRenew ? 'Выключить автопродление' : 'Включить автопродление'}
            </button>
            {!p.autoRenew && suggested !== p.stage && (
              <button onClick={() => update('policies', p.id, { stage: suggested })} className="btn-teal">
                Применить стадию «{suggested}»
              </button>
            )}
          </div>
        </div>
      </div>
    </DetailModal>
  )
}

function NewPolicyModal({ open, onClose }) {
  const { db, add, companyById } = useStore()
  const [form, setForm] = useState({
    companyId: db.companies[0]?.id,
    insurer: INSURERS[0],
    cargo: 'Wheat in bulk',
    endDate: '2027-06-01',
    autoRenew: false,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }))
  const save = () => {
    const n = db.policies.length + 1
    add('policies', {
      id: uid('gp'),
      number: `ГП-2026/${String(100 + n)}`,
      companyId: form.companyId,
      insurer: form.insurer,
      cargo: form.cargo,
      startDate: '2026-06-08',
      endDate: form.endDate,
      autoRenew: form.autoRenew,
      stage: 'Новый полис',
      baseRate: companyById[form.companyId]?.rate || 0.08,
      conditions: 'Institute Cargo Clauses (A)',
    })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Новый генеральный полис">
      <div className="space-y-4">
        <Field label="Компания">
          <select className="field" value={form.companyId} onChange={set('companyId')}>
            {db.companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Страховщик">
            <select className="field" value={form.insurer} onChange={set('insurer')}>
              {INSURERS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Окончание">
            <input type="date" className="field" value={form.endDate} onChange={set('endDate')} />
          </Field>
        </div>
        <Field label="Груз">
          <input className="field" value={form.cargo} onChange={set('cargo')} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-canvas px-3.5 py-3 ring-1 ring-ink-900/[0.05]">
          <input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm((f) => ({ ...f, autoRenew: e.target.checked }))} className="h-4 w-4 accent-brand-600" />
          <span className="text-[13px] font-semibold text-ink-700">Автопродление</span>
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost">Отмена</button>
          <button onClick={save} className="btn-primary">Создать полис</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Policies() {
  const { db, companyById, moveStage } = useStore()
  const [selId, setSelId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [genId, setGenId] = useState(null)
  const [view, setView] = useState('kanban')
  const selected = db.policies.find((p) => p.id === selId)
  const genRecord = db.policies.find((p) => p.id === genId)

  const columns = [
    { key: 'num', label: '№', col: '0.9fr', render: (p) => <IdChip>{p.number}</IdChip> },
    { key: 'co', label: 'Компания', col: '1.7fr', render: (p) => <span className="block truncate text-[13.5px] font-bold text-ink-900">{companyById[p.companyId]?.name}</span> },
    { key: 'ins', label: 'Страховщик', col: '1.1fr', render: (p) => <Tag color="brand">{p.insurer}</Tag> },
    { key: 'end', label: 'Окончание', col: '1.2fr', render: (p) => { const d = daysUntil(p.endDate); return <span className="text-[12.5px] font-semibold text-ink-500">{fmtDate(p.endDate)}{d != null ? ` · ${d} дн.` : ''}</span> } },
    { key: 'auto', label: 'Продление', col: '0.9fr', render: (p) => (p.autoRenew ? <Tag color="emerald" dot>авто</Tag> : <Tag color="slate">ручное</Tag>) },
    { key: 'stage', label: 'Стадия', col: '1.2fr', render: (p) => <StageBadge pipeline="policies" stage={p.stage} /> },
  ]

  return (
    <BoardPage
      header={
        <PageHeader eyebrow="Операции" title="Генеральные полисы">
          <ViewToggle value={view} onChange={setView} />
          <button onClick={() => setCreating(true)} className="btn-primary">
            <IconPlus width={17} height={17} /> Новый полис
          </button>
        </PageHeader>
      }
    >
      {view === 'kanban' ? (
        <Kanban
          pipeline="policies"
          items={db.policies}
          onMove={(id, stage) => moveStage('policies', id, stage)}
          onCardClick={(p) => setSelId(p.id)}
          renderCard={(p) => <PolicyCard p={p} company={companyById[p.companyId]} />}
        />
      ) : (
        <ListView columns={columns} items={db.policies} onRowClick={(p) => setSelId(p.id)} />
      )}

      {selected && <PolicyDetail p={selected} onClose={() => setSelId(null)} onGenerate={(p) => { setSelId(null); setGenId(p.id) }} />}
      <NewPolicyModal open={creating} onClose={() => setCreating(false)} />
      <GenerateDialog open={!!genRecord} entity="policy" record={genRecord} onClose={() => setGenId(null)} />
    </BoardPage>
  )
}
