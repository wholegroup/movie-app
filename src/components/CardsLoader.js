import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'

/**
 * Cards loader.
 */
function CardsLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)
  const lastUpdatedAtRef = useRef(syncStore?.lastUpdatedAt || '')

  // Load cards initially
  useEffect(() => {
    async function load () {
      if (!commonStore.isInitialized) {
        return
      }

      // nothing changed if lastUpdatedAt is set and not new
      const lastUpdatedAt = syncStore.lastUpdatedAt
      if (lastUpdatedAt && lastUpdatedAtRef.current === lastUpdatedAt && commonStore.cards.length > 0) {
        return
      }

      await commonStore.loadCards()
      lastUpdatedAtRef.current = lastUpdatedAt
    }

    load()
      .catch((e) => notificationStore.error({ message: e.message }))

    return () => {
      commonStore.setRefreshTs(0)
    }
  }, [commonStore, commonStore.isInitialized, syncStore?.lastUpdatedAt, notificationStore])

  // Refresh cards by commonStore.refreshTs
  useEffect(() => {
    async function refresh () {
      if (!commonStore.refreshTs) {
        return
      }

      await commonStore.loadCards()
    }

    refresh()
      .catch((e) => notificationStore.error({ message: e.message }))
  }, [commonStore, commonStore.refreshTs, notificationStore])

  return null
}

export default observer(CardsLoader)
