 App.tsx
│   main.tsx
│   Router.tsx
│   types.ts
│
├───app
├───assets
│       hero.png
│       react.svg
│       vite.svg
│
├───components
│   │   GardenTimingCalculator.tsx
│   │
│   ├───app
│   │       AppLibrary.tsx
│   │
│   ├───buttons
│   ├───calendar
│   ├───cards
│   │       PlantCard.tsx
│   │
│   ├───common
│   │       RecordActions.tsx
│   │       SprigQuickPeek.tsx
│   │
│   ├───forms
│   │       AddEventForm.tsx
│   │       AddGrowingPlaceForm.tsx
│   │       AddHarvestForm.tsx
│   │       AddIngredientForm.tsx
│   │       AddPlantForm.tsx
│   │       AddProductForm.tsx
│   │       AddRecipeForm.tsx
│   │       BoughtMixSection.tsx
│   │       GroundTypeSection.tsx
│   │       GrowingSystemSection.tsx
│   │       OwnMixSection.tsx
│   │       RecipeComponentsSection.tsx
│   │
│   ├───knowledge
│   │       GardenReference.tsx
│   │
│   ├───layout
│   │       GardenLayout.tsx
│   │
│   ├───navigation
│   │       appNavigation.ts
│   │       BottomNavigation.tsx
│   │       menu-log.png
│   │       SatchelMenu.tsx
│   │
│   ├───notebook
│   ├───photos
│   │       MultiPhotoField.tsx
│   │       SprigPhotoGallery.tsx
│   │       SprigPhotoPicker.tsx
│   │
│   ├───plants
│   │       PlantSmartComparisons.tsx
│   │
│   ├───purchases
│   │       PurchaseDetailsSection.tsx
│   │       PurchaseEditor.tsx
│   │
│   ├───sprig
│   │       SelectionCard.tsx
│   │       SprigPicker.tsx
│   │
│   └───timeline
├───css
│   │   App.css
│   │   calendar.css
│   │   garden-gallery.css
│   │   garden-knowledge.css
│   │   garden-trials.css
│   │   gate-intelligence.css
│   │   global-search.css
│   │   sprig-print.css
│   │
│   ├───base
│   │       index.css
│   │       variables.css
│   │
│   ├───components
│   │   │   buttons.css
│   │   │   comparison.css
│   │   │   forms.css
│   │   │   formsbackup.css
│   │   │   layout.css
│   │   │   navigation.css
│   │   │   photos.css
│   │   │   sprig.css
│   │   │
│   │   └───cards
│   │           plantcard.css
│   │
│   ├───pages
│   │       gate.css
│   │       growing.css
│   │       journal.css
│   │       plant-detail.css
│   │       plants.css
│   │       welcome.css
│   │
│   └───utilities
├───data
│       sampleData.ts
│
├───images
│   ├───backgrounds
│   │       base-paper-texture.jpg
│   │       menu-log-3.png
│   │       menu-log.png
│   │       parchment-paper.png
│   │       welcome-background.png
│   │       woodland-frame-4.png
│   │       woodland-frame.png
│   │       woodland-frame_1.png
│   │
│   ├───calendar
│   ├───cards
│   │       info-card.png
│   │       label-short.png
│   │       label-tall.png
│   │       rec-selectation-card-selected.png
│   │       rec-selectation-card.png
│   │       rec-vert-selectation-card-selected.png
│   │       rec-vert-selectation-card.png
│   │       selection-card-selected.png
│   │       selection-card.png
│   │       tag-selected.png
│   │       tag.png
│   │
│   ├───cottage
│   │       cottage-doo.png
│   │
│   ├───decorations
│   │   │   divider-vine.png
│   │   │   lantern-decoration.png
│   │   │   navigation-sign.png
│   │   │   wooden-title-banner.png
│   │   │
│   │   └───dividers
│   │           divider1.png
│   │
│   ├───icons
│   │       camera-2.png
│   │       camera.png
│   │       notebook-icon.png
│   │
│   ├───misc
│   ├───navigation
│   │       active-ring.png
│   │       icon-gate.png
│   │       icon-harvest.png
│   │       icon-journal.png
│   │       icon-library.png
│   │       icon-plants.png
│   │       menu-log-1.png
│   │       navigation-carved-leaf.png
│   │       navigation-fireflies.png
│   │       navigation-lantern-glow.png
│   │       navigation-leaves.png
│   │       navigation-left-end.png
│   │       navigation-log-centre.png
│   │       navigation-moss.png
│   │       navigation-right-end.png
│   │       navigation-shadow.png
│   │       paper-bg.png
│   │       stone-active.png
│   │       stone-default.png
│   │
│   ├───notebook
│   │       notebook-entry-background-mobile.jpg
│   │       notebook-entry-background-mobile.png
│   │       notebook-entry-background-mobile.psd
│   │       notebook-entry-background-mobile_OG.png
│   │       notebook-entry-background.png
│   │       open-notebook.png
│   │
│   ├───plants
│   ├───seasons
│   ├───sprig
│   │       sprig-mascot.png
│   │       sprig-wave.png
│   │
│   └───ui
├───pages
│       BackupRestore.tsx
│       Calendar.tsx
│       Comparisons.tsx
│       GardenGallery.tsx
│       GardenKnowledge.tsx
│       GardenTrials.tsx
│       Gate.tsx
│       GlobalSearch.tsx
│       GrowingPlaceDetail.tsx
│       GrowingPlaces.tsx
│       GrowingRecipeDetail.tsx
│       GrowingRecipes.tsx
│       Harvest.tsx
│       HarvestDetail.tsx
│       IngredientDetail.tsx
│       Ingredients.tsx
│       Journal.tsx
│       JournalEntryDetail.tsx
│       Library.tsx
│       PlantComparison.tsx
│       PlantDetail.tsx
│       Plants.tsx
│       ProductDetail.tsx
│       Products.tsx
│       SprigSmart.tsx
│       Welcome.tsx
│
├───services
│       backup.ts
│       sprigDatabase.ts
│       storage.ts
│
├───types
│       navigation.ts
│
└───utils
        calendarUtils.ts
        gardenTimingUtils.ts
        globalSearchUtils.ts
        photoUtils.ts
        gardenTimingUtils.ts
        globalSearchUtils.ts
        gardenTimingUtils.ts
        gardenTimingUtils.ts
        globalSearchUtils.ts
        photoUtils.ts
        plantComparisonUtils.ts
        plantDisplayName.ts
        plantStoryContext.ts
        sprigInsights.ts
        sprigSmartDocx.ts

        *********************************************************
        hierachy:

        GARDEN OF MINE MASTER UI SYSTEM
