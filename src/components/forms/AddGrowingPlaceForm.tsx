import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'

import type {
  GardenAspect,
  GrowingPlace,
  GrowingPlaceKind,
  ShelterLevel,
  SunlightLevel,
} from '../../types'


interface AddGrowingPlaceFormProps {
  placeToEdit?: GrowingPlace

  onAddPlace: (
    place: GrowingPlace,
  ) => void

  onUpdatePlace?: (
    place: GrowingPlace,
  ) => void

  onClose: () => void
}


interface SelectOption<T extends string> {
  value: T
  label: string
}


const PLACE_KIND_OPTIONS:
  SelectOption<GrowingPlaceKind>[] = [
    {
      value: 'garden-area',
      label: 'Garden Area',
    },
    {
      value: 'garden-bed',
      label: 'Garden Bed',
    },
    {
      value: 'raised-bed',
      label: 'Raised Bed',
    },
    {
      value: 'pot',
      label: 'Pot',
    },
    {
      value: 'grow-bag',
      label: 'Grow Bag',
    },
    {
      value: 'planter-box',
      label: 'Planter Box',
    },
    {
      value: 'greenhouse',
      label: 'Greenhouse',
    },
    {
      value: 'cold-frame',
      label: 'Cold Frame',
    },
    {
      value: 'shade-house',
      label: 'Shade House',
    },
    {
      value: 'deck',
      label: 'Deck',
    },
    {
      value: 'patio',
      label: 'Patio',
    },
    {
      value: 'balcony',
      label: 'Balcony',
    },
    {
      value: 'courtyard',
      label: 'Courtyard',
    },
    {
      value: 'grass-area',
      label: 'Grass Area',
    },
    {
      value: 'retaining-wall',
      label: 'Retaining Wall',
    },
    {
      value: 'rock-wall',
      label: 'Rock Wall',
    },
    {
      value: 'orchard',
      label: 'Orchard',
    },
    {
      value: 'food-forest',
      label: 'Food Forest',
    },
    {
      value: 'herb-garden',
      label: 'Herb Garden',
    },
    {
      value: 'flower-garden',
      label: 'Flower Garden',
    },
    {
      value: 'vine',
      label: 'Vine Area',
    },
    {
      value: 'compost-area',
      label: 'Compost Area',
    },
    {
      value: 'nursery-area',
      label: 'Nursery Area',
    },
    {
      value: 'indoor',
      label: 'Indoor',
    },
    {
      value: 'windowsill',
      label: 'Windowsill',
    },
    {
      value: 'other',
      label: 'Something Else',
    },
  ]


const ASPECT_OPTIONS:
  SelectOption<GardenAspect>[] = [
    {
      value: 'north',
      label: 'North',
    },
    {
      value: 'north-east',
      label: 'North-East',
    },
    {
      value: 'east',
      label: 'East',
    },
    {
      value: 'south-east',
      label: 'South-East',
    },
    {
      value: 'south',
      label: 'South',
    },
    {
      value: 'south-west',
      label: 'South-West',
    },
    {
      value: 'west',
      label: 'West',
    },
    {
      value: 'north-west',
      label: 'North-West',
    },
  ]


const SUNLIGHT_OPTIONS:
  SelectOption<SunlightLevel>[] = [
    {
      value: 'full-sun',
      label: 'Full Sun',
    },
    {
      value: 'mostly-sun',
      label: 'Mostly Sun',
    },
    {
      value: 'part-sun',
      label: 'Part Sun',
    },
    {
      value: 'dappled-light',
      label: 'Dappled Light',
    },
    {
      value: 'mostly-shade',
      label: 'Mostly Shade',
    },
    {
      value: 'deep-shade',
      label: 'Deep Shade',
    },
  ]


const SHELTER_OPTIONS:
  SelectOption<ShelterLevel>[] = [
    {
      value: 'very-exposed',
      label: 'Very Exposed',
    },
    {
      value: 'some-shelter',
      label: 'Some Shelter',
    },
    {
      value: 'well-sheltered',
      label: 'Well Sheltered',
    },
    {
      value: 'fully-protected',
      label: 'Fully Protected',
    },
    {
      value: 'changes-with-season',
      label: 'Changes With Season',
    },
    {
      value: 'not-sure',
      label: 'Not Sure',
    },
  ]


function createGrowingPlaceId(
  name: string,
): string {
  const safeName =
    name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-',
      )
      .replace(
        /^-|-$/g,
        '',
      )


  return `${
    safeName ||
    'growing-place'
  }-${Date.now()}`
}


