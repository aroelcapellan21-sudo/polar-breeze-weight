import ProductTable from '../components/ProductTable/ProductTable.jsx'

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h1>
        <p className="text-sm text-slate-500">Pesos por unidad y por caja de la línea Polar Breeze</p>
      </div>
      <ProductTable />
    </div>
  )
}