│
├── GLOBAL DESIGN / CSS
│   ├── colours
│   ├── typography
│   ├── spacing
│   ├── buttons
│   ├── form controls
│   ├── cards / reading surfaces
│   ├── responsive rules
│   ├── interaction states
│   └── shared layout styling
│
├── MASTER APP LAYOUT
│   └── GardenLayout
│       ├── app-wide structure
│       ├── navigation environment
│       └── global page behaviour
│
├── MASTER PAGE SYSTEM
│   └── GardenPage
│       ├── GardenPageNavigation
│       ├── GardenPageHeader
│       ├── shared page spacing
│       ├── shared responsive behaviour
│       └── BackToTop
│
├── MASTER DETAIL SYSTEM
│   ├── journey Back
│   ├── category/Home route
│   ├── record heading
│   ├── RecordActions
│   ├── Edit / Delete where appropriate
│   ├── PDF / RTF where appropriate
│   └── shared detail presentation
│
├── MASTER COMPONENT SYSTEM
│   ├── forms
│   ├── pickers
│   ├── selection controls
│   ├── photographs
│   ├── relationship links
│   ├── empty states
│   ├── dialogs
│   └── other reusable UI primitives
│
└── INDIVIDUAL FEATURES
    ├── Plants
    ├── Journal
    ├── Harvest
    ├── Garden Gallery
    ├── Garden Trials
    └── etc.

 Destination Page Template: main destinations such as Plants, Journal, Harvest, Gallery.
