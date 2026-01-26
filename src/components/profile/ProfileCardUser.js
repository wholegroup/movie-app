import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiAccount } from '@mdi/js'
import globalContext from '../../context/globalContext.js'
import styles from './ProfileCardUser.module.css'

function ProfileCardUser () {
  const { commonStore, storageService } = useContext(globalContext)

  if (!commonStore.isAuthenticated) {
    return null
  }
  const profile = commonStore.profile

  // handle logout
  const handleLogout = (ev) => {
    ev.preventDefault()
    storageService.clearAllUserData()
      .then(() => {
        window.location.href = '/auth/logout'
      })
      .catch(console.error)
  }

  // noinspection HtmlUnknownTarget
  return (
    <>
      {profile.picture && (
        <div className={styles.picture}>
          <img src={profile.picture} alt={'user picture'} />
        </div>
      )}
      {!profile.picture && (
        <div>
          <Icon id={'account'} path={mdiAccount} size={10} title={'Anonymous'} />
        </div>
      )}
      <div>{profile.name}</div>
      <div>{profile.email}</div>
      <div>&nbsp;</div>
      <div>
        <a href='#' onClick={handleLogout}>Logout</a>
      </div>
    </>
  )
}

export default observer(ProfileCardUser)
