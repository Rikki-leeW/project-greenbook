import {
  useMemo,
  useState,
} from 'react'

import MainPageTemplate from '../components/templates/MainPageTemplate'
import SprigPhotoPicker from '../components/photos/SprigPhotoPicker'

import {
  buildSprigPhotoEvidence,
  getSprigPhotoPurposeLabel,
} from '../utils/photoEvidence'

import type {
  AppPage,
} from '../types/navigation'

import type {
  GalleryPhoto,
  GardenData,
  KnowledgeRelationship,
  KnowledgeRelationshipTargetType,
  SprigPhotoMetadata,
  SprigPhotoPurpose,
} from '../types'

import '../css/garden-gallery.css'
import { useModalDialog } from '../hooks/useModalDialog'


type GalleryCategory =
  | 'all'
  | 'gallery'
  | 'plants'
  | 'journal'
  | 'harvests'
  | 'places'
  | 'recipes'
  | 'ingredients'
  | 'products'
  | 'purchases'
  | 'knowledge'
  | 'trials'


type GallerySort =
  | 'newest-photo'
  | 'oldest-photo'
  | 'recently-added'
  | 'category'


interface GalleryItem {
  key: string
  photoUrl: string
  photoDate?: string
  photoTime?: string
  addedAt?: string
  title: string
  subtitle?: string
  notes?: string
  tags: string[]
  purpose?: SprigPhotoPurpose
  category: GalleryCategory
  categoryLabel: string
  sourceType?: KnowledgeRelationshipTargetType
  sourceId?: string
  galleryPhotoId?: string
  searchableText: string
}


interface RelationshipOption {
  key: string
  targetType: KnowledgeRelationshipTargetType
  targetId: string
  label: string
  group: string
  searchText: string
}


interface GardenGalleryProps {
  gardenData: GardenData

  onGardenDataChange: (
    gardenData: GardenData,
  ) => void

  onBack: () => void

  onNavigate: (
    page: AppPage,
  ) => void

  onOpenRelationship: (
    targetType:
      KnowledgeRelationshipTargetType,

    targetId:
      string,
  ) => void
}


const CATEGORY_OPTIONS:
  Array<{
    value: GalleryCategory
    label: string
  }> = [
    {
      value: 'all',
      label: 'All photographs',
    },
    {
      value: 'gallery',
      label: 'Gallery Photos',
    },
    {
      value: 'plants',
      label: 'Plants',
    },
    {
      value: 'journal',
      label: 'Journal',
    },
    {
      value: 'harvests',
      label: 'Harvests',
    },
    {
      value: 'places',
      label: 'Growing Places',
    },
    {
      value: 'recipes',
      label: 'Growing Recipes',
    },
    {
      value: 'ingredients',
      label: 'Ingredients',
    },
    {
      value: 'products',
      label: 'Products',
    },
    {
      value: 'purchases',
      label: 'Purchases',
    },
    {
      value: 'knowledge',
      label: 'Garden Knowledge',
    },
    {
      value: 'trials',
      label: 'Garden Trials',
    },
  ]


const SORT_OPTIONS:
  Array<{
    value: GallerySort
    label: string
  }> = [
    {
      value: 'newest-photo',
      label: 'Newest photo date first',
    },
    {
      value: 'oldest-photo',
      label: 'Oldest photo date first',
    },
    {
      value: 'recently-added',
      label: 'Recently added to Sprig',
    },
    {
      value: 'category',
      label: 'Category',
    },
  ]


/* =======================================
   DATE
======================================= */

function getToday():
  string {
  return new Date()
    .toISOString()
    .slice(
      0,
      10,
    )
}


function getNow():
  string {
  return new Date()
    .toISOString()
}


function formatDate(
  date?: string,
):
  string {
  if (
    !date
  ) {
    return 'Date not recorded'
  }

  const safeDate =
    date.slice(
      0,
      10,
    )

  const parsed =
    new Date(
      `${safeDate}T00:00:00`,
    )

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date
  }

  return parsed.toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )
}


/* =======================================
   TEXT
======================================= */

function normalise(
  value: string,
):
  string {
  return value
    .trim()
    .toLocaleLowerCase(
      'en-AU',
    )
}


function makeSearchText(
  values:
    Array<
      string |
      undefined
    >,
):
  string {
  return normalise(
    values
      .filter(
        Boolean,
      )
      .join(
        ' ',
      ),
  )
}


/* =======================================
   TAGS
======================================= */

function parseTags(
  value: string,
):
  string[] {
  const seen =
    new Set<string>()

  return value
    .split(
      /[\s,]+/,
    )
    .map(
      tag =>
        tag
          .trim()
          .replace(
            /^#+/,
            '',
          ),
    )
    .filter(
      Boolean,
    )
    .filter(
      tag => {
        const key =
          normalise(
            tag,
          )

        if (
          seen.has(
            key,
          )
        ) {
          return false
        }

        seen.add(
          key,
        )

        return true
      },
    )
}


/* =======================================
   RELATIONSHIP OPTIONS
======================================= */

