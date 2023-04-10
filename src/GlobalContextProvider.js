import globalContext from './globalContext.js'
import StorageService from './StorageService.js'
import CommonStore from './CommonStore.js'
import SyncStore from './SyncStore.js'

// App Context
let commonContextValue

// different for server/client
if (typeof window !== 'undefined') {
  const storageService = new StorageService()
  const commonStore = new CommonStore(storageService)
  const syncStore = new SyncStore(storageService)
  commonContextValue = {
    storageService,
    syncStore,
    commonStore: commonStore.makeReady(async () => {
      await storageService.makeReadyAsync()
      await syncStore.makeReadyAsync()
    })
  }
} else {
  commonContextValue = {}
}

function GlobalContextProvider ({ children }) {
  return (
    <globalContext.Provider value={commonContextValue}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContextProvider
