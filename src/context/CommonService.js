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
}

export default CommonService
