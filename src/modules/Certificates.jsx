import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, IdChip, Modal, DetailModal, Field, BoardPage } from '../components/ui.jsx'
import CertificateDoc from '../components/CertificateDoc.jsx'
import { IconPlus, IconDoc, IconCheck, IconRoute } from '../components/icons.jsx'
import { fmtMoney, calcPremium, computeWording, uid, SEAS } from '../lib/domain.js'

function premiumCounted(cert) {
  return cert.stage !== 'Драфт' && cert.scanAttached
}

function CertCard({ cert, company, vessel }) {
  const premium = calcPremium(cert.sumInsured, cert.ratePct)
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <IdChip>{cert.number}</IdChip>
        <span className={`nums text-[13px] font-extrabold tracking-tight ${premiumCounted(cert) ? 'text-emerald-600' : 'text-ink-300'}`}>
          {fmtMoney(premium)}
        </span>
      </div>
      <h4 className="mt-2 truncate text-[14px] font-bold tracking-tight text-ink-900">{company?.name}</h4>
      <p className="mt-0.5 truncate text-[12px] font-medium text-ink-400">{cert.cargo}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-ink-900/[0.05] pt-2.5">
        {cert.seas.map((s) => (
          <Tag key={s} color="cyan">{s}</Tag>
        ))}
        {vessel && <span className="truncate text-[11px] font-medium text-ink-400">· {vessel.name}</span>}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="label mb-1">{label}</p>
      <p className="text-[13.5px] font-semibold text-ink-900">{value || '—'}</p>
    </div>
  )
}