function buildRelationshipOptions(
  gardenData: GardenData,
):
  RelationshipOption[] {
  const options:
    RelationshipOption[] = []


  gardenData.plantStories.forEach(
    plant => {
      const label =
        plant.displayName ||
        plant.variety ||
        plant.plantName

      options.push({
        key:
          `plant-story:${plant.id}`,

        targetType:
          'plant-story',

        targetId:
          plant.id,

        label,

        group:
          'Plant Stories',

        searchText:
          makeSearchText([
            label,
            plant.plantName,
            plant.variety,
            plant.notes,
          ]),
      })
    },
  )


  gardenData.events.forEach(
    event => {
      options.push({
        key:
          `garden-event:${event.id}`,

        targetType:
          'garden-event',

        targetId:
          event.id,

        label:
          `${event.title} · ${formatDate(
            event.date,
          )}`,

        group:
          'Journal',

        searchText:
          makeSearchText([
            event.title,
            event.notes,
            event.date,
          ]),
      })
    },
  )


  gardenData.harvests.forEach(
    harvest => {
      const plantNames =
        harvest.plantStoryIds
          .map(
            plantId =>
              gardenData
                .plantStories
                .find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
          )
          .filter(
            Boolean,
          )
          .map(
            plant =>
              plant?.displayName ||
              plant?.variety ||
              plant?.plantName ||
              '',
          )
          .filter(
            Boolean,
          )

      options.push({
        key:
          `harvest:${harvest.id}`,

        targetType:
          'harvest',

        targetId:
          harvest.id,

        label:
          `${plantNames.join(
            ', ',
          ) || 'Harvest'} · ${formatDate(
            harvest.date,
          )}`,

        group:
          'Harvests',

        searchText:
          makeSearchText([
            ...plantNames,
            harvest.notes,
            harvest.date,
          ]),
      })
    },
  )


  gardenData.growingPlaces.forEach(
    place => {
      options.push({
        key:
          `growing-place:${place.id}`,

        targetType:
          'growing-place',

        targetId:
          place.id,

        label:
          place.name,

        group:
          'Growing Places',

        searchText:
          makeSearchText([
            place.name,
            place.notes,
            place.kind,
          ]),
      })
    },
  )


  gardenData.growingSetups.forEach(
    setup => {
      options.push({
        key:
          `growing-setup:${setup.id}`,

        targetType:
          'growing-setup',

        targetId:
          setup.id,

        label:
          setup.name,

        group:
          'Growing Recipes',

        searchText:
          makeSearchText([
            setup.name,
            setup.notes,
            setup.brand,
            setup.productName,
          ]),
      })
    },
  )


  gardenData.ingredients.forEach(
    ingredient => {
      options.push({
        key:
          `ingredient:${ingredient.id}`,

        targetType:
          'ingredient',

        targetId:
          ingredient.id,

        label:
          ingredient.name,

        group:
          'Ingredients',

        searchText:
          makeSearchText([
            ingredient.name,
            ingredient.notes,
            ingredient.source,
          ]),
      })
    },
  )


  gardenData.products.forEach(
    product => {
      options.push({
        key:
          `product:${product.id}`,

        targetType:
          'product',

        targetId:
          product.id,

        label:
          product.name,

        group:
          'Products',

        searchText:
          makeSearchText([
            product.name,
            product.brand,
            product.productName,
            product.notes,
          ]),
      })
    },
  )


  gardenData.purchases.forEach(
    purchase => {
      options.push({
        key:
          `purchase:${purchase.id}`,

        targetType:
          'purchase',

        targetId:
          purchase.id,

        label:
          `${purchase.itemName} · ${formatDate(
            purchase.date,
          )}`,

        group:
          'Purchases',

        searchText:
          makeSearchText([
            purchase.itemName,
            purchase.supplier,
            purchase.brand,
            purchase.notes,
          ]),
      })
    },
  )


  ;(
    gardenData.gardenNotes ??
    []
  ).forEach(
    note => {
      const label =
        note.title?.trim() ||
        note.body
          .split(
            /\r?\n/,
          )
          .find(
            Boolean,
          ) ||
        'Garden Note'

      options.push({
        key:
          `garden-note:${note.id}`,

        targetType:
          'garden-note',

        targetId:
          note.id,

        label,

        group:
          'Garden Notes',

        searchText:
          makeSearchText([
            label,
            note.body,
            note.sourceLabel,
          ]),
      })
    },
  )


  ;(
    gardenData.plantReferences ??
    []
  ).forEach(
    reference => {
      const label =
        reference.title?.trim() ||
        [
          reference.plantName,
          reference.variety,
        ]
          .filter(
            Boolean,
          )
          .join(
            ' · ',
          ) ||
        'Garden Reference'

      options.push({
        key:
          `plant-reference:${reference.id}`,

        targetType:
          'plant-reference',

        targetId:
          reference.id,

        label,

        group:
          'Garden Reference',

        searchText:
          makeSearchText([
            label,
            reference.plantName,
            reference.variety,
            reference.knowledge,
            reference.notes,
            ...(
              reference.aliases ??
              []
            ),
          ]),
      })
    },
  )


  ;(
    gardenData.savedKnowledgeSources ??
    []
  ).forEach(
    source => {
      options.push({
        key:
          `saved-source:${source.id}`,

        targetType:
          'saved-source',

        targetId:
          source.id,

        label:
          source.title,

        group:
          'Tips & Sources',

        searchText:
          makeSearchText([
            source.title,
            source.sourceName,
            source.excerpt,
            source.notes,
          ]),
      })
    },
  )


  ;(
    gardenData.gardenTrials ??
    []
  ).forEach(
    trial => {
      options.push({
        key:
          `garden-trial:${trial.id}`,

        targetType:
          'garden-trial',

        targetId:
          trial.id,

        label:
          trial.title,

        group:
          'Garden Trials',

        searchText:
          makeSearchText([
            trial.title,
            trial.purpose,
            trial.question,
            trial.conclusion,
          ]),
      })
    },
  )


  return options.sort(
    (
      first,
      second,
    ) => {
      const groupDifference =
        first.group.localeCompare(
          second.group,
        )

      if (
        groupDifference !==
        0
      ) {
        return groupDifference
      }

      return first.label.localeCompare(
        second.label,
      )
    },
  )
}


/* =======================================
   RELATIONSHIP LABEL
======================================= */

function getRelationshipLabel(
  gardenData: GardenData,
  relationship:
    KnowledgeRelationship,
):
  string {
  return (
    relationship.label ||
    buildRelationshipOptions(
      gardenData,
    ).find(
      option =>
        option.targetType ===
          relationship.targetType &&
        option.targetId ===
          relationship.targetId,
    )?.label ||
    'Sprig record'
  )
}


/* =======================================
   BUILD GALLERY
======================================= */

