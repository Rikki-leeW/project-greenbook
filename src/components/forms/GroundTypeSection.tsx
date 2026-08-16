import type {
    Dispatch,
    SetStateAction,
  } from 'react'
  
  import SprigPicker from '../sprig/SprigPicker'
  
  interface GroundTypeOption {
    value: string
    label: string
  }
  
  interface GroundTypeSectionProps {
    groundType: string | null
  
    setGroundType: Dispatch<
      SetStateAction<string | null>
    >
  
    groundTypeOptions: GroundTypeOption[]
  
    groundTypeAddedDate: string
  
    setGroundTypeAddedDate: Dispatch<
      SetStateAction<string>
    >
  
    groundTypeNotes: string
  
    setGroundTypeNotes: Dispatch<
      SetStateAction<string>
    >
  }
  
  export default function GroundTypeSection({
    groundType,
    setGroundType,
    groundTypeOptions,
    groundTypeAddedDate,
    setGroundTypeAddedDate,
    groundTypeNotes,
    setGroundTypeNotes,
  }: GroundTypeSectionProps) {
    return (
      <section className="sprig-form-section growing-setup-details">
  
        <SprigPicker
          title="What kind of ground is it?"
          variant="label"
          showTrigger={false}
          options={groundTypeOptions}
          selectedValues={
            groundType
              ? [groundType]
              : []
          }
          isOpen={true}
          onToggleOpen={() => {}}
          onToggleValue={(value) =>
            setGroundType(value)
          }
        />
  
        <label>
          When did you add this to Sprig?
  
          <input
            type="date"
            value={groundTypeAddedDate}
            onChange={(event) =>
              setGroundTypeAddedDate(
                event.target.value,
              )
            }
          />
        </label>
  
        <label>
          Notes to this ground
  
          <textarea
            value={groundTypeNotes}
            onChange={(event) =>
              setGroundTypeNotes(
                event.target.value,
              )
            }
            placeholder="Clay depth, drainage, amendments, rocks..."
            rows={4}
          />
        </label>
  
      </section>
    )
  }