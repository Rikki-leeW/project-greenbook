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
        style={{
          position:
            'fixed',

          top:
            '14px',

          right:
            '14px',

          zIndex:
            4000,

          padding:
            '9px 12px',

          border:
            '1px solid rgba(50, 75, 50, 0.24)',

          borderRadius:
            '10px',

          background:
            '#fffdf7',

          color:
            '#304a32',

          fontWeight:
            800,

          cursor:
            'pointer',

          boxShadow:
            '0 5px 14px rgba(35, 55, 35, 0.12)',
        }}
      >
        ☰ Satchel
      </button>


      {/* =======================================
          PAGE
      ======================================= */}

      <main
        style={{
          paddingBottom:
            '74px',
        }}
      >
        {activePage !==
          'gate' && (
          <button
            type="button"
            className="garden-return-button"
            onClick={() =>
              handleNavigate(
                'gate',
              )
            }
          >
            ← Return to the garden
          </button>
        )}


        {children}
      </main>


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