function buildGalleryItems(
  gardenData: GardenData,
):
  GalleryItem[] {
  const items:
    GalleryItem[] = []


  function pushPhotos({
    photoUrls,
    photoDates,
    photoMetadata,
    fallbackDate,
    addedAt,
    title,
    subtitle,
    notes,
    tags = [],
    category,
    categoryLabel,
    sourceType,
    sourceId,
    defaultPurpose,
  }: {
    photoUrls?: string[]
    photoDates?:
      Array<
        string |
        undefined
      >
    photoMetadata?:
      Array<
        SprigPhotoMetadata |
        undefined
      >
    fallbackDate?: string
    addedAt?: string
    title: string
    subtitle?: string
    notes?: string
    tags?: string[]
    category: GalleryCategory
    categoryLabel: string
    sourceType:
      KnowledgeRelationshipTargetType
    sourceId: string
    defaultPurpose?:
      SprigPhotoPurpose
  }) {
    const evidence =
      buildSprigPhotoEvidence({
        photoUrls,
        photoDates,
        photoMetadata,
        fallbackDate,
        fallbackAddedAt:
          addedAt,
        fallbackTitle:
          title,
        fallbackNotes:
          notes,
        fallbackTags:
          tags,
        defaultPurpose,
        sourceType,
        sourceId,
      })


    evidence.forEach(
      photo => {
        const purposeLabel =
          getSprigPhotoPurposeLabel(
            photo.purpose,
          )

        items.push({
          key:
            photo.key,

          photoUrl:
            photo.photoUrl,

          photoDate:
            photo.photoDate,

          photoTime:
            photo.photoTime,

          addedAt:
            photo.addedAt,

          title:
            photo.title ||
            title,

          subtitle,

          notes:
            photo.notes,

          tags:
            photo.tags,

          purpose:
            photo.purpose,

          category,

          categoryLabel,

          sourceType,

          sourceId,

          searchableText:
            makeSearchText([
              photo.title,
              subtitle,
              photo.notes,
              categoryLabel,
              photo.photoDate,
              photo.photoTime,
              photo.originalFileName,
              purposeLabel,
              ...photo.tags,
            ]),
        })
      },
    )

  }


  gardenData.plantStories.forEach(
    plant => {
      const title =
        plant.displayName ||
        plant.variety ||
        plant.plantName

      pushPhotos({
        photoUrls:
          plant.photoUrls,

        photoDates:
          plant.photoDates,

        photoMetadata:
          plant.photoMetadata,

        addedAt:
          plant.updatedAt ??
          plant.enteredDate,

        title,

        subtitle:
          [
            plant.plantName,
            plant.variety,
          ]
            .filter(
              Boolean,
            )
            .join(
              ' · ',
            ),

        notes:
          plant.notes,

        tags:
          plant.tags,

        category:
          'plants',

        categoryLabel:
          'Plants',

        sourceType:
          'plant-story',

        sourceId:
          plant.id,
      })
    },
  )


  gardenData.events.forEach(
    event => {
      pushPhotos({
        photoUrls:
          event.photoUrls,

        photoMetadata:
          event.photoMetadata,

        fallbackDate:
          event.date,

        addedAt:
          event.date,

        title:
          event.title,

        subtitle:
          'Garden Journal',

        notes:
          event.notes,

        category:
          'journal',

        categoryLabel:
          'Journal',

        sourceType:
          'garden-event',

        sourceId:
          event.id,

        defaultPurpose:
          event.type ===
            'observation'
            ? 'observation'
            : undefined,
      })
    },
  )


  gardenData.harvests.forEach(
    harvest => {
      const plantNames =
        harvest.plantStoryIds
          .map(
            plantId =>
              gardenData
                .plantStories
                .find(
                  plant =>
                    plant.id ===
                    plantId,
                ),
          )
          .filter(
            Boolean,
          )
          .map(
            plant =>
              plant?.displayName ||
              plant?.variety ||
              plant?.plantName ||
              '',
          )
          .filter(
            Boolean,
          )

      pushPhotos({
        photoUrls:
          harvest.photoUrls,

        photoMetadata:
          harvest.photoMetadata,

        fallbackDate:
          harvest.date,

        addedAt:
          harvest.updatedAt ??
          harvest.createdAt,

        title:
          plantNames.join(
            ', ',
          ) ||
          'Harvest',

        subtitle:
          'Harvest',

        notes:
          harvest.notes,

        category:
          'harvests',

        categoryLabel:
          'Harvests',

        sourceType:
          'harvest',

        sourceId:
          harvest.id,

        defaultPurpose:
          'harvest',
      })
    },
  )


  gardenData.growingPlaces.forEach(
    place => {
      pushPhotos({
        photoUrls:
          place.photoUrls,

        addedAt:
          place.updatedAt ??
          place.createdAt,

        title:
          place.name,

        subtitle:
          'Growing Place',

        notes:
          place.notes,

        category:
          'places',

        categoryLabel:
          'Growing Places',

        sourceType:
          'growing-place',

        sourceId:
          place.id,
      })
    },
  )


  gardenData.growingSetups.forEach(
    setup => {
      pushPhotos({
        photoUrls:
          setup.photoUrls,

        addedAt:
          setup.updatedAt ??
          setup.createdAt,

        title:
          setup.name,

        subtitle:
          'Growing Recipe',

        notes:
          setup.notes,

        category:
          'recipes',

        categoryLabel:
          'Growing Recipes',

        sourceType:
          'growing-setup',

        sourceId:
          setup.id,

        defaultPurpose:
          'setup',
      })
    },
  )


  gardenData.ingredients.forEach(
    ingredient => {
      pushPhotos({
        photoUrls:
          ingredient.photoUrls,

        addedAt:
          ingredient.updatedAt ??
          ingredient.createdAt,

        title:
          ingredient.name,

        subtitle:
          'Ingredient',

        notes:
          ingredient.notes,

        category:
          'ingredients',

        categoryLabel:
          'Ingredients',

        sourceType:
          'ingredient',

        sourceId:
          ingredient.id,
      })
    },
  )


  gardenData.products.forEach(
    product => {
      pushPhotos({
        photoUrls:
          product.photoUrls,

        addedAt:
          product.updatedAt ??
          product.createdAt,

        title:
          product.name,

        subtitle:
          product.brand ||
          'Product',

        notes:
          product.notes,

        category:
          'products',

        categoryLabel:
          'Products',

        sourceType:
          'product',

        sourceId:
          product.id,

        defaultPurpose:
          'reference',
      })
    },
  )


  gardenData.purchases.forEach(
    purchase => {
      pushPhotos({
        photoUrls:
          purchase.photoUrls,

        fallbackDate:
          purchase.date,

        addedAt:
          purchase.updatedAt ??
          purchase.createdAt,

        title:
          purchase.itemName,

        subtitle:
          'Purchase',

        notes:
          purchase.notes,

        category:
          'purchases',

        categoryLabel:
          'Purchases',

        sourceType:
          'purchase',

        sourceId:
          purchase.id,
      })
    },
  )


  ;(
    gardenData.gardenNotes ??
    []
  ).forEach(
    note => {
      const title =
        note.title?.trim() ||
        note.body
          .split(
            /\r?\n/,
          )
          .find(
            Boolean,
          ) ||
        'Garden Note'

      pushPhotos({
        photoUrls:
          note.photoUrls,

        fallbackDate:
          note.noteDate,

        addedAt:
          note.updatedAt ??
          note.createdAt,

        title,

        subtitle:
          'Garden Note',

        notes:
          note.body,

        category:
          'knowledge',

        categoryLabel:
          'Garden Knowledge',

        sourceType:
          'garden-note',

        sourceId:
          note.id,

        defaultPurpose:
          'reference',
      })
    },
  )


  ;(
    gardenData.plantReferences ??
    []
  ).forEach(
    reference => {
      const title =
        reference.title?.trim() ||
        [
          reference.plantName,
          reference.variety,
        ]
          .filter(
            Boolean,
          )
          .join(
            ' · ',
          ) ||
        'Garden Reference'

      pushPhotos({
        photoUrls:
          reference.photoUrls,

        fallbackDate:
          reference.referenceDate,

        addedAt:
          reference.updatedAt ??
          reference.createdAt,

        title,

        subtitle:
          'Garden Reference',

        notes:
          reference.knowledge ??
          reference.notes,

        tags:
          reference.aliases,

        category:
          'knowledge',

        categoryLabel:
          'Garden Knowledge',

        sourceType:
          'plant-reference',

        sourceId:
          reference.id,

        defaultPurpose:
          'reference',
      })
    },
  )


  ;(
    gardenData.savedKnowledgeSources ??
    []
  ).forEach(
    source => {
      pushPhotos({
        photoUrls:
          source.photoUrls,

        fallbackDate:
          source.savedDate,

        addedAt:
          source.updatedAt ??
          source.createdAt,

        title:
          source.title,

        subtitle:
          'Saved Tip / Source',

        notes:
          [
            source.excerpt,
            source.notes,
          ]
            .filter(
              Boolean,
            )
            .join(
              ' ',
            ),

        category:
          'knowledge',

        categoryLabel:
          'Garden Knowledge',

        sourceType:
          'saved-source',

        sourceId:
          source.id,

        defaultPurpose:
          'reference',
      })
    },
  )


  ;(
    gardenData.gardenTrials ??
    []
  ).forEach(
    trial => {
      pushPhotos({
        photoUrls:
          trial.photoUrls,

        photoDates:
          trial.photoDates,

        fallbackDate:
          trial.startDate,

        addedAt:
          trial.updatedAt ??
          trial.createdAt,

        title:
          trial.title,

        subtitle:
          'Garden Trial',

        notes:
          [
            trial.question,
            trial.conclusion,
          ]
            .filter(
              Boolean,
            )
            .join(
              ' ',
            ),

        category:
          'trials',

        categoryLabel:
          'Garden Trials',

        sourceType:
          'garden-trial',

        sourceId:
          trial.id,

        defaultPurpose:
          'observation',
      })


      ;(
        trial.observations ??
        []
      ).forEach(
        observation => {
          pushPhotos({
            photoUrls:
              observation.photoUrls,

            photoDates:
              observation.photoDates,

            fallbackDate:
              observation.date,

            addedAt:
              observation.updatedAt ??
              observation.createdAt,

            title:
              trial.title,

            subtitle:
              `Trial observation · ${formatDate(
                observation.date,
              )}`,

            notes:
              observation.body,

            category:
              'trials',

            categoryLabel:
              'Garden Trials',

            sourceType:
              'garden-trial',

            sourceId:
              trial.id,

            defaultPurpose:
              'observation',
          })
        },
      )
    },
  )


  ;(
    gardenData.galleryPhotos ??
    []
  ).forEach(
    photo => {
      const relationshipLabels =
        (
          photo.relationships ??
          []
        ).map(
          relationship =>
            getRelationshipLabel(
              gardenData,
              relationship,
            ),
        )

      items.push({
        key:
          `gallery:${photo.id}`,

        photoUrl:
          photo.photoUrl,

        photoDate:
          photo.photoDate,

        addedAt:
          photo.updatedAt ??
          photo.createdAt,

        title:
          photo.title?.trim() ||
          'Garden photograph',

        subtitle:
          relationshipLabels.length >
          0
            ? relationshipLabels.join(
                ' · ',
              )
            : 'Gallery Photo',

        notes:
          photo.notes,

        tags:
          photo.tags ??
          [],

        category:
          'gallery',

        categoryLabel:
          'Gallery Photos',

        galleryPhotoId:
          photo.id,

        searchableText:
          makeSearchText([
            photo.title,
            photo.notes,
            photo.photoDate,
            'Gallery Photo',
            ...relationshipLabels,
            ...(
              photo.tags ??
              []
            ),
          ]),
      })
    },
  )


  return items
}


