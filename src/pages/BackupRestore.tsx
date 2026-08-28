import {
    useRef,
    useState,
    type ChangeEvent,
  } from 'react'
  
  import GardenLayout from '../components/layout/GardenLayout'
  
  import {
    downloadGardenBackup,
    readGardenBackupFile,
    type SprigGardenBackup,
  } from '../services/backup'
  
  import type {
    GardenData,
  } from '../types'
  
  import type {
    AppPage,
  } from '../types/navigation'
  
  
  interface BackupRestoreProps {
    gardenData: GardenData
  
    onRestoreGarden: (
      gardenData: GardenData,
    ) => void
  
    onNavigate: (
      page: AppPage,
    ) => void
  }
  
  
  /* =======================================
     DATE FORMATTING
  ======================================= */
  
  function formatBackupDate(
    date: string,
  ): string {
    const parsed =
      new Date(
        date,
      )
  
    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date
    }
  
    return parsed.toLocaleString(
      'en-AU',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      },
    )
  }
  
  
  /* =======================================
     BACKUP & RESTORE
  ======================================= */
  
  export default function BackupRestore({
    gardenData,
    onRestoreGarden,
    onNavigate,
  }: BackupRestoreProps) {
  
    const fileInputRef =
      useRef<HTMLInputElement>(
        null,
      )
  
  
    const [
      selectedBackup,
      setSelectedBackup,
    ] =
      useState<SprigGardenBackup | null>(
        null,
      )
  
  
    const [
      selectedFileName,
      setSelectedFileName,
    ] =
      useState<string>(
        '',
      )
  
  
    const [
      backupError,
      setBackupError,
    ] =
      useState<string | null>(
        null,
      )
  
  
    const [
      isReadingBackup,
      setIsReadingBackup,
    ] =
      useState(false)
  
  
    /* =======================================
       DOWNLOAD CURRENT GARDEN
    ======================================= */
  
    function handleDownloadBackup() {
      downloadGardenBackup(
        gardenData,
      )
    }
  
  
    /* =======================================
       CHOOSE RESTORE FILE
    ======================================= */
  
    async function handleBackupFileSelection(
      event:
        ChangeEvent<HTMLInputElement>,
    ) {
      const file =
        event.target.files?.[0]
  
      /*
       * Allow the same file to be selected
       * again later if needed.
       */
      event.target.value =
        ''
  
  
      if (!file) {
        return
      }
  
  
      setIsReadingBackup(
        true,
      )
  
      setBackupError(
        null,
      )
  
      setSelectedBackup(
        null,
      )
  
      setSelectedFileName(
        file.name,
      )
  
  
      try {
        const backup =
          await readGardenBackupFile(
            file,
          )
  
        setSelectedBackup(
          backup,
        )
      } catch (
        error
      ) {
        const message =
          error instanceof Error
            ? error.message
            : 'Sprig could not read that backup file.'
  
        setBackupError(
          message,
        )
      } finally {
        setIsReadingBackup(
          false,
        )
      }
    }
  
  
    /* =======================================
       RESTORE SELECTED BACKUP
    ======================================= */
  
    function handleRestoreGarden() {
      if (
        !selectedBackup
      ) {
        return
      }
  
  
      const confirmed =
        window.confirm(
          'Restore this Sprig garden?\n\nYour current garden will be replaced by the garden stored in this backup.\n\nSprig recommends saving a fresh backup of your current garden first.',
        )
  
  
      if (
        !confirmed
      ) {
        return
      }
  
  
      onRestoreGarden(
        selectedBackup.gardenData,
      )
  
  
      setSelectedBackup(
        null,
      )
  
      setSelectedFileName(
        '',
      )
  
      setBackupError(
        null,
      )
  
  
      window.alert(
        'Your Sprig garden has been restored.',
      )
    }
  
  
    return (
      <GardenLayout
        activePage="backup"
        onNavigate={
          onNavigate
        }
      >
        <main className="journal-page">
  
          {/* =======================================
              HEADER
          ======================================= */}
  
          <header className="journal-header">
            <div>
              <p className="section-label">
                Looking after Sprig
              </p>
  
              <h1>
                Backup & Restore
              </h1>
  
              <p className="journal-intro">
                Keep a safe portable copy
                of the whole garden Sprig
                remembers.
              </p>
            </div>
          </header>
  
  
          <section className="library-grid">
  
            {/* =======================================
                SAVE BACKUP
            ======================================= */}
  
            <article className="library-book">
              <p className="section-label">
                Keep a copy
              </p>
  
              <h2>
                Save your garden
              </h2>
  
              <p>
                A Sprig backup contains
                your Plant Stories,
                Growing Places, Growing
                Recipes, Ingredients,
                Products, purchases,
                Journal entries, Harvests
                and other saved garden
                records.
              </p>
  
  
              <button
                type="button"
                className="primary-button"
                onClick={
                  handleDownloadBackup
                }
              >
                💾 Save a garden backup
              </button>
  
  
              <p className="form-whisper">
                This backup is designed
                for restoring Sprig later.
                Garden Reports and Excel
                exports will serve a
                different purpose.
              </p>
            </article>
  
  
            {/* =======================================
                RESTORE
            ======================================= */}
  
            <article className="library-book">
              <p className="section-label">
                Restore
              </p>
  
              <h2>
                Bring a garden back
              </h2>
  
              <p>
                Choose a Sprig backup
                file. Nothing will be
                replaced simply by
                choosing the file.
              </p>
  
  
              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".json,application/json"
                hidden
                onChange={
                  handleBackupFileSelection
                }
              />
  
  
              <button
                type="button"
                className="secondary-button"
                disabled={
                  isReadingBackup
                }
                onClick={() =>
                  fileInputRef.current
                    ?.click()
                }
              >
                {isReadingBackup
                  ? 'Reading backup...'
                  : 'Choose Sprig backup'}
              </button>
  
  
              {backupError && (
                <p
                  className="form-whisper"
                  role="alert"
                >
                  {backupError}
                </p>
              )}
  
  
              {/* =======================================
                  BACKUP PREVIEW
              ======================================= */}
  
              {selectedBackup && (
                <div className="sprig-backup-preview">
                  <p className="section-label">
                    Backup found
                  </p>
  
                  <h3>
                    Sprig garden backup
                  </h3>
  
  
                  {selectedFileName && (
                    <p>
                      <strong>
                        File:
                      </strong>{' '}
                      {
                        selectedFileName
                      }
                    </p>
                  )}
  
  
                  <p>
                    <strong>
                      Saved:
                    </strong>{' '}
                    {formatBackupDate(
                      selectedBackup.createdAt,
                    )}
                  </p>
  
  
                  <p>
                    <strong>
                      Plant Stories:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .plantStories
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Journal entries:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .events
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Harvest Records:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .harvests
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Growing Places:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .growingPlaces
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Growing Recipes:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .growingSetups
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Ingredients:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .ingredients
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Products:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .products
                        .length
                    }
                  </p>
  
  
                  <p>
                    <strong>
                      Purchase records:
                    </strong>{' '}
                    {
                      selectedBackup
                        .gardenData
                        .purchases
                        .length
                    }
                  </p>
  
  
                  <p className="form-whisper">
                    Restoring replaces
                    the garden currently
                    stored in this copy
                    of Sprig.
                  </p>
  
  
                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleRestoreGarden
                    }
                  >
                    Restore this garden
                  </button>
                </div>
              )}
            </article>
  
          </section>
        </main>
      </GardenLayout>
    )
  }