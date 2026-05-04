import { NavLink } from 'react-router-dom'
import { useSheets } from '../../hooks/useSheets.js'
import ConnectionStatus from './ConnectionStatus.jsx'

const NAV = [
  { to: '/',           label: 'Productos'    },
  { to: '/despacho',   label: 'Despacho'     },
  { to: '/sobrantes',  label: 'Sobrantes'    },
  { to: '/vueltas',    label: 'Vueltas'      },
  { to: '/reportes',   label: 'Reportes'     },
  { to: '/quincena',   label: 'Quincena'     },
  { to: '/simulacro',  label: '⚡ Simulacro'  },
]

export default function Navbar() {
  const { signedIn, login, logout, ready } = useSheets()

  return (
    <nav className="bg-polar-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo + links */}
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="font-bold text-base tracking-tight whitespace-nowrap flex-shrink-0">
            Polar Breeze <span className="text-polar-200 font-normal text-sm">Weight</span>
          </span>
          <div className="flex gap-0.5">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
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

        {/* Estado de conexión + Sheets */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ConnectionStatus />
          {ready && (
            <button
              onClick={signedIn ? logout : login}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                signedIn
                  ? 'border-green-400 text-green-300 hover:bg-green-900/30'
                  : 'border-polar-500 text-polar-300 hover:bg-polar-700'
              }`}
            >
              {signedIn ? '📊 Sheets' : 'Conectar Sheets'}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
