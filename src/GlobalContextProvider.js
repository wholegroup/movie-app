import globalContext from './globalContext.js'
import StorageService from './StorageService.js'
import ApiService from './ApiService.js'
import CommonStore from './CommonStore.js'
import SyncStore from './SyncStore.js'
import { useEffect, useRef } from 'react'

function GlobalContextProvider ({ children, ...pageProps }) {
  // creating context
  const commonContextRef = useRef(null)
  if (commonContextRef.current === null) {
    if (typeof window !== 'undefined') {
      const storageService = new StorageService()
      const apiService = new ApiService()
      const commonStore = new CommonStore(storageService)
      const syncStore = new SyncStore(storageService, apiService)
      commonContextRef.current = {
        storageService,
        apiService,
        syncStore,
        commonStore
      }
    } else {
      // server rendering
      commonContextRef.current = {
        commonStore: new CommonStore(null)
      }
    }

    /**
     * Initialize predefined data.
     */
    if (pageProps.commonStore) {
      const { commonStore: initCommonStore } = pageProps
      const { commonStore } = commonContextRef.current

      if (initCommonStore.movie) {
        commonStore.setMovie(initCommonStore.movie)
      }
      if (initCommonStore.votes) {
        commonStore.setVotes(initCommonStore.votes)
      }
      if (initCommonStore.images) {
        commonStore.setImages(initCommonStore.images)
      }
    }
  }

  useEffect(() => {
    // initialize after mounting
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
