// Selector de quincena (período)  e.g. "2025-Q1" = 1ra quincena enero 2025
export function currentPeriod() {
  const d   = new Date()
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  const q   = d.getDate() <= 15 ? 'Q1' : 'Q2'
  return `${y}-${m}-${q}`
}

export function periodLabel(period) {
  if (!period) return ''
  const [y, m, q] = period.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const mes = months[parseInt(m) - 1] || m
  const half = q === 'Q1' ? '1ra quincena' : '2da quincena'
  return `${half} ${mes} ${y}`
}

export default function PeriodSelector({ value, onChange }) {
  // Generate last 6 periods
  const periods = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now)
    d.setDate(1)
    d.setMonth(d.getMonth() - Math.floor(i / 2))
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const q = i % 2 === 0 ? 'Q2' : 'Q1'
    periods.push(`${y}-${m}-${q}`)
  }
  // de-dup and sort
  const unique = [...new Set(periods)].sort().reverse()

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input max-w-xs"
    >
      {unique.map(p => (
        <option key={p} value={p}>{periodLabel(p)}</option>
      ))}
    </select>
  )
}
