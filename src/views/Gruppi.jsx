import { useState } from 'react'
import { Lock, Plus, UserCheck } from 'lucide-react'
import { ME } from '../data'
import { Avatar, Pill, StatusLabel } from '../ui'
import { LINE_COLORS, uid } from '../lib'

export default function Gruppi({ db, update, onOpenPerson }) {
  const [gid, setGid] = useState(db.groups[0]?.id)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: '', color: 0 })
  const group = db.groups.find((g) => g.id === gid) || db.groups[0]
  const line = group ? LINE_COLORS[group.color] : LINE_COLORS[0]
  const members = group ? db.people.filter((p) => group.members.includes(p.id)) : []

  const create = (e) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    const id = uid()
    update((d) => { d.groups.push({ id, name: draft.name.trim(), color: draft.color, members: [ME] }) })
    setGid(id); setCreating(false); setDraft({ name: '', color: 0 })
  }
  const toggle = (pid) => update((d) => {
    const g = d.groups.find((x) => x.id === group.id)
    g.members = g.members.includes(pid) ? g.members.filter((m) => m !== pid) : [...g.members, pid]
  })

  return (
    <>
      <header className="topbar">
        <div className="title">
          <h1>Gruppi</h1>
          <span className="muted">Chi è nello stesso gruppo può vedere i calendari condivisi degli altri membri</span>
        </div>
        <button className="btn ghost" onClick={() => setCreating(true)}><Plus size={18} /> Nuovo gruppo</button>
      </header>

      <div className="groups-layout">
        <nav className="group-list" aria-label="Gruppi">
          {db.groups.map((g) => (
            <button key={g.id} className={g.id === group?.id ? 'on' : ''} onClick={() => { setGid(g.id); setEditing(false) }}>
              <Pill line={LINE_COLORS[g.color]}>{g.name.slice(0, 2).toUpperCase()}</Pill>
              <span><b>{g.name}</b><small>{g.members.length} persone</small></span>
            </button>
          ))}
          {creating && (
            <form className="new-group" onSubmit={create}>
              <input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nome del gruppo" aria-label="Nome del gruppo" />
              <div className="swatches" role="radiogroup" aria-label="Colore">
                {LINE_COLORS.map((c, i) => (
                  <button type="button" key={i} role="radio" aria-checked={draft.color === i} aria-label={`Colore ${i + 1}`} className={draft.color === i ? 'on' : ''} style={{ background: c.c }} onClick={() => setDraft({ ...draft, color: i })} />
                ))}
              </div>
              <div className="actions">
                <button className="btn primary">Crea</button>
                <button type="button" className="btn ghost" onClick={() => setCreating(false)}>Annulla</button>
              </div>
            </form>
          )}
        </nav>

        {group && (
          <section className="group-main">
            <div className="line-banner" style={{ background: line.c, color: line.on }}>
              <h2>{group.name}</h2>
              <span>{group.members.length} membri</span>
              <button className="btn on-line" onClick={() => setEditing(!editing)}>{editing ? 'Fatto' : 'Gestisci membri'}</button>
            </div>
            <ul className="member-grid">
              {(editing ? db.people : members).map((p) => {
                const isIn = group.members.includes(p.id)
                const shares = p.id === ME || p.sharedGroups.includes(group.id)
                return (
                  <li key={p.id}>
                    {editing ? (
                      <label className="check member">
                        <input type="checkbox" checked={isIn} disabled={p.id === ME} onChange={() => toggle(p.id)} />
                        <Avatar person={p} size={40} /><span><b>{p.name}</b><small>{p.role}</small></span>
                      </label>
                    ) : (
                      <button className="member" onClick={() => onOpenPerson(p.id)}>
                        <Avatar person={p} size={40} />
                        <span><b>{p.name}</b><small><StatusLabel person={p} /></small></span>
                        <em className={shares ? 'ok' : ''}>
                          {shares ? <><UserCheck size={14} /> {p.id === ME ? 'Condividi' : 'Vedi calendario'}</> : <><Lock size={14} /> Non condiviso</>}
                        </em>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
