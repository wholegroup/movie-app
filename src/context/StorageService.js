import Dexie from 'dexie'
import ApiService from './ApiService.js'

/**
 * @typedef TStorage
 * @property {Dexie.Table} settings
 * @property {Dexie.Table<TMovieItem>} movies
 * @property {Dexie.Table<TVotesItem>} votes
 * @property {Dexie.Table<TImagesItem>} images
 * @property {Dexie.Table<TMetadataItem>} metadata
 * @property {Dexie.Table<TDetailsItem>} details
 */

class StorageService {
  /** @type {Dexie|TStorage} */
  storage = null

  /**
   * Makes the storage is ready.
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    const dbName = 'storage'
    const db = new Dexie(dbName)
    db.version(3)
      .stores({
        settings: '',
        movies: ',movieId',
        votes: ',movieId',
        images: ',movieId',
        metadata: ',movieId',
        details: ',movieId'
      })
    await db.open()

    this.storage = db
  }

  /**
   * Disposes service.
   * @returns {Promise<void>}
   */
  async disposeAsync () {
    // we don't need to close db manually !!!
    // because we can get DatabaseClosedError internally in Dexie
    // if (this.storage.isOpen()) {
    //   await this.storage.close()
    // }
  }

  /**
   * Returns settings by name.
   * @param {string} name
   * @returns {Promise<string|object>}
   */
  async getSettings (name) {
    return this.storage.settings.get(name)
  }

  /**
   * Saves settings by name
   * @param {string} name
   * @param {string|object} value
   * @returns {Promise<void>}
   */
  async setSettings (name, value) {
    await this.storage.settings.put(value, name)
  }

  /**
   * Upsert movies.
   * @param {TMovieItem[]} movies
   * @returns {Promise<void>}
   */
  async upsertMovies (movies) {
    return this.storage.movies.bulkPut(movies, movies.map(({ movieId }) => movieId))
  }

  /**
   * Upsert votes.
   * @param {TVotesItem[]} votes
   * @returns {Promise<void>}
   */
  async upsertVotes (votes) {
    return this.storage.votes.bulkPut(votes, votes.map(({ movieId }) => movieId))
  }

  /**
   * Upsert images.
   * @param {TImagesItem[]} images
   * @returns {Promise<void>}
   */
  async upsertImages (images) {
    return this.storage.images.bulkPut(images, images.map(({ movieId }) => movieId))
  }

  /**
   * Upsert metadata.
   * @param {TMetadataItem[]} metadata
   * @returns {Promise<void>}
   */
  async upsertMetadata (metadata) {
    return this.storage.metadata.bulkPut(metadata, metadata.map(({ movieId }) => movieId))
  }

  /**
   * Upsert details.
   * @param {TDetailsItem[]} details
   * @returns {Promise<void>}
   */
  async upsertDetails (details) {
    return this.storage.details.bulkPut(details, details.map(({ movieId }) => movieId))
  }

  /**
   * Finds movie by slug.
   * @param {string} slug
   * @returns {Promise<TMovieItem>}
   */
  async findMovieBySlug (slug) {
    return this.storage.movies.filter(m => m.slug === slug.toLowerCase()).first()
  }

  /**
   * Finds movie votes.
   * @param {number} movieId
   * @returns {Promise<TVotesItem>}
   */
  async findVotesByMovieId (movieId) {
    return this.storage.votes.get(movieId)
  }

  /**
   * Find movie images.
   * @param {number} movieId
   * @returns {Promise<TImagesItem>}
   */
  async findImagesByMovieId (movieId) {
    return this.storage.images.get(movieId)
  }

  /**
   * Find movie metadata.
   * @param {number} movieId
   * @returns {Promise<TMetadataItem>}
   */
  async findMetadataByMovieId (movieId) {
    return this.storage.metadata.get(movieId)
  }

  /**
   * Find movie details.
   * @param {number} movieId
   * @returns {Promise<?TDetailsItem>}
   */
  async findDetailsByMovieId (movieId) {
    return this.storage.details.get(movieId)
  }

  /**
   * Load all movie cards.
   * @returns {Promise<TMovieCard[]>}
   */
  async loadAllCards () {
    const movies = await this.storage.movies.toArray()
    const images = await this.storage.images.toArray()

    // movie is new before this date
    const freshDate = new Date()
    freshDate.setDate(freshDate.getDate() - 14) // minus 14 days
    const freshDateISO = freshDate.toISOString()

    // noinspection UnnecessaryLocalVariableJS
    const cards = movies.map(movie => {
      const mainImage = images.find(nextImages => nextImages.movieId === movie.movieId)?.images?.[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        posterHash: mainImage?.hash || null,
        posterUrl: ApiService.generatePreviewUrl(mainImage?.hash || ''),
        isNew: movie.createdAt > freshDateISO,
        createdAt: movie.createdAt
      }
    })
    return cards
  }

