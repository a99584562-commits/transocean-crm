import { useState } from 'react'

// Simple client-side password gate for the demo. Not real security — just keeps
// the shared link from being opened by anyone. Change PASSWORD below if needed.
const PASSWORD = 'transocean2026'
const KEY = 'transocean-crm:auth'

export default function Gate({ children }) {
  const [ok, setOk] = useState(() => localStorage.getItem(KEY) === '1')
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (ok) return children

  const submit = (e) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === PASSWORD) {
      localStorage.setItem(KEY, '1')
      setOk(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-navy-900 px-5">
      {/* marine background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-navy-500/40 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        {/* Double-bezel card */}
        <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="rounded-[calc(2rem-0.375rem)] bg-navy-800/80 p-7 shadow-soft-lg ring-1 ring-white/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy-900 ring-1 ring-white/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27A8A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 2.5v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9v-5L12 3z" />
                  <path d="M9 11.5l2.2 2.2L15 9.8" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="font-display text-[17px] font-bold tracking-tight text-white">ТРАНСОУШЕН</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-teal-300">Marine Cargo Insurance</p>
              </div>
            </div>

            <p className="mb-1 font-display text-lg font-semibold text-white">Доступ к системе</p>
            <p className="mb-5 text-[13px] text-navy-100">Введите пароль, чтобы открыть демонстрацию.</p>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false) }}
                placeholder="Пароль"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-100/60
                  outline-none ring-1 transition-all duration-300 ease-spring focus:bg-white/10
                  ${error ? 'ring-rose-400' : 'ring-white/10 focus:ring-teal-400'}`}
              />
              {error && <p className="text-[12px] text-rose-300">Неверный пароль. Попробуйте ещё раз.</p>}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white
                  shadow-soft transition-all duration-300 ease-spring hover:bg-teal-400 active:scale-[0.98]"
              >
                Войти
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </button>
            </form>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-navy-100/50">Демонстрационная версия · конфиденциально</p>
      </div>
    </div>
  )
}
