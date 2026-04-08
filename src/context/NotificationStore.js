import { action, computed, makeObservable, observable } from 'mobx'

class NotificationStore {
  /** @type {TNotification[]} */
  notifications = []

  /**
   * Default constructor.
   */
  constructor () {
    makeObservable(this, {
      notifications: observable,
      setNotifications: action,
      notificationsSorted: computed,
      notificationsFiltered: computed
    })
  }

  /**
   * Sets notifications.
   * @param {TNotification[]} notifications
   */
  setNotifications (notifications) {
    this.notifications = notifications
  }

  /**
   * Sorts notifications.
   * @returns {TNotification[]}
   */
  get notificationsSorted () {
    return [...this.notifications]
      .sort(({ timestamp: a }, { timestamp: b }) => b - a)
  }

  /**
   * Filters notifications.
   * @returns {TNotification[]}
   */
  get notificationsFiltered () {
    return [...this.notificationsSorted].slice(0, 5)
  }

  /**
   *
   * @param {TNotificationDraft} draft
   */
  enqueue (draft) {
    const id = crypto.randomUUID()
    const timeoutId = window.setTimeout(() => this.dequeue(id), 4000)
    this.setNotifications([
      ...this.notifications,
      {
        ...draft,
        id,
        timestamp: Date.now(),
        timeoutId
      }
    ])
  }

  /**
   * Dequeues notification by uuid.
   * @param {string} uuid
   */
  dequeue (uuid) {
    const notification = this.notifications.find(({ id }) => id === uuid)
    clearTimeout(notification?.timeoutId)
    this.setNotifications([...this.notifications.filter(({ id }) => id !== uuid)])
  }

  /**
   * Adds an info message
   * @param {{ message: string, title?: string | null }} params
   */
  info ({ message, title = null }) {
    this.enqueue({
      type: 'info',
      icon: 'info',
      title,
      message
    })
  }

  /**
   * Adds a success message
   * @param {{ message: string, title?: string | null }} params
   */
  success ({ message, title = null }) {
    this.enqueue({
      type: 'success',
      icon: 'success',
      title,
      message
    })
  }

  /**
   * Adds a warning message
   * @param {{ message: string, title?: string | null }} params
   */
  warning ({ message, title = null }) {
    this.enqueue({
      type: 'warning',
      icon: 'warning',
      title,
      message
    })
  }

  /**
   * Adds an error message
   * @param {{ message: string, title?: string | null }} params
   */
  error ({ message, title = null }) {
    this.enqueue({
      type: 'error',
      icon: 'danger',
      title,
      message
    })
  }
}

export default NotificationStore
