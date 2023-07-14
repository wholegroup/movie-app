import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccountOutline } from '@mdi/js'
import globalContext from '../../context/globalContext.js'

/* eslint-disable @next/next/no-html-link-for-pages */
function ProfileCardAnonymous () {
  const { commonStore, storageService } = useContext(globalContext)
  if (commonStore.profile != null) {
    return null
  }

  const handleB = (ev) => {
    ev.preventDefault()
    commonStore.openConfirmation(() => {
      storageService.clearAllUserData()
        .then(() => {
          window.location.href = '/'
        })
        .catch(console.error)
    })
  }

  // noinspection HtmlUnknownTarget
  return (
    <>
      <div>
        <Icon id={'account'} path={mdiAccountOutline} size={10} title={'Anonymous'} />
      </div>
      <div>
        <Link href='#' onClick={handleB} prefetch={false}>Clear all user data</Link>
      </div>
      <div>&nbsp;</div>
      <div>
        <a href='/api/auth/login' title='login'>Login</a>
      </div>
    </>
  )
}

export default observer(ProfileCardAnonymous)
