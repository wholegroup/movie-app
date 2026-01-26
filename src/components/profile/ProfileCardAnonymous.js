import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiAccountOutline } from '@mdi/js'
import globalContext from '../../context/globalContext.js'

function ProfileCardAnonymous () {
  const { commonStore, storageService } = useContext(globalContext)
  if (commonStore.isAuthenticated) {
    return null
  }

  const handleClearing = (ev) => {
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
        <a href='#' onClick={handleClearing}>Clear all user data</a>
      </div>
      <div>&nbsp;</div>
      <div>
        <a href='/auth/login' title='login'>Login</a>
      </div>
    </>
  )
}

export default observer(ProfileCardAnonymous)
