import ProfileCardUser from './ProfileCardUser'
import ProfileCardAnonymous from './ProfileCardAnonymous'
import styles from './ProfileCard.module.css'

function ProfileCard () {
  return (
    <div className={styles.container}>
      <ProfileCardAnonymous />
      <ProfileCardUser />
    </div>
  )
}

export default ProfileCard
