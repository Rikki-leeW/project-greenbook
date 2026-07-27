import {
  useState,
  type FormEvent,
} from 'react'
import cameraIcon from '../../images/icons/camera-2.png'
import SelectionCard from '../sprig/SelectionCard'
import SprigPicker from '../sprig/SprigPicker'
import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import type {
  EventType,
  GardenEvent,
  GrowingPlace,
  GrowingPlaceScope,
  PlantScope,
  PlantStory,
} from '../../types'

interface AddEventFormProps {
  plantId: string
  plants: PlantStory[]
  growingPlaces: GrowingPlace[]
  onAddEvent: (event: GardenEvent) => void
  onClose: () => void
}

export default function AddEventForm({
  plantId,
  onAddEvent,
  onClose,
}: AddEventFormProps) {
  const today = new Date()
    .toISOString()
    .slice(0, 10)

    const [activityTypes, setActivityTypes] =
    useState<EventType[]>([])
  
  const [isActivityPickerOpen, setIsActivityPickerOpen] =
    useState(false)

  const [date, setDate] =
    useState(today)

  const [title, setTitle] =
    useState('')

  const [productUsed, setProductUsed] =
    useState('')

  const [notes, setNotes] =
    useState('')

  const [
    growingPlaceScope,
    setGrowingPlaceScope,
  ] = useState<GrowingPlaceScope>('none')

  const [
    growingPlaceIds,
    setGrowingPlaceIds,
  ] = useState<string[]>([])

  const [
    plantScope,
    setPlantScope,
  ] = useState<PlantScope>(
    plantId ? 'single' : 'none',
  )

  const [
    plantStoryIds,
    setPlantStoryIds,
  ] = useState<string[]>(
    plantId ? [plantId] : [],
  )


  function chooseGrowingPlaceScope(
    scope: GrowingPlaceScope,
  ) {
    setGrowingPlaceScope(scope)
  
    if (
      scope === 'none' ||
      scope === 'entire-garden'
    ) {
      setGrowingPlaceIds([])
    }
  }
  function choosePlantScope(
    scope: PlantScope,
  ) {
    setPlantScope(scope)
  
    if (
      scope === 'none' ||
      scope === 'all-plants'
    ) {
      setPlantStoryIds([])
    }
  
    if (
      scope === 'single' &&
      plantId
    ) {
      setPlantStoryIds([plantId])
    }
  }
  const activityOptions: {
    value: EventType
    label: string
    icon: string
  }[] = [
    {
      value: 'observation',
      label: 'Observed',
      icon: '👀',
    },
    {
      value: 'watered',
      label: 'Watered',
      icon: '💧',
    },
    {
      value: 'fed',
      label: 'Fertilised',
      icon: '🌿',
    },
    {
      value: 'sprouted',
      label: 'Sprouted',
      icon: '🌱',
    },
    {
      value: 'pruned',
      label: 'Pruned',
      icon: '✂️',
    },
    {
      value: 'treated',
      label: 'Treated',
      icon: '🩹',
    },
    {
      value: 'harvest',
      label: 'Harvested',
      icon: '🧺',
    },
    {
      value: 'moved',
      label: 'Moved',
      icon: '🪴',
    },
    {
      value: 'hilled',
      label: 'Hilled',
      icon: '🥔',
    },
    {
      value: 'weather',
      label: 'Weather',
      icon: '🌦️',
    },
    {
      value: 'photo',
      label: 'Photographed',
      icon: '📷',
    },
    {
      value: 'note',
      label: 'Made a note',
      icon: '📖',
    },
  ]
  
  const [photoUrl, setPhotoUrl] =
  useState<string | undefined>()

function toggleActivity(
  activity: EventType,
) {
  setActivityTypes((current) => {
    if (current.includes(activity)) {
      return current.filter(
        (item) => item !== activity,
      )
    }

    return [...current, activity]
  })
}

function handlePhotoChange(
  event: React.ChangeEvent<HTMLInputElement>,
) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    window.alert('Please choose an image file.')
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    const image = new Image()

    image.onload = () => {
      const maxWidth = 1200
      const scale = Math.min(
        1,
        maxWidth / image.width,
      )

      const canvas =
        document.createElement('canvas')

      canvas.width = Math.round(
        image.width * scale,
      )

      canvas.height = Math.round(
        image.height * scale,
      )

      const context =
        canvas.getContext('2d')

      if (!context) {
        return
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      const compressedPhoto =
        canvas.toDataURL(
          'image/jpeg',
          0.78,
        )

      setPhotoUrl(compressedPhoto)
    }

    image.src = String(reader.result)
  }

  reader.readAsDataURL(file)
}


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const primaryType =
  activityTypes[0] ?? 'observation'

    const newEvent: GardenEvent = {
      id: crypto.randomUUID(),
      type: primaryType,
      activityTypes,
      date,
      title:
  title.trim() ||
  activityOptions
    .filter((option) =>
      activityTypes.includes(option.value),
    )
    .map((option) => option.label)
    .join(', '),

      productUsed:
        productUsed.trim() || undefined,

      notes:
        notes.trim() || undefined,

      growingPlaceScope,
      growingPlaceIds,      
      photoUrl,
      plantScope,
      plantStoryIds,
    }

    onAddEvent(newEvent)
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
          <div className="journal-entry-heading-row">
  <label className="journal-title-field">
    Give this page a title

    <input
      value={title}
      onChange={(event) =>
        setTitle(event.target.value)
      }
      placeholder="Watered the front"
    />
  </label>

  <label className="journal-date-field">
    When

    <input
      type="date"
      value={date}
      onChange={(event) =>
        setDate(event.target.value)
      }
    />
  </label>
