import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiCircle } from '@mdi/js'
import globalContext from '../../context/globalContext.js'
import styles from './OnlineIndicator.module.css'

function OnlineIndicator () {
  const { syncStore } = useContext(globalContext)
  return (
    <div className={styles.block}>
      <Icon
        id={'online-indicator'}
        path={mdiCircle}
        title={'Online Indicator'}
        className={syncStore?.isOnline ? styles.online : styles.offline}
      />
    </div>
  )
}

export default observer(OnlineIndicator)
