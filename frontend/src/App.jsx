import { useEffect, useState } from 'react'
import { api } from './api'
import { MONTHS, daysInMonth, iso, todayIso } from './dates'
import HabitEditor from './HabitEditor'
import MonthGrid from './MonthGrid'
import Today from './Today'

const key = (habitId, day) => `${habitId}|${day}`

function withKey(set, k, on) {
  const next = new Set(set)
  on ? next.add(k) : next.delete(k)
  return next
}

// Re-reads the clock every minute so an app left open overnight moves to the new day.
function useToday() {
  const [today, setToday] = useState(todayIso)
  useEffect(() => {
    const id = setInterval(() => setToday(todayIso()), 60_000)
    return () => clearInterval(id)
  }, [])
  return today
}

export default function App() {
  const today = useToday()
  const [view, setView] = useState(() => {
    const t = new Date()
    return { year: t.getFullYear(), month: t.getMonth() }
  })
  const [habits, setHabits] = useState([])
  const [done, setDone] = useState(() => new Set())
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)

  const start = iso(view.year, view.month, 1)
  const end = iso(view.year, view.month, daysInMonth(view.year, view.month))

  useEffect(() => {
    api.habits().then(setHabits).catch(setError)
  }, [])

  useEffect(() => {
    let stale = false
    // Today's boxes are needed even while browsing another month.
    Promise.all([api.entries(start, end), api.entries(today, today)])
      .then(([month, day]) => {
        if (!stale) setDone(new Set([...month, ...day].map((e) => key(e.habit_id, e.date))))
      })
      .catch(setError)
    return () => {
      stale = true
    }
  }, [start, end, today])

  const isDone = (habitId, day) => done.has(key(habitId, day))

  async function toggle(habitId, day) {
    const k = key(habitId, day)
    const on = !done.has(k)
    setDone((prev) => withKey(prev, k, on))
    try {
      await api.setDone(habitId, day, on)
    } catch (e) {
      setDone((prev) => withKey(prev, k, !on))
      setError(e)
    }
  }

  function moveMonth(delta) {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="app">
      <header className="panel header">
        <div>
          <h1>ARC TRACKER</h1>
          <p className="subtitle">Suivi d'habitudes</p>
        </div>
        <nav className="month-nav" aria-label="Choisir le mois">
          <button className="icon" onClick={() => moveMonth(-1)} aria-label="Mois précédent">‹</button>
          <select
            value={view.month}
            onChange={(e) => setView({ ...view, month: Number(e.target.value) })}
            aria-label="Mois"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <span className="year">{view.year}</span>
          <button className="icon" onClick={() => moveMonth(1)} aria-label="Mois suivant">›</button>
        </nav>
        <p className="tagline">Plus saine, plus heureuse ♡</p>
      </header>

      {error && (
        <div className="error" role="alert">
          <span>Une action n'a pas pu être enregistrée. Le serveur est-il lancé ? ({error.message})</span>
          <button className="icon" onClick={() => setError(null)} aria-label="Fermer">✕</button>
        </div>
      )}

      <main className="layout">
        <Today habits={habits} today={today} isDone={isDone} onToggle={toggle} />
        <MonthGrid
          year={view.year}
          month={view.month}
          today={today}
          habits={habits}
          isDone={isDone}
          onToggle={toggle}
          onEdit={() => setEditing(true)}
        />
      </main>

      {editing && (
        <HabitEditor
          habits={habits}
          setHabits={setHabits}
          onError={setError}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
