import { makeAutoObservable } from 'mobx'
import { CronExpressionParser } from 'cron-parser'
import { SETTINGS_NAMES } from './StorageService.js'

class SyncStore {
  /** @type {CommonService} */
  #commonService

  /** @type {StorageService} */
  #storageService

  /** @type {ApiService} */
  #apiService

  /** @type {number} Worker interval ID. */
  workerIntervalId

  /** @type {WorkerStepEnum[]} */
  workerStepsExecuting = []

  /** @type {boolean} Initialized flag. */
  isInitialized = false

  /** @type {boolean} Online status flag.  */
  isOnline = false

  /** @type {boolean} Busy flag. */
  isBusy = false

  /** @type {boolean} Indicates whether the worker is in delayed mode. */
  isDelayed = false

  /** @type {number|null} Timestamp when isDelayed was set. */
  delayedDate = null

  /** @type {number|null} Timestamp to catch any data changes after synchronization. */
  changesHash = null

  /** @type {number|null} Movies last synchronization timestamp during active session. */
  moviesSyncedTs = null

  /** @type {boolean} Forces movie synchronization. */
  forceSynchronization = false

  /** @type {string|null} updatedAt when movies updated last time (kept during the app lifetime in storage). */
  moviesUpdatedAt = null

  /** @type {number|null} Profile synchronization timestamp. */
  profileSyncedTs = null

  /** @type {string|null} profileUpdatedAt timestamp from storage */
  profileUpdatedAt = null

  /** @type {number|null} Reset timestamp */
  resetTs = null

  /** @type {number|null} Purge timestamp. */
  purgedTs = null

  /**
   * Default constructor.
   * @param {CommonService} commonService
   * @param {StorageService} storageService
   * @param {ApiService} apiService
   */
  constructor (commonService, storageService, apiService) {
    this.#commonService = commonService
    this.#storageService = storageService
    this.#apiService = apiService
    makeAutoObservable(this)
  }

  /**
   * Sets the isOnline flag.
   * @param {boolean} isOnline
   */
  setIsOnline (isOnline) {
    this.isOnline = isOnline
  }

  /**
   * Checks whether a new session has started (i.e., no synchronization has completed yet).
   * @returns {boolean}
   */
  get isSessionBeginning () {
    return this.moviesSyncedTs === null
  }

  /**
   * Calculates the next movies sync time.
   * @returns {number}
   */
  get nextMoviesSyncedDate () {
    if (this.forceSynchronization) {
      return this.moviesSyncedTs
    }

    // every 30 minutes
    return this.#nextCronDate(this.moviesSyncedTs, '0 */30 * * * *')
  }

  /**
   * Calculates the next cron date using the provided schedule.
   * @param {number|null} from
   * @param {string} schedule
   */
  #nextCronDate (from, schedule) {
    if (!from) {
      return Date.now()
    }

