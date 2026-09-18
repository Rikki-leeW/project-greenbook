import type { ReactNode } from 'react'

import GardenLayout from '../layout/GardenLayout'
import {
  BackToTop,
  GardenPage,
  GardenPageHeader,
  GardenPageNavigation,
} from '../layout/GardenPage'

import type { AppPage } from '../../types/navigation'

interface MultiPageTemplateProps {
  children: ReactNode
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  pageId: string
  className?: string
  pageAs?: 'div' | 'main'
  journeyBackLabel?: string | null
  onJourneyBack?: () => void
  homeLabel?: string
  onHome?: () => void
  navigationAriaLabel?: string
  navigationActions?: ReactNode
  eyebrow: ReactNode
  title: ReactNode
  intro?: ReactNode
  headerActions?: ReactNode
  headerClassName?: string
  subNavigation?: ReactNode
  showBackToTop?: boolean
}

export default function MultiPageTemplate({
  children,
  activePage,
  onNavigate,
  pageId,
  className,
  pageAs = 'main',
  journeyBackLabel,
  onJourneyBack,
  homeLabel,
  onHome,
  navigationAriaLabel,
  navigationActions,
  eyebrow,
  title,
  intro,
  headerActions,
  headerClassName,
  subNavigation,
  showBackToTop = true,
}: MultiPageTemplateProps) {
  const hasNavigation = Boolean(
    (journeyBackLabel && onJourneyBack) ||
    (homeLabel && onHome) ||
    navigationActions,
  )

  return (
    <GardenLayout
      activePage={activePage}
      onNavigate={onNavigate}
    >
      <GardenPage
        id={pageId}
        className={className}
        as={pageAs}
      >
        {hasNavigation && (
          <GardenPageNavigation
            journeyBackLabel={journeyBackLabel ?? undefined}
            onJourneyBack={onJourneyBack}
            homeLabel={homeLabel}
            onHome={onHome}
            ariaLabel={navigationAriaLabel}
            actions={navigationActions}
          />
        )}

        <GardenPageHeader
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          actions={headerActions}
          className={headerClassName}
        />

        {subNavigation}

        {children}

        {showBackToTop && (
          <BackToTop targetId={pageId} />
        )}
      </GardenPage>
    </GardenLayout>
  )
}
