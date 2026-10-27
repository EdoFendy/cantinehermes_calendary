import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, Mail, Plus } from 'lucide-react'
import { ME } from '../data'
import EventForm, { blankEvent } from '../EventForm'
import Presence from '../Presence'
import WeekGrid from '../WeekGrid'
import { Avatar, Pill, StatusLabel } from '../ui'
import {
  LINE_COLORS, STATUS, addDays, dayMonth, iso, parse, sharedVia, uid, visibleEvents, weekStart,
} from '../lib'

export default function Calendario({ db, update, ownerId, setOwner }) {
  const [monday, setMonday] = useState(() => weekStart(new Date()))
  const [activeDay, setActiveDay] = useState(() => Math.min((new Date().getDay() + 6) % 7, 4))
  const [form, setForm] = useState(null)
  const owner = db.people.find((p) => p.id === ownerId)
  const mine = ownerId === ME
  const me = db.people.find((p) => p.id === ME)
  const myGroups = db.groups.filter((g) => g.members.includes(ME))
  const via = sharedVia(db, ownerId, ME)
  const locked = !mine && !via.length
  const events = visibleEvents(db, ownerId, ME)

  const pick = (id) => {
    setOwner(id)
    setForm(null)
    update((d) => { const p = d.people.find((x) => x.id === id); if (p) p.changed = false })
  }
  const openNew = (date = iso(new Date()), hour = 9) => { setOwner(ME); setForm(blankEvent(date, hour, ME)) }
  const save = (ev) => {
    update((d) => {
      if (ev.id) Object.assign(d.events.find((e) => e.id === ev.id), ev)
      else d.events.push({ ...ev, id: uid(), owner: ME })
    })
    setForm(null)
  }
  const remove = (id) => { update((d) => { d.events = d.events.filter((e) => e.id !== id) }); setForm(null) }
  const setMe = (patch) => update((d) => Object.assign(d.people.find((p) => p.id === ME), patch))

  const upcoming = events
    .filter((e) => e.date >= iso(new Date()))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    .slice(0, 4)

  return (
    <>
      <header className="topbar">
        <div className="title">
          <h1>{mine ? 'Il mio calendario' : `Calendario di ${owner.name}`}</h1>
          {!mine && <button className="link" onClick={() => pick(ME)}>← Torna al mio calendario</button>}
        </div>
        <div className="week-nav">
          <button className="icon-btn" onClick={() => setMonday(addDays(monday, -7))} aria-label="Settimana precedente"><ChevronLeft size={20} /></button>
          <button className="btn ghost" onClick={() => setMonday(weekStart(new Date()))}>Oggi</button>
          <button className="icon-btn" onClick={() => setMonday(addDays(monday, 7))} aria-label="Settimana successiva"><ChevronRight size={20} /></button>
          <span className="range">{dayMonth(monday)} – {dayMonth(addDays(monday, 4))}</span>
        </div>
        <button className="btn primary" onClick={() => openNew()}><Plus size={18} /> Nuovo evento</button>
      </header>

      <Presence people={db.people} activeId={ownerId} onPick={pick} />

      <div className="split">
        <div className="main-col">
          {locked ? (
            <div className="empty">
              <Lock size={28} />
              <h2>{owner.name.split(' ')[0]} non condivide il calendario con te</h2>
              <p>Vedete il calendario l’uno dell’altro solo se fate parte di un gruppo che lo condivide. Intanto puoi vedere dove si trova: <StatusLabel person={owner} />{owner.note && ` – ${owner.note}`}.</p>
            </div>
          ) : (
            <WeekGrid
              monday={monday} events={events} activeDay={activeDay} setActiveDay={setActiveDay}
              selectedId={form?.id}
              onSlot={(date, hour) => openNew(date, hour)}
              onEvent={(e) => mine && setForm({ ...e })}
            />
          )}
        </div>

        <aside className="panel">
          {form ? (
            <EventForm initial={form} onSave={save} onDelete={remove} onClose={() => setForm(null)} />
          ) : mine ? (
            <>
              <div className="panel-block">
                <h2>Il mio stato</h2>
                <div className="seg" role="radiogroup" aria-label="Il mio stato">
                  {Object.entries(STATUS).map(([k, s]) => (
                    <button key={k} role="radio" aria-checked={me.status === k} className={me.status === k ? 'on' : ''} onClick={() => setMe({ status: k })}>
                      <i style={{ background: s.color }} />{s.label}
                    </button>
                  ))}
                </div>
                <input value={me.note} onChange={(e) => setMe({ note: e.target.value })} placeholder="Aggiungi una nota (es. rientro giovedì)" aria-label="Nota sul mio stato" />
              </div>
              <div className="panel-block">
                <h2>Chi vede il mio calendario</h2>
                <p className="muted">Scegli i gruppi che possono vedere tutti i dettagli del tuo calendario.</p>
                <div className="vis">
                  {myGroups.map((g) => {
                    const on = me.sharedGroups.includes(g.id)
                    return (
                      <label key={g.id} className={`share${on ? ' on' : ''}`}>
                        <input type="checkbox" checked={on} onChange={() => setMe({ sharedGroups: on ? me.sharedGroups.filter((x) => x !== g.id) : [...me.sharedGroups, g.id] })} />
                        <Pill line={LINE_COLORS[g.color]}>{g.name.slice(0, 2).toUpperCase()}</Pill>
                        <span><b>{g.name}</b><small>{g.members.length - 1} colleghi</small></span>
                      </label>
                    )
                  })}
                  {!myGroups.length && <p className="muted">Non fai ancora parte di nessun gruppo.</p>}
                </div>
              </div>
              <div className="panel-block">
                <h2>Prossimi eventi</h2>
                {upcoming.length ? (
                  <ul className="upnext">
                    {upcoming.map((e) => (
                      <li key={e.id}>
                        <button onClick={() => setForm({ ...e })}>
                          <i style={{ background: e.c }} />
                          <span><b>{e.title}</b><small>{dayMonth(parse(e.date))} · {e.start}–{e.end}{e.group ? ` · ${e.group}` : ''}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="muted">Niente in programma. Clicca su un orario per aggiungere un evento.</p>}
              </div>
            </>
          ) : (
            <div className="panel-block">
              <div className="who">
                <Avatar person={owner} size={56} />
                <div><h2>{owner.name}</h2><p className="muted">{owner.role} · {owner.dept}</p></div>
              </div>
              <p className="where"><StatusLabel person={owner} />{owner.note && <span> · {owner.note}</span>}</p>
              {via.length > 0 && <p className="muted">Calendario condiviso con te tramite {via.map((g) => g.name).join(', ')}.</p>}
              <a className="btn ghost" href={`mailto:${owner.email}`}><Mail size={16} /> Scrivi a {owner.name.split(' ')[0]}</a>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
