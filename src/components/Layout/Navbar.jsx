import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, isAdmin } from '../../context/AuthContext.jsx'
import { useSheets } from '../../hooks/useSheets.js'
import ConnectionStatus from './ConnectionStatus.jsx'

const NAV_ADMIN = [
  { to: '/dashboard',  label: 'Dashboard'    },
  { to: '/admin',      label: '⚙️ Admin'      },
  { to: '/',           label: 'Productos'    },
  { to: '/despacho',   label: 'Despacho'     },
  { to: '/sobrantes',  label: 'Sobrantes'    },
  { to: '/vueltas',    label: 'Vueltas'      },
  { to: '/reportes',   label: 'Reportes'     },
  { to: '/quincena',   label: 'Quincena'     },
  { to: '/simulacro',  label: '⚡ Simulacro'  },
]

const NAV_CHOFER = [
  { to: '/dashboard',  label: 'Mi Panel'     },
  { to: '/despacho',   label: 'Despacho'     },
  { to: '/sobrantes',  label: 'Sobrantes'    },
  { to: '/vueltas',    label: 'Vueltas'      },
]

export default function Navbar() {
  const { user, logout }   = useAuth()
  const { signedIn, login, logout: sheetsLogout, ready } = useSheets()
  const navigate           = useNavigate()

  if (!user) return null   // No mostrar navbar en páginas públicas

  const nav = isAdmin(user) ? NAV_ADMIN : NAV_CHOFER

  return (
    <nav className="bg-polar-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo + links */}
        <div className="flex items-center gap-3 overflow-x-auto min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-bold text-base tracking-tight whitespace-nowrap flex-shrink-0 hover:text-polar-200 transition-colors"
          >
            🧊 <span className="hidden sm:inline">Polar Breeze</span>
            <span className="text-polar-200 font-normal text-sm hidden sm:inline"> Weight</span>
          </button>
          <div className="flex gap-0.5 overflow-x-auto">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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

        {/* Derecha: estado + usuario + logout */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <ConnectionStatus />

          {/* Sheets */}
          {ready && (
            <button
              onClick={signedIn ? sheetsLogout : login}
              title={signedIn ? 'Sheets conectado — click para desconectar' : 'Conectar Google Sheets'}
              className={`text-xs px-2 py-1 rounded-md border transition-colors hidden sm:block ${
                signedIn
                  ? 'border-green-400 text-green-300 hover:bg-green-900/30'
                  : 'border-polar-500 text-polar-300 hover:bg-polar-700'
              }`}
            >
              {signedIn ? '📊' : '📋'}
            </button>
          )}

          {/* Usuario + logout */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white leading-none">{user.nombre}</p>
              <p className="text-xs text-polar-300 leading-none mt-0.5">
                {isAdmin(user) ? 'Admin' : `Ficha ${user.ficha}`}
              </p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Cerrar sesión"
              className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md transition-colors"
            >
              ↩
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
