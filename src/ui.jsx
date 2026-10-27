import { STATUS, initials } from './lib'

export function Avatar({ person, size = 40, ring }) {
  const hue = (person.id.charCodeAt(1) * 47 + (person.id.charCodeAt(2) || 0) * 13) % 360
  return (
    <i
      className={`avatar${ring ? ' is-new' : ''}`}
      style={{ '--s': `${size}px`, '--h': hue }}
      aria-hidden="true"
    >
      {initials(person.name)}
      <s className="dot" style={{ background: STATUS[person.status].color }} />
    </i>
  )
}

export function StatusLabel({ person }) {
  const s = STATUS[person.status]
  return (
    <span className="status-label">
      <i style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function Pill({ line, children }) {
  return (
    <i className="pill" style={{ background: line.c, color: line.on }}>
      {children}
    </i>
  )
}
