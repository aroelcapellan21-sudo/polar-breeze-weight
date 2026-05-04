// Catálogo de productos Polar Breeze con pesos calculados
export const PRODUCTS = [
  {
    id: 'PB-001',
    name: 'Paleta de Vainilla',
    category: 'Paleta',
    weightPerUnit: 85,      // gramos
    unitsPerBox: 24,
    weightPerBox: 2040,     // gramos  (85 × 24)
    price: 1.50,
  },
  {
    id: 'PB-002',
    name: 'Paleta de Chocolate',
    category: 'Paleta',
    weightPerUnit: 90,
    unitsPerBox: 24,
    weightPerBox: 2160,
    price: 1.50,
  },
  {
    id: 'PB-003',
    name: 'Paleta de Fresa',
    category: 'Paleta',
    weightPerUnit: 85,
    unitsPerBox: 24,
    weightPerBox: 2040,
    price: 1.50,
  },
  {
    id: 'PB-004',
    name: 'Paleta de Coco',
    category: 'Paleta',
    weightPerUnit: 95,
    unitsPerBox: 24,
    weightPerBox: 2280,
    price: 1.75,
  },
  {
    id: 'PB-005',
    name: 'Paleta de Limón',
    category: 'Paleta',
    weightPerUnit: 80,
    unitsPerBox: 24,
    weightPerBox: 1920,
    price: 1.50,
  },
  {
    id: 'PB-006',
    name: 'Copa de Vainilla',
    category: 'Copa',
    weightPerUnit: 120,
    unitsPerBox: 12,
    weightPerBox: 1440,
    price: 2.25,
  },
  {
    id: 'PB-007',
    name: 'Copa de Chocolate',
    category: 'Copa',
    weightPerUnit: 125,
    unitsPerBox: 12,
    weightPerBox: 1500,
    price: 2.25,
  },
  {
    id: 'PB-008',
    name: 'Copa Tropical',
    category: 'Copa',
    weightPerUnit: 130,
    unitsPerBox: 12,
    weightPerBox: 1560,
    price: 2.50,
  },
  {
    id: 'PB-009',
    name: 'Barquillo Clásico',
    category: 'Barquillo',
    weightPerUnit: 110,
    unitsPerBox: 18,
    weightPerBox: 1980,
    price: 2.00,
  },
  {
    id: 'PB-010',
    name: 'Barquillo Doble',
    category: 'Barquillo',
    weightPerUnit: 185,
    unitsPerBox: 12,
    weightPerBox: 2220,
    price: 3.00,
  },
  {
    id: 'PB-011',
    name: 'Sandwich de Helado',
    category: 'Sandwich',
    weightPerUnit: 150,
    unitsPerBox: 12,
    weightPerBox: 1800,
    price: 2.75,
  },
  {
    id: 'PB-012',
    name: 'Sandwich Jumbo',
    category: 'Sandwich',
    weightPerUnit: 220,
    unitsPerBox: 8,
    weightPerBox: 1760,
    price: 3.50,
  },
  {
    id: 'PB-013',
    name: 'Galón Vainilla',
    category: 'Galón',
    weightPerUnit: 1800,
    unitsPerBox: 4,
    weightPerBox: 7200,
    price: 12.00,
  },
  {
    id: 'PB-014',
    name: 'Galón Chocolate',
    category: 'Galón',
    weightPerUnit: 1850,
    unitsPerBox: 4,
    weightPerBox: 7400,
    price: 12.00,
  },
  {
    id: 'PB-015',
    name: 'Galón Napolitano',
    category: 'Galón',
    weightPerUnit: 1900,
    unitsPerBox: 4,
    weightPerBox: 7600,
    price: 13.00,
  },
]

export const CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))]

export const getProductById = (id) => PRODUCTS.find(p => p.id === id)

export const formatWeight = (grams) => {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`
  return `${grams} g`
}
