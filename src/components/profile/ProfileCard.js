import ProfileCardUser from './ProfileCardUser.js'
import ProfileCardAnonymous from './ProfileCardAnonymous.js'
import styles from './ProfileCard.module.css'

function ProfileCard () {
  return (
    <div style={{ textAlign: 'center' }}>
      <ProfileCardAnonymous />
      <ProfileCardUser />
      <div className={styles.footer}>
        <div>
          {new Date().getUTCFullYear()} &copy; AnnualMovies.com
        </div>
        <div>
          v{process.env.NEXT_PUBLIC_MOVIE_VERSION || '00.00.00'}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