</div>

<SprigPicker
  title="What happened?"
  options={activityOptions}
  selectedValues={activityTypes}
  isOpen={isActivityPickerOpen}
  onToggleOpen={() =>
    setIsActivityPickerOpen(
      (current) => !current,
    )
  }
  onToggleValue={toggleActivity}
/>

<section className="journal-connection-section">
  <div className="journal-section-heading">
    <h5>Where did this story unfold?</h5>
  </div>
  <div className="scope-card-grid growing-place-scope-grid">
  <SelectionCard
    title="One Place"
    icon="🌱"
    isSelected={
      growingPlaceScope === 'single'
    }
    onClick={() =>
      chooseGrowingPlaceScope('single')
    }
  />

  <SelectionCard
    title="Several Places"
    icon="🌿"
    isSelected={
      growingPlaceScope === 'multiple'
    }
    onClick={() =>
      chooseGrowingPlaceScope('multiple')
    }
  />

  <SelectionCard
    title="Whole Garden"
    icon="🌳"
    isSelected={
      growingPlaceScope ===
      'entire-garden'
    }
    onClick={() =>
      chooseGrowingPlaceScope(
        'entire-garden',
      )
    }
  />
</div>
</section>

<section className="journal-connection-section">
  <div className="journal-section-heading">
    <h5>Which plants were involved?</h5>
  </div>

  <div className="scope-card-grid plant-scope-grid">
    <SelectionCard
      title="One Plant"
      icon="🌱"
      isSelected={
        plantScope === 'single'
      }
      onClick={() =>
        choosePlantScope('single')
      }
    />

    <SelectionCard
      title="Several Plants"
      icon="🌿"
      isSelected={
        plantScope === 'multiple'
      }
      onClick={() =>
        choosePlantScope('multiple')
      }
    />

    <SelectionCard
      title="All Plants"
      icon="🌳"
      isSelected={
        plantScope === 'all-plants'
      }
      onClick={() =>
        choosePlantScope('all-plants')
      }
    />
  </div>
</section>


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

<section className="journal-photo-section">
  <label className="journal-photo-label">
    Add a photo
  </label>

  <label className="journal-photo-picker">
    <img
      src={cameraIcon}
      alt=""
      className="journal-photo-icon"
    />

<span className="journal-photo-text">
  Tuck a garden photograph
  <br />
  into this page
</span>

    <input
      type="file"
      accept="image/*"
      onChange={handlePhotoChange}
    />
  </label>
</section>

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