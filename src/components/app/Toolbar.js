import Link from 'next/link.js'
import { useRouter } from 'next/router.js'
import { Icon } from '@mdi/react'
import { mdiHomeCircleOutline } from '@mdi/js'
import ProfileLoader from '../profile/ProfileLoader.js'
import styles from './Toolbar.module.css'
import ToolbarUser from '../profile/ToolbarUser.js'
import OnlineIndicator from './OnlineIndicator'

/**
 * Toolbar.
 */
function Toolbar ({ children = null }) {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <OnlineIndicator />
      <div className={styles.first}>
        {router.asPath === '/' && (
          <>
            <div className={styles.onlyIcon640}>
              <Link href='/about'>
                <img src='/toolbar.png' height='36' alt='logo' />
              </Link>
            </div>
          </>
        )}
        {router.asPath !== '/' && (
          <div>
            <Link href='/'>
              <Icon id={'go-home'} path={mdiHomeCircleOutline} size={1.5} title={'Go home'} />
            </Link>
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
      <div className={styles.last}>
        <div>
          <ToolbarUser />
          <ProfileLoader />
        </div>
      </div>
    </nav>
  )
}

export default Toolbar
