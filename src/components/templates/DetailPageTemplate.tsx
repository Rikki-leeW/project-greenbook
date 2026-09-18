import type { ReactNode } from 'react'
import GardenLayout from '../layout/GardenLayout'
import { GardenPageHeader, GardenPageNavigation } from '../layout/GardenPage'
import type { AppPage } from '../../types/navigation'

interface DetailPageTemplateProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  pageId?: string
  className?: string
  as?: 'div' | 'main'
  children: ReactNode
  eyebrow?: ReactNode
  title?: ReactNode
  intro?: ReactNode
  headerActions?: ReactNode
  headerAfterIntro?: ReactNode
  headerClassName?: string
  journeyBackLabel?: string | null
  onJourneyBack?: () => void
  homeLabel?: string | null
  onHome?: () => void
  navigationActions?: ReactNode
  navigationAriaLabel?: string
}

export default function DetailPageTemplate({
  activePage,
  onNavigate,
  pageId,
  className,
  as = 'div',
  children,
  eyebrow,
  title,
  intro,
  headerActions,
  headerAfterIntro,
  headerClassName,
  journeyBackLabel,
  onJourneyBack,
  homeLabel,
  onHome,
  navigationActions,
  navigationAriaLabel = 'Detail page navigation',
}: DetailPageTemplateProps) {
  const PageElement = as

  return (
    <GardenLayout activePage={activePage} onNavigate={onNavigate}>
      <PageElement role={as === 'div' ? 'main' : undefined} id={pageId} className={['garden-detail-page', className].filter(Boolean).join(' ')}>
        <GardenPageNavigation
          journeyBackLabel={journeyBackLabel}
          onJourneyBack={onJourneyBack}
          homeLabel={homeLabel}
          onHome={onHome}
          actions={navigationActions}
          ariaLabel={navigationAriaLabel}
        />

        {title !== undefined && (
          <GardenPageHeader
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            actions={headerActions}
            afterIntro={headerAfterIntro}
            className={headerClassName}
          />
        )}

        {children}
      </PageElement>
    </GardenLayout>
  )
}
