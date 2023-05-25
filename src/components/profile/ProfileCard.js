import ProfileCardUser from './ProfileCardUser.js'
import ProfileCardAnonymous from './ProfileCardAnonymous.js'

function ProfileCard () {
  return (
    <div style={{ textAlign: 'center' }}>
      <ProfileCardAnonymous />
      <ProfileCardUser />
    </div>
  )
}

export default ProfileCard
