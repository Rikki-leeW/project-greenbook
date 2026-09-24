import {
    useState,
} from 'react';
import { BackToTop } from '../components/layout/GardenPage';
import DetailPageTemplate from '../components/templates/DetailPageTemplate'
import SprigPhotoGallery from '../components/photos/SprigPhotoGallery';
import { escapeRtf, downloadBlob, printDocument } from '../utils/exportUtils';

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




/* =======================================
   LOCAL PRESENTATION
======================================= */




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
        printDocument();
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


        downloadBlob(
            `${makeSafeFileName(
                plantNames,
            )}-harvest-story.rtf`,
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
        <DetailPageTemplate activePage="harvest" onNavigate={onNavigate} className="harvest-detail-page" as="main" pageId="harvest-detail-top"
      eyebrow={<>Harvest story</>}
      title={<>{matchingPlants.length === 1 ? (
                <button type="button" className="text-button"
                  onClick={() => onOpenPlant(matchingPlants[0].id)}>
                  {plantNames}
                </button>
              ) : plantNames}</>}
      intro={<>{storyHarvests.length}{' '}

                            {storyHarvests.length ===
                            1
                                ? 'harvest'
                                : 'harvests'}

                            {totalMeasurement
                                ? ` · ${totalMeasurement} recorded`
                                : ''}</>}
      headerClassName="harvest-detail-header"
      journeyBackLabel={journeyBackLabel ? `Back to ${journeyBackLabel}` : null}
      onJourneyBack={onBack}
      homeLabel="Harvests"
      onHome={onOpenHarvests}
      navigationAriaLabel="Harvests record navigation"
    >





                


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


                <BackToTop targetId="harvest-detail-top" />
            </DetailPageTemplate>
    );
}
