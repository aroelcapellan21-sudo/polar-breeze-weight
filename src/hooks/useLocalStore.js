import { useState, useCallback } from 'react'

// Almacenamiento local para desarrollo/offline (espejo del schema de Sheets)
const KEYS = {
  dispatches:   'pbw:dispatches',
  dailyReports: 'pbw:dailyReports',
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

let nextId = Date.now()
const uid = () => `${++nextId}`

export function useDispatches() {
  const [dispatches, setDispatches] = useState(() => load(KEYS.dispatches))

  const add = useCallback((driverId, items, period) => {
    const entry = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      driverId,
      items,
      period,
    }
    setDispatches(prev => {
      const next = [...prev, entry]
      save(KEYS.dispatches, next)
      return next
    })
    return entry
  }, [])

  const remove = useCallback((id) => {
    setDispatches(prev => {
      const next = prev.filter(d => d.id !== id)
      save(KEYS.dispatches, next)
      return next
    })
  }, [])

  return { dispatches, add, remove }
}

export function useDailyReports() {
  const [reports, setReports] = useState(() => load(KEYS.dailyReports))

  const add = useCallback((driverId, entries, period) => {
    const entry = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      driverId,
      entries,
      period,
    }
    setReports(prev => {
      const next = [...prev, entry]
      save(KEYS.dailyReports, next)
      return next
    })
    return entry
  }, [])

  const remove = useCallback((id) => {
    setReports(prev => {
      const next = prev.filter(r => r.id !== id)
      save(KEYS.dailyReports, next)
      return next
    })
  }, [])

  return { reports, add, remove }
}
