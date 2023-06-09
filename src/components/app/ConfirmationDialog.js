import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import FocusTrap from 'focus-trap-react'
import globalContext from '../../context/globalContext.js'
import styles from './ConfirmationDialog.module.css'

function ConfirmationDialog () {
  const { commonStore } = useContext(globalContext)

  if (!commonStore.confirmation?.isOpen) {
    return null
  }

  const header = commonStore.confirmation.header || 'Please confirm'
  const message = commonStore.confirmation.message || 'Are you sure?'
  const buttons = commonStore.confirmation.buttons || [
    {
      value: 'Close',
      onClick: () => {
      }
    }
  ]

  const clickHandler = (button) => {
    if (commonStore.confirmation.autoCloseable ?? true) {
      commonStore.closeConfirmation()
    }
    setTimeout(() => button.onClick(), 0)
  }

  return (
    <div className={styles.overlay}>
      <FocusTrap>
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
      </FocusTrap>
    </div>
  )
}

export default observer(ConfirmationDialog)
