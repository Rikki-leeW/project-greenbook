import { useEffect, useRef, useState, type FormEvent, } from 'react';
import SelectionCard from '../sprig/SelectionCard';
import SprigPicker from '../sprig/SprigPicker';
import SprigPhotoPicker from '../photos/SprigPhotoPicker';
import AddGrowingPlaceForm from './AddGrowingPlaceForm';
import notebookEntryBackground from '../../images/notebook/notebook-entry-background.png';
import type { EventType, GardenEvent, GardenPlan, GardenEventGrowingChange, GardenProduct, GrowingPlace, GrowingPlaceScope, GrowingSetup, GrowingSetupCategory, PlantScope, PlantStory, SprigPhotoMetadata, } from '../../types';

interface AddEventFormProps {
    plantId: string;
    plants: PlantStory[];
    growingPlaces: GrowingPlace[];
    growingSetups: GrowingSetup[];
    products: GardenProduct[];

    /*
     * Optional existing Journal record.
     *
     * Supplying this changes the form from
     * Add Journal Entry to Edit Journal Entry.
     *
     * The same GardenEvent ID is preserved.
     */
    eventToEdit?: GardenEvent;

    /*
     * Optional Garden Plan source.
     *
     * The Plan is not changed by this form.
     * It merely provides useful starting values
     * for the real Journal record.
     */
    planToRecord?: GardenPlan;

    onAddEvent: (event: GardenEvent) => void;

    onAddGrowingPlace: (place: GrowingPlace) => void;

    onAddRecipe: (recipe: GrowingSetup) => void;

    onUpdateEvent?: (event: GardenEvent) => void;

    /*
     * Harvest is deliberately a real Harvest
     * record rather than an ordinary Journal
     * activity.
     */
    onAddHarvest?: (plantStoryIds: string[]) => void;

    onClose: () => void;
}


/* =======================================
   TODAY
======================================= */

function getTodayDate(): string {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1,
    ).padStart(
        2,
        '0',
    );

    const day = String(
        now.getDate(),
    ).padStart(
        2,
        '0',
    );

    return `${year}-${month}-${day}`;
}


/* =======================================
   PRODUCT CATEGORY LABEL
======================================= */

function getProductCategoryLabel(
    product: GardenProduct,
): string | undefined {
    if (
        product.customCategoryLabel
            ?.trim()
    ) {
        return product
            .customCategoryLabel
            .trim();
    }

    switch (
        product.category
    ) {
        case 'fertiliser':
            return 'Fertiliser';

        case 'soil-conditioner':
            return 'Soil conditioner';

        case 'wetting-agent':
            return 'Wetting agent';

        case 'pest-treatment':
            return 'Pest treatment';

        case 'disease-treatment':
            return 'Disease treatment';

        case 'weed-treatment':
            return 'Weed treatment';

        case 'biological-treatment':
            return 'Biological treatment';

        case 'root-treatment':
            return 'Root treatment';

        case 'plant-tonic':
            return 'Plant tonic';

        case 'growing-medium':
            return 'Growing medium';

        case 'mulch':
            return 'Mulch';

        case 'seed-treatment':
            return 'Seed treatment';

        case 'cleaning-product':
            return 'Cleaning product';

        case 'other':
            return 'Other';

        default:
            return undefined;
    }
}


/* =======================================
   PLAN → JOURNAL ACTIVITY
======================================= */

function getPlanActivityType(
    plan?: GardenPlan,
): EventType | undefined {
    if (
        !plan
    ) {
        return undefined;
    }

    switch (
        plan.kind
    ) {
        case 'plant-out':
            return 'transplanted';

        case 'move':
            return 'moved';

        case 'feed':
            return 'fed';

        case 'treat':
            return 'treated';

        case 'garden-task':
        case 'other':
            return 'note';

        default:
            return undefined;
    }
}


/* =======================================
   PLAN → PLANT SCOPE
======================================= */

function getPlanPlantScope(
    plan?: GardenPlan,
): PlantScope {
    const count =
        plan
            ?.plantStoryIds
            ?.length ??
        0;

    if (
        count === 1
    ) {
        return 'single';
    }

    if (
        count > 1
    ) {
        return 'multiple';
    }

    return 'none';
}


/* =======================================
   PLAN → PLACE SCOPE
======================================= */

function getPlanPlaceScope(
    plan?: GardenPlan,
): GrowingPlaceScope {
    const count =
        plan
            ?.growingPlaceIds
            ?.length ??
        0;

    if (
        count === 1
    ) {
        return 'single';
    }

    if (
        count > 1
    ) {
        return 'multiple';
    }

    return 'none';
}


/* =======================================
   EXISTING EVENT → PLANT SCOPE
======================================= */

function getEventPlantScope(
    event?: GardenEvent,
): PlantScope {
    if (
        event?.plantScope
    ) {
        return event.plantScope;
    }

    const count =
        event
            ?.plantStoryIds
            ?.length ??
        0;

    if (
        count === 1
    ) {
        return 'single';
    }

    if (
        count > 1
    ) {
        return 'multiple';
    }

    return 'none';
}


/* =======================================
   EXISTING EVENT → PLACE SCOPE
======================================= */

function getEventPlaceScope(
    event?: GardenEvent,
): GrowingPlaceScope {
    if (
        event?.growingPlaceScope
    ) {
        return event.growingPlaceScope;
    }

    const count =
        event
            ?.growingPlaceIds
            ?.length ??
        0;

    if (
        count === 1
    ) {
        return 'single';
    }

    if (
        count > 1
    ) {
        return 'multiple';
    }

    return 'none';
}


/* =======================================
   EXISTING PHOTO CONTEXT
======================================= */

function getEventPhotoMetadata(
    event?: GardenEvent,
): (
    SprigPhotoMetadata |
    undefined
)[] {
    const photoUrls =
        event?.photoUrls ??
        [];

    return photoUrls.map(
        (
            photoUrl,
            index,
        ) => {
            const metadata =
                event
                    ?.photoMetadata?.[
                        index
                    ];

            return {
                ...metadata,

                photoUrl:
                    metadata
                        ?.photoUrl ??
                    photoUrl,

                /*
                 * Older Journal photographs have no
                 * individual photograph date.
                 *
                 * The Journal moment date is good
                 * contextual evidence until the
                 * gardener supplies something more
                 * specific.
                 */
                photoDate:
                    metadata
                        ?.photoDate ??
                    event?.date,
            };
        },
    );
}


/* =======================================
   QUICK GROWING SETUP
======================================= */

function getGrowingSetupCategoryLabel(
    category:
        GrowingSetupCategory,
): string {
    switch (
        category
    ) {
        case 'own-mix':
            return 'My Recipe';

        case 'bought-mix':
            return 'Bought Mix';

        case 'growing-system':
            return 'Growing System';

        case 'ground-type':
            return 'Ground Type';

        default:
            return 'Growing record';
    }
}


