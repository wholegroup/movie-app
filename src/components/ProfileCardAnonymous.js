import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccount } from '@mdi/js'
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
        <Icon id={'account'} path={mdiAccount} size={1.5} title={'Anonymous'} />
      </div>
      <div>
        <Link href='/api/auth/login'>Login</Link>
      </div>
    </>
  )
}

export default observer(ProfileCardAnonymous)
