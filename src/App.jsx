import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Layout/Navbar.jsx'
import ProductsPage  from './pages/ProductsPage.jsx'
import DispatchPage  from './pages/DispatchPage.jsx'
import ReportsPage   from './pages/ReportsPage.jsx'
import BiweeklyPage  from './pages/BiweeklyPage.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/"          element={<ProductsPage />} />
          <Route path="/despacho"  element={<DispatchPage />} />
          <Route path="/reportes"  element={<ReportsPage />}  />
          <Route path="/quincena"  element={<BiweeklyPage />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-slate-400 py-3 border-t border-slate-200">
        Polar Breeze Weight Control — v1.0
      </footer>
    </div>
  )
}
