import type { AppPage } from '../../types/navigation'


export type SprigPageStatus =
  | 'live'
  | 'coming-later'


export interface SprigNavigationItem {
  id: string
  label: string
  icon: string
  status: SprigPageStatus
  page?: AppPage
  note?: string
}


export interface SprigNavigationSection {
  id: string
  title: string
  items: SprigNavigationItem[]
}


/*
========================================
SPRIG APPLICATION MAP
========================================

This is the central map of Sprig.

The Satchel reads from this file rather
than maintaining its own list of pages.

When a future page is built:

1. Add its route to AppPage.
2. Give the item its page value here.
3. Change status to 'live'.

The Satchel will then automatically make
that destination available.

Future navigation tools can also read
from this same map.
*/


export const sprigNavigation:
  SprigNavigationSection[] = [

    /*
    ========================================
    TODAY
    ========================================
    */

    {
      id: 'today',
      title: 'Today',

      items: [
        {
          id: 'today-in-the-garden',
          label: 'Today in the Garden',
          icon: '🌿',
          status: 'live',
          page: 'gate',
          note:
            'Home, garden overview and future reminders',
        },
      ],
    },


    /*
    ========================================
    MY GARDEN
    ========================================
    */

    {
      id: 'my-garden',
      title: 'My Garden',

      items: [
        {
          id: 'plants',
          label: 'Plants',
          icon: '🌱',
          status: 'live',
          page: 'plants',
        },

        {
          id: 'growing-places',
          label: 'Growing Places',
          icon: '🪴',
          status: 'live',
          page: 'growing-places',
          note:
            'Beds, pots, bags and all the places your garden grows',
        },

        {
          id: 'growing-recipes',
          label: 'Growing Recipes',
          icon: '🧺',
          status: 'live',
          page: 'library',
          note:
            'Open through the Garden Library',
        },

        {
          id: 'ingredients',
          label: 'Ingredients',
          icon: '🌾',
          status: 'live',
          page: 'library',
          note:
            'Open through the Garden Library',
        },

        {
          id: 'products',
          label: 'Products',
          icon: '🧴',
          status: 'live',
          page: 'library',
          note:
            'Open through the Garden Library',
        },

        {
          id: 'garden-library',
          label: 'Garden Library',
          icon: '📚',
          status: 'live',
          page: 'library',
          note:
            'Recipes, ingredients and products',
        },
      ],
    },


    /*
    ========================================
    CHRONICLE
    ========================================
    */

    {
      id: 'chronicle',
      title: 'Chronicle',

      items: [
        {
          id: 'garden-journal',
          label: 'Garden Journal',
          icon: '📖',
          status: 'live',
          page: 'journal',
        },

        {
          id: 'harvests',
          label: 'Harvests',
          icon: '🧺',
          status: 'live',
          page: 'harvest',
        },

        {
          id: 'garden-trials',
          label: 'Garden Trials',
          icon: '🧪',
          status: 'coming-later',
        },

        {
          id: 'calendar-planning',
          label: 'Calendar & Planning',
          icon: '📅',
          status: 'coming-later',
        },
      ],
    },


    /*
    ========================================
    GARDEN KNOWLEDGE
    ========================================
    */

    {
      id: 'garden-knowledge',
      title: 'Garden Knowledge',

      items: [
        {
          id: 'garden-notes',
          label: 'Garden Notes / Almanac',
          icon: '📚',
          status: 'coming-later',
          note:
            'Your growing knowledge, saved conversations and collected notes',
        },

        {
          id: 'plant-reference',
          label: 'Plant Reference',
          icon: '🌿',
          status: 'coming-later',
          note:
            'Reusable knowledge about crops and varieties',
        },

        {
          id: 'saved-tips',
          label: 'Saved Tips & Sources',
          icon: '🔖',
          status: 'coming-later',
          note:
            'Facebook tips, links, articles and other useful finds',
        },
      ],
    },


    /*
    ========================================
    PHOTOGRAPHS
    ========================================
    */

    {
      id: 'photographs',
      title: 'Photographs',

      items: [
        {
          id: 'garden-gallery',
          label: 'Garden Gallery',
          icon: '📷',
          status: 'coming-later',
          note:
            'One visual doorway into photographs already stored throughout Sprig',
        },
      ],
    },


    /*
    ========================================
    GARDEN STORES
    ========================================
    */

    {
      id: 'garden-stores',
      title: 'Garden Stores',

      items: [
        {
          id: 'purchases',
          label: 'Purchases',
          icon: '🛒',
          status: 'coming-later',
          note:
            'Purchase records and history',
        },

        {
          id: 'supplies',
          label: 'Supplies',
          icon: '📦',
          status: 'coming-later',
        },

        {
          id: 'suppliers',
          label: 'Suppliers',
          icon: '🏡',
          status: 'coming-later',
        },

        {
          id: 'costs-allocations',
          label: 'Costs & Allocations',
          icon: '💰',
          status: 'coming-later',
        },
      ],
    },


    /*
    ========================================
    HISTORY
    ========================================
    */

    {
      id: 'history',
      title: 'History',

      items: [
        {
          id: 'completed-plant-stories',
          label: 'Completed Plant Stories',
          icon: '🍂',
          status: 'coming-later',
        },

        {
          id: 'archives',
          label: 'Archives',
          icon: '🗄️',
          status: 'coming-later',
          note:
            'Archived recipes, ingredients, products and future records',
        },
      ],
    },


    /*
    ========================================
    SPRIG
    ========================================
    */

    {
      id: 'sprig',
      title: 'Sprig',

      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          status: 'coming-later',
        },

        {
          id: 'backup-export',
          label: 'Backup & Export',
          icon: '💾',
          status: 'coming-later',
          note:
            'Important before Sprig becomes your everyday garden record',
        },

        {
          id: 'help',
          label: 'Help',
          icon: '❔',
          status: 'coming-later',
        },
      ],
    },
  ]