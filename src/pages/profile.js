import { observer } from 'mobx-react-lite'
import ProfileCard from '../components/profile/ProfileCard.js'

/**
 * User Profile.
 */
function ProfilePage () {
  return (
    <>
      <ProfileCard />
    </>
  )
}

export default observer(ProfilePage)
