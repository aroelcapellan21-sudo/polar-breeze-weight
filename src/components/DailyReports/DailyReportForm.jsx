import { useState } from 'react'
import toast from 'react-hot-toast'
import { PRODUCTS } from '../../data/products.js'
import { DRIVERS } from '../../data/drivers.js'
import { getProductById } from '../../data/products.js'
import { calcSoldWeight, fmtGrams } from '../../utils/mathEngine.js'
import { currentPeriod } from '../Layout/PeriodSelector.jsx'
import { saveDailyReport } from '../../services/sheetsService.js'
import { useSheets } from '../../hooks/useSheets.js'

const emptyEntry = () => ({ productId: '', unitsSold: 0 })

export default function DailyReportForm({ onSaved }) {
  const { signedIn } = useSheets()
  const [driverId, setDriverId] = useState('')
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10))
  const [period]                = useState(currentPeriod())
  const [entries, setEntries]   = useState([emptyEntry()])
  const [saving, setSaving]     = useState(false)

  const update = (idx, field, val) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e))

  const validEntries = entries.filter(e => e.productId && Number(e.unitsSold) > 0)
  const totalSoldGrams = calcSoldWeight(
    validEntries.map(e => ({ productId: e.productId, unitsSold: Number(e.unitsSold) }))
  )

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!driverId)              return toast.error('Selecciona un chofer')
    if (validEntries.length === 0) return toast.error('Agrega ventas')

    setSaving(true)
    try {
      const report = {
        id:      `R-${Date.now()}`,
        date,
        driverId,
        period,
        entries: validEntries.map(e => {
          const p = getProductById(e.productId)
          return {
            productId:  e.productId,
            unitsSold:  Number(e.unitsSold),
            weightG:    p.weightPerUnit * Number(e.unitsSold),
          }
        }),
      }

      if (signedIn) await saveDailyReport(report)
      onSaved?.(report)
      toast.success('Reporte guardado')
      setEntries([emptyEntry()])
      setDriverId('')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Chofer</label>
          <select value={driverId} onChange={e => setDriverId(e.target.value)} className="input">
            <option value="">— Seleccionar —</option>
            {DRIVERS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Período</label>
          <input readOnly value={period} className="input bg-slate-50 text-slate-500" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Unidades vendidas por producto</span>
          <button type="button" onClick={() => setEntries(p => [...p, emptyEntry()])} className="btn-secondary text-xs py-1">
            + Agregar fila
          </button>
        </div>

        {entries.map((entry, idx) => {
          const product = getProductById(entry.productId)
          const rowWeight = product ? product.weightPerUnit * Number(entry.unitsSold) : 0
          return (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={entry.productId}
                onChange={e => update(idx, 'productId', e.target.value)}
                className="input flex-1"
              >
                <option value="">— Producto —</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.weightPerUnit} g/ud)</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={entry.unitsSold}
                onChange={e => update(idx, 'unitsSold', e.target.value)}
                className="input w-28 text-right"
                placeholder="Unidades"
              />
              <span className="text-xs text-slate-500 w-24 text-right tabular-nums">
                {rowWeight > 0 ? fmtGrams(rowWeight) : '—'}
              </span>
              <button
                type="button"
                onClick={() => setEntries(p => p.filter((_, i) => i !== idx))}
                className="text-red-400 hover:text-red-600 px-1"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
        <span className="text-sm font-semibold text-green-800">Peso total vendido (reportado)</span>
        <span className="text-2xl font-bold text-green-700 tabular-nums">{fmtGrams(totalSoldGrams)}</span>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Guardando...' : 'Guardar Reporte Diario'}
      </button>
    </form>
  )
}
