import { useState } from 'react'
import { Pin, Plus, Search, Trash2 } from 'lucide-react'
import { uid } from '../lib'

const when = (t) => {
  const d = Math.floor((Date.now() - t) / 86400e3)
  if (d < 1) return 'Oggi'
  if (d === 1) return 'Ieri'
  return `${d} giorni fa`
}

export default function Note({ db, update }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(db.notes[0]?.id)
  const notes = db.notes
    .filter((n) => (n.title + n.body).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned || b.updated - a.updated)
  const note = db.notes.find((n) => n.id === sel)

  const patch = (p) => update((d) => Object.assign(d.notes.find((n) => n.id === sel), p, { updated: Date.now() }))
  const add = () => {
    const id = uid()
    update((d) => { d.notes.unshift({ id, title: '', body: '', pinned: false, updated: Date.now() }) })
    setSel(id); setQ('')
  }
  const remove = () => {
    update((d) => { d.notes = d.notes.filter((n) => n.id !== sel) })
    setSel(notes.find((n) => n.id !== sel)?.id)
  }

  return (
    <>
      <header className="topbar">
        <div className="title"><h1>Note</h1></div>
        <button className="btn primary" onClick={add}><Plus size={18} /> Nuova nota</button>
      </header>
      <div className="notes-layout">
        <div className="notes-list">
          <label className="search"><Search size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nelle note" aria-label="Cerca nelle note" />
          </label>
          <ul>
            {notes.map((n) => (
              <li key={n.id}>
                <button className={n.id === sel ? 'on' : ''} onClick={() => setSel(n.id)}>
                  <b>{n.pinned && <Pin size={14} aria-label="Fissata" />}{n.title || 'Senza titolo'}</b>
                  <span>{n.body.split('\n')[0] || 'Nota vuota'}</span>
                  <small>{when(n.updated)}</small>
                </button>
              </li>
            ))}
            {!notes.length && <li className="muted pad">{q ? 'Nessuna nota trovata.' : 'Ancora nessuna nota. Creane una con “Nuova nota”.'}</li>}
          </ul>
        </div>
        {note ? (
          <div className="note-editor">
            <div className="note-tools">
              <span className="muted">Salvata automaticamente · solo tu la vedi</span>
              <button className={`btn ghost${note.pinned ? ' on' : ''}`} onClick={() => patch({ pinned: !note.pinned })}><Pin size={16} /> {note.pinned ? 'Fissata' : 'Fissa in alto'}</button>
              <button className="icon-btn" onClick={remove} aria-label="Elimina nota"><Trash2 size={18} /></button>
            </div>
            <input className="note-title" value={note.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Titolo" aria-label="Titolo della nota" />
            <textarea value={note.body} onChange={(e) => patch({ body: e.target.value })} placeholder="Scrivi qui…" aria-label="Testo della nota" />
          </div>
        ) : <div className="empty"><h2>Seleziona o crea una nota</h2></div>}
      </div>
    </>
  )
}
