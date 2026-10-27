import { useEffect, useState } from 'react'
import { BookUser, CalendarDays, StickyNote, Users } from 'lucide-react'
import { ME, loadDb, resetDb, saveDb } from './data'
import Calendario from './views/Calendario'
import Gruppi from './views/Gruppi'
import Note from './views/Note'
import Rubrica from './views/Rubrica'
import { Avatar } from './ui'

const NAV = [
  ['calendario', 'Calendario', CalendarDays],
  ['gruppi', 'Gruppi', Users],
  ['note', 'Note', StickyNote],
  ['rubrica', 'Rubrica', BookUser],
]

export default function App() {
  const [db, setDb] = useState(loadDb)
  const [view, setView] = useState('calendario')
  const [owner, setOwner] = useState(ME)
  useEffect(() => saveDb(db), [db])

  const update = (fn) => setDb((d) => { const x = structuredClone(d); fn(x); return x })
  const openCalendar = (id) => { setOwner(id); setView('calendario') }
  const me = db.people.find((p) => p.id === ME)

  return (
    <div className="app">
      <nav className="rail" aria-label="Sezioni">
        <div className="brand"><span className="mark">CH</span><b>Cantine Hermes</b></div>
        <ul>
          {NAV.map(([id, label, Icon]) => (
            <li key={id}>
              <button className={view === id ? 'on' : ''} aria-current={view === id ? 'page' : undefined}
                onClick={() => { setView(id); if (id === 'calendario') setOwner(ME) }}>
                <Icon size={20} /><span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="me">
          <Avatar person={me} size={36} />
          <span><b>{me.name}</b><small>Dati dimostrativi</small></span>
          <button className="link" onClick={() => { resetDb(); setDb(loadDb()) }} title="Ripristina i dati dimostrativi">Ripristina</button>
        </div>
      </nav>
      <main>
        {view === 'calendario' && <Calendario db={db} update={update} ownerId={owner} setOwner={setOwner} />}
        {view === 'gruppi' && <Gruppi db={db} update={update} onOpenPerson={openCalendar} />}
        {view === 'note' && <Note db={db} update={update} />}
        {view === 'rubrica' && <Rubrica db={db} update={update} onOpenCalendar={openCalendar} />}
      </main>
    </div>
  )
}
