import { useState } from 'react'
import toast from 'react-hot-toast'
import { PRODUCTS, getProductById } from '../../data/products.js'
import { fmtGrams } from '../../utils/mathEngine.js'
import { currentPeriod } from '../Layout/PeriodSelector.jsx'
import { useChoferes, useSobrantes } from '../../hooks/useFirestore.js'

const emptyEntry = () => ({ productId: '', unidades: 0 })

export default function SobrantesForm({ onSaved }) {
  const { drivers }       = useChoferes()
  const { add }           = useSobrantes(currentPeriod())

  const [driverId, setDriverId] = useState('')
  const [period]                = useState(currentPeriod())
  const [hora, setHora]         = useState(() => new Date().toTimeString().slice(0, 5))
  const [entries, setEntries]   = useState([emptyEntry()])
  const [notas, setNotas]       = useState('')
  const [saving, setSaving]     = useState(false)

  const update = (idx, field, val) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e))

  const validEntries = entries.filter(e => e.productId && Number(e.unidades) > 0)
  const totalG = validEntries.reduce((s, e) => {
    const p = getProductById(e.productId)
    return p ? s + p.weightPerUnit * Number(e.unidades) : s
  }, 0)
  const driver = drivers.find(d => d.id === driverId)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!driverId)              return toast.error('Selecciona un chofer')
    if (validEntries.length === 0) return toast.error('Agrega al menos un producto')

    setSaving(true)
    try {
      const sobrante = {
        driverId,
        driverName: driver?.name ?? driverId,
        date:       new Date().toISOString().slice(0, 10),
        period,
        hora,
        items: validEntries.map(e => {
          const p = getProductById(e.productId)
          return {
            productId:   e.productId,
            productName: p.name,
            unidades:    Number(e.unidades),
            weightG:     p.weightPerUnit * Number(e.unidades),
          }
        }),
        totalWeightG: totalG,
        notas,
      }

      await add(sobrante)
      onSaved?.(sobrante)
      toast.success('Sobrante registrado en Firebase')
      setEntries([emptyEntry()])
      setDriverId('')
      setNotas('')
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
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Hora de retorno</label>
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Período</label>
          <input readOnly value={period} className="input bg-slate-50 text-slate-500" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Productos sobrantes</span>
          <button type="button" onClick={() => setEntries(p => [...p, emptyEntry()])} className="btn-secondary text-xs py-1">
            + Agregar fila
          </button>
        </div>
        {entries.map((entry, idx) => {
          const product  = getProductById(entry.productId)
          const rowWeight = product ? product.weightPerUnit * Number(entry.unidades) : 0
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
                type="number" min={0}
                value={entry.unidades}
                onChange={e => update(idx, 'unidades', e.target.value)}
                className="input w-28 text-right"
                placeholder="Unidades"
              />
              <span className="text-xs text-slate-500 w-24 text-right tabular-nums">
                {rowWeight > 0 ? fmtGrams(rowWeight) : '—'}
              </span>
              <button type="button" onClick={() => setEntries(p => p.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 px-1">✕</button>
            </div>
          )
        })}
      </div>

      <div>
        <label className="label">Observaciones</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={2}
          className="input resize-none"
          placeholder="Motivo del sobrante, daños, etc."
        />
      </div>

      <div className="bg-amber-50 rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-amber-800">Peso total sobrante</span>
        <span className="text-2xl font-bold text-amber-700 tabular-nums">{fmtGrams(totalG)}</span>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full bg-amber-600 hover:bg-amber-700">
        {saving ? 'Guardando...' : 'Registrar Sobrante'}
      </button>
    </form>
  )
}
