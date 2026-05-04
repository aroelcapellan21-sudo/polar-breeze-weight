import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  updateChofer, bajaChofer, reactivarChofer,
} from '../../services/firestoreService.js'

const STATUS = {
  activo: { icon: '✅', label: 'Activo', badge: 'badge-green' },
  baja:   { icon: '🔒', label: 'Baja',   badge: 'badge-red'   },
}

function DriverRow({ chofer, onRefresh }) {
  const [editing, setEditing]   = useState(false)
  const [editForm, setEditForm] = useState({ nombre: chofer.nombre ?? '', ruta: chofer.ruta ?? '', codigo: chofer.codigo ?? '' })
  const [bajaNota, setBajaNota] = useState('')
  const [showBaja, setShowBaja] = useState(false)
  const [loading, setLoading]   = useState(false)

  const status = chofer.status === 'baja' ? 'baja' : 'activo'
  const meta   = STATUS[status]
  const id     = chofer._id

  const save = async () => {
    setLoading(true)
    try {
      await updateChofer(id, editForm)
      toast.success('Perfil actualizado')
      setEditing(false)
      onRefresh?.()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const handleBaja = async () => {
    setLoading(true)
    try {
      await bajaChofer(id, bajaNota)
      toast.success('Chofer dado de baja')
      setShowBaja(false)
      onRefresh?.()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const handleReactivar = async () => {
    setLoading(true)
    try {
      await reactivarChofer(id)
      toast.success('Chofer reactivado')
      onRefresh?.()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className={`card p-4 space-y-3 border-l-4 ${
      status === 'activo' ? 'border-green-400' : 'border-red-400'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={meta.badge}>{meta.icon} {meta.label}</span>
            <span className="font-mono text-xs text-slate-400">{chofer.ficha ?? id}</span>
            {chofer.codigo && <span className="text-xs text-slate-400">{chofer.codigo}</span>}
          </div>
          <p className="font-bold text-slate-800 text-lg">{chofer.nombre ?? id}</p>
          <p className="text-xs text-slate-500">{chofer.ruta ?? '—'}</p>
          {status === 'baja' && chofer.bajaNota && (
            <p className="text-xs text-red-500 mt-1 italic">Motivo baja: {chofer.bajaNota}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => setEditing(e => !e)} className="btn-secondary text-xs py-1 px-2">✏️ Editar</button>
          {status !== 'baja'
            ? <button onClick={() => setShowBaja(b => !b)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-lg border border-red-200">🔒 Baja</button>
            : <button onClick={handleReactivar} disabled={loading} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-lg border border-green-200">♻️ Reactivar</button>
          }
        </div>
      </div>

      {/* Editar perfil */}
      {editing && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200">
          <p className="text-xs font-semibold text-slate-600">Editar perfil</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={editForm.nombre} onChange={e => setEditForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre" className="input text-sm" />
            <input value={editForm.codigo} onChange={e => setEditForm(f=>({...f,codigo:e.target.value}))} placeholder="Código #0042" className="input text-sm" />
          </div>
          <input value={editForm.ruta} onChange={e => setEditForm(f=>({...f,ruta:e.target.value}))} placeholder="Ruta" className="input text-sm" />
          <div className="flex gap-2">
            <button onClick={save} disabled={loading} className="btn-primary text-xs py-1">Guardar</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1">Cancelar</button>
          </div>
        </div>
      )}

      {/* Dar de baja */}
      {showBaja && (
        <div className="bg-red-50 rounded-lg p-3 space-y-2 border border-red-200">
          <p className="text-xs font-semibold text-red-700">¿Dar de baja a {chofer.nombre}?</p>
          <p className="text-xs text-red-500">El historial se conserva. Puedes reactivarlo después.</p>
          <input value={bajaNota} onChange={e => setBajaNota(e.target.value)} placeholder="Motivo (opcional)" className="input text-sm" />
          <div className="flex gap-2">
            <button onClick={handleBaja} disabled={loading} className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg">
              Confirmar Baja
            </button>
            <button onClick={() => setShowBaja(false)} className="btn-secondary text-xs py-1">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DriverManager({ choferes, loading, onRefresh }) {
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const filtered = choferes.filter(c => {
    const statusOk = filter === 'todos' || c.status === filter
    const searchOk = !search || (c.nombre ?? '').toLowerCase().includes(search.toLowerCase()) || (c.ficha ?? '').toLowerCase().includes(search.toLowerCase())
    return statusOk && searchOk
  })

  const counts = {
    todos:  choferes.length,
    activo: choferes.filter(c => c.status !== 'baja').length,
    baja:   choferes.filter(c => c.status === 'baja').length,
  }

  if (loading) return <p className="text-slate-400 text-sm text-center py-8">Cargando choferes...</p>

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ficha..."
          className="input max-w-xs text-sm"
        />
        {[
          { id: 'todos',  label: `Todos (${counts.todos})`      },
          { id: 'activo', label: `✅ Activos (${counts.activo})` },
          { id: 'baja',   label: `🔒 Bajas (${counts.baja})`    },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              filter === f.id ? 'bg-polar-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0
        ? <p className="text-slate-400 text-sm text-center py-6">Sin choferes en este filtro.</p>
        : <div className="space-y-3">
            {filtered.map(c => (
              <DriverRow key={c._id} chofer={c} onRefresh={onRefresh} />
            ))}
          </div>
      }
    </div>
  )
}
