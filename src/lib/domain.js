// ── Domain logic for the TransOcean marine cargo-insurance CRM ────────────────
// Pure functions: pipeline definitions, formatting, premium / age calculations
// and the "wording" recommendation engine derived from the Miro decision tree.

export const TODAY = new Date('2026-06-08')

// ── Stage / accent colour tokens (hex) ───────────────────────────────────────
// Tinted-chip approach (RCTO style): text uses the hex, background uses hex+alpha.
export const ACCENTS = {
  slate: '#64748b',
  brand: '#0b60d8',
  navy: '#1e3a5f',
  sky: '#0284c7',
  teal: '#0d9488',
  amber: '#d97706',
  violet: '#7c5cfc',
  emerald: '#0f9d6e',
  rose: '#e1456b',
  cyan: '#0891b2',
  lime: '#65a30d',
}
// back-compat alias: name → hex
export const STAGE_COLORS = ACCENTS

// ── Pipelines (воронки) ──────────────────────────────────────────────────────
export const PIPELINES = {
  policies: {
    key: 'policies',
    title: 'Генеральные полисы',
    stages: [
      { id: 'Новый полис', color: 'slate' },
      { id: 'Полис оформлен', color: 'sky' },
      { id: '60 дней до окончания', color: 'amber' },
      { id: '30 дней до окончания', color: 'rose' },
      { id: 'Продлён', color: 'emerald' },
      { id: 'Закрыт', color: 'slate' },
    ],
  },
  certificates: {
    key: 'certificates',
    title: 'Сертификаты',
    stages: [
      { id: 'Драфт', color: 'slate' },
      { id: 'Выпущен', color: 'teal' },
      { id: 'Счёт выставлен', color: 'sky' },
      { id: 'Счёт оплачен', color: 'emerald' },
    ],
  },
  premiums: {
    key: 'premiums',
    title: 'Премии',
    stages: [
      { id: 'Новая премия', color: 'violet' },
      { id: 'Счёт выставлен', color: 'sky' },
      { id: 'Счёт оплачен', color: 'emerald' },
    ],
  },
  claims: {
    key: 'claims',
    title: 'Убытки',
    stages: [
      { id: 'Новый убыток', color: 'slate' },
      { id: 'Ожидание документов', color: 'amber' },
      { id: 'Отправлено в страховую', color: 'sky' },
      { id: 'Расчёт', color: 'violet' },
      { id: 'Претензия у страховой', color: 'cyan' },
      { id: 'Возмещён', color: 'emerald' },
      { id: 'Отказ', color: 'rose' },
    ],
  },
}

export function stageMeta(pipelineKey, stageId) {
  const p = PIPELINES[pipelineKey]
  const s = p?.stages.find((x) => x.id === stageId)
  const color = s?.color || 'slate'
  return { color, accent: ACCENTS[color] || ACCENTS.slate }
}

// ── Our legal entity (страховой брокер «Трансоушен») ─────────────────────────
export const OUR = {
  name: 'ООО «Трансоушен»',
  inn: '7704123456',
  address: '115035, г. Москва, ул. Садовническая, д. 14',
  phone: '+7 (495) 120-44-08',
}

// ── Insurers & seas ──────────────────────────────────────────────────────────
export const INSURERS = ['Ингосстрах', 'Альфастрахование', 'Энергогарант', 'АСТК', 'Энерго']
export const SEAS = [
  { id: 'АМ', name: 'Азовское море' },
  { id: 'ЧМ', name: 'Чёрное море' },
  { id: 'КМ', name: 'Каспийское море' },
]

// ── Formatting helpers ───────────────────────────────────────────────────────
export function fmtMoney(n, currency = 'USD') {
  if (n == null || isNaN(n)) return '—'
  const sign = currency === 'USD' ? '$' : currency === 'RUB' ? '₽' : ''
  return sign + Math.round(n).toLocaleString('ru-RU')
}

