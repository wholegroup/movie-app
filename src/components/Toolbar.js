import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccount, mdiArrowLeftBoldCircleOutline } from '@mdi/js'
import styles from './Toolbar.module.css'
import { useRouter } from 'next/router.js'

/**
 * Toolbar.
 */
function Toolbar () {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.first}>
        <Link href='/'>
          {router.asPath === '/'
            ? `v${process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}`
            : <Icon id={'go-home'} path={mdiArrowLeftBoldCircleOutline} size={1.5} title={'Anonymous'} />}
        </Link>
      </div>
      <div>
        <ul>
          <li><a href='#'>Section A</a></li>
          <li><a href='#'>Section B</a></li>
          <li><a href='#'>Section C</a></li>
          <li><a href='#'>Section D</a></li>
        </ul>
      </div>
      <div className={styles.last}>
        <Link href='/profile'>
          <Icon id={'account'} path={mdiAccount} size={1.5} title={'Anonymous'} />
        </Link>
      </div>
    </nav>
  )
}

export default Toolbar
