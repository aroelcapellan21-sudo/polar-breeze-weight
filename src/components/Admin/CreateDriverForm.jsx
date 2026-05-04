import { useState } from 'react'
import toast from 'react-hot-toast'
import { createChofer } from '../../services/firestoreService.js'
import { hashPassword } from '../../services/authService.js'

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
      // Contraseña inicial = ficha (el chofer puede cambiarla al registrarse)
      const passwordHash = await hashPassword(ficha.trim().toUpperCase())
      await createChofer({
        ficha:        ficha.trim().toUpperCase(),
        nombre:       nombre.trim(),
        ruta:         form.ruta.trim(),
        codigo:       form.codigo.trim(),
        passwordHash,
      })
      toast.success(`Chofer "${nombre}" creado. Contraseña inicial = ficha`)
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
          <p className="text-xs text-slate-400 mt-1">La contraseña inicial será igual a la ficha</p>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Al crear el perfil:</p>
        <p>• Estado inicial: <strong>⚪ Pendiente</strong></p>
        <p>• El chofer usa <strong>/registrarse</strong> para activar su cuenta (una sola vez)</p>
        <p>• Contraseña temporal = su número de ficha</p>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Creando perfil...' : 'Crear Perfil de Chofer'}
      </button>
    </form>
  )
}
