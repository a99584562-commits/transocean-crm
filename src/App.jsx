import { useState } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import Gate from './components/Gate.jsx'
import {
  IconDashboard, IconPolicy, IconCertificate, IconVessel,
  IconPremium, IconClaim, IconWording, IconSearch, IconReset, IconBell,
} from './components/icons.jsx'
import Dashboard from './modules/Dashboard.jsx'
import Policies from './modules/Policies.jsx'
import Certificates from './modules/Certificates.jsx'
import Vessels from './modules/Vessels.jsx'
import Premiums from './modules/Premiums.jsx'
import Claims from './modules/Claims.jsx'
import Wording from './modules/Wording.jsx'

const NAV = [
  { id: 'dashboard', label: 'Обзор', icon: IconDashboard, group: 'Главное' },
  { id: 'policies', label: 'Ген. полисы', icon: IconPolicy, group: 'Операции' },
  { id: 'certificates', label: 'Сертификаты', icon: IconCertificate, group: 'Операции' },
  { id: 'vessels', label: 'Суда', icon: IconVessel, group: 'Операции' },
  { id: 'premiums', label: 'Премии', icon: IconPremium, group: 'Финансы' },
  { id: 'claims', label: 'Убытки', icon: IconClaim, group: 'Финансы' },
  { id: 'wording', label: 'Подбор вординга', icon: IconWording, group: 'Инструменты' },
]

const VIEWS = {
  dashboard: Dashboard,
  policies: Policies,
  certificates: Certificates,
  vessels: Vessels,
  premiums: Premiums,
  claims: Claims,
  wording: Wording,
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 shadow-soft">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27A8A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5L12 3z" />
          <path d="M9 11.5l2.2 2.2L15 9.8" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-bold tracking-tight text-ink">ТРАНСОУШЕН</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">Marine Cargo Insurance</p>
      </div>
    </div>
  )
}

function Sidebar({ view, setView }) {
  const groups = [...new Set(NAV.map((n) => n.group))]
  return (
    <aside className="hidden w-[244px] shrink-0 flex-col gap-1 border-r border-navy-900/[0.06] bg-surface/70 px-4 py-6 lg:flex">
      <div className="px-2 pb-6">
        <Brand />
      </div>
      <nav className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g}>
            <p className="label px-3 pb-2">{g}</p>
            <div className="flex flex-col gap-0.5">
              {NAV.filter((n) => n.group === g).map((n) => {
                const active = view === n.id
                const Icon = n.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => setView(n.id)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-spring
                      ${active ? 'bg-navy-900 text-white shadow-soft' : 'text-ink-soft hover:bg-navy-50'}`}
                  >
                    <Icon
                      width={19}
                      height={19}
                      className={`transition-colors ${active ? 'text-teal-300' : 'text-ink-muted group-hover:text-navy-600'}`}
                    />
                    {n.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto px-2 pt-6">
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-4 text-white shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-300">Демо-версия</p>
          <p className="mt-1.5 text-[13px] leading-snug text-navy-100">
            Прототип системы. Данные демонстрационные, изменения сохраняются локально.
          </p>
        </div>
      </div>
    </aside>
  )
}

function MobileNav({ view, setView }) {
  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-1 overflow-x-auto border-t border-navy-900/[0.06] bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
      {NAV.map((n) => {
        const active = view === n.id
        const Icon = n.icon
        return (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors
              ${active ? 'text-navy-900' : 'text-ink-muted'}`}
          >
            <Icon width={20} height={20} className={active ? 'text-teal-500' : ''} />
            {n.label}
          </button>
        )
      })}
    </div>
  )
}

function Topbar() {
  const { reset } = useStore()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-navy-900/[0.06] bg-canvas/80 px-5 py-3.5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <Brand />
      </div>
      <div className="relative hidden flex-1 max-w-md lg:block">
        <IconSearch width={17} height={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          placeholder="Поиск по сертификатам, судам, компаниям…"
          className="field !rounded-full !bg-surface pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (confirm('Сбросить демо-данные к исходному состоянию?')) reset()
          }}
          className="btn-ghost !px-3"
          title="Сбросить демо-данные"
        >
          <IconReset width={17} height={17} />
          <span className="hidden sm:inline">Сброс</span>
        </button>
        <button className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-navy-50">
          <IconBell width={18} height={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-canvas" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500 text-[13px] font-bold text-white shadow-soft">
          ТО
        </div>
      </div>
    </header>
  )
}

function Shell() {
  const [view, setView] = useState('dashboard')
  const View = VIEWS[view]
  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      <Sidebar view={view} setView={setView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[1180px] animate-fade-up" key={view}>
            <View setView={setView} />
          </div>
        </main>
        <MobileNav view={view} setView={setView} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Gate>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </Gate>
  )
}
