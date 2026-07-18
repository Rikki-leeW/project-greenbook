import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

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

  const [sownDate, setSownDate] = useState(today)
  const [plantedDate, setPlantedDate] = useState(today)
  const [plantedOutDate, setPlantedOutDate] =
    useState('')

    const [hasBeenPlantedOut, setHasBeenPlantedOut] =
  useState(false)
  
  const [growingSpaceId, setGrowingSpaceId] =
    useState(growingSpaces[0]?.id ?? '')

  const [notes, setNotes] = useState('')

  const beganFromSeed = startMethod === 'seed'

  useEffect(() => {
    const scrollY = window.scrollY

    const previousOverflow = document.body.style.overflow
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const previousWidth = document.body.style.width

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = previousWidth

      window.scrollTo(0, scrollY)
    }
  }, [])

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

      sownDate:
        beganFromSeed ? sownDate : undefined,

      plantedDate:
        beganFromSeed
          ? plantedOutDate || sownDate
          : plantedDate,

      plantedOutDate:
        beganFromSeed && plantedOutDate
          ? plantedOutDate
          : undefined,

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
        className="add-plant-panel chronicle-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-plant-title"
      >
        <img
          className="chronicle-page-image"
          src={notebookEntryBackground}
          alt=""
          aria-hidden="true"
        />

        <div className="chronicle-content">
          <div className="form-heading">
            <h2 id="add-plant-title">
              Begin a new growing story
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={onClose}
              aria-label="Close new plant page"
            >
              ×
            </button>
          </div>

          <form
            className="add-plant-form"
            onSubmit={handleSubmit}
          >
            <label>
              What has begun to grow?
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
              Which variety?
              <input
                type="text"
                value={variety}
                onChange={(event) =>
                  setVariety(event.target.value)
                }
                placeholder="Royal Blue, Mortgage Lifter..."
              />
            </label>

            <label>
              How did this story begin?
              <select
                value={startMethod}
                onChange={(event) =>
                  setStartMethod(
                    event.target.value as StartMethod,
                  )
                }
              >
                <option value="seed">Seed</option>
                <option value="seedling">
                  Seedling
                </option>
                <option value="cutting">
                  Cutting
                </option>
                <option value="sucker">
                  Sucker
                </option>
                <option value="seed-potato">
                  Seed potato
                </option>
                <option value="tuber">Tuber</option>
                <option value="bulb">Bulb</option>
                <option value="rhizome">
                  Rhizome
                </option>
                <option value="division">
                  Division
                </option>
                <option value="bought-plant">
                  Bought plant
                </option>
                <option value="other">
                  Something else
                </option>
              </select>
            </label>

            <div className="form-row">
              <label>
                How many?
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                />
              </label>

              {beganFromSeed ? (
                <label>
                  When was it sown?
                  <input
                    type="date"
                    value={sownDate}
                    onChange={(event) =>
                      setSownDate(event.target.value)
                    }
                    required
                  />
                </label>
              ) : (
                <label>
                  When did this chapter begin?
                  <input
                    type="date"
                    value={plantedDate}
                    onChange={(event) =>
                      setPlantedDate(event.target.value)
                    }
                    required
                  />
                </label>
              )}
            </div>

            {beganFromSeed && (
  <>
    <label>
      Has it been planted out yet?

      <select
        value={hasBeenPlantedOut ? 'yes' : 'no'}
        onChange={(event) =>
          setHasBeenPlantedOut(
            event.target.value === 'yes',
          )
        }
      >
        <option value="no">
          Not yet
        </option>

        <option value="yes">
          Yes
        </option>
      </select>
    </label>

    {hasBeenPlantedOut && (
      <label>
        When was it planted out?

        <input
          type="date"
          value={plantedOutDate}
          onChange={(event) =>
            setPlantedOutDate(
              event.target.value,
            )
          }
        />
      </label>
    )}
  </>
)}

            <label>
              Where is it growing?
              <select
                value={growingSpaceId}
                onChange={(event) =>
                  setGrowingSpaceId(event.target.value)
                }
              >
                <option value="">
                  Place not recorded
                </option>

                {growingSpaces.map((space) => (
                  <option
                    key={space.id}
                    value={space.id}
                  >
                    {space.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notes to the story
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="What would future you like to remember?"
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
                🌿 Leave it for now
              </button>

              <button
                type="submit"
                className="enter-button"
              >
                📖 Add this page
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}