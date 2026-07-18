import { useState } from 'react'
import type { GardenEvent } from '../../types'
import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'



interface AddEventFormProps {
  plantId: string
  onAddEvent: (event: GardenEvent) => void
  onClose: () => void
}

export default function AddEventForm({
  plantId,
  onAddEvent,
  onClose,
}: AddEventFormProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [type, setType] =
    useState<GardenEvent['type']>('observation')
  const [date, setDate] = useState(today)
  const [title, setTitle] = useState('')
  const [productUsed, setProductUsed] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    onAddEvent({
        id: crypto.randomUUID(),
        plantStoryIds: plantId ? [plantId] : [],  // ← ADD THIS COMMA
        type,
        date,
        title:
          title.trim() ||
          type.charAt(0).toUpperCase() + type.slice(1),
        productUsed: productUsed.trim() || undefined,
        notes: notes.trim() || undefined,
      })
  }

  return (
    <div className="form-backdrop">
    <section className="add-plant-panel chronicle-panel">
    <img
  className="chronicle-page-image"
  src={notebookEntryBackground}
  alt=""
  aria-hidden="true"
/>

  <div className="chronicle-content">
       /* <div className="form-heading">
        /*  <h2></h2>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="add-plant-form"
          onSubmit={handleSubmit}
        >
          <label>
          What happened?
            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as GardenEvent['type'],
                )
              }
            >
              <option value="observation">
                Observation
              </option>
              <option value="watered">Watered</option>
              <option value="fed">Fed</option>
              <option value="sprouted">
                Sprouted
              </option>
              <option value="pruned">
                Pruned
              </option>
              <option value="treated">
                Treated
              </option>
              <option value="weather">
                Weather
              </option>
              <option value="photo">Photo</option>
              <option value="moved">Moved</option>
              <option value="hilled">Hilled</option>
              <option value="harvest">
                Harvested
              </option>
            </select>
          </label>

          <label>
            When
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label>
            Give this page a title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Watered the front"
            />
          </label>

          <label>
            What did you use?
            <input
              value={productUsed}
              onChange={(e) =>
                setProductUsed(e.target.value)
              }
              placeholder="Season, Powerfeed, Blood * Bone...."
            />
          </label>

          <label>
  Notes to the story
  <textarea
    rows={5}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="What would future you like to remember?"
  />
</label>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Leave it for now
            </button>

            <button
              type="submit"
              className="enter-button"
            >
              Add this page
            </button>
          </div>
        </form>
        </div>
      </section>
    </div>
  )
}