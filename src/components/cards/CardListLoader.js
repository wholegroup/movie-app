import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'

/**
 * Cards loader.
 */
function CardListLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

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
      await commonStore.loadCards()
    }

    refreshCards()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })

    return () => {
    }
  }, [commonStore, commonStore.isInitialized, syncStore?.moviesUpdatedAt, notificationStore])

  /**
   * Load details.
   */
  useEffect(() => {
    async function refreshDetails () {
      if (!commonStore.isInitialized) {
        return
      }

      // caching has to be made in store
      await commonStore.loadAllDetails()
    }

    refreshDetails()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })
  }, [commonStore, commonStore.isInitialized, syncStore?.profileUpdatedAt, notificationStore])

  return null
}

export default observer(CardListLoader)
