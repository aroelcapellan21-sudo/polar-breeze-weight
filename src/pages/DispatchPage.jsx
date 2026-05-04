import { useState } from 'react'
import DispatchForm from '../components/DispatchModule/DispatchForm.jsx'
import DispatchLog from '../components/DispatchModule/DispatchLog.jsx'
import { useDispatches } from '../hooks/useLocalStore.js'
import { getProductById } from '../data/products.js'

export default function DispatchPage() {
  const { dispatches, add } = useDispatches()
  const [tab, setTab] = useState('form')

  const handleSaved = (dispatch) => {
    // Normalise to local store format
    add(dispatch.driverId, dispatch.items, dispatch.period)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Módulo de Despacho</h1>
        <p className="text-sm text-slate-500">Registra productos y cajas despachadas por chofer</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[{ id: 'form', label: 'Nuevo Despacho' }, { id: 'log', label: `Historial (${dispatches.length})` }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-polar-600 text-polar-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'form'
          ? <DispatchForm onSaved={handleSaved} />
          : <DispatchLog dispatches={dispatches} />
        }
      </div>
    </div>
  )
}