    const interval = CronExpressionParser.parse(schedule, {
      currentDate: from
    })
    return interval.next().getTime()
  }

  /**
   * Marks a worker step as executing.
   * @param {WorkerStepEnum} step
   */
  startWorkerStepExecution (step) {
    this.workerStepsExecuting = [...new Set([...this.workerStepsExecuting, step])]
  }

  /**
   * Marks a worker step as no longer executing.
   * @param {WorkerStepEnum} step
   */
  stopWorkerStepExecution (step) {
    this.workerStepsExecuting = this.workerStepsExecuting.filter(i => i !== step)
  }

  /**
   * Checks whether synchronization is currently in progress or has never been started yet.
   * @returns {boolean}
   */
  get isSynchronizing () {
    return this.workerStepsExecuting.length > 0 || this.moviesSyncedTs === null
  }

  /**
   * Enables/disables the worker delay flag.
   * @param {boolean} isDelayed
   */
  delayWorker (isDelayed) {
    this.isDelayed = isDelayed
    this.delayedDate = isDelayed ? Date.now() : 0
  }

  /**
   * Initializes the store state from storage.
   * @returns {Promise<void>}
   */
  * initializeStoreData () {
    this.moviesUpdatedAt = yield this.#storageService.getSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT) || null
    this.profileUpdatedAt = yield this.#storageService.getSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT) || null
    this.resetTs = yield this.#storageService.getSettings(SETTINGS_NAMES.RESET_TS) || null
    this.purgedTs = yield this.#storageService.getSettings(SETTINGS_NAMES.PURGED_TS) || null

    // to normalize resetTs, it has to be less than Date.now()
    if (this.resetTs && !(this.resetTs < Date.now())) {
      console.log('Normalizing reset timestamp!')
      this.resetTs = null
    }

    // to normalize purgedTs, it has to be less than Date.now()
    if (this.purgedTs && !(this.purgedTs < Date.now())) {
      console.log('Normalizing purged timestamp!')
      this.purgedTs = null
    }
  }

  /**
   * Async makeReady
   * @returns {Promise<void>}
   */
  * makeReadyAsync () {
    if (this.isInitialized) {
      throw new Error('Already initialized')
    }

    yield this.initializeStoreData()
    this.isInitialized = true

    // run the worker every second (1_000 ms).
    this.workerIntervalId = setInterval(() => {
      this.runWorker()
        .catch(console.error)
    }, 1_000)
  }

  /**
   * Disposes the store.
   * @returns {Promise<void>}
   */
  * disposeAsync () {
    clearInterval(this.workerIntervalId)
    yield
  }

  /**
   * Runs the worker.
   * @returns {Promise<void>}
   */
  * runWorker () {
    if (!this.isInitialized || !this.isOnline || this.isBusy) {
      return yield
    }

    // Check whether the worker is delayed and reset the delay after 60 seconds.
    if (this.isDelayed) {
      if (Date.now() < (this.delayedDate + 60 * 1000)) {
        return yield
      }
      this.delayWorker(false)
    }

    try {
      this.isBusy = true
      const dataChanged = yield this.doWorkerStep()
      if (dataChanged) {
        this.changesHash = Date.now()
      }
    } catch (ex) {
      console.log(ex)
      console.log('Worker has been delayed for 60 seconds because of an error.')
      this.delayWorker(true)
    } finally {
      this.isBusy = false
    }
  }

  /**
   * Executes a single sync step.
   * @returns {Promise<boolean>}
   */
  * doWorkerStep () {
    if (Date.now() >= this.nextResetTs) {
      return yield this.resetPoint()
    }

    if (Date.now() >= this.nextProfileUpdatingTs) {
      yield this.validateSubscription()
      return yield this.synchronizeProfile()
    }

    if (Date.now() >= this.nextMoviesSyncedDate) {
      return yield this.synchronizeMovies()
    }

    if (Date.now() >= this.nextPurgingTs) {
      return yield this.purgeMovies()
    }

    return yield false
  }

  /**
   * Schedules movie synchronization.
   */
  scheduleSynchronizingMovies () {
    this.forceSynchronization = true
  }

  /**
   * Synchronizes movies.
   * @returns {Promise<boolean>}
   */
  * synchronizeMovies () {
    const tm = 'Synchronizing movies...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)

      // Load movies
      const {
        movies,
        votes,
        images,
        metadata,
        lastUpdatedAt
      } = yield this.#apiService.loadMovies(this.moviesUpdatedAt)
      console.log('Got', movies.length, 'movies,', votes.length, 'votes,', images.length, 'images,',
        metadata.length, 'metadata items')
      console.log('Movies updated at', lastUpdatedAt)

      // Save to storage
      yield this.#storageService.upsertMovies(movies)
      yield this.#storageService.upsertVotes(votes)
      yield this.#storageService.upsertImages(images)
      yield this.#storageService.upsertMetadata(metadata)

      // Update lastUpdatedAt if necessary
      if (this.moviesUpdatedAt !== lastUpdatedAt) {
        this.moviesUpdatedAt = lastUpdatedAt
        yield this.#storageService.setSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT, lastUpdatedAt)
      }

      this.moviesSyncedTs = Date.now()
      this.forceSynchronization = false // reset the force synchronization flag (just in case).
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_MOVIES)
    }
  }

  /**
   * Calculates the next profile sync time.
   * @returns {number}
   */
  get nextProfileUpdatingTs () {
    // Every hour at 15m:00s
    return this.#nextCronDate(this.profileSyncedTs, '0 15 * * * *')
  }

  /**
   * Schedules profile synchronization.
   */
  scheduleSynchronizingProfile () {
    this.profileSyncedTs = 0
  }

  /**
   * Synchronizes the user profile.
   * @returns {Promise<boolean>}
   */
  * synchronizeProfile () {
    const tm = 'Synchronizing profile...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_PROFILE)

      // Calculate details to synchronize
      const allDetails = yield this.#storageService.loadAllDetails()
      const notSyncedDetails = allDetails.filter(({ syncedAt }) => !syncedAt)

      // Load profile
      const pushEndpoint = yield this.#storageService.getSettings(SETTINGS_NAMES.PUSH_ENDPOINT)
      const profileResponse = yield this.#apiService.loadProfile(notSyncedDetails, pushEndpoint, this.profileUpdatedAt)

      // Process user details
      const { details = null } = profileResponse
      if (details) {
        console.log('Got', details.length, 'details')
        yield this.#storageService.upsertDetails(details)
      }

      // Update lastUpdatedAt if necessary
      const { lastUpdatedAt = null } = profileResponse
      if (lastUpdatedAt) {
        console.log('Profile updated at', lastUpdatedAt)
        if (this.profileUpdatedAt !== lastUpdatedAt) {
          this.profileUpdatedAt = lastUpdatedAt
          yield this.#storageService.setSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT, lastUpdatedAt)
        }
      }

      // User info.
      const { info } = profileResponse
      const userProfile = Object.fromEntries(Object.entries({
        id: info.id,
        isAdmin: info.isAdmin,
        email: info.user?.email,
        name: info.user?.name,
        picture: info.user?.picture,
        notification: info.notification
      }).filter(([, v]) => v !== undefined))
      yield this.#storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, userProfile)

      this.profileSyncedTs = Date.now()
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_PROFILE)
    }
  }

  /**
   * Validates push subscription.
   * @returns {Promise<void>}
   */
  * validateSubscription () {
    const tm = 'Validating subscription...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.VALIDATE_PUSH)

      const pushSubscription = yield this.#commonService.findPushSubscription()
      const pushEndpoint = yield this.#storageService.getSettings(SETTINGS_NAMES.PUSH_ENDPOINT)
      const pushHash = yield this.#storageService.getSettings(SETTINGS_NAMES.PUSH_HASH)

      if (!pushSubscription) {
        // Remove the push subscription on the server.
        if (pushEndpoint || pushHash) {
          yield this.#storageService.setSettings(SETTINGS_NAMES.PUSH_ENDPOINT, null)
          yield this.#storageService.setSettings(SETTINGS_NAMES.PUSH_HASH, null)
          yield this.#apiService.pushUnsubscribe(pushEndpoint)
        }
        return yield
      }

      // Nothing to update.
      const currentHush = yield this.#commonService.pushHash(pushSubscription)
      if (pushSubscription.endpoint === pushEndpoint && currentHush === pushHash) {
        return yield
      }

      // Subscribe or update current subscription.
      yield this.#apiService.pushSubscribe(pushSubscription)
      yield this.#storageService.setSettings(SETTINGS_NAMES.PUSH_ENDPOINT, pushSubscription.endpoint)
      yield this.#storageService.setSettings(SETTINGS_NAMES.PUSH_HASH, currentHush)
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.VALIDATE_PUSH)
    }
  }

  /**
   * Calculates the next reset time.
   * @returns {number}
   */
  get nextResetTs () {
    // Once a month
    return this.#nextCronDate(this.resetTs, '0 0 0 1 * *')
  }

  /**
   * Reset the starting point.
   * @returns {Promise<boolean>}
   */
  * resetPoint () {
    const tm = 'Reset the starting point...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.RESET_POINT)

      this.moviesUpdatedAt = null
      yield this.#storageService.setSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT, '')

      this.profileUpdatedAt = null
      yield this.#storageService.setSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT, '')

      this.resetTs = Date.now()
      yield this.#storageService.setSettings(SETTINGS_NAMES.RESET_TS, this.resetTs)
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.RESET_POINT)
    }
  }

  /**
   * Calculates the next purge time.
   * @returns {number}
   */
  get nextPurgingTs () {
    // Once a week
    return this.#nextCronDate(this.purgedTs, '0 0 0 */7 * *')
  }

  /**
   * Purges movies.
   * @returns {Promise<boolean>}
   */
  * purgeMovies () {
    const tm = 'Purging movies...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.PURGE_MOVIES)
      const purgedNumber = yield this.#storageService.purgeMovies()
      this.purgedTs = Date.now()
      yield this.#storageService.setSettings(SETTINGS_NAMES.PURGED_TS, this.purgedTs)
      if (purgedNumber > 0) {
        console.log(purgedNumber + (purgedNumber > 1 ? ' movies are purged' : ' movie is purged'))
      }
      return yield purgedNumber > 0
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.PURGE_MOVIES)
    }
  }
}

/**
 * @typedef {string} WorkerStepEnum
 */
const WorkerStepEnum = Object.freeze({
  RESET_POINT: 'RESET_POINT',
  PURGE_MOVIES: 'PURGE_MOVIES',
  SYNCHRONIZE_MOVIES: 'SYNCHRONIZE_MOVIES',
  SYNCHRONIZE_PROFILE: 'SYNCHRONIZE_PROFILE',
  VALIDATE_PUSH: 'VALIDATE_PUSH'
})

export default SyncStore
