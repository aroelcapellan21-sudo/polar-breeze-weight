import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDriverStats } from '../../services/firestoreService.js'

const STATUS_META = {
  activo: { icon: '✅', badge: 'bg-green-100 text-green-700 border-green-200', border: 'border-green-300' },
  baja:   { icon: '🔒', badge: 'bg-red-100   text-red-600   border-red-200',   border: 'border-red-200'   },
}

const VUELTA_META = {
  cuadra:    { icon: '✅', cls: 'text-green-600', bg: 'bg-green-50'  },
  revisar:   { icon: '⚠️', cls: 'text-yellow-600', bg: 'bg-yellow-50' },
  auditoria: { icon: '🚨', cls: 'text-red-600',   bg: 'bg-red-50'    },
}

const fmtG  = (g) => g >= 1000 ? `${(g/1000).toFixed(2)} kg` : `${g} g`

export default function DriverCard({ chofer, period }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  const status = chofer.status === 'baja' ? 'baja' : 'activo'
  const meta   = STATUS_META[status]

  useEffect(() => {
    if (status === 'baja') return
    getDriverStats(chofer._id, period)
      .then(setStats)
      .catch(() => {})
  }, [chofer._id, period, status])

  const vueltaMeta = stats?.lastVuelta ? VUELTA_META[stats.lastVuelta.status] : null

  return (
    <button
      onClick={() => navigate(`/driver/${chofer._id}`)}
      className={`w-full text-left card border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer ${meta.border} p-0 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.badge}`}>
              {meta.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {chofer.codigo && <span className="text-xs text-slate-400 font-mono">{chofer.codigo}</span>}
          </div>
          <p className="font-bold text-slate-800 text-lg leading-tight truncate">{chofer.nombre}</p>
          <p className="text-xs text-slate-500 truncate">{chofer.ruta || '—'}</p>
        </div>
        <div className="text-2xl ml-2 flex-shrink-0">
          {status === 'baja' ? '🔒' : '🚚'}
        </div>
      </div>

      {/* Estado de baja */}
      {status === 'baja' && (
        <div className="bg-red-50 border-t border-red-100 px-4 py-3 text-center">
          <p className="text-red-600 text-xs font-semibold">Dado de baja</p>
          {chofer.bajaNota && <p className="text-red-400 text-xs mt-0.5 italic">{chofer.bajaNota}</p>}
        </div>
      )}

      {/* Stats activo */}
      {status === 'activo' && (
        <>
          {!stats ? (
            <div className="px-4 py-3 border-t border-slate-100 animate-pulse">
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-slate-100 rounded-lg h-12" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-1 px-3 pb-3 border-t border-slate-100 pt-2">
                {[
                  { label: 'Cajas',    val: stats.totalBoxes,                         icon: '📦' },
                  { label: 'Unidades', val: stats.totalUnits,                          icon: '🍦' },
                  { label: 'Peso',     val: fmtG(stats.totalWeightG),                  icon: '⚖️' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-base">{m.icon}</p>
                    <p className="font-black text-slate-800 text-sm tabular-nums leading-tight">{m.val}</p>
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Vendido vs sobrante */}
              {(stats.totalVendidoG > 0 || stats.totalRetornadoG > 0) && (
                <div className="grid grid-cols-2 gap-1 px-3 pb-3 -mt-1">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="font-bold text-green-700 text-xs tabular-nums">{fmtG(stats.totalVendidoG)}</p>
                    <p className="text-xs text-green-500">Vendido</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="font-bold text-amber-700 text-xs tabular-nums">{fmtG(stats.totalRetornadoG)}</p>
                    <p className="text-xs text-amber-500">Sobrante</p>
                  </div>
                </div>
              )}

              {/* Última vuelta */}
              {vueltaMeta && (
                <div className={`border-t border-slate-100 px-4 py-2 flex items-center justify-between ${vueltaMeta.bg}`}>
                  <span className="text-xs text-slate-500">Última vuelta:</span>
                  <span className={`text-xs font-bold ${vueltaMeta.cls}`}>
                    {vueltaMeta.icon} {(Math.abs(stats.lastVuelta.pctDiff ?? 0) * 100).toFixed(2)}%
                  </span>
                </div>
              )}

              {/* Sin actividad */}
              {stats.totalBoxes === 0 && (
                <div className="border-t border-slate-100 px-4 py-2 text-center">
                  <p className="text-xs text-slate-400">Sin despachos en el período</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Footer tap hint */}
      <div className="bg-polar-50 border-t border-polar-100 px-4 py-1.5 text-xs text-polar-500 text-right">
        Ver detalle →
      </div>
    </button>
  )
}
