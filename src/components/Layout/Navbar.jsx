import { NavLink } from 'react-router-dom'
import { useSheets } from '../../hooks/useSheets.js'

const NAV = [
  { to: '/',           label: 'Productos'  },
  { to: '/despacho',   label: 'Despacho'   },
  { to: '/reportes',   label: 'Reportes'   },
  { to: '/quincena',   label: 'Quincena'   },
]

export default function Navbar() {
  const { signedIn, login, logout, ready } = useSheets()

  return (
    <nav className="bg-polar-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">
            Polar Breeze <span className="text-polar-200 font-normal text-sm">Weight</span>
          </span>
          <div className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-polar-600 text-white'
                      : 'text-polar-200 hover:bg-polar-700 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        {ready && (
          <button
            onClick={signedIn ? logout : login}
            className="text-xs px-3 py-1.5 rounded-md border border-polar-500 hover:bg-polar-700 transition-colors"
          >
            {signedIn ? 'Desconectar Sheets' : 'Conectar Sheets'}
          </button>
        )}
      </div>
    </nav>
  )
}
