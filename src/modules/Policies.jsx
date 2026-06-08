import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, Modal, Field } from '../components/ui.jsx'
import { IconPlus, IconCalendar } from '../components/icons.jsx'
import { fmtDate, daysUntil, suggestPolicyStage, uid, INSURERS } from '../lib/domain.js'

function PolicyCard({ p, company }) {
  const d = daysUntil(p.endDate)
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">{p.number}</p>
          <p className="truncate text-[12px] text-ink-muted">{company?.name}</p>
        </div>
        {p.autoRenew ? (
          <Tag color="emerald">авто</Tag>
        ) : (
          <Tag color={d != null && d <= 30 ? 'rose' : d != null && d <= 60 ? 'amber' : 'slate'}>
            {d != null ? `${d} дн.` : 'ручное'}
          </Tag>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <IconCalendar width={13} height={13} />
        до {fmtDate(p.endDate)}
      </div>
      <div className="flex items-center gap-1">
        <Tag color="navy">{p.insurer}</Tag>
      </div>
    </div>
  )
}

function PolicyModal({ p, onClose }) {
  const { companyById, update } = useStore()
  if (!p) return null
  const company = companyById[p.companyId]
  const d = daysUntil(p.endDate)
  const suggested = suggestPolicyStage(p)
  return (
    <Modal open={!!p} onClose={onClose} title={p.number} subtitle={company?.name} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StageBadge pipeline="policies" stage={p.stage} />
          <Tag color="navy">{p.insurer}</Tag>
          {p.autoRenew && <Tag color="emerald">автопродление</Tag>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Груз" value={p.cargo} />
          <Info label="Базовая ставка" value={`${p.baseRate}%`} />
          <Info label="Начало действия" value={fmtDate(p.startDate)} />
          <Info label="Окончание" value={`${fmtDate(p.endDate)} (${d} дн.)`} />
          <Info label="Условия страхования" value={p.conditions} full />
        </div>

        {/* Auto-renew rule card */}
        <div className="rounded-2xl bg-navy-50/70 p-4 ring-1 ring-navy-900/[0.05]">
          <p className="label mb-2">Правило стадии (как на схеме)</p>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {p.autoRenew ? (
              <>Поле <b>«автопродление»</b> включено — полис остаётся на стадии <b>«Полис оформлен»</b> до закрытия.</>
            ) : (
              <>Автопродление выключено — таймер двигает стадию на <b>«60 дней»</b>, затем <b>«30 дней»</b> до окончания. Рекомендуемая стадия сейчас: <b>{suggested}</b>.</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => update('policies', p.id, { autoRenew: !p.autoRenew })}
              className="btn-ghost ring-1 ring-navy-900/10"
            >
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
    </Modal>
  )
}

function Info({ label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="label mb-1">{label}</p>
      <p className="text-sm text-ink">{value || '—'}</p>
    </div>
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
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-navy-50/60 px-3.5 py-3 ring-1 ring-navy-900/[0.05]">
          <input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm((f) => ({ ...f, autoRenew: e.target.checked }))} className="h-4 w-4 accent-teal-500" />
          <span className="text-sm text-ink-soft">Автопродление</span>
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
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Операции" title="Генеральные полисы">
        <button onClick={() => setCreating(true)} className="btn-primary">
          <IconPlus width={17} height={17} /> Новый полис
        </button>
      </PageHeader>

      <Kanban
        pipeline="policies"
        items={db.policies}
        onMove={(id, stage) => moveStage('policies', id, stage)}
        onCardClick={setSelected}
        renderCard={(p) => <PolicyCard p={p} company={companyById[p.companyId]} />}
      />

      <PolicyModal p={selected} onClose={() => setSelected(null)} />
      <NewPolicyModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
