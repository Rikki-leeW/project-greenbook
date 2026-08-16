import type {
  AppPage,
} from '../../types/navigation'


interface BottomNavigationProps {
  activePage: AppPage

  onNavigate: (
    page: AppPage,
  ) => void

  onOpenSatchel: () => void
}


interface BottomNavItem {
  page: AppPage

  label: string

  icon: string
}


const bottomItems:
  BottomNavItem[] = [
    {
      page:
        'gate',

      label:
        'Today',

      icon:
        '🌿',
    },

    {
      page:
        'plants',

      label:
        'Plants',

      icon:
        '🌱',
    },

    {
      page:
        'journal',

      label:
        'Journal',

      icon:
        '📖',
    },
  ]


export default function BottomNavigation({
  activePage,
  onNavigate,
  onOpenSatchel,
}: BottomNavigationProps) {
  return (
    <nav
      aria-label="Sprig quick navigation"
      style={{
        position:
          'fixed',

        left:
          0,

        right:
          0,

        bottom:
          0,

        zIndex:
          3000,

        display:
          'grid',

        gridTemplateColumns:
          'repeat(4, 1fr)',

        gap:
          0,

        minHeight:
          '58px',

        borderTop:
          '1px solid rgba(50, 75, 50, 0.2)',

        background:
          '#fffdf7',

        boxShadow:
          '0 -5px 18px rgba(35, 55, 35, 0.08)',
      }}
    >
      {bottomItems.map(
        (
          item,
        ) => {
          const isActive =
            activePage ===
            item.page


          return (
            <button
              key={
                item.page
              }
              type="button"
              onClick={() =>
                onNavigate(
                  item.page,
                )
              }
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                gap:
                  '2px',

                padding:
                  '7px 4px',

                border:
                  0,

                borderRight:
                  '1px solid rgba(50, 75, 50, 0.08)',

                background:
                  isActive
                    ? '#edf3e8'
                    : 'transparent',

                color:
                  '#304a32',

                fontWeight:
                  isActive
                    ? 800
                    : 600,

                cursor:
                  'pointer',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize:
                    '1.05rem',
                }}
              >
                {
                  item.icon
                }
              </span>

              <span
                style={{
                  fontSize:
                    '0.75rem',
                }}
              >
                {
                  item.label
                }
              </span>
            </button>
          )
        },
      )}


      {/* =======================================
          SATCHEL
      ======================================= */}

      <button
        type="button"
        onClick={
          onOpenSatchel
        }
        style={{
          display:
            'flex',

          flexDirection:
            'column',

          alignItems:
            'center',

          justifyContent:
            'center',

          gap:
            '2px',

          padding:
            '7px 4px',

          border:
            0,

          background:
            'transparent',

          color:
            '#304a32',

          fontWeight:
            700,

          cursor:
            'pointer',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize:
              '1.05rem',
          }}
        >
          ☰
        </span>

        <span
          style={{
            fontSize:
              '0.75rem',
          }}
        >
          Satchel
        </span>
      </button>
    </nav>
  )
}