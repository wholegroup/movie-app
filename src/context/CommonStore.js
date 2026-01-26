import { makeObservable, observable, action, computed } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'

class CommonStore {
  /** @type {StorageService} */
  storageService

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
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      isInitialized: observable,
      setIsInitialized: action,
      profile: observable,
      setProfile: action,
      isAuthenticated: computed,
      confirmation: observable,
      setConfirmation: action,
      responseError: observable,
      setResponseError: action
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
  async makeReadyAsync (additional) {
    await additional()
    await this.initializeStoreData()

    this.setIsInitialized()
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  async initializeStoreData () {
    await this.updateProfile()
  }

  /**
   * Disposes store
   * @param {() => Promise<void>} additional
   * @returns {Promise<void>}
   */
  async disposeAsync (additional) {
    if (!this.makeReadyIsCompleted) {
      throw new Error('makeReady was not run')
    }

    // wait till makeReady is completed
    const timeoutPromise = new Promise((resolve, reject) => setTimeout(reject, 5000))
    await Promise.race([this.makeReadyIsCompleted, timeoutPromise])

    await additional()
  }

  /**
   * Sets user profile.
   * @param {Partial<TUserProfile>} profile
   */
  setProfile (profile) {
    // Set an empty object to indicate that the current user is anonymous,
    // while a null profile means we haven't checked the current user yet.
    this.profile = profile || { id: null }
  }

  /**
   * Updates user profile.
   */
  async updateProfile () {
    this.setProfile(await this.storageService.getSettings(SETTINGS_NAMES.USER_PROFILE))
  }

  /**
   * @returns {boolean} Returns true if user is authenticated.
   */
  get isAuthenticated () {
    return !!this.profile?.id
  }

  /**
   * Sets confirmation.
   * @param {object} confirmation
   */
  setConfirmation (confirmation) {
    this.confirmation = confirmation
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

    this.setConfirmation(Object.assign({
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
    }, opts))
  }

  /**
   * Closes confirm dialog.
   */
  closeConfirmation () {
    this.setConfirmation({})
  }

  /**
   * Sets responseError
   * @param {object=} responseError
   */
  setResponseError (responseError = null) {
    this.responseError = responseError
  }
}

export default CommonStore
