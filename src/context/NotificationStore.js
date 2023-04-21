import { action, computed, makeObservable, observable } from 'mobx'
import { v4 as uuid } from 'uuid'

/**
 * @typedef TNotificationDraft
 * @property {string} type
 * @property {string} icon
 * @property {?string} title
 * @property {string} message
 */

/**
 * @typedef {TNotificationDraft} TNotification
 * @property {string} id
 * @property {number} timestamp
 * @property {number} timeoutId
 */

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
    const id = uuid()
    const timeoutId = setTimeout(() => this.dequeue(id), 4000)
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
   * Adds info message
   * @param {string} message
   * @param {?string} title
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
   * Adds success message
   * @param {string} message
   * @param {?string} title
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
   * Adds warning message
   * @param {string} message
   * @param {?string} title
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
   * Adds error message
   * @param {string} message
   * @param {?string} title
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
