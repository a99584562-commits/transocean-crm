import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import InspectModule from 'docxtemplater/js/inspect-module.js'
import { saveAs } from 'file-saver'
import {
  OUR, fmtMoney, fmtDate, calcPremium, computeWording, vesselAge,
} from './domain.js'

// ── Field catalog ────────────────────────────────────────────────────────────
// Each source: { path, tag, label, group, scope:[entity...], money? }
// `scope` controls which template entity types expose the field.
const CERT = ['certificate', 'claim']
const ALL = ['certificate', 'claim', 'policy']

export const FIELD_SOURCES = [
  // Сертификат
  { path: 'cert.number', tag: 'номер_сертификата', label: '№ сертификата', group: 'Сертификат', scope: CERT },
  { path: 'cert.cargo', tag: 'груз', label: 'Груз', group: 'Сертификат', scope: CERT },
  { path: 'cert.weight', tag: 'вес', label: 'Вес груза, MT', group: 'Сертификат', scope: CERT },
  { path: 'cert.sumInsured', tag: 'страховая_сумма', label: 'Страховая сумма', group: 'Сертификат', scope: CERT, money: true },
  { path: 'cert.ratePct', tag: 'ставка', label: 'Ставка, %', group: 'Сертификат', scope: CERT },
  { path: 'cert.premium', tag: 'премия', label: 'Премия', group: 'Сертификат', scope: CERT, money: true },
  { path: 'cert.placeOfShipment', tag: 'порт_отгрузки', label: 'Порт отгрузки', group: 'Сертификат', scope: CERT },
  { path: 'cert.placeOfDestination', tag: 'порт_назначения', label: 'Порт назначения', group: 'Сертификат', scope: CERT },
  { path: 'cert.blNumber', tag: 'номер_коносамента', label: '№ коносамента', group: 'Сертификат', scope: CERT },
  { path: 'cert.blDate', tag: 'дата_коносамента', label: 'Дата коносамента', group: 'Сертификат', scope: CERT },
  { path: 'cert.beneficiary', tag: 'выгодоприобретатель', label: 'Выгодоприобретатель', group: 'Сертификат', scope: CERT },
  { path: 'cert.warCover', tag: 'покрытие_войны', label: 'Покрытие войны', group: 'Сертификат', scope: CERT },
  { path: 'cert.seas', tag: 'моря', label: 'Моря маршрута', group: 'Сертификат', scope: CERT },
  { path: 'cert.wording', tag: 'вординг', label: 'Вординг (формулировка)', group: 'Сертификат', scope: CERT },
  // Компания
  { path: 'company.name', tag: 'страхователь', label: 'Страхователь', group: 'Компания', scope: ALL },
  { path: 'company.inn', tag: 'инн', label: 'ИНН', group: 'Компания', scope: ALL },
  { path: 'company.country', tag: 'страна', label: 'Страна', group: 'Компания', scope: ALL },
  // Судно
  { path: 'vessel.name', tag: 'судно', label: 'Судно', group: 'Судно', scope: CERT },
  { path: 'vessel.imo', tag: 'imo', label: 'IMO', group: 'Судно', scope: CERT },
  { path: 'vessel.yearBuilt', tag: 'год_постройки', label: 'Год постройки', group: 'Судно', scope: CERT },
  { path: 'vessel.age', tag: 'возраст_судна', label: 'Возраст судна', group: 'Судно', scope: CERT },
  { path: 'vessel.flag', tag: 'флаг', label: 'Флаг', group: 'Судно', scope: CERT },
  // Полис
  { path: 'policy.number', tag: 'номер_полиса', label: '№ ген. полиса', group: 'Полис', scope: ALL },
  { path: 'policy.insurer', tag: 'страховщик', label: 'Страховщик', group: 'Полис', scope: ALL },
  { path: 'policy.startDate', tag: 'начало_полиса', label: 'Начало полиса', group: 'Полис', scope: ALL },
  { path: 'policy.endDate', tag: 'окончание_полиса', label: 'Окончание полиса', group: 'Полис', scope: ALL },
  { path: 'policy.conditions', tag: 'условия', label: 'Условия страхования', group: 'Полис', scope: ALL },
  // Убыток
  { path: 'claim.number', tag: 'номер_убытка', label: '№ убытка', group: 'Убыток', scope: ['claim'] },
  { path: 'claim.type', tag: 'тип_убытка', label: 'Тип убытка', group: 'Убыток', scope: ['claim'] },
  { path: 'claim.claimAmount', tag: 'сумма_убытка', label: 'Сумма убытка', group: 'Убыток', scope: ['claim'], money: true },
  { path: 'claim.franchisePct', tag: 'франшиза_процент', label: 'Франшиза, %', group: 'Убыток', scope: ['claim'] },
  { path: 'claim.franchise', tag: 'франшиза_сумма', label: 'Франшиза, сумма', group: 'Убыток', scope: ['claim'], money: true },
  { path: 'claim.insurer', tag: 'страховщик_убытка', label: 'Страховщик (убыток)', group: 'Убыток', scope: ['claim'] },
  // Трансоушен
  { path: 'our.name', tag: 'наше_юл', label: 'Наше юр. лицо', group: 'Трансоушен', scope: ALL },
  { path: 'our.inn', tag: 'наш_инн', label: 'Наш ИНН', group: 'Трансоушен', scope: ALL },
  { path: 'our.address', tag: 'наш_адрес', label: 'Наш адрес', group: 'Трансоушен', scope: ALL },
  { path: 'our.phone', tag: 'наш_телефон', label: 'Наш телефон', group: 'Трансоушен', scope: ALL },
  // Дата
  { path: 'today', tag: 'дата', label: 'Сегодняшняя дата', group: 'Дата', scope: ALL },
]

