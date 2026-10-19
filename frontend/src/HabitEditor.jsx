import { useEffect, useRef } from 'react'
import { api } from './api'

export default function HabitEditor({ habits, setHabits, onError, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
  }, [])

  const categories = [...new Set(habits.map((h) => h.category).filter(Boolean))]

  // Saves the row when one of its inputs loses focus; puts the old value back if that fails.
  // Both values are read from the inputs, so a name save still in flight is not undone.
  async function save(habit, field, input) {
    const [name, category] = [...input.closest('li').querySelectorAll('input')].map((i) => i.value.trim())
    if (!name) {
      input.value = habit.name
      return
    }
    if (name === habit.name && category === habit.category) return
    try {
      const saved = await api.updateHabit(habit.id, { name, category })
      input.value = saved[field]
      setHabits((hs) => hs.map((h) => (h.id === habit.id ? saved : h)))
    } catch (e) {
      input.value = habit[field]
      onError(e)
    }
  }

  async function remove(habit) {
    if (!confirm(`Supprimer « ${habit.name} » et tout son historique ?`)) return
    try {
      await api.deleteHabit(habit.id)
      setHabits((hs) => hs.filter((h) => h.id !== habit.id))
    } catch (e) {
      onError(e)
    }
  }

  async function add(e) {
    e.preventDefault()
    const form = e.currentTarget
    try {
      const habit = await api.createHabit(Object.fromEntries(new FormData(form)))
      setHabits((hs) => [...hs, habit])
      form.reset()
      form.elements.namedItem('name').focus()
    } catch (err) {
      onError(err)
    }
  }

  return (
    <dialog ref={dialog} className="panel editor" onClose={onClose}>
      <div className="panel-head">
        <h2>Gérer les habitudes</h2>
        <button className="icon" onClick={() => dialog.current.close()} aria-label="Fermer">✕</button>
      </div>

      <datalist id="categories">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>

      <div className="editor-labels" aria-hidden="true">
        <span>Nom</span>
        <span>Catégorie</span>
      </div>
      <ul className="editor-list">
        {habits.map((h) => (
          <li key={h.id}>
            <input
              defaultValue={h.name}
              maxLength={100}
              aria-label="Nom"
              onBlur={(e) => save(h, 'name', e.target)}
            />
            <input
              defaultValue={h.category}
              maxLength={50}
              list="categories"
              aria-label="Catégorie"
              onBlur={(e) => save(h, 'category', e.target)}
            />
            <button className="icon danger" onClick={() => remove(h)} aria-label={`Supprimer ${h.name}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form className="editor-add" onSubmit={add}>
        <input name="name" placeholder="Nouvelle habitude" maxLength={100} required aria-label="Nom" />
        <input name="category" placeholder="Catégorie" maxLength={50} list="categories" aria-label="Catégorie" />
        <button className="primary">Ajouter</button>
      </form>
    </dialog>
  )
}