export function fmtDate(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function daysUntil(d, from = TODAY) {
  if (!d) return null
  const date = typeof d === 'string' ? new Date(d) : d
  return Math.round((date - from) / (1000 * 60 * 60 * 24))
}

export function vesselAge(yearBuilt, from = TODAY) {
  if (!yearBuilt) return null
  return from.getFullYear() - yearBuilt
}

export function uid(prefix = 'id') {
  return prefix + '-' + Math.floor(performance.now() * 1000).toString(36)
}

// premium = sum insured × rate(%) — what the board computes once a certificate is issued
export function calcPremium(sumInsured, ratePct) {
  if (!sumInsured || !ratePct) return 0
  return Math.round((sumInsured * ratePct) / 100)
}

// ── Wording engine (Miro page 14) ────────────────────────────────────────────
// Recommends the certificate "wording" (формулировку страхования) from the route
// seas, war coverage and whether the route passes military zones.
//
// input: {
//   warCover: 'full' | 'none' | 'partial',
//   seas: ['АМ'|'ЧМ'|'КМ'],          // seas on the route
//   passesWarZones: boolean,          // relevant when war is NOT covered
//   volume: number,                   // млн т, relevant for КМ + war
//   covered: ['ЧМ'|'КМ'...],          // relevant when partial
//   israel: boolean,
// }
export function computeWording(input) {
  const { warCover, seas = [], passesWarZones, volume, covered = [], israel } = input
  const has = (s) => seas.includes(s)
  const hasKM = has('КМ')

  if (israel) {
    return {
      title: 'Нет информации',
      status: 'none',
      clauses: [],
      notes: ['По Израилю информации нет — вординг не ставим.'],
    }
  }
  if (!seas.length) {
    return { title: 'Укажите моря маршрута', status: 'none', clauses: [], notes: [] }
  }

  if (warCover === 'full') {
    if (hasKM) {
      const r = {
        title: 'КМ + ЧМ (страхуем войну)',
        status: 'ok',
        clauses: [],
        notes: [],
      }
      if (volume > 2.5) {
        r.clauses.push('Гигантская оговорка (объём > 2,5)')
        r.clauses.push('+ РНПК (объём > 2,5)')
      } else {
        r.status = 'warn'
        r.notes.push('Объём ≤ 2,5 — вординг не определён. Уточнить у андеррайтера (открытый вопрос на схеме).')
      }
      return r
    }
    return {
      title: 'ЧМ (страхуем войну)',
      status: 'ok',
      clauses: ['Институтские оговорки + War Risks'],
      notes: [],
    }
  }

  if (warCover === 'none') {
    if (passesWarZones && hasKM) {
      return {
        title: 'КМ + ЧМ, войну не страхуем',
        status: 'ok',
        clauses: ['Стандартные институтские оговорки', 'Exclusion: War / Strikes'],
        notes: ['Маршрут проходит военные зоны — войну исключаем явной оговоркой.'],
      }
    }
    return {
      title: 'Стандартная (войну не страхуем)',
      status: 'ok',
      clauses: ['Institute Cargo Clauses (A)', 'Exclusion: War Risks'],
      notes: passesWarZones ? ['Маршрут проходит военные зоны без покрытия войны.'] : [],
    }
  }

  // partial
  if (warCover === 'partial') {
    if (!covered.length) {
      return { title: 'Укажите, что страхуем', status: 'none', clauses: [], notes: [] }
    }
    const needsClause = covered.includes('КМ')
    return {
      title: 'Страхуем ' + covered.join(' + ') + (seas.length > covered.length ? ' (частично)' : ''),
      status: needsClause ? 'warn' : 'ok',
      clauses: ['Покрытие ограничено: ' + covered.join(', ')],
      notes: needsClause ? ['Нужна индивидуальная оговорка (clause) по Каспию.'] : [],
    }
  }

  return { title: '—', status: 'none', clauses: [], notes: [] }
}

// What pipeline stage a policy should sit in, given auto-renew + expiry timer.
// Mirrors the Miro rule: auto-renew → stays "Полис оформлен"; otherwise a timer
// at 60/30 days before expiry advances the stage.
export function suggestPolicyStage(policy) {
  if (['Новый полис', 'Продлён', 'Закрыт'].includes(policy.stage)) return policy.stage
  if (policy.autoRenew) return 'Полис оформлен'
  const d = daysUntil(policy.endDate)
  if (d == null) return policy.stage
  if (d <= 30) return '30 дней до окончания'
  if (d <= 60) return '60 дней до окончания'
  return 'Полис оформлен'
}
