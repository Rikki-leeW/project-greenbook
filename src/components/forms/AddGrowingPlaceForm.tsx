import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
  } from 'react'
  
  import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'
  
  import type {
    GrowingPlace,
    GrowingPlaceKind,
  } from '../../types'
  
  interface AddGrowingPlaceFormProps {
    onAddPlace: (place: GrowingPlace) => void
    onClose: () => void
  }
  
  function createGrowingPlaceId(name: string): string {
    const safeName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  
    return `${safeName || 'garden-place'}-${Date.now()}`
  }
  
  export default function AddGrowingPlaceForm({
    onAddPlace,
    onClose,
  }: AddGrowingPlaceFormProps) {
    const today = new Date().toISOString()
  
    const [name, setName] = useState('')
    const [kind, setKind] =
  useState<GrowingPlaceKind>('garden-area')
    const [notes, setNotes] = useState('')
  
    const formRef = useRef<HTMLFormElement>(null)
  
    useEffect(() => {
      const scrollY = window.scrollY
  
      requestAnimationFrame(() => {
        if (formRef.current) {
          formRef.current.scrollTop = 0
        }
      })
  
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
  
      const trimmedName = name.trim()
  
      if (!trimmedName) {
        return
      }
  
      const newPlace: GrowingPlace = {
        id: createGrowingPlaceId(trimmedName),
        name: trimmedName,
        kind,
        notes: notes.trim() || undefined,
        createdAt: today,
      }
  
      onAddPlace(newPlace)
    }
  
    return (
      <div
        className="form-backdrop"
        role="presentation"
      >
        <section
          className="add-plant-panel chronicle-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-garden-place-title"
        >
          <img
            className="chronicle-page-image"
            src={notebookEntryBackground}
            alt=""
            aria-hidden="true"
          />
  
          <div className="chronicle-content">
            <div className="form-heading">
              <h2 id="add-garden-place-title">
                Name a growing place
              </h2>
  
              <button
                type="button"
                className="close-button"
                onClick={onClose}
                aria-label="Close garden place page"
              >
                ×
              </button>
            </div>
  
            <form
              ref={formRef}
              className="add-plant-form"
              onSubmit={handleSubmit}
            >
              <p className="form-whisper">
                🌱 Sprig remembers the corners where
                stories begin.
              </p>
  
              <label>
                What do you call this place?
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Top deck, potato corner..."
                  required
                />
              </label>
  
              <label>
                What kind of place is it?
                <select
                  value={kind}
                  onChange={(event) =>
                    setKind(
                      event.target.value as GrowingPlaceKind,
                    )
                  }
                >
                  <option value="garden-area">
                    Garden area
                  </option>
  
                  <option value="garden-bed">
                    Garden bed
                  </option>
  
                  <option value="raised-bed">
                    Raised bed
                  </option>
  
                  <option value="pot">
                    Pot
                  </option>
  
                  <option value="grow-bag">
                    Grow bag
                  </option>
  
                  <option value="greenhouse">
                    Greenhouse
                  </option>
  
                  <option value="compost-area">
                    Compost place
                  </option>
  
                  <option value="indoor">
                    Indoor growing place
                  </option>
  
                  <option value="other">
                    Something else
                  </option>
                </select>
              </label>
  
              <label>
                Notes to the place
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Sun, shade, size, quirks..."
                  rows={4}
                />
              </label>
  
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onClose}
                >
                  Go back
                </button>
  
                <button
                  type="submit"
                  className="enter-button"
                >
                  Add this growing place
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    )
  }