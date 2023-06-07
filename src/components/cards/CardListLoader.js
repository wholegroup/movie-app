import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'

/**
 * Cards loader.
 */
function CardListLoader () {
  const { cardListStore, commonStore, syncStore, notificationStore } = useContext(cardListContext)

  /**
   * Load movie cards.
   */
  useEffect(() => {
    async function refreshCards () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is first-loaded because it could be initialized by SSR
      if (!syncStore?.moviesUpdatedAt) {
        return
      }

      // caching has to be made in store
      await cardListStore.loadCards()
    }

    refreshCards()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })

    return () => {
    }
  }, [cardListStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt, notificationStore])

  /**
   * Load details.
   */
  useEffect(() => {
    async function refreshDetails () {
      if (!commonStore.isInitialized) {
        return
      }

      // caching has to be made in store
      await cardListStore.loadAllDetails()
    }

    refreshDetails()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })
  }, [cardListStore, commonStore.isInitialized, syncStore?.profileUpdatedAt, notificationStore])

  return null
}

export default observer(CardListLoader)
