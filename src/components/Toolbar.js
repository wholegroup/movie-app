import Link from 'next/link.js'
import { Icon } from '@mdi/react'
import { mdiAccount } from '@mdi/js'
import styles from './Toolbar.module.css'

function Toolbar () {
  return (
    <nav className={styles.nav}>
      <div className={styles.first}>
        <Link href='/'>
          v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}
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
        <Link href='/account'>
          <Icon id={'account'} path={mdiAccount} size={1.5} title={'Anonymous'} />
        </Link>
      </div>
    </nav>
  )
}

export default Toolbar
