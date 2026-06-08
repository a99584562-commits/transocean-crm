import { useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { Page, PageHeader, DetailModal, IdChip, Tag, Field } from '../components/ui.jsx'
import FieldCatalog from '../components/FieldCatalog.jsx'
import { IconPlus, IconDoc, IconClose, IconCheck } from '../components/icons.jsx'
import {
  detectTags, buildAutoMapping, recompileBody, previewText, downloadFilled,
  downloadSample, sourcesForEntity, ENTITY_LABELS,
} from '../lib/docs.js'
import { uid } from '../lib/domain.js'

const ENTITIES = ['certificate', 'claim', 'policy']

function recordsFor(db, entity) {
  if (entity === 'certificate') return db.certificates
  if (entity === 'claim') return db.claims
  return db.policies
}

// ── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ t, onEdit, onRemove }) {
  const total = (t.tags || []).length
  const mapped = (t.tags || []).filter((tag) => t.mapping?.[tag]).length
  const full = total > 0 && mapped === total
  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-soft ring-1 ring-ink-900/[0.05]">
      <div className="flex items-start gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><IconDoc width={19} height={19} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-bold tracking-tight text-ink-900">{t.name}</h3>
          <p className="text-[11px] font-semibold text-ink-400">{ENTITY_LABELS[t.entity]}</p>
        </div>
        {t.builtIn && <span className="rounded-full bg-ink-900/[0.05] px-2 py-0.5 text-[9.5px] font-bold uppercase text-ink-400">бланк</span>}
        {t.source === 'word' && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9.5px] font-bold uppercase text-sky-600">Word</span>}
        {t.source === 'builder' && <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9.5px] font-bold uppercase text-violet-600">редактор</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Tag color="brand">{total} полей</Tag>
        <span className={`chip ${full ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {full && <IconCheck width={11} height={11} />} {mapped}/{total} привязано
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onEdit(t)} className="flex-1 rounded-xl bg-ink-900/[0.03] py-2 text-[12.5px] font-bold text-ink-700 ring-1 ring-ink-900/[0.06] transition-all hover:bg-brand-50 hover:text-brand-700">Настроить</button>
        {!t.builtIn && (
          <button onClick={() => onRemove(t)} className="grid h-9 w-9 place-items-center rounded-xl text-ink-300 transition-colors hover:bg-rose-50 hover:text-rose-500"><IconClose width={16} height={16} /></button>
        )}
      </div>
    </div>
  )
}

// ── Editor ───────────────────────────────────────────────────────────────────
function TemplateEditor({ template, onClose }) {
  const store = useStore()
  const { db, update } = store
  const [draft, setDraft] = useState(template)
  const [recId, setRecId] = useState(recordsFor(db, template.entity)[0]?.id)
  const bodyRef = useRef(null)

  const records = recordsFor(db, draft.entity)
  const record = records.find((r) => r.id === recId) || records[0]
  const isBuilder = draft.body != null

  const preview = useMemo(() => {
    if (!record) return ''
    try { return previewText(draft, record, store) } catch (e) { return 'Ошибка: ' + (e?.message || e) }
  }, [draft, record, store])

  const setBody = (body) => setDraft((d) => recompileBody({ ...d, body }))

  const insert = (snippet) => {
    const ta = bodyRef.current
    if (!ta) { setBody((draft.body || '') + snippet); return }
    const s = ta.selectionStart ?? draft.body.length
    const e = ta.selectionEnd ?? s
    const next = draft.body.slice(0, s) + snippet + draft.body.slice(e)
    setBody(next)
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + snippet.length })
  }

  const setEntity = (entity) =>
    setDraft((d) => ({ ...d, entity, mapping: buildAutoMapping(d.tags, entity) }))

  const setMap = (tag, path) =>
    setDraft((d) => ({ ...d, mapping: { ...d.mapping, [tag]: path || undefined } }))

  const save = () => { update('templates', draft.id, draft); onClose() }

  const sources = sourcesForEntity(draft.entity)

  return (
    <DetailModal
      open
      onClose={onClose}
      idLabel={draft.source === 'word' ? 'WORD' : draft.builtIn ? 'БЛАНК' : 'РЕДАКТОР'}
      eyebrow="Шаблон документа"
      title={draft.name}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="label">Предпросмотр по:</span>
            <select className="field !w-auto !py-1.5" value={recId} onChange={(e) => setRecId(e.target.value)}>
              {records.map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadFilled(draft, record, store)} className="btn-ghost ring-1 ring-ink-900/10"><IconDoc width={16} height={16} /> Скачать .docx</button>
            <button onClick={save} className="btn-primary">Сохранить</button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: edit */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Название">
              <input className="field" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </Field>
            <Field label="Тип карточки">
              <select className="field" value={draft.entity} onChange={(e) => setEntity(e.target.value)}>
                {ENTITIES.map((en) => <option key={en} value={en}>{ENTITY_LABELS[en]}</option>)}
              </select>
            </Field>
          </div>

          {isBuilder ? (
            <Field label="Текст документа — вставляйте метки полей из каталога">
              <textarea
                ref={bodyRef}
                value={draft.body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                className="field scroll-thin h-[280px] resize-none font-mono !text-[12px] leading-relaxed"
              />
            </Field>
          ) : (
            <div>
              <p className="label mb-1.5">Привязка меток Word-бланка к полям</p>
              <div className="space-y-1.5">
                {draft.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <span className="w-[42%] shrink-0 truncate font-mono text-[11.5px] font-semibold text-ink-700">{`{${tag}}`}</span>
                    <select className="field !py-1.5" value={draft.mapping[tag] || ''} onChange={(e) => setMap(tag, e.target.value)}>
                      <option value="">— не привязано —</option>
                      {sources.map((s) => <option key={s.path} value={s.path}>{s.group} · {s.label}</option>)}
                    </select>
                  </div>
                ))}
                {draft.tags.length === 0 && <p className="text-[12.5px] font-medium text-ink-400">В загруженном файле не найдено меток вида {'{поле}'}.</p>}
              </div>
            </div>
          )}

          <FieldCatalog entity={draft.entity} onInsert={isBuilder ? insert : undefined} />
        </div>

        {/* Right: preview */}
        <div>
          <p className="label mb-1.5">Предпросмотр с подстановкой данных</p>
          <pre className="scroll-thin h-[440px] overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-5 font-mono text-[11.5px] leading-relaxed text-ink-700 shadow-soft ring-1 ring-ink-900/[0.06]">
            {preview}
          </pre>
        </div>
      </div>
    </DetailModal>
  )
}

// ── Module ───────────────────────────────────────────────────────────────────
export default function Templates() {
  const { db, add, remove } = useStore()
  const fileRef = useRef(null)
  const [editing, setEditing] = useState(null)
  const [err, setErr] = useState('')

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr('')
    try {
      const buf = await file.arrayBuffer()
      const { tags, base64 } = detectTags(buf)
      const tpl = {
        id: uid('tpl'), name: file.name.replace(/\.docx$/i, ''), entity: 'certificate',
        source: 'word', fileName: file.name, fileBase64: base64,
        tags, mapping: buildAutoMapping(tags, 'certificate'),
      }
      add('templates', tpl)
      setEditing(tpl)
    } catch (e2) {
      setErr('Не удалось прочитать .docx: ' + (e2?.message || e2))
    }
  }

  function createBuilder() {
    const body = 'НАЗВАНИЕ ДОКУМЕНТА\n\nСтрахователь: {страхователь}\nСертификат № {номер_сертификата}\nГруз: {груз}\nДата: {дата}'
    const tpl = recompileBody({
      id: uid('tpl'), name: 'Новый шаблон', entity: 'certificate', source: 'builder', body, mapping: {},
    })
    add('templates', tpl)
    setEditing(tpl)
  }

  const editingLive = editing && db.templates.find((t) => t.id === editing.id)

  return (
    <Page>
      <div className="space-y-5">
        <PageHeader eyebrow="Инструменты" title="Шаблоны документов">
          <button onClick={downloadSample} className="btn-ghost ring-1 ring-ink-900/10">↓ Пример</button>
          <button onClick={() => fileRef.current?.click()} className="btn-ghost ring-1 ring-ink-900/10">Загрузить Word</button>
          <button onClick={createBuilder} className="btn-primary"><IconPlus width={16} height={16} /> Создать</button>
          <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={onFile} />
        </PageHeader>

        {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-600">{err}</p>}

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-[12.5px] font-medium leading-relaxed text-brand-800">
            <b>«Создать»</b> — пишете бланк в редакторе, поля (страхователь, № сертификата, судно…) вставляете кнопкой. Word не нужен, сразу виден предпросмотр.
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-[12.5px] font-medium leading-relaxed text-ink-500 ring-1 ring-ink-900/[0.05]">
            <b className="text-ink-700">Есть Word-бланк страховой?</b> Вставьте в него метки вида <span className="font-mono text-brand-700">{'{номер_сертификата}'}</span> и загрузите — система подставит данные карточки.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.templates.map((t) => (
            <TemplateCard
              key={t.id}
              t={t}
              onEdit={setEditing}
              onRemove={(tpl) => { if (confirm('Удалить шаблон?')) remove('templates', tpl.id) }}
            />
          ))}
        </div>
      </div>

      {editingLive && <TemplateEditor template={editingLive} onClose={() => setEditing(null)} />}
    </Page>
  )
}
