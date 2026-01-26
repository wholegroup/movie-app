import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { Icon } from '@mdi/react'
import { mdiAccount, mdiAccountOutline } from '@mdi/js'
import globalContext from '../../context/globalContext.js'
import styles from './ToolbarUser.module.css'

function ToolbarUser () {
  const { commonStore, syncStore } = useContext(globalContext)
  const { isOnline = false, isSynchronizing = false } = syncStore || {}
  const isSpinning = !isOnline || isSynchronizing

  // don't show the picture until the profile is initialized
  if (!commonStore.profile) {
    return null
  }
  const { picture = null } = commonStore.profile

  return (
    <>
      <Link href="/profile" className={isSpinning ? styles.spinner : ''}>
        {picture && (
          <img
            src={picture}
            alt={'user picture'}
            style={{ width: 36, borderRadius: '50%' }}
            title={commonStore.profile.name} />
        )}
        {!picture && (
          <Icon
            id={'account'}
            path={commonStore.isAuthenticated ? mdiAccount : mdiAccountOutline}
            size={'36px'}
            title={'Anonymous'}
          />
        )}
      </Link>
    </>
  )
}

export default observer(ToolbarUser)
