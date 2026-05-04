import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth, isAdmin } from '../context/AuthContext.jsx'
import PeriodSelector, { currentPeriod, periodLabel } from '../components/Layout/PeriodSelector.jsx'
import { getDriverStats } from '../services/firestoreService.js'
import { useChoferesAdmin } from '../hooks/useFirestore.js'
import FichaChofer from '../components/Vueltas/FichaChofer.jsx'

const fmtG  = (g) => g >= 1000 ? `${(g/1000).toFixed(3)} kg` : `${g} g`
const fmtPct = (p) => `${(Math.abs(p) * 100).toFixed(2)}%`

const VUELTA_META = {
  cuadra:    { icon: '✅', cls: 'text-green-700',  bg: 'bg-green-50 border-green-200'   },
  revisar:   { icon: '⚠️', cls: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  auditoria: { icon: '🚨', cls: 'text-red-700',    bg: 'bg-red-50 border-red-200'       },
}

const STATUS_META = {
  activo:    { icon: '✅', label: 'Activo',    cls: 'bg-green-100 text-green-800' },
  pendiente: { icon: '⚪', label: 'Pendiente', cls: 'bg-slate-100 text-slate-600' },
  baja:      { icon: '🔒', label: 'Baja',      cls: 'bg-red-100   text-red-700'   },
}

export default function DriverDetailPage() {
  const { driverId }   = useParams()
  const { user }       = useAuth()
  const navigate       = useNavigate()
  const [period, setPeriod] = useState(currentPeriod())
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [fichaOpen, setFichaOpen] = useState(null)

  const { choferes } = useChoferesAdmin()
  const chofer = choferes.find(c => c._id === driverId)

  useEffect(() => {
    setLoading(true)
    getDriverStats(driverId, period)
      .then(s => { setStats(s); setLoading(false) })
      .catch(() => setLoading(false))
  }, [driverId, period])

  const statusMeta = STATUS_META[chofer?.status ?? 'pendiente']

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/dashboard')} className="text-sm text-polar-600 hover:underline flex items-center gap-1">
        ← Volver al Dashboard
      </button>

      {/* Header del chofer */}
      <div className="bg-gradient-to-r from-polar-700 to-polar-600 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {chofer && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                  {statusMeta.icon} {statusMeta.label}
                </span>
              )}
              {chofer?.codigo && <span className="font-mono text-polar-300 text-sm">{chofer.codigo}</span>}
            </div>
            <h1 className="text-2xl font-black leading-tight">
              {chofer?.nombre ?? driverId}
            </h1>
            <p className="text-polar-200 text-sm">{chofer?.ruta ?? '—'}</p>
            {chofer?.status === 'baja' && chofer.bajaNota && (
              <p className="text-red-300 text-xs mt-1 italic">Suspendido: {chofer.bajaNota}</p>
            )}
          </div>
          <div className="text-right">
            <label className="block text-polar-300 text-xs mb-1">Período</label>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="bg-slate-100 rounded-xl h-20" />)}
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '📦', label: 'Cajas Entregadas',   val: stats.totalBoxes,                  cls: 'text-polar-700' },
              { icon: '🍦', label: 'Unidades Totales',   val: stats.totalUnits,                   cls: 'text-polar-700' },
              { icon: '⚖️', label: 'Peso Despachado',    val: fmtG(stats.totalWeightG),           cls: 'text-polar-700' },
              { icon: '💵', label: 'Peso Vendido',        val: fmtG(stats.totalVendidoG),          cls: 'text-green-700' },
            ].map(m => (
              <div key={m.label} className="card text-center p-4">
                <p className="text-2xl mb-1">{m.icon}</p>
                <p className={`text-xl font-black tabular-nums ${m.cls}`}>{m.val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Segunda fila de métricas */}
          {(stats.totalRetornadoG > 0 || stats.vueltas.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="card text-center p-4 border-l-4 border-amber-300">
                <p className="text-xl font-black text-amber-700 tabular-nums">{fmtG(stats.totalRetornadoG)}</p>
                <p className="text-xs text-slate-500">Sobrante acumulado</p>
              </div>
              <div className="card text-center p-4 border-l-4 border-teal-300">
                <p className="text-xl font-black text-teal-700">{stats.vueltas.length}</p>
                <p className="text-xs text-slate-500">Vueltas registradas</p>
              </div>
              <div className="card text-center p-4 border-l-4 border-purple-300">
                <p className="text-xl font-black text-purple-700">{stats.sobrantes.length}</p>
                <p className="text-xs text-slate-500">Registros sobrante</p>
              </div>
            </div>
          )}

          {/* Sin actividad */}
          {stats.totalBoxes === 0 && stats.vueltas.length === 0 && (
            <div className="card text-center py-10 text-slate-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">Sin actividad en {periodLabel(period)}</p>
              <p className="text-sm">Registra un despacho para ver estadísticas.</p>
            </div>
          )}

          {/* Desglose por producto */}
          {stats.byProduct.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">Desglose por Producto</h3>
                <p className="text-xs text-slate-400">{periodLabel(period)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="th">Producto</th>
                      <th className="th text-right">Cajas</th>
                      <th className="th text-right">Unidades</th>
                      <th className="th text-right">Peso</th>
                      <th className="th text-right">% del total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byProduct.map(p => (
                      <tr key={p.productId} className="hover:bg-slate-50">
                        <td className="td font-medium">{p.productName}</td>
                        <td className="td text-right tabular-nums">{p.boxes}</td>
                        <td className="td text-right tabular-nums">{p.units}</td>
                        <td className="td text-right tabular-nums font-semibold text-polar-700">{fmtG(p.totalG)}</td>
                        <td className="td text-right tabular-nums text-slate-500">
                          {stats.totalWeightG > 0 ? `${((p.totalG / stats.totalWeightG) * 100).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td className="td text-slate-600">TOTAL</td>
                      <td className="td text-right tabular-nums">{stats.totalBoxes}</td>
                      <td className="td text-right tabular-nums">{stats.totalUnits}</td>
                      <td className="td text-right tabular-nums text-polar-800">{fmtG(stats.totalWeightG)}</td>
                      <td className="td text-right text-slate-400">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Historial de Vueltas */}
          {stats.vueltas.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-700">Historial de Vueltas</h3>
                  <p className="text-xs text-slate-400">{stats.vueltas.length} vuelta{stats.vueltas.length > 1 ? 's' : ''} registrada{stats.vueltas.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {stats.vueltas.map(v => {
                  const vm = VUELTA_META[v.status] ?? VUELTA_META.cuadra
                  return (
                    <div key={v._id} className={`px-5 py-3 flex items-center justify-between border-l-4 ${vm.bg.split(' ')[1]}`}>
                      <div>
                        <p className="font-mono text-xs text-slate-400">{v.fichaNumero}</p>
                        <p className="text-sm font-semibold text-slate-700">{v.date} · {v.hora}</p>
                        <p className="text-xs text-slate-500">
                          Vendido: {fmtG(v.totalVendidoG)} · Retornado: {fmtG(v.totalRetornadoG)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-xl font-black tabular-nums ${vm.cls}`}>{fmtPct(v.pctDiff ?? 0)}</p>
                          <p className={`text-xs font-bold ${vm.cls}`}>{vm.icon}</p>
                        </div>
                        <button
                          onClick={() => setFichaOpen(v)}
                          className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-2.5 py-1 rounded-lg"
                        >
                          🖨 Ficha
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historial de Sobrantes */}
          {stats.sobrantes.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-100 bg-amber-50">
                <h3 className="font-bold text-amber-800">Sobrantes del Período</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {stats.sobrantes.map(s => (
                  <div key={s._id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{s.date} · {s.hora}</p>
                      <p className="text-xs text-slate-500">
                        {s.items?.map(i => `${i.productName}: ${i.unidades} ud`).join(' · ')}
                      </p>
                      {s.notas && <p className="text-xs italic text-slate-400 mt-0.5">{s.notas}</p>}
                    </div>
                    <p className="font-bold text-amber-700 tabular-nums">{fmtG(s.totalWeightG)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Acciones admin */}
      {isAdmin(user) && (
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            ⚙️ Gestionar en Admin
          </button>
          <button onClick={() => navigate('/despacho')} className="btn-primary">
            + Nuevo Despacho
          </button>
        </div>
      )}

      {fichaOpen && <FichaChofer vuelta={fichaOpen} onClose={() => setFichaOpen(null)} />}
    </div>
  )
}
