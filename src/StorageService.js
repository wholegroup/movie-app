import Dexie from 'dexie'

/**
 * @typedef TStorage
 * @property {import('dexie').Table} settings
 * @property {import('dexie').Table} movies
 * @property {import('dexie').Table} votes
 * @property {import('dexie').Table} images
 */

class StorageService {
  /** @type {import('dexie').Dexie|TStorage} */
  storage = null

  /**
   * Makes the storage is ready.
   * @returns {Promise<void>}
   */
  async makeReadyAsync () {
    const dbName = 'storage'
    const db = new Dexie(dbName)
    db.version(1)
      .stores({
        settings: '',
        movies: ',movieId',
        votes: ',movieId',
        images: ',movieId'
      })
    await db.open()

    this.storage = db
  }

  /**
   * Returns settings by name.
   * @param {string} name
   * @returns {Promise<string>}
   */
  async getSettings (name) {
    return this.storage.settings.get(name)
  }

  /**
   * Saves settings by name
   * @param {string} name
   * @param {string} value
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
}

/**
 * @typedef TMovieItem
 * @property {number} movieId
 */

/**
 * @typedef TVotesItem
 * @property {number} movieId
 */

/**
 * @typedef TImagesItem
 * @property {number} movieId
 */

export const SETTINGS_NAMES = Object.freeze({
  LAST_UPDATED_AT: 'LAST_UPDATED_AT'
})

export default StorageService
