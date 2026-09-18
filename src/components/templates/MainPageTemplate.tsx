import type {
  ReactNode,
} from 'react'

import GardenLayout from '../layout/GardenLayout'

import {
  BackToTop,
  GardenPage,
  GardenPageHeader,
  GardenPageNavigation,
} from '../layout/GardenPage'

import type {
  AppPage,
} from '../../types/navigation'


interface MainPageTemplateProps {
  activePage:
    AppPage

  onNavigate:
    (
      page:
        AppPage,
    ) => void

  pageId:
    string

  className?:
    string

  narrow?:
    boolean

  pageAs?:
    'div' | 'main'

  journeyBackLabel?:
    string | null

  onJourneyBack?:
    () => void

  homeLabel?:
    string

  onHome?:
    () => void

  navigationAriaLabel?:
    string

  navigationActions?:
    ReactNode

  eyebrow?:
    ReactNode

  title:
    ReactNode

  intro?:
    ReactNode

  headerActions?:
    ReactNode

  children:
    ReactNode

  showBackToTop?:
    boolean
}


export default function MainPageTemplate({
  activePage,
  onNavigate,
  pageId,
  className,
  narrow = false,
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

  children,

  showBackToTop = true,
}: MainPageTemplateProps) {
  const hasNavigation =
    Boolean(
      journeyBackLabel &&
      onJourneyBack,
    ) ||
    Boolean(
      homeLabel &&
      onHome,
    ) ||
    Boolean(
      navigationActions,
    )


  return (
    <GardenLayout
      activePage={
        activePage
      }
      onNavigate={
        onNavigate
      }
    >
      <GardenPage
        id={
          pageId
        }
        className={
          className
        }
        narrow={
          narrow
        }
        as={
          pageAs
        }
      >
{hasNavigation && (
  <>
    <GardenPageNavigation
      journeyBackLabel={
        journeyBackLabel ?? undefined
      }
      onJourneyBack={
        onJourneyBack
      }
      homeLabel={
        homeLabel
      }
      onHome={
        onHome
      }
      ariaLabel={
        navigationAriaLabel
      }
    />

    {navigationActions}
  </>
)}


        <GardenPageHeader
          eyebrow={
            eyebrow
          }
          title={
            title
          }
          intro={
            intro
          }
          actions={
            headerActions
          }
        />


        {children}


        {showBackToTop && (
          <BackToTop
            targetId={
              pageId
            }
          />
        )}
      </GardenPage>
    </GardenLayout>
  )
}


