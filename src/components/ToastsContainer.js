import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiClose } from '@mdi/js'
import globalContext from '../context/globalContext.js'
import styles from './ToastsContainer.module.css'

/**
 * Toasts/Notifications.
 */
function ToastsContainer () {
  const { notificationStore } = useContext(globalContext)

  return (
    <div className={styles.toastContainer}>
      {notificationStore?.notificationsFiltered
        .map(n => <ToastItem key={n.id} notification={n} onClose={() => notificationStore.dequeue(n.id)} />)}
    </div>
  )
}

function ToastItem ({ notification, onClose }) {
  const { icon: iconProp, title, message } = notification
  let icon

  if (typeof iconProp === 'string') {
    icon = (
      <svg
        className={styles.icon + ' ' + styles[`icon-${notification.icon}`]}
        width='20'
        height='20'
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='xMidYMid slice'
        focusable='false'
        role='img'
      >
        <rect fill='currentColor' width='100%' height='100%' />
      </svg>
    )
  } else if (iconProp) {
    icon = iconProp
  }

  return (
    <div className={`${styles.toast} ${styles.fade}`}>
      <div className={styles.toastHeader}>
        {icon}
        <span className={styles.toastHeaderText}>{title || 'Notification'}</span>
        <button type='button' onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
      <div className={styles.toastBody}>
        {message}
      </div>
    </div>
  )
}

export default observer(ToastsContainer)
