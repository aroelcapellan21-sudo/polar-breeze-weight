// Ficha del chofer — documento imprimible de liquidación de vuelta
import { fmtGrams } from '../../utils/mathEngine.js'

const STATUS_META = {
  cuadra:      { label: 'CUADRA',    color: '#16a34a', bg: '#f0fdf4' },
  revisar:     { label: 'REVISAR',   color: '#d97706', bg: '#fffbeb' },
  auditoria:   { label: 'AUDITORÍA', color: '#dc2626', bg: '#fef2f2' },
  'sin-datos': { label: 'SIN DATOS', color: '#64748b', bg: '#f8fafc' },
}

export default function FichaChofer({ vuelta, onClose }) {
  if (!vuelta) return null
  const meta = STATUS_META[vuelta.status] ?? STATUS_META['sin-datos']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Controles — no se imprimen */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 print:hidden">
          <h2 className="font-bold text-slate-700">Ficha del Chofer</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs"
            >
              🖨 Imprimir
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 px-2">✕</button>
          </div>
        </div>

        {/* Contenido de la ficha */}
        <div className="p-6 space-y-4 font-mono text-sm" id="ficha-print">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <p className="text-xl font-black tracking-widest">POLAR BREEZE</p>
            <p className="text-xs text-slate-500 tracking-wider">CONTROL DE INVENTARIO POR PESO</p>
            <p className="font-bold mt-1">FICHA DE LIQUIDACIÓN DE VUELTA</p>
          </div>

          {/* Info del chofer */}
          <div className="grid grid-cols-2 gap-x-4 text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="space-y-1">
              <p><span className="text-slate-400">FICHA N°:</span>  <strong>{vuelta.fichaNumero}</strong></p>
              <p><span className="text-slate-400">CHOFER:  </span>  <strong>{vuelta.driverName}</strong></p>
              <p><span className="text-slate-400">RUTA:    </span>  {vuelta.route || '—'}</p>
            </div>
            <div className="space-y-1">
              <p><span className="text-slate-400">FECHA:   </span>  <strong>{vuelta.date}</strong></p>
              <p><span className="text-slate-400">HORA:    </span>  {vuelta.hora}</p>
              <p><span className="text-slate-400">PERÍODO: </span>  {vuelta.period}</p>
            </div>
          </div>

          {/* Tabla de productos */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-1">PRODUCTO</th>
                <th className="text-right py-1">DESP.</th>
                <th className="text-right py-1">RETORN.</th>
                <th className="text-right py-1">VENDIDO</th>
                <th className="text-right py-1">PESO VEND.</th>
              </tr>
            </thead>
            <tbody>
              {vuelta.items?.map((it, i) => (
                <tr key={i} className="border-b border-dashed border-slate-200">
                  <td className="py-1.5">{it.productName}</td>
                  <td className="py-1.5 text-right tabular-nums">{it.despachadas}</td>
                  <td className="py-1.5 text-right tabular-nums">{it.retornadas}</td>
                  <td className="py-1.5 text-right tabular-nums font-bold">{it.vendidas}</td>
                  <td className="py-1.5 text-right tabular-nums">{fmtGrams(it.pesoVendidoG)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-400 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right tabular-nums">{vuelta.items?.reduce((s, i) => s + i.despachadas, 0)}</td>
                <td className="py-2 text-right tabular-nums">{vuelta.items?.reduce((s, i) => s + i.retornadas, 0)}</td>
                <td className="py-2 text-right tabular-nums">{vuelta.items?.reduce((s, i) => s + i.vendidas, 0)}</td>
                <td className="py-2 text-right tabular-nums">{fmtGrams(vuelta.totalVendidoG)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Resumen de pesos */}
          <div className="border border-dashed border-slate-300 rounded p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Peso despachado:</span>
              <span className="tabular-nums font-bold">{fmtGrams(vuelta.totalDespachadoG)}</span>
            </div>
            <div className="flex justify-between">
              <span>Peso retornado:</span>
              <span className="tabular-nums">{fmtGrams(vuelta.totalRetornadoG)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-300 pt-1 mt-1">
              <span>Peso vendido reportado:</span>
              <span className="tabular-nums font-bold">{fmtGrams(vuelta.totalVendidoG)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Diferencia:</span>
              <span className="tabular-nums">{fmtGrams(Math.abs(vuelta.diffG))} ({(Math.abs(vuelta.pctDiff) * 100).toFixed(2)}%)</span>
            </div>
          </div>

          {/* Estado con semáforo */}
          <div
            className="rounded-lg p-3 text-center font-bold tracking-widest text-lg"
            style={{ backgroundColor: meta.bg, color: meta.color, border: `2px solid ${meta.color}` }}
          >
            {meta.label}
          </div>

          {/* Observaciones */}
          {vuelta.observaciones && (
            <div className="text-xs border border-dashed border-slate-300 rounded p-2">
              <p className="text-slate-400 mb-1">OBSERVACIONES:</p>
              <p>{vuelta.observaciones}</p>
            </div>
          )}

          {/* Firma */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-dashed border-slate-300">
            <div className="text-center text-xs">
              <div className="border-b border-slate-400 mb-1 h-8" />
              <p>Firma del Chofer</p>
            </div>
            <div className="text-center text-xs">
              <div className="border-b border-slate-400 mb-1 h-8" />
              <p>Firma del Supervisor</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            Documento generado: {new Date().toLocaleString('es-DO')} · Polar Breeze Weight v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
