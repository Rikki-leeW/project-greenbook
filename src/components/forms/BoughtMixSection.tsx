import type { Dispatch, SetStateAction } from 'react'

interface BoughtMixSectionProps {
  boughtMixBrand: string
  setBoughtMixBrand: Dispatch<
    SetStateAction<string>
  >

  boughtMixProductName: string
  setBoughtMixProductName: Dispatch<
    SetStateAction<string>
  >

  boughtMixAddedDate: string
  setBoughtMixAddedDate: Dispatch<
    SetStateAction<string>
  >

  boughtMixNotes: string
  setBoughtMixNotes: Dispatch<
    SetStateAction<string>
  >
}

export default function BoughtMixSection({
  boughtMixBrand,
  setBoughtMixBrand,
  boughtMixProductName,
  setBoughtMixProductName,
  boughtMixAddedDate,
  setBoughtMixAddedDate,
  boughtMixNotes,
  setBoughtMixNotes,
}: BoughtMixSectionProps) {
  return (
    <section className="sprig-form-section growing-setup-details">

      <label>
        What brand is it?

        <input
          type="text"
          value={boughtMixBrand}
          onChange={(event) =>
            setBoughtMixBrand(
              event.target.value,
            )
          }
          placeholder="Rocky Point, Richgro, Brunnings..."
        />
      </label>

      <label>
        What is the mix called?

        <input
          type="text"
          value={boughtMixProductName}
          onChange={(event) =>
            setBoughtMixProductName(
              event.target.value,
            )
          }
          placeholder="Premium Potting Mix..."
          required
        />
      </label>

      <label>
        When did this mix enter your garden?

        <input
          type="date"
          value={boughtMixAddedDate}
          onChange={(event) =>
            setBoughtMixAddedDate(
              event.target.value,
            )
          }
        />
      </label>

      <label>
        Notes to this mix

        <textarea
          value={boughtMixNotes}
          onChange={(event) =>
            setBoughtMixNotes(
              event.target.value,
            )
          }
          placeholder="Where you bought it, how it performed..."
          rows={4}
        />
      </label>

    </section>
  )
}