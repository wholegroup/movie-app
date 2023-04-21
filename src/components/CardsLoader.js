import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'

function CardsLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)
  const lastUpdatedAtRef = useRef(syncStore?.lastUpdatedAt || '')

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
    }
  }, [commonStore, commonStore?.isInitialized, syncStore?.lastUpdatedAt, notificationStore])

  return null
}

export default observer(CardsLoader)
