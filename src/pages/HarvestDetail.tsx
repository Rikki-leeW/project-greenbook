import {
    useState,
} from 'react';

import GardenLayout from '../components/layout/GardenLayout';
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';

import type {
    HarvestMeasurementUnit,
    HarvestPlantOutcome,
    HarvestRecord,
    HarvestType,
    PlantStory,
} from '../types';

import type {
    AppPage,
} from '../types/navigation';


type DurationUnit =
    | 'days'
    | 'weeks'
    | 'months';


interface HarvestDetailProps {
    harvest: HarvestRecord;

    harvests: HarvestRecord[];

    plants: PlantStory[];

    journeyBackLabel: string | null;

    onBack: () => void;

    onOpenHarvests: () => void;

    onEdit: (
        harvest: HarvestRecord,
    ) => void;

    onRecordAnotherHarvest: (
        harvest: HarvestRecord,
    ) => void;

    onDelete: (
        harvestId: string,
    ) => void;

    onOpenPlant: (
        plantId: string,
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
   HARVEST GROUPING AND LABELS
======================================= */

function getHarvestStoryKey(
    harvest: HarvestRecord,
): string {
    const ids = [
        ...harvest.plantStoryIds,
    ].sort();


    return ids.length
        ? ids.join(
            '|',
        )
        : harvest.id;
}


function getMatchingPlants(
    harvest: HarvestRecord,
    plants: PlantStory[],
): PlantStory[] {
    return plants.filter(
        plant =>
            harvest.plantStoryIds.includes(
                plant.id,
            ),
    );
}


function getHarvestTypeLabel(
    harvest: HarvestRecord,
): string {
    if (
        harvest.harvestType ===
            'other' &&
        harvest.customHarvestTypeLabel
    ) {
        return harvest.customHarvestTypeLabel;
    }


    const labels:
        Partial<
            Record<
                HarvestType,
                string
            >
        > = {
            first:
                'First harvest',

            regular:
                'Regular harvest',

            main:
                'Main harvest',

            secondary:
                'Secondary harvest',

            final:
                'Final harvest',

            other:
                'Other harvest',
        };


    return harvest.harvestType
        ? labels[
            harvest.harvestType
          ] ??
          'Harvest'
        : 'Harvest';
}


function getMeasurementUnitLabel(
    harvest: HarvestRecord,
): string | undefined {
    if (
        harvest.measurementUnit ===
            'other' &&
        harvest.customMeasurementUnitLabel
    ) {
        return harvest.customMeasurementUnitLabel;
    }


    const labels:
        Partial<
            Record<
                HarvestMeasurementUnit,
                string
            >
        > = {
            gram:
                'g',

            kilogram:
                'kg',

            millilitre:
                'mL',

            litre:
                'L',

            centimetre:
                'cm',

            inch:
                'in',

            bunch:
                'bunch',

            handful:
                'handful',

            basket:
                'basket',

            container:
                'container',
        };


    return harvest.measurementUnit
        ? labels[
            harvest.measurementUnit
          ]
        : undefined;
}


function getHarvestAmount(
    harvest: HarvestRecord,
): string {
    const pieces:
        string[] = [];


    if (
        harvest.count !==
        undefined
    ) {
        pieces.push(
            `${harvest.count}`,
        );
    }


    if (
        harvest.measurementAmount !==
        undefined
    ) {
        const unit =
            getMeasurementUnitLabel(
                harvest,
            );


        pieces.push(
            unit
                ? `${harvest.measurementAmount} ${unit}`
                : `${harvest.measurementAmount}`,
        );
    }


    return pieces.length
        ? pieces.join(
            ' · ',
        )
        : 'Not recorded';
}


function getPlantOutcomeLabel(
    harvest: HarvestRecord,
): string {
    if (
        harvest.plantOutcome ===
            'other' &&
        harvest.customPlantOutcomeLabel
    ) {
        return harvest.customPlantOutcomeLabel;
    }


    const labels:
        Partial<
            Record<
                HarvestPlantOutcome,
                string
            >
        > = {
            'still-producing':
                'Still producing',

            'more-expected':
                'More expected',

            'main-harvest-complete':
                'Main harvest complete',

            finished:
                'Finished producing',

            'no-change':
                'Plant story continues',

            'not-sure':
                'Still unfolding',

            other:
                'Other',
        };


    return harvest.plantOutcome
        ? labels[
            harvest.plantOutcome
          ] ??
          'Not recorded'
        : 'Not recorded';
}


function getQualityLabel(
    harvest: HarvestRecord,
): string {
    switch (
        harvest.quality
    ) {
        case 'poor':
            return 'Poor';

        case 'fair':
            return 'Fair';

        case 'good':
            return 'Good';

        case 'excellent':
            return 'Excellent';

        default:
            return 'Not recorded';
    }
}


function getTotalCount(
    harvests: HarvestRecord[],
): number | undefined {
    const counted =
        harvests.filter(
            item =>
                item.count !==
                undefined,
        );


    return counted.length
        ? counted.reduce(
            (
                total,
                item,
            ) =>
                total +
                (
                    item.count ??
                    0
                ),
            0,
        )
        : undefined;
}


function getTotalMeasurement(
    harvests: HarvestRecord[],
): string | undefined {
    const measured =
        harvests.filter(
            item =>
                item.measurementAmount !==
                    undefined &&
                item.measurementUnit !==
                    undefined,
        );


    if (
        !measured.length
    ) {
        return undefined;
    }


    const allWeights =
        measured.every(
            item =>
                item.measurementUnit ===
                    'gram' ||
                item.measurementUnit ===
                    'kilogram',
        );


    if (
        allWeights
    ) {
        const grams =
            measured.reduce(
                (
                    total,
                    item,
                ) =>
                    total +
                    (
                        item.measurementAmount ??
                        0
                    ) *
                    (
                        item.measurementUnit ===
                        'kilogram'
                            ? 1000
                            : 1
                    ),
                0,
            );


        return grams >=
            1000
            ? `${Number(
                (
                    grams /
                    1000
                ).toFixed(
                    2,
                ),
            )} kg`
            : `${Number(
                grams.toFixed(
                    2,
                ),
            )} g`;
    }


    const allVolumes =
        measured.every(
            item =>
                item.measurementUnit ===
                    'millilitre' ||
                item.measurementUnit ===
                    'litre',
        );


    if (
        allVolumes
    ) {
        const millilitres =
            measured.reduce(
                (
                    total,
                    item,
                ) =>
                    total +
                    (
                        item.measurementAmount ??
                        0
                    ) *
                    (
                        item.measurementUnit ===
                        'litre'
                            ? 1000
                            : 1
                    ),
                0,
            );


        return millilitres >=
            1000
            ? `${Number(
                (
                    millilitres /
                    1000
                ).toFixed(
                    2,
                ),
            )} L`
            : `${Number(
                millilitres.toFixed(
                    2,
                ),
            )} mL`;
    }


    return undefined;
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
        'harvest-story';
}


function escapeRtf(
    value: string,
): string {
    return value
        .replaceAll(
            '\\',
            '\\\\',
        )
        .replaceAll(
            '{',
            '\\{',
        )
        .replaceAll(
            '}',
            '\\}',
        )
        .replace(
            /\r?\n/g,
            '\\line ',
        )
        .replace(
            /[^\x00-\x7F]/g,
            character => {
                const code =
                    character.charCodeAt(
                        0,
                    );


                const signedCode =
                    code >
                    32767
                        ? code -
                          65536
                        : code;


                return `\\u${signedCode}?`;
            },
        );
}


/* =======================================
   LOCAL PRESENTATION
======================================= */

const styles = `
    .harvest-detail-page .harvest-age-control {
        margin: 0.7rem 0 1rem;
    }

    .harvest-detail-page .harvest-age-control-label {
        display: block;
        margin-bottom: 0.35rem;
        color: #62705f;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .harvest-detail-page .harvest-age-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .harvest-detail-page .harvest-age-picker button {
        width: auto;
        min-height: 40px;
        margin: 0;
        padding: 0.4rem 0.7rem;
        border: 1px solid rgba(82, 112, 71, 0.16);
        border-radius: 999px;
        background: rgba(255, 254, 249, 0.85);
        color: #62705f;
        font: inherit;
        font-size: 0.76rem;
        cursor: pointer;
    }

    .harvest-detail-page .harvest-age-picker button[aria-pressed="true"] {
        background: #e2eed4;
        border-color: rgba(82, 112, 71, 0.33);
        color: #405e42;
        font-weight: 700;
    }

    .harvest-detail-page .harvest-detail-list {
        margin: 0.7rem 0;
    }

    .harvest-detail-page .harvest-detail-list > div {
        display: grid;
        grid-template-columns: minmax(7rem, 0.8fr) minmax(0, 1.6fr);
        gap: 0.2rem 0.8rem;
        margin-top: 0.6rem;
        line-height: 1.5;
    }

    .harvest-detail-page .harvest-detail-list dt {
        color: #62705f;
        font-size: 0.78rem;
        font-weight: 700;
    }

    .harvest-detail-page .harvest-detail-list dd {
        margin: 0;
        min-width: 0;
        overflow-wrap: anywhere;
    }

    .harvest-detail-page .harvest-dated-ages {
        font-size: 0.85rem;
        line-height: 1.5;
    }

    .harvest-detail-page .harvest-dated-ages .harvest-plant-age {
        color: #52634b;
    }

    .harvest-detail-page .harvest-multiple-ages {
        display: grid;
        gap: 0.3rem;
        margin-top: 0.3rem;
    }

    .harvest-detail-page .harvest-multiple-ages .text-button {
        width: auto;
        margin: 0;
        padding: 0;
        font: inherit;
        text-align: left;
        white-space: normal;
    }

    .harvest-detail-page .harvest-export-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
    }

    .harvest-detail-page .detail-back-to-top {
        display: flex;
        justify-content: center;
        padding: 1rem 0 2rem;
    }

    @media (max-width: 560px) {
        .harvest-detail-page .harvest-detail-list > div {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.1rem;
        }
    }

    @media print {
        .harvest-detail-page .sprig-detail-navigation,
        .harvest-detail-page .harvest-age-control,
        .harvest-detail-page .harvest-story-actions,
        .harvest-detail-page .harvest-detail-actions,
        .harvest-detail-page .detail-back-to-top {
            display: none !important;
        }
    }
`;


/* =======================================
   HARVEST DETAIL
======================================= */

export default function HarvestDetail({
    harvest,
    harvests,
    plants,
    journeyBackLabel,
    onBack,
    onOpenHarvests,
    onEdit,
    onRecordAnotherHarvest,
    onDelete,
    onOpenPlant,
    onNavigate,
}: HarvestDetailProps) {
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


    const storyKey =
        getHarvestStoryKey(
            harvest,
        );


    /*
     * Keep the exact linked group together.
     *
     * Totals are not allocated to individual
     * plants or varieties within that group.
     */
    const storyHarvests =
        harvests
            .filter(
                item =>
                    getHarvestStoryKey(
                        item,
                    ) ===
                    storyKey,
            )
            .sort(
                (
                    first,
                    second,
                ) =>
                    new Date(
                        first.date,
                    ).getTime() -
                    new Date(
                        second.date,
                    ).getTime(),
            );


    const matchingPlants =
        getMatchingPlants(
            harvest,
            plants,
        );


    const plantNames =
        matchingPlants.length
            ? matchingPlants
                .map(
                    plant =>
                        plant.displayName,
                )
                .join(
                    ', ',
                )
            : 'Unknown Plant Story';


    const totalCount =
        getTotalCount(
            storyHarvests,
        );


    const totalMeasurement =
        getTotalMeasurement(
            storyHarvests,
        );


    function renderDateWithAges(
        record: HarvestRecord,
    ) {
        const recordPlants =
            getMatchingPlants(
                record,
                plants,
            );


        return (
            <div className="harvest-dated-ages">
                <time
                    dateTime={
                        record.date
                    }
                >
                    {formatDate(
                        record.date,
                    )}
                </time>


                {recordPlants.length ===
                    1 && (
                    <span className="harvest-plant-age">
                        {' · '}

                        {formatAge(
                            recordPlants[0],
                            record.date,
                            durationUnit,
                        )}
                    </span>
                )}


                {recordPlants.length >
                    1 && (
                    <div className="harvest-multiple-ages">
                        {recordPlants.map(
                            plant => (
                                <div
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
                                        {
                                            plant.displayName
                                        }
                                    </button>

                                    {' · '}

                                    <span className="harvest-plant-age">
                                        {formatAge(
                                            plant,
                                            record.date,
                                            durationUnit,
                                        )}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>
        );
    }


    function getPhotoContexts(
        record: HarvestRecord,
    ) {
        const recordPlants =
            getMatchingPlants(
                record,
                plants,
            );


        return (
            record.photoUrls ??
            []
        ).map(
            (
                photoUrl,
                index,
            ) => {
                const metadata =
                    record.photoMetadata?.[
                        index
                    ] ??
                    record.photoMetadata?.find(
                        item =>
                            item?.photoUrl ===
                            photoUrl,
                    );


                const date =
                    metadata?.photoDate ||
                    record.date;


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
                    recordPlants.length ===
                    1
                ) {
                    const days =
                        getAgeDays(
                            recordPlants[0],
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
                                recordPlants[0],
                                date,
                                durationUnit,
                            ),
                        );
                    }
                } else {
                    recordPlants.forEach(
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
                        getHarvestTypeLabel(
                            record,
                        ),

                    detail:
                        details.join(
                            ' · ',
                        ),

                    age,
                };
            },
        );
    }


    function handleDeleteHarvest(
        record: HarvestRecord,
    ) {
        if (
            window.confirm(
                `Delete this ${getHarvestTypeLabel(
                    record,
                )}? This cannot be undone.`,
            )
        ) {
            onDelete(
                record.id,
            );
        }
    }


    function exportPdf() {
        window.print();
    }


    function exportRtf() {
        const sections:
            string[] = [];


        sections.push(
            `\\b Harvest story\\b0`,
        );


        sections.push(
            `\\b Plant Stories\\b0\\line ${escapeRtf(
                plantNames,
            )}`,
        );


        sections.push(
            `\\b Harvests recorded\\b0\\line ${storyHarvests.length}`,
        );


        if (
            totalCount !==
            undefined
        ) {
            sections.push(
                `\\b Total count\\b0\\line ${totalCount}`,
            );
        }


        if (
            totalMeasurement
        ) {
            sections.push(
                `\\b Total gathered\\b0\\line ${escapeRtf(
                    totalMeasurement,
                )}`,
            );
        }


        storyHarvests.forEach(
            (
                record,
                index,
            ) => {
                const recordPlants =
                    getMatchingPlants(
                        record,
                        plants,
                    );


                const ageText =
                    recordPlants.length >
                    0
                        ? recordPlants
                            .map(
                                plant =>
                                    `${plant.displayName}: ${formatAge(
                                        plant,
                                        record.date,
                                        durationUnit,
                                    )}`,
                            )
                            .join(
                                ' · ',
                            )
                        : 'Plant age not available';


                const recordLines = [
                    `\\b Harvest ${index + 1}: ${escapeRtf(
                        getHarvestTypeLabel(
                            record,
                        ),
                    )}\\b0`,

                    escapeRtf(
                        formatDate(
                            record.date,
                        ),
                    ),

                    escapeRtf(
                        ageText,
                    ),

                    `Gathered: ${escapeRtf(
                        getHarvestAmount(
                            record,
                        ),
                    )}`,

                    `Quality: ${escapeRtf(
                        getQualityLabel(
                            record,
                        ),
                    )}`,

                    `Plant outcome: ${escapeRtf(
                        getPlantOutcomeLabel(
                            record,
                        ),
                    )}`,
                ];


                if (
                    record.notes
                ) {
                    recordLines.push(
                        `Notes: ${escapeRtf(
                            record.notes,
                        )}`,
                    );
                }


                sections.push(
                    recordLines.join(
                        '\\line ',
                    ),
                );
            },
        );


        const rtf =
            `{\\rtf1\\ansi\\deff0` +
            `{\\fonttbl{\\f0 Georgia;}}` +
            `\\fs24\\f0 ` +
            sections.join(
                '\\par\\par ',
            ) +
            `}`;


        const blob =
            new Blob(
                [
                    rtf,
                ],
                {
                    type:
                        'application/rtf',
                },
            );


        const url =
            URL.createObjectURL(
                blob,
            );


        const link =
            document.createElement(
                'a',
            );


        link.href =
            url;


        link.download =
            `${makeSafeFileName(
                plantNames,
            )}-harvest-story.rtf`;


        document.body.appendChild(
            link,
        );


        link.click();


        link.remove();


        window.setTimeout(
            () => {
                URL.revokeObjectURL(
                    url,
                );
            },
            0,
        );
    }


    function backToTop() {
        document
            .getElementById(
                'harvest-detail-top',
            )
            ?.scrollIntoView({
                behavior:
                    window.matchMedia(
                        '(prefers-reduced-motion: reduce)',
                    ).matches
                        ? 'auto'
                        : 'smooth',

                block:
                    'start',
            });
    }


    return (
        <GardenLayout
            activePage="harvest"
            onNavigate={
                onNavigate
            }
        >
            <main
                className="journal-page harvest-detail-page"
                id="harvest-detail-top"
            >
                <style>
                    {styles}
                </style>


                <div
                    className="sprig-detail-navigation"
                    style={{
                        display:
                            'flex',

                        flexWrap:
                            'wrap',

                        gap:
                            '10px',

                        marginBottom:
                            '18px',
                    }}
                >
                    {journeyBackLabel && (
                        <button
                            type="button"
                            className="garden-return-button"
                            onClick={
                                onBack
                            }
                        >
                            ← Back to{' '}
                            {
                                journeyBackLabel
                            }
                        </button>
                    )}


                    {journeyBackLabel !==
                        'Harvests' && (
                        <button
                            type="button"
                            className="garden-return-button"
                            onClick={
                                onOpenHarvests
                            }
                        >
                            ← Harvests
                        </button>
                    )}
                </div>


                <header className="journal-header harvest-detail-header">
                    <div>
                        <p className="section-label">
                            Harvest story
                        </p>


                        {matchingPlants.length ===
                        1 ? (
                            <h1>
                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={() =>
                                        onOpenPlant(
                                            matchingPlants[0]
                                                .id,
                                        )
                                    }
                                >
                                    {
                                        plantNames
                                    }
                                </button>
                            </h1>
                        ) : (
                            <h1>
                                {
                                    plantNames
                                }
                            </h1>
                        )}


                        <p className="journal-intro">
                            {storyHarvests.length}{' '}

                            {storyHarvests.length ===
                            1
                                ? 'harvest'
                                : 'harvests'}

                            {totalMeasurement
                                ? ` · ${totalMeasurement} recorded`
                                : ''}
                        </p>
                    </div>
                </header>


                {matchingPlants.length >
                    0 && (
                    <div className="harvest-age-control">
                        <span className="harvest-age-control-label">
                            Show plant age at harvest in
                        </span>


                        <div
                            className="harvest-age-picker"
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
                    className="harvest-detail-actions harvest-story-actions"
                    aria-label="Harvest story actions"
                >
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            onRecordAnotherHarvest(
                                harvest,
                            )
                        }
                    >
                        🧺 Record another harvest
                    </button>


                    <div className="harvest-export-actions">
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


                <article className="journal-entry harvest-detail-card">
                    <div className="journal-entry-marker">
                        🌾
                    </div>


                    <div className="journal-entry-content">
                        <h2>
                            Harvest summary
                        </h2>


                        <dl className="harvest-detail-list">
                            <div>
                                <dt>
                                    Harvests recorded
                                </dt>

                                <dd>
                                    {
                                        storyHarvests.length
                                    }
                                </dd>
                            </div>


                            {totalCount !==
                                undefined && (
                                <div>
                                    <dt>
                                        Total count
                                    </dt>

                                    <dd>
                                        {
                                            totalCount
                                        }
                                    </dd>
                                </div>
                            )}


                            {totalMeasurement && (
                                <div>
                                    <dt>
                                        Total gathered
                                    </dt>

                                    <dd>
                                        {
                                            totalMeasurement
                                        }
                                    </dd>
                                </div>
                            )}


                            {storyHarvests.length >
                                0 && (
                                <div>
                                    <dt>
                                        First harvest
                                    </dt>

                                    <dd>
                                        {renderDateWithAges(
                                            storyHarvests[0],
                                        )}
                                    </dd>
                                </div>
                            )}


                            {storyHarvests.length >
                                1 && (
                                <div>
                                    <dt>
                                        Latest harvest
                                    </dt>

                                    <dd>
                                        {renderDateWithAges(
                                            storyHarvests[
                                                storyHarvests.length -
                                                1
                                            ],
                                        )}
                                    </dd>
                                </div>
                            )}
                        </dl>


                        {matchingPlants.length >
                            0 && (
                            <section className="harvest-detail-section">
                                <h3>
                                    Gathered from
                                </h3>


                                {matchingPlants.map(
                                    plant => (
                                        <p
                                            key={
                                                plant.id
                                            }
                                        >
                                            🌱{' '}

                                            <button
                                                type="button"
                                                className="text-button"
                                                onClick={() =>
                                                    onOpenPlant(
                                                        plant.id,
                                                    )
                                                }
                                            >
                                                {
                                                    plant.displayName
                                                }
                                            </button>
                                        </p>
                                    ),
                                )}
                            </section>
                        )}
                    </div>
                </article>


                <section className="journal-list">
                    {storyHarvests.map(
                        (
                            record,
                            index,
                        ) => (
                            <article
                                key={
                                    record.id
                                }
                                className="journal-entry harvest-detail-card"
                            >
                                <div className="journal-entry-marker">
                                    🧺
                                </div>


                                <div className="journal-entry-content">
                                    <div className="journal-entry-top">
                                        <div>
                                            <p className="journal-entry-source plant-source">
                                                Harvest{' '}
                                                {
                                                    index +
                                                    1
                                                }
                                            </p>


                                            {renderDateWithAges(
                                                record,
                                            )}
                                        </div>
                                    </div>


                                    <h2>
                                        {getHarvestTypeLabel(
                                            record,
                                        )}
                                    </h2>


                                    <dl className="harvest-detail-list">
                                        <div>
                                            <dt>
                                                Gathered
                                            </dt>

                                            <dd>
                                                {getHarvestAmount(
                                                    record,
                                                )}
                                            </dd>
                                        </div>


                                        <div>
                                            <dt>
                                                How it was
                                            </dt>

                                            <dd>
                                                {getQualityLabel(
                                                    record,
                                                )}
                                            </dd>
                                        </div>


                                        <div>
                                            <dt>
                                                From here
                                            </dt>

                                            <dd>
                                                {getPlantOutcomeLabel(
                                                    record,
                                                )}
                                            </dd>
                                        </div>
                                    </dl>


                                    {record.notes && (
                                        <section className="harvest-detail-section">
                                            <h3>
                                                Notes to the harvest
                                            </h3>

                                            <p className="journal-notes">
                                                {
                                                    record.notes
                                                }
                                            </p>
                                        </section>
                                    )}


                                    <SprigPhotoGallery
                                        photoUrls={
                                            record.photoUrls ??
                                            []
                                        }
                                        photoContexts={
                                            getPhotoContexts(
                                                record,
                                            )
                                        }
                                        durationDisplayUnit={
                                            durationUnit
                                        }
                                        showDurationUnitPicker={
                                            false
                                        }
                                        title="Harvest photographs"
                                        emptyMessage="No photographs have been tucked into this harvest yet."
                                        photoAltPrefix="Harvest photograph"
                                    />


                                    <section className="harvest-detail-section harvest-detail-record-info">
                                        <p>
                                            <strong>
                                                Created:
                                            </strong>{' '}

                                            {formatDate(
                                                record.createdAt,
                                            )}
                                        </p>


                                        {record.updatedAt && (
                                            <p>
                                                <strong>
                                                    Last edited:
                                                </strong>{' '}

                                                {formatDate(
                                                    record.updatedAt,
                                                )}
                                            </p>
                                        )}
                                    </section>


                                    <div className="harvest-detail-actions">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                onEdit(
                                                    record,
                                                )
                                            }
                                        >
                                            ✏ Edit
                                        </button>


                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() =>
                                                handleDeleteHarvest(
                                                    record,
                                                )
                                            }
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ),
                    )}
                </section>


                <div className="detail-back-to-top">
                    <button
                        type="button"
                        className="text-button"
                        onClick={
                            backToTop
                        }
                    >
                        ↑ Back to top
                    </button>
                </div>
            </main>
        </GardenLayout>
    );
}