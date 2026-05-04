import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Layout/Navbar.jsx'

// Páginas públicas
import LoginPage from './pages/LoginPage.jsx'

// Páginas protegidas
import DashboardPage    from './pages/DashboardPage.jsx'
import DriverDetailPage from './pages/DriverDetailPage.jsx'
import AdminPage        from './pages/AdminPage.jsx'
import ProductsPage     from './pages/ProductsPage.jsx'
import DispatchPage     from './pages/DispatchPage.jsx'
import SobrantesPage    from './pages/SobrantesPage.jsx'
import VueltasPage      from './pages/VueltasPage.jsx'
import ReportsPage      from './pages/ReportsPage.jsx'
import BiweeklyPage     from './pages/BiweeklyPage.jsx'
import SimulationPage   from './pages/SimulationPage.jsx'

// ── Ruta protegida ────────────────────────────────────────────────
function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Wrapper de layout para páginas internas ───────────────────────
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="text-center text-xs text-slate-400 py-3 border-t border-slate-200">
        Polar Breeze Weight Control — v1.2 · Firebase + Google Sheets
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas con layout */}
      <Route path="/dashboard" element={
        <Protected><Layout><DashboardPage /></Layout></Protected>
      }/>
      <Route path="/driver/:driverId" element={
        <Protected><Layout><DriverDetailPage /></Layout></Protected>
      }/>
      <Route path="/admin" element={
        <Protected><Layout><AdminPage /></Layout></Protected>
      }/>
      <Route path="/" element={
        <Protected><Layout><ProductsPage /></Layout></Protected>
      }/>
      <Route path="/despacho" element={
        <Protected><Layout><DispatchPage /></Layout></Protected>
      }/>
      <Route path="/sobrantes" element={
        <Protected><Layout><SobrantesPage /></Layout></Protected>
      }/>
      <Route path="/vueltas" element={
        <Protected><Layout><VueltasPage /></Layout></Protected>
      }/>
      <Route path="/reportes" element={
        <Protected><Layout><ReportsPage /></Layout></Protected>
      }/>
      <Route path="/quincena" element={
        <Protected><Layout><BiweeklyPage /></Layout></Protected>
      }/>
      <Route path="/simulacro" element={
        <Protected><Layout><SimulationPage /></Layout></Protected>
      }/>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
