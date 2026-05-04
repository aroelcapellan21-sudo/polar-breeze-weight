import { useState } from 'react'
import toast from 'react-hot-toast'
import { createChofer } from '../../services/firestoreService.js'

export default function CreateDriverForm({ onCreated }) {
  const [form, setForm] = useState({ ficha: '', nombre: '', ruta: '', codigo: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { ficha, nombre } = form
    if (!ficha.trim() || !nombre.trim()) return toast.error('Ficha y nombre son obligatorios')

    setSaving(true)
    try {
      await createChofer({
        ficha:  ficha.trim().toUpperCase(),
        nombre: nombre.trim(),
        ruta:   form.ruta.trim(),
        codigo: form.codigo.trim(),
      })
      toast.success(`Chofer "${nombre}" creado`)
      setForm({ ficha: '', nombre: '', ruta: '', codigo: '' })
      onCreated?.()
    } catch (err) {
      toast.error(err.message || 'Error al crear chofer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Número de Ficha *</label>
          <input
            value={form.ficha}
            onChange={e => set('ficha', e.target.value)}
            placeholder="CH-42"
            className="input uppercase font-mono"
          />
        </div>
        <div>
          <label className="label">Código de chofer</label>
          <input
            value={form.codigo}
            onChange={e => set('codigo', e.target.value)}
            placeholder="#0042"
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label">Nombre completo *</label>
        <input
          value={form.nombre}
          onChange={e => set('nombre', e.target.value)}
          placeholder="Juan Pérez"
          className="input"
        />
      </div>
      <div>
        <label className="label">Ruta asignada</label>
        <input
          value={form.ruta}
          onChange={e => set('ruta', e.target.value)}
          placeholder="Zona Norte"
          className="input"
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Creando perfil...' : 'Crear Perfil de Chofer'}
      </button>
    </form>
  )
}
