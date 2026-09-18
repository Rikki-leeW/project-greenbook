import type {
  ReactNode,
} from 'react'


/* =======================================
   TYPES
======================================= */

interface GardenPageProps {
  children: ReactNode
  className?: string
  id?: string
  narrow?: boolean
  as?: 'div' | 'main'
}

interface GardenPageNavigationProps {
  journeyBackLabel?: string | null
  onJourneyBack?: () => void
  homeLabel?: string | null
  onHome?: () => void
  journeyBackIcon?: ReactNode
  homeIcon?: ReactNode
  actions?: ReactNode
  className?: string
  ariaLabel?: string
}

interface GardenPageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  intro?: ReactNode
  actions?: ReactNode
  afterIntro?: ReactNode
  className?: string
  titleClassName?: string
}

interface BackToTopProps {
  targetId?: string
  label?: string
  className?: string
}


/* =======================================
   CLASS NAMES
======================================= */

function classNames(
  ...values: Array<string | false | null | undefined>
): string {
  return values
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value,
        ),
    )
    .join(
      ' ',
    )
}


/* =======================================
   PAGE SHELL
======================================= */

export function GardenPage({
  children,
  className,
  id,
  narrow = false,
  as = 'main',
}: GardenPageProps) {
  const resolvedClassName =
    classNames(
      'garden-page',
      narrow &&
        'garden-page--narrow',
      className,
    )

  if (
    as ===
    'div'
  ) {
    return (
      <div
        role="main"
        id={id}
        className={resolvedClassName}
      >
        {children}
      </div>
    )
  }

  return (
    <main
      id={id}
      className={resolvedClassName}
    >
      {children}
    </main>
  )
}


/* =======================================
   PAGE NAVIGATION

   Back remembers the journey.
   Home remembers where the record lives.

   Navigation presentation belongs here,
   not inside individual pages.
======================================= */

export function GardenPageNavigation({
  journeyBackLabel,
  onJourneyBack,
  homeLabel,
  onHome,
  journeyBackIcon = '←',
  homeIcon = null,
  actions,
  className,
  ariaLabel = 'Page navigation',
}: GardenPageNavigationProps) {
  const showJourneyBack =
    Boolean(
      journeyBackLabel &&
      onJourneyBack,
    )

  const showHome =
    Boolean(
      homeLabel &&
      onHome,
    )

  if (
    !showJourneyBack &&
    !showHome &&
    !actions
  ) {
    return null
  }

  return (
    <nav
      className={
        classNames(
          'garden-page-navigation',
          className,
        )
      }
      aria-label={ariaLabel}
    >
      <div className="garden-page-navigation-links">
        {showJourneyBack && (
          <button
            type="button"
            className="garden-page-navigation-button garden-page-navigation-back"
            onClick={onJourneyBack}
          >
            {journeyBackIcon && (
              <span aria-hidden="true">
                {journeyBackIcon}
              </span>
            )}

            <span>
              {journeyBackLabel}
            </span>
          </button>
        )}

        {showHome && (
          <button
            type="button"
            className="garden-page-navigation-button garden-page-navigation-home"
            onClick={onHome}
          >
            {homeIcon && (
              <span aria-hidden="true">
                {homeIcon}
              </span>
            )}

            <span>
              {homeLabel}
            </span>
          </button>
        )}
      </div>

      {actions && (
        <div className="garden-page-navigation-actions">
          {actions}
        </div>
      )}
    </nav>
  )
}


/* =======================================
   PAGE HEADER
======================================= */

export function GardenPageHeader({
  eyebrow,
  title,
  intro,
  actions,
  afterIntro,
  className,
  titleClassName,
}: GardenPageHeaderProps) {
  return (
    <header
      className={
        classNames(
          'garden-header',
          className,
        )
      }
    >
      <div className="garden-header-copy">
        {eyebrow && (
          <div className="app-name">
            {eyebrow}
          </div>
        )}

        <h1
          className={
            classNames(
              'garden-title',
              titleClassName,
            )
          }
        >
          {title}
        </h1>

        {intro && (
          <div className="garden-subtitle">
            {intro}
          </div>
        )}

        {afterIntro}
      </div>

      {actions && (
        <div className="garden-page-header-actions">
          {actions}
        </div>
      )}
    </header>
  )
}


/* =======================================
   BACK TO TOP
======================================= */

export function BackToTop({
  targetId,
  label = 'Back to top',
  className,
}: BackToTopProps) {
  function handleBackToTop() {
    const prefersReducedMotion =
      typeof window !==
        'undefined' &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (
      targetId
    ) {
      const target =
        document.getElementById(
          targetId,
        )

      if (
        target
      ) {
        target.scrollIntoView({
          behavior:
            prefersReducedMotion
              ? 'auto'
              : 'smooth',

          block:
            'start',
        })

        return
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior:
        prefersReducedMotion
          ? 'auto'
          : 'smooth',
    })
  }

  return (
    <div
      className={
        classNames(
          'garden-back-to-top',
          className,
        )
      }
    >
      <button
        type="button"
        className="text-button"
        onClick={handleBackToTop}
      >
        ↑ {label}
      </button>
    </div>
  )
}
