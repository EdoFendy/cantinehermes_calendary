import { useMemo, useState } from 'react'
import { CalendarDays, Mail, MapPin, Phone, Search } from 'lucide-react'
import { Avatar, StatusLabel } from '../ui'
import { STATUS } from '../lib'

export default function Rubrica({ db, update, onOpenCalendar }) {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('name')
  const [sel, setSel] = useState(null)
  const depts = [...new Set(db.people.map((p) => p.dept))]

  const rows = useMemo(() => db.people
    .filter((p) => (!dept || p.dept === dept) && (!status || p.status === status) &&
      `${p.name} ${p.role} ${p.dept} ${p.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a[sort].localeCompare(b[sort])), [db.people, q, dept, status, sort])
  const person = db.people.find((p) => p.id === sel)
  const open = (p) => { setSel(p.id); if (p.changed) update((d) => { d.people.find((x) => x.id === p.id).changed = false }) }
  const th = (key, label) => (
    <th aria-sort={sort === key ? 'ascending' : 'none'}>
      <button onClick={() => setSort(key)}>{label}{sort === key && ' ↑'}</button>
    </th>
  )

  return (
    <>
      <header className="topbar"><div className="title"><h1>Rubrica aziendale</h1><span className="muted">{db.people.length} colleghi</span></div></header>
      <div className="toolbar">
        <label className="search"><Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per nome, ruolo o email" aria-label="Cerca collega" />
        </label>
        <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Reparto">
          <option value="">Tutti i reparti</option>
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Stato">
          <option value="">Qualsiasi stato</option>
          {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>
      <div className="split">
        <div className="main-col">
          {rows.length ? (
            <table className="people">
              <thead><tr>{th('name', 'Nome')}{th('dept', 'Reparto')}<th>Stato</th><th className="hide-m">Email</th><th className="hide-m">Telefono</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className={p.id === sel ? 'on' : ''}>
                    <td>
                      <button className="row-btn" onClick={() => open(p)}>
                        <Avatar person={p} size={36} ring={p.changed} />
                        <span><b>{p.name}</b><small>{p.role}</small></span>
                      </button>
                    </td>
                    <td>{p.dept}</td>
                    <td><StatusLabel person={p} /></td>
                    <td className="hide-m"><a href={`mailto:${p.email}`}>{p.email}</a></td>
                    <td className="hide-m num">{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty"><h2>Nessun collega trovato</h2><p>Prova a cambiare ricerca o filtri.</p>
              <button className="btn ghost" onClick={() => { setQ(''); setDept(''); setStatus('') }}>Azzera i filtri</button></div>
          )}
        </div>
        <aside className="panel">
          {person ? (
            <div className="panel-block">
              <div className="who"><Avatar person={person} size={64} /><div><h2>{person.name}</h2><p className="muted">{person.role}</p></div></div>
              <p className="where"><StatusLabel person={person} />{person.note && <span> · {person.note}</span>}</p>
              <ul className="contact">
                <li><Mail size={18} /><a href={`mailto:${person.email}`}>{person.email}</a></li>
                <li><Phone size={18} /><a className="num" href={`tel:${person.phone.replace(/ /g, '')}`}>{person.phone}</a></li>
                <li><MapPin size={18} />{person.place} · {person.dept}</li>
              </ul>
              <button className="btn primary" onClick={() => onOpenCalendar(person.id)}><CalendarDays size={16} /> Vedi calendario</button>
            </div>
          ) : <div className="panel-block muted">Seleziona un collega per vedere contatti e stato.</div>}
        </aside>
      </div>
    </>
  )
}