export const FIELD_GROUPS = ['Сертификат', 'Судно', 'Компания', 'Полис', 'Убыток', 'Трансоушен', 'Дата']

export const ENTITY_LABELS = { certificate: 'Сертификат', claim: 'Убыток', policy: 'Ген. полис' }

export function sourcesForEntity(entity) {
  return FIELD_SOURCES.filter((s) => s.scope.includes(entity))
}
const sourceByTag = Object.fromEntries(FIELD_SOURCES.map((s) => [s.tag, s]))
const sourceByPath = Object.fromEntries(FIELD_SOURCES.map((s) => [s.path, s]))

// Auto-map detected tags to a field whose tag matches, if valid for the entity.
export function buildAutoMapping(tags, entity) {
  const mapping = {}
  for (const tag of tags) {
    const src = sourceByTag[tag]
    if (src && src.scope.includes(entity)) mapping[tag] = src.path
  }
  return mapping
}

// ── Context + value resolution ───────────────────────────────────────────────
const WAR_LABEL = { full: 'страхуем войну', none: 'войну не страхуем', partial: 'война частично' }

export function buildContext(entity, record, store) {
  const { companyById, vesselById, policyById, certById } = store
  let cert = null, claim = null, policy = null, company = null, vessel = null
  if (entity === 'certificate') {
    cert = record
    company = companyById[cert.companyId]
    vessel = vesselById[cert.vesselId]
    policy = policyById[cert.policyId]
  } else if (entity === 'claim') {
    claim = record
    cert = certById[claim.certificateId]
    company = cert ? companyById[cert.companyId] : null
    vessel = cert ? vesselById[cert.vesselId] : null
    policy = cert ? policyById[cert.policyId] : null
  } else if (entity === 'policy') {
    policy = record
    company = companyById[policy.companyId]
  }
  return { cert, claim, policy, company, vessel, our: OUR, today: fmtDate('2026-06-08') }
}

