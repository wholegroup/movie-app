import { useEffect, useRef } from 'react'
import CommonService from './CommonService.js'
import StorageService from './StorageService.js'
import ApiService from './ApiService.js'
import CommonStore from './CommonStore.js'
import SyncStore from './SyncStore.js'
import NotificationStore from './NotificationStore.js'
import EventStore from './EventStore.js'
import globalContext from './globalContext.js'

function GlobalContextProvider ({ children, ...pageProps }) {
  // creating context
  const commonContextRef = useRef(null)
  if (commonContextRef.current === null) {
    if (typeof window !== 'undefined') {
      const storageService = new StorageService()
      const apiService = new ApiService()
      const commonService = new CommonService(storageService, apiService)
      const commonStore = new CommonStore(storageService, apiService)
      const syncStore = new SyncStore(commonService, storageService, apiService)
      const notificationStore = new NotificationStore()
      const eventStore = new EventStore(syncStore)
      commonContextRef.current = {
        storageService,
        apiService,
        syncStore,
        commonStore,
        notificationStore,
        eventStore
      }
    } else {
      // server rendering
      commonContextRef.current = {
        commonStore: Object.assign(new CommonStore(null, null), {
          isInitialized: true
        })
      }
    }

    /**
     * Initialize predefined data.
     */
    if (pageProps.commonStore) {
      commonContextRef.current.commonStore = Object.assign(
        commonContextRef.current.commonStore, pageProps.commonStore)
    }
  }

  useEffect(() => {
    // initialize store/service only after mounting
    const { storageService } = commonContextRef.current
    const { commonStore, syncStore, eventStore } = commonContextRef.current

    commonStore.makeReady(async () => {
      await storageService.makeReadyAsync()
      await syncStore.makeReadyAsync()
      await eventStore.subscribe()
    })

    return () => {
      // dispose resources after unmount
      commonStore.disposeAsync(async () => {
        await eventStore.unsubscribe()
        await syncStore.disposeAsync()
        await storageService.disposeAsync()
      }).catch(console.error)
    }
  }, [])

  return (
    <globalContext.Provider value={commonContextRef.current}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContextProvider
