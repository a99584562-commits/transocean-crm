// Mock dataset for the demo. Dates are anchored around TODAY = 2026-06-08 so the
// 60/30-day expiry logic and auto-renew rule are visible out of the box.

export const COMPANIES = [
  { id: 'co-1', name: 'ООО «Зерно Торг»', inn: '6164011223', rate: 0.08, country: 'Россия' },
  { id: 'co-2', name: 'ООО «Дон-Агро»', inn: '6155099034', rate: 0.075, country: 'Россия' },
  { id: 'co-3', name: 'ООО «Каспий Грейн»', inn: '0541022118', rate: 0.11, country: 'Россия' },
  { id: 'co-4', name: 'Agro Export DMCC', inn: 'DMCC-44120', rate: 0.09, country: 'ОАЭ' },
  { id: 'co-5', name: 'Black Sea Trading Co', inn: 'TR-99210', rate: 0.1, country: 'Türkiye' },
]

export const VESSELS = [
  { id: 'v-1', name: 'MV Kavkaz', imo: '9123456', yearBuilt: 2008, flag: 'Россия', type: 'Bulk carrier' },
  { id: 'v-2', name: 'MV Don Star', imo: '9234567', yearBuilt: 2012, flag: 'Панама', type: 'Bulk carrier' },
  { id: 'v-3', name: 'MV Azov Trader', imo: '9345678', yearBuilt: 2005, flag: 'Türkiye', type: 'General cargo' },
  { id: 'v-4', name: 'MV Caspian Pioneer', imo: '9456789', yearBuilt: 2016, flag: 'Россия', type: 'Bulk carrier' },
  { id: 'v-5', name: 'MV Bosphorus', imo: '9567890', yearBuilt: 1999, flag: 'Либерия', type: 'Bulk carrier' },
]

export const POLICIES = [
  {
    id: 'gp-1', number: 'ГП-2024/118', companyId: 'co-1', insurer: 'Ингосстрах',
    cargo: 'Russian wheat in bulk', startDate: '2024-01-05', endDate: '2027-01-05',
    autoRenew: true, stage: 'Полис оформлен', baseRate: 0.08,
    conditions: 'Institute Cargo Clauses (A), war & strikes per Institute War Clauses (Cargo)',
  },
  {
    id: 'gp-2', number: 'ГП-2024/204', companyId: 'co-2', insurer: 'Ингосстрах',
    cargo: 'Barley in bulk', startDate: '2024-08-01', endDate: '2026-08-01',
    autoRenew: false, stage: '60 дней до окончания', baseRate: 0.075,
    conditions: 'Institute Cargo Clauses (A), shortage > 0,5%',
  },
  {
    id: 'gp-3', number: 'ГП-2025/061', companyId: 'co-3', insurer: 'Альфастрахование',
    cargo: 'Wheat in bulk (Caspian)', startDate: '2025-07-05', endDate: '2026-07-05',
    autoRenew: false, stage: '30 дней до окончания', baseRate: 0.11,
    conditions: 'ICC (A), КМ + ЧМ, war excluded',
  },
  {
    id: 'gp-4', number: 'ГП-2025/119', companyId: 'co-4', insurer: 'Ингосстрах',
    cargo: 'Corn in bulk', startDate: '2025-06-20', endDate: '2026-06-20',
    autoRenew: true, stage: 'Полис оформлен', baseRate: 0.09,
    conditions: 'ICC (A), auto-renew enabled',
  },
  {
    id: 'gp-5', number: 'ГП-2026/008', companyId: 'co-5', insurer: 'Энергогарант',
    cargo: 'Sunflower seeds', startDate: '2026-05-28', endDate: '2027-05-28',
    autoRenew: false, stage: 'Новый полис', baseRate: 0.1,
    conditions: 'Разовый — судно, которое не берёт Ингосстрах',
  },
  {
    id: 'gp-6', number: 'ГП-2023/090', companyId: 'co-1', insurer: 'Ингосстрах',
    cargo: 'Russian wheat in bulk', startDate: '2023-01-05', endDate: '2026-01-05',
    autoRenew: false, stage: 'Продлён', baseRate: 0.08,
    conditions: 'ICC (A) — продлён на 2026/118',
  },
]

export const CERTIFICATES = [
  {
    id: 'ct-1', number: 'СТ-01/26', policyId: 'gp-1', companyId: 'co-1', vesselId: 'v-1',
    cargo: 'RUSSIAN WHEAT IN BULK', weight: 5000, sumInsured: 1500000, ratePct: 0.08,
    placeOfShipment: 'Rostov-on-Don, Russia', placeOfDestination: 'Samsun, Türkiye',
    blNumber: 'BL-1102', blDate: '2026-05-06', seas: ['ЧМ'], warCover: 'full',
    stage: 'Счёт оплачен', scanAttached: true, beneficiary: 'TO ORDER',
  },
  {
    id: 'ct-2', number: 'СТ-02/26', policyId: 'gp-2', companyId: 'co-2', vesselId: 'v-2',
    cargo: 'BARLEY IN BULK', weight: 8000, sumInsured: 2200000, ratePct: 0.075,
    placeOfShipment: 'Azov, Russia', placeOfDestination: 'Mersin, Türkiye',
    blNumber: 'BL-1140', blDate: '2026-05-22', seas: ['АМ', 'ЧМ'], warCover: 'none',
    stage: 'Выпущен', scanAttached: true, beneficiary: 'TO ORDER',
  },
  {
    id: 'ct-3', number: 'СТ-03/26', policyId: 'gp-3', companyId: 'co-3', vesselId: 'v-4',
    cargo: 'WHEAT IN BULK', weight: 6000, sumInsured: 1800000, ratePct: 0.11,
    placeOfShipment: 'Astrakhan, Russia', placeOfDestination: 'Bandar Anzali, Iran',
    blNumber: '', blDate: '', seas: ['КМ'], warCover: 'full',
    stage: 'Драфт', scanAttached: false, beneficiary: 'TO ORDER',
  },
  {
    id: 'ct-4', number: 'СТ-04/26', policyId: 'gp-1', companyId: 'co-1', vesselId: 'v-3',
    cargo: 'CORN IN BULK', weight: 4500, sumInsured: 1250000, ratePct: 0.08,
    placeOfShipment: 'Yeysk, Russia', placeOfDestination: 'Istanbul, Türkiye',
    blNumber: 'BL-1175', blDate: '2026-06-01', seas: ['АМ', 'ЧМ'], warCover: 'full',
    stage: 'Счёт выставлен', scanAttached: true, beneficiary: 'TO ORDER',
  },
  {
    id: 'ct-5', number: 'СТ-05/26', policyId: 'gp-4', companyId: 'co-4', vesselId: 'v-2',
    cargo: 'CORN IN BULK', weight: 7000, sumInsured: 1950000, ratePct: 0.09,
    placeOfShipment: 'Novorossiysk, Russia', placeOfDestination: 'Alexandria, Egypt',
    blNumber: '', blDate: '', seas: ['ЧМ'], warCover: 'full',
    stage: 'Драфт', scanAttached: false, beneficiary: 'TO ORDER',
  },
  {
    id: 'ct-6', number: 'СТ-06/26', policyId: 'gp-2', companyId: 'co-2', vesselId: 'v-1',
    cargo: 'BARLEY IN BULK', weight: 9000, sumInsured: 2450000, ratePct: 0.075,
    placeOfShipment: 'Taganrog, Russia', placeOfDestination: 'Iskenderun, Türkiye',
    blNumber: 'BL-1190', blDate: '2026-06-04', seas: ['АМ', 'ЧМ'], warCover: 'none',
    stage: 'Счёт выставлен', scanAttached: true, beneficiary: 'TO ORDER',
  },
]

export const PREMIUMS = [
  { id: 'pr-1', number: 'ПР-01/26', certificateId: 'ct-1', amount: 1200, stage: 'Счёт оплачен', dueDate: '2026-05-12' },
  { id: 'pr-2', number: 'ПР-02/26', certificateId: 'ct-2', amount: 1650, stage: 'Счёт выставлен', dueDate: '2026-06-10' },
  { id: 'pr-3', number: 'ПР-04/26', certificateId: 'ct-4', amount: 1000, stage: 'Счёт выставлен', dueDate: '2026-06-15' },
  { id: 'pr-4', number: 'ПР-06/26', certificateId: 'ct-6', amount: 1838, stage: 'Новая премия', dueDate: '2026-06-18' },
]

export const CLAIMS = [
  {
    id: 'cl-1', number: 'УБ-01/26', certificateId: 'ct-1', insurer: 'Ингосстрах',
    type: 'Недостача (shortage)', claimAmount: 18400, franchisePct: 0.5,
    stage: 'Расчёт', docsComplete: true, openedDate: '2026-05-28',
  },
  {
    id: 'cl-2', number: 'УБ-02/26', certificateId: 'ct-2', insurer: 'Ингосстрах',
    type: 'Повреждение груза (подмочка)', claimAmount: 41200, franchisePct: 0.5,
    stage: 'Отправлено в страховую', docsComplete: true, openedDate: '2026-05-30',
  },
  {
    id: 'cl-3', number: 'УБ-03/26', certificateId: 'ct-4', insurer: 'Ингосстрах',
    type: 'Недостача (shortage)', claimAmount: 4200, franchisePct: 0.5,
    stage: 'Новый убыток', docsComplete: false, openedDate: '2026-06-05',
  },
  {
    id: 'cl-4', number: 'УБ-09/25', certificateId: 'ct-1', insurer: 'Ингосстрах',
    type: 'Недостача (shortage)', claimAmount: 22100, franchisePct: 0.5,
    stage: 'Возмещён', docsComplete: true, openedDate: '2025-11-12',
  },
]

import { builtInTemplates } from '../lib/docs.js'

export function buildSeed() {
  return {
    companies: COMPANIES,
    vessels: VESSELS,
    policies: POLICIES,
    certificates: CERTIFICATES,
    premiums: PREMIUMS,
    claims: CLAIMS,
    templates: builtInTemplates(),
  }
}
