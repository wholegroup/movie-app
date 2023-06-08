import { observer } from 'mobx-react-lite'
import styles from './ConfirmDialog.module.css'
import { useContext } from 'react'
import globalContext from '../../context/globalContext.js'

function ConfirmDialog () {
  const { commonStore } = useContext(globalContext)

  if (!commonStore.confirmDialog?.isOpen) {
    return null
  }

  return (
    <div className={styles.overlay}>

      <div className={styles.modal}>
        <div className={styles.header}>
          Please confirm...
        </div>
        <div className={styles.body}>body</div>
        <div className={styles.buttons}>
          <button>Cancel</button>
          <button>Yes</button>
        </div>
      </div>
    </div>
  )
}

export default observer(ConfirmDialog)
