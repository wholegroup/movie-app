import { makeObservable, observable, action } from 'mobx'

class CommonStore {
  /** @type {StorageService} */
  storageService

  /** @type {boolean} isInitialized flag */
  isInitialized = false

  /** @type {Object|null} User Info */
  userInfo = null

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      isInitialized: observable,
      setIsInitialized: action,
      userInfo: observable
    })
  }

  /**
   * Sets isInitialized flag.
   */
  setIsInitialized () {
    this.isInitialized = true
  }

  /**
   * Makes ready.
   * @param additional
   * @returns {CommonStore}
   */
  makeReady (additional) {
    this.makeReadyAsync(additional)
      .then(() => {
        this.setIsInitialized()
      })
    return this
  }

  /**
   * Async makeReady
   * @param additional
   * @returns {Promise<void>}
   */
  async makeReadyAsync (additional) {
    await additional()
  }
}

export default CommonStore
