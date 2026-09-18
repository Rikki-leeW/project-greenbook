import {
    useState,
} from 'react';
import { BackToTop } from '../components/layout/GardenPage';
import DetailPageTemplate from '../components/templates/DetailPageTemplate'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import { escapeRtf, downloadBlob, printDocument } from '../utils/exportUtils';

import type {
    GardenEvent,
    GardenProduct,
    GrowingPlace,
    PlantStory,
} from '../types';

import type {
    AppPage,
} from '../types/navigation';


type DurationUnit =
    | 'days'
    | 'weeks'
    | 'months';


interface JournalEntryDetailProps {
    event: GardenEvent;

    plants: PlantStory[];

    growingPlaces: GrowingPlace[];

    products: GardenProduct[];

    journeyBackLabel: string | null;

    onBack: () => void;

    onOpenJournal: () => void;

    onEdit: () => void;

    onDelete: (
        eventId: string,
    ) => void;

    onOpenPlant: (
        plantId: string,
    ) => void;

    onOpenGrowingPlace: (
        growingPlaceId: string,
    ) => void;

    onOpenProduct: (
        productId: string,
    ) => void;

    onNavigate: (
        page: AppPage,
    ) => void;
}


/* =======================================
   DATES AND PLANT AGE
======================================= */

function formatDate(
    value: string,
): string {
    const date =
        new Date(
            `${value.slice(
                0,
                10,
            )}T00:00:00`,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return 'Date not recorded';
    }

    return date.toLocaleDateString(
        'en-AU',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    );
}


function getAgeDays(
    plant: PlantStory,
    date: string,
): number | undefined {
    const start =
        new Date(
            `${plant.plantedDate.slice(
                0,
                10,
            )}T00:00:00`,
        );

    const end =
        new Date(
            `${date.slice(
                0,
                10,
            )}T00:00:00`,
        );

    const days =
        Math.round(
            (
                end.getTime() -
                start.getTime()
            ) /
            86400000,
        );

    return Number.isFinite(
        days,
    )
        ? days
        : undefined;
}


function formatAge(
    plant: PlantStory,
    date: string,
    unit: DurationUnit,
): string {
    const days =
        getAgeDays(
            plant,
            date,
        );

    if (
        days ===
        undefined
    ) {
        return 'Age not available';
    }

    const divisor =
        unit ===
        'days'
            ? 1
            : unit ===
              'weeks'
              ? 7
              : 30.4375;

    const amount =
        unit ===
        'days'
            ? Math.abs(
                days,
            )
            : Math.round(
                (
                    Math.abs(
                        days,
                    ) /
                    divisor
                ) *
                10,
            ) /
            10;

    const label =
        unit ===
        'days'
            ? 'day'
            : unit ===
              'weeks'
              ? 'week'
              : 'month';

    const duration =
        `${amount} ${label}${
            amount ===
            1
                ? ''
                : 's'
        }`;

    return days <
        0
        ? `${duration} before story began`
        : `Age ${duration}`;
}


/* =======================================
   EVENT LABELS
======================================= */

function getEventLabel(
    type: GardenEvent['type'],
): string {
    switch (
        type
    ) {
        case 'planted':
            return 'Planted';

        case 'sprouted':
            return 'Sprouted';

        case 'watered':
            return 'Watered';

        case 'fed':
            return 'Fertilised';

        case 'moved':
            return 'Moved';

        case 'transplanted':
            return 'Transplanted';

        case 'hilled':
            return 'Hilled';

        case 'pruned':
            return 'Pruned';

        case 'treated':
            return 'Treated';

        case 'weather':
            return 'Weather';

        case 'observation':
            return 'Observed';

        case 'photo':
            return 'Photographed';

        case 'harvest':
            return 'Harvested';

        case 'note':
            return 'Made a note';

        default:
            return 'Garden moment';
    }
}


