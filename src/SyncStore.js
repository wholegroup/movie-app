import { action, computed, makeObservable, observable } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'
import * as cronParser from 'cron-parser'

class SyncStore {
  /** @type {StorageService} */
  storageService

  /** @type {boolean} isInitialized flag. */
  isInitialized = false

  /** @type {boolean} isOnline flag.  */
  isOnline = true

  /** @type {boolean} isBusy flag. */
  isBusy = false

  /** @type {number} Timestamp to catch any data changes after synchronization. */
  changesHash = 0

  /** @type {number} Last sync timestamp. */
  syncDate = 0

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      isInitialized: observable,
      setIsInitialized: action,
      isOnline: observable,
      isBusy: observable,
      setIsBusy: action,
      changesHash: observable,
      setChangesHash: action,
      syncDate: observable,
      setSyncDate: action,
      nextSyncDate: computed
    })
  }

  /**
   * Sets isInitialized flag.
   * @param {boolean} isInitialized
   */
  setIsInitialized (isInitialized) {
    this.isInitialized = isInitialized
  }

  /**
   * Sets changesHash
   * @param {number} changesHash
   */
  setChangesHash (changesHash) {
    this.changesHash = changesHash
  }

  /**
   * Sets syncDate
   * @param {number} syncDate
   */
  setSyncDate (syncDate) {
    this.syncDate = syncDate
  }

  /**
   * Calculates next syncDate.
   * @returns {number}
   */
  get nextSyncDate () {
    return this.nextCronDate(this.syncDate, '0 */30 * * * *')
  }

  /**
   * Calculates next cron date using schedule
   * @param {number|null} from
   * @param {string} schedule
   */
  nextCronDate (from, schedule) {
    if (!from) {
      return Date.now()
    }

    const interval = cronParser.parseExpression(schedule, {
      currentDate: from
    })
    return interval.next().getTime()
  }

  /**
   * Sets isBusy flag.
   * @param {boolean} isBusy
   */
  setIsBusy (isBusy) {
    this.isBusy = isBusy
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  async initializeStoreData () {
    this.syncDate = parseInt(await this.storageService.getSettings(SETTINGS_NAMES.SYNC_DATE)) || 0
    this.setIsInitialized(true)
  }

  /**
   * Async makeReady
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    await this.initializeStoreData()

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
    if (!this.isInitialized || !this.isOnline || this.isBusy) {
      return
    }

    try {
      this.setIsBusy(true)
      const dataChanged = await this.doWorkerStep()
      if (dataChanged) {
        this.setChangesHash(Date.now())
      }
    } finally {
      this.setIsBusy(false)
    }
  }

  /**
   * Does sync step.
   * @returns {Promise<boolean>}
   */
  async doWorkerStep () {
    // POST http://localhost:3300/api/sync
    // change synchash if data changed
    if (Date.now() >= this.nextSyncDate) {
      console.log('Synchronizing movies...')
      this.setSyncDate(Date.now())
      return false
    }

    return false
  }
}

export default SyncStore
