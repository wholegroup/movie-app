import { action, computed, makeObservable, observable } from 'mobx'
import * as cronParser from 'cron-parser'
import { SETTINGS_NAMES } from './StorageService.js'

class SyncStore {
  /** @type {StorageService} */
  storageService

  /** @type {ApiService} */
  apiService

  /** @type {number} worker intervalId */
  workerIntervalId

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

  /** @type {WorkerStepEnum[]} */
  workerStepsExecuting = []

  /** @type {boolean} Worker is in delayed mode. */
  isDelayed = false

  /** @type {number} Timestamp when idDelayed set */
  delayedDate = 0

  /** @type {string} lastUpdatedAt timestamp from storage */
  lastUpdatedAt = ''

  /**
   * Default constructor.
   * @param {StorageService} storageService
   * @param {ApiService} apiService
   */
  constructor (storageService, apiService) {
    this.storageService = storageService
    this.apiService = apiService
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
      nextSyncDate: computed,
      workerStepsExecuting: observable,
      startWorkerStepExecution: action,
      stopWorkerStepExecution: action,
      isSynchronizing: computed,
      isDelayed: observable,
      delayedDate: observable,
      setIsDelayed: action,
      lastUpdatedAt: observable,
      setLastUpdatedAt: action
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
   * Starts worker step execution flag.
   * @param {WorkerStepEnum} step
   */
  startWorkerStepExecution (step) {
    this.workerStepsExecuting = [...new Set([...this.workerStepsExecuting, step])]
  }

  /**
   * Stops worker step execution flag.
   * @param {WorkerStepEnum} step
   */
  stopWorkerStepExecution (step) {
    this.workerStepsExecuting = this.workerStepsExecuting.filter(i => i !== step)
  }

  /**
   * Checks if synchronization is going on.
   * @returns {boolean}
   */
  get isSynchronizing () {
    return this.workerStepsExecuting.length > 0 || !this.syncDate
  }

  /**
   * Sets isDelayed status.
   * @param {boolean} isDelayed
   */
  setIsDelayed (isDelayed) {
    this.isDelayed = isDelayed
    this.delayedDate = isDelayed ? Date.now() : 0
  }

  /**
   * Sets lastUpdatedAt.
   * @param {string} lastUpdatedAt
   */
  setLastUpdatedAt (lastUpdatedAt) {
    this.lastUpdatedAt = lastUpdatedAt
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  async initializeStoreData () {
    this.setLastUpdatedAt(await this.storageService.getSettings(SETTINGS_NAMES.LAST_UPDATED_AT) || '')
    this.setIsInitialized(true)
  }

  /**
   * Async makeReady
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    if (this.isInitialized) {
      throw new Error('Already initialized')
    }

    await this.initializeStoreData()

    this.workerIntervalId = setInterval(() => {
      this.runWorker()
        .catch(console.error)
    }, 1000)
  }

  /**
   * Disposes store.
   * @returns {Promise<void>}
   */
  async disposeAsync () {
    clearInterval(this.workerIntervalId)
  }

  /**
   * Worker.
   * @returns {Promise<void>}
   */
  async runWorker () {
    if (!this.isInitialized || !this.isOnline || this.isBusy) {
      return
    }

    // check if worker has delayed flag and reset the flag after sometime (60 sec)
    if (this.isDelayed) {
      if (Date.now() < (this.delayedDate + 60 * 1000)) {
        return
      }
      this.setIsDelayed(false)
    }

    try {
      this.setIsBusy(true)
      const dataChanged = await this.doWorkerStep()
      if (dataChanged) {
        this.setChangesHash(Date.now())
      }
    } catch ($ex) {
      console.log($ex)
      console.log('Worker has been delayed for 60 seconds because of an error.')
      this.setIsDelayed(true)
    } finally {
      this.setIsBusy(false)
    }
  }

  /**
   * Does sync step.
   * @returns {Promise<boolean>}
   */
  async doWorkerStep () {
    if (Date.now() >= this.nextSyncDate) {
      return await this.synchronizeMovies()
    }

    return false
  }

  /**
   * Synchronizes movies.
   * @returns {Promise<boolean>}
   */
  async synchronizeMovies () {
    console.log('Synchronizing movies...')
    try {
      this.startWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)

      // load movies
      const { movies, votes, images, lastUpdatedAt } = await this.apiService.loadMovies(this.lastUpdatedAt)
      console.log('Loaded', movies.length, 'movies,', votes.length, 'votes,', images.length, 'images')
      console.log('Last updated at', lastUpdatedAt)

      // save in storage
      await this.storageService.upsertMovies(movies)
      await this.storageService.upsertVotes(votes)
      await this.storageService.upsertImages(images)

      // update lastUpdatedAt if it's necessary
      if (this.lastUpdatedAt !== lastUpdatedAt) {
        this.setLastUpdatedAt(lastUpdatedAt)
        await this.storageService.setSettings(SETTINGS_NAMES.LAST_UPDATED_AT, lastUpdatedAt)
      }

      this.setSyncDate(Date.now())
    } finally {
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)
    }
  }
}

const WorkerStepEnum = Object.freeze({
  SYNCHRONIZE_MOVIES: 'SYNCHRONIZE_MOVIES'
})

export default SyncStore