function getEventEmoji(
    type: GardenEvent['type'],
): string {
    switch (
        type
    ) {
        case 'planted':
            return '🌱';

        case 'sprouted':
            return '🌿';

        case 'watered':
            return '💧';

        case 'fed':
            return '🧪';

        case 'moved':
            return '🪴';

        case 'transplanted':
            return '🌱';

        case 'hilled':
            return '🥔';

        case 'pruned':
            return '✂️';

        case 'treated':
            return '🩹';

        case 'weather':
            return '🌦️';

        case 'observation':
            return '👀';

        case 'photo':
            return '📷';

        case 'harvest':
            return '🧺';

        case 'note':
            return '📖';

        default:
            return '📝';
    }
}


/* =======================================
   TRANSPLANT / MOVE LABELS
======================================= */

function getTransplantKindLabel(
    event: GardenEvent,
): string | undefined {
    switch (
        event.transplantKind
    ) {
        case 'potted-up':
            return 'Potted up / changed container';

        case 'container-to-ground':
            return 'Container → ground / garden bed';

        case 'ground-to-container':
            return 'Ground / garden bed → container';

        case 'place-to-place':
            return 'Changed growing place';

        case 'other':
            return event
                .customTransplantLabel
                ?.trim() ||
                'Other transplant';

        default:
            return undefined;
    }
}


function hasMoveOrTransplant(
    event: GardenEvent,
): boolean {
    const activityTypes =
        event.activityTypes?.length
            ? event.activityTypes
            : [
                event.type,
            ];

    return activityTypes.includes(
        'moved',
    ) ||
        activityTypes.includes(
            'transplanted',
        );
}


function hasTransplant(
    event: GardenEvent,
): boolean {
    const activityTypes =
        event.activityTypes?.length
            ? event.activityTypes
            : [
                event.type,
            ];

    return activityTypes.includes(
        'transplanted',
    );
}


/* =======================================
   EXPORT HELPERS
======================================= */

