import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import globalContext from '../context/globalContext.js'
import Link from 'next/link.js'

function ProfileCard () {
  const { commonStore } = useContext(globalContext)

  // noinspection HtmlUnknownTarget
  return (
    <>
      <div>account page</div>
      {!commonStore.profile && (
        <div>
          <Link href='/api/auth/login'>Login</Link>
        </div>
      )}
      {commonStore.profile != null && (
        <div>
          <Link href='/api/auth/logout'>Logout</Link>
        </div>
      )}
    </>
  )
}

export default observer(ProfileCard)