function valueForPath(path, ctx) {
  const { cert, claim, policy, company, vessel, our, today } = ctx
  const money = sourceByPath[path]?.money
  const M = (v) => (v == null ? '' : fmtMoney(v))
  switch (path) {
    case 'cert.number': return cert?.number || ''
    case 'cert.cargo': return cert?.cargo || ''
    case 'cert.weight': return cert ? `${cert.weight.toLocaleString('ru-RU')} MT` : ''
    case 'cert.sumInsured': return cert ? M(cert.sumInsured) : ''
    case 'cert.ratePct': return cert ? `${cert.ratePct}%` : ''
    case 'cert.premium': return cert ? M(calcPremium(cert.sumInsured, cert.ratePct)) : ''
    case 'cert.placeOfShipment': return cert?.placeOfShipment || ''
    case 'cert.placeOfDestination': return cert?.placeOfDestination || ''
    case 'cert.blNumber': return cert?.blNumber || '—'
    case 'cert.blDate': return cert?.blDate ? fmtDate(cert.blDate) : '—'
    case 'cert.beneficiary': return cert?.beneficiary || ''
    case 'cert.warCover': return WAR_LABEL[cert?.warCover] || ''
    case 'cert.seas': return (cert?.seas || []).join(', ')
    case 'cert.wording': return cert ? computeWording({ warCover: cert.warCover, seas: cert.seas }).title : ''
    case 'company.name': return company?.name || ''
    case 'company.inn': return company?.inn || ''
    case 'company.country': return company?.country || ''
    case 'vessel.name': return vessel ? `MV "${vessel.name.replace(/^MV /, '')}"` : ''
    case 'vessel.imo': return vessel?.imo || ''
    case 'vessel.yearBuilt': return vessel ? String(vessel.yearBuilt) : ''
    case 'vessel.age': return vessel ? `${vesselAge(vessel.yearBuilt)} лет` : ''
    case 'vessel.flag': return vessel?.flag || ''
    case 'policy.number': return policy?.number || ''
    case 'policy.insurer': return policy?.insurer || ''
    case 'policy.startDate': return policy?.startDate ? fmtDate(policy.startDate) : ''
    case 'policy.endDate': return policy?.endDate ? fmtDate(policy.endDate) : ''
    case 'policy.conditions': return policy?.conditions || ''
    case 'claim.number': return claim?.number || ''
    case 'claim.type': return claim?.type || ''
    case 'claim.claimAmount': return claim ? M(claim.claimAmount) : ''
    case 'claim.franchisePct': return claim ? `${claim.franchisePct}%` : ''
    case 'claim.franchise': return claim && cert ? M(Math.round((cert.sumInsured * claim.franchisePct) / 100)) : ''
    case 'claim.insurer': return claim?.insurer || ''
    case 'our.name': return our.name
    case 'our.inn': return our.inn
    case 'our.address': return our.address
    case 'our.phone': return our.phone
    case 'today': return today
    default: return money ? '' : ''
  }
}

// { tag: value } from a template's mapping against a record.
export function buildData(template, record, store) {
  const ctx = buildContext(template.entity, record, store)
  const data = {}
  for (const [tag, path] of Object.entries(template.mapping || {})) {
    data[tag] = valueForPath(path, ctx)
  }
  return data
}

// ── Tag parsing ──────────────────────────────────────────────────────────────
export function parseTextTags(text) {
  const all = [...String(text || '').matchAll(/\{([^{}]+)\}/g)].map((x) => x[1].trim())
  return [...new Set(all)]
}

export function detectTags(arrayBuffer) {
  const zip = new PizZip(arrayBuffer)
  const iModule = new InspectModule()
  // eslint-disable-next-line no-new
  new Docxtemplater(zip, { modules: [iModule], paragraphLoop: true, linebreaks: true })
  const all = iModule.getAllTags()
  const tags = Object.keys(all || {})
  const base64 = zip.generate({ type: 'base64' })
  return { tags, base64 }
}

// ── Minimal .docx builder from plain text (one line → one paragraph) ──────────
function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function paragraph(text) {
  return `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`
}
export function buildDocxBase64FromText(text) {
  const body = String(text || '').replace(/\r/g, '').split('\n').map(paragraph).join('')
  const zip = new PizZip()
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`)
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`)
  return zip.generate({ type: 'base64' })
}

// ── Fill / preview / generate ────────────────────────────────────────────────
// Replace {tag} in text with data[tag]; keep token if no mapping/value.
function replaceTags(text, data) {
  return String(text || '').replace(/\{([^{}]+)\}/g, (m, raw) => {
    const tag = raw.trim()
    return tag in data ? data[tag] : m
  })
}

// Plain-text preview of a filled template.
export function previewText(template, record, store) {
  const data = buildData(template, record, store)
  if (template.body != null) return replaceTags(template.body, data)
  // word template → render docx then strip xml
  try {
    const zip = new PizZip(template.fileBase64, { base64: true })
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{', end: '}' }, nullGetter: () => '' })
    doc.render(data)
    const xml = doc.getZip().file('word/document.xml').asText()
    return xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n').trim()
  } catch (e) {
    return 'Не удалось построить предпросмотр: ' + (e?.message || e)
  }
}

