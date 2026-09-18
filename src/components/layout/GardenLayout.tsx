import {
  useState,
  type ReactNode,
} from 'react'

import type {
  AppPage,
} from '../../types/navigation'

import BottomNavigation from '../navigation/BottomNavigation'

import SatchelMenu from '../navigation/SatchelMenu'


type LibraryDestination =
  | 'library'
  | 'growing-recipes'
  | 'ingredients'
  | 'products'


interface GardenLayoutProps {
  children: ReactNode

  activePage: AppPage

  onNavigate: (
    page: AppPage,
    libraryView?: LibraryDestination,
  ) => void
}


export default function GardenLayout({
  children,
  activePage,
  onNavigate,
}: GardenLayoutProps) {

  const [
    isSatchelOpen,
    setIsSatchelOpen,
  ] =
    useState(false)


  function handleNavigate(
    page: AppPage,
    libraryView?: LibraryDestination,
  ) {
    setIsSatchelOpen(
      false,
    )

    onNavigate(
      page,
      libraryView,
    )
  }


  return (
    <>

      {/* =======================================
          TOP SATCHEL BUTTON
      ======================================= */}

      <button
        type="button"
        onClick={() =>
          setIsSatchelOpen(
            true,
          )
        }
        aria-label="Open Sprig Satchel"
        className="garden-satchel-toggle"
      >
        ☰ Satchel
      </button>


      {/* =======================================
          PAGE
      ======================================= */}

      <div className="garden-layout-content">
        {children}
      </div>


      {/* =======================================
          SIMPLE BOTTOM NAVIGATION
      ======================================= */}

      <BottomNavigation
        activePage={
          activePage
        }

        onNavigate={
          handleNavigate
        }

        onOpenSatchel={() =>
          setIsSatchelOpen(
            true,
          )
        }
      />


      {/* =======================================
          SATCHEL
      ======================================= */}

      <SatchelMenu
        isOpen={
          isSatchelOpen
        }

        onClose={() =>
          setIsSatchelOpen(
            false,
          )
        }

        onNavigate={
          handleNavigate
        }
      />

    </>
  )
}
