import * as sqlite3 from 'sqlite3'

// I added browser property into package.json to ignore importing sqlite3 by webpack in client side
// (because of getInitialProps)
// https://arunoda.me/blog/ssr-and-server-only-modules
// https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#caveats

class SyncBackendService {
  /** @type {string} */
  filename

  /** @type {?import('sqlite3').Database} */
  db = null

  /**
   * Default constructor
   * @param {string} filename Path to DB
   */
  constructor (filename) {
    this.filename = filename
  }

  /**
   * Opens DB and returns new service instance.
   * @returns {Promise<void>}
   */
  async open () {
    if (this.db) {
      throw new Error('Already open!')
    }
    this.db = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.filename, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve(db)
      })
    })
  }

  /**
   * Checks if db is open.
   * @returns {boolean}
   */
  isOpen () {
    return this.db !== null
  }

  /**
   * Closes db.
   * @returns {Promise<void>}
   */
  async close () {
    if (!this.db) {
      throw new Error('Nullable db')
    }
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
      this.db = null
    })
  }

  /**
   * Wraps db.all() with Promise.
   * @param {string} sql
   * @param params
   * @returns {Promise<object[]>}
   * @private
   */
  async getAllAsync (sql, ...params) {
    if (!this.db) {
      throw new Error('Nullable db')
    }
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err, rows) => {
        if (err) {
          reject(err)
          return
        }
        resolve(rows)
      })
    })
  }

  /**
   * Returns all rows.
   * @param {string} tableName
   * @returns {Promise<Object[]>}
   * @private
   */
  async allRows (tableName) {
    return await this.getAllAsync(`
        SELECT *
        FROM ${tableName}
    `, {}) || []
  }

  /**
   * Returns json data of all objects.
   * @param tableName
   * @returns {Promise<Object[]>}
   */
  async allData (tableName) {
    const rows = await this.allRows(tableName)
    // noinspection UnnecessaryLocalVariableJS
    const allObjects = rows.map(({ data = null }) => JSON.parse(data))
    return allObjects
  }

  /**
   * Lists of movies.
   * @param {string} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async moviesUpdated (lastUpdatedAt) {
    const allMovies = await this.allData('movies')
    const cleanMovies = allMovies.map(this.sanitizeMovie)
    if (!lastUpdatedAt) {
      return cleanMovies
    }
    return cleanMovies
      .filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * Lists of votes.
   * @param {string} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async votesUpdated (lastUpdatedAt) {
    const allVotes = await this.allData('votes')
    const cleanVotes = allVotes.map(this.sanitizeVotes)
    if (!lastUpdatedAt) {
      return cleanVotes
    }
    return cleanVotes.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * Metadata.
   * @param {string} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async metadataSince (lastUpdatedAt) {
    const allMetadata = await this.allData('metadata')
    if (!lastUpdatedAt) {
      return allMetadata
    }
    return allMetadata.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * lists of images.
   * @param {string} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async imagesUpdated (lastUpdatedAt) {
    const allImages = await this.allData('images')
    const cleanImages = allImages.map(this.sanitizeImages)
    if (!lastUpdatedAt) {
      return cleanImages
    }
    return cleanImages.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * Sanitizes movie.
   * @param {Object} movie
   * @returns {Object}
   */
  sanitizeMovie (movie) {
    return {
      movieId: movie.movieId,
      slug: movie.slug,
      title: movie.title,
      year: movie.year,
      genres: movie.genres,
      runtime: movie.runtime,
      description: movie.description,
      directors: movie.directors.map(({ personId, slug, fullName }) => ({
        personId,
        slug,
        fullName
      })),
      stars: movie.stars.map(({ personId, slug, fullName }) => ({
        personId,
        slug,
        fullName
      })),
      updatedAt: movie.updatedAt
    }
  }

  /**
   * Sanitizes votes.
   * @param {object} votesItem
   * @returns {object}
   */
  sanitizeVotes (votesItem) {
    return {
      movieId: votesItem.movieId,
      votes: votesItem.votes,
      updatedAt: votesItem.updatedAt
    }
  }

  /**
   * Sanitizes images
   * @param {object} imagesItem
   */
  sanitizeImages (imagesItem) {
    return {
      movieId: imagesItem.movieId,
      images: imagesItem.images.map(({ hash }) => ({
        hash
      })),
      updatedAt: imagesItem.updatedAt
    }
  }

  /**
   * Finds movie by slug.
   * @param {string} movieSlug
   * @returns {Promise<Object|null>}
   */
  async findMovieBySlug (movieSlug) {
    // find movie id
    const allSlugs = await this.allRows('ids')
    const { id: movieId } = allSlugs.find(({ slug }) => slug === movieSlug) || {}
    if (!movieId) {
      return null
    }

    // find movie
    const allMovies = await this.allData('movies')
    const movie = allMovies.find(nextMovie => nextMovie.movieId === movieId)
    if (!movie) {
      return null
    }

    return this.sanitizeMovie(movie)
  }

  /**
   * Finds movie votes.
   * @param {number} movieId
   * @returns {Promise<Object|null>}
   */
  async findVotesByMovieId (movieId) {
    const allVotes = await this.allData('votes')
    const votes = allVotes.find(nextVotes => nextVotes.movieId === movieId)
    if (!votes) {
      return null
    }

    return this.sanitizeVotes(votes)
  }

  /**
   * Finds movie images.
   * @param {number} movieId
   * @returns {Promise<Object|null>}
   */
  async findImagesByMovieId (movieId) {
    const allImages = await this.allData('images')
    const images = allImages.find(nextImages => nextImages.movieId === movieId)
    if (!images) {
      return null
    }

    return this.sanitizeImages(images)
  }

  /**
   * Calculates movie ids for public
   * @returns {Promise<number[]>}
   */
  async publicVisibleMovieIds () {
    // find updated/fresh movies for last 4 weeks
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 31)
    const votes = await this.votesUpdated(monthAgo.toISOString())
    return votes.map(({ movieId }) => movieId)
  }
}

export default SyncBackendService