Detail Page Template: individual saved records.
Form / Editor Template: Add and Edit journeys.
Picker / Selection Template: choosing records, filters, relationships, compare selections.
Dialog / Overlay Template: confirmations, viewers and modal interactions.
Record / Relationship Template: how linked records and Quick Peek are presented.
Empty / Status Template: empty, no-results, loading and similar states.


        Every new Garden of Mine screen must first be assigned to a Page Template. Every repeated interaction must use a Master Component. Every repeated appearance comes from Master CSS. Photos use the Photo System. Exports use the Export/Print System. Feature code owns only what is genuinely unique to that feature.
        The backbone I recommend

GARDEN OF MINE INTERNAL CMS / UI FRAMEWORK
│
├── MASTER DESIGN SYSTEM
│   └── One Garden of Mine visual language
│       ├── colours
│       ├── typography
│       ├── spacing
│       ├── buttons
│       ├── inputs
│       ├── dropdowns
│       ├── checkboxes
│       ├── cards / reading surfaces
│       ├── interaction states
│       └── responsive rules
│
├── MASTER APP LAYOUT
│   └── GardenLayout.tsx
│       ├── app shell
│       ├── Satchel environment
│       ├── persistent app navigation
│       └── global page behaviour
│
├── PAGE TEMPLATES
│   │
│   ├── MainPageTemplate.tsx
│   │   └── Record-collection pages
│   │       Plants
│   │       Journal
│   │       Harvests
│   │       Comparisons
│   │       Products / Ingredients where appropriate
│   │
│   ├── MultiPageTemplate.tsx
│   │   └── One destination containing related sub-pages/tabs
│   │       Garden Knowledge
│   │       Growing
│   │
│   ├── FunctionPageTemplate.tsx
│   │   └── Pages whose primary purpose is performing a function
│   │       Today
│   │       Search MOG
│   │       Sprig Smart
│   │       Calendar
│   │       Backup / Restore page
│   │
│   ├── DetailPageTemplate.tsx
│   │   └── One saved record
│   │       Plant Story
│   │       Journal Entry
│   │       Harvest
│   │       Growing Recipe
│   │       Trial detail
│   │       Knowledge record
│   │
│   └── FormTemplate.tsx
│       └── Add / Edit experiences
│
├── MASTER CONTENT COMPONENTS
│   ├── Navigation
│   ├── Picker
│   ├── Buttons
│   ├── Inputs
│   ├── Dropdowns
│   ├── Checkboxes / selection controls
│   ├── Relationship displays
│   ├── Record actions
│   ├── Dialogs / overlays
│   ├── Empty / status states
│   └── etc.
│
├── PHOTO SYSTEM
│   ├── photo ownership / data
│   ├── metadata / provenance
│   ├── PhotoPicker
│   ├── PhotoGallery
│   ├── PhotoThumbnail
│   ├── PhotoViewer
│   ├── PhotoEditor
│   ├── relationships
│   └── master photo CSS
│
├── EXPORT / PRINT SYSTEM
│   ├── PDF
│   ├── RTF
│   ├── Print
│   ├── reports
│   ├── comparisons / tables
│   ├── photographs where appropriate
│   ├── shared document presentation
│   └── master print/export CSS
│
├── DATA PORTABILITY SYSTEM
│   ├── Backup
│   ├── Restore
│   ├── validation
│   ├── versioning
│   └── future import / migration
│
└── FEATURES / CONTENT
    ├── Plants
    ├── Journal
    ├── Harvests
    ├── Growing
    ├── Garden Knowledge
    ├── Trials
    ├── Gallery
    └── etc.