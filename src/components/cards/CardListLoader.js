import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'

/**
 * Cards loader.
 */
function CardListLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)
  const lastUpdatedAtRef = useRef(syncStore?.lastUpdatedAt || '')

  /**
   * Load movie cards.
   */
  useEffect(() => {
    async function refreshCards () {
      if (!commonStore.isInitialized) {
        return
      }

      // don't update before data is loaded
      if (!syncStore?.lastUpdatedAt) {
        return
      }

      // nothing changed if lastUpdatedAt is set and not new
      const lastUpdatedAt = syncStore.lastUpdatedAt
      if (lastUpdatedAtRef.current === lastUpdatedAt && commonStore.cards.length > 0) {
        return
      }

      await commonStore.loadCards()
      lastUpdatedAtRef.current = lastUpdatedAt
    }

    refreshCards()
      .catch((e) => {
        console.error(e)
        notificationStore.error({ message: e.message })
      })

    return () => {
    }
  }, [commonStore, commonStore.isInitialized, syncStore?.lastUpdatedAt, notificationStore])

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
