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
}

export default CommonService
