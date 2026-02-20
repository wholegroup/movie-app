import ProfileCardUser from './ProfileCardUser.js'
import ProfileCardAnonymous from './ProfileCardAnonymous.js'
import ProfileCardAdminInfo from './ProfileCardAdminInfo.js'
import ProfileSubscription from './ProfileSubscription.js'
import styles from './ProfileCard.module.css'

function ProfileCard () {
  return (
    <div style={{ textAlign: 'center' }}>
      <ProfileCardAnonymous />
      <ProfileCardUser />
      <ProfileSubscription />
      <ProfileCardAdminInfo />
      <div className={styles.footer}>
        <div>
          &copy; {new Date().getUTCFullYear()} AnnualMovies.com
        </div>
        <div>
          v{process.env.NEXT_PUBLIC_MOVIE_APP_VERSION || '00.00.00'}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
