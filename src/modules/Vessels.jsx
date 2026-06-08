import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { PageHeader, Tag, Modal, Field, Page } from '../components/ui.jsx'
import { IconPlus, IconVessel } from '../components/icons.jsx'
import { vesselAge, uid } from '../lib/domain.js'

function ageTone(age) {
  if (age == null) return 'slate'
  if (age >= 20) return 'rose'
  if (age >= 15) return 'amber'
  return 'emerald'
}

function NewVesselModal({ open, onClose }) {
  const { add } = useStore()
  const [form, setForm] = useState({ name: '', imo: '', yearBuilt: 2015, flag: 'Россия', type: 'Bulk carrier' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const age = vesselAge(Number(form.yearBuilt))
  const save = () => {
    add('vessels', {
      id: uid('v'),
      name: form.name.startsWith('MV') ? form.name : `MV ${form.name}`,
      imo: form.imo,
      yearBuilt: Number(form.yearBuilt),
      flag: form.flag,
      type: form.type,
    })
    onClose()
    setForm({ name: '', imo: '', yearBuilt: 2015, flag: 'Россия', type: 'Bulk carrier' })
  }
  return (
    <Modal open={open} onClose={onClose} title="Новое судно">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Название"><input className="field" placeholder="Kavkaz" value={form.name} onChange={set('name')} /></Field>
          <Field label="IMO"><input className="field nums" placeholder="9123456" value={form.imo} onChange={set('imo')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Год постройки" hint={age != null ? `возраст считается автоматически: ${age} лет` : ''}>
            <input type="number" className="field nums" value={form.yearBuilt} onChange={set('yearBuilt')} />
          </Field>
          <Field label="Флаг"><input className="field" value={form.flag} onChange={set('flag')} /></Field>
        </div>
        <Field label="Тип"><input className="field" value={form.type} onChange={set('type')} /></Field>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost">Отмена</button>
          <button onClick={save} disabled={!form.name || !form.imo} className="btn-primary">Добавить судно</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Vessels() {
  const { db } = useStore()
  const [creating, setCreating] = useState(false)

  const certCount = (vId) => db.certificates.filter((c) => c.vesselId === vId).length

  return (
    <Page>
      <div className="space-y-6">
      <PageHeader eyebrow="Операции" title="Реестр судов">
        <button onClick={() => setCreating(true)} className="btn-primary">
          <IconPlus width={17} height={17} /> Новое судно
        </button>
      </PageHeader>

      <div className="card overflow-hidden p-0">
        {/* header */}
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-navy-900/[0.06] px-5 py-3 sm:grid">
          <span className="label">Судно</span>
          <span className="label">IMO</span>
          <span className="label">Возраст</span>
          <span className="label">Флаг</span>
          <span className="label text-right">Серт.</span>
        </div>
        {db.vessels.map((v, i) => {
          const age = vesselAge(v.yearBuilt)
          return (
            <div
              key={v.id}
              className="grid grid-cols-2 gap-3 px-5 py-4 transition-colors hover:bg-navy-50/50 sm:grid-cols-[2fr_1fr_1fr_1fr_0.8fr] sm:items-center sm:gap-4"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(10,31,51,0.05)' }}
            >
              <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <IconVessel width={20} height={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold tracking-tight text-ink-900">{v.name}</p>
                  <p className="truncate text-[12px] font-medium text-ink-400">{v.type}</p>
                </div>
              </div>
              <p className="nums font-mono text-[13px] font-medium text-ink-500"><span className="label mr-2 sm:hidden">IMO</span>{v.imo}</p>
              <div><Tag color={ageTone(age)} dot>{age} лет · {v.yearBuilt}</Tag></div>
              <p className="text-[13px] font-semibold text-ink-700">{v.flag}</p>
              <p className="nums text-[14px] font-extrabold text-ink-900 sm:text-right">{certCount(v.id)}</p>
            </div>
          )
        })}
      </div>

      <p className="px-1 text-[12px] text-ink-muted">
        Возраст судна считается автоматически на текущую дату. Суда старше 15 лет подсвечиваются — повышенный риск при андеррайтинге.
      </p>

      <NewVesselModal open={creating} onClose={() => setCreating(false)} />
      </div>
    </Page>
  )
}
