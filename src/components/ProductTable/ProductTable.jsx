import { useState } from 'react'
import { PRODUCTS, CATEGORIES } from '../../data/products.js'
import { formatWeight } from '../../data/products.js'

const CATEGORY_COLORS = {
  Paleta:    'bg-blue-100 text-blue-800',
  Copa:      'bg-purple-100 text-purple-800',
  Barquillo: 'bg-amber-100 text-amber-800',
  Sandwich:  'bg-green-100 text-green-800',
  Galón:     'bg-rose-100 text-rose-800',
}

export default function ProductTable() {
  const [filter, setFilter] = useState('')
  const [cat, setCat]       = useState('Todos')
  const [sort, setSort]     = useState({ key: 'id', dir: 'asc' })

  const filtered = PRODUCTS
    .filter(p =>
      (cat === 'Todos' || p.category === cat) &&
      p.name.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const v = a[sort.key] > b[sort.key] ? 1 : -1
      return sort.dir === 'asc' ? v : -v
    })

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const totalWeightKg = (PRODUCTS.reduce((s, p) => s + p.weightPerBox, 0) / 1000).toFixed(2)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input max-w-xs"
        />
        <div className="flex gap-1">
          {['Todos', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                cat === c
                  ? 'bg-polar-600 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {[
                  { key: 'id',            label: 'ID'              },
                  { key: 'name',          label: 'Producto'        },
                  { key: 'category',      label: 'Categoría'       },
                  { key: 'weightPerUnit', label: 'Peso/Unidad'     },
                  { key: 'unitsPerBox',   label: 'Uds/Caja'        },
                  { key: 'weightPerBox',  label: 'Peso/Caja'       },
                  { key: 'price',         label: 'Precio Ref.'     },
                ].map(col => (
                  <th
                    key={col.key}
                    className="th cursor-pointer select-none hover:bg-slate-100"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort.key === col.key && (
                      <span className="ml-1">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="td font-medium">{p.name}</td>
                  <td className="td">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[p.category] || ''}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="td text-right tabular-nums">{p.weightPerUnit} g</td>
                  <td className="td text-right tabular-nums">{p.unitsPerBox}</td>
                  <td className="td text-right tabular-nums font-semibold">{formatWeight(p.weightPerBox)}</td>
                  <td className="td text-right tabular-nums">${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td colSpan={5} className="td text-right text-xs text-slate-500 font-semibold">
                  {filtered.length} productos
                </td>
                <td className="td text-right font-bold text-polar-700">
                  {(filtered.reduce((s, p) => s + p.weightPerBox, 0) / 1000).toFixed(2)} kg total/caja
                </td>
                <td className="td" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