  /**
   * Load all details.
   * @returns {Promise<TDetailsItem[]>}
   */
  async loadAllDetails () {
    return this.storage.details.toArray()
  }

  /**
   * Purges movies that wasn't updated 7 * 3/weeks days.
   * @returns {Promise<number>}
   */
  async purgeMovies () {
    // find ids to purge
    const votes = await this.storage.votes.toArray()
    const lastUpdatedAt = votes.reduce((res, { updatedAt }) => updatedAt > res ? updatedAt : res, '')
    const lastUpdatedTs = new Date(lastUpdatedAt).getTime() || Date.now()
    const idsToPurge = votes
      .filter(({ updatedAt }) => (new Date(updatedAt).getTime() || 0) < (lastUpdatedTs - 1000 * 60 * 60 * 24 * 7 * 3))
      .map(({ movieId }) => movieId)

    // deleting by chunks
    const chunkSize = 30
    const chunks = [...Array(Math.ceil(idsToPurge.length / chunkSize))]
      .map((_, i) => idsToPurge.slice(i * chunkSize, i * chunkSize + chunkSize))

    for (const nextChunk of chunks) {
      // clean table items
      // votes in the end! in case of previous issues
      for (const tableName of ['movies', 'images', 'metadata', 'votes']) {
        await this.storage.transaction('rw', this.storage.table(tableName), async () => {
          await this.storage.table(tableName).bulkDelete(nextChunk)
        })
      }
    }

    return idsToPurge.length
  }

  /**
   * Sets movie mark.
   * @param {number} movieId
   * @param {?number} mark
   */
  async setMovieMark (movieId, mark) {
    await this.storage.transaction('rw', this.storage.details, async () => {
      const details = (await this.findDetailsByMovieId(movieId)) || { movieId }
      await this.storage.details.put({
        ...details, mark: mark || null, syncedAt: null
      }, movieId)
    })
  }

  /**
   * Clears all user data.
   * @returns {Promise<void>}
   */
  async clearAllUserData () {
    await this.storage.details.clear()
    await this.storage.metadata.clear()
    await this.storage.settings.clear()
  }

  /**
   * Finds the last date when a movie added.
   * @returns {Promise<string>}
   */
  async getLastCreatedAt () {
    const movies = await this.storage.movies.toArray()
    return movies.reduce((res, { createdAt }) => createdAt > res ? createdAt : res, '')
  }

  /**
   * Finds the last date when we've got updates.
   * @returns {Promise<string>}
   */
  async getLastUpdatedAt () {
    const votes = await this.storage.votes.toArray()
    return votes.reduce((res, { updatedAt }) => updatedAt > res ? updatedAt : res, '')
  }
}

/**
 * @typedef TMovieItem
 * @property {number} movieId
 * @property {string} slug
 * @property {string} title
 * @property {?number} year
 * @property {?string} runtime
 * @property {?string} description
 * @property {?string[]} genres
 * @property {?TMoviePerson} directors
 * @property {?TMoviePerson} stars
 * @property {?string} createdAt
 * @property {?string} updatedAt
 */

/**
 * @typedef TMoviePerson
 * @property {number} personId
 * @property {string} slug
 * @property {string} fullName
 */

/**
 * @typedef TVotesItem
 * @property {number} movieId
 * @property {number} votes
 * @property {string} updatedAt
 */

/**
 * @typedef TImagesItem
 * @property {number} movieId
 * @property {{hash: string}[]} images
 * @property {string} updatedAt
 */

/**
 * @typedef TMetadataItem
 * @property {number} movieId
 * @property {object} flags
 * @property {string} updatedAt
 */

/**
 * @typedef TMovieCard
 * @property {number} movieId
 * @property {string} slug
 * @property {string} title
 * @property {number} year
 * @property {string} genres
 * @property {string} posterHash
 * @property {string} posterUrl
 * @property {boolean} [isNew]
 * @property {createdAt} [createdAt]
 */

/**
 * @typedef TUserProfile
 * @property {string} id
 * @property {string} [email]
 * @property {string} [name]
 * @property {string} [picture]
 * @property {boolean} [isAdmin]
 */

/**
 * @typedef TDetailsItem
 * @property {number} movieId
 * @property {?number=} mark
 * @property {?string=} syncedAt
 */

export const SETTINGS_NAMES = Object.freeze({
  MOVIES_UPDATED_AT: 'MOVIES_UPDATED_AT',
  PROFILE_UPDATED_AT: 'PROFILE_UPDATED_AT',
  RESET_TS: 'RESET_TS',
  PURGED_TS: 'PURGED_TS',
  USER_PROFILE: 'USER_PROFILE',
  USER_FILTERS: 'USER_FILTERS',
  PUSH_ENDPOINT: 'PUSH_ENDPOINT',
  PUSH_HASH: 'PUSH_HASH'
})

export default StorageService
