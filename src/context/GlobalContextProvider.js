import { useEffect, useRef } from 'react'
import StorageService from './StorageService.js'
import ApiService from './ApiService.js'
import CommonStore from './CommonStore.js'
import SyncStore from './SyncStore.js'
import NotificationStore from './NotificationStore.js'
import globalContext from './globalContext.js'

function GlobalContextProvider ({ children, ...pageProps }) {
  // creating context
  const commonContextRef = useRef(null)
  if (commonContextRef.current === null) {
    if (typeof window !== 'undefined') {
      const storageService = new StorageService()
      const apiService = new ApiService()
      const commonStore = new CommonStore(storageService, apiService)
      const syncStore = new SyncStore(storageService, apiService)
      const notificationStore = new NotificationStore()
      commonContextRef.current = {
        storageService,
        apiService,
        syncStore,
        commonStore,
        notificationStore
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
    const { commonStore, syncStore } = commonContextRef.current

    commonStore.makeReady(async () => {
      await storageService.makeReadyAsync()
      await syncStore.makeReadyAsync()
    })

    return () => {
      // dispose resources after unmount
      commonStore.disposeAsync(async () => {
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
