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
   * @returns {CommonStore}
   */
  makeReady () {
    this.makeReadyAsync()
      .then(() => {
        this.setIsInitialized()
      })
    return this
  }

  /**
   * Async makeReady
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    await this.storageService.makeReady()
  }
}

export default CommonStore
