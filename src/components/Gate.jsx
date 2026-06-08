import { useState } from 'react'

// Client-side password gate for the demo. Not real security — just keeps the
// shared link from being opened by anyone. Change PASSWORD below if needed.
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
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#0a1730] px-5 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-500/25 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-teal-500/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="rounded-4xl bg-white/[0.04] p-1.5 ring-1 ring-white/10 backdrop-blur-xl">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0e1d3a]/80 p-7 shadow-soft-lg ring-1 ring-white/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-[15px] font-extrabold tracking-tight text-white shadow-glow">
                ТО
              </div>
              <div className="leading-tight">
                <p className="text-[16px] font-extrabold tracking-tight text-white">ТРАНСОУШЕН</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">Marine Cargo Insurance</p>
              </div>
            </div>

            <p className="mb-1 text-[18px] font-extrabold tracking-tight text-white">Доступ к системе</p>
            <p className="mb-5 text-[13px] font-medium text-white/55">Введите пароль, чтобы открыть демонстрацию.</p>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false) }}
                placeholder="Пароль"
                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-[14px] font-medium text-white placeholder:text-white/40
                  outline-none ring-1 transition-all duration-300 ease-spring focus:bg-white/10
                  ${error ? 'ring-rose-400' : 'ring-white/10 focus:ring-brand-400'}`}
              />
              {error && <p className="text-[12px] font-semibold text-rose-300">Неверный пароль. Попробуйте ещё раз.</p>}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-[14px] font-bold tracking-tight text-white
                  shadow-glow transition-all duration-300 ease-spring hover:bg-brand-500 active:scale-[0.98]"
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
        <p className="mt-4 text-center text-[11px] font-medium text-white/40">Демонстрационная версия · конфиденциально</p>
      </div>
    </div>
  )
}
