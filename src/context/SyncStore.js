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

  /** @type {number} profileUpdatedAt timestamp */
  profileUpdatedTs = 0

  /** @type {number} purged timestamp */
  purgedTs = 0

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
      setIsOnline: action,
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
      setLastUpdatedAt: action,
      profileUpdatedTs: observable,
      setProfileUpdatedTs: action,
      nextProfileUpdatingTs: computed,
      purgedTs: observable,
      setPurgedTs: action,
      nextPurgingTs: computed
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
   * Sets isOnline.
   * @param {boolean} isOnline
   */
  setIsOnline (isOnline) {
    this.isOnline = isOnline
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
    // every 30 minutes
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
    this.setPurgedTs(await this.storageService.getSettings(SETTINGS_NAMES.PURGED_TS) || 0)

    // normalize purgedTs, it has to be less than Date.now()
    if (this.purgedTs && !(this.purgedTs < Date.now())) {
      console.log('Normalizing purged timestamp!')
      this.setPurgedTs(0)
    }

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
    if (Date.now() >= this.nextProfileUpdatingTs) {
      return await this.synchronizeProfile()
    }

    if (Date.now() >= this.nextSyncDate) {
      return await this.synchronizeMovies()
    }

    if (Date.now() >= this.nextPurgingTs) {
      return await this.purgeMovies()
    }

    return false
  }

  /**
   * Schedules synchronizing movies.
   */
  scheduleSynchronizingMovies () {
    this.setSyncDate(0)
  }

  /**
   * Synchronizes movies.
   * @returns {Promise<boolean>}
   */
  async synchronizeMovies () {
    const tm = 'Synchronizing movies...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)

      // load movies
      const {
        movies,
        votes,
        images,
        metadata,
        lastUpdatedAt
      } = await this.apiService.loadMovies(this.lastUpdatedAt)
      console.log('Loaded', movies.length, 'movies,', votes.length, 'votes,', images.length, 'images',
        metadata.length, 'metadata items')
      console.log('Last updated at', lastUpdatedAt)

      // save in storage
      await this.storageService.upsertMovies(movies)
      await this.storageService.upsertVotes(votes)
      await this.storageService.upsertImages(images)
      await this.storageService.upsertMetadata(metadata)

      // update lastUpdatedAt if it's necessary
      if (this.lastUpdatedAt !== lastUpdatedAt) {
        this.setLastUpdatedAt(lastUpdatedAt)
        await this.storageService.setSettings(SETTINGS_NAMES.LAST_UPDATED_AT, lastUpdatedAt)
      }

      this.setSyncDate(Date.now())
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)
    }
  }

  /**
   * Calculates next syncDate.
   * @returns {number}
   */
  get nextProfileUpdatingTs () {
    // every hour at 15m:00s
    return this.nextCronDate(this.profileUpdatedTs, '0 15 * * * *')
  }

  /**
   * Sets profileUpdatedTs.
   * @param {number} profileUpdatedTs
   */
  setProfileUpdatedTs (profileUpdatedTs) {
    this.profileUpdatedTs = profileUpdatedTs
  }

  /**
   * Schedules updating profile.
   */
  scheduleUpdatingProfile () {
    this.setProfileUpdatedTs(0)
  }

  /**
   * Synchronizes user profile.
   * @returns {Promise<boolean>}
   */
  async synchronizeProfile () {
    const tm = 'Synchronizing profile...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_PROFILE)

      const profileResponse = await this.apiService.loadProfile()
      if (profileResponse) {
        const profile = {
          id: profileResponse.id,
          isAdmin: profileResponse.isAdmin,
          email: profileResponse.user.email,
          name: profileResponse.user.name,
          picture: profileResponse.user.picture
        }
        await this.storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, profile)
      } else {
        await this.storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, null)
      }

      this.setProfileUpdatedTs(Date.now())
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_PROFILE)
    }
  }

  /**
   * Calculates next purgingTs.
   * @returns {number}
   */
  get nextPurgingTs () {
    // once a week
    return this.nextCronDate(this.purgedTs, '0 0 0 */7 * *')
  }

  /**
   * Sets purgedTs.
   * @param {number} purgedTs
   */
  setPurgedTs (purgedTs) {
    this.purgedTs = purgedTs
  }

  /**
   * Purging movies.
   * @returns {Promise<boolean>}
   */
  async purgeMovies () {
    const tm = 'Purging movies...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.PURGE_MOVIES)
      await this.storageService.purgeMovies()
      this.setPurgedTs(Date.now())
      await this.storageService.setSettings(SETTINGS_NAMES.PURGED_TS, this.purgedTs)
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.PURGE_MOVIES)
    }
  }
}

const WorkerStepEnum = Object.freeze({
  PURGE_MOVIES: 'PURGE_MOVIES',
  SYNCHRONIZE_MOVIES: 'SYNCHRONIZE_MOVIES',
  SYNCHRONIZE_PROFILE: 'SYNCHRONIZE_PROFILE'
})

export default SyncStore
