import { useState } from 'react'
import { PageHeader } from '../components/ui.jsx'
import { computeWording, SEAS } from '../lib/domain.js'
import { IconRoute, IconCheck } from '../components/icons.jsx'

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex gap-1 rounded-full bg-navy-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-3 py-2 text-[13px] font-bold tracking-tight transition-all duration-300 ease-spring
            ${value === o.value ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-400 hover:text-ink-700'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SeaToggle({ active, seas, onToggle }) {
  return (
    <div className="flex gap-2">
      {SEAS.map((s) => (
        <button
          key={s.id}
          onClick={() => onToggle(s.id)}
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-3 text-center transition-all duration-300 ease-spring
            ${active.includes(s.id) ? 'bg-brand-600 text-white shadow-soft' : 'bg-canvas text-ink-500 ring-1 ring-ink-900/[0.05] hover:bg-ink-900/[0.04]'}`}
        >
          <span className="text-[17px] font-extrabold tracking-tight">{s.id}</span>
          <span className="text-[10px] font-semibold opacity-80">{s.name}</span>
        </button>
      ))}
    </div>
  )
}

export default function Wording() {
  const [warCover, setWarCover] = useState('full')
  const [seas, setSeas] = useState(['КМ', 'ЧМ'])
  const [passesWarZones, setPassesWarZones] = useState(true)
  const [volume, setVolume] = useState(3)
  const [covered, setCovered] = useState(['ЧМ'])
  const [israel, setIsrael] = useState(false)

  const toggle = (set) => (s) => set((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]))

  const result = computeWording({ warCover, seas, passesWarZones, volume, covered, israel })
  const statusMeta = {
    ok: { bg: 'bg-emerald-50', ring: 'ring-emerald-200', dot: 'bg-emerald-500', label: 'Готово к выпуску', text: 'text-emerald-700' },
    warn: { bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500', label: 'Требует уточнения', text: 'text-amber-700' },
    none: { bg: 'bg-slate-50', ring: 'ring-slate-200', dot: 'bg-slate-400', label: 'Недостаточно данных', text: 'text-slate-600' },
  }[result.status]

  const showWarZones = warCover === 'none'
  const showVolume = warCover === 'full' && seas.includes('КМ')
  const showCovered = warCover === 'partial'

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Инструменты" title="Подбор вординга">
        <span className="hidden text-[12px] text-ink-muted sm:inline">по дереву решений из методологии Трансоушен</span>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Controls */}
        <div className="card space-y-5 p-5">
          <div>
            <p className="label mb-2">Покрытие войны</p>
            <Segmented
              value={warCover}
              onChange={setWarCover}
              options={[
                { value: 'full', label: 'Страхуем' },
                { value: 'none', label: 'Не страхуем' },
                { value: 'partial', label: 'Частично' },
              ]}
            />
          </div>

          <div>
            <p className="label mb-2">Моря маршрута</p>
            <SeaToggle active={seas} seas={SEAS} onToggle={toggle(setSeas)} />
          </div>

          {showWarZones && (
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-navy-50/60 px-4 py-3 ring-1 ring-navy-900/[0.05] animate-fade-up">
              <span className="text-sm text-ink-soft">Маршрут проходит военные зоны</span>
              <input type="checkbox" checked={passesWarZones} onChange={(e) => setPassesWarZones(e.target.checked)} className="h-4 w-4 accent-teal-500" />
            </label>
          )}

          {showVolume && (
            <div className="animate-fade-up rounded-2xl bg-navy-50/60 px-4 py-3 ring-1 ring-navy-900/[0.05]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-ink-soft">Объём отгрузки</span>
                <span className="nums text-sm font-bold text-navy-700">{volume.toFixed(1)} млн т</span>
              </div>
              <input
                type="range" min="0.5" max="6" step="0.1" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <p className="mt-1 text-[11px] text-ink-muted">Порог 2,5 млн т — Гигантская оговорка и РНПК</p>
            </div>
          )}

          {showCovered && (
            <div className="animate-fade-up">
              <p className="label mb-2">Что страхуем (частично)</p>
              <SeaToggle active={covered} seas={SEAS} onToggle={toggle(setCovered)} />
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 ring-1 ring-navy-900/[0.05]">
            <span className="text-sm text-ink-soft">Направление — Израиль</span>
            <input type="checkbox" checked={israel} onChange={(e) => setIsrael(e.target.checked)} className="h-4 w-4 accent-teal-500" />
          </label>
        </div>

        {/* Result */}
        <div className="space-y-4">
          <div className={`card p-6 ring-1 ${statusMeta.ring} ${statusMeta.bg}`}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
              <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${statusMeta.text}`}>{statusMeta.label}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70 text-brand-600 shadow-soft">
                <IconRoute width={22} height={22} />
              </span>
              <div>
                <p className="label mb-0.5">Рекомендуемый вординг</p>
                <p className="text-[20px] font-extrabold leading-tight tracking-tight text-ink-900">{result.title}</p>
              </div>
            </div>
          </div>

          {result.clauses.length > 0 && (
            <div className="card p-5">
              <p className="label mb-3">Оговорки в сертификат</p>
              <ul className="space-y-2">
                {result.clauses.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-teal-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.notes.length > 0 && (
            <div className="card border-l-4 border-amber-400 p-5">
              <p className="label mb-2 text-amber-600">Внимание</p>
              {result.notes.map((n, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink-soft">{n}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="px-1 text-[12px] text-ink-muted">
        Логика построена по схеме «Сертификат → страхует/не страхует/частично войну → моря → военные зоны». Открытый
        вопрос со схемы (объём ≤ 2,5) подсвечивается как требующий решения андеррайтера.
      </p>
    </div>
  )
}