// Filled .docx Blob.
export function generateBlob(template, record, store) {
  const data = buildData(template, record, store)
  if (template.body != null) {
    const filled = replaceTags(template.body, data)
    const base64 = buildDocxBase64FromText(filled)
    return new PizZip(base64, { base64: true }).generate({
      type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  }
  const zip = new PizZip(template.fileBase64, { base64: true })
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{', end: '}' }, nullGetter: () => '' })
  doc.render(data)
  return doc.getZip().generate({
    type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export function downloadFilled(template, record, store) {
  const blob = generateBlob(template, record, store)
  const recNo = record?.number || 'doc'
  saveAs(blob, `${template.name} — ${recNo}.docx`)
}

// Recompute a builder template's tags/mapping/base64 from its body text.
export function recompileBody(template) {
  const tags = parseTextTags(template.body)
  const mapping = { ...buildAutoMapping(tags, template.entity), ...(template.mapping || {}) }
  // drop mappings for tags no longer present
  for (const t of Object.keys(mapping)) if (!tags.includes(t)) delete mapping[t]
  return { ...template, tags, mapping, fileBase64: buildDocxBase64FromText(template.body) }
}

// ── Built-in insurer templates ───────────────────────────────────────────────
function makeBuiltin(id, name, entity, body) {
  const tags = parseTextTags(body)
  return {
    id, name, entity, source: 'builtin', builtIn: true, body,
    fileName: `${id}.docx`, fileBase64: buildDocxBase64FromText(body),
    tags, mapping: buildAutoMapping(tags, entity),
  }
}

const CERT_BODY = `INGOSSTRAKH — СЕРТИФИКАТ СТРАХОВАНИЯ № {номер_сертификата}
Forming part of the General Policy № {номер_полиса}

1.  Insured (Страхователь): {страхователь}
2.  Beneficiary: {выгодоприобретатель}
3.  Subject Matter Insured: {груз}
4.  Weight of cargo: {вес}
5.  Sum insured: {страховая_сумма} (100%)
6.  Place of shipment: {порт_отгрузки}
7.  Place of destination: {порт_назначения}
8.  Vessel: {судно} ({год_постройки}), IMO {imo}
9.  Bill of Lading: {номер_коносамента} от {дата_коносамента}
10. Insurance Conditions: {условия}
    Вординг: {вординг}

Страховая премия: {премия} (ставка {ставка}).
Дата выпуска: {дата}.

Страховщик: Ингосстрах
Брокер: {наше_юл}, ИНН {наш_инн}`

const CLAIM_BODY = `{наше_юл}
{наш_адрес}
тел. {наш_телефон}

Исх. № {номер_убытка} от {дата}

В {страховщик_убытка}

ПРЕТЕНЗИОННОЕ ПИСЬМО (CLAIM LETTER)

По генеральному полису № {номер_полиса}, сертификат № {номер_сертификата}.
Страхователь: {страхователь}.
Груз: {груз}, судно {судно}.

Заявленный убыток ({тип_убытка}): {сумма_убытка}.
Франшиза по договору: {франшиза_процент} ({франшиза_сумма}).
Сумма к возмещению: {сумма_убытка}.

Просим рассмотреть настоящую претензию и произвести выплату страхового
возмещения в установленный договором срок.

{наше_юл}
_______________ / подпись /`

const POLICY_BODY = `ПОДТВЕРЖДЕНИЕ ГЕНЕРАЛЬНОГО ПОЛИСА № {номер_полиса}

Страховщик: {страховщик}
Страхователь: {страхователь}, ИНН {инн}
Срок действия: с {начало_полиса} по {окончание_полиса}
Условия страхования грузов: {условия}

Брокер: {наше_юл}
Дата: {дата}`

export function builtInTemplates() {
  return [
    makeBuiltin('tpl-ingos-cert', 'Сертификат Ингосстрах', 'certificate', CERT_BODY),
    makeBuiltin('tpl-claim-letter', 'Претензионное письмо', 'claim', CLAIM_BODY),
    makeBuiltin('tpl-policy-confirm', 'Подтверждение ген. полиса', 'policy', POLICY_BODY),
  ]
}

export function downloadSample() {
  const body = `БЛАНК СТРАХОВОЙ КОМПАНИИ (пример)

Вставляйте метки полей в фигурных скобках — система подставит данные карточки:

Сертификат № {номер_сертификата}
Страхователь: {страхователь}
Груз: {груз}, вес {вес}
Страховая сумма: {страховая_сумма}
Судно: {судно}, IMO {imo}
Маршрут: {порт_отгрузки} — {порт_назначения}
Премия: {премия}
Дата: {дата}`
  const base64 = buildDocxBase64FromText(body)
  const blob = new PizZip(base64, { base64: true }).generate({
    type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  saveAs(blob, 'transocean-shablon-primer.docx')
}
