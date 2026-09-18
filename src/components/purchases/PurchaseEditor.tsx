import {
  useEffect,
  useRef,
  useState,
} from 'react'

import FormTemplate from '../templates/FormTemplate'


import type {
  GardenPlan,
  PurchaseRecord,
  PurchaseUnit,
} from '../../types'

import PurchaseDetailsSection from './PurchaseDetailsSection'


type PurchaseEditorMode =
  | 'new'
  | 'edit'
  | 'repeat'


interface PurchaseEditorProps {
  purchase?: PurchaseRecord | null

  mode?: PurchaseEditorMode

  itemType: PurchaseRecord['itemType']
  itemId?: string
  itemName: string
  brand?: string

  /*
   * Optional source Garden Plan.
   *
   * PurchaseEditor does not alter the Plan.
   * App links the saved Purchase back to it.
   *
   * The Plan remains intention.
   * The Purchase becomes the real historical
   * transaction.
   */
  planToRecord?: GardenPlan

  onSave: (
    purchase: PurchaseRecord,
  ) => void

  onClose: () => void
}


export default function PurchaseEditor({
  purchase,
  mode = 'new',
  itemType,
  itemId,
  itemName,
  brand,
  planToRecord,
  onSave,
  onClose,
}: PurchaseEditorProps) {

  const isRecordingPlan =
    mode ===
      'new' &&
    Boolean(
      planToRecord,
    )


  /* =======================================
     PURCHASE STATE
  ======================================= */

  const [
    supplier,
    setSupplier,
  ] =
    useState('')

  const [
    purchaseDate,
    setPurchaseDate,
  ] =
    useState('')

  const [
    pricePaid,
    setPricePaid,
  ] =
    useState('')

  const [
    quantity,
    setQuantity,
  ] =
    useState('')

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
  ] =
    useState('')

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
  ] =
    useState('')


  /* =======================================
     FORM REF
  ======================================= */

  const formRef =
    useRef<HTMLDivElement>(
      null,
    )


  /* =======================================
     LOAD PURCHASE
  ======================================= */

  useEffect(() => {
    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        )


    /*
     * EDIT
     *
     * Existing Purchase records keep their
     * historical transaction date.
     *
     * Editing the record today must not
     * silently turn today's date into the
     * date of the original evidence.
     */

    if (
      mode ===
        'edit' &&
      purchase
    ) {
      setSupplier(
        purchase.supplier ??
        '',
      )

      setPurchaseDate(
        purchase.date ??
        '',
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
        purchase.notes ??
        '',
      )

      return
    }


    /*
     * REPEAT PURCHASE
     *
     * A repeated purchase is a new real
     * transaction.
     *
     * Useful reusable details may be carried
     * forward from the earlier Purchase, but
     * its historical date, notes and photos
     * are not copied as though they belong to
     * the new transaction.
     */

    if (
      mode ===
        'repeat' &&
      purchase
    ) {
      setSupplier(
        purchase.supplier ??
        '',
      )

      setPurchaseDate(
        today,
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
        '',
      )

      return
    }


    /*
     * NEW PURCHASE FROM A PLAN
     *
     * The Plan is evidence of intention,
     * not evidence that the purchase
     * happened exactly as planned.
     *
     * Its date and notes may be carried into
     * the editor as useful starting context.
     * The gardener can correct them before
     * this real Purchase record is saved.
     */

    if (
      planToRecord
    ) {
      setSupplier(
        '',
      )

      setPurchaseDate(
        planToRecord.date ??
        today,
      )

      setPricePaid(
        '',
      )

      setQuantity(
        '',
      )

      setUnit(
        'each',
      )

      setPackageSize(
        '',
      )

      setPackageUnit(
        'each',
      )

      setPurchaseNotes(
        planToRecord.notes ??
        '',
      )

      return
    }


    /*
     * ORDINARY NEW PURCHASE
     */

    setSupplier(
      '',
    )

    setPurchaseDate(
      today,
    )

    setPricePaid(
      '',
    )

    setQuantity(
      '',
    )

    setUnit(
      'each',
    )

    setPackageSize(
      '',
    )

    setPackageUnit(
      'each',
    )

    setPurchaseNotes(
      '',
    )
  }, [
    purchase,
    mode,
    planToRecord,
  ])


  /* =======================================
     PAGE LOCK
  ======================================= */

  useEffect(() => {
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
  }, [])


  /* =======================================
     SAVE PURCHASE
  ======================================= */

  function handleSave() {
    const parsedPrice =
      Number(
        pricePaid,
      )


    if (
      !purchaseDate ||
      pricePaid.trim() ===
        '' ||
      Number.isNaN(
        parsedPrice,
      )
    ) {
      window.alert(
        'Please add a purchase date and the total price paid.',
      )

      return
    }


    const now =
      new Date()
        .toISOString()


    const isEditing =
      mode ===
        'edit' &&
      Boolean(
        purchase,
      )


    /*
     * PURCHASE EVIDENCE
     *
     * `date` is the historical date of the
     * real transaction.
     *
     * `createdAt` records when Sprig first
     * stored this Purchase.
     *
     * `updatedAt` records a later edit
     * without rewriting the original
     * transaction date or creation time.
     *
     * Existing photographs and their rich
     * metadata remain owned by this Purchase
     * when it is edited.
     *
     * Repeat purchases deliberately do not
     * inherit the earlier Purchase's photos
     * or metadata because those photographs
     * are evidence belonging to the earlier
     * transaction.
     */

    const savedPurchase:
      PurchaseRecord = {
        id:
          isEditing
            ? purchase!.id
            : crypto.randomUUID(),

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
            ? Number(
                quantity,
              )
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
          isEditing
            ? purchase?.photoUrls
            : undefined,

        photoMetadata:
          isEditing
            ? purchase?.photoMetadata
            : undefined,

        createdAt:
          isEditing
            ? purchase?.createdAt ??
              now
            : now,

        updatedAt:
          isEditing
            ? now
            : undefined,
      }


    onSave(
      savedPurchase,
    )
  }


  /* =======================================
     HEADING
  ======================================= */

  function getHeading(): string {
    if (
      mode ===
      'edit'
    ) {
      return 'Edit this purchase'
    }


    if (
      mode ===
      'repeat'
    ) {
      return 'Bought this again'
    }


    if (
      isRecordingPlan
    ) {
      return 'Record what happened'
    }


    return 'Add a purchase'
  }


  /* =======================================
     SAVE BUTTON LABEL
  ======================================= */

  function getSaveButtonLabel(): string {
    if (
      mode ===
      'edit'
    ) {
      return 'Save purchase'
    }


    if (
      mode ===
      'repeat'
    ) {
      return 'Add this purchase'
    }


    if (
      isRecordingPlan
    ) {
      return 'Record this purchase'
    }


    return 'Add purchase'
  }


  return (
    <div
      className="form-backdrop"
      role="presentation"
    >
      <FormTemplate ariaLabelledBy="purchase-editor-title" contentRef={formRef}>
          <div className="form-heading">
            <div>
              <p className="section-label">
                {isRecordingPlan
                  ? 'From Garden Plan'
                  : 'Purchase history'}
              </p>


              <h2 id="purchase-editor-title">
                {getHeading()}
              </h2>


              <p className="form-whisper">
                {itemName}
              </p>


              {isRecordingPlan &&
                planToRecord && (
                <>
                  <p className="form-whisper">
                    Sprig has carried the planned
                    date and notes across. Add what
                    you actually bought and what you
                    actually paid.
                  </p>

                  <p className="form-whisper">
                    The Garden Plan remains the
                    intention. This Purchase Record
                    becomes the real transaction.
                  </p>
                </>
              )}
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


            {isRecordingPlan && (
              <p className="form-whisper">
                Saving this Purchase will let Sprig
                link the real transaction back to
                the original Plan.
              </p>
            )}


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
                {getSaveButtonLabel()}
              </button>
            </div>

          </div>
      </FormTemplate>
    </div>
  )
}
