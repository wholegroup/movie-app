import { observer } from 'mobx-react-lite'
import Toolbar from '../components/Toolbar.js'
import ProfileCard from '../components/profile/ProfileCard.js'

/**
 * User Profile.
 */
function ProfilePage () {
  return (
    <>
      <Toolbar />
      <ProfileCard />
    </>
  )
}

export default observer(ProfilePage)
