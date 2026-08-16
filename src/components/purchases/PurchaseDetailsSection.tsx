import type {
    Dispatch,
    SetStateAction,
  } from 'react'
  
  import type {
    PurchaseUnit,
  } from '../../types'
  
  
  interface PurchaseDetailsSectionProps {
    supplier: string
  
    setSupplier: Dispatch<
      SetStateAction<string>
    >
  
    purchaseDate: string
  
    setPurchaseDate: Dispatch<
      SetStateAction<string>
    >
  
    pricePaid: string
  
    setPricePaid: Dispatch<
      SetStateAction<string>
    >
  
    quantity: string
  
    setQuantity: Dispatch<
      SetStateAction<string>
    >
  
    unit: PurchaseUnit
  
    setUnit: Dispatch<
      SetStateAction<PurchaseUnit>
    >
  
    packageSize: string
  
    setPackageSize: Dispatch<
      SetStateAction<string>
    >
  
    packageUnit: PurchaseUnit
  
    setPackageUnit: Dispatch<
      SetStateAction<PurchaseUnit>
    >
  
    purchaseNotes: string
  
    setPurchaseNotes: Dispatch<
      SetStateAction<string>
    >
  }
  
  
  interface PurchaseUnitOption {
    value: PurchaseUnit
    label: string
  }
  
  
  const purchaseUnitOptions:
    PurchaseUnitOption[] = [
      {
        value: 'each',
        label: 'Each',
      },
      {
        value: 'packet',
        label: 'Packet',
      },
      {
        value: 'bag',
        label: 'Bag',
      },
      {
        value: 'box',
        label: 'Box',
      },
      {
        value: 'tray',
        label: 'Tray',
      },
      {
        value: 'litre',
        label: 'Litre',
      },
      {
        value: 'millilitre',
        label: 'Millilitre',
      },
      {
        value: 'kilogram',
        label: 'Kilogram',
      },
      {
        value: 'gram',
        label: 'Gram',
      },
      {
        value: 'metre',
        label: 'Metre',
      },
      {
        value: 'other',
        label: 'Other',
      },
    ]
  
  
  export default function PurchaseDetailsSection({
    supplier,
    setSupplier,
    purchaseDate,
    setPurchaseDate,
    pricePaid,
    setPricePaid,
    quantity,
    setQuantity,
    unit,
    setUnit,
    packageSize,
    setPackageSize,
    packageUnit,
    setPackageUnit,
    purchaseNotes,
    setPurchaseNotes,
  }: PurchaseDetailsSectionProps) {
  
    /* =======================================
       UNIT HANDLERS
    ======================================= */
  
    function handleUnitChange(
      value: string,
    ) {
      setUnit(
        value as PurchaseUnit,
      )
    }
  
  
    function handlePackageUnitChange(
      value: string,
    ) {
      setPackageUnit(
        value as PurchaseUnit,
      )
    }
  
  
    return (
      <section className="sprig-form-section growing-setup-details">
        <p className="section-label">
          Purchase details
        </p>
  
        <h3>
          What did this one cost?
        </h3>
  
        <p className="form-whisper">
          If this came home from somewhere,
          Sprig can remember what you paid
          and where it came from.
        </p>
  
  
        {/* =======================================
            SUPPLIER
        ======================================= */}
  
        <label>
          Where did you buy it?
  
          <input
            type="text"
            value={
              supplier
            }
            onChange={(event) =>
              setSupplier(
                event.target.value,
              )
            }
            placeholder="Bunnings, nursery, local grower..."
          />
        </label>
  
  
        {/* =======================================
            PURCHASE DATE
        ======================================= */}
  
        <label>
          When did you buy it?
  
          <input
            type="date"
            value={
              purchaseDate
            }
            onChange={(event) =>
              setPurchaseDate(
                event.target.value,
              )
            }
          />
        </label>
  
  
        {/* =======================================
            PRICE
        ======================================= */}
  
        <label>
          Total price paid
  
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={
              pricePaid
            }
            onChange={(event) =>
              setPricePaid(
                event.target.value,
              )
            }
            placeholder="12.98"
          />
        </label>
  
        <p className="form-whisper">
          Enter the total amount paid for
          this purchase, not the price per
          item.
        </p>
  
  
        {/* =======================================
            QUANTITY
        ======================================= */}
  
        <label>
          How many did you buy?
  
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={
              quantity
            }
            onChange={(event) =>
              setQuantity(
                event.target.value,
              )
            }
            placeholder="1"
          />
        </label>
  
  
        <label>
          Quantity unit
  
          <select
            value={
              unit
            }
            onChange={(event) =>
              handleUnitChange(
                event.target.value,
              )
            }
          >
            {purchaseUnitOptions.map(
              (option) => (
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
  
  
        {/* =======================================
            PACKAGE SIZE
        ======================================= */}
  
        <label>
          Package size
  
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={
              packageSize
            }
            onChange={(event) =>
              setPackageSize(
                event.target.value,
              )
            }
            placeholder="1.2"
          />
        </label>
  
  
        <label>
          Package unit
  
          <select
            value={
              packageUnit
            }
            onChange={(event) =>
              handlePackageUnitChange(
                event.target.value,
              )
            }
          >
            {purchaseUnitOptions.map(
              (option) => (
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
  
  
        {/* =======================================
            NOTES
        ======================================= */}
  
        <label>
          Purchase notes
  
          <textarea
            value={
              purchaseNotes
            }
            onChange={(event) =>
              setPurchaseNotes(
                event.target.value,
              )
            }
            placeholder="Special price, bought on clearance, pack contains several items..."
            rows={3}
          />
        </label>
  
  
        <p className="form-whisper">
          Purchase details are optional.
          Leaving them blank simply means
          Sprig will save the garden record
          without creating a Purchase record.
        </p>
      </section>
    )
  }