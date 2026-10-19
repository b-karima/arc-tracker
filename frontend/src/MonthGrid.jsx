import { useEffect, useRef } from 'react'
import { MONTHS, dayLetter, daysInMonth, iso, weekday } from './dates'

// Keeps categories in the order they first appear.
function groupByCategory(habits) {
  const groups = new Map()
  for (const h of habits) {
    const name = h.category || 'Autres'
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(h)
  }
  return [...groups]
}

export default function MonthGrid({ year, month, today, habits, isDone, onToggle, onEdit }) {
  const scroller = useRef(null)

  // On narrow screens the grid scrolls sideways: show the days up to today, not day 1.
  useEffect(() => {
    const box = scroller.current
    const cell = box?.querySelector('thead .is-today')
    if (cell) box.scrollLeft = cell.offsetLeft + cell.offsetWidth + 8 - box.clientWidth
  }, [year, month, habits.length > 0])

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const d = i + 1
    const wd = weekday(year, month, d)
    return { d, day: iso(year, month, d), letter: dayLetter(year, month, d), weekend: wd === 0 || wd === 6 }
  })
  const cellClass = ({ day, weekend }) =>
    [day === today && 'is-today', weekend && 'is-weekend'].filter(Boolean).join(' ') || undefined

  return (
    <section className="panel grid-panel">
      <div className="panel-head">
        <h2>Suivi du mois</h2>
        <button onClick={onEdit}>Gérer les habitudes</button>
      </div>

      {habits.length === 0 ? (
        <p className="empty">Aucune habitude. Ajoute-en une avec « Gérer les habitudes ».</p>
      ) : (
        <div className="grid-scroll" ref={scroller}>
          <table className="month-grid">
            <thead>
              <tr>
                <th className="habit-col" />
                {days.map((c) => (
                  <th key={c.d} className={cellClass(c)} scope="col">
                    <span className="num">{c.d}</span>
                    <span className="letter">{c.letter}</span>
                  </th>
                ))}
              </tr>
            </thead>
            {groupByCategory(habits).map(([category, rows]) => (
              <tbody key={category}>
                <tr className="cat-row">
                  <th className="habit-col" scope="rowgroup">{category}</th>
                  <td colSpan={days.length} />
                </tr>
                {rows.map((h) => (
                  <tr key={h.id}>
                    <th className="habit-col" scope="row">{h.name}</th>
                    {days.map((c) => (
                      <td key={c.d} className={cellClass(c)}>
                        <input
                          type="checkbox"
                          className="box"
                          checked={isDone(h.id, c.day)}
                          disabled={c.day > today}
                          onChange={() => onToggle(h.id, c.day)}
                          aria-label={`${h.name}, ${c.d} ${MONTHS[month]}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </section>
  )
}
