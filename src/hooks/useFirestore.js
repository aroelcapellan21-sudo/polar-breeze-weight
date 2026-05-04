import { useState, useEffect, useCallback } from 'react'
import { DRIVERS } from '../data/drivers.js'
import {
  subscribeChoferes,
  subscribeDespachos,
  subscribeSobrantes,
  subscribeVueltas,
  getDespachosByDriver,
  saveDespacho,
  saveSobrante,
  saveVuelta,
} from '../services/firestoreService.js'
import { syncDespachoToSheets, syncSobranteToSheets, syncVueltaToSheets } from '../services/sheetsSyncService.js'

// ── Estado de conexión Firebase ───────────────────────────────────
export function useFirebaseStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

// ── Choferes (desde Firebase "choferes" o fallback a data local) ──
export function useChoferes() {
  const [drivers, setDrivers] = useState(DRIVERS)
  const [fromFirebase, setFromFirebase] = useState(false)

  useEffect(() => {
    const unsub = subscribeChoferes(docs => {
      if (docs.length > 0) {
        // Normaliza campos del esquema Firebase (puede variar)
        const normalized = docs.map(d => ({
          id:    d._id,
          name:  d.nombre  ?? d.name  ?? d._id,
          route: d.ruta    ?? d.route ?? '',
          code:  d.codigo  ?? d.code  ?? '',
        }))
        setDrivers(normalized)
        setFromFirebase(true)
      }
    })
    return unsub
  }, [])

  return { drivers, fromFirebase }
}

// ── Despachos en tiempo real ──────────────────────────────────────
export function useDespachos(period) {
  const [despachos, setDespachos] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!period) return
    setLoading(true)
    const unsub = subscribeDespachos(period, docs => {
      setDespachos(docs)
      setLoading(false)
    })
    return unsub
  }, [period])

  const add = useCallback(async (data) => {
    const id = await saveDespacho(data)
    // Sync a Sheets en background (no bloquea)
    syncDespachoToSheets({ ...data, _id: id }).catch(() => {})
    return id
  }, [])

  return { despachos, loading, add }
}

// ── Sobrantes en tiempo real ──────────────────────────────────────
export function useSobrantes(period) {
  const [sobrantes, setSobrantes] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!period) return
    setLoading(true)
    const unsub = subscribeSobrantes(period, docs => {
      setSobrantes(docs)
      setLoading(false)
    })
    return unsub
  }, [period])

  const add = useCallback(async (data) => {
    const id = await saveSobrante(data)
    syncSobranteToSheets({ ...data, _id: id }).catch(() => {})
    return id
  }, [])

  return { sobrantes, loading, add }
}

// ── Vueltas en tiempo real ────────────────────────────────────────
export function useVueltas(period) {
  const [vueltas, setVueltas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!period) return
    setLoading(true)
    const unsub = subscribeVueltas(period, docs => {
      setVueltas(docs)
      setLoading(false)
    })
    return unsub
  }, [period])

  const add = useCallback(async (data) => {
    const id = await saveVuelta(data)
    syncVueltaToSheets({ ...data, _id: id }).catch(() => {})
    return id
  }, [])

  return { vueltas, loading, add }
}

// ── Despachos de un chofer específico (para Vuelta form) ──────────
export function useDespachosByDriver(driverId, period) {
  const [despachos, setDespachos] = useState([])
  const [loading, setLoading]     = useState(false)

  const fetch = useCallback(async () => {
    if (!driverId || !period) return
    setLoading(true)
    try {
      const docs = await getDespachosByDriver(driverId, period)
      setDespachos(docs)
    } finally {
      setLoading(false)
    }
  }, [driverId, period])

  useEffect(() => { fetch() }, [fetch])

  return { despachos, loading, refetch: fetch }
}
