export default function Today({ habits, today, isDone, onToggle }) {
  const count = habits.filter((h) => isDone(h.id, today)).length
  const percent = habits.length ? Math.round((count / habits.length) * 100) : 0
  const label = new Date(`${today}T00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <section className="panel today-panel">
      <div className="panel-head">
        <h2>Aujourd'hui</h2>
        <span className="count">{count}/{habits.length}</span>
      </div>
      <p className="date">{label}</p>
      <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percent}%` }} />
      </div>
      <ul className="today-list">
        {habits.map((h) => (
          <li key={h.id}>
            <label>
              <input
                type="checkbox"
                className="box"
                checked={isDone(h.id, today)}
                onChange={() => onToggle(h.id, today)}
              />
              <span>{h.name}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
