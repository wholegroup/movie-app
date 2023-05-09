import Link from 'next/link.js'
import { useRouter } from 'next/router.js'
import { Icon } from '@mdi/react'
import { mdiArrowLeftBoldCircleOutline } from '@mdi/js'
import ProfileLoader from './ProfileLoader.js'
import styles from './Toolbar.module.css'
import ToolbarUser from './ToolbarUser'
import MovieCounter from './MovieCounter.js'

/**
 * Toolbar.
 */
function Toolbar () {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.first}>
        {router.asPath === '/' && (
          <Link href='/about'>v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}</Link>
        )}
        {router.asPath !== '/' && (
          <Link href='/'>
            <Icon id={'go-home'} path={mdiArrowLeftBoldCircleOutline} size={1.5} title={'Anonymous'} />
          </Link>
        )}
      </div>
      <div>
        <ul>
          {router.asPath === '/' && (
            <>
              <li><a href='#'>Section B</a></li>
              <li><MovieCounter /></li>
            </>
          )}
        </ul>
      </div>
      <div className={styles.last}>
        <ToolbarUser />
        <ProfileLoader />
      </div>
    </nav>
  )
}

export default Toolbar
