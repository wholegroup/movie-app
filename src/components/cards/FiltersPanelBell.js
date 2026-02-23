import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiBell, mdiBellOutline, mdiBellOffOutline, mdiCogOutline } from '@mdi/js'
import styles from './FiltersPanelBell.module.css'
import { useContext, useEffect, useState } from 'react'
import globalContext from '@/src/context/globalContext.js'

/**
 * Represents the subscription button/bell in the filters panel.
 * @returns {React.JSX.Element}
 * @constructor
 */
function FiltersPanelBell () {
  const { commonStore, notificationStore } = useContext(globalContext)
  const [isWorking, setWorking] = useState(false)
  const [permission, setPermission] = useState('denied')
  const isDenied = permission === 'denied'
  const isSubscribed = !!commonStore.profile?.notification

  /**
   * Permission initialization.
   */
  useEffect(() => {
    setPermission(window.Notification.permission)
  }, [])

  /**
   * Handles `Subscribe` button click.
   * @returns {Promise<void>}
   */
  const handleSubscribe = async () => {
    try {
      setWorking(true)
      await commonStore.subscribeNews()
      notificationStore.info({ message: 'Subscribed to news.' })
    } catch (e) {
      notificationStore.error({ message: e?.message || String(e) })
    } finally {
      setWorking(false)
      setPermission(window.Notification.permission)
    }
  }

  /**
   * Handles `Unsubscribe` button click.
   * @returns {Promise<void>}
   */
  const handleUnsubscribe = async () => {
    try {
      setWorking(true)
      await commonStore.unsubscribeNews()
      notificationStore.info({ message: 'Unsubscribed successfully.' })
    } finally {
      setWorking(false)
    }
  }

  return (
    <>
      <div className={styles.block}>
        {isDenied && <div>
          <Icon path={mdiBellOffOutline} size={1} title={'Push notifications are disabled.'} />
        </div>}
        {!isSubscribed && !isDenied && <div>
          <button className={'icon'} onClick={handleSubscribe} disabled={isWorking}>
            <Icon path={mdiBellOutline} size={1} title={'Subscribe'} />
          </button>
        </div>}
        {isSubscribed && !isDenied && <div>
          <button className={'icon'} onClick={handleUnsubscribe} disabled={isWorking}>
            <Icon path={mdiBell} size={1} title={'Unsubscribe'} />
          </button>
        </div>}
        {isWorking && <div>
          <Icon path={mdiCogOutline} size={1} title={'Loading...'} spin={true} />
        </div>}
      </div>
    </>
  )
}

export default observer(FiltersPanelBell)
