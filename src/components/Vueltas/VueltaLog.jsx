import { useState } from 'react'
import { fmtGrams } from '../../utils/mathEngine.js'
import FichaChofer from './FichaChofer.jsx'

const STATUS_META = {
  cuadra:      { badge: 'badge-green',  label: '✅ Cuadra'    },
  revisar:     { badge: 'badge-yellow', label: '⚠️ Revisar'   },
  auditoria:   { badge: 'badge-red',    label: '🚨 Auditoría' },
  'sin-datos': { badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600', label: '— Sin datos' },
}

export default function VueltaLog({ vueltas, loading }) {
  const [fichaOpen, setFichaOpen] = useState(null)

  if (loading) return <p className="text-slate-400 text-sm text-center py-6">Cargando Firebase...</p>
  if (vueltas.length === 0) return <p className="text-slate-400 text-sm text-center py-6">Sin vueltas registradas.</p>

  return (
    <>
      <div className="space-y-3">
        {vueltas.map(v => {
          const meta = STATUS_META[v.status] ?? STATUS_META['sin-datos']
          return (
            <div key={v._id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-400">{v.fichaNumero}</p>
                  <p className="font-bold text-slate-800 text-lg leading-tight">{v.driverName}</p>
                  <p className="text-xs text-slate-500">{v.route} · Llegó {v.hora}</p>
                </div>
                <div className="text-right">
                  <span className={meta.badge}>{meta.label}</span>
                  <p className="text-xs text-slate-400 mt-1">{v.date}</p>
                  <p className="text-lg font-black tabular-nums text-teal-700">{(Math.abs(v.pctDiff ?? 0) * 100).toFixed(2)}%</p>
                </div>
              </div>

              {/* Barra de peso */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                {[
                  { label: 'Despachado', val: fmtGrams(v.totalDespachadoG), cls: 'text-blue-700' },
                  { label: 'Retornado',  val: fmtGrams(v.totalRetornadoG),  cls: 'text-amber-700' },
                  { label: 'Vendido',    val: fmtGrams(v.totalVendidoG),    cls: 'text-green-700' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded py-1.5">
                    <p className="text-slate-400">{s.label}</p>
                    <p className={`font-bold tabular-nums ${s.cls}`}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Productos */}
              <div className="text-xs text-slate-500 flex flex-wrap gap-1">
                {v.items?.map((it, i) => (
                  <span key={i} className="bg-slate-100 rounded px-2 py-0.5">
                    {it.productName}: {it.vendidas} ud vendidas
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {v.syncedToSheets
                    ? <span className="text-green-600">✓ Sheets sincronizado</span>
                    : <span className="text-amber-500">⏳ Pendiente Sheets</span>
                  }
                </span>
                <button
                  onClick={() => setFichaOpen(v)}
                  className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-3 py-1 rounded-lg transition-colors"
                >
                  Ver Ficha / Imprimir
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {fichaOpen && (
        <FichaChofer vuelta={fichaOpen} onClose={() => setFichaOpen(null)} />
      )}
    </>
  )
}
