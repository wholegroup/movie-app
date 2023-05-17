import Link from 'next/link.js'
import { useRouter } from 'next/router.js'
import { Icon } from '@mdi/react'
import { mdiArrowLeftBoldCircleOutline, mdiInformationOutline } from '@mdi/js'
import ProfileLoader from './ProfileLoader.js'
import styles from './Toolbar.module.css'
import ToolbarUser from './ToolbarUser'
import ToolbarMenu from './ToolbarMenu'

/**
 * Toolbar.
 */
function Toolbar () {
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
            <Link href='/' onClick={() => router.back()}>
              <Icon id={'go-home'} path={mdiArrowLeftBoldCircleOutline} size={1.5} title={'Anonymous'} />
            </Link>
          </div>
        )}
      </div>
      <div>
        {router.asPath === '/' && <ToolbarMenu />}
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
