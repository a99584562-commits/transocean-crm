import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import Kanban from '../components/Kanban.jsx'
import { PageHeader, StageBadge, Tag, IdChip, Modal, DetailModal, Field, BoardPage, ViewToggle, ListView } from '../components/ui.jsx'
import GenerateDialog from '../components/GenerateDialog.jsx'
import { IconPlus, IconDoc, IconCheck, IconRoute } from '../components/icons.jsx'
import { fmtMoney, fmtDate, calcPremium, computeWording, uid, SEAS } from '../lib/domain.js'
import { CARGO_CONDITIONS, CANCEL_NOTICE_HOURS } from '../data/seed.js'

function premiumCounted(cert) {
  return cert.stage !== 'Драфт' && cert.scanAttached
}

// Source badge — mirrors the Miro stickies (откуда заполняется поле).
function Src({ type }) {
  const M = {
    policy: { t: 'из ген. полиса', c: 'brand' },
    company: { t: 'из компании', c: 'violet' },
    manual: { t: 'вручную', c: 'slate' },
    auto: { t: 'авто при создании', c: 'teal' },
    vessel: { t: 'из карточки судна', c: 'cyan' },
    link: { t: 'ссылка', c: 'amber' },
  }[type]
  if (!M) return null
  return <Tag color={M.c}>{M.t}</Tag>
}

