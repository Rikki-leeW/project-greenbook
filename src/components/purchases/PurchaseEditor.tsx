import {
    useEffect,
    useRef,
    useState,
  } from 'react'
  
  import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png'
  
  import type {
    PurchaseRecord,
    PurchaseUnit,
  } from '../../types'
  
  import PurchaseDetailsSection from './PurchaseDetailsSection'
  
  
  interface PurchaseEditorProps {
    purchase?: PurchaseRecord | null
  
    itemType: PurchaseRecord['itemType']
    itemId?: string
    itemName: string
    brand?: string
  
    onSave: (
      purchase: PurchaseRecord,
    ) => void
  
    onClose: () => void
  }
  
  
  export default function PurchaseEditor({
    purchase,
    itemType,
    itemId,
    itemName,
    brand,
    onSave,
    onClose,
  }: PurchaseEditorProps) {
  
    /* =======================================
       PURCHASE STATE
    ======================================= */
  
    const [
      supplier,
      setSupplier,
    ] = useState('')
  
    const [
      purchaseDate,
      setPurchaseDate,
    ] = useState('')
  
    const [
      pricePaid,
      setPricePaid,
    ] = useState('')
  
    const [
      quantity,
      setQuantity,
    ] = useState('')
  
    const [
      unit,
      setUnit,
    ] =
      useState<PurchaseUnit>(
        'each',
      )
  
    const [
      packageSize,
      setPackageSize,
    ] = useState('')
  
    const [
      packageUnit,
      setPackageUnit,
    ] =
      useState<PurchaseUnit>(
        'each',
      )
  
    const [
      purchaseNotes,
      setPurchaseNotes,
    ] = useState('')
  
  
    /* =======================================
       FORM REF
    ======================================= */
  
    const formRef =
      useRef<HTMLDivElement>(null)
  
  
    /* =======================================
       LOAD PURCHASE
    ======================================= */
  
    useEffect(() => {
      if (purchase) {
        setSupplier(
          purchase.supplier ?? '',
        )
  
        setPurchaseDate(
          purchase.date ?? '',
        )
  
        setPricePaid(
          String(
            purchase.pricePaid,
          ),
        )
  
        setQuantity(
          purchase.quantity !==
          undefined
            ? String(
                purchase.quantity,
              )
            : '',
        )
  
        setUnit(
          purchase.unit ??
            'each',
        )
  
        setPackageSize(
          purchase.packageSize !==
          undefined
            ? String(
                purchase.packageSize,
              )
            : '',
        )
  
        setPackageUnit(
          purchase.packageUnit ??
            'each',
        )
  
        setPurchaseNotes(
          purchase.notes ?? '',
        )
  
        return
      }
  
  
      setSupplier('')
  
      setPurchaseDate(
        new Date()
          .toISOString()
          .slice(0, 10),
      )
  
      setPricePaid('')
      setQuantity('')
      setUnit('each')
      setPackageSize('')
      setPackageUnit('each')
      setPurchaseNotes('')
    }, [
      purchase,
    ])
  
  
    /* =======================================
       PAGE LOCK
    ======================================= */
  
    useEffect(() => {
      const scrollY =
        window.scrollY
  
      requestAnimationFrame(() => {
        if (formRef.current) {
          formRef.current.scrollTop = 0
        }
      })
  
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
    }, [])
  
  
    /* =======================================
       SAVE PURCHASE
    ======================================= */
  
    function handleSave() {
      const parsedPrice =
        Number(pricePaid)
  
      if (
        !purchaseDate ||
        pricePaid.trim() === '' ||
        Number.isNaN(parsedPrice)
      ) {
        window.alert(
          'Please add a purchase date and the total price paid.',
        )
  
        return
      }
  
  
      const now =
        new Date().toISOString()
  
  
      const savedPurchase:
        PurchaseRecord = {
          id:
            purchase?.id ??
            crypto.randomUUID(),
  
          itemType,
  
          itemId,
  
          itemName,
  
          date:
            purchaseDate,
  
          supplier:
            supplier.trim() ||
            undefined,
  
          brand:
            brand?.trim() ||
            purchase?.brand ||
            undefined,
  
          pricePaid:
            parsedPrice,
  
          currency:
            purchase?.currency ??
            'AUD',
  
          quantity:
            quantity.trim()
              ? Number(quantity)
              : undefined,
  
          unit:
            quantity.trim()
              ? unit
              : undefined,
  
          packageSize:
            packageSize.trim()
              ? Number(
                  packageSize,
                )
              : undefined,
  
          packageUnit:
            packageSize.trim()
              ? packageUnit
              : undefined,
  
          reusable:
            purchase?.reusable,
  
          expectedUses:
            purchase?.expectedUses,
  
          notes:
            purchaseNotes.trim() ||
            undefined,
  
          photoUrls:
            purchase?.photoUrls,
  
          createdAt:
            purchase?.createdAt ??
            now,
  
          updatedAt:
            purchase
              ? now
              : undefined,
        }
  
  
      onSave(
        savedPurchase,
      )
    }
  
  
    /* =======================================
       RENDER
    ======================================= */
  
    return (
      <div
        className="form-backdrop"
        role="presentation"
      >
        <section
          className="add-plant-panel chronicle-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-editor-title"
        >
          <img
            className="chronicle-page-image"
            src={
              notebookEntryBackground
            }
            alt=""
            aria-hidden="true"
          />
  
          <div
            ref={
              formRef
            }
            className="chronicle-content"
          >
            <div className="form-heading">
              <div>
                <p className="section-label">
                  Purchase history
                </p>
  
                <h2 id="purchase-editor-title">
                  {purchase
                    ? 'Edit this purchase'
                    : 'Add another purchase'}
                </h2>
  
                <p className="form-whisper">
                  {itemName}
                </p>
              </div>
  
              <button
                type="button"
                className="close-button"
                onClick={
                  onClose
                }
                aria-label="Close purchase editor"
              >
                ×
              </button>
            </div>
  
  
            <div className="add-plant-form">
  
              <PurchaseDetailsSection
                supplier={
                  supplier
                }
                setSupplier={
                  setSupplier
                }
  
                purchaseDate={
                  purchaseDate
                }
                setPurchaseDate={
                  setPurchaseDate
                }
  
                pricePaid={
                  pricePaid
                }
                setPricePaid={
                  setPricePaid
                }
  
                quantity={
                  quantity
                }
                setQuantity={
                  setQuantity
                }
  
                unit={
                  unit
                }
                setUnit={
                  setUnit
                }
  
                packageSize={
                  packageSize
                }
                setPackageSize={
                  setPackageSize
                }
  
                packageUnit={
                  packageUnit
                }
                setPackageUnit={
                  setPackageUnit
                }
  
                purchaseNotes={
                  purchaseNotes
                }
                setPurchaseNotes={
                  setPurchaseNotes
                }
              />
  
  
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
                  type="button"
                  className="enter-button"
                  onClick={
                    handleSave
                  }
                >
                  {purchase
                    ? 'Save purchase'
                    : 'Add purchase'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }