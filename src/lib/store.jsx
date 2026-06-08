import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeed } from '../data/seed.js'

const KEY = 'transocean-crm:v1'
const StoreCtx = createContext(null)

function load() {
  const seed = buildSeed()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // backfill any collection added after this browser last saved
      return { ...seed, ...saved, templates: saved.templates?.length ? saved.templates : seed.templates }
    }
  } catch {
    /* ignore */
  }
  return seed
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch {
      /* ignore quota */
    }
  }, [db])

  const api = useMemo(() => {
    const update = (collection, id, patch) =>
      setDb((prev) => ({
        ...prev,
        [collection]: prev[collection].map((it) =>
          it.id === id ? { ...it, ...(typeof patch === 'function' ? patch(it) : patch) } : it,
        ),
      }))

    const add = (collection, item) =>
      setDb((prev) => ({ ...prev, [collection]: [item, ...prev[collection]] }))

    const remove = (collection, id) =>
      setDb((prev) => ({ ...prev, [collection]: prev[collection].filter((it) => it.id !== id) }))

    const moveStage = (collection, id, stage) => update(collection, id, { stage })

    const reset = () => setDb(buildSeed())

    return { update, add, remove, moveStage, reset }
  }, [])

  // Convenience lookups, recomputed on every db change.
  const helpers = useMemo(() => {
    const companyById = Object.fromEntries(db.companies.map((c) => [c.id, c]))
    const vesselById = Object.fromEntries(db.vessels.map((v) => [v.id, v]))
    const policyById = Object.fromEntries(db.policies.map((p) => [p.id, p]))
    const certById = Object.fromEntries(db.certificates.map((c) => [c.id, c]))
    return { companyById, vesselById, policyById, certById }
  }, [db])

  return <StoreCtx.Provider value={{ db, ...api, ...helpers }}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
