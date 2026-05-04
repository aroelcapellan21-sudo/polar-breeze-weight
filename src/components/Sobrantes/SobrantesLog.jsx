import { fmtGrams } from '../../utils/mathEngine.js'

export default function SobrantesLog({ sobrantes, loading }) {
  if (loading) return <p className="text-slate-400 text-sm text-center py-6">Cargando Firebase...</p>
  if (sobrantes.length === 0) return <p className="text-slate-400 text-sm text-center py-6">Sin sobrantes registrados.</p>

  return (
    <div className="space-y-3">
      {sobrantes.map(s => (
        <div key={s._id} className="card p-4 border-l-4 border-amber-400 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">{s.driverName}</span>
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {s.hora}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">{s.date}</span>
              <span className="font-bold text-amber-700 tabular-nums">{fmtGrams(s.totalWeightG)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            {s.items?.map((it, i) => (
              <div key={i} className="flex justify-between bg-amber-50 rounded px-2 py-1">
                <span className="text-slate-600">{it.productName}</span>
                <span className="font-semibold tabular-nums">{it.unidades} ud · {fmtGrams(it.weightG)}</span>
              </div>
            ))}
          </div>

          {s.notas && (
            <p className="text-xs text-slate-500 italic bg-slate-50 rounded px-2 py-1">
              {s.notas}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {s.syncedToSheets
                ? <span className="text-green-600">✓ Sincronizado con Sheets</span>
                : <span className="text-amber-500">⏳ Pendiente de sincronizar</span>
              }
            </span>
            <span className="font-mono">{s._id?.slice(-6)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
