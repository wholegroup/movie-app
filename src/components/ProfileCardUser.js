import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link.js'
import globalContext from '../context/globalContext.js'

function ProfileCardUser () {
  const { commonStore } = useContext(globalContext)
  if (!commonStore.profile) {
    return null
  }

  // noinspection HtmlUnknownTarget
  return (
    <>
      <div>
        <Link href='/api/auth/logout'>Logout</Link>
      </div>
    </>
  )
}

export default observer(ProfileCardUser)
