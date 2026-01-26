import { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'
import styles from './ProfileCardAdminInfo.module.css'

/**
 * Additional info on the profile page
 */
function ProfileCardAdminInfo () {
  const { commonStore, storageService } = useContext(globalContext)
  const [adminInfo, setAdminInfo] = useState({})

  useEffect(() => {
    async function fillAdminInfo () {
      if (!commonStore.isInitialized) {
        return
      }

      const lastCreatedAt = await storageService.getLastCreatedAt()
      const lastUpdatedAt = await storageService.getLastUpdatedAt()

      setAdminInfo({ lastCreatedAt, lastUpdatedAt })
    }

    fillAdminInfo().catch(console.error)
  }, [storageService, commonStore.isInitialized])

  if (!commonStore.profile?.isAdmin) {
    return null
  }

  return (
    <div className={styles.panel}>
      <div>Data refreshed at <b>{adminInfo.lastUpdatedAt ? new Date(adminInfo.lastUpdatedAt).toLocaleDateString('en-CA') : '—'}</b></div>
      <div>The last movie has been added at <b>{adminInfo.lastCreatedAt ? new Date(adminInfo.lastCreatedAt).toLocaleDateString('en-CA') : '—'}</b></div>
    </div>
  )
}

export default observer(ProfileCardAdminInfo)
