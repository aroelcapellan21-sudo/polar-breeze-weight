import { getDriverById } from '../../data/drivers.js'
import { getProductById } from '../../data/products.js'
import { fmtGrams } from '../../utils/mathEngine.js'

export default function DispatchLog({ dispatches }) {
  if (dispatches.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-6">Sin despachos registrados.</p>
  }

  return (
    <div className="space-y-3">
      {[...dispatches].reverse().map(d => {
        const driver = getDriverById(d.driverId)
        const totalGrams = d.items.reduce((s, it) => s + it.weightG, 0)
        return (
          <div key={d.id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{driver?.name ?? d.driverId}</span>
                <span className="ml-2 text-xs text-slate-400">{driver?.route}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{d.date}</span>
                <span className="font-bold text-polar-700 tabular-nums">{fmtGrams(totalGrams)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <td className="py-1">Producto</td>
                    <td className="py-1 text-right">Cajas</td>
                    <td className="py-1 text-right">Peso</td>
                  </tr>
                </thead>
                <tbody>
                  {d.items.map((it, idx) => {
                    const p = getProductById(it.productId)
                    return (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="py-1 text-slate-600">{p?.name ?? it.productId}</td>
                        <td className="py-1 text-right tabular-nums">{it.boxes}</td>
                        <td className="py-1 text-right tabular-nums">{fmtGrams(it.weightG)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
