import { observer } from 'mobx-react-lite'
import UserCard from '../components/UserCard'

/**
 * User Profile.
 */
function ProfilePage () {
  return (
    <>
      <UserCard />
    </>
  )
}

export default observer(ProfilePage)
