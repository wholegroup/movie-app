class CommonService {
  /**
   * Find an active push subscription in JSON.
   * @returns {Promise<PushSubscriptionJSON|null>}
   */
  async findPushSubscription () {
    const activeSW = await navigator.serviceWorker?.getRegistration()
    if (!activeSW) {
      return null
    }
    const subscription = await activeSW.pushManager.getSubscription()
    return subscription?.toJSON() || null
  }

  /**
   * Calculate SHA-1 hash.
   * @param {string} value
   * @returns {Promise<string>}
   */
  async hash (value) {
    const data = new TextEncoder().encode(value)
    const buf = await crypto.subtle.digest('SHA-1', data)
    const bytes = new Uint8Array(buf)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Stable JSON stringify.
   * @param {*} value
   * @returns {string|undefined}
   */
  stableStringify (value) {
    if (value === null) {
      return 'null'
    }

    // Simple types
    switch (typeof value) {
      case 'string':
        return JSON.stringify(value)
      case 'number':
        return Number.isFinite(value) ? String(value) : 'null'
      case 'boolean':
        return value ? 'true' : 'false'
      case 'undefined':
        return undefined
      case 'bigint':
      case 'function':
      case 'symbol':
        throw new TypeError(`stableStringify: unsupported type: ${typeof value}`)
    }

    // Array
    if (Array.isArray(value)) {
      const items = value.map((item) => {
        const vStr = this.stableStringify(item)
        return vStr === undefined ? 'null' : vStr
      })
      return '[' + items.join(',') + ']'
    }

    // Object
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b))
    const parts = []

    for (const k of keys) {
      const vStr = this.stableStringify(value[k])
      if (vStr === undefined) {
        // like JSON.stringify: omit
        continue
      }
      parts.push(JSON.stringify(k) + ':' + vStr)
    }

    return '{' + parts.join(',') + '}'
  }

  /**
   *
   * @param {PushSubscriptionJSON} subscription
   * @returns {Promise<string>}
   */
  async pushHash (subscription) {
    if (!subscription) {
      throw new Error('Subscription is not defined.')
    }
    return await this.hash(this.stableStringify(subscription))
  }

  /**
   * Converts a URL-safe Base64 string into a Uint8Array.
   * @param {string} base64url
   * @return {Uint8Array}
   */
  urlBase64ToUint8Array (base64url) {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    const binary = atob(padded)
    return Uint8Array.from(binary, c => c.charCodeAt(0))
  }

  /**
   * Asserts that the current environment supports Web Push functionality.
   * Throws an error if the required APIs or features are not available.
   */
  assertWebPushSupport () {
    if (typeof window === 'undefined') {
      throw new Error('Client only')
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported')
    }

    if (!('PushManager' in window)) {
      throw new Error('Push not supported')
    }

    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }
  }

  /**
   * Subscribes the user to web push notifications or returns the existing subscription.
   * @returns {Promise<PushSubscriptionJSON>}
   */
  async subscribeWebPush () {
    this.assertWebPushSupport()

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    const reg = await navigator.serviceWorker?.getRegistration()
    if (!reg) {
      throw new Error('Service Worker not registered')
    }

    const activeSubscription = await reg.pushManager.getSubscription()
    if (activeSubscription) {
      return activeSubscription.toJSON()
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!publicKey) {
      throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY')
    }

    const newSubscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicKey)
    })

    return newSubscription.toJSON()
  }

  /**
   * Unsubscribes the user from web push notifications.
   * @returns {Promise<boolean>}
   */
  async unsubscribeWebPush () {
    this.assertWebPushSupport()

    const reg = await navigator.serviceWorker?.getRegistration()
    if (!reg) {
      throw new Error('Service Worker not registered')
    }

    const activeSubscription = await reg.pushManager.getSubscription()
    if (!activeSubscription) {
      return false
    }

    return activeSubscription.unsubscribe()
  }
}

export default CommonService
