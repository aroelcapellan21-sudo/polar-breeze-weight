import { useState, useEffect } from 'react'
import { db } from '../../services/firebase.js'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { useFirebaseStatus } from '../../hooks/useFirestore.js'
import { flushPendingSync } from '../../services/sheetsSyncService.js'
import { isSignedIn } from '../../services/sheetsService.js'

export default function ConnectionStatus() {
  const online         = useFirebaseStatus()
  const [fbOk, setFbOk]   = useState(null)   // null=checking, true, false
  const [sheets, setSheets] = useState(false)

  // Verifica conectividad Firebase
  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        await getDocs(query(collection(db, 'despacho'), limit(1)))
        if (!cancelled) setFbOk(true)
      } catch {
        if (!cancelled) setFbOk(false)
      }
    }
    check()
    const t = setInterval(check, 30_000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  // Estado de Google Sheets
  useEffect(() => {
    const t = setInterval(() => setSheets(isSignedIn()), 5000)
    setSheets(isSignedIn())
    return () => clearInterval(t)
  }, [])

  // Reintentar sync cuando Sheets vuelve a estar conectado
  useEffect(() => {
    if (sheets) flushPendingSync().catch(() => {})
  }, [sheets])

  const indicators = [
    {
      label: 'Internet',
      ok:    online,
      icon:  online ? '🌐' : '📵',
      title: online ? 'Conectado a internet' : 'Sin conexión',
    },
    {
      label: 'Firebase',
      ok:    fbOk === true,
      icon:  fbOk === null ? '⏳' : fbOk ? '🔥' : '❌',
      title: fbOk === null ? 'Verificando...' : fbOk ? 'Firebase OK (tiempo real)' : 'Firebase no disponible',
    },
    {
      label: 'Sheets',
      ok:    sheets,
      icon:  sheets ? '📊' : '📋',
      title: sheets ? 'Google Sheets conectado (respaldo activo)' : 'Sheets desconectado (respaldo en pausa)',
    },
  ]

  return (
    <div className="flex items-center gap-3">
      {indicators.map(ind => (
        <div
          key={ind.label}
          title={ind.title}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors cursor-default ${
            ind.ok
              ? 'bg-green-900/40 text-green-300'
              : 'bg-red-900/40 text-red-300'
          }`}
        >
          <span>{ind.icon}</span>
          <span className="hidden sm:inline">{ind.label}</span>
        </div>
      ))}
    </div>
  )
}
