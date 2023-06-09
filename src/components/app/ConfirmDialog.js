import { observer } from 'mobx-react-lite'
import styles from './ConfirmDialog.module.css'
import { useContext } from 'react'
import globalContext from '../../context/globalContext.js'

function ConfirmDialog () {
  const { commonStore } = useContext(globalContext)

  if (!commonStore.confirmDialog?.isOpen) {
    return null
  }

  const header = commonStore.confirmDialog.header || 'Please confirm'
  const message = commonStore.confirmDialog.message || 'Are you sure?'
  const buttons = commonStore.confirmDialog.buttons || [
    {
      value: 'Close',
      onClick: () => {
      }
    }
  ]

  const clickHandler = (button) => {
    if (commonStore.confirmDialog.autoCloseable ?? true) {
      commonStore.closeConfirmDialog()
    }
    setTimeout(() => button.onClick(), 0)
  }

  return (
    <div className={styles.overlay}>

      <div className={styles.modal}>
        <div className={styles.header}>
          {header}
        </div>
        <div className={styles.body}>
          {message}
        </div>
        <div className={styles.buttons}>
          {buttons.map((btn, i) => <button key={i} onClick={() => clickHandler(btn)}>{btn.value}</button>)}
        </div>
      </div>
    </div>
  )
}

export default observer(ConfirmDialog)
