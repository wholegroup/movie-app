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
   * Load all movie cards.
   * @returns {Promise<TMovieCard[]>}
   */
  async loadAllCards () {
    const movies = await this.storage.movies.toArray()
    const images = await this.storage.images.toArray()

    // noinspection UnnecessaryLocalVariableJS
    const cards = movies.map(movie => {
      const mainImage = (images.find(nextImages => nextImages.movieId === movie.movieId) || {}).images[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        posterHash: mainImage?.hash || null
      }
    })
    return cards
  }
}

/**
 * @typedef TMovieItem
 * @property {number} movieId
 * @property {string} slug
 * @property {string} title
 * @property {number} year
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
 * @typedef TMovieCard
 * @property {number} movieId
 * @property {string} slug
 * @property {string} title
 * @property {number} year
 * @property {string} posterHash
 */

export const SETTINGS_NAMES = Object.freeze({
  LAST_UPDATED_AT: 'LAST_UPDATED_AT'
})

export default StorageService
