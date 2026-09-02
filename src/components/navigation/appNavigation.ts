import type {
  AppPage,
} from '../../types/navigation'


export type SprigPageStatus =
  | 'live'
  | 'coming-later'


export type SprigLibraryView =
  | 'home'
  | 'growing-recipes'
  | 'ingredients'
  | 'products'


export type SprigCalendarView =
  | 'calculator'


export interface SprigNavigationItem {
  id: string

  label: string

  icon: string

  status: SprigPageStatus

  page?: AppPage

  /*
   * Optional destination inside a major
   * Sprig page.
   *
   * Garden Library uses this when Sprig
   * needs to open a particular shelf
   * directly.
   */
  libraryView?: SprigLibraryView

  /*
   * Optional doorway into a particular part
   * of Calendar.
   *
   * Calendar remains the real destination.
   */
  calendarView?: SprigCalendarView

  note?: string
}


export interface SprigNavigationSection {
  id: string

  title: string

  items: SprigNavigationItem[]
}


/**
 * ========================================
 * SPRIG APPLICATION MAP
 * ========================================
 *
 * This is the central map of Sprig.
 *
 * The Satchel reads from this file rather
 * than maintaining its own independent
 * navigation list.
 *
 * Important architectural rule:
 *
 * Growing is one gardener-facing
 * destination.
 *
 * Within Growing:
 *
 * WHERE IT GROWS
 *   Growing Places
 *
 * WHAT IT GROWS IN
 *   My Recipes
 *   Bought Mixes
 *   Growing Systems
 *   Ground Types
 *
 * Ingredients and Products remain reusable
 * Library records rather than becoming
 * top-level garden destinations.
 *
 * The internal AppPage route for Growing
 * currently remains "growing-places" for
 * backwards compatibility. The gardener
 * does not need to know or care what the
 * internal route is called.
 */
