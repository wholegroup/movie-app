import globalContext from './globalContext.js'
import StorageService from './StorageService.js'
import CommonStore from './CommonStore.js'

// App Context
const storageService = new StorageService()
const commonContextValue = {
  storageService,
  commonStore: new CommonStore(storageService).makeReady()
}

function GlobalContextProvider ({ children }) {
  return (
    <globalContext.Provider value={commonContextValue}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContextProvider
