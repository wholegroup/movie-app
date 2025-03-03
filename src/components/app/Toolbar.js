import Link from 'next/link'
import { useRouter } from 'next/router'
import { Icon } from '@mdi/react'
import { mdiHomeCircleOutline } from '@mdi/js'
import ProfileLoader from '../profile/ProfileLoader.js'
import styles from './Toolbar.module.css'
import ToolbarUser from '../profile/ToolbarUser.js'
import ToolbarLogo from './ToolbarLogo.js'

/**
 * Toolbar.
 */
function Toolbar ({ children = null }) {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.first}>
        {router.pathname === '/' && <ToolbarLogo />}
        {router.pathname !== '/' && (
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
