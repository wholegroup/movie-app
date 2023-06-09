import Link from 'next/link.js'
import { useRouter } from 'next/router.js'
import { Icon } from '@mdi/react'
import { mdiHomeCircleOutline, mdiInformationOutline } from '@mdi/js'
import ProfileLoader from '../profile/ProfileLoader.js'
import styles from './Toolbar.module.css'
import ToolbarUser from '../profile/ToolbarUser.js'

/**
 * Toolbar.
 */
function Toolbar ({ children = null }) {
  const router = useRouter()

  return (
    <nav className={styles.nav}>
      <div className={styles.first}>
        {router.asPath === '/' && (
          <>
            <div>
              <Link href='/about'>
                <Icon id={'go-home'} path={mdiInformationOutline} size={1.5} title={'Information'} />
              </Link>
            </div>
            <div className={`${styles.hide640} ${styles.version}`}>
              <Link href='/about'>
                <div>
                  AnnualMovies.com
                </div>
                <div>
                  v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}
                </div>
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