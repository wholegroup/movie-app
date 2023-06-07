import { useContext, useRef } from 'react'
import globalContext from '../../context/globalContext.js'
import cardListContext from './cardListContext.js'
import CardListStore from './CardListStore.js'

function CardListContextProvider ({ children, ...pageProps }) {
  const { storageService } = useContext(globalContext)
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

  // creating context
  const contextValueRef = useRef(null)
  if (contextValueRef.current === null) {
    if (typeof window !== 'undefined') {
      contextValueRef.current = {
        cardListStore: new CardListStore(storageService),
        commonStore,
        syncStore,
        notificationStore
      }
    } else {
      contextValueRef.current = {
        cardListStore: new CardListStore(null),
        commonStore
      }
    }

    /**
     * Initialize predefined data.
     */
    if (pageProps.cardListStore) {
      contextValueRef.current.cardListStore = Object.assign(
        contextValueRef.current.cardListStore, pageProps.cardListStore)
    }

    if (pageProps.commonStore) {
      contextValueRef.current.commonStore = Object.assign(
        contextValueRef.current.commonStore, pageProps.commonStore)
    }
  }

  return (
    <cardListContext.Provider value={contextValueRef.current}>
      {children}
    </cardListContext.Provider>
  )
}

export default CardListContextProvider