export default function AddGrowingPlaceForm({
  placeToEdit,
  onAddPlace,
  onUpdatePlace,
  onClose,
}: AddGrowingPlaceFormProps) {

  const formRef =
    useRef<HTMLFormElement>(
      null,
    )


  const isEditing =
    Boolean(
      placeToEdit,
    )


  const [
    name,
    setName,
  ] =
    useState(
      placeToEdit?.name ??
      '',
    )


  const [
    kind,
    setKind,
  ] =
    useState<GrowingPlaceKind>(
      placeToEdit?.kind ??
      'garden-area',
    )


  const [
    customKindLabel,
    setCustomKindLabel,
  ] =
    useState(
      placeToEdit
        ?.customKindLabel ??
      '',
    )


  const [
    aspect,
    setAspect,
  ] =
    useState<
      GardenAspect |
      ''
    >(
      placeToEdit?.aspect ??
      '',
    )


  const [
    sunlight,
    setSunlight,
  ] =
    useState<
      SunlightLevel |
      ''
    >(
      placeToEdit?.sunlight ??
      '',
    )


  const [
    shelter,
    setShelter,
  ] =
    useState<
      ShelterLevel |
      ''
    >(
      placeToEdit?.shelter ??
      '',
    )


  const [
    notes,
    setNotes,
  ] =
    useState(
      placeToEdit?.notes ??
      '',
    )


  useEffect(
    () => {
      const scrollY =
        window.scrollY


      requestAnimationFrame(
        () => {
          if (
            formRef.current
          ) {
            formRef.current.scrollTop =
              0
          }
        },
      )


      const previousOverflow =
        document.body.style.overflow

      const previousPosition =
        document.body.style.position

      const previousTop =
        document.body.style.top

      const previousWidth =
        document.body.style.width


      document.body.style.overflow =
        'hidden'

      document.body.style.position =
        'fixed'

      document.body.style.top =
        `-${scrollY}px`

      document.body.style.width =
        '100%'


      return () => {
        document.body.style.overflow =
          previousOverflow

        document.body.style.position =
          previousPosition

        document.body.style.top =
          previousTop

        document.body.style.width =
          previousWidth


        window.scrollTo(
          0,
          scrollY,
        )
      }
    },
    [],
  )


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()


    const trimmedName =
      name.trim()


    if (
      !trimmedName
    ) {
      return
    }


    const now =
      new Date()
        .toISOString()


    if (
      placeToEdit
    ) {
      const updatedPlace:
        GrowingPlace = {
          ...placeToEdit,

          name:
            trimmedName,

          kind,

          customKindLabel:
            kind ===
              'other'
              ? (
                  customKindLabel
                    .trim() ||
                  undefined
                )
              : undefined,

          aspect:
            aspect ||
            undefined,

          sunlight:
            sunlight ||
            undefined,

          shelter:
            shelter ||
            undefined,

          notes:
            notes.trim() ||
            undefined,

          updatedAt:
            now,
        }


      onUpdatePlace?.(
        updatedPlace,
      )

      return
    }


    const newPlace:
      GrowingPlace = {
        id:
          createGrowingPlaceId(
            trimmedName,
          ),

        name:
          trimmedName,

        kind,

        customKindLabel:
          kind ===
            'other'
            ? (
                customKindLabel
                  .trim() ||
                undefined
              )
            : undefined,

        aspect:
          aspect ||
          undefined,

        sunlight:
          sunlight ||
          undefined,

        shelter:
          shelter ||
          undefined,

        notes:
          notes.trim() ||
          undefined,

        createdAt:
          now,
      }


    onAddPlace(
      newPlace,
    )
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
        aria-labelledby="add-growing-place-title"
      >
        <img
          className="chronicle-page-image"
          src={
            notebookEntryBackground
          }
          alt=""
          aria-hidden="true"
        />


        <div className="chronicle-content">

          <div className="form-heading-row">
            <div>
              <p className="section-label">
                Growing · Where
              </p>

              <h2 id="add-growing-place-title">
                {
                  isEditing
                    ? 'Edit Growing Place'
                    : 'Add a Growing Place'
                }
              </h2>

              <p className="form-whisper">
                A Growing Place remembers
                where something physically
                grows.
              </p>
            </div>


            <button
              type="button"
              className="form-close-button"
              onClick={
                onClose
              }
              aria-label="Close"
            >
              ×
            </button>
          </div>


          <form
            ref={
              formRef
            }
            className="add-plant-form"
            onSubmit={
              handleSubmit
            }
          >

            <label>
              What do you call this place?

              <input
                type="text"
                value={
                  name
                }
                onChange={
                  event =>
                    setName(
                      event.target.value,
                    )
                }
                placeholder="Top Garden, west wall, greenhouse..."
                required
              />
            </label>


            <label>
              What kind of place is it?

              <select
                value={
                  kind
                }
                onChange={
                  event =>
                    setKind(
                      event.target.value as GrowingPlaceKind,
                    )
                }
              >
                {PLACE_KIND_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>


            {kind ===
              'other' && (
              <label>
                What do you call this kind of place?

                <input
                  type="text"
                  value={
                    customKindLabel
                  }
                  onChange={
                    event =>
                      setCustomKindLabel(
                        event.target.value,
                      )
                  }
                  placeholder="Your own place type"
                />
              </label>
            )}


            <div>
              <p className="section-label">
                Conditions
              </p>

              <p className="form-whisper">
                Optional. Add what is useful
                now and change it whenever
                the garden changes.
              </p>
            </div>


            <label>
              Aspect

              <select
                value={
                  aspect
                }
                onChange={
                  event =>
                    setAspect(
                      event.target.value as
                        | GardenAspect
                        | '',
                    )
                }
              >
                <option value="">
                  Not recorded
                </option>

                {ASPECT_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Sunlight

              <select
                value={
                  sunlight
                }
                onChange={
                  event =>
                    setSunlight(
                      event.target.value as
                        | SunlightLevel
                        | '',
                    )
                }
              >
                <option value="">
                  Not recorded
                </option>

                {SUNLIGHT_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Shelter

              <select
                value={
                  shelter
                }
                onChange={
                  event =>
                    setShelter(
                      event.target.value as
                        | ShelterLevel
                        | '',
                    )
                }
              >
                <option value="">
                  Not recorded
                </option>

                {SHELTER_OPTIONS.map(
                  option => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Notes about this place

              <textarea
                value={
                  notes
                }
                onChange={
                  event =>
                    setNotes(
                      event.target.value,
                    )
                }
                placeholder="Heat reflection, afternoon shade, wind, seasonal changes..."
                rows={
                  5
                }
              />
            </label>


            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  onClose
                }
              >
                Leave it for now
              </button>

              <button
                type="submit"
                className="enter-button"
              >
                {
                  isEditing
                    ? 'Save changes'
                    : 'Add this place'
                }
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  )
}