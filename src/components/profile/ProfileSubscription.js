import { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiCogOutline, mdiBell } from '@mdi/js'
import globalContext from '@/src/context/globalContext.js'
import styles from './ProfileSubscription.module.css'

function ProfileSubscription () {
  const { commonService } = useContext(globalContext)
  const { commonStore, notificationStore } = useContext(globalContext)
  const [isWorking, setWorking] = useState(false)
  const [permission, setPermission] = useState('denied')
  const isDenied = permission === 'denied'
  const isSubscribed = !!commonStore.profile?.notification

  /**
   * Permission initialization.
   */
  useEffect(() => {
    setPermission(commonService.currentPushPermission())
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
      setPermission(commonService.currentPushPermission())
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
    } catch (e) {
      notificationStore.error({ message: e?.message || String(e) })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className={styles.block}>
      {isDenied && <div className={styles.disabledWarning}>
        <div>Push notifications are disabled.</div>
        <div>Enable them in your browser settings.</div>
      </div>}
      {!isSubscribed && <>
        <div>
          <button className={'btn'} onClick={handleSubscribe} disabled={isDenied || isWorking}>
            <div className={styles.btnBlock}>
              <Icon path={mdiBell} size={0.8} />
              <div>Subscribe</div>
              {isWorking && <div><Icon path={mdiCogOutline} size={0.8} title={'Loading...'} spin={true} /></div>}
            </div>
          </button>
        </div>
      </>}
      {isSubscribed && <>
        <div>
          <button className={'btn'} onClick={handleUnsubscribe} disabled={isWorking}>
            <div className={styles.btnBlock}>
              <Icon path={mdiBell} size={0.8} />
              <div>Unsubscribe</div>
              {isWorking && <div><Icon path={mdiCogOutline} size={0.8} title={'Loading...'} spin={true} /></div>}
            </div>
          </button>
        </div>
      </>}
    </div>
  )
}

export default observer(ProfileSubscription)
