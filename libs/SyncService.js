import * as sqlite3 from 'sqlite3'

class SyncService {
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
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<*[]>}
   */
  async moviesSince (lastUpdatedAt) {
    const allMovies = await this.allData('movie')
    if (!lastUpdatedAt) {
      return allMovies
    }
    return allMovies.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * Lists of votes.
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async votesSince (lastUpdatedAt) {
    const allVotes = await this.allData('votes')
    if (!lastUpdatedAt) {
      return allVotes
    }
    return allVotes.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }

  /**
   * lists of images.
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async imagesSince (lastUpdatedAt) {
    const allImages = await this.allData('images')
    if (!lastUpdatedAt) {
      return allImages
    }
    return allImages.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
  }
}

export default SyncService
