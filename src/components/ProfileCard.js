import ProfileCardUser from './ProfileCardUser'
import ProfileCardAnonymous from './ProfileCardAnonymous'

function ProfileCard () {
  return (
    <div style={{ textAlign: 'center' }}>
      <ProfileCardAnonymous />
      <ProfileCardUser />
    </div>
  )
}

export default ProfileCard
