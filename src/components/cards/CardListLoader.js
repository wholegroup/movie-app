import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'

/**
 * Cards loader.
 */
function CardListLoader () {
  const { cardListStore, commonStore, syncStore, notificationStore } = useContext(cardListContext)

  /**
   * Initialize filters.
   */
  useEffect(() => {
    if (!commonStore.isInitialized) {
      return
    }

    cardListStore.updateFilters()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })
  }, [cardListStore, commonStore.isInitialized, notificationStore])

  /**
   * Load details.
   * It has to be called before bellow loading cards to avoid blinking movie counter.
   */
  useEffect(() => {
    async function refreshDetails () {
      if (!commonStore.isInitialized) {
        return
      }

      await cardListStore.loadAllDetails()
    }

    refreshDetails()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })
  }, [cardListStore, commonStore.isInitialized, syncStore?.profileUpdatedAt, notificationStore])

  /**
   * Load movie cards.
   */
  useEffect(() => {
    async function refreshCards () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is first-loaded because it could be filled by SSR
      // but only if cardListStore does have cards
      // because after resetting user data movies in indexedDb are still exist even moviesUpdatedAt is empty,
      // and we need to load them
      if (!syncStore?.moviesUpdatedAt && cardListStore.cards > 0) {
        return
      }

      await cardListStore.loadCards()
    }

    refreshCards()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })

    return () => {
    }
  }, [cardListStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt, syncStore?.changesHash, notificationStore])

  return null
}

export default observer(CardListLoader)
