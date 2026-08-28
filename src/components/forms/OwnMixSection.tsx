import type {
  Dispatch,
  SetStateAction,
} from 'react'


interface OwnMixSectionProps {
  ownMixName: string

  setOwnMixName: Dispatch<
    SetStateAction<string>
  >

  ownMixCreatedDate: string

  setOwnMixCreatedDate: Dispatch<
    SetStateAction<string>
  >

  ownMixNotes: string

  setOwnMixNotes: Dispatch<
    SetStateAction<string>
  >
}


/* =======================================
   OWN MIX SECTION
======================================= */

export default function OwnMixSection({
  ownMixName,
  setOwnMixName,
  ownMixCreatedDate,
  setOwnMixCreatedDate,
  ownMixNotes,
  setOwnMixNotes,
}: OwnMixSectionProps) {
  return (
    <section className="sprig-form-section growing-setup-details">

      {/* =======================================
          MIX NAME
      ======================================= */}

      <label>
        What do you call this mix?

        <input
          type="text"
          value={
            ownMixName
          }
          onChange={(
            event,
          ) =>
            setOwnMixName(
              event.target.value,
            )
          }
          placeholder="Tomato Mix, Mix 1..."
          required
        />
      </label>


      {/* =======================================
          CREATED DATE
      ======================================= */}

      <label>
        When did you make this mix?

        <input
          type="date"
          value={
            ownMixCreatedDate
          }
          onChange={(
            event,
          ) =>
            setOwnMixCreatedDate(
              event.target.value,
            )
          }
        />
      </label>


      {/* =======================================
          MIX NOTES
      ======================================= */}

      <label>
        Notes to this mix

        <textarea
          value={
            ownMixNotes
          }
          onChange={(
            event,
          ) =>
            setOwnMixNotes(
              event.target.value,
            )
          }
          placeholder="Ratios, quantities, changes, observations..."
          rows={4}
        />
      </label>

    </section>
  )
}