import { useStore } from '../lib/store.jsx'
import { PageHeader, Stat } from '../components/ui.jsx'
import { fmtMoney, fmtDate, daysUntil, calcPremium, PIPELINES, STAGE_COLORS } from '../lib/domain.js'
import { IconArrowRight, IconCalendar, IconPremium, IconCertificate } from '../components/icons.jsx'

function AttentionRow({ tone, title, meta, onClick }) {
  const tones = {
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-navy-50"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <span className="h-2 w-2 rounded-full bg-current" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{title}</span>
        <span className="block truncate text-[12px] text-ink-muted">{meta}</span>
      </span>
      <IconArrowRight width={16} height={16} className="shrink-0 text-ink-muted transition-transform duration-300 ease-spring group-hover:translate-x-0.5" />
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

  // Attention feed
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

      {/* KPI bento */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Действующие полисы" value={activePolicies.length} sub={`${db.policies.length} всего`} accent="navy" />
        <Stat label="Сертификаты в работе" value={certsInWork.length} sub={`страх. сумма ${fmtMoney(insuredSum)}`} accent="teal" />
        <Stat label="Премия (оплачено)" value={fmtMoney(premiumPaid)} sub={`в ожидании ${fmtMoney(premiumPending)}`} accent="emerald" />
        <Stat label="Открытые убытки" value={openClaims.length} sub={`к возмещению ${fmtMoney(claimsOpenSum)}`} accent="rose" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Attention */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Требует внимания</h2>
            <span className="chip bg-navy-50 text-ink-soft">{attention.length}</span>
          </div>
          <div className="-mx-1 flex flex-col gap-0.5">
            {attention.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-muted">Всё под контролем 🌊</p>}
            {attention.map((a, i) => (
              <AttentionRow key={i} tone={a.tone} title={a.title} meta={a.meta} onClick={() => setView(a.view)} />
            ))}
          </div>
        </div>

        {/* Certificate funnel */}
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Воронка сертификатов</h2>
          <div className="space-y-3">
            {certStages.map((s) => {
              const c = STAGE_COLORS[s.color]
              const pct = Math.round((s.count / certTotal) * 100)
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {s.id}
                    </span>
                    <span className="nums font-semibold text-ink">{s.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-navy-50">
                    <div
                      className={`h-full rounded-full ${c.dot} transition-all duration-700 ease-spring`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
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
      className="card group flex items-center gap-4 p-4 text-left transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:shadow-soft-lg"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-teal-50 group-hover:text-teal-600">
        <Icon width={21} height={21} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block truncate text-[12px] text-ink-muted">{meta}</span>
      </span>
      <IconArrowRight width={17} height={17} className="ml-auto shrink-0 text-ink-muted transition-transform duration-300 ease-spring group-hover:translate-x-0.5" />
    </button>
  )
}
