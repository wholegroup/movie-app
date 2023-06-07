import { useContext } from 'react'
import globalContext from '../../context/globalContext.js'
import cardListContext from './cardListContext.js'
import CardListStore from './CardListStore.js'

function CardListContextProvider ({ children, ...pageProps }) {
  const { storageService } = useContext(globalContext)
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

  let contextValue
  if (typeof window !== 'undefined') {
    const cardListStore = new CardListStore(storageService)
    cardListStore.initializeStoreData().catch(console.error)
    contextValue = {
      cardListStore: cardListStore,
      commonStore,
      syncStore,
      notificationStore
    }
  } else {
    contextValue = {
      cardListStore: new CardListStore(null),
      commonStore
    }
  }

  /**
   * Initialize predefined data.
   */
  if (pageProps.cardListStore) {
    contextValue.cardListStore = Object.assign(
      contextValue.cardListStore, pageProps.cardListStore)
  }

  if (pageProps.commonStore) {
    contextValue.commonStore = Object.assign(
      contextValue.commonStore, pageProps.commonStore)
  }

  return (
    <cardListContext.Provider value={contextValue}>
      {children}
    </cardListContext.Provider>
  )
}

export default CardListContextProvider
