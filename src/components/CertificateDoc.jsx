import { fmtMoney, fmtDate, computeWording } from '../lib/domain.js'

// Renders an INGOSSTRAKH-style insurance certificate with data substituted from
// the certificate record — the "настроить маски" feature from the Miro board.
function Row({ n, label, value }) {
  return (
    <div className="grid grid-cols-[1.4rem_minmax(0,11rem)_1fr] gap-2 border-b border-navy-900/[0.06] py-1.5 text-[12px] leading-snug">
      <span className="text-ink-muted">{n}.</span>
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium text-ink">{value || '—'}</span>
    </div>
  )
}

export default function CertificateDoc({ cert, company, vessel, policy }) {
  const wording = computeWording({ warCover: cert.warCover, seas: cert.seas })
  const conditions = [policy?.conditions, ...(wording.clauses || [])].filter(Boolean)

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-navy-900/[0.08] sm:p-8">
      {/* Letterhead */}
      <div className="mb-5 flex items-start justify-between border-b-2 border-navy-900 pb-3">
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-navy-900">INGOSSTRAKH</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Insurance Public Joint-Stock Company</p>
        </div>
        <div className="text-right text-[11px] text-ink-muted">
          <p>Москва, ул. Пятницкая, 12</p>
          <p>www.ingos.ru</p>
        </div>
      </div>

      <div className="mb-4 text-center">
        <p className="font-display text-[15px] font-semibold uppercase tracking-wide text-navy-900">
          Certificate of Insurance № {cert.number}
        </p>
        <p className="text-[12px] text-ink-soft">
          Forming part of the General Policy № {policy?.number || '—'}
        </p>
      </div>

      <div className="rounded-xl bg-navy-50/40 px-4 py-2">
        <Row n="1" label="Insured" value={company?.name} />
        <Row n="2" label="Beneficiary" value={cert.beneficiary} />
        <Row n="3" label="Subject Matter Insured" value={cert.cargo} />
        <Row n="4" label="Weight of cargo" value={cert.weight ? `${cert.weight.toLocaleString('ru-RU')} MT` : ''} />
        <Row n="5" label="Sum insured" value={`${fmtMoney(cert.sumInsured)} (100%)`} />
        <Row n="6" label="Place of shipment" value={cert.placeOfShipment} />
        <Row n="7" label="Place of destination" value={cert.placeOfDestination} />
        <Row
          n="8"
          label="Name, year of the vessel"
          value={vessel ? `MV "${vessel.name.replace(/^MV /, '')}" (${vessel.yearBuilt}), IMO ${vessel.imo}` : ''}
        />
        <Row n="9" label="Number and date of B/L" value={cert.blNumber ? `${cert.blNumber} dd. ${fmtDate(cert.blDate)}` : 'не указан'} />
        <div className="grid grid-cols-[1.4rem_minmax(0,11rem)_1fr] gap-2 py-1.5 text-[12px] leading-snug">
          <span className="text-ink-muted">10.</span>
          <span className="text-ink-soft">Insurance Conditions</span>
          <span className="space-y-0.5 font-medium text-ink">
            {conditions.map((c, i) => (
              <span key={i} className="block">{c}</span>
            ))}
            <span className="mt-1 block text-[11px] font-normal text-teal-600">Вординг: {wording.title}</span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <p className="text-[11px] text-ink-muted">Дата выпуска: {fmtDate('2026-06-08')}</p>
        <div className="text-right">
          <div className="ml-auto mb-1 h-10 w-32 rounded border border-dashed border-navy-300/70 grid place-items-center text-[10px] text-navy-300">
            подпись / печать
          </div>
          <p className="text-[11px] text-ink-muted">INGOSSTRAKH</p>
        </div>
      </div>
    </div>
  )
}
