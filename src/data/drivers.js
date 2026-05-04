// Choferes de distribución Polar Breeze
export const DRIVERS = [
  { id: 'CH-01', name: 'Carlos Mendoza',  route: 'Zona Norte' },
  { id: 'CH-02', name: 'Pedro Ramírez',   route: 'Zona Sur'   },
  { id: 'CH-03', name: 'Luis Torres',     route: 'Zona Este'  },
  { id: 'CH-04', name: 'Miguel Herrera',  route: 'Zona Oeste' },
  { id: 'CH-05', name: 'Ramón Castillo',  route: 'Centro'     },
  // Choferes del simulacro quincenal
  { id: 'CH-42', code: '#0042', name: 'Juan Pérez',   route: 'Ruta Nororiente' },
  { id: 'CH-78', code: '#0078', name: 'Carlos Marte', route: 'Ruta Sur-Centro' },
]

export const getDriverById = (id) => DRIVERS.find(d => d.id === id)
