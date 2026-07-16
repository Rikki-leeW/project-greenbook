import { useState, type FormEvent } from 'react'
import type {
  GrowingSpace,
  PlantStory,
  StartMethod,
} from '../../types'

interface AddPlantFormProps {
  growingSpaces: GrowingSpace[]
  onAddPlant: (plant: PlantStory) => void
  onClose: () => void
}

function createPlantId(plantName: string): string {
  const safeName = plantName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${safeName || 'plant'}-${Date.now()}`
}

export default function AddPlantForm({
  growingSpaces,
  onAddPlant,
  onClose,
}: AddPlantFormProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [plantName, setPlantName] = useState('')
  const [variety, setVariety] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [startMethod, setStartMethod] =
    useState<StartMethod>('seedling')
  const [plantedDate, setPlantedDate] = useState(today)
  const [growingSpaceId, setGrowingSpaceId] =
    useState(growingSpaces[0]?.id ?? '')
  const [notes, setNotes] = useState('')

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedPlantName = plantName.trim()
    const trimmedVariety = variety.trim()

    if (!trimmedPlantName) {
      return
    }

    const displayName =
      trimmedVariety || trimmedPlantName

    const newPlant: PlantStory = {
      id: createPlantId(displayName),
      plantName: trimmedPlantName,
      variety: trimmedVariety || undefined,
      displayName,
      personality: 'A story just beginning',
      quantity: Math.max(1, Number(quantity) || 1),
      startMethod,
      plantedDate,
      enteredDate: today,
      status: 'growing',
      currentGrowingSpaceId:
        growingSpaceId || undefined,
      notes: notes.trim() || undefined,
      tags: [],
    }

    onAddPlant(newPlant)
  }

  return (
    <div className="form-backdrop" role="presentation">
      <section
        className="add-plant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-plant-title"
      >
        <div className="form-heading">
          <div>
            <p className="section-label">
              Begin a new story
            </p>
            <h2 id="add-plant-title">
              What has begun to grow?
            </h2>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close Add Plant form"
          >
            ×
          </button>
        </div>

        <form
          className="add-plant-form"
          onSubmit={handleSubmit}
        >
          <label>
            Plant
            <input
              type="text"
              value={plantName}
              onChange={(event) =>
                setPlantName(event.target.value)
              }
              placeholder="Potato, tomato, rose..."
              required
            />
          </label>

          <label>
            Variety
            <input
              type="text"
              value={variety}
              onChange={(event) =>
                setVariety(event.target.value)
              }
              placeholder="Royal Blue, Mortgage Lifter..."
            />
          </label>

          <div className="form-row">
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </label>

            <label>
              Date planted
              <input
                type="date"
                value={plantedDate}
                onChange={(event) =>
                  setPlantedDate(event.target.value)
                }
                required
              />
            </label>
          </div>

          <label>
            How did it begin?
            <select
              value={startMethod}
              onChange={(event) =>
                setStartMethod(
                  event.target.value as StartMethod,
                )
              }
            >
              <option value="seed">Seed</option>
              <option value="seedling">Seedling</option>
              <option value="cutting">Cutting</option>
              <option value="sucker">Sucker</option>
              <option value="seed-potato">
                Seed potato
              </option>
              <option value="tuber">Tuber</option>
              <option value="bulb">Bulb</option>
              <option value="rhizome">Rhizome</option>
              <option value="division">Division</option>
              <option value="bought-plant">
                Bought plant
              </option>
              <option value="other">
                Something else
              </option>
            </select>
          </label>

          <label>
            Where is it growing?
            <select
              value={growingSpaceId}
              onChange={(event) =>
                setGrowingSpaceId(event.target.value)
              }
            >
              <option value="">
                Location not recorded
              </option>

              {growingSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Garden notes
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Number of potato eyes, seed-starting method, condition..."
              rows={4}
            />
          </label>

          <p className="form-whisper">
            🌿 Every story begins with noticing.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Not yet
            </button>

            <button type="submit" className="enter-button">
              Plant it
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}