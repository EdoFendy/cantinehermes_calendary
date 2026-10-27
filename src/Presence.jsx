import { STATUS, dayLong } from './lib'
import { Avatar } from './ui'

export default function Presence({ people, activeId, onPick }) {
  const inSede = people.filter((p) => p.status === 'sede').length
  return (
    <section className="presence" aria-label="Oggi in azienda">
      <div className="presence-head">
        <h2>Oggi</h2>
        <p>{dayLong(new Date())} · <b>{inSede}</b> su {people.length} in sede</p>
      </div>
      <ul>
        {people.map((p) => (
          <li key={p.id}>
            <button
              className={`person-chip${p.id === activeId ? ' is-active' : ''}`}
              onClick={() => onPick(p.id)}
              title={p.note || STATUS[p.status].label}
            >
              <Avatar person={p} size={36} ring={p.changed} />
              <span className="name">{p.name.split(' ')[0]}</span>
              <span className="st">{STATUS[p.status].label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
