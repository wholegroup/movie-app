import { action, computed, makeObservable, observable } from 'mobx'
import { CronExpressionParser } from 'cron-parser'
import { SETTINGS_NAMES } from './StorageService.js'

class SyncStore {
  /** @type {StorageService} */
  storageService

  /** @type {ApiService} */
  apiService

  /** @type {number} worker intervalId */
  workerIntervalId

  /** @type {WorkerStepEnum[]} */
  workerStepsExecuting = []

  /** @type {boolean} isInitialized flag. */
  isInitialized = false

  /** @type {boolean} isOnline flag.  */
  isOnline = false

  /** @type {boolean} isBusy flag. */
  isBusy = false

  /** @type {boolean} Worker is in delayed mode. */
  isDelayed = false

  /** @type {number} Timestamp when idDelayed set */
  delayedDate = 0

  /** @type {number} Timestamp to catch any data changes after synchronization. */
  changesHash = 0

  /** @type {number} Movies last synchronization timestamp during active session. */
  moviesSyncedTs = 0

  /** @type {boolean} To force movie synchronization. */
  forceSynchronization = false

  /** @type {string} updatedAt when movies updated last time (keeping in storage) during app lifetime. */
  moviesUpdatedAt = ''

  /** @type {number} profileSyncedTs timestamp */
  profileSyncedTs = 0

  /** @type {string} profileUpdatedAt timestamp from storage */
  profileUpdatedAt = ''