function createQuickGrowingSetup(
    name: string,
    category:
        GrowingSetupCategory,
    createdAt: string,
): GrowingSetup {
    const safeName =
        name
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                '-',
            )
            .replace(
                /^-|-$/g,
                '',
            );

    return {
        id:
            `${category}-${
                safeName ||
                'growing-setup'
            }-${Date.now()}`,

        name:
            name.trim(),

        category,

        isFavourite:
            false,

        isArchived:
            false,

        createdAt,
    };
}


/* =======================================
   SPRIG JOURNAL FORM
======================================= */

export default function AddEventForm({
    plantId,
    plants,
    growingPlaces,
    growingSetups,
    products,
    eventToEdit,
    planToRecord,
    onAddEvent,
    onAddGrowingPlace,
    onAddRecipe,
    onUpdateEvent,
    onAddHarvest,
    onClose,
}: AddEventFormProps) {
    const today =
        getTodayDate();

    const isEditing =
        Boolean(
            eventToEdit,
        );

    const isRecordingPlan =
        Boolean(
            planToRecord,
        ) &&
        !isEditing;

    /*
     * Hard submission gate.
     *
     * React state disables the button
     * visually, while this ref prevents a
     * rapid second phone tap before the next
     * render can arrive.
     */
    const isSubmittingRef =
        useRef(
            false,
        );

    const [
        isSubmitting,
        setIsSubmitting,
    ] =
        useState(
            false,
        );


    /* =======================================
       ORIGINATING PLANT
    ======================================= */

    const startingPlant =
        !isEditing &&
        plantId
            ? plants.find(
                plant =>
                    plant.id ===
                    plantId,
            )
            : undefined;

    const startingGrowingPlaceId =
        startingPlant
            ?.currentGrowingPlaceId ??
        '';

    const getPlantGrowingSetupIds = (
        plant:
            PlantStory |
            undefined,
    ): string[] =>
        Array.from(
            new Set(
                [
                    ...(
                        plant
                            ?.currentGrowingSetupIds ??
                        []
                    ),

                    plant
                        ?.currentGrowingSetupId,
                ].filter(
                    (
                        id,
                    ): id is string =>
                        Boolean(
                            id,
                        ),
                ),
            ),
        );

    const startingGrowingSetupIds =
        getPlantGrowingSetupIds(
            startingPlant,
        );

    const [
        growingChange,
        setGrowingChange,
    ] =
        useState<
            GardenEventGrowingChange
        >(
            eventToEdit
                ?.growingChange ??
            (
                eventToEdit
                    ?.type ===
                    'moved'
                    ? 'growing-place'
                    : 'both'
            ),
        );

    const [
        fromGrowingPlaceId,
    ] =
        useState(
            eventToEdit
                ?.fromGrowingPlaceId ??
            startingGrowingPlaceId,
        );

    const [
        toGrowingPlaceId,
        setToGrowingPlaceId,
    ] =
        useState(
            eventToEdit
                ?.toGrowingPlaceId ??
            '',
        );

    const [
        fromGrowingSetupIds,
    ] =
        useState<string[]>(
            eventToEdit
                ?.fromGrowingSetupIds
                ? [
                    ...eventToEdit
                        .fromGrowingSetupIds,
                ]
                : [
                    ...startingGrowingSetupIds,
                ],
        );

    const [
        toGrowingSetupIds,
        setToGrowingSetupIds,
    ] =
        useState<string[]>(
            eventToEdit
                ?.toGrowingSetupIds
                ? [
                    ...eventToEdit
                        .toGrowingSetupIds,
                ]
                : [],
        );

    const [
        isToGrowingPlacePickerOpen,
        setIsToGrowingPlacePickerOpen,
    ] =
        useState(
            false,
        );

    const [
        isToGrowingSetupPickerOpen,
        setIsToGrowingSetupPickerOpen,
    ] =
        useState(
            false,
        );

    const [
        growingPlaceQuickAddTarget,
        setGrowingPlaceQuickAddTarget,
    ] =
        useState<
            'destination' |
            'context' |
            null
        >(
            null,
        );

    const [
        quickGrowingSetupCategory,
        setQuickGrowingSetupCategory,
    ] =
        useState<
            GrowingSetupCategory |
            null
        >(
            null,
        );

    const [
        quickGrowingSetupName,
        setQuickGrowingSetupName,
    ] =
        useState(
            '',
        );

    const [
        treatmentReason,
        setTreatmentReason,
    ] =
        useState(
            eventToEdit
                ?.treatmentReason ??
            '',
        );

    const planPlantIds =
        planToRecord
            ?.plantStoryIds ??
        [];

    const planPlaceIds =
        planToRecord
            ?.growingPlaceIds ??
        [];

    const plannedActivity =
        getPlanActivityType(
            planToRecord,
        );

    const eventActivityTypes =
        eventToEdit
            ? (
                eventToEdit
                    .activityTypes
                    ?.length
                    ? [
                        ...eventToEdit
                            .activityTypes,
                    ]
                    : [
                        eventToEdit.type,
                    ]
            )
            : undefined;


    /* =======================================
       ACTIVITY
    ======================================= */

    const [
        activityTypes,
        setActivityTypes,
    ] =
        useState<
            EventType[]
        >(
            eventActivityTypes ??
            (
                plannedActivity
                    ? [
                        plannedActivity,
                    ]
                    : []
            ),
        );

    const [
        isActivityPickerOpen,
        setIsActivityPickerOpen,
    ] =
        useState(
            false,
        );


    /* =======================================
       GROWING PLACE PICKER
    ======================================= */

    const [
        isGrowingPlacePickerOpen,
        setIsGrowingPlacePickerOpen,
    ] =
        useState(
            false,
        );


    /* =======================================
       PLANT PICKER
    ======================================= */

    const [
        isPlantPickerOpen,
        setIsPlantPickerOpen,
    ] =
        useState(
            false,
        );


    /* =======================================
       PRODUCT PICKER
    ======================================= */

    const [
        productIds,
        setProductIds,
    ] =
        useState<
            string[]
        >(
            [
                ...(
                    eventToEdit
                        ?.productIds ??
                    []
                ),
            ],
        );

    const [
        isProductPickerOpen,
        setIsProductPickerOpen,
    ] =
        useState(
            false,
        );


    /* =======================================
       JOURNAL DETAILS
    ======================================= */

    const [
        date,
        setDate,
    ] =
        useState(
            eventToEdit
                ?.date ??
            planToRecord
                ?.date ??
            today,
        );

    const [
        title,
        setTitle,
    ] =
        useState(
            eventToEdit
                ?.title ??
            planToRecord
                ?.title ??
            '',
        );

    const [
        productUsed,
        setProductUsed,
    ] =
        useState(
            eventToEdit
                ?.productUsed ??
            '',
        );

    const [
        notes,
        setNotes,
    ] =
        useState(
            eventToEdit
                ?.notes ??
            planToRecord
                ?.notes ??
            '',
        );


    /* =======================================
       PHOTOGRAPHS
    ======================================= */

    const [
        photoUrls,
        setPhotoUrls,
    ] =
        useState<
            string[]
        >(
            [
                ...(
                    eventToEdit
                        ?.photoUrls ??
                    []
                ),
            ],
        );

    const [
        photoMetadata,
        setPhotoMetadata,
    ] =
        useState<
            (
                SprigPhotoMetadata |
                undefined
            )[]
        >(
            getEventPhotoMetadata(
                eventToEdit,
            ),
        );


    /* =======================================
       GROWING PLACE SCOPE
    ======================================= */

    const [
        growingPlaceScope,
        setGrowingPlaceScope,
    ] =
        useState<
            GrowingPlaceScope
        >(
            eventToEdit
                ? getEventPlaceScope(
                    eventToEdit,
                )
                : isRecordingPlan
                    ? getPlanPlaceScope(
                        planToRecord,
                    )
                    : startingGrowingPlaceId
                        ? 'single'
                        : 'none',
        );

    const [
        growingPlaceIds,
        setGrowingPlaceIds,
    ] =
        useState<
            string[]
        >(
            eventToEdit
                ? [
                    ...(
                        eventToEdit
                            .growingPlaceIds ??
                        []
                    ),
                ]
                : isRecordingPlan
                    ? [
                        ...planPlaceIds,
                    ]
                    : startingGrowingPlaceId
                        ? [
                            startingGrowingPlaceId,
                        ]
                        : [],
        );


    /* =======================================
       PLANT SCOPE
    ======================================= */

    const [
        plantScope,
        setPlantScope,
    ] =
        useState<
            PlantScope
        >(
            eventToEdit
                ? getEventPlantScope(
                    eventToEdit,
                )
                : isRecordingPlan
                    ? getPlanPlantScope(
                        planToRecord,
                    )
                    : startingPlant
                        ? 'single'
                        : 'none',
        );

    const [
        plantStoryIds,
        setPlantStoryIds,
    ] =
        useState<
            string[]
        >(
            eventToEdit
                ? [
                    ...(
                        eventToEdit
                            .plantStoryIds ??
                        []
                    ),
                ]
                : isRecordingPlan
                    ? [
                        ...planPlantIds,
                    ]
                    : startingPlant
                        ? [
                            startingPlant.id,
                        ]
                        : [],
        );


    /* =======================================
       SOURCE RECORD RESET
    ======================================= */

    useEffect(
        () => {
            if (
                eventToEdit
            ) {
                setActivityTypes(
                    eventToEdit
                        .activityTypes
                        ?.length
                        ? [
                            ...eventToEdit
                                .activityTypes,
                        ]
                        : [
                            eventToEdit.type,
                        ],
                );

                setDate(
                    eventToEdit.date,
                );

                setTitle(
                    eventToEdit.title ??
                    '',
                );

                setProductIds(
                    [
                        ...(
                            eventToEdit
                                .productIds ??
                            []
                        ),
                    ],
                );

                setProductUsed(
                    eventToEdit
                        .productUsed ??
                    '',
                );

                setNotes(
                    eventToEdit.notes ??
                    '',
                );

                setGrowingPlaceScope(
                    getEventPlaceScope(
                        eventToEdit,
                    ),
                );

                setGrowingPlaceIds(
                    [
                        ...(
                            eventToEdit
                                .growingPlaceIds ??
                            []
                        ),
                    ],
                );

                setPlantScope(
                    getEventPlantScope(
                        eventToEdit,
                    ),
                );

                setPlantStoryIds(
                    [
                        ...(
                            eventToEdit
                                .plantStoryIds ??
                            []
                        ),
                    ],
                );

                setPhotoUrls(
                    [
                        ...(
                            eventToEdit
                                .photoUrls ??
                            []
                        ),
                    ],
                );

                setPhotoMetadata(
                    getEventPhotoMetadata(
                        eventToEdit,
                    ),
                );

                setIsActivityPickerOpen(
                    false,
                );

                setIsGrowingPlacePickerOpen(
                    false,
                );

                setIsPlantPickerOpen(
                    false,
                );

                setIsProductPickerOpen(
                    false,
                );

                isSubmittingRef.current =
                    false;

                setIsSubmitting(
                    false,
                );

                return;
            }

            if (
                !planToRecord
            ) {
                return;
            }

            const nextActivity =
                getPlanActivityType(
                    planToRecord,
                );

            setDate(
                planToRecord.date,
            );

            setTitle(
                planToRecord.title ??
                '',
            );

            setNotes(
                planToRecord.notes ??
                '',
            );

            setProductIds(
                [],
            );

            setProductUsed(
                '',
            );

            setActivityTypes(
                nextActivity
                    ? [
                        nextActivity,
                    ]
                    : [],
            );

            setGrowingPlaceScope(
                getPlanPlaceScope(
                    planToRecord,
                ),
            );

            setGrowingPlaceIds(
                [
                    ...(
                        planToRecord
                            .growingPlaceIds ??
                        []
                    ),
                ],
            );

            setPlantScope(
                getPlanPlantScope(
                    planToRecord,
                ),
            );

            setPlantStoryIds(
                [
                    ...(
                        planToRecord
                            .plantStoryIds ??
                        []
                    ),
                ],
            );

            setPhotoUrls(
                [],
            );

            setPhotoMetadata(
                [],
            );

            setIsActivityPickerOpen(
                false,
            );

            setIsGrowingPlacePickerOpen(
                false,
            );

            setIsPlantPickerOpen(
                false,
            );

            setIsProductPickerOpen(
                false,
            );

            isSubmittingRef.current =
                false;

            setIsSubmitting(
                false,
            );
        },
        [
            eventToEdit?.id,
            planToRecord?.id,
        ],
    );


    /* =======================================
       LOCK BACKGROUND PAGE
    ======================================= */

    useEffect(
        () => {
            const body =
                document.body;

            const html =
                document
                    .documentElement;

            const previousBodyOverflow =
                body.style
                    .overflow;

            const previousBodyOverscroll =
                body.style
                    .overscrollBehavior;

            const previousHtmlOverflow =
                html.style
                    .overflow;

            const previousHtmlOverscroll =
                html.style
                    .overscrollBehavior;

            body.style.overflow =
                'hidden';

            body.style.overscrollBehavior =
                'none';

            html.style.overflow =
                'hidden';

            html.style.overscrollBehavior =
                'none';

            return () => {
                body.style.overflow =
                    previousBodyOverflow;

                body.style.overscrollBehavior =
                    previousBodyOverscroll;

                html.style.overflow =
                    previousHtmlOverflow;

                html.style.overscrollBehavior =
                    previousHtmlOverscroll;
            };
        },
        [],
    );


    /* =======================================
       AVAILABLE PLANTS
    ======================================= */

    const availablePlants =
        growingPlaceScope ===
            'entire-garden' ||
        growingPlaceIds.length ===
            0
            ? plants
            : plants.filter(
                plant =>
                    growingPlaceIds.some(
                        placeId =>
                            placeId ===
                            plant
                                .currentGrowingPlaceId,
                    ) ||
                    plantStoryIds.includes(
                        plant.id,
                    ),
            );

    const sortedAvailablePlants =
        [
            ...availablePlants,
        ].sort(
            (
                first,
                second,
            ) =>
                first.displayName
                    .localeCompare(
                        second.displayName,
                    ),
        );


    /* =======================================
       AVAILABLE PRODUCTS
    ======================================= */

    const availableProducts =
        [
            ...products,
        ]
            .filter(
                product =>
                    !product.isArchived ||
                    productIds.includes(
                        product.id,
                    ),
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    first.name
                        .localeCompare(
                            second.name,
                        ),
            );


    /* =======================================
       GROWING PLACE SCOPE
    ======================================= */

    function chooseGrowingPlaceScope(
        scope:
            GrowingPlaceScope,
    ) {
        setGrowingPlaceScope(
            scope,
        );

        if (
            scope ===
                'none' ||
            scope ===
                'entire-garden'
        ) {
            setGrowingPlaceIds(
                [],
            );
        }

        if (
            scope ===
                'single' &&
            startingGrowingPlaceId &&
            growingPlaceIds.length ===
                0
        ) {
            setGrowingPlaceIds(
                [
                    startingGrowingPlaceId,
                ],
            );
        }
    }


    /* =======================================
       PLANT SCOPE
    ======================================= */

    function choosePlantScope(
        scope:
            PlantScope,
    ) {
        setPlantScope(
            scope,
        );

        if (
            scope ===
                'none' ||
            scope ===
                'all-plants'
        ) {
            setPlantStoryIds(
                [],
            );
        }

        if (
            scope ===
                'single' &&
            startingPlant
        ) {
            setPlantStoryIds(
                [
                    startingPlant.id,
                ],
            );
        }
    }


    /* =======================================
       ACTIVITY OPTIONS
    ======================================= */

    const activityOptions: {
        value: EventType;
        label: string;
        icon: string;
    }[] = [
        {
            value:
                'observation',

            label:
                'Observed',

            icon:
                '👀',
        },
        {
            value:
                'watered',

            label:
                'Watered',

            icon:
                '💧',
        },
        {
            value:
                'fed',

            label:
                'Fertilised',

            icon:
                '🌿',
        },
        {
            value:
                'sprouted',

            label:
                'Sprouted',

            icon:
                '🌱',
        },
        {
            value:
                'pruned',

            label:
                'Pruned',

            icon:
                '✂️',
        },
        {
            value:
                'treated',

            label:
                'Treated',

            icon:
                '🩹',
        },
        {
            value:
                'moved',

            label:
                'Moved',

            icon:
                '🪴',
        },
        {
            value:
                'transplanted',

            label:
                'Transplanted',

            icon:
                '🌱',
        },
        {
            value:
                'hilled',

            label:
                'Hilled',

            icon:
                '🥔',
        },
        {
            value:
                'weather',

            label:
                'Weather',

            icon:
                '🌦️',
        },
        {
            value:
                'photo',

            label:
                'Photographed',

            icon:
                '📷',
        },
        {
            value:
                'note',

            label:
                'Made a note',

            icon:
                '📖',
        },
    ];


    /* =======================================
       TOGGLE ACTIVITY
    ======================================= */

    function toggleActivity(
        activity:
            EventType,
    ) {
        setActivityTypes(
            current => {
                if (
                    current.includes(
                        activity,
                    )
                ) {
                    return current.filter(
                        item =>
                            item !==
                            activity,
                    );
                }

                return [
                    ...current,
                    activity,
                ];
            },
        );
    }


    /* =======================================
       OPEN REAL HARVEST RECORD
    ======================================= */

    function openHarvestRecord() {
        if (
            !onAddHarvest
        ) {
            return;
        }

        /*
         * If this Journal composer was opened
         * from a Plant Story, plantStoryIds
         * already contains that Plant Story.
         *
         * From the general Journal, the current
         * relationship selection carries across.
         */
        onAddHarvest(
            [
                ...plantStoryIds,
            ],
        );
    }


    /* =======================================
       QUICK ADD GROWING SETUP
    ======================================= */

    function handleQuickAddGrowingSetup() {
        if (
            !quickGrowingSetupCategory
        ) {
            return;
        }

        const trimmedName =
            quickGrowingSetupName
                .trim();

        if (
            !trimmedName
        ) {
            return;
        }

        const existingSetup =
            growingSetups.find(
                setup =>
                    setup.category ===
                        quickGrowingSetupCategory &&
                    setup.name
                        .trim()
                        .toLowerCase() ===
                    trimmedName
                        .toLowerCase(),
            );

        const setup =
            existingSetup ??
            createQuickGrowingSetup(
                trimmedName,
                quickGrowingSetupCategory,
                today,
            );

        if (
            !existingSetup
        ) {
            onAddRecipe(
                setup,
            );
        }

        setToGrowingSetupIds(
            current =>
                current.includes(
                    setup.id,
                )
                    ? current
                    : [
                        ...current,
                        setup.id,
                    ],
        );

        setQuickGrowingSetupCategory(
            null,
        );

        setQuickGrowingSetupName(
            '',
        );
    }


    /* =======================================
       SAVE JOURNAL ENTRY
    ======================================= */

    function handleSubmit(
        formEvent:
            FormEvent<HTMLFormElement>,
    ) {
        formEvent.preventDefault();

        if (
            isSubmittingRef.current
        ) {
            return;
        }

        isSubmittingRef.current =
            true;

        setIsSubmitting(
            true,
        );

        const primaryType =
            activityTypes[0] ??
            'observation';

        const generatedTitle =
            activityOptions
                .filter(
                    option =>
                        activityTypes.includes(
                            option.value,
                        ),
                )
                .map(
                    option =>
                        option.label,
                )
                .join(
                    ', ',
                );

        const savedPhotoMetadata =
            photoUrls.map(
                (
                    photoUrl,
                    index,
                ) => {
                    const metadata =
                        photoMetadata[
                            index
                        ];

                    return {
                        ...metadata,

                        photoUrl:
                            metadata
                                ?.photoUrl ??
                            photoUrl,

                        /*
                         * If there is no separate photo
                         * date, the Journal date is the
                         * best available evidence.
                         */
                        photoDate:
                            metadata
                                ?.photoDate ??
                            date,

                        /*
                         * Observation is useful context
                         * when the Journal moment itself
                         * is an Observation.
                         *
                         * Never overwrite a purpose the
                         * gardener deliberately chose.
                         */
                        purpose:
                            metadata
                                ?.purpose ??
                            (
                                primaryType ===
                                    'observation'
                                    ? 'observation'
                                    : undefined
                            ),
                    } satisfies
                        SprigPhotoMetadata;
                },
            );

        const savedEvent:
            GardenEvent = {
                ...(
                    eventToEdit ??
                    {}
                ),

                id:
                    eventToEdit
                        ?.id ??
                    crypto
                        .randomUUID(),

                type:
                    primaryType,

                activityTypes:
                    [
                        ...activityTypes,
                    ],

                date,

                title:
                    title.trim() ||
                    generatedTitle ||
                    'Garden moment',

                productIds:
                    productIds.length >
                        0
                        ? [
                            ...productIds,
                        ]
                        : undefined,

                productUsed:
                    productUsed
                        .trim() ||
                    undefined,

                treatmentReason:
                    activityTypes.includes(
                        'treated',
                    )
                        ? treatmentReason
                            .trim() ||
                        undefined
                        : undefined,

                notes:
                    notes.trim() ||
                    undefined,

                growingPlaceScope:
                    activityTypes.includes(
                        'moved',
                    ) ||
                    activityTypes.includes(
                        'transplanted',
                    )
                        ? toGrowingPlaceId
                            ? 'single'
                            : 'none'
                        : growingPlaceScope,

                growingPlaceIds:
                    activityTypes.includes(
                        'moved',
                    ) ||
                    activityTypes.includes(
                        'transplanted',
                    )
                        ? toGrowingPlaceId
                            ? [
                                toGrowingPlaceId,
                            ]
                            : []
                        : [
                            ...growingPlaceIds,
                        ],

                growingChange:
                    activityTypes.includes(
                        'moved',
                    )
                        ? 'growing-place'
                        : activityTypes.includes(
                            'transplanted',
                        )
                            ? growingChange
                            : undefined,

                fromGrowingPlaceId:
                    activityTypes.includes(
                        'moved',
                    ) ||
                    (
                        activityTypes.includes(
                            'transplanted',
                        ) &&
                        (
                            growingChange ===
                                'growing-place' ||
                            growingChange ===
                                'both'
                        )
                    )
                        ? fromGrowingPlaceId ||
                        undefined
                        : undefined,

                toGrowingPlaceId:
                    activityTypes.includes(
                        'moved',
                    ) ||
                    (
                        activityTypes.includes(
                            'transplanted',
                        ) &&
                        (
                            growingChange ===
                                'growing-place' ||
                            growingChange ===
                                'both'
                        )
                    )
                        ? toGrowingPlaceId ||
                        undefined
                        : undefined,

                fromGrowingSetupIds:
                    activityTypes.includes(
                        'transplanted',
                    ) &&
                    (
                        growingChange ===
                            'growing-setup' ||
                        growingChange ===
                            'both'
                    )
                        ? [
                            ...fromGrowingSetupIds,
                        ]
                        : undefined,

                toGrowingSetupIds:
                    activityTypes.includes(
                        'transplanted',
                    ) &&
                    (
                        growingChange ===
                            'growing-setup' ||
                        growingChange ===
                            'both'
                    )
                        ? [
                            ...toGrowingSetupIds,
                        ]
                        : undefined,

                photoUrls:
                    [
                        ...photoUrls,
                    ],

                photoMetadata:
                    savedPhotoMetadata,

                plantScope,

                plantStoryIds:
                    [
                        ...plantStoryIds,
                    ],
            };

        try {
            if (
                isEditing
            ) {
                if (
                    !onUpdateEvent
                ) {
                    throw new Error(
                        'Edit Journal Entry requires onUpdateEvent.',
                    );
                }

                onUpdateEvent(
                    savedEvent,
                );
            }
            else {
                onAddEvent(
                    savedEvent,
                );
            }

            onClose();
        }
        catch (
            error
        ) {
            console.error(
                'Unable to save Journal entry:',
                error,
            );

            isSubmittingRef.current =
                false;

            setIsSubmitting(
                false,
            );
        }
    }


    return (
        <div
            className="form-backdrop"
            role="presentation"
        >
            <section
                className="add-plant-panel chronicle-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-event-title"
            >
                <img
                    className="chronicle-page-image"
                    src={
                        notebookEntryBackground
                    }
                    alt=""
                    aria-hidden="true"
                />


                <div className="chronicle-content">
                    <h2
                        id="add-event-title"
                        className="notebook-page-title"
                    >
                        {isEditing
                            ? 'Edit Journal Entry'
                            : isRecordingPlan
                                ? 'Record what happened'
                                : 'Journal Entry'}
                    </h2>


                    <button
                        type="button"
                        className="close-button"
                        onClick={
                            onClose
                        }
                        disabled={
                            isSubmitting
                        }
                        aria-label={
                            isEditing
                                ? 'Close Journal editor'
                                : 'Close Journal entry'
                        }
                    >
                        ×
                    </button>


                    <form
                        id="sprig-journal-entry-form"
                        className="add-plant-form journal-entry-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {isRecordingPlan &&
                            planToRecord && (
                                <section className="sprig-form-section growing-setup-details">
                                    <p className="section-label">
                                        From Garden Plan
                                    </p>

                                    <h3>
                                        {planToRecord.title}
                                    </h3>

                                    <p className="form-whisper">
                                        Sprig has carried the intention
                                        into this Journal page. Change
                                        anything that happened differently
                                        before you save it.
                                    </p>

                                    <p className="form-whisper">
                                        The Garden Plan remains the
                                        record of what you intended.
                                        This page records what actually
                                        happened.
                                    </p>
                                </section>
                            )}


                        {isEditing && (
                            <p className="form-whisper">
                                ✏ Change anything that needs
                                correcting. Sprig will update this
                                same Journal page, not create another.
                            </p>
                        )}


                        {startingPlant &&
                            !isRecordingPlan && (
                                <p className="form-whisper">
                                    🌱 Adding to{' '}
                                    {startingPlant.displayName}
                                    &apos;s story
                                </p>
                            )}


                        <div className="journal-entry-heading-row">
                            <label className="journal-title-field">
                                Give this page a title

                                <input
                                    value={
                                        title
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setTitle(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Watered the front"
                                />
                            </label>


                            <label className="journal-date-field">
                                When

                                <input
                                    type="date"
                                    value={
                                        date
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setDate(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        </div>


                        {isRecordingPlan && (
                            <p className="form-whisper">
                                This began with the planned date.
                                Change it to the date it actually
                                happened.
                            </p>
                        )}


                        <SprigPicker
                            title="What happened?"
                            options={
                                activityOptions
                            }
                            selectedValues={
                                activityTypes
                            }
                            isOpen={
                                isActivityPickerOpen
                            }
                            onToggleOpen={() =>
                                setIsActivityPickerOpen(
                                    current =>
                                        !current,
                                )
                            }
                            onToggleValue={
                                toggleActivity
                            }
                        />


                        {onAddHarvest &&
                            activityTypes.length ===
                                0 && (
                                <section className="sprig-form-section growing-setup-details">
                                    <p className="section-label">
                                        Harvest
                                    </p>

                                    <p className="form-whisper">
                                        Gathered something from the
                                        garden? Harvest has its own
                                        record so Sprig can remember
                                        quantities, quality, timing and
                                        what the plant did afterwards.
                                    </p>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={
                                            openHarvestRecord
                                        }
                                    >
                                        🧺 Record a Harvest
                                    </button>
                                </section>
                            )}


                        {(
                            activityTypes.includes(
                                'moved',
                            ) ||
                            activityTypes.includes(
                                'transplanted',
                            )
                        ) ? (
                            <section className="journal-connection-section">
                                <div className="journal-section-heading">
                                    <h5>
                                        {activityTypes.includes(
                                            'transplanted',
                                        )
                                            ? 'What changed when it was transplanted?'
                                            : 'Where was it moved?'}
                                    </h5>
                                </div>


                                {activityTypes.includes(
                                    'transplanted',
                                ) && (
                                    <>
                                        <p className="form-whisper">
                                            A transplant can change where
                                            the plant lives, what it grows
                                            in, or both. Sprig will keep
                                            the previous conditions as
                                            part of the Plant Story.
                                        </p>


                                        <div className="journal-simple-choice-row">
                                            <button
                                                type="button"
                                                className={
                                                    growingChange ===
                                                        'growing-place'
                                                        ? 'secondary-button selected'
                                                        : 'secondary-button'
                                                }
                                                onClick={() =>
                                                    setGrowingChange(
                                                        'growing-place',
                                                    )
                                                }
                                            >
                                                Growing Place
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    growingChange ===
                                                        'growing-setup'
                                                        ? 'secondary-button selected'
                                                        : 'secondary-button'
                                                }
                                                onClick={() =>
                                                    setGrowingChange(
                                                        'growing-setup',
                                                    )
                                                }
                                            >
                                                Growing Setup
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    growingChange ===
                                                        'both'
                                                        ? 'secondary-button selected'
                                                        : 'secondary-button'
                                                }
                                                onClick={() =>
                                                    setGrowingChange(
                                                        'both',
                                                    )
                                                }
                                            >
                                                Both
                                            </button>
                                        </div>
                                    </>
                                )}


                                {(
                                    activityTypes.includes(
                                        'moved',
                                    ) ||
                                    growingChange ===
                                        'growing-place' ||
                                    growingChange ===
                                        'both'
                                ) && (
                                    <div className="sprig-form-section growing-setup-details">
                                        <p className="section-label">
                                            Growing Place
                                        </p>

                                        <p className="form-whisper">
                                            <strong>From:</strong>{' '}
                                            {growingPlaces.find(
                                                place =>
                                                    place.id ===
                                                    fromGrowingPlaceId,
                                            )?.name ??
                                                'Not recorded'}
                                        </p>

                                        <SprigPicker
                                            title="To Growing Place"
                                            variant="label"
                                            emptySummary="Choose the new Growing Place"
                                            options={
                                                growingPlaces.map(
                                                    place => ({
                                                        value:
                                                            place.id,

                                                        label:
                                                            place.name,
                                                    }),
                                                )
                                            }
                                            selectedValues={
                                                toGrowingPlaceId
                                                    ? [
                                                        toGrowingPlaceId,
                                                    ]
                                                    : []
                                            }
                                            isOpen={
                                                isToGrowingPlacePickerOpen
                                            }
                                            onToggleOpen={() =>
                                                setIsToGrowingPlacePickerOpen(
                                                    current =>
                                                        !current,
                                                )
                                            }
                                            onToggleValue={
                                                id => {
                                                    setToGrowingPlaceId(
                                                        id,
                                                    );

                                                    setIsToGrowingPlacePickerOpen(
                                                        false,
                                                    );
                                                }
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                setGrowingPlaceQuickAddTarget(
                                                    'destination',
                                                )
                                            }
                                        >
                                            + Add a Growing Place
                                        </button>
                                    </div>
                                )}


                                {activityTypes.includes(
                                    'transplanted',
                                ) &&
                                    (
                                        growingChange ===
                                            'growing-setup' ||
                                        growingChange ===
                                            'both'
                                    ) && (
                                        <div className="sprig-form-section growing-setup-details">
                                            <p className="section-label">
                                                Growing Setup
                                            </p>

                                            <p className="form-whisper">
                                                <strong>From:</strong>{' '}
                                                {fromGrowingSetupIds.length >
                                                    0
                                                    ? fromGrowingSetupIds
                                                        .map(
                                                            id =>
                                                                growingSetups.find(
                                                                    setup =>
                                                                        setup.id ===
                                                                        id,
                                                                )?.name,
                                                        )
                                                        .filter(
                                                            Boolean,
                                                        )
                                                        .join(
                                                            ' · ',
                                                        ) ||
                                                    'Not recorded'
                                                    : 'Not recorded'}
                                            </p>

                                            <SprigPicker
                                                title="To Growing Setup"
                                                variant="label"
                                                emptySummary="Choose what the plant now grows in"
                                                options={
                                                    growingSetups.map(
                                                        setup => ({
                                                            value:
                                                                setup.id,

                                                            label:
                                                                setup.name,

                                                            subtitle:
                                                                getGrowingSetupCategoryLabel(
                                                                    setup.category,
                                                                ),
                                                        }),
                                                    )
                                                }
                                                selectedValues={
                                                    toGrowingSetupIds
                                                }
                                                isOpen={
                                                    isToGrowingSetupPickerOpen
                                                }
                                                onToggleOpen={() =>
                                                    setIsToGrowingSetupPickerOpen(
                                                        current =>
                                                            !current,
                                                    )
                                                }
                                                onToggleValue={
                                                    id =>
                                                        setToGrowingSetupIds(
                                                            current =>
                                                                current.includes(
                                                                    id,
                                                                )
                                                                    ? current.filter(
                                                                        item =>
                                                                            item !==
                                                                            id,
                                                                    )
                                                                    : [
                                                                        ...current,
                                                                        id,
                                                                    ],
                                                        )
                                                }
                                            />

                                            {!quickGrowingSetupCategory ? (
                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={() =>
                                                        setQuickGrowingSetupCategory(
                                                            'own-mix',
                                                        )
                                                    }
                                                >
                                                    + Add what it grows in
                                                </button>
                                            ) : (
                                                <div className="plant-growing-quick-create">
                                                    <p className="section-label">
                                                        Add what it grows in
                                                    </p>

                                                    <p className="form-whisper">
                                                        Choose the kind of Growing record first.
                                                        Sprig will save it in the correct category
                                                        and select it for this transplant.
                                                    </p>

                                                    <div className="journal-simple-choice-row">
                                                        {([
                                                            'own-mix',
                                                            'bought-mix',
                                                            'growing-system',
                                                            'ground-type',
                                                        ] as GrowingSetupCategory[]).map(
                                                            category => (
                                                                <button
                                                                    key={
                                                                        category
                                                                    }
                                                                    type="button"
                                                                    className={
                                                                        quickGrowingSetupCategory ===
                                                                            category
                                                                            ? 'secondary-button selected'
                                                                            : 'secondary-button'
                                                                    }
                                                                    onClick={() =>
                                                                        setQuickGrowingSetupCategory(
                                                                            category,
                                                                        )
                                                                    }
                                                                >
                                                                    {getGrowingSetupCategoryLabel(
                                                                        category,
                                                                    )}
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>

                                                    <label>
                                                        {getGrowingSetupCategoryLabel(
                                                            quickGrowingSetupCategory,
                                                        )}{' '}
                                                        name

                                                        <input
                                                            type="text"
                                                            value={
                                                                quickGrowingSetupName
                                                            }
                                                            onChange={
                                                                event =>
                                                                    setQuickGrowingSetupName(
                                                                        event.target.value,
                                                                    )
                                                            }
                                                            placeholder="Name this Growing record"
                                                            onKeyDown={
                                                                event => {
                                                                    if (
                                                                        event.key ===
                                                                        'Enter'
                                                                    ) {
                                                                        event.preventDefault();

                                                                        handleQuickAddGrowingSetup();
                                                                    }
                                                                }
                                                            }
                                                            autoFocus
                                                        />
                                                    </label>

                                                    <p className="form-whisper">
                                                        This creates a real Growing record.
                                                        You can add its fuller recipe, purchase,
                                                        component or system details later from Growing.
                                                    </p>

                                                    <div className="plant-growing-quick-actions">
                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={() => {
                                                                setQuickGrowingSetupCategory(
                                                                    null,
                                                                );

                                                                setQuickGrowingSetupName(
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="enter-button"
                                                            disabled={
                                                                !quickGrowingSetupName
                                                                    .trim()
                                                            }
                                                            onClick={
                                                                handleQuickAddGrowingSetup
                                                            }
                                                        >
                                                            Add and select
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </section>
                        ) : (
                            <section className="journal-connection-section">
                                <div className="journal-section-heading">
                                    <h5>
                                        Where did this happen?
                                    </h5>
                                </div>

                                <p className="form-whisper">
                                    Location is context for this
                                    Moment. Leave it alone when the
                                    place does not matter.
                                </p>

                                <label>
                                    Location scope

                                    <select
                                        value={
                                            growingPlaceScope
                                        }
                                        onChange={
                                            event => {
                                                const nextScope =
                                                    event.target
                                                        .value as
                                                        GrowingPlaceScope;

                                                chooseGrowingPlaceScope(
                                                    nextScope,
                                                );
                                            }
                                        }
                                    >
                                        <option value="none">
                                            No particular place
                                        </option>

                                        <option value="single">
                                            One Growing Place
                                        </option>

                                        <option value="multiple">
                                            Several Growing Places
                                        </option>

                                        <option value="entire-garden">
                                            Whole garden
                                        </option>
                                    </select>
                                </label>


                                {(
                                    growingPlaceScope ===
                                        'single' ||
                                    growingPlaceScope ===
                                        'multiple'
                                ) && (
                                    <SprigPicker
                                        title="Choose Growing Place"
                                        emptySummary="Choose a Growing Place"
                                        options={
                                            growingPlaces.map(
                                                place => ({
                                                    value:
                                                        place.id,

                                                    label:
                                                        place.name,
                                                }),
                                            )
                                        }
                                        selectedValues={
                                            growingPlaceIds
                                        }
                                        isOpen={
                                            isGrowingPlacePickerOpen
                                        }
                                        onToggleOpen={() =>
                                            setIsGrowingPlacePickerOpen(
                                                current =>
                                                    !current,
                                            )
                                        }
                                        onToggleValue={(
                                            id,
                                        ) => {
                                            if (
                                                growingPlaceScope ===
                                                'single'
                                            ) {
                                                setGrowingPlaceIds(
                                                    [
                                                        id,
                                                    ],
                                                );

                                                setIsGrowingPlacePickerOpen(
                                                    false,
                                                );

                                                return;
                                            }

                                            setGrowingPlaceIds(
                                                current =>
                                                    current.includes(
                                                        id,
                                                    )
                                                        ? current.filter(
                                                            item =>
                                                                item !==
                                                                id,
                                                        )
                                                        : [
                                                            ...current,
                                                            id,
                                                        ],
                                            );
                                        }}
                                    />
                                )}


                                {(
                                    growingPlaceScope ===
                                        'single' ||
                                    growingPlaceScope ===
                                        'multiple'
                                ) && (
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() =>
                                            setGrowingPlaceQuickAddTarget(
                                                'context',
                                            )
                                        }
                                    >
                                        + Add a Growing Place
                                    </button>
                                )}
                            </section>
                        )}


                        {(
                            !startingPlant ||
                            isEditing ||
                            isRecordingPlan
                        ) && (
                            <section className="journal-connection-section">
                                <div className="journal-section-heading">
                                    <h5>
                                        Which plants were involved?
                                    </h5>
                                </div>


                                <div className="scope-card-grid plant-scope-grid">
                                    <SelectionCard
                                        title="One Plant"
                                        icon="🌱"
                                        isSelected={
                                            plantScope ===
                                            'single'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'single',
                                            )
                                        }
                                    />


                                    <SelectionCard
                                        title="Several Plants"
                                        icon="🌿"
                                        isSelected={
                                            plantScope ===
                                            'multiple'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'multiple',
                                            )
                                        }
                                    />


                                    <SelectionCard
                                        title="All Plants"
                                        icon="🌳"
                                        isSelected={
                                            plantScope ===
                                            'all-plants'
                                        }
                                        onClick={() =>
                                            choosePlantScope(
                                                'all-plants',
                                            )
                                        }
                                    />
                                </div>


                                {(
                                    plantScope ===
                                        'single' ||
                                    plantScope ===
                                        'multiple'
                                ) && (
                                    <SprigPicker
                                        title="Choose Plant"
                                        variant="label"
                                        emptySummary="Choose a Plant"
                                        options={
                                            sortedAvailablePlants.map(
                                                plant => {
                                                    const growingPlace =
                                                        growingPlaces.find(
                                                            place =>
                                                                place.id ===
                                                                plant
                                                                    .currentGrowingPlaceId,
                                                        );

                                                    return {
                                                        value:
                                                            plant.id,

                                                        label:
                                                            plant.displayName,

                                                        subtitle:
                                                            growingPlace
                                                                ? growingPlace.name
                                                                : 'No Growing Place',

                                                        meta:
                                                            plant.plantedDate
                                                                ? `Planted ${new Date(
                                                                    `${plant.plantedDate}T00:00:00`,
                                                                ).toLocaleDateString(
                                                                    'en-AU',
                                                                    {
                                                                        day:
                                                                            'numeric',

                                                                        month:
                                                                            'short',

                                                                        year:
                                                                            'numeric',
                                                                    },
                                                                )}`
                                                                : undefined,
                                                    };
                                                },
                                            )
                                        }
                                        selectedValues={
                                            plantStoryIds
                                        }
                                        isOpen={
                                            isPlantPickerOpen
                                        }
                                        onToggleOpen={() =>
                                            setIsPlantPickerOpen(
                                                current =>
                                                    !current,
                                            )
                                        }
                                        onToggleValue={(
                                            id,
                                        ) => {
                                            if (
                                                plantScope ===
                                                'single'
                                            ) {
                                                setPlantStoryIds(
                                                    [
                                                        id,
                                                    ],
                                                );

                                                setIsPlantPickerOpen(
                                                    false,
                                                );

                                                return;
                                            }

                                            setPlantStoryIds(
                                                current =>
                                                    current.includes(
                                                        id,
                                                    )
                                                        ? current.filter(
                                                            item =>
                                                                item !==
                                                                id,
                                                        )
                                                        : [
                                                            ...current,
                                                            id,
                                                        ],
                                            );
                                        }}
                                    />
                                )}
                            </section>
                        )}


                        {activityTypes.includes(
                            'treated',
                        ) && (
                            <section className="sprig-form-section growing-setup-details">
                                <p className="section-label">
                                    Treatment context
                                </p>

                                <label>
                                    What were you treating, or why?

                                    <textarea
                                        rows={
                                            3
                                        }
                                        value={
                                            treatmentReason
                                        }
                                        onChange={
                                            event =>
                                                setTreatmentReason(
                                                    event.target.value,
                                                )
                                        }
                                        placeholder="Aphids on new growth, powdery mildew, preventative treatment..."
                                    />
                                </label>

                                <p className="form-whisper">
                                    Keep this in your own words.
                                    Products used for the treatment
                                    are linked below.
                                </p>
                            </section>
                        )}


                        <section className="journal-connection-section">
                            <div className="journal-section-heading">
                                <h5>
                                    What did you use?
                                </h5>
                            </div>


                            <p className="form-whisper">
                                Choose any Products Sprig already
                                knows. You can choose more than one.
                            </p>


                            {availableProducts.length >
                                0 ? (
                                <SprigPicker
                                    title="Choose Product"
                                    variant="label"
                                    emptySummary="Choose saved Products"
                                    options={
                                        availableProducts.map(
                                            product => {
                                                const category =
                                                    getProductCategoryLabel(
                                                        product,
                                                    );

                                                return {
                                                    value:
                                                        product.id,

                                                    label:
                                                        product.name,

                                                    subtitle:
                                                        product.brand
                                                            ?.trim() ||
                                                        category,

                                                    meta:
                                                        product.brand
                                                            ?.trim() &&
                                                        category
                                                            ? category
                                                            : undefined,
                                                };
                                            },
                                        )
                                    }
                                    selectedValues={
                                        productIds
                                    }
                                    isOpen={
                                        isProductPickerOpen
                                    }
                                    onToggleOpen={() =>
                                        setIsProductPickerOpen(
                                            current =>
                                                !current,
                                        )
                                    }
                                    onToggleValue={(
                                        id,
                                    ) =>
                                        setProductIds(
                                            current =>
                                                current.includes(
                                                    id,
                                                )
                                                    ? current.filter(
                                                        item =>
                                                            item !==
                                                            id,
                                                    )
                                                    : [
                                                        ...current,
                                                        id,
                                                    ],
                                        )
                                    }
                                />
                            ) : (
                                <p className="form-whisper">
                                    Sprig does not have any saved
                                    Products yet. That is fine. You
                                    can still record what you used
                                    below.
                                </p>
                            )}


                            <label>
                                Something else you used

                                <input
                                    value={
                                        productUsed
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setProductUsed(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Anything that is not a saved Product..."
                                />
                            </label>


                            <p className="form-whisper">
                                This stays as your own wording.
                                Sprig will not quietly turn an old
                                free-text entry into a Product
                                relationship.
                            </p>
                        </section>


                        <label>
                            Notes to the story

                            <textarea
                                rows={
                                    5
                                }
                                value={
                                    notes
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setNotes(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="What would future you like to remember?"
                            />
                        </label>


                        {isRecordingPlan &&
                            planToRecord
                                ?.notes && (
                                <p className="form-whisper">
                                    Your Plan note was carried across
                                    as a starting point. Rewrite it
                                    if reality needs different wording.
                                </p>
                            )}


                        <SprigPhotoPicker
                            photoUrls={
                                photoUrls
                            }
                            onChange={
                                setPhotoUrls
                            }
                            photoMetadata={
                                photoMetadata
                            }
                            onPhotoMetadataChange={
                                setPhotoMetadata
                            }
                            showPhotoContext
                            defaultNewPhotosToToday
                            title="Photographs"
                            helperText="Add the photographs from this moment. Sprig already knows the Journal page, its plants, Growing Place and date. Everything extra below is optional."
                            addButtonText="Add journal photographs"
                            photoAltPrefix="Journal photograph"
                            photoDateLabel="When was this photograph taken?"
                            photoDateHelperText="New photographs begin with today. Change the date when the photograph was taken earlier."
                            maxPhotos={
                                12
                            }
                        />


                        {isRecordingPlan && (
                            <section className="sprig-form-section growing-setup-details">
                                <p className="section-label">
                                    Plan and reality
                                </p>

                                <p className="form-whisper">
                                    Saving this page creates a real
                                    Journal record. Sprig will then
                                    link it back to the Garden Plan
                                    rather than replacing the Plan.
                                </p>
                            </section>
                        )}


                        <div className="chronicle-page-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    isSubmitting
                                }
                            >
                                Leave it for now
                            </button>


                            <button
                                type="submit"
                                className="enter-button"
                                disabled={
                                    isSubmitting
                                }
                                aria-disabled={
                                    isSubmitting
                                }
                            >
                                {isSubmitting
                                    ? isEditing
                                        ? 'Saving changes…'
                                        : 'Adding this page…'
                                    : isEditing
                                        ? 'Save changes'
                                        : isRecordingPlan
                                            ? 'Record this moment'
                                            : 'Add this page'}
                            </button>
                        </div>

                    </form>
                </div>
            </section>


            {growingPlaceQuickAddTarget && (
                <AddGrowingPlaceForm
                    onAddPlace={
                        place => {
                            onAddGrowingPlace(
                                place,
                            );

                            if (
                                growingPlaceQuickAddTarget ===
                                'destination'
                            ) {
                                setToGrowingPlaceId(
                                    place.id,
                                );
                            }
                            else {
                                setGrowingPlaceIds(
                                    current =>
                                        growingPlaceScope ===
                                            'multiple'
                                            ? Array.from(
                                                new Set([
                                                    ...current,
                                                    place.id,
                                                ]),
                                            )
                                            : [
                                                place.id,
                                            ],
                                );

                                if (
                                    growingPlaceScope !==
                                    'multiple'
                                ) {
                                    setGrowingPlaceScope(
                                        'single',
                                    );
                                }
                            }

                            setGrowingPlaceQuickAddTarget(
                                null,
                            );
                        }
                    }
                    onClose={() =>
                        setGrowingPlaceQuickAddTarget(
                            null,
                        )
                    }
                />
            )}
        </div>
    );
}