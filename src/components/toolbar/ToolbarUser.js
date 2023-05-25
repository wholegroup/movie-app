import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccount, mdiAccountOutline } from '@mdi/js'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import globalContext from '../../context/globalContext.js'

function ToolbarUser () {
  const { commonStore } = useContext(globalContext)
  const isAuthenticated = commonStore.profile != null
  const { picture = null } = commonStore.profile || {}

  return (
    <>
      <Link href='/Users/andrey/Projects/annualmovies.com/movie-app/src/pages/profile'>
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
            path={isAuthenticated ? mdiAccount : mdiAccountOutline}
            size={'36px'}
            title={'Anonymous'}
          />
        )}
      </Link>
    </>
  )
}

export default observer(ToolbarUser)