  /** @type {number} reset timestamp */
  resetTs = 0

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
      workerStepsExecuting: observable,
      startWorkerStepExecution: action,
      stopWorkerStepExecution: action,
      isSynchronizing: computed,
      isDelayed: observable,
      delayedDate: observable,
      setIsDelayed: action,
      moviesSyncedTs: observable,
      setMoviesSyncedTs: action,
      forceSynchronization: observable,
      setForceSynchronization: action,
      nextMoviesSyncedDate: computed,
      isSessionBeginning: computed,
      moviesUpdatedAt: observable,
      setMoviesUpdatedAt: action,
      profileSyncedTs: observable,
      setProfileSyncedTs: action,
      profileUpdatedAt: observable,
      setProfileUpdatedAt: action,
      nextProfileUpdatingTs: computed,
      purgedTs: observable,
      setPurgedTs: action,
      nextPurgingTs: computed,
      resetTs: observable,
      setResetTs: action,
      nextResetTs: computed,
      isSWInstalled: computed
    })
  }

  /**
   * Sets isInitialized flag.
   */
  setIsInitialized () {
    this.isInitialized = true
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
   * @param {number} moviesSyncedTs
   */
  setMoviesSyncedTs (moviesSyncedTs) {
    this.moviesSyncedTs = moviesSyncedTs
  }

  /**
   * Calculate is new session started. It means no any synchronization finished.
   * @returns {boolean}
   */
  get isSessionBeginning () {
    return this.moviesSyncedTs === 0
  }

  /**
   * Sets forceSynchronization flag.
   * @param {boolean} forceSynchronization
   */
  setForceSynchronization (forceSynchronization) {
    this.forceSynchronization = forceSynchronization
  }

  /**
   * Calculates next syncDate.
   * @returns {number}
   */
  get nextMoviesSyncedDate () {
    if (this.forceSynchronization) {
      return this.moviesSyncedTs
    }

    // every 30 minutes
    return this.nextCronDate(this.moviesSyncedTs, '0 */30 * * * *')
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

    const interval = CronExpressionParser.parse(schedule, {
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
    return this.workerStepsExecuting.length > 0 || !this.moviesSyncedTs
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
   * Sets moviesUpdatedAt.
   * @param {string} moviesUpdatedAt
   */
  setMoviesUpdatedAt (moviesUpdatedAt) {
    this.moviesUpdatedAt = moviesUpdatedAt
  }

  /**
   * Sets profileUpdatedAt.
   * @param {string} profileUpdatedAt
   */
  setProfileUpdatedAt (profileUpdatedAt) {
    this.profileUpdatedAt = profileUpdatedAt
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  async initializeStoreData () {
    this.setMoviesUpdatedAt(await this.storageService.getSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT) || '')
    this.setProfileUpdatedAt(await this.storageService.getSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT) || '')
    this.setResetTs(await this.storageService.getSettings(SETTINGS_NAMES.RESET_TS) || 0)
    this.setPurgedTs(await this.storageService.getSettings(SETTINGS_NAMES.PURGED_TS) || 0)

    // normalize resetTs, it has to be less than Date.now()
    if (this.resetTs && !(this.resetTs < Date.now())) {
      console.log('Normalizing reset timestamp!')
      this.setResetTs(0)
    }

    // normalize purgedTs, it has to be less than Date.now()
    if (this.purgedTs && !(this.purgedTs < Date.now())) {
      console.log('Normalizing purged timestamp!')
      this.setPurgedTs(0)
    }
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
    this.setIsInitialized()

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
    if (Date.now() >= this.nextResetTs) {
      return await this.resetPoint()
    }

    if (Date.now() >= this.nextProfileUpdatingTs) {
      return await this.synchronizeProfile()
    }

    if (Date.now() >= this.nextMoviesSyncedDate) {
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
    this.setForceSynchronization(true)
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
      } = await this.apiService.loadMovies(this.moviesUpdatedAt)
      console.log('Got', movies.length, 'movies,', votes.length, 'votes,', images.length, 'images,',
        metadata.length, 'metadata items')
      console.log('Movies updated at', lastUpdatedAt)

      // save in storage
      await this.storageService.upsertMovies(movies)
      await this.storageService.upsertVotes(votes)
      await this.storageService.upsertImages(images)
      await this.storageService.upsertMetadata(metadata)

      // update lastUpdatedAt if it's necessary
      if (this.moviesUpdatedAt !== lastUpdatedAt) {
        this.setMoviesUpdatedAt(lastUpdatedAt)
        await this.storageService.setSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT, lastUpdatedAt)
      }

      this.setMoviesSyncedTs(Date.now())
      this.setForceSynchronization(false)
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
    return this.nextCronDate(this.profileSyncedTs, '0 15 * * * *')
  }

  /**
   * Sets profileSyncedTs.
   * @param {number} profileSyncedTs
   */
  setProfileSyncedTs (profileSyncedTs) {
    this.profileSyncedTs = profileSyncedTs
  }

  /**
   * Schedules updating profile.
   */
  scheduleSynchronizingProfile () {
    this.setProfileSyncedTs(0)
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

      // calculate details to synchronize
      const allDetails = await this.storageService.loadAllDetails()
      const notSyncedDetails = allDetails.filter(({ syncedAt }) => !syncedAt)

      const profileResponse = await this.apiService.loadProfile(notSyncedDetails, this.profileUpdatedAt)
      if (profileResponse) {
        const { info } = profileResponse
        const userProfile = {
          id: info.id,
          isAdmin: info.isAdmin,
          email: info.user.email,
          name: info.user.name,
          picture: info.user.picture
        }

        // load details
        const { details, lastUpdatedAt } = profileResponse
        console.log('Got', details.length, 'details')
        console.log('Profile updated at', lastUpdatedAt)

        // save in storage
        await this.storageService.upsertDetails(details)

        // update lastUpdatedAt if it's necessary
        if (this.profileUpdatedAt !== lastUpdatedAt) {
          this.setProfileUpdatedAt(lastUpdatedAt)
          await this.storageService.setSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT, lastUpdatedAt)
        }

        await this.storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, userProfile)
      } else {
        await this.storageService.setSettings(SETTINGS_NAMES.USER_PROFILE, null)
      }

      this.setProfileSyncedTs(Date.now())
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.SYNCHRONIZE_PROFILE)
    }
  }

  /**
   * Calculates next resetTs.
   * @returns {number}
   */
  get nextResetTs () {
    // once a month
    return this.nextCronDate(this.resetTs, '0 0 0 1 * *')
  }

  /**
   * Check if SW installed (resetTs is defined)
   * @returns {boolean}
   */
  get isSWInstalled () {
    return !!this.resetTs
  }

  /**
   * Sets resetTs.
   * @param {number} resetTs
   */
  setResetTs (resetTs) {
    this.resetTs = resetTs
  }

  /**
   * Reset starting point.
   * @returns {Promise<boolean>}
   */
  async resetPoint () {
    const tm = 'Reset starting point...'
    console.time(tm)

    try {
      this.startWorkerStepExecution(WorkerStepEnum.RESET_POINT)

      this.setMoviesUpdatedAt('')
      await this.storageService.setSettings(SETTINGS_NAMES.MOVIES_UPDATED_AT, '')

      this.setProfileUpdatedAt('')
      await this.storageService.setSettings(SETTINGS_NAMES.PROFILE_UPDATED_AT, '')

      this.setResetTs(Date.now())
      await this.storageService.setSettings(SETTINGS_NAMES.RESET_TS, this.resetTs)
    } finally {
      console.timeEnd(tm)
      this.stopWorkerStepExecution(WorkerStepEnum.RESET_POINT)
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
      const purgedNumber = await this.storageService.purgeMovies()
      this.setPurgedTs(Date.now())
      await this.storageService.setSettings(SETTINGS_NAMES.PURGED_TS, this.purgedTs)
      if (purgedNumber > 0) {
        console.log(purgedNumber + (purgedNumber > 1 ? ' movies are purged' : ' movie is purged'))
      }
      return purgedNumber > 0
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
  SYNCHRONIZE_PROFILE: 'SYNCHRONIZE_PROFILE'
})

export default SyncStore
