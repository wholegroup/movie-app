import movieContext from './movieContext.js'
import MovieStore from './MovieStore.js'
import { useContext } from 'react'
import globalContext from '../../context/globalContext.js'

function MovieContextProvider ({ children, ...pageProps }) {
  const { storageService } = useContext(globalContext)
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

  let contextValue
  if (typeof window !== 'undefined') {
    contextValue = {
      movieStore: new MovieStore(storageService),
      commonStore,
      syncStore,
      notificationStore
    }
  } else {
    contextValue = {
      movieStore: new MovieStore(null),
      commonStore
    }
  }

  /**
   * Initialize predefined data.
   */
  if (pageProps.movieStore) {
    contextValue.movieStore = Object.assign(
      contextValue.movieStore, pageProps.movieStore)
  }

  if (pageProps.commonStore) {
    contextValue.commonStore = Object.assign(
      contextValue.commonStore, pageProps.commonStore)
  }

  return (
    <movieContext.Provider value={contextValue}>
      {children}
    </movieContext.Provider>
  )
}

export default MovieContextProvider
