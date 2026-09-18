import type {
    GardenData,
    KnowledgeRelationshipTargetType,
    SprigPhotoMetadata,
    SprigPhotoPurpose,
  } from '../types'
  
  
  /* =======================================
     PHOTO EVIDENCE
  
     Records own photographs. This module
     gives Gallery, Search, Comparison and
     future Sprig Intelligence one shared
     interpretation of those photographs.
  ======================================= */
  
  export interface SprigPhotoEvidence {
    key: string
    photoId?: string
    photoUrl: string
    photoDate?: string
    photoTime?: string
    addedAt?: string
    title?: string
    notes?: string
    tags: string[]
    purpose?: SprigPhotoPurpose
    originalFileName?: string
    sourceType: KnowledgeRelationshipTargetType
    sourceId: string
    sourceIndex: number
  }
  
  export interface BuildSprigPhotoEvidenceInput {
    photoUrls?: string[]
    photoDates?: Array<string | undefined>
    photoMetadata?: Array<SprigPhotoMetadata | undefined>
    fallbackDate?: string
    fallbackAddedAt?: string
    fallbackTitle?: string
    fallbackNotes?: string
    fallbackTags?: string[]
    defaultPurpose?: SprigPhotoPurpose
    sourceType: KnowledgeRelationshipTargetType
    sourceId: string
  }
  
  
  /* =======================================
     STABLE ID
  ======================================= */
  
  export function createSprigPhotoId(): string {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return `photo-${crypto.randomUUID()}`
    }
  
    return `photo-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`
  }
  
  
  /* =======================================
     METADATA LOOKUP
  ======================================= */
  
  export function getSprigPhotoMetadata(
    photoUrl: string,
    index: number,
    metadata: Array<SprigPhotoMetadata | undefined> | undefined,
  ): SprigPhotoMetadata | undefined {
    return (
      metadata?.find(
        item => item?.photoUrl === photoUrl,
      ) ??
      metadata?.[index]
    )
  }
  
  
  /* =======================================
     PURPOSE LABEL
  ======================================= */
  
  export function getSprigPhotoPurposeLabel(
    purpose: SprigPhotoPurpose | undefined,
  ): string | undefined {
    if (!purpose) {
      return undefined
    }
  
    switch (purpose) {
      case 'observation':
        return 'Observation'
      case 'progress':
        return 'Progress'
      case 'problem':
        return 'Problem'
      case 'harvest':
        return 'Harvest'
      case 'setup':
        return 'Setup'
      case 'reference':
        return 'Reference'
      case 'other':
      default:
        return 'Other'
    }
  }
  
  
  /* =======================================
     BUILD EVIDENCE
  ======================================= */
  
  export function buildSprigPhotoEvidence({
    photoUrls,
    photoDates,
    photoMetadata,
    fallbackDate,
    fallbackAddedAt,
    fallbackTitle,
    fallbackNotes,
    fallbackTags = [],
    defaultPurpose,
    sourceType,
    sourceId,
  }: BuildSprigPhotoEvidenceInput): SprigPhotoEvidence[] {
    return (photoUrls ?? []).map(
      (photoUrl, index) => {
        const metadata =
          getSprigPhotoMetadata(
            photoUrl,
            index,
            photoMetadata,
          )
  
        const photoId = metadata?.photoId
  
        return {
          key:
            photoId ??
            `${sourceType}:${sourceId}:${index}`,
          photoId,
          photoUrl,
          photoDate:
            metadata?.photoDate ??
            photoDates?.[index] ??
            fallbackDate,
          photoTime: metadata?.photoTime,
          addedAt:
            metadata?.addedAt ??
            fallbackAddedAt,
          title:
            metadata?.title?.trim() ||
            fallbackTitle,
          notes:
            metadata?.notes?.trim() ||
            fallbackNotes,
          tags:
            metadata?.tags ??
            fallbackTags,
          purpose:
            metadata?.purpose ??
            defaultPurpose,
          originalFileName:
            metadata?.originalFileName,
          sourceType,
          sourceId,
          sourceIndex: index,
        }
      },
    )
  }
  
  
  /* =======================================
     SEARCH TERMS
  ======================================= */
  
  export function getSprigPhotoEvidenceSearchTerms(
    evidence: SprigPhotoEvidence[],
  ): string[] {
    return evidence.flatMap(
      photo => [
        photo.title,
        photo.notes,
        photo.photoDate,
        photo.photoTime,
        photo.addedAt,
        photo.originalFileName,
        getSprigPhotoPurposeLabel(photo.purpose),
        ...photo.tags,
      ].filter(
        (value): value is string => Boolean(value),
      ),
    )
  }
  
  
  /* =======================================
     SOURCE EVIDENCE
  ======================================= */
  
  export function getSprigPhotoEvidenceForSource(
    gardenData: GardenData,
    sourceType: string,
    sourceId: string,
  ): SprigPhotoEvidence[] {
    let input: BuildSprigPhotoEvidenceInput | undefined
  
    if (sourceType === 'plant-story') {
      const record = gardenData.plantStories.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoDates: record.photoDates,
        photoMetadata: record.photoMetadata,
        fallbackAddedAt: record.updatedAt ?? record.enteredDate,
        fallbackTitle: record.displayName || record.variety || record.plantName,
        fallbackNotes: record.notes,
        fallbackTags: record.tags,
        sourceType: 'plant-story',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'garden-event') {
      const record = gardenData.events.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.date,
        fallbackTitle: record.title,
        fallbackNotes: record.notes,
        sourceType: 'garden-event',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'harvest') {
      const record = gardenData.harvests.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.date,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackNotes: record.notes,
        defaultPurpose: 'harvest',
        sourceType: 'harvest',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'growing-place') {
      const record = gardenData.growingPlaces.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.name,
        fallbackNotes: record.notes,
        sourceType: 'growing-place',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'growing-setup') {
      const record = gardenData.growingSetups.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.name,
        fallbackNotes: record.notes,
        defaultPurpose: 'setup',
        sourceType: 'growing-setup',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'ingredient') {
      const record = gardenData.ingredients.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.name,
        fallbackNotes: record.notes,
        sourceType: 'ingredient',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'product') {
      const record = gardenData.products.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.name,
        fallbackNotes: record.notes,
        sourceType: 'product',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'purchase') {
      const record = gardenData.purchases.find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.date,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.itemName,
        fallbackNotes: record.notes,
        sourceType: 'purchase',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'garden-note') {
      const record = (gardenData.gardenNotes ?? []).find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.noteDate,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.title,
        fallbackNotes: record.body,
        sourceType: 'garden-note',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'plant-reference') {
      const record = (gardenData.plantReferences ?? []).find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.referenceDate,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.title || record.variety || record.plantName,
        fallbackNotes: record.notes ?? record.knowledge,
        defaultPurpose: 'reference',
        sourceType: 'plant-reference',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'saved-source') {
      const record = (gardenData.savedKnowledgeSources ?? []).find(item => item.id === sourceId)
      if (record) input = {
        photoUrls: record.photoUrls,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.savedDate,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.title,
        fallbackNotes: record.notes,
        defaultPurpose: 'reference',
        sourceType: 'saved-source',
        sourceId: record.id,
      }
    }
  
    if (sourceType === 'garden-trial') {
      const record = (gardenData.gardenTrials ?? []).find(item => item.id === sourceId)
      if (!record) return []
  
      const trialPhotos = buildSprigPhotoEvidence({
        photoUrls: record.photoUrls,
        photoDates: record.photoDates,
        photoMetadata: record.photoMetadata,
        fallbackDate: record.startDate,
        fallbackAddedAt: record.updatedAt ?? record.createdAt,
        fallbackTitle: record.title,
        fallbackNotes: record.conclusion ?? record.purpose,
        sourceType: 'garden-trial',
        sourceId: record.id,
      })
  
      const observationPhotos = (record.observations ?? []).flatMap(
        observation => buildSprigPhotoEvidence({
          photoUrls: observation.photoUrls,
          photoDates: observation.photoDates,
          photoMetadata: observation.photoMetadata,
          fallbackDate: observation.date,
          fallbackAddedAt: observation.updatedAt ?? observation.createdAt,
          fallbackTitle: record.title,
          fallbackNotes: observation.body,
          sourceType: 'garden-trial',
          sourceId: record.id,
        }).map(photo => ({
          ...photo,
          key:
            photo.photoId ??
            `garden-trial:${record.id}:observation:${observation.id}:${photo.sourceIndex}`,
        })),
      )
  
      return [
        ...trialPhotos,
        ...observationPhotos,
      ]
    }
  
    return input
      ? buildSprigPhotoEvidence(input)
      : []
  }
  