function CertDetail({ cert, onClose, onOpenDoc }) {
  const { companyById, vesselById, policyById, update } = useStore()
  const company = companyById[cert.companyId]
  const vessel = vesselById[cert.vesselId]
  const policy = policyById[cert.policyId]
  const premium = calcPremium(cert.sumInsured, cert.ratePct)
  const wording = computeWording({ warCover: cert.warCover, seas: cert.seas })
  const counted = premiumCounted(cert)

  return (
    <DetailModal
      open
      onClose={onClose}
      idLabel={cert.number}
      eyebrow={cert.cargo}
      title={company?.name}
      metric={fmtMoney(premium)}
      metricSub="премия"
      pipeline="certificates"
      stage={cert.stage}
      onStage={(s) => update('certificates', cert.id, { stage: s })}
      footer={
        <div className="mx-auto flex max-w-[820px] justify-end">
          <button onClick={() => onOpenDoc(cert)} className="btn-primary">
            <IconDoc width={17} height={17} /> Сформировать сертификат
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-[820px] space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {cert.seas.map((s) => <Tag key={s} color="cyan">{s}</Tag>)}
          <Tag color={cert.warCover === 'full' ? 'rose' : cert.warCover === 'partial' ? 'amber' : 'slate'}>
            {cert.warCover === 'full' ? 'страхуем войну' : cert.warCover === 'partial' ? 'война частично' : 'без войны'}
          </Tag>
        </div>

        <div className="card p-4">
          <p className="label mb-1.5">Автозаполнение из источника</p>
          <p className="text-[13px] leading-relaxed text-ink-700">
            Создан из полиса <b>{policy?.number}</b>. Подтянуто: компания, страховщик, условия, даты. Из компании —
            индивидуальная ставка <b>{cert.ratePct}%</b>.
          </p>
        </div>

        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <Info label="Судно" value={vessel ? `${vessel.name} (${vessel.yearBuilt})` : '—'} />
          <Info label="Вес груза" value={`${cert.weight.toLocaleString('ru-RU')} MT`} />
          <Info label="Отправление" value={cert.placeOfShipment} />
          <Info label="Назначение" value={cert.placeOfDestination} />
          <Info label="Страховая сумма" value={`${fmtMoney(cert.sumInsured)} (100%)`} />
          <Info label="Ставка" value={`${cert.ratePct}%`} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-glow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100">Премия</p>
            <p className="nums text-[26px] font-extrabold tracking-tight">{fmtMoney(premium)}</p>
            <p className="text-[12px] font-medium text-brand-100">
              {fmtMoney(cert.sumInsured)} × {cert.ratePct}% · {counted ? 'учтена' : 'не учтена — нужен скан с печатью'}
            </p>
          </div>
          <button
            onClick={() => update('certificates', cert.id, { scanAttached: !cert.scanAttached })}
            className={`btn ${cert.scanAttached ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-white text-brand-700 hover:bg-brand-50'}`}
          >
            {cert.scanAttached ? <><IconCheck width={16} height={16} /> Скан прикреплён</> : 'Прикрепить скан'}
          </button>
        </div>

        <div className="card p-4">
          <div className="mb-1 flex items-center gap-2">
            <IconRoute width={16} height={16} className="text-brand-600" />
            <p className="label">Рекомендуемый вординг</p>
          </div>
          <p className="text-[14px] font-bold text-ink-900">{wording.title}</p>
          {wording.clauses.map((c, i) => (
            <p key={i} className="text-[12.5px] font-medium text-ink-500">• {c}</p>
          ))}
          {wording.notes.map((n, i) => (
            <p key={i} className="mt-1 text-[12.5px] font-semibold text-amber-600">⚠ {n}</p>
          ))}
        </div>
      </div>
    </DetailModal>
  )
}

function Auto({ label, value }) {
  return (
    <div>
      <p className="label mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-ink-900">{value || '—'}</p>
    </div>
  )
}

function NewCertModal({ open, onClose }) {
  const { db, add, policyById, companyById } = useStore()
  const firstPolicy = db.policies.find((p) => p.stage !== 'Закрыт') || db.policies[0]
  const [form, setForm] = useState({
    policyId: firstPolicy?.id,
    vesselId: db.vessels[0]?.id,
    cargo: 'WHEAT IN BULK',
    weight: 5000,
    sumInsured: 1500000,
    seas: ['ЧМ'],
    warCover: 'full',
  })

  const policy = policyById[form.policyId]
  const company = policy ? companyById[policy.companyId] : null
  const ratePct = company?.rate || 0.08
  const premium = calcPremium(Number(form.sumInsured), ratePct)
  const wording = computeWording({ warCover: form.warCover, seas: form.seas })

  const toggleSea = (s) =>
    setForm((f) => ({ ...f, seas: f.seas.includes(s) ? f.seas.filter((x) => x !== s) : [...f.seas, s] }))

  const save = () => {
    const n = db.certificates.length + 1
    add('certificates', {
      id: uid('ct'),
      number: `СТ-${String(n).padStart(2, '0')}/26`,
      policyId: form.policyId,
      companyId: policy.companyId,
      vesselId: form.vesselId,
      cargo: form.cargo,
      weight: Number(form.weight),
      sumInsured: Number(form.sumInsured),
      ratePct,
      placeOfShipment: 'Rostov-on-Don, Russia',
      placeOfDestination: 'Samsun, Türkiye',
      blNumber: '',
      blDate: '',
      seas: form.seas,
      warCover: form.warCover,
      stage: 'Драфт',
      scanAttached: false,
      beneficiary: 'TO ORDER',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Новый сертификат" subtitle="Данные автоматически тянутся из полиса и компании" wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Генеральный полис">
            <select className="field" value={form.policyId} onChange={(e) => setForm((f) => ({ ...f, policyId: e.target.value }))}>
              {db.policies.filter((p) => p.stage !== 'Закрыт').map((p) => (
                <option key={p.id} value={p.id}>{p.number} · {companyById[p.companyId]?.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Судно">
            <select className="field" value={form.vesselId} onChange={(e) => setForm((f) => ({ ...f, vesselId: e.target.value }))}>
              {db.vessels.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-canvas p-3 text-[12px] ring-1 ring-ink-900/[0.05] sm:grid-cols-3">
          <Auto label="Компания" value={company?.name} />
          <Auto label="Страховщик" value={policy?.insurer} />
          <Auto label="Ставка (инд.)" value={`${ratePct}%`} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Груз"><input className="field" value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))} /></Field>
          <Field label="Вес, MT"><input type="number" className="field nums" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} /></Field>
          <Field label="Страх. сумма, $"><input type="number" className="field nums" value={form.sumInsured} onChange={(e) => setForm((f) => ({ ...f, sumInsured: e.target.value }))} /></Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Моря маршрута">
            <div className="flex gap-1.5">
              {SEAS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSea(s.id)}
                  className={`btn flex-1 ${form.seas.includes(s.id) ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-500 ring-1 ring-ink-900/[0.06]'}`}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Покрытие войны">
            <select className="field" value={form.warCover} onChange={(e) => setForm((f) => ({ ...f, warCover: e.target.value }))}>
              <option value="full">Страхуем войну</option>
              <option value="none">Не страхуем войну</option>
              <option value="partial">Частично</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-glow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100">Расчётная премия</p>
            <p className="nums text-[26px] font-extrabold tracking-tight">{fmtMoney(premium)}</p>
          </div>
          <div className="text-right text-[12px] font-medium text-brand-100">
            <p>Вординг: <b className="text-white">{wording.title}</b></p>
            {wording.notes[0] && <p className="text-amber-200">⚠ {wording.notes[0]}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-ghost">Отмена</button>
          <button onClick={save} className="btn-primary">Создать сертификат</button>
        </div>
      </div>
    </Modal>
  )
}

export default function Certificates() {
  const { db, companyById, vesselById, policyById, moveStage } = useStore()
  const [selId, setSelId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [doc, setDoc] = useState(null)
  const selected = db.certificates.find((c) => c.id === selId)

  return (
    <BoardPage
      header={
        <PageHeader eyebrow="Операции" title="Сертификаты">
          <button onClick={() => setCreating(true)} className="btn-primary">
            <IconPlus width={17} height={17} /> Новый сертификат
          </button>
        </PageHeader>
      }
    >
      <Kanban
        pipeline="certificates"
        items={db.certificates}
        onMove={(id, stage) => moveStage('certificates', id, stage)}
        onCardClick={(c) => setSelId(c.id)}
        sumOf={(c) => calcPremium(c.sumInsured, c.ratePct)}
        renderCard={(c) => <CertCard cert={c} company={companyById[c.companyId]} vessel={vesselById[c.vesselId]} />}
      />

      {selected && <CertDetail cert={selected} onClose={() => setSelId(null)} onOpenDoc={(c) => { setSelId(null); setDoc(c) }} />}
      <NewCertModal open={creating} onClose={() => setCreating(false)} />

      <Modal open={!!doc} onClose={() => setDoc(null)} title="Сертификат страхования" subtitle="Шаблон Ингосстраха с подстановкой данных (маски)" wide>
        {doc && (
          <CertificateDoc
            cert={doc}
            company={companyById[doc.companyId]}
            vessel={vesselById[doc.vesselId]}
            policy={policyById[doc.policyId]}
          />
        )}
      </Modal>
    </BoardPage>
  )
}
