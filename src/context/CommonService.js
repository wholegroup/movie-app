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
}

export default CommonService
