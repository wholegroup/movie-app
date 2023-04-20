import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../globalContext.js'

function MovieIndexLoader () {
  const { commonStore, syncStore } = useContext(globalContext)

  useEffect(() => {
    if (!commonStore.isInitialized) {
      return
    }

    commonStore.loadCards()
      .catch(console.log)

    return () => {
    }
  }, [commonStore, commonStore?.isInitialized, syncStore?.lastUpdatedAt])

  return null
}

export default observer(MovieIndexLoader)