export const sprigNavigation:
  SprigNavigationSection[] = [

    /* ========================================
       TODAY
    ======================================== */

    {
      id:
        'today',

      title:
        'Today',

      items: [
        {
          id:
            'today-in-the-garden',

          label:
            'Today in the Garden',

          icon:
            '🌿',

          status:
            'live',

          page:
            'gate',

          note:
            'Home, garden overview and future reminders',
        },

        {
          id:
            'search-sprig',

          label:
            'Search Sprig',

          icon:
            '🔎',

          status:
            'live',

          page:
            'search',

          note:
            'Find anything Sprig remembers across your garden stories, records and plans',
        },
      ],
    },


    /* ========================================
       MY GARDEN
    ======================================== */

    {
      id:
        'my-garden',

      title:
        'My Garden',

      items: [
        {
          id:
            'plants',

          label:
            'Plants',

          icon:
            '🌱',

          status:
            'live',

          page:
            'plants',
        },

        {
          id:
            'comparisons',

          label:
            'Comparisons',

          icon:
            '📊',

          status:
            'live',

          page:
            'comparisons',

          note:
            'Saved side-by-side views of your garden stories',
        },

        {
          id:
            'growing',

          label:
            'Growing',

          icon:
            '🪴',

          status:
            'live',

          page:
            'growing-places',

          note:
            'Where the garden grows and what it grows in',
        },

        {
          id:
            'garden-library',

          label:
            'Garden Library',

          icon:
            '📚',

          status:
            'live',

          page:
            'library',

          libraryView:
            'home',

          note:
            'Reusable ingredients, products and other garden reference records',
        },
      ],
    },


    /* ========================================
       CHRONICLE
    ======================================== */

    {
      id:
        'chronicle',

      title:
        'Chronicle',

      items: [
        {
          id:
            'garden-journal',

          label:
            'Garden Journal',

          icon:
            '📖',

          status:
            'live',

          page:
            'journal',
        },

        {
          id:
            'harvests',

          label:
            'Harvests',

          icon:
            '🧺',

          status:
            'live',

          page:
            'harvest',
        },

        {
          id:
            'garden-trials',

          label:
            'Garden Trials',

          icon:
            '🧪',

          status:
            'live',

          page:
            'garden-trials',

          note:
            'Questions, evidence and experiments gathered from the real garden',
        },

        {
          id:
            'calendar-planning',

          label:
            'Calendar & Planning',

          icon:
            '📅',

          status:
            'live',

          page:
            'calendar',

          note:
            'Your garden through time: what happened, what is expected and what you are planning',
        },

        {
          id:
            'sowing-harvest-calculator',

          label:
            'Sowing & Harvest Calculator',

          icon:
            '🧮',

          status:
            'live',

          page:
            'calendar',

          calendarView:
            'calculator',

          note:
            'Do the garden maths: work forwards or backwards from sowing, planting and harvest dates',
        },
      ],
    },


    /* ========================================
       GARDEN KNOWLEDGE
    ======================================== */

    {
      id:
        'garden-knowledge',

      title:
        'Garden Knowledge',

      items: [
        {
          id:
            'garden-notes',

          label:
            'Garden Notes',

          icon:
            '📝',

          status:
            'live',

          page:
            'garden-notes',

          note:
            'Capture thoughts, questions, observations and old notes without forcing them into garden history',
        },

        {
          id:
            'garden-almanac',

          label:
            'Garden Almanac',

          icon:
            '📖',

          status:
            'live',

          page:
            'garden-almanac',

          note:
            'What your own garden is beginning to teach you, gathered from real records and saved knowledge',
        },

        {
          id:
            'plant-reference',

          label:
            'Plant Reference',

          icon:
            '🌿',

          status:
            'live',

          page:
            'plant-reference',

          note:
            'Reusable knowledge about crops and varieties, kept separate from individual Plant Stories',
        },

        {
          id:
            'saved-tips',

          label:
            'Saved Tips & Sources',

          icon:
            '🔖',

          status:
            'live',

          page:
            'saved-sources',

          note:
            'Advice, links, screenshots and useful finds with their provenance kept attached',
        },
      ],
    },


    /* ========================================
       PHOTOGRAPHS
    ======================================== */

    {
      id:
        'photographs',

      title:
        'Photographs',

      items: [
        {
          id:
            'garden-gallery',

          label:
            'Garden Gallery',

          icon:
            '📷',

          status:
            'live',

          page:
            'garden-gallery',

          note:
            'One visual doorway into photographs remembered throughout Sprig',
        },
      ],
    },


    /* ========================================
       GARDEN STORES
    ======================================== */

    {
      id:
        'garden-stores',

      title:
        'Garden Stores',

      items: [
        {
          id:
            'purchases',

          label:
            'Purchases',

          icon:
            '🛒',

          status:
            'coming-later',

          note:
            'Purchase records and history',
        },

        {
          id:
            'supplies',

          label:
            'Supplies',

          icon:
            '📦',

          status:
            'coming-later',
        },

        {
          id:
            'suppliers',

          label:
            'Suppliers',

          icon:
            '🏡',

          status:
            'coming-later',
        },

        {
          id:
            'costs-allocations',

          label:
            'Costs & Allocations',

          icon:
            '💰',

          status:
            'coming-later',
        },
      ],
    },


    /* ========================================
       HISTORY
    ======================================== */

    {
      id:
        'history',

      title:
        'History',

      items: [
        {
          id:
            'completed-plant-stories',

          label:
            'Completed Plant Stories',

          icon:
            '🍂',

          status:
            'coming-later',
        },

        {
          id:
            'archives',

          label:
            'Archives',

          icon:
            '🗄️',

          status:
            'coming-later',

          note:
            'Archived growing records, ingredients, products and future records',
        },
      ],
    },


    /* ========================================
       SPRIG
    ======================================== */

    {
      id:
        'sprig',

      title:
        'Sprig',

      items: [
        {
          id:
            'settings',

          label:
            'Settings',

          icon:
            '⚙️',

          status:
            'coming-later',
        },

        {
          id:
            'backup-restore',

          label:
            'Backup & Restore',

          icon:
            '💾',

          status:
            'live',

          page:
            'backup',

          note:
            'Keep a safe portable copy of your whole Sprig garden',
        },

        {
          id:
            'help',

          label:
            'Help',

          icon:
            '❔',

          status:
            'coming-later',
        },
      ],
    },
  ]