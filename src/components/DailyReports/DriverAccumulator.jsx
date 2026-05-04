import { useMemo } from 'react'
import { DRIVERS } from '../../data/drivers.js'
import { getProductById } from '../../data/products.js'
import { accumulateDailyReports, fmtGrams } from '../../utils/mathEngine.js'

// Acumulado de ventas por chofer en el período
export default function DriverAccumulator({ reports }) {
  const accumulated = useMemo(() => accumulateDailyReports(reports), [reports])

  const rows = DRIVERS.map(driver => {
    const byProduct = accumulated[driver.id] || {}
    const totalUnits = Object.values(byProduct).reduce((s, v) => s + v, 0)
    const totalGrams = Object.entries(byProduct).reduce((s, [pid, units]) => {
      const p = getProductById(pid)
      return p ? s + p.weightPerUnit * units : s
    }, 0)
    return { driver, byProduct, totalUnits, totalGrams }
  }).filter(r => r.totalUnits > 0)

  if (rows.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-6">Sin datos acumulados en este período.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="th">Chofer</th>
            <th className="th">Ruta</th>
            <th className="th text-right">Total Unidades</th>
            <th className="th text-right">Peso Reportado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ driver, totalUnits, totalGrams }) => (
            <tr key={driver.id} className="hover:bg-slate-50">
              <td className="td font-medium">{driver.name}</td>
              <td className="td text-slate-500">{driver.route}</td>
              <td className="td text-right tabular-nums">{totalUnits}</td>
              <td className="td text-right tabular-nums font-semibold text-green-700">
                {fmtGrams(totalGrams)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
