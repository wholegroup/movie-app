import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import globalContext from '../../context/globalContext.js'

/**
 * Loads and updates user profile triggered by timestamp.
 */
function ProfileLoader () {
  const { commonStore, syncStore, notificationStore } = useContext(globalContext)

  useEffect(() => {
    if (!commonStore.isInitialized) {
      return
    }

    async function load () {
      await commonStore.refreshProfile()
    }

    load().catch((e) => {
      notificationStore.error(e)
      console.error(e)
    })
  }, [syncStore?.profileSyncedTs, commonStore.isInitialized, commonStore, notificationStore])

  return null
}

export default observer(ProfileLoader)
