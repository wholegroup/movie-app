import { action } from 'storybook/actions'
import globalContext from '@/src/context/globalContext.js'
import CardListStore from '@/src/components/cards/CardListStore.js'
import StorageService from '@/src/context/StorageService.js'
import NotificationStore from '@/src/context/NotificationStore.js'
import FiltersPanel from './FiltersPanel.js'
import cardListContext from './cardListContext.js'
import CommonStore from '@/src/context/CommonStore.js'

export default {
  component: FiltersPanel,
  decorators: [
    (Story) => {
      const commonStore = Object.assign(new CommonStore(null, null), {})
      const notificationStore = Object.assign(new NotificationStore(), {
        error: action('notificationStore.error')
      })
      const storageService = Object.assign(new StorageService(), {
        getSettings: () => Promise.resolve(null),
        setSettings: () => Promise.resolve(null)
      })
      const cardListStore = Object.assign(new CardListStore(storageService), {
        cards: [{
          year: 2020,
          genres: ['Action', 'Comedy']
        }, {
          year: 2021,
          genres: ['Action', 'Drama']
        }, {
          year: 2022,
          genres: ['Adventure']
        }, {
          year: 2023,
          genres: ['Sci-fi']
        }, {
          year: 2024,
          genres: ['Biography', 'Comedy']
        }]
      })
      return (
        <globalContext.Provider value={{ storageService, commonStore, notificationStore }}>
          <cardListContext.Provider value={{ cardListStore, notificationStore }}>
            <Story />
          </cardListContext.Provider>
        </globalContext.Provider>
      )
    },
    story => <div>{story()}</div>
  ]
}

export const Default = {}