/* =======================================
   GARDEN GALLERY
======================================= */

export default function GardenGallery({
  gardenData,
  onGardenDataChange,
  onBack,
  onNavigate,
  onOpenRelationship,
}: GardenGalleryProps) {
  const [
    category,
    setCategory,
  ] =
    useState<GalleryCategory>(
      'all',
    )

  const [
    sort,
    setSort,
  ] =
    useState<GallerySort>(
      'newest-photo',
    )

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    )

  const [
    fromDate,
    setFromDate,
  ] =
    useState(
      '',
    )

  const [
    toDate,
    setToDate,
  ] =
    useState(
      '',
    )

  const [
    viewerKey,
    setViewerKey,
  ] =
    useState<
      string |
      null
    >(
      null,
    )

  const [
    compareKeys,
    setCompareKeys,
  ] =
    useState<
      string[]
    >(
      [],
    )

  const [
    isAdding,
    setIsAdding,
  ] =
    useState(
      false,
    )

  const [
    editingGalleryPhotoId,
    setEditingGalleryPhotoId,
  ] =
    useState<
      string |
      null
    >(
      null,
    )

  const [
    draftPhotoUrls,
    setDraftPhotoUrls,
  ] =
    useState<
      string[]
    >(
      [],
    )

  const [
    draftPhotoDates,
    setDraftPhotoDates,
  ] =
    useState<
      Array<
        string |
        undefined
      >
    >(
      [],
    )

  const [
    draftTitle,
    setDraftTitle,
  ] =
    useState(
      '',
    )

  const [
    draftNotes,
    setDraftNotes,
  ] =
    useState(
      '',
    )

  const [
    draftTags,
    setDraftTags,
  ] =
    useState(
      '',
    )

  const [
    relationshipSearch,
    setRelationshipSearch,
  ] =
    useState(
      '',
    )

  const [
    draftRelationships,
    setDraftRelationships,
  ] =
    useState<
      KnowledgeRelationship[]
    >(
      [],
    )

  const [
    relationshipKey,
    setRelationshipKey,
  ] =
    useState(
      '',
    )


  const allItems =
    useMemo(
      () =>
        buildGalleryItems(
          gardenData,
        ),
      [
        gardenData,
      ],
    )


  const relationshipOptions =
    useMemo(
      () =>
        buildRelationshipOptions(
          gardenData,
        ),
      [
        gardenData,
      ],
    )


  const filteredRelationshipOptions =
    useMemo(
      () => {
        const query =
          normalise(
            relationshipSearch,
          )

        const linked =
          new Set(
            draftRelationships.map(
              relationship =>
                `${relationship.targetType}:${relationship.targetId}`,
            ),
          )

        return relationshipOptions
          .filter(
            option =>
              !query ||
              makeSearchText([
                option.group,
                option.label,
                option.searchText,
              ]).includes(
                query,
              ),
          )
          .map(
            option => ({
              ...option,

              alreadyLinked:
                linked.has(
                  option.key,
                ),
            }),
          )
          .slice(
            0,
            80,
          )
      },
      [
        relationshipOptions,
        relationshipSearch,
        draftRelationships,
      ],
    )


  const categoryCounts =
    useMemo(
      () => {
        const counts =
          new Map<
            GalleryCategory,
            number
          >()

        CATEGORY_OPTIONS.forEach(
          option => {
            counts.set(
              option.value,
              0,
            )
          },
        )

        counts.set(
          'all',
          allItems.length,
        )

        allItems.forEach(
          item => {
            counts.set(
              item.category,
              (
                counts.get(
                  item.category,
                ) ??
                0
              ) +
              1,
            )
          },
        )

        return counts
      },
      [
        allItems,
      ],
    )


  const visibleItems =
    useMemo(
      () => {
        const query =
          normalise(
            search,
          )

        const filtered =
          allItems.filter(
            item => {
              if (
                category !==
                  'all' &&
                item.category !==
                  category
              ) {
                return false
              }

              if (
                query &&
                !item
                  .searchableText
                  .includes(
                    query,
                  )
              ) {
                return false
              }

              if (
                fromDate &&
                (
                  !item.photoDate ||
                  item.photoDate <
                    fromDate
                )
              ) {
                return false
              }

              if (
                toDate &&
                (
                  !item.photoDate ||
                  item.photoDate >
                    toDate
                )
              ) {
                return false
              }

              return true
            },
          )

        return [
          ...filtered,
        ].sort(
          (
            first,
            second,
          ) => {
            if (
              sort ===
              'newest-photo'
            ) {
              if (
                !first.photoDate &&
                !second.photoDate
              ) {
                return second.key.localeCompare(
                  first.key,
                )
              }

              if (
                !first.photoDate
              ) {
                return 1
              }

              if (
                !second.photoDate
              ) {
                return -1
              }

              return second.photoDate.localeCompare(
                first.photoDate,
              )
            }

            if (
              sort ===
              'oldest-photo'
            ) {
              if (
                !first.photoDate &&
                !second.photoDate
              ) {
                return first.key.localeCompare(
                  second.key,
                )
              }

              if (
                !first.photoDate
              ) {
                return 1
              }

              if (
                !second.photoDate
              ) {
                return -1
              }

              return first.photoDate.localeCompare(
                second.photoDate,
              )
            }

            if (
              sort ===
              'recently-added'
            ) {
              return (
                second.addedAt ??
                ''
              ).localeCompare(
                first.addedAt ??
                '',
              )
            }

            const categoryDifference =
              first.categoryLabel.localeCompare(
                second.categoryLabel,
              )

            if (
              categoryDifference !==
              0
            ) {
              return categoryDifference
            }

            return first.title.localeCompare(
              second.title,
            )
          },
        )
      },
      [
        allItems,
        category,
        search,
        fromDate,
        toDate,
        sort,
      ],
    )


  const viewerItem =
    allItems.find(
      item =>
        item.key ===
        viewerKey,
    ) ??
    null


  const compareItems =
    compareKeys
      .map(
        key =>
          allItems.find(
            item =>
              item.key ===
              key,
          ),
      )

      .filter(
        (
          item,
        ): item is GalleryItem =>
          Boolean(
            item,
          ),
      )


  const viewerDialogRef = useModalDialog<HTMLDivElement>(
    () => setViewerKey(null),
    Boolean(viewerItem),
  )


  const editorOpen =
    isAdding ||
    Boolean(
      editingGalleryPhotoId,
    )


  /* =======================================
     EDITOR
  ======================================= */

  function resetEditor() {
    setIsAdding(
      false,
    )

    setEditingGalleryPhotoId(
      null,
    )

    setDraftPhotoUrls(
      [],
    )

    setDraftPhotoDates(
      [],
    )

    setDraftTitle(
      '',
    )

    setDraftNotes(
      '',
    )

    setDraftTags(
      '',
    )

    setDraftRelationships(
      [],
    )

    setRelationshipSearch(
      '',
    )

    setRelationshipKey(
      '',
    )
  }


  function startAddPhoto() {
    resetEditor()

    setDraftPhotoDates([
      getToday(),
    ])

    setIsAdding(
      true,
    )
  }


  function startEditPhoto(
    photo: GalleryPhoto,
  ) {
    setIsAdding(
      false,
    )

    setEditingGalleryPhotoId(
      photo.id,
    )

    setDraftPhotoUrls([
      photo.photoUrl,
    ])

    setDraftPhotoDates([
      photo.photoDate,
    ])

    setDraftTitle(
      photo.title ??
      '',
    )

    setDraftNotes(
      photo.notes ??
      '',
    )

    setDraftTags(
      (
        photo.tags ??
        []
      ).join(
        ', ',
      ),
    )

    setDraftRelationships(
      photo.relationships ??
      [],
    )

    setRelationshipSearch(
      '',
    )

    setRelationshipKey(
      '',
    )

    setViewerKey(
      null,
    )
  }


  function handleAddRelationship() {
    const option =
      relationshipOptions.find(
        candidate =>
          candidate.key ===
          relationshipKey,
      )

    if (
      !option
    ) {
      return
    }

    const alreadyLinked =
      draftRelationships.some(
        relationship =>
          relationship.targetType ===
            option.targetType &&
          relationship.targetId ===
            option.targetId,
      )

    if (
      alreadyLinked
    ) {
      return
    }

    setDraftRelationships(
      current => [
        ...current,

        {
          targetType:
            option.targetType,

          targetId:
            option.targetId,

          label:
            option.label,

          createdAt:
            getNow(),
        },
      ],
    )

    setRelationshipKey(
      '',
    )

    setRelationshipSearch(
      '',
    )
  }


  function handleSaveGalleryPhoto() {
    const photoUrl =
      draftPhotoUrls[
        0
      ]

    if (
      !photoUrl
    ) {
      return
    }

    const now =
      getNow()

    if (
      editingGalleryPhotoId
    ) {
      onGardenDataChange({
        ...gardenData,

        galleryPhotos:
          (
            gardenData.galleryPhotos ??
            []
          ).map(
            photo =>
              photo.id ===
              editingGalleryPhotoId
                ? {
                    ...photo,

                    photoUrl,

                    photoDate:
                      draftPhotoDates[
                        0
                      ] ||
                      undefined,

                    title:
                      draftTitle.trim() ||
                      undefined,

                    notes:
                      draftNotes.trim() ||
                      undefined,

                    tags:
                      parseTags(
                        draftTags,
                      ),

                    relationships:
                      draftRelationships,

                    updatedAt:
                      now,
                  }
                : photo,
          ),
      })

      resetEditor()

      return
    }

    const newPhoto:
      GalleryPhoto = {
        id:
          crypto.randomUUID(),

        photoUrl,

        photoDate:
          draftPhotoDates[
            0
          ] ||
          undefined,

        title:
          draftTitle.trim() ||
          undefined,

        notes:
          draftNotes.trim() ||
          undefined,

        tags:
          parseTags(
            draftTags,
          ),

        relationships:
          draftRelationships,

        createdAt:
          now,
      }

    onGardenDataChange({
      ...gardenData,

      galleryPhotos: [
        ...(
          gardenData.galleryPhotos ??
          []
        ),
        newPhoto,
      ],
    })

    resetEditor()
  }


  function handleDeleteGalleryPhoto(
    photoId: string,
  ) {
    const confirmed =
      window.confirm(
        'Delete this Gallery photograph? This only removes the photograph owned by Garden Gallery. Photographs belonging to other Sprig records are not affected.',
      )

    if (
      !confirmed
    ) {
      return
    }

    onGardenDataChange({
      ...gardenData,

      galleryPhotos:
        (
          gardenData.galleryPhotos ??
          []
        ).filter(
          photo =>
            photo.id !==
            photoId,
        ),
    })

    setViewerKey(
      null,
    )

    setCompareKeys(
      current =>
        current.filter(
          key =>
            key !==
            `gallery:${photoId}`,
        ),
    )
  }


  /* =======================================
     COMPARE
  ======================================= */

  function toggleCompare(
    itemKey: string,
  ) {
    setCompareKeys(
      current => {
        if (
          current.includes(
            itemKey,
          )
        ) {
          return current.filter(
            key =>
              key !==
              itemKey,
          )
        }

        if (
          current.length >=
          2
        ) {
          return [
            current[
              1
            ],
            itemKey,
          ]
        }

        return [
          ...current,
          itemKey,
        ]
      },
    )
  }


  /* =======================================
     SOURCE
  ======================================= */

  function openSource(
    item: GalleryItem,
  ) {
    if (
      item.galleryPhotoId
    ) {
      const photo =
        (
          gardenData.galleryPhotos ??
          []
        ).find(
          candidate =>
            candidate.id ===
            item.galleryPhotoId,
        )

      if (
        photo
      ) {
        startEditPhoto(
          photo,
        )
      }

      return
    }

    if (
      item.sourceType &&
      item.sourceId
    ) {
      setViewerKey(
        null,
      )

      onOpenRelationship(
        item.sourceType,
        item.sourceId,
      )
    }
  }


  return (
    <MainPageTemplate
      activePage="garden-gallery"
      onNavigate={onNavigate}
      pageId="garden-gallery-top"
      className="garden-category-page sprig-gallery-page"
      journeyBackLabel="Back"
      onJourneyBack={onBack}
      navigationAriaLabel="Garden Gallery navigation"
      eyebrow="Photographs"
      title="Garden Gallery"
        intro={
          <>
            {allItems.length}{' '}
            {allItems.length ===
            1
              ? 'photograph'
              : 'photographs'}{' '}
            gathered across Sprig.
          </>
        }
        headerActions={
          <button
            type="button"
            className="sprig-gallery-primary-button"
            onClick={
              startAddPhoto
            }
          >
            + Add a photograph
          </button>
        }
    >


        {editorOpen && (
          <section className="sprig-gallery-paper sprig-gallery-editor">
            <div className="sprig-gallery-section-heading">
              <div>
                <p className="section-label">
                  Gallery Photo
                </p>

                <h2>
                  {editingGalleryPhotoId
                    ? 'Edit photograph'
                    : 'Add a photograph straight to the Gallery'}
                </h2>
              </div>

              <button
                type="button"
                className="sprig-gallery-text-button"
                onClick={
                  resetEditor
                }
              >
                Close
              </button>
            </div>


            <SprigPhotoPicker
              photoUrls={
                draftPhotoUrls
              }

              onChange={
                photoUrls => {
                  const nextUrls =
                    photoUrls.slice(
                      0,
                      1,
                    )

                  setDraftPhotoUrls(
                    nextUrls,
                  )

                  setDraftPhotoDates(
                    current =>
                      nextUrls.map(
                        (
                          _photoUrl,
                          index,
                        ) =>
                          current[
                            index
                          ] ??
                          getToday(),
                      ),
                  )
                }
              }

              photoDates={
                draftPhotoDates
              }

              onPhotoDatesChange={
                setDraftPhotoDates
              }

              title="Photograph"

              helperText="This photograph belongs directly to Garden Gallery. You can connect it to other Sprig records below without moving or duplicating it."

              addButtonText="Choose photograph"

              photoAltPrefix="Garden Gallery photograph"

              multiple={
                false
              }

              maxPhotos={
                1
              }

              defaultNewPhotosToToday

              photoDateLabel="When was this photograph taken?"

              photoDateHelperText="Optional and editable. Leave it blank if you genuinely do not know."
            />


            <div className="sprig-gallery-editor-grid">
              <label className="sprig-gallery-field sprig-gallery-field--wide">
                <span>
                  Title or caption
                  <small>
                    optional
                  </small>
                </span>

                <input
                  type="text"
                  value={
                    draftTitle
                  }
                  onChange={
                    event =>
                      setDraftTitle(
                        event.target.value,
                      )
                  }
                  placeholder="New growth on Royal Blue"
                />
              </label>


              <label className="sprig-gallery-field sprig-gallery-field--wide">
                <span>
                  Notes
                  <small>
                    optional
                  </small>
                </span>

                <textarea
                  rows={
                    4
                  }
                  value={
                    draftNotes
                  }
                  onChange={
                    event =>
                      setDraftNotes(
                        event.target.value,
                      )
                  }
                  placeholder="Anything worth remembering about what is visible here..."
                />
              </label>


              <label className="sprig-gallery-field sprig-gallery-field--wide">
                <span>
                  Tags
                  <small>
                    optional
                  </small>
                </span>

                <input
                  type="text"
                  value={
                    draftTags
                  }
                  onChange={
                    event =>
                      setDraftTags(
                        event.target.value,
                      )
                  }
                  placeholder="#sprouting #yellow-leaves #harvest"
                />
              </label>
            </div>


            <section className="sprig-gallery-relationships">
              <p className="section-label">
                Relationships
              </p>

              <h3>
                Connect this photograph
              </h3>

              <p>
                A Gallery-owned photograph can point
                to saved Sprig records without
                becoming a duplicate photograph.
              </p>


              {draftRelationships.length >
                0 && (
                <div className="sprig-gallery-linked-list">
                  {draftRelationships.map(
                    relationship => (
                      <div
                        key={`${relationship.targetType}:${relationship.targetId}`}
                        className="sprig-gallery-linked-row"
                      >
                        <span>
                          {getRelationshipLabel(
                            gardenData,
                            relationship,
                          )}
                        </span>

                        <button
                          type="button"
                          className="sprig-gallery-text-button"
                          onClick={() =>
                            setDraftRelationships(
                              current =>
                                current.filter(
                                  item =>
                                    !(
                                      item.targetType ===
                                        relationship.targetType &&
                                      item.targetId ===
                                        relationship.targetId
                                    ),
                                ),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}


              <label className="sprig-gallery-field">
                <span>
                  Find a Sprig record
                </span>

                <input
                  type="search"
                  value={
                    relationshipSearch
                  }
                  onChange={
                    event => {
                      setRelationshipSearch(
                        event.target.value,
                      )

                      setRelationshipKey(
                        '',
                      )
                    }
                  }
                  placeholder="Royal Blue, west wall, harvest, Trial..."
                />
              </label>


              <div className="sprig-gallery-relationship-row">
                <label className="sprig-gallery-field">
                  <span>
                    Matching records
                  </span>

                  <select
                    value={
                      relationshipKey
                    }
                    onChange={
                      event =>
                        setRelationshipKey(
                          event.target.value,
                        )
                    }
                  >
                    <option value="">
                      Choose a saved Sprig record
                    </option>

                    {filteredRelationshipOptions.map(
                      option => (
                        <option
                          key={
                            option.key
                          }
                          value={
                            option.key
                          }
                          disabled={
                            option.alreadyLinked
                          }
                        >
                          {option.group} · {option.label}
                          {option.alreadyLinked
                            ? ' · Already linked'
                            : ''}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <button
                  type="button"
                  className="sprig-gallery-secondary-button"
                  disabled={
                    !relationshipKey
                  }
                  onClick={
                    handleAddRelationship
                  }
                >
                  Link record
                </button>
              </div>
            </section>


            <div className="sprig-gallery-editor-actions">
              <button
                type="button"
                className="sprig-gallery-secondary-button"
                onClick={
                  resetEditor
                }
              >
                Leave it for now
              </button>

              <button
                type="button"
                className="sprig-gallery-primary-button"
                disabled={
                  !draftPhotoUrls[
                    0
                  ]
                }
                onClick={
                  handleSaveGalleryPhoto
                }
              >
                {editingGalleryPhotoId
                  ? 'Save photograph'
                  : 'Add to Garden Gallery'}
              </button>
            </div>
          </section>
        )}


        <section className="sprig-gallery-controls sprig-gallery-paper">
          <div className="sprig-gallery-search-row">
            <label className="sprig-gallery-field sprig-gallery-field--search">
              <span>
                Search photographs
              </span>

              <input
                type="search"
                value={
                  search
                }
                onChange={
                  event =>
                    setSearch(
                      event.target.value,
                    )
                }
                placeholder="Potato, Royal Blue, yellow leaves, flowering, harvest..."
              />
            </label>

            <label className="sprig-gallery-field">
              <span>
                Order
              </span>

              <select
                value={
                  sort
                }
                onChange={
                  event =>
                    setSort(
                      event.target.value as
                        GallerySort,
                    )
                }
              >
                {SORT_OPTIONS.map(
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
          </div>


          <div className="sprig-gallery-date-row">
            <label className="sprig-gallery-field">
              <span>
                From
              </span>

              <input
                type="date"
                value={
                  fromDate
                }
                onChange={
                  event =>
                    setFromDate(
                      event.target.value,
                    )
                }
              />
            </label>

            <label className="sprig-gallery-field">
              <span>
                To
              </span>

              <input
                type="date"
                value={
                  toDate
                }
                onChange={
                  event =>
                    setToDate(
                      event.target.value,
                    )
                }
              />
            </label>
          </div>


          <div className="sprig-gallery-category-row">
            {CATEGORY_OPTIONS.map(
              option => (
                <button
                  type="button"
                  key={
                    option.value
                  }
                  className={
                    category ===
                    option.value
                      ? 'sprig-gallery-category-button sprig-gallery-category-button--active'
                      : 'sprig-gallery-category-button'
                  }
                  onClick={() =>
                    setCategory(
                      option.value,
                    )
                  }
                >
                  <span>
                    {option.label}
                  </span>

                  <small>
                    {categoryCounts.get(
                      option.value,
                    ) ??
                    0}
                  </small>
                </button>
              ),
            )}
          </div>
        </section>


        <section className="sprig-gallery-results-heading">
          <div>
            <p className="section-label">
              Garden photographs
            </p>

            <h2>
              {visibleItems.length}{' '}
              {visibleItems.length ===
              1
                ? 'photograph'
                : 'photographs'}
            </h2>
          </div>

          {compareKeys.length >
            0 && (
            <p>
              {compareKeys.length} of 2 selected for comparison
            </p>
          )}
        </section>


        {visibleItems.length ===
        0 ? (
          <section className="sprig-gallery-paper sprig-gallery-empty">
            <h2>
              No photographs match this view
            </h2>

            <p>
              Change the search, dates or category
              to widen the garden again.
            </p>
          </section>
        ) : (
          <section className="sprig-gallery-grid">
            {visibleItems.map(
              item => {
                const selectedForCompare =
                  compareKeys.includes(
                    item.key,
                  )

                const purposeLabel =
                  getSprigPhotoPurposeLabel(
                    item.purpose,
                  )

                return (
                  <article
                    key={
                      item.key
                    }
                    className="sprig-gallery-card"
                  >
                    <button
                      type="button"
                      className="sprig-gallery-card-image"
                      onClick={() =>
                        setViewerKey(
                          item.key,
                        )
                      }
                      aria-label={`Open ${item.title}`}
                    >
                      <img
                        src={
                          item.photoUrl
                        }
                        alt={
                          item.title
                        }
                      />
                    </button>

                    <div className="sprig-gallery-card-copy">
                      <div className="sprig-gallery-card-kickers">
                        <span className="sprig-gallery-card-category">
                          {item.categoryLabel}
                        </span>

                        {purposeLabel && (
                          <span className="sprig-gallery-purpose">
                            {purposeLabel}
                          </span>
                        )}
                      </div>

                      <strong>
                        {item.title}
                      </strong>

                      <span className="sprig-gallery-card-date">
                        {formatDate(
                          item.photoDate,
                        )}

                        {item.photoTime
                          ? ` · ${item.photoTime}`
                          : ''}
                      </span>

                      {item.subtitle && (
                        <small>
                          {item.subtitle}
                        </small>
                      )}

                      {item.notes && (
                        <p className="sprig-gallery-card-notes">
                          {item.notes}
                        </p>
                      )}

                      {item.tags.length >
                        0 && (
                        <div className="sprig-gallery-tag-row">
                          {item.tags
                            .slice(
                              0,
                              4,
                            )
                            .map(
                              tag => (
                                <span
                                  key={`${item.key}-${tag}`}
                                >
                                  #
                                  {tag.replace(
                                    /^#+/,
                                    '',
                                  )}
                                </span>
                              ),
                            )}
                        </div>
                      )}


                      <div className="sprig-gallery-card-actions">
                        <button
                          type="button"
                          className={
                            selectedForCompare
                              ? 'sprig-gallery-compare-button sprig-gallery-compare-button--selected'
                              : 'sprig-gallery-compare-button'
                          }
                          onClick={() =>
                            toggleCompare(
                              item.key,
                            )
                          }
                        >
                          {selectedForCompare
                            ? '✓ Selected'
                            : 'Compare'}
                        </button>

                        <button
                          type="button"
                          className="sprig-gallery-source-button"
                          onClick={() =>
                            openSource(
                              item,
                            )
                          }
                        >
                          {item.galleryPhotoId
                            ? 'Edit photo'
                            : 'Open source ›'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              },
            )}
          </section>
        )}


        {compareItems.length ===
          2 && (
          <section
            id="sprig-photo-comparison"
            className="sprig-gallery-paper sprig-gallery-comparison"
          >
            <div className="sprig-gallery-section-heading">
              <div>
                <p className="section-label">
                  Photo comparison
                </p>

                <h2>
                  Look at two moments together
                </h2>
              </div>

              <button
                type="button"
                className="sprig-gallery-text-button"
                onClick={() =>
                  setCompareKeys(
                    [],
                  )
                }
              >
                Close comparison
              </button>
            </div>

            <div className="sprig-gallery-comparison-grid">
              {compareItems.map(
                (
                  item,
                  index,
                ) => (
                  <article
                    key={
                      item.key
                    }
                    className="sprig-gallery-comparison-card"
                  >
                    <span className="sprig-gallery-comparison-label">
                      {index ===
                      0
                        ? 'Photo A'
                        : 'Photo B'}
                    </span>

                    <img
                      src={
                        item.photoUrl
                      }
                      alt={
                        item.title
                      }
                    />

                    <div>
                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {formatDate(
                          item.photoDate,
                        )}
                      </p>

                      <small>
                        {item.categoryLabel}

                        {item.subtitle
                          ? ` · ${item.subtitle}`
                          : ''}
                      </small>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        )}


        {viewerItem && (
          <div
            ref={viewerDialogRef}
            className="sprig-gallery-viewer-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Photograph viewer"
            onClick={() =>
              setViewerKey(
                null,
              )
            }
          >
            <article
              className="sprig-gallery-viewer"
              onClick={
                event =>
                  event.stopPropagation()
              }
            >
              <div className="sprig-gallery-viewer-sticky-bar">
                <span>
                  Photograph
                </span>

                <button
                  data-dialog-initial-focus
                  type="button"
                  className="sprig-gallery-viewer-close"
                  aria-label="Close photograph"
                  onClick={() =>
                    setViewerKey(
                      null,
                    )
                  }
                >
                  ×
                </button>
              </div>


              <div className="sprig-gallery-viewer-scroll">
                <div className="sprig-gallery-viewer-image-shell">
                  <img
                    src={
                      viewerItem.photoUrl
                    }
                    alt={
                      viewerItem.title
                    }
                  />
                </div>


                <div className="sprig-gallery-viewer-details">
                  <div className="sprig-gallery-card-kickers">
                    <span className="sprig-gallery-card-category">
                      {viewerItem.categoryLabel}
                    </span>

                    {getSprigPhotoPurposeLabel(
                      viewerItem.purpose,
                    ) && (
                      <span className="sprig-gallery-purpose">
                        {getSprigPhotoPurposeLabel(
                          viewerItem.purpose,
                        )}
                      </span>
                    )}
                  </div>

                  <h2>
                    {viewerItem.title}
                  </h2>

                  <p className="sprig-gallery-viewer-date">
                    {formatDate(
                      viewerItem.photoDate,
                    )}

                    {viewerItem.photoTime
                      ? ` · ${viewerItem.photoTime}`
                      : ''}
                  </p>

                  {viewerItem.subtitle && (
                    <p>
                      {viewerItem.subtitle}
                    </p>
                  )}

                  {viewerItem.notes && (
                    <p className="sprig-gallery-viewer-notes">
                      {viewerItem.notes}
                    </p>
                  )}

                  {viewerItem.tags.length >
                    0 && (
                    <div className="sprig-gallery-tag-row">
                      {viewerItem.tags.map(
                        tag => (
                          <span
                            key={`${viewerItem.key}-${tag}`}
                          >
                            #
                            {tag.replace(
                              /^#+/,
                              '',
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  )}


                  <div className="sprig-gallery-viewer-actions">
                    <button
                      type="button"
                      className="sprig-gallery-secondary-button"
                      onClick={() =>
                        toggleCompare(
                          viewerItem.key,
                        )
                      }
                    >
                      {compareKeys.includes(
                        viewerItem.key,
                      )
                        ? 'Remove from comparison'
                        : 'Select for comparison'}
                    </button>

                    <button
                      type="button"
                      className="sprig-gallery-primary-button"
                      onClick={() =>
                        openSource(
                          viewerItem,
                        )
                      }
                    >
                      {viewerItem.galleryPhotoId
                        ? 'Edit photograph'
                        : 'Open original record'}
                    </button>

                    {viewerItem.galleryPhotoId && (
                      <button
                        type="button"
                        className="sprig-gallery-danger-button"
                        onClick={() =>
                          handleDeleteGalleryPhoto(
                            viewerItem.galleryPhotoId!,
                          )
                        }
                      >
                        Delete photograph
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}
    </MainPageTemplate>
  )
}
