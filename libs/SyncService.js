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
   * @param {string} filename Path to DB
   * @returns {Promise<SyncService>}
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
   * Lists of movies.
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<*[]>}
   */
  async moviesSince (lastUpdatedAt) {
    return []
  }

  /**
   * Lists of votes.
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<*[]>}
   */
  async votesSince (lastUpdatedAt) {
    return []
  }

  /**
   * lists of images.
   * @param {number} lastUpdatedAt Timestamp
   * @returns {Promise<*[]>}
   */
  async imagesSince (lastUpdatedAt) {
    return []
  }
}

export default SyncService
