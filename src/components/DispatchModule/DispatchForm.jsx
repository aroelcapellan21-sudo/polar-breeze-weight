import { useState } from 'react'
import toast from 'react-hot-toast'
import { PRODUCTS, getProductById } from '../../data/products.js'
import { calcDispatchWeight, fmtGrams } from '../../utils/mathEngine.js'
import { currentPeriod } from '../Layout/PeriodSelector.jsx'
import { useChoferes, useDespachos } from '../../hooks/useFirestore.js'

const emptyItem = () => ({ productId: '', boxes: 1 })

export default function DispatchForm({ onSaved }) {
  const { drivers }        = useChoferes()
  const { add: addDespacho } = useDespachos(currentPeriod())

  const [driverId, setDriverId] = useState('')
  const [period]                = useState(currentPeriod())
  const [items, setItems]       = useState([emptyItem()])
  const [saving, setSaving]     = useState(false)

  const updateItem = (idx, field, val) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  const addItem    = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const validItems = items.filter(it => it.productId && Number(it.boxes) > 0)
  const totalGrams = calcDispatchWeight(validItems)
  const driver     = drivers.find(d => d.id === driverId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!driverId)              return toast.error('Selecciona un chofer')
    if (validItems.length === 0) return toast.error('Agrega al menos un producto')

    setSaving(true)
    try {
      const builtItems = validItems.map(it => {
        const p = getProductById(it.productId)
        return {
          productId:   it.productId,
          productName: p.name,
          boxes:       Number(it.boxes),
          units:       p.unitsPerBox * Number(it.boxes),
          unitG:       p.weightPerUnit,
          boxG:        p.weightPerBox,
          totalG:      p.weightPerBox * Number(it.boxes),
        }
      })

      const despacho = {
        driverId,
        driverName:   driver?.name ?? driverId,
        date:         new Date().toISOString().slice(0, 10),
        period,
        items:        builtItems,
        totalBoxes:   builtItems.reduce((s, i) => s + i.boxes, 0),
        totalUnits:   builtItems.reduce((s, i) => s + i.units, 0),
        totalWeightG: totalGrams,
      }

      // Firebase como primario
      await addDespacho(despacho)

      onSaved?.(despacho)
      toast.success('Despacho guardado en Firebase')
      setItems([emptyItem()])
      setDriverId('')
    } catch (err) {
      toast.error(err.message || 'Error al guardar en Firebase')
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
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.code ? `${d.code} · ` : ''}{d.name}{d.route ? ` (${d.route})` : ''}
              </option>
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
          const product   = getProductById(item.productId)
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
                    {p.name} ({p.weightPerBox} g/caja · {p.unitsPerBox} ud)
                  </option>
                ))}
              </select>
              <input
                type="number" min={1}
                value={item.boxes}
                onChange={e => updateItem(idx, 'boxes', e.target.value)}
                className="input w-24 text-right"
                placeholder="Cajas"
              />
              <span className="text-xs text-slate-500 w-28 text-right tabular-nums">
                {rowWeight > 0 ? fmtGrams(rowWeight) : '—'}
                {product && rowWeight > 0 && (
                  <span className="block text-slate-400">{product.unitsPerBox * Number(item.boxes)} ud</span>
                )}
              </span>
              <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 px-1">✕</button>
            </div>
          )
        })}
      </div>

      {/* Resumen peso */}
      <div className="bg-polar-50 rounded-lg p-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-polar-800 block">Peso total del despacho</span>
          <span className="text-xs text-polar-500">
            {validItems.reduce((s, it) => { const p = getProductById(it.productId); return p ? s + p.unitsPerBox * Number(it.boxes) : s }, 0)} unidades ·{' '}
            {validItems.reduce((s, it) => s + Number(it.boxes), 0)} cajas
          </span>
        </div>
        <span className="text-2xl font-bold text-polar-700 tabular-nums">{fmtGrams(totalGrams)}</span>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Guardando en Firebase...' : 'Registrar Despacho'}
      </button>
    </form>
  )
}
