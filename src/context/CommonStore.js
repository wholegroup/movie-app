import { makeAutoObservable } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'

class CommonStore {
  /** @type {StorageService} */
  #storageService

  /** @type {ApiService} */
  #apiService

  /** @type {Promise<void>} */
  makeReadyIsCompleted = null

  /** @type {boolean} isInitialized flag */
  isInitialized = false

  /** @type {?TUserProfile} */
  profile = null

  /** @type {Object} Confirmation dialog parameters. */
  confirmation = {}

  /** @type {{CardListContextProvider: Object}} Global cache object */
  cache = {}

  /** @type {Object} Response error. */
  responseError = null

  /**
   * Default constructor.
   * @param {StorageService} storageService
   * @param {ApiService} apiService
   */
  constructor (storageService, apiService) {
    this.#storageService = storageService
    this.#apiService = apiService
    makeAutoObservable(this)
  }

  /**
   * Makes ready.
   * @param additional
   * @returns {CommonStore}
   */
  makeReady (additional) {
    if (this.isInitialized) {
      console.log('Already initialized')
      return this
    }

    this.makeReadyIsCompleted = new Promise(resolve => {
      this.makeReadyAsync(additional)
        .finally(() => {
          resolve()
        })
    })

    return this
  }

  /**
   * Async makeReady
   * @param {() => Promise<void>} additional
   * @returns {Promise<void>}
   */
  * makeReadyAsync (additional) {
    yield additional()
    yield this.initializeStoreData()

    this.isInitialized = true
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  * initializeStoreData () {
    yield this.updateProfile()
  }

  /**
   * Disposes store
   * @param {() => Promise<void>} additional
   * @returns {Promise<void>}
   */
  * disposeAsync (additional) {
    if (!this.makeReadyIsCompleted) {
      throw new Error('makeReady was not run')
    }

    // wait till makeReady is completed
    const timeoutPromise = new Promise((resolve, reject) => setTimeout(reject, 5000))
    yield Promise.race([this.makeReadyIsCompleted, timeoutPromise])

    yield additional()
  }

  /**
   * Updates user profile.
   */
  * updateProfile () {
    const profile = yield this.#storageService.getSettings(SETTINGS_NAMES.USER_PROFILE)
    this.profile = profile || { id: null }
  }

  /**
   * @returns {boolean} Returns true if user is authenticated.
   */
  get isAuthenticated () {
    return !!this.profile?.id
  }

  /**
   * Opens confirmation dialog.
   * @param {function} onYes
   * @param {object} opts
   */
  openConfirmation (onYes, opts = {}) {
    if (this.confirmation.isOpen) {
      throw new Error('Already open')
    }

    this.confirmation = Object.assign({
      isOpen: true,
      header: 'Please confirm',
      message: 'Are you sure?',
      buttons: [
        {
          value: 'Cancel',
          onClick: () => {
          }
        },
        {
          value: 'Yes',
          onClick: onYes
        }
      ]
    }, opts)
  }

  /**
   * Closes confirm dialog.
   */
  closeConfirmation () {
    this.confirmation = {}
  }

  /**
   * Sets responseError
   * @param {object=} responseError
   */
  setResponseError (responseError = null) {
    this.responseError = responseError
  }

  /**
   * Subscribes to news.
   * @param {PushSubscriptionJSON} subscription
   * @returns {Promise<void>}
   */
  * subscribeNews (subscription) {
    yield this.#apiService.pushSubscribe(subscription)
  }
}

export default CommonStore
