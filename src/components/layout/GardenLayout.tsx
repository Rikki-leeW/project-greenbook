import type { ReactNode } from 'react'
import type { AppPage } from '../../types/navigation'
import BottomNavigation from '../navigation/BottomNavigation'

interface GardenLayoutProps {
  children: ReactNode
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export default function GardenLayout({
  children,
  activePage,
  onNavigate,
}: GardenLayoutProps) {
  return (
    <>
      <main>
        {activePage !== 'gate' && (
          <button
            type="button"
            className="garden-return-button"
            onClick={() => onNavigate('gate')}
          >
            ← Return to the garden
          </button>
        )}

        {children}
      </main>

      <BottomNavigation
        activePage={activePage}
        onNavigate={onNavigate}
      />
    </>
  )
}