import globalContext from './globalContext.js'
import StorageService from './StorageService.js'
import CommonStore from './CommonStore.js'

// App Context
let commonContextValue

// different for server/client
if (typeof window !== 'undefined') {
  const storageService = new StorageService()
  commonContextValue = {
    storageService,
    commonStore: new CommonStore(storageService).makeReady()
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
