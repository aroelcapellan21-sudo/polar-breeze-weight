import { useState } from 'react'
import toast from 'react-hot-toast'
import { PRODUCTS } from '../../data/products.js'
import { DRIVERS } from '../../data/drivers.js'
import { calcDispatchWeight, fmtGrams } from '../../utils/mathEngine.js'
import { getProductById } from '../../data/products.js'
import { currentPeriod } from '../Layout/PeriodSelector.jsx'
import { saveDispatch } from '../../services/sheetsService.js'
import { useSheets } from '../../hooks/useSheets.js'

const emptyItem = () => ({ productId: '', boxes: 1 })

export default function DispatchForm({ onSaved }) {
  const { signedIn } = useSheets()
  const [driverId, setDriverId]   = useState('')
  const [period]                  = useState(currentPeriod())
  const [items, setItems]         = useState([emptyItem()])
  const [saving, setSaving]       = useState(false)

  const updateItem = (idx, field, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  }
  const addItem    = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const validItems = items.filter(it => it.productId && it.boxes > 0)
  const totalGrams = calcDispatchWeight(validItems)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!driverId)              return toast.error('Selecciona un chofer')
    if (validItems.length === 0) return toast.error('Agrega al menos un producto')

    setSaving(true)
    try {
      const dispatch = {
        id:      `D-${Date.now()}`,
        date:    new Date().toISOString().slice(0, 10),
        driverId,
        period,
        items:   validItems.map(it => {
          const p = getProductById(it.productId)
          return {
            productId: it.productId,
            boxes:     Number(it.boxes),
            weightG:   p.weightPerBox * Number(it.boxes),
          }
        }),
        totalWeightG: totalGrams,
      }

      if (signedIn) await saveDispatch(dispatch)
      onSaved?.(dispatch)
      toast.success('Despacho registrado')
      setItems([emptyItem()])
      setDriverId('')
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Chofer</label>
          <select value={driverId} onChange={e => setDriverId(e.target.value)} className="input">
            <option value="">— Seleccionar —</option>
            {DRIVERS.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.route})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Período</label>
          <input readOnly value={period} className="input bg-slate-50 text-slate-500" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Productos despachados</span>
          <button type="button" onClick={addItem} className="btn-secondary text-xs py-1">
            + Agregar fila
          </button>
        </div>

        {items.map((item, idx) => {
          const product = getProductById(item.productId)
          const rowWeight = product ? product.weightPerBox * Number(item.boxes) : 0
          return (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={item.productId}
                onChange={e => updateItem(idx, 'productId', e.target.value)}
                className="input flex-1"
              >
                <option value="">— Producto —</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.weightPerBox} g/caja)
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.boxes}
                onChange={e => updateItem(idx, 'boxes', e.target.value)}
                className="input w-24 text-right"
                placeholder="Cajas"
              />
              <span className="text-xs text-slate-500 w-24 text-right tabular-nums">
                {rowWeight > 0 ? fmtGrams(rowWeight) : '—'}
              </span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-400 hover:text-red-600 px-1"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-polar-50 rounded-lg p-4">
        <span className="text-sm font-semibold text-polar-800">Peso total del despacho</span>
        <span className="text-2xl font-bold text-polar-700 tabular-nums">{fmtGrams(totalGrams)}</span>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Guardando...' : 'Registrar Despacho'}
      </button>
    </form>
  )
}
