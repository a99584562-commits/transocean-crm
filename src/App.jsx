import { useState } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import Gate from './components/Gate.jsx'
import {
  IconDashboard, IconPolicy, IconCertificate, IconVessel,
  IconPremium, IconClaim, IconWording, IconSearch, IconReset, IconDoc,
} from './components/icons.jsx'
import Dashboard from './modules/Dashboard.jsx'
import Policies from './modules/Policies.jsx'
import Certificates from './modules/Certificates.jsx'
import Vessels from './modules/Vessels.jsx'
import Premiums from './modules/Premiums.jsx'
import Claims from './modules/Claims.jsx'
import Wording from './modules/Wording.jsx'
import Templates from './modules/Templates.jsx'

const NAV = [
  { id: 'dashboard', label: 'Обзор', icon: IconDashboard, group: 'Главное' },
  { id: 'policies', label: 'Ген. полисы', icon: IconPolicy, group: 'Операции' },
  { id: 'certificates', label: 'Сертификаты', icon: IconCertificate, group: 'Операции' },
  { id: 'vessels', label: 'Суда', icon: IconVessel, group: 'Операции' },
  { id: 'premiums', label: 'Премии', icon: IconPremium, group: 'Финансы' },
  { id: 'claims', label: 'Убытки', icon: IconClaim, group: 'Финансы' },
  { id: 'templates', label: 'Шаблоны', icon: IconDoc, group: 'Инструменты' },
  { id: 'wording', label: 'Подбор вординга', icon: IconWording, group: 'Инструменты' },
]

const VIEWS = {
  dashboard: Dashboard,
  policies: Policies,
  certificates: Certificates,
  vessels: Vessels,
  premiums: Premiums,
  claims: Claims,
  templates: Templates,
  wording: Wording,
}

function Logo({ size = 'md' }) {
  const dim = size === 'sm' ? 'h-9 w-9 text-[14px]' : 'h-10 w-10 text-[15px]'
  return (
    <div className="flex items-center gap-3">
      <div className={`grid ${dim} place-items-center rounded-2xl bg-brand-600 font-extrabold tracking-tight text-white shadow-glow`}>
        ТО
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-ink-900">ТРАНСОУШЕН</div>
        <div className="text-[10.5px] font-semibold text-ink-400">Marine Cargo Insurance</div>
      </div>
    </div>
  )
}

function Sidebar({ view, setView }) {
  const { reset } = useStore()
  const groups = [...new Set(NAV.map((n) => n.group))]
  return (
    <aside className="hidden w-[236px] shrink-0 flex-col border-r border-ink-900/[0.06] bg-white lg:flex">
      <div className="px-5 py-4">
        <Logo />
      </div>

      <nav className="scroll-thin flex-1 space-y-4 overflow-y-auto px-3 py-2">
        {groups.map((g) => (
          <div key={g}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-300">{g}</p>
            <div className="space-y-1">
              {NAV.filter((n) => n.group === g).map((n) => {
                const active = view === n.id
                const Icon = n.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => setView(n.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-300 ease-spring active:scale-[0.98]
                      ${active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-900/[0.04]'}`}
                  >
                    <span className={`grid h-7 w-7 place-items-center rounded-xl transition-colors
                      ${active ? 'bg-brand-600 text-white' : 'text-ink-400 group-hover:text-ink-700'}`}>
                      <Icon width={17} height={17} />
                    </span>
                    <span className="flex-1 text-[13.5px] font-bold tracking-tight">{n.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-900/[0.06] p-3">
        <div className="rounded-2xl bg-canvas px-3.5 py-3 ring-1 ring-ink-900/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">Демо-версия</p>
          <p className="mt-1 text-[11.5px] font-medium leading-snug text-ink-400">
            Данные демонстрационные, правки сохраняются локально.
          </p>
        </div>
        <button
          onClick={() => { if (confirm('Сбросить демо-данные к исходным?')) reset() }}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <IconReset width={15} height={15} />
          Сбросить демо
        </button>
      </div>
    </aside>
  )
}

function MobileNav({ view, setView }) {
  return (
    <div className="scroll-thin sticky bottom-0 z-30 flex items-center gap-1 overflow-x-auto border-t border-ink-900/[0.06] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {NAV.map((n) => {
        const active = view === n.id
        const Icon = n.icon
        return (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold transition-colors
              ${active ? 'text-brand-700' : 'text-ink-400'}`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${active ? 'bg-brand-600 text-white' : ''}`}>
              <Icon width={18} height={18} />
            </span>
            {n.label}
          </button>
        )
      })}
    </div>
  )
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-ink-900/[0.06] bg-canvas/85 px-5 py-3 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <Logo size="sm" />
      </div>
      <div className="relative hidden flex-1 max-w-md lg:block">
        <IconSearch width={16} height={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          placeholder="Поиск по сертификатам, судам, компаниям…"
          className="w-full rounded-full bg-white py-2 pl-10 pr-3 text-[13px] font-medium text-ink-900 shadow-soft outline-none ring-1 ring-ink-900/[0.05] transition-all duration-300 placeholder:text-ink-300 focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-soft ring-1 ring-ink-900/[0.05] sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-bold text-ink-700">Демо</span>
        </span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[12px] font-extrabold text-white shadow-soft">
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
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      <Sidebar view={view} setView={setView} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <View key={view} setView={setView} />
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
