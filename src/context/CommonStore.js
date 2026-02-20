import { makeAutoObservable } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'

class CommonStore {
  /** @type {CommonService} */
  #commonService

  /** @type {StorageService} */
  #storageService

  /** @type {Promise<void>} */
  makeReadyIsCompleted = null

  /** @type {boolean} isInitialized flag */
  isInitialized = false

  /** @type {?Partial<TUserProfile>} */
  profile = null

  /** @type {Object} Confirmation dialog parameters. */
  confirmation = {}

  /** @type {{CardListContextProvider: Object}} Global cache object */
  cache = {}

  /** @type {Object} Response error. */
  responseError = null

  /**
   * Default constructor.
   * @param {CommonService} commonService
   * @param {StorageService} storageService
   */
  constructor (commonService, storageService) {
    this.#commonService = commonService
    this.#storageService = storageService
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
    yield this.refreshProfile()
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
   * Refreshes the user profile from storage.
   * @returns {Promise<void>}
   */
  * refreshProfile () {
    const profile = yield this.#storageService.getSettings(SETTINGS_NAMES.USER_PROFILE)
    this.profile = profile || { id: null }
  }

  /**
   * Updates the user profile and saves it to storage.
   * @param {Partial<TUserProfile>} profile
   * @returns {Promise<void>}
   */
  * updateProfile (profile) {
    this.profile = { ...this.profile, ...profile }
    yield this.#storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, { ...this.profile })
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
   * @returns {Promise<void>}
   */
  * subscribeNews () {
    const subscription = yield this.#commonService.subscribeWebPush()
    yield this.#commonService.subscribeNews(subscription)
    yield this.updateProfile({ notification: true })
  }

  /**
   * Unsubscribes from news.
   * @returns {Promise<void>}
   */
  * unsubscribeNews () {
    const endpoint = yield this.#commonService.unsubscribeWebPush()
    yield this.#commonService.unsubscribeNews(endpoint)
    yield this.updateProfile({ notification: false })
  }
}

export default CommonStore
