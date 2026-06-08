import { useStore } from '../lib/store.jsx'
import { PageHeader, Stat } from '../components/ui.jsx'
import { fmtMoney, fmtDate, daysUntil, PIPELINES, STAGE_COLORS, ACCENTS } from '../lib/domain.js'
import {
  IconArrowRight, IconCalendar, IconPremium, IconCertificate, IconPolicy, IconClaim,
} from '../components/icons.jsx'

function AttentionRow({ tone, title, meta, onClick }) {
  const c = ACCENTS[tone] || ACCENTS.slate
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-ink-900/[0.03]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: c + '16' }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold tracking-tight text-ink-900">{title}</span>
        <span className="block truncate text-[12px] font-medium text-ink-400">{meta}</span>
      </span>
      <IconArrowRight width={16} height={16} className="shrink-0 text-ink-300 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </button>
  )
}

export default function Dashboard({ setView }) {
  const { db, companyById, certById } = useStore()

  const activePolicies = db.policies.filter((p) => p.stage !== 'Закрыт')
  const certsInWork = db.certificates.filter((c) => c.stage !== 'Счёт оплачен')
  const premiumPaid = db.premiums.filter((p) => p.stage === 'Счёт оплачен').reduce((s, p) => s + p.amount, 0)
  const premiumPending = db.premiums.filter((p) => p.stage !== 'Счёт оплачен').reduce((s, p) => s + p.amount, 0)
  const openClaims = db.claims.filter((c) => !['Возмещён', 'Отказ'].includes(c.stage))
  const claimsOpenSum = openClaims.reduce((s, c) => s + c.claimAmount, 0)
  const insuredSum = db.certificates.reduce((s, c) => s + c.sumInsured, 0)

  const attention = []
  db.policies.forEach((p) => {
    if (!p.autoRenew && ['60 дней до окончания', '30 дней до окончания'].includes(p.stage)) {
      const d = daysUntil(p.endDate)
      attention.push({
        tone: d <= 30 ? 'rose' : 'amber',
        title: `Полис ${p.number} истекает через ${d} дн.`,
        meta: `${companyById[p.companyId]?.name} · автопродление выключено`,
        view: 'policies',
      })
    }
  })
  db.premiums.forEach((p) => {
    if (p.stage !== 'Счёт оплачен') {
      const d = daysUntil(p.dueDate)
      attention.push({
        tone: d != null && d <= 3 ? 'rose' : 'amber',
        title: `Премия ${p.number} — ${fmtMoney(p.amount)} к оплате`,
        meta: `${certById[p.certificateId]?.number} · срок ${fmtDate(p.dueDate)}`,
        view: 'premiums',
      })
    }
  })
  db.certificates.forEach((c) => {
    if (c.stage === 'Драфт' && !c.scanAttached) {
      attention.push({
        tone: 'teal',
        title: `Сертификат ${c.number}: нет скана с печатью`,
        meta: 'Премия не считается, пока не прикреплён скан',
        view: 'certificates',
      })
    }
  })
  attention.sort((a, b) => (a.tone === 'rose' ? -1 : 1))

  const certStages = PIPELINES.certificates.stages.map((s) => ({
    ...s,
    count: db.certificates.filter((c) => c.stage === s.id).length,
  }))
  const certTotal = db.certificates.length || 1

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Обзор · 8 июня 2026" title="Сводка по портфелю" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Действующие полисы" value={activePolicies.length} sub={`${db.policies.length} всего`} accent="brand" icon={IconPolicy} />
        <Stat label="Сертификаты в работе" value={certsInWork.length} sub={`страх. сумма ${fmtMoney(insuredSum)}`} accent="teal" icon={IconCertificate} />
        <Stat label="Премия (оплачено)" value={fmtMoney(premiumPaid)} sub={`в ожидании ${fmtMoney(premiumPending)}`} accent="emerald" icon={IconPremium} />
        <Stat label="Открытые убытки" value={openClaims.length} sub={`к возмещению ${fmtMoney(claimsOpenSum)}`} accent="rose" icon={IconClaim} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink-900">Требует внимания</h2>
            <span className="nums grid h-6 min-w-6 place-items-center rounded-full bg-ink-900/[0.05] px-2 text-[11px] font-bold text-ink-500">{attention.length}</span>
          </div>
          <div className="-mx-1 flex flex-col gap-0.5">
            {attention.length === 0 && <p className="px-3 py-6 text-center text-[13px] font-medium text-ink-400">Всё под контролем 🌊</p>}
            {attention.map((a, i) => (
              <AttentionRow key={i} tone={a.tone} title={a.title} meta={a.meta} onClick={() => setView(a.view)} />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-[15px] font-extrabold tracking-tight text-ink-900">Воронка сертификатов</h2>
          <div className="space-y-3.5">
            {certStages.map((s) => {
              const accent = STAGE_COLORS[s.color]
              const pct = Math.round((s.count / certTotal) * 100)
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 font-bold text-ink-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                      {s.id}
                    </span>
                    <span className="nums font-extrabold text-ink-900">{s.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]">
                    <div className="h-full rounded-full transition-all duration-700 ease-spring" style={{ width: `${pct}%`, backgroundColor: accent }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink icon={IconCertificate} title="Выпустить сертификат" meta="Автозаполнение из ген. полиса" onClick={() => setView('certificates')} />
        <QuickLink icon={IconPremium} title="Премии к оплате" meta={`${db.premiums.filter((p) => p.stage !== 'Счёт оплачен').length} счёта в ожидании`} onClick={() => setView('premiums')} />
        <QuickLink icon={IconCalendar} title="Подбор вординга" meta="Формулировка по маршруту" onClick={() => setView('wording')} />
      </div>
    </div>
  )
}

function QuickLink({ icon: Icon, title, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card group flex items-center gap-4 p-4 text-left transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon width={21} height={21} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold tracking-tight text-ink-900">{title}</span>
        <span className="block truncate text-[12px] font-medium text-ink-400">{meta}</span>
      </span>
      <IconArrowRight width={17} height={17} className="ml-auto shrink-0 text-ink-300 transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </button>
  )
}
