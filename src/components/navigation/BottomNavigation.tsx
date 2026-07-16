import type { AppPage } from '../../types/navigation'

import paperBg from '../../images/navigation/paper-bg.png'

import gateIcon from '../../images/navigation/icon-gate.png'
import plantsIcon from '../../images/navigation/icon-plants.png'
import journalIcon from '../../images/navigation/icon-journal.png'
import harvestIcon from '../../images/navigation/icon-harvest.png'
import libraryIcon from '../../images/navigation/icon-library.png'

interface BottomNavigationProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
}

export default function BottomNavigation({
  activePage,
  onNavigate,
}: BottomNavigationProps) {

  const items = [
    {
      page: 'gate' as AppPage,
      label: 'Gate',
      icon: gateIcon,
    },
    {
      page: 'plants' as AppPage,
      label: 'Plants',
      icon: plantsIcon,
    },
    {
      page: 'journal' as AppPage,
      label: 'Journal',
      icon: journalIcon,
    },
    {
      page: 'harvest' as AppPage,
      label: 'Harvest',
      icon: harvestIcon,
    },
    {
      page: 'library' as AppPage,
      label: 'Library',
      icon: libraryIcon,
    },
  ]

  return (
    <nav className="bottom-navigation">

      <img
        src={paperBg}
        className="navigation-paper"
        alt=""
        aria-hidden="true"
      />

      <div className="navigation-buttons">

        {items.map(item => {

          const active = activePage === item.page

          return (

            <button
              key={item.page}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >

              <img
                src={item.icon}
                className="nav-icon"
                alt=""
              />

              <span>{item.label}</span>

            </button>

          )

        })}

      </div>

    </nav>
  )
}