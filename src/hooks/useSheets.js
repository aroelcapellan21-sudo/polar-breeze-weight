import { useState, useEffect, useCallback } from 'react'
import {
  initSheets, signIn, signOut, isSignedIn,
  fetchDispatches, fetchDailyReports, fetchBiweeklyReports,
} from '../services/sheetsService.js'

export function useSheets() {
  const [ready, setReady]       = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    initSheets()
      .then(() => {
        setReady(true)
        setSignedIn(isSignedIn())
      })
      .catch(e => setError(e.message || 'Error inicializando Google API'))
  }, [])

  const login = useCallback(async () => {
    await signIn()
    setSignedIn(true)
  }, [])

  const logout = useCallback(() => {
    signOut()
    setSignedIn(false)
  }, [])

  return { ready, signedIn, error, login, logout }
}

export function usePeriodData(period) {
  const [dispatches, setDispatches]     = useState([])
  const [dailyReports, setDailyReports] = useState([])
  const [loading, setLoading]           = useState(false)

  const load = useCallback(async () => {
    if (!period) return
    setLoading(true)
    try {
      const [d, r] = await Promise.all([
        fetchDispatches(period),
        fetchDailyReports(period),
      ])
      setDispatches(d)
      setDailyReports(r)
    } finally {
      setLoading(false)
    }
  }, [period])

  return { dispatches, dailyReports, loading, reload: load }
}
