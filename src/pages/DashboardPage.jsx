import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, isAdmin } from '../context/AuthContext.jsx'
import DriverCard from '../components/Dashboard/DriverCard.jsx'
import PeriodSelector, { currentPeriod } from '../components/Layout/PeriodSelector.jsx'
import { useChoferesAdmin } from '../hooks/useFirestore.js'

export default function DashboardPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [period, setPeriod] = useState(currentPeriod())
  const [filter, setFilter] = useState('activo')

  const { choferes, loading } = useChoferesAdmin()

  const filtered = choferes.filter(c => {
    if (filter === 'todos') return true
    return (c.status ?? 'pendiente') === filter
  })

  const counts = {
    activo:    choferes.filter(c => c.status === 'activo').length,
    pendiente: choferes.filter(c => (c.status ?? 'pendiente') === 'pendiente').length,
    baja:      choferes.filter(c => c.status === 'baja').length,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Sesión: <strong>{user?.nombre}</strong>
            {isAdmin(user) && (
              <button
                onClick={() => navigate('/admin')}
                className="ml-3 text-xs bg-slate-800 text-white px-2.5 py-1 rounded-lg hover:bg-slate-700"
              >
                ⚙️ Panel Admin
              </button>
            )}
          </p>
        </div>
        <div>
          <label className="label">Período</label>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'activo',    label: `✅ Activos (${counts.activo})`      },
          { id: 'pendiente', label: `⚪ Pendientes (${counts.pendiente})` },
          { id: 'baja',      label: `🔒 Bajas (${counts.baja})`           },
          { id: 'todos',     label: `Todos (${choferes.length})`           },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.id
                ? 'bg-polar-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100 border-0" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🚚</p>
          <p className="font-semibold">Sin choferes en este estado</p>
          {isAdmin(user) && (
            <button onClick={() => navigate('/admin')} className="btn-primary mt-4">
              Crear primer chofer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(chofer => (
            <DriverCard key={chofer._id} chofer={chofer} period={period} />
          ))}
        </div>
      )}
    </div>
  )
}
