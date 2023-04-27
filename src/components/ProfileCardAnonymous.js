import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccountOutline } from '@mdi/js'
import globalContext from '../context/globalContext.js'

function ProfileCardAnonymous () {
  const { commonStore } = useContext(globalContext)
  if (commonStore.profile != null) {
    return null
  }

  // noinspection HtmlUnknownTarget
  return (
    <>
      <div>
        <Icon id={'account'} path={mdiAccountOutline} size={10} title={'Anonymous'} />
      </div>
      <div>
        <Link href='/api/auth/login'>Login</Link>
      </div>
    </>
  )
}

export default observer(ProfileCardAnonymous)
