import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'
import styles from './ConfirmationDialog.module.css'

function ConfirmationDialog () {
  const { commonStore } = useContext(globalContext)
  const dialogRef = useRef(null)

  // open/close dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (commonStore.confirmation.isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      dialog.close()
    }
  }, [commonStore.confirmation.isOpen])

  // close by the cancel button
  const handleCancel = (e) => {
    e.preventDefault()
    commonStore.closeConfirmation()
  }

  if (!commonStore.confirmation?.isOpen) {
    return null
  }

  // default dialog values
  const header = commonStore.confirmation.header || 'Please confirm'
  const message = commonStore.confirmation.message || 'Are you sure?'
  const buttons = commonStore.confirmation.buttons || [
    {
      value: 'Close',
      onClick: () => {
      }
    }
  ]

  // handle autoCloseable
  const clickHandler = (button) => {
    if (commonStore.confirmation.autoCloseable ?? true) {
      commonStore.closeConfirmation()
    }
    setTimeout(() => button.onClick(), 0)
  }

  return (
    <dialog ref={dialogRef} className={styles.modal} onCancel={handleCancel}>
      <div className={styles.header}>
        {header}
      </div>
      <div className={styles.body}>
        {message}
      </div>
      <div className={styles.buttons}>
        {buttons.map((btn, i) => (
          <button key={i} onClick={() => clickHandler(btn)}>
            {btn.value}
          </button>
        ))}
      </div>
    </dialog>
  )
}

export default observer(ConfirmationDialog)
