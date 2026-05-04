// Choferes de distribución Polar Breeze
export const DRIVERS = [
  { id: 'CH-01', name: 'Carlos Mendoza',  route: 'Zona Norte' },
  { id: 'CH-02', name: 'Pedro Ramírez',   route: 'Zona Sur'   },
  { id: 'CH-03', name: 'Luis Torres',     route: 'Zona Este'  },
  { id: 'CH-04', name: 'Miguel Herrera',  route: 'Zona Oeste' },
  { id: 'CH-05', name: 'Ramón Castillo',  route: 'Centro'     },
]

export const getDriverById = (id) => DRIVERS.find(d => d.id === id)