function Row({ label, src, children }) {
  return (
    <div className="flex flex-col gap-1 border-t border-ink-900/[0.05] py-2.5 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] font-bold text-ink-500">{label}</span>
        <Src type={src} />
      </div>
      <div className="text-[13.5px] font-semibold text-ink-900 sm:max-w-[55%] sm:text-right">{children}</div>
    </div>
  )
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

function CertDetail({ cert, onClose, onGenerate }) {
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
          <button onClick={() => onGenerate(cert)} className="btn-primary">
            <IconDoc width={17} height={17} /> Сформировать документ
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-[860px] space-y-5">
        {/* Премия (вычисляется) + скан подписанного сертификата */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-glow">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100">Премия (расчёт)</p>
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

        {/* ПОЛЯ ДЛЯ СЕРТИФИКАТА */}
        <div className="card p-5">
          <p className="label mb-3">Поля для сертификата</p>
          <Row label="№ сертификата" src="policy">{cert.number}</Row>
          <Row label="Страхователь" src="policy">
            <div>
              <div>{company?.name}</div>
              <div className="text-[12px] font-medium text-ink-400">{company?.contactName} · {company?.contactPhone}</div>
            </div>
          </Row>
          <Row label="Выгодоприобретатель (Beneficiary)" src="auto">{cert.beneficiary}</Row>
          <Row label="Название груза" src="manual">{cert.cargo}</Row>
          <Row label="Вес" src="manual">{cert.weight.toLocaleString('ru-RU')} MT</Row>
          <Row label="Страховая сумма" src="manual">{fmtMoney(cert.sumInsured)} · {cert.currency}</Row>
          <Row label="%" src="company">{cert.ratePct}</Row>
          <Row label="Условия по страхованию грузов" src="manual">{cert.cargoConditions}</Row>
          <Row label="Место отгрузки" src="auto">{cert.placeOfShipment}</Row>
          <Row label="Место назначения" src="manual">{cert.placeOfDestination}</Row>
          <Row label="Судно" src="vessel">{vessel ? <Tag color="cyan">{vessel.name}</Tag> : '—'}</Row>
          <Row label="Название судна (автополе)" src="vessel">{vessel?.name}</Row>
          <Row label="IMO" src="vessel">{vessel?.imo}</Row>
          <Row label="Год постройки судна" src="vessel">{vessel?.yearBuilt}</Row>
          <Row label="Дата коносамента" src="manual">{cert.blDate ? fmtDate(cert.blDate) : '—'}</Row>
          <Row label="Номер коносамента" src="manual">{cert.blNumber || '—'}</Row>
          <Row label="Кол-во часов на уведомление о прекращении" src="manual">{cert.cancelNoticeHours}</Row>
          <Row label="Какое море пересекает судно" src="manual">
            <div className="flex flex-wrap justify-end gap-1">{cert.seas.map((s) => <Tag key={s} color="cyan">{s}</Tag>)}</div>
          </Row>
        </div>

        {/* ИНФОРМАЦИЯ ДЛЯ СЕРТИФИКАТА */}
        <div className="card p-5">
          <p className="label mb-3">Информация для сертификата</p>
          <Row label="Генеральный полис" src="policy">{policy ? <Tag color="brand">{policy.number}</Tag> : '—'}</Row>
          <Row label="№ ген полиса" src="policy">{policy?.number}</Row>
          <Row label="Дата начала действия полиса" src="policy">{policy ? fmtDate(policy.startDate) : '—'}</Row>
          <Row label="Дата окончания действия полиса" src="policy">{policy ? fmtDate(policy.endDate) : '—'}</Row>
          <Row label="Папка клиента" src="link">{cert.clientFolder || <span className="text-ink-300">не заполнено</span>}</Row>
          <Row label="Папка с сертификатами" src="link">{cert.certFolder || <span className="text-ink-300">не заполнено</span>}</Row>
        </div>

        {/* Вординг (расчёт) */}
        <div className="card p-4">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <IconRoute width={16} height={16} className="text-brand-600" />
            <p className="label">Рекомендуемый вординг</p>
            <Tag color={cert.warCover === 'full' ? 'rose' : cert.warCover === 'partial' ? 'amber' : 'slate'}>
              {cert.warCover === 'full' ? 'страхуем войну' : cert.warCover === 'partial' ? 'война частично' : 'без войны'}
            </Tag>
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
    cargoConditions: CARGO_CONDITIONS[0],
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
      currency: 'USD',
      cargoConditions: form.cargoConditions || CARGO_CONDITIONS[0],
      cancelNoticeHours: CANCEL_NOTICE_HOURS[0],
      clientFolder: '',
      certFolder: '',
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

        <Field label="Условия по страхованию грузов">
          <select className="field" value={form.cargoConditions} onChange={(e) => setForm((f) => ({ ...f, cargoConditions: e.target.value }))}>
            {CARGO_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>

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
  const { db, companyById, vesselById, moveStage } = useStore()
  const [selId, setSelId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [genId, setGenId] = useState(null)
  const [view, setView] = useState('kanban')
  const selected = db.certificates.find((c) => c.id === selId)
  const genRecord = db.certificates.find((c) => c.id === genId)

  const columns = [
    { key: 'num', label: '№', col: '0.85fr', render: (c) => <IdChip>{c.number}</IdChip> },
    { key: 'co', label: 'Компания', col: '1.5fr', render: (c) => <span className="block truncate text-[13.5px] font-bold text-ink-900">{companyById[c.companyId]?.name}</span> },
    { key: 'cargo', label: 'Груз', col: '1.2fr', render: (c) => <span className="block truncate text-[12.5px] font-semibold text-ink-500">{c.cargo}</span> },
    { key: 'vessel', label: 'Судно', col: '1.1fr', render: (c) => <span className="block truncate text-[12.5px] font-semibold text-ink-500">{vesselById[c.vesselId]?.name}</span> },
    { key: 'premium', label: 'Премия', col: '0.9fr', render: (c) => { const counted = premiumCounted(c); return <span className={`nums text-[13px] font-extrabold ${counted ? 'text-emerald-600' : 'text-ink-300'}`}>{fmtMoney(calcPremium(c.sumInsured, c.ratePct))}</span> } },
    { key: 'seas', label: 'Моря', col: '0.8fr', render: (c) => <div className="flex flex-wrap gap-1">{c.seas.map((s) => <Tag key={s} color="cyan">{s}</Tag>)}</div> },
    { key: 'stage', label: 'Стадия', col: '1.1fr', render: (c) => <StageBadge pipeline="certificates" stage={c.stage} /> },
  ]

  return (
    <BoardPage
      header={
        <PageHeader eyebrow="Операции" title="Сертификаты">
          <ViewToggle value={view} onChange={setView} />
          <button onClick={() => setCreating(true)} className="btn-primary">
            <IconPlus width={17} height={17} /> Новый сертификат
          </button>
        </PageHeader>
      }
    >
      {view === 'kanban' ? (
        <Kanban
          pipeline="certificates"
          items={db.certificates}
          onMove={(id, stage) => moveStage('certificates', id, stage)}
          onCardClick={(c) => setSelId(c.id)}
          sumOf={(c) => calcPremium(c.sumInsured, c.ratePct)}
          renderCard={(c) => <CertCard cert={c} company={companyById[c.companyId]} vessel={vesselById[c.vesselId]} />}
        />
      ) : (
        <ListView columns={columns} items={db.certificates} onRowClick={(c) => setSelId(c.id)} />
      )}

      {selected && <CertDetail cert={selected} onClose={() => setSelId(null)} onGenerate={(c) => { setSelId(null); setGenId(c.id) }} />}
      <NewCertModal open={creating} onClose={() => setCreating(false)} />
      <GenerateDialog open={!!genRecord} entity="certificate" record={genRecord} onClose={() => setGenId(null)} />
    </BoardPage>
  )
}
