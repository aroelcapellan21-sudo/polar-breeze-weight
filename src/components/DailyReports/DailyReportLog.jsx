import { getDriverById } from '../../data/drivers.js'
import { getProductById } from '../../data/products.js'
import { fmtGrams } from '../../utils/mathEngine.js'

export default function DailyReportLog({ reports }) {
  if (reports.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-6">Sin reportes registrados.</p>
  }

  return (
    <div className="space-y-3">
      {[...reports].reverse().map(r => {
        const driver = getDriverById(r.driverId)
        const totalGrams = r.entries.reduce((s, e) => s + e.weightG, 0)
        const totalUnits = r.entries.reduce((s, e) => s + e.unitsSold, 0)
        return (
          <div key={r.id} className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{driver?.name ?? r.driverId}</span>
                <span className="ml-2 text-xs text-slate-400">{r.date}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{totalUnits} unidades</span>
                <span className="font-bold text-green-700 tabular-nums">{fmtGrams(totalGrams)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <td className="py-1">Producto</td>
                    <td className="py-1 text-right">Uds.</td>
                    <td className="py-1 text-right">Peso</td>
                  </tr>
                </thead>
                <tbody>
                  {r.entries.map((e, idx) => {
                    const p = getProductById(e.productId)
                    return (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="py-1 text-slate-600">{p?.name ?? e.productId}</td>
                        <td className="py-1 text-right tabular-nums">{e.unitsSold}</td>
                        <td className="py-1 text-right tabular-nums">{fmtGrams(e.weightG)}</td>
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
