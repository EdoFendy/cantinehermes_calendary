export const START = 8
export const END = 20
export const HOUR_H = 56

const pad = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const weekStart = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return addDays(x, -((x.getDay() + 6) % 7))
}
export const toMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
export const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

export const fmt = (o) => {
  const f = new Intl.DateTimeFormat('it-IT', o)
  return (d) => f.format(d)
}
export const dayShort = fmt({ weekday: 'short' })
export const dayLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' })
export const monthYear = fmt({ month: 'long', year: 'numeric' })
export const dayMonth = fmt({ day: 'numeric', month: 'short' })

export const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

export const uid = () => Math.random().toString(36).slice(2, 9)

export const STATUS = {
  sede: { label: 'In sede', color: '#2F9E5F' },
  remoto: { label: 'Da remoto', color: '#3B82C4' },
  fuori: { label: 'Fuori sede', color: '#E8710A' },
  ferie: { label: 'In ferie', color: '#7B7580' },
}

export const LINE_COLORS = [
  { c: '#D7263D', on: '#fff' },
  { c: '#2456A6', on: '#fff' },
  { c: '#0B7A7C', on: '#fff' },
  { c: '#B0287A', on: '#fff' },
  { c: '#F2B705', on: '#1A1416' },
]
export const PERSONAL = { c: '#3F3A44', on: '#fff' }

// Colonne affiancate per eventi sovrapposti nello stesso giorno.
export function layout(evs) {
  const sorted = [...evs].sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(b.end) - toMin(a.end))
  const out = []
  let cluster = []
  let clusterEnd = 0
  const flush = () => {
    const cols = []
    const placed = cluster.map((e) => {
      let i = cols.findIndex((end) => end <= toMin(e.start))
      if (i < 0) i = cols.push(0) - 1
      cols[i] = toMin(e.end)
      return { ...e, col: i }
    })
    placed.forEach((e) => out.push({ ...e, cols: cols.length }))
    cluster = []
  }
  for (const e of sorted) {
    if (cluster.length && toMin(e.start) >= clusterEnd) flush()
    clusterEnd = cluster.length ? Math.max(clusterEnd, toMin(e.end)) : toMin(e.end)
    cluster.push(e)
  }
  if (cluster.length) flush()
  return out
}

// Gruppi che permettono a `viewerId` di vedere il calendario di `ownerId`.
export function sharedVia(db, ownerId, viewerId) {
  if (ownerId === viewerId) return []
  const owner = db.people.find((p) => p.id === ownerId)
  return db.groups.filter((g) => owner.sharedGroups.includes(g.id) && g.members.includes(ownerId) && g.members.includes(viewerId))
}

// Eventi del calendario di `ownerId` visibili a `viewerId` (vuoto se non condiviso).
export function visibleEvents(db, ownerId, viewerId) {
  const via = sharedVia(db, ownerId, viewerId)
  if (ownerId !== viewerId && !via.length) return []
  const line = ownerId === viewerId ? PERSONAL : LINE_COLORS[via[0].color]
  return db.events.filter((e) => e.owner === ownerId).map((e) => ({ ...e, ...line }))
}
