import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import globalContext from '../context/globalContext.js'
import { Icon } from '@mdi/react'
import { mdiAccount } from '@mdi/js'
import styles from './ProfileCardUser.module.css'

function ProfileCardUser () {
  const { commonStore } = useContext(globalContext)
  const profile = commonStore.profile
  if (!profile) {
    return null
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
        <Link href='/api/auth/logout'>Logout</Link>
      </div>
    </>
  )
}

export default observer(ProfileCardUser)
