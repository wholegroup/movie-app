import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'

/**
 * Cards loader.
 */
function CardListLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)
  const moviesUpdatedAtRef = useRef(syncStore?.moviesUpdatedAt || '')

  /**
   * Load movie cards.
   */
  useEffect(() => {
    async function refreshCards () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is loaded
      if (!syncStore?.moviesUpdatedAt) {
        return
      }

      // nothing changed if moviesUpdatedAt is set and not new
      const moviesUpdatedAt = syncStore.moviesUpdatedAt
      if (moviesUpdatedAtRef.current === moviesUpdatedAt && commonStore.cards.length > 0) {
        return
      }

      await commonStore.loadCards()
      moviesUpdatedAtRef.current = moviesUpdatedAt
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

      if (commonStore.allDetails.length > 0) {
        return
      }

      await commonStore.loadAllDetails()
    }

    refreshDetails()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })
  }, [commonStore, commonStore.isInitialized, notificationStore])

  return null
}

export default observer(CardListLoader)
