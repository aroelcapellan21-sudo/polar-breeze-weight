import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getProductById } from '../../data/products.js'
import { fmtGrams } from '../../utils/mathEngine.js'
import { currentPeriod } from '../Layout/PeriodSelector.jsx'
import { useChoferes, useDespachosByDriver, useVueltas } from '../../hooks/useFirestore.js'

const TOLERANCE = { green: 0.03, yellow: 0.05 }

function calcStatus(dispG, vendG) {
  if (dispG === 0) return 'sin-datos'
  const pct = Math.abs(dispG - vendG) / dispG
  if (pct <= TOLERANCE.green)  return 'cuadra'
  if (pct <= TOLERANCE.yellow) return 'revisar'
  return 'auditoria'
}

let fichaSeq = 1

export default function VueltaForm({ onSaved }) {
  const period          = currentPeriod()
  const { drivers }     = useChoferes()
  const { add }         = useVueltas(period)

  const [driverId, setDriverId]         = useState('')
  const [hora, setHora]                 = useState(() => new Date().toTimeString().slice(0, 5))
  const [observaciones, setObservaciones] = useState('')
  const [retornos, setRetornos]         = useState({})
  const [saving, setSaving]             = useState(false)

  const { despachos, loading } = useDespachosByDriver(driverId, period)

  // Consolida todos los despachos del chofer en el período
  const consolidated = useMemo(() => {
    const map = {}
    for (const desp of despachos) {
      for (const it of (desp.items ?? [])) {
        if (!map[it.productId]) {
          map[it.productId] = {
            productId:   it.productId,
            productName: it.productName ?? getProductById(it.productId)?.name ?? it.productId,
            unitG:       it.unitG ?? getProductById(it.productId)?.weightPerUnit ?? 0,
            despachadas: 0,
          }
        }
        map[it.productId].despachadas += it.units ?? 0
      }
    }
    return Object.values(map)
  }, [despachos])

  // Reinicia retornos cuando cambia el chofer
  useEffect(() => {
    setRetornos({})
  }, [driverId])

  const driver = drivers.find(d => d.id === driverId)

  // Calcula métricas por producto
  const items = consolidated.map(c => {
    const retornadas  = Number(retornos[c.productId] ?? 0)
    const vendidas    = Math.max(c.despachadas - retornadas, 0)
    return {
      ...c,
      retornadas,
      vendidas,
      pesoDespachadoG: c.unitG * c.despachadas,
      pesoRetornadoG:  c.unitG * retornadas,
      pesoVendidoG:    c.unitG * vendidas,
    }
  })

  const totalDespachadoG = items.reduce((s, i) => s + i.pesoDespachadoG, 0)
  const totalRetornadoG  = items.reduce((s, i) => s + i.pesoRetornadoG,  0)
  const totalVendidoG    = items.reduce((s, i) => s + i.pesoVendidoG,    0)
  const diffG            = totalDespachadoG - totalVendidoG
  const pctDiff          = totalDespachadoG > 0 ? diffG / totalDespachadoG : 0
  const status           = calcStatus(totalDespachadoG, totalVendidoG)

  const STATUS_META = {
    cuadra:    { label: '✅ Cuadra',    cls: 'bg-green-100 text-green-800 border-green-300' },
    revisar:   { label: '⚠️ Revisar',   cls: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    auditoria: { label: '🚨 Auditoría', cls: 'bg-red-100 text-red-800 border-red-300' },
    'sin-datos': { label: '— Sin datos', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!driverId)         return toast.error('Selecciona un chofer')
    if (items.length === 0) return toast.error('Este chofer no tiene despachos en el período')

    setSaving(true)
    try {
      const vuelta = {
        fichaNumero:     `FICHA-${new Date().toISOString().slice(0, 10)}-${driverId}-${String(fichaSeq++).padStart(3, '0')}`,
        driverId,
        driverName:      driver?.name ?? driverId,
        route:           driver?.route ?? '',
        date:            new Date().toISOString().slice(0, 10),
        period,
        hora,
        items,
        totalDespachadoG,
        totalRetornadoG,
        totalVendidoG,
        diffG,
        pctDiff,
        status,
        observaciones,
      }

      await add(vuelta)
      onSaved?.(vuelta)
      toast.success('Vuelta registrada — Ficha guardada en Firebase')
      setDriverId('')
      setRetornos({})
      setObservaciones('')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Chofer</label>
          <select value={driverId} onChange={e => setDriverId(e.target.value)} className="input">
            <option value="">— Seleccionar —</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Hora de llegada</label>
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Período</label>
          <input readOnly value={period} className="input bg-slate-50 text-slate-500" />
        </div>
      </div>

      {/* Tabla de liquidación */}
      {driverId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Liquidación de Productos</span>
            {loading && <span className="text-xs text-slate-400 animate-pulse">Cargando despachos...</span>}
          </div>

          {items.length === 0 && !loading && (
            <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg">
              Sin despachos registrados para este chofer en el período actual.
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Despachado</th>
                    <th className="px-3 py-2 text-right">Retorno (ud)</th>
                    <th className="px-3 py-2 text-right">Vendido</th>
                    <th className="px-3 py-2 text-right">Peso vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.productId} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium">{it.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-blue-700">{it.despachadas} ud</td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={it.despachadas}
                          value={retornos[it.productId] ?? 0}
                          onChange={e => setRetornos(p => ({ ...p, [it.productId]: e.target.value }))}
                          className="input w-24 text-right text-amber-700 font-semibold"
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-green-700">
                        {it.vendidas} ud
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {fmtGrams(it.pesoVendidoG)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Resumen de pesos */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Despachado',  val: fmtGrams(totalDespachadoG), cls: 'border-blue-300 bg-blue-50 text-blue-800'   },
            { label: 'Retornado',   val: fmtGrams(totalRetornadoG),  cls: 'border-amber-300 bg-amber-50 text-amber-800' },
            { label: 'Vendido',     val: fmtGrams(totalVendidoG),    cls: 'border-green-300 bg-green-50 text-green-800' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg border-2 px-4 py-3 text-center ${s.cls}`}>
              <p className="text-xs font-semibold opacity-70">{s.label}</p>
              <p className="text-lg font-black tabular-nums">{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Estado del cruce */}
      {items.length > 0 && (
        <div className={`rounded-xl border-2 px-5 py-3 flex items-center justify-between ${STATUS_META[status].cls}`}>
          <div>
            <span className="text-lg font-bold">{STATUS_META[status].label}</span>
            <p className="text-xs opacity-70 mt-0.5">
              Diferencia: {fmtGrams(Math.abs(diffG))} ({(Math.abs(pctDiff) * 100).toFixed(2)}%)
              {status === 'cuadra'    && ' — dentro del margen ±3%'}
              {status === 'revisar'   && ' — entre ±3% y ±5%, revisar'}
              {status === 'auditoria' && ' — más del ±5%, requiere auditoría'}
            </p>
          </div>
          <span className="text-3xl font-black tabular-nums">{(Math.abs(pctDiff) * 100).toFixed(2)}%</span>
        </div>
      )}

      {/* Observaciones */}
      <div>
        <label className="label">Observaciones de la vuelta</label>
        <textarea
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          rows={2}
          className="input resize-none"
          placeholder="Incidentes, derrames, mermas, novedades..."
        />
      </div>

      <button
        type="submit"
        disabled={saving || items.length === 0}
        className="btn-primary w-full bg-teal-600 hover:bg-teal-700"
      >
        {saving ? 'Guardando ficha...' : 'Registrar Vuelta y Generar Ficha'}
      </button>
    </form>
  )
}
