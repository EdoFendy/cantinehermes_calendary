import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { fromMin, toMin } from './lib'

export default function EventForm({ initial, onSave, onDelete, onClose }) {
  const [f, setF] = useState(initial)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const isNew = !initial.id

  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return setErr('Scrivi un titolo per l’evento.')
    if (toMin(f.end) <= toMin(f.start)) return setErr('L’orario di fine deve essere dopo l’inizio.')
    onSave({ ...f, title: f.title.trim() })
  }

  return (
    <form className="panel-block event-form" onSubmit={submit}>
      <div className="panel-title">
        <h2>{isNew ? 'Nuovo evento' : 'Modifica evento'}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
      </div>
      <label>Titolo
        <input autoFocus value={f.title} onChange={set('title')} placeholder="Es. Riunione con il fornitore" />
      </label>
      <label>Giorno
        <input type="date" value={f.date} onChange={set('date')} required />
      </label>
      <div className="row2">
        <label>Dalle
          <input type="time" value={f.start} step="900" onChange={set('start')} />
        </label>
        <label>Alle
          <input type="time" value={f.end} step="900" onChange={(e) => setF({ ...f, end: e.target.value })} />
        </label>
      </div>
      <label>Luogo (facoltativo)
        <input value={f.place} onChange={set('place')} placeholder="Es. Sala riunioni" />
      </label>
      {err && <p className="error" role="alert">{err}</p>}
      <div className="actions">
        <button className="btn primary">{isNew ? 'Aggiungi evento' : 'Salva'}</button>
        {!isNew && (
          <button type="button" className="btn danger" onClick={() => onDelete(f.id)}>
            <Trash2 size={16} /> Elimina
          </button>
        )}
      </div>
    </form>
  )
}

export const blankEvent = (date, hour, owner) => ({
  title: '', date, start: fromMin(hour * 60), end: fromMin((hour + 1) * 60), cal: 'personal', owner, place: '',
})
