import SprigPicker from '../sprig/SprigPicker'


interface GrowingSystemOption {
  value: string
  label: string
}


interface GrowingSystemSectionProps {
  growingSystemType: string | null

  setGrowingSystemType: (
    value: string,
  ) => void

  growingSystemOptions: GrowingSystemOption[]

  growingSystemAddedDate: string

  setGrowingSystemAddedDate: (
    value: string,
  ) => void

  growingSystemNotes: string

  setGrowingSystemNotes: (
    value: string,
  ) => void
}


export default function GrowingSystemSection({
  growingSystemType,
  setGrowingSystemType,
  growingSystemOptions,
  growingSystemAddedDate,
  setGrowingSystemAddedDate,
  growingSystemNotes,
  setGrowingSystemNotes,
}: GrowingSystemSectionProps) {
  return (
    <section className="sprig-form-section growing-setup-details">

      <SprigPicker
        title="What kind of growing system is it?"
        variant="label"
        showTrigger={false}
        options={growingSystemOptions}
        selectedValues={
          growingSystemType
            ? [growingSystemType]
            : []
        }
        isOpen={true}
        onToggleOpen={() => {}}
        onToggleValue={(value) =>
          setGrowingSystemType(value)
        }
      />

      <label>
        When did you add this system to Sprig?

        <input
          type="date"
          value={growingSystemAddedDate}
          onChange={(event) =>
            setGrowingSystemAddedDate(
              event.target.value,
            )
          }
        />
      </label>

      <label>
        Notes to this system

        <textarea
          value={growingSystemNotes}
          onChange={(event) =>
            setGrowingSystemNotes(
              event.target.value,
            )
          }
          placeholder="Reservoir, growing media, plumbing, observations..."
          rows={4}
        />
      </label>

    </section>
  )
}