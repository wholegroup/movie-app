import { action, makeObservable, observable } from 'mobx'

class SyncStore {
  /** @type {StorageService} */
  storageService

  /** @type {boolean} isOnline flag.  */
  isOnline = true

  /** @type {boolean} isBusy flag. */
  isBusy = false

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      isOnline: observable,
      isBusy: observable,
      setIsBusy: action
    })
  }

  /**
   * Makes ready.
   * @returns {SyncStore}
   */
  makeReady () {
    this.makeReadyAsync()
      .then(() => {
        console.log('Sync store is ready...')
      })
    return this
  }

  /**
   * Async makeReady
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    setInterval(() => {
      this.runWorker()
        .catch(console.error)
    }, 1000)
  }

  /**
   * Worker.
   * @returns {Promise<void>}
   */
  async runWorker () {
    if (!this.isOnline || this.isBusy) {
      return
    }

    try {
      this.setIsBusy(true)

      // do worker step
      console.log('worker step')
    } finally {
      this.setIsBusy(false)
    }
  }

  /**
   * Sets isBusy flag.
   * @param {boolean} isBusy
   */
  setIsBusy (isBusy) {
    this.isBusy = isBusy
  }
}

export default SyncStore
