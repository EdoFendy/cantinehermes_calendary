import { END, HOUR_H, START, addDays, dayShort, iso, layout, toMin } from './lib'

const hours = Array.from({ length: END - START }, (_, i) => START + i)

export default function WeekGrid({ monday, events, onSlot, onEvent, activeDay, setActiveDay, selectedId }) {
  const days = Array.from({ length: 5 }, (_, i) => addDays(monday, i))
  const todayIso = iso(new Date())
  const now = new Date()
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) / 60 - START) * HOUR_H

  return (
    <div className="week" role="grid" aria-label="Settimana">
      <div className="week-head">
        <span />
        {days.map((d, i) => (
          <button
            key={i}
            className={`day-head${iso(d) === todayIso ? ' is-today' : ''}${i === activeDay ? ' is-active' : ''}`}
            onClick={() => setActiveDay(i)}
          >
            <span>{dayShort(d)}</span>
            <b>{d.getDate()}</b>
          </button>
        ))}
      </div>
      <div className="week-body">
        <div className="hours">
          {hours.map((h) => (
            <span key={h} style={{ height: HOUR_H }}>{String(h).padStart(2, '0')}:00</span>
          ))}
        </div>
        {days.map((d, i) => {
          const key = iso(d)
          const list = layout(events.filter((e) => e.date === key))
          return (
            <div
              key={i}
              className={`day-col${i === activeDay ? ' is-active' : ''}${key === todayIso ? ' is-today' : ''}`}
              style={{ height: hours.length * HOUR_H }}
              onClick={(e) => {
                if (e.target !== e.currentTarget) return
                const r = e.currentTarget.getBoundingClientRect()
                onSlot(key, START + Math.floor((e.clientY - r.top) / HOUR_H))
              }}
            >
              {key === todayIso && nowTop > 0 && nowTop < hours.length * HOUR_H && (
                <span className="now" style={{ top: nowTop }} />
              )}
              {list.map((e) => {
                const top = ((toMin(e.start) - START * 60) / 60) * HOUR_H
                const h = Math.max(((toMin(e.end) - toMin(e.start)) / 60) * HOUR_H, 24)
                return (
                  <button
                    key={e.id}
                    className={`event${e.id === selectedId ? ' is-selected' : ''}`}
                    style={{
                      top, height: h - 2,
                      left: `calc(${(e.col / e.cols) * 100}% + 3px)`,
                      width: `calc(${100 / e.cols}% - 6px)`,
                      background: e.c, color: e.on,
                    }}
                    onClick={() => onEvent(e)}
                    title={`${e.title} · ${e.start}–${e.end}`}
                  >
                    <b>{e.title}</b>
                    {h > 40 && <span>{e.start}–{e.end}{e.place ? ` · ${e.place}` : ''}</span>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
