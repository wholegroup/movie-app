import { makeObservable, observable, action } from 'mobx'
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

  /** @type {Object} Confirm dialog parameters. */
  confirmDialog = {}

  /** @type {Object} Global cache object */
  cache = {}

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
      confirmDialog: observable,
      setConfirmDialog: action
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
   * @param {?TUserProfile} profile
   */
  setProfile (profile) {
    this.profile = profile
  }

  /**
   * Updates user profile.
   */
  async updateProfile () {
    this.setProfile(await this.storageService.getSettings(SETTINGS_NAMES.USER_PROFILE) || null)
  }

  /**
   * Sets confirmDialog.
   * @param {object} confirmDialog
   */
  setConfirmDialog (confirmDialog) {
    this.confirmDialog = confirmDialog
  }
}

export default CommonStore