function makeSafeFileName(
    value: string,
): string {
    return value
        .trim()
        .replace(
            /[<>:"/\\|?*\u0000-\u001F]/g,
            '',
        )
        .replace(
            /\s+/g,
            '-',
        )
        .replace(
            /-+/g,
            '-',
        )
        .replace(
            /^-|-$/g,
            '',
        ) ||
        'garden-journal-entry';
}







/* =======================================
   JOURNAL ENTRY DETAIL
======================================= */

export default function JournalEntryDetail({
    event,
    plants,
    growingPlaces,
    products,
    journeyBackLabel,
    onBack,
    onOpenJournal,
    onEdit,
    onDelete,
    onOpenPlant,
    onOpenGrowingPlace,
    onOpenProduct,
    onNavigate,
}: JournalEntryDetailProps) {
    const [
        durationUnit,
        setDurationUnit,
    ] =
        useState<DurationUnit>(
            'weeks',
        );

    const units:
        DurationUnit[] = [
            'days',
            'weeks',
            'months',
        ];


    /*
     * Only explicit saved relationships
     * determine individual ages.
     *
     * Today's plant collection is not a
     * historical list of all plants.
     */
    const linkedPlants =
        plants.filter(
            plant =>
                event.plantStoryIds.includes(
                    plant.id,
                ),
        );


    const linkedGrowingPlaces =
        growingPlaces.filter(
            place =>
                event.growingPlaceIds?.includes(
                    place.id,
                ),
        );


    const linkedProducts =
        products.filter(
            product =>
                event.productIds?.includes(
                    product.id,
                ),
        );


    const activityTypes =
        event.activityTypes?.length
            ? event.activityTypes
            : [
                event.type,
              ];


    const isIndividualPlantEntry =
        event.plantScope !==
            'all-plants' &&
        event.plantScope !==
            'category';


    const isGrowingChange =
        hasMoveOrTransplant(
            event,
        );


    const isTransplant =
        hasTransplant(
            event,
        );


    const transplantKindLabel =
        getTransplantKindLabel(
            event,
        );


    const growingTransitions =
        event
            .plantGrowingTransitions
            ?.length
            ? event
                .plantGrowingTransitions
            : event
                .plantStoryIds
                .length ===
                1 &&
              (
                  event.fromGrowingPlaceId ||
                  event.toGrowingPlaceId ||
                  event.fromGrowingSetupIds
                      ?.length ||
                  event.toGrowingSetupIds
                      ?.length
              )
              ? [
                    {
                        plantStoryId:
                            event
                                .plantStoryIds[
                                0
                            ],

                        fromGrowingPlaceId:
                            event
                                .fromGrowingPlaceId,

                        toGrowingPlaceId:
                            event
                                .toGrowingPlaceId,

                        fromGrowingSetupIds:
                            event
                                .fromGrowingSetupIds,

                        toGrowingSetupIds:
                            event
                                .toGrowingSetupIds,
                    },
                ]
              : [];


    function getPlantById(
        plantId: string,
    ): PlantStory | undefined {
        return plants.find(
            plant =>
                plant.id ===
                plantId,
        );
    }


    function getGrowingPlaceById(
        growingPlaceId?: string,
    ): GrowingPlace | undefined {
        if (
            !growingPlaceId
        ) {
            return undefined;
        }

        return growingPlaces.find(
            place =>
                place.id ===
                growingPlaceId,
        );
    }


    function didSetupChange(
        fromIds?: string[],
        toIds?: string[],
    ): boolean {
        const from =
            Array.from(
                new Set(
                    fromIds ??
                    [],
                ),
            );

        const to =
            Array.from(
                new Set(
                    toIds ??
                    [],
                ),
            );

        return from.length !==
            to.length ||
            from.some(
                id =>
                    !to.includes(
                        id,
                    ),
            );
    }


    const photoContexts =
        (
            event.photoUrls ??
            []
        ).map(
            (
                photoUrl,
                index,
            ) => {
                const metadata =
                    event.photoMetadata?.[
                        index
                    ] ??
                    event.photoMetadata?.find(
                        item =>
                            item?.photoUrl ===
                            photoUrl,
                    );


                const date =
                    metadata?.photoDate ||
                    event.date;


                const details = [
                    formatDate(
                        date,
                    ),
                ];


                if (
                    metadata?.photoTime
                ) {
                    details.push(
                        metadata.photoTime,
                    );
                }


                if (
                    metadata?.notes
                ) {
                    details.push(
                        metadata.notes,
                    );
                }


                if (
                    metadata?.tags?.length
                ) {
                    details.push(
                        metadata.tags
                            .map(
                                tag =>
                                    `#${tag.replace(
                                        /^#+/,
                                        '',
                                    )}`,
                            )
                            .join(
                                ' ',
                            ),
                    );
                }


                let age:
                    | {
                        days: number;
                      }
                    | undefined;


                if (
                    linkedPlants.length ===
                        1 &&
                    isIndividualPlantEntry
                ) {
                    const days =
                        getAgeDays(
                            linkedPlants[0],
                            date,
                        );


                    if (
                        days !==
                            undefined &&
                        days >=
                            0
                    ) {
                        age = {
                            days,
                        };
                    } else {
                        details.push(
                            formatAge(
                                linkedPlants[0],
                                date,
                                durationUnit,
                            ),
                        );
                    }
                } else {
                    linkedPlants.forEach(
                        plant => {
                            details.push(
                                `${plant.displayName}: ${formatAge(
                                    plant,
                                    date,
                                    durationUnit,
                                )}`,
                            );
                        },
                    );
                }


                return {
                    heading:
                        metadata?.title ||
                        event.title,

                    detail:
                        details.join(
                            ' · ',
                        ),

                    age,
                };
            },
        );


    function deleteJournalEntry() {
        if (
            window.confirm(
                `Delete "${event.title}" from the Garden Journal?\n\nThis removes this Journal page. It does not delete the Plant Stories or Growing Places mentioned by it.\n\nThis cannot be undone.`,
            )
        ) {
            onDelete(
                event.id,
            );
        }
    }


    function exportPdf() {
        printDocument();
    }


    function exportRtf() {
        const activityText =
            activityTypes
                .map(
                    getEventLabel,
                )
                .join(
                    ', ',
                );


        const plantText =
            event.plantScope ===
            'all-plants'
                ? 'All Plants'
                : event.plantScope ===
                  'category'
                  ? (
                      event.plantCategory ||
                      'Plant category'
                    )
                  : linkedPlants.length >
                    0
                    ? linkedPlants
                        .map(
                            plant =>
                                `${plant.displayName} (${formatAge(
                                    plant,
                                    event.date,
                                    durationUnit,
                                )})`,
                        )
                        .join(
                            ', ',
                        )
                    : 'Wider garden';


        const placeText =
            event.growingPlaceScope ===
            'entire-garden'
                ? 'The whole garden'
                : linkedGrowingPlaces.length >
                    0
                    ? linkedGrowingPlaces
                        .map(
                            place =>
                                place.name,
                        )
                        .join(
                            ', ',
                        )
                    : 'No particular Growing Place recorded';


        const productParts:
            string[] = [];


        if (
            linkedProducts.length >
            0
        ) {
            productParts.push(
                linkedProducts
                    .map(
                        product =>
                            product.brand
                                ? `${product.name} · ${product.brand}`
                                : product.name,
                    )
                    .join(
                        ', ',
                    ),
            );
        }


        if (
            event.productUsed
        ) {
            productParts.push(
                event.productUsed,
            );
        }


        const transitionParts =
            growingTransitions.map(
                transition => {
                    const plant =
                        getPlantById(
                            transition
                                .plantStoryId,
                        );

                    const fromPlace =
                        getGrowingPlaceById(
                            transition
                                .fromGrowingPlaceId,
                        );

                    const toPlace =
                        getGrowingPlaceById(
                            transition
                                .toGrowingPlaceId,
                        );

                    const parts:
                        string[] = [
                            plant
                                ?.displayName ||
                                'Plant Story',
                        ];


                    if (
                        fromPlace ||
                        toPlace
                    ) {
                        parts.push(
                            `${
                                fromPlace
                                    ?.name ||
                                'Previous place not recorded'
                            } -> ${
                                toPlace
                                    ?.name ||
                                'New place not recorded'
                            }`,
                        );
                    }


                    if (
                        didSetupChange(
                            transition
                                .fromGrowingSetupIds,
                            transition
                                .toGrowingSetupIds,
                        )
                    ) {
                        parts.push(
                            'Growing Setup changed',
                        );
                    }


                    return parts.join(
                        ': ',
                    );
                },
            );


        const paragraphs = [
            `\\b ${escapeRtf(
                event.title,
            )}\\b0`,
            escapeRtf(
                formatDate(
                    event.date,
                ),
            ),
            '',
            `\\b What happened\\b0\\line ${escapeRtf(
                activityText,
            )}`,
            '',
            `\\b Plant Stories\\b0\\line ${escapeRtf(
                plantText,
            )}`,
            '',
            `\\b Growing Places\\b0\\line ${escapeRtf(
                placeText,
            )}`,
        ];


        if (
            isGrowingChange
        ) {
            const growingChangeParts:
                string[] = [];


            if (
                transplantKindLabel
            ) {
                growingChangeParts.push(
                    transplantKindLabel,
                );
            }


            if (
                transitionParts.length >
                0
            ) {
                growingChangeParts.push(
                    ...transitionParts,
                );
            }


            if (
                growingChangeParts.length >
                0
            ) {
                paragraphs.push(
                    '',
                    `\\b Growing change\\b0\\line ${escapeRtf(
                        growingChangeParts.join(
                            '\n',
                        ),
                    )}`,
                );
            }
        }


        if (
            event.treatmentReason
        ) {
            paragraphs.push(
                '',
                `\\b Treatment reason\\b0\\line ${escapeRtf(
                    event
                        .treatmentReason,
                )}`,
            );
        }


        if (
            productParts.length >
            0
        ) {
            paragraphs.push(
                '',
                `\\b Garden provisions\\b0\\line ${escapeRtf(
                    productParts.join(
                        ' · ',
                    ),
                )}`,
            );
        }


        paragraphs.push(
            '',
            `\\b Notes\\b0\\line ${escapeRtf(
                event.notes ||
                    'No extra notes were added to this page.',
            )}`,
        );


        const rtf =
            `{\\rtf1\\ansi\\deff0` +
            `{\\fonttbl{\\f0 Georgia;}}` +
            `\\fs24\\f0 ` +
            paragraphs.join(
                '\\par ',
            ) +
            `}`;


        downloadBlob(
            `${makeSafeFileName(
                event.title,
            )}.rtf`,
            new Blob(
                [
                    rtf,
                ],
                {
                    type:
                        'application/rtf',
                },
            ),
        );
    }





    return (
        <DetailPageTemplate activePage="journal" onNavigate={onNavigate} className="journal-page journal-entry-detail-page" as="div" pageId="journal-detail-top"
      eyebrow={<>{getEventEmoji(
                                event.type,
                            )}{' '}
                            Journal page</>}
      title={<>{
                                event.title
                            }</>}
      intro={<><time
                                dateTime={
                                    event.date
                                }
                            >
                                {formatDate(
                                    event.date,
                                )}
                            </time>


                            {linkedPlants.length ===
                                1 &&
                                isIndividualPlantEntry && (
                                    <>
                                        {' · '}

                                        {formatAge(
                                            linkedPlants[0],
                                            event.date,
                                            durationUnit,
                                        )}
                                    </>
                                )}</>}
      journeyBackLabel={journeyBackLabel ? `Back to ${journeyBackLabel}` : null}
      onJourneyBack={onBack}
      homeLabel="Journal"
      onHome={onOpenJournal}
      navigationAriaLabel="Journal record navigation"
    >





                


                {linkedPlants.length >
                    0 && (
                    <div className="journal-age-control">
                        <span className="journal-age-control-label">
                            Show plant age at this
                            moment in
                        </span>


                        <div
                            className="journal-age-picker"
                            role="group"
                            aria-label="Plant age display"
                        >
                            {units.map(
                                unit => (
                                    <button
                                        key={
                                            unit
                                        }
                                        type="button"
                                        aria-pressed={
                                            durationUnit ===
                                            unit
                                        }
                                        onClick={() =>
                                            setDurationUnit(
                                                unit,
                                            )
                                        }
                                    >
                                        {unit
                                            .charAt(
                                                0,
                                            )
                                            .toUpperCase() +
                                            unit.slice(
                                                1,
                                            )}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                )}


                <section
                    className="plant-record-actions"
                    aria-label="Journal Entry actions"
                    style={{
                        marginBottom:
                            '24px',
                    }}
                >
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            onEdit
                        }
                    >
                        ✏ Edit Journal Entry
                    </button>


                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            deleteJournalEntry
                        }
                    >
                        🗑 Delete Journal Entry
                    </button>


                    <div className="journal-export-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                exportPdf
                            }
                        >
                            PDF
                        </button>


                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                exportRtf
                            }
                        >
                            RTF
                        </button>
                    </div>
                </section>


                <section className="library-grid">
                    <article className="library-book">
                        <p className="section-label">
                            What happened
                        </p>

                        <h2>
                            Garden moment
                        </h2>


                        <div className="sprig-ingredient-list">
                            {activityTypes.map(
                                activity => (
                                    <span
                                        key={
                                            activity
                                        }
                                        className="sprig-ingredient-chip"
                                    >
                                        {getEventEmoji(
                                            activity,
                                        )}{' '}

                                        {getEventLabel(
                                            activity,
                                        )}
                                    </span>
                                ),
                            )}
                        </div>
                    </article>


                    <article className="library-book">
                        <p className="section-label">
                            Plant Stories
                        </p>

                        <h2>
                            Which plants were involved
                        </h2>


                        {event.plantScope ===
                            'all-plants' && (
                            <p>
                                🌳 All Plants
                            </p>
                        )}


                        {event.plantScope ===
                            'category' && (
                            <p>
                                {event.plantCategory ||
                                    'A plant category'}
                            </p>
                        )}


                        {linkedPlants.length >
                        0 ? (
                            <ul className="journal-linked-plant-list">
                                {linkedPlants.map(
                                    plant => (
                                        <li
                                            key={
                                                plant.id
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() =>
                                                    onOpenPlant(
                                                        plant.id,
                                                    )
                                                }
                                            >
                                                🌱{' '}
                                                {plant.displayName}

                                                {plant.variety &&
                                                    plant.variety !==
                                                        plant.displayName && (
                                                        <>
                                                            {' · '}
                                                            {
                                                                plant.variety
                                                            }
                                                        </>
                                                    )}
                                            </button>


                                            <span className="journal-linked-plant-age">
                                                {formatAge(
                                                    plant,
                                                    event.date,
                                                    durationUnit,
                                                )}

                                                {
                                                    ' at this moment'
                                                }
                                            </span>
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            event.plantScope !==
                                'all-plants' &&
                            event.plantScope !==
                                'category' && (
                                <p>
                                    This page belongs
                                    to the wider garden
                                    rather than one
                                    particular Plant
                                    Story.
                                </p>
                            )
                        )}
                    </article>


                    <article className="library-book">
                        <p className="section-label">
                            Growing Places
                        </p>

                        <h2>
                            Where this story unfolded
                        </h2>


                        {event.growingPlaceScope ===
                        'entire-garden' ? (
                            <p>
                                🌳 The whole garden
                            </p>
                        ) : linkedGrowingPlaces.length >
                          0 ? (
                            <ul className="journal-linked-place-list">
                                {linkedGrowingPlaces.map(
                                    place => (
                                        <li
                                            key={
                                                place.id
                                            }
                                        >
                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() =>
                                                    onOpenGrowingPlace(
                                                        place.id,
                                                    )
                                                }
                                            >
                                                🌿{' '}
                                                {
                                                    place.name
                                                }
                                            </button>
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            <p>
                                No particular Growing
                                Place was recorded for
                                this page.
                            </p>
                        )}
                    </article>


                    {isGrowingChange && (
                        <article className="library-book">
                            <p className="section-label">
                                Growing change
                            </p>

                            <h2>
                                What changed
                            </h2>


                            {isTransplant &&
                                transplantKindLabel && (
                                <p className="journal-change-summary">
                                    🌱 {
                                        transplantKindLabel
                                    }
                                </p>
                            )}


                            {growingTransitions.length >
                            0 ? (
                                <ul className="journal-transition-list">
                                    {growingTransitions.map(
                                        transition => {
                                            const plant =
                                                getPlantById(
                                                    transition
                                                        .plantStoryId,
                                                );

                                            const fromPlace =
                                                getGrowingPlaceById(
                                                    transition
                                                        .fromGrowingPlaceId,
                                                );

                                            const toPlace =
                                                getGrowingPlaceById(
                                                    transition
                                                        .toGrowingPlaceId,
                                                );

                                            const setupChanged =
                                                didSetupChange(
                                                    transition
                                                        .fromGrowingSetupIds,
                                                    transition
                                                        .toGrowingSetupIds,
                                                );

                                            const hasPlaceTransition =
                                                Boolean(
                                                    transition
                                                        .fromGrowingPlaceId ||
                                                    transition
                                                        .toGrowingPlaceId,
                                                );


                                            return (
                                                <li
                                                    key={
                                                        transition
                                                            .plantStoryId
                                                    }
                                                    className="journal-transition-item"
                                                >
                                                    <p className="journal-transition-plant">
                                                        {plant ? (
                                                            <button
                                                                type="button"
                                                                className="text-button"
                                                                onClick={() =>
                                                                    onOpenPlant(
                                                                        plant.id,
                                                                    )
                                                                }
                                                            >
                                                                🌱{' '}
                                                                {
                                                                    plant.displayName
                                                                }
                                                            </button>
                                                        ) : (
                                                            '🌱 Plant Story'
                                                        )}
                                                    </p>


                                                    {hasPlaceTransition && (
                                                        <p className="journal-transition-path">
                                                            {fromPlace ? (
                                                                <button
                                                                    type="button"
                                                                    className="text-button"
                                                                    onClick={() =>
                                                                        onOpenGrowingPlace(
                                                                            fromPlace.id,
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        fromPlace.name
                                                                    }
                                                                </button>
                                                            ) : (
                                                                <span>
                                                                    Previous place
                                                                    not recorded
                                                                </span>
                                                            )}

                                                            <span
                                                                className="journal-transition-arrow"
                                                                aria-hidden="true"
                                                            >
                                                                →
                                                            </span>

                                                            {toPlace ? (
                                                                <button
                                                                    type="button"
                                                                    className="text-button"
                                                                    onClick={() =>
                                                                        onOpenGrowingPlace(
                                                                            toPlace.id,
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        toPlace.name
                                                                    }
                                                                </button>
                                                            ) : (
                                                                <span>
                                                                    New place
                                                                    not recorded
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}


                                                    {setupChanged && (
                                                        <p className="journal-transition-note">
                                                            Growing Setup
                                                            changed as part
                                                            of this Moment.
                                                        </p>
                                                    )}


                                                    {!hasPlaceTransition &&
                                                        !setupChanged && (
                                                        <p className="journal-transition-note">
                                                            The growing
                                                            change was
                                                            recorded for
                                                            this Plant Story.
                                                        </p>
                                                    )}
                                                </li>
                                            );
                                        },
                                    )}
                                </ul>
                            ) : (
                                <p>
                                    This Moment records a
                                    growing change, but its
                                    older record does not
                                    contain separate
                                    before-and-after context
                                    for each Plant Story.
                                </p>
                            )}
                        </article>
                    )}


                    {event.treatmentReason && (
                        <article className="library-book">
                            <p className="section-label">
                                Treatment context
                            </p>

                            <h2>
                                Why it was treated
                            </h2>

                            <p className="journal-treatment-reason">
                                {
                                    event.treatmentReason
                                }
                            </p>
                        </article>
                    )}


                    {(linkedProducts.length >
                        0 ||
                        event.productUsed) && (
                        <article className="library-book">
                            <p className="section-label">
                                Garden provisions
                            </p>

                            <h2>
                                What was used
                            </h2>


                            {linkedProducts.length >
                                0 && (
                                <ul className="journal-linked-product-list">
                                    {linkedProducts.map(
                                        product => (
                                            <li
                                                key={
                                                    product.id
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="text-button"
                                                    onClick={() =>
                                                        onOpenProduct(
                                                            product.id,
                                                        )
                                                    }
                                                >
                                                    🌿{' '}
                                                    {
                                                        product.name
                                                    }

                                                    {product.brand && (
                                                        <>
                                                            {' · '}
                                                            {
                                                                product.brand
                                                            }
                                                        </>
                                                    )}
                                                </button>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}


                            {event.productUsed && (
                                <p className="journal-free-text-product">
                                    {linkedProducts.length >
                                        0 && (
                                        <strong>
                                            Also noted:{' '}
                                        </strong>
                                    )}

                                    {
                                        event.productUsed
                                    }
                                </p>
                            )}
                        </article>
                    )}


                    <article className="library-book">
                        <p className="section-label">
                            Notes
                        </p>

                        <h2>
                            What you wanted to remember
                        </h2>

                        <p>
                            {event.notes ||
                                'No extra notes were added to this page.'}
                        </p>
                    </article>


                    <article className="library-book">
                        <p className="section-label">
                            Photographs
                        </p>

                        <SprigPhotoGallery
                            photoUrls={
                                event.photoUrls ??
                                []
                            }
                            photoContexts={
                                photoContexts
                            }
                            durationDisplayUnit={
                                durationUnit
                            }
                            showDurationUnitPicker={
                                false
                            }
                            title="Photographs from this moment"
                            emptyMessage="No photographs were tucked into this Journal page."
                            photoAltPrefix={`${event.title} photograph`}
                        />
                    </article>
                </section>


                <BackToTop targetId="journal-detail-top" />
            </DetailPageTemplate>
    );
}

