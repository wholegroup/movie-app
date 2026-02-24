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
    if (!filename) {
      console.log('Empty database filename. Using :memory:.')
      this.filename = ':memory:'
    } else {
      this.filename = filename
    }
  }

  /**
   * Opens DB and returns new service instance.
   * @param {boolean} runMigration
   * @returns {Promise<void>}
   */
  async open ({ runMigration = false } = {}) {
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

    // run migrations
    if (runMigration) {
      await this.migrate()
    }
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
   * Checks and runs migrations if necessary.
   * @returns {Promise<void>}
   */
  async migrate () {
    if (!this.db) {
      throw Error('Nullable db')
    }

    const { user_version: userVersion = 0 } = await this.getAsync('SELECT * FROM pragma_user_version')

    if (userVersion < 1) {
      await this._migrate_001()
    }

    if (userVersion < 2) {
      await this._migrate_002()
    }

    // // next migrations
    // if (userVersion < 3) {
    //   this.log.info('Run _migrate_003')
    //   await this._migrate_003()
    // }
  }

  /**
   * Migration #001
   * @returns {Promise<void>}
   */
  async _migrate_001 () {
    await this.runAsync('BEGIN')
    try {
      await this.runAsync(`
          CREATE TABLE details
          (
              userId  TEXT    NOT NULL CHECK (LENGTH(userId) > 0),
              movieId INTEGER NOT NULL, -- local id
              version INTEGER NOT NULL, -- optimistic lock
              data    TEXT    NOT NULL  -- json
          )
      `)
      await this.runAsync('PRAGMA user_version = 1') // migration number
      await this.runAsync('COMMIT')
    } catch (err) {
      await this.runAsync('ROLLBACK')
      throw err
    }
  }

  /**
   * Migration #002
   * @returns {Promise<void>}
   */
  async _migrate_002 () {
    await this.runAsync('BEGIN')
    try {
      await this.runAsync(`
        CREATE TABLE pushes
        (
          endpoint   TEXT    PRIMARY KEY CHECK (LENGTH(endpoint) > 0), -- unique endpoint as primary key
          version    INTEGER NOT NULL,                                 -- optimistic lock
          createdAt  TEXT    NOT NULL,                                 --
          updatedAt  TEXT    DEFAULT NULL,                             --
          data       TEXT    NOT NULL                                  -- json / PushSubscriptionJSON
        )
      `)
      await this.runAsync('PRAGMA user_version = 2') // migration number
      await this.runAsync('COMMIT')
    } catch (err) {
      await this.runAsync('ROLLBACK')
      throw err
    }
  }

  /**
   * Wraps db.get() with Promise.
   * @param {string} sql
   * @param params
   * @returns {Promise<?object>}
   * @private
   */
  async getAsync (sql, ...params) {
    if (!this.db) {
      throw Error('Nullable db')
    }
    return new Promise((resolve, reject) => {
      this.db.get(sql, ...params, (err, row) => {
        if (err) {
          reject(err)
          return
        }
        resolve(row)
      })
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
   * Wraps db.run() with Promise.
   * @param {string} sql
   * @param params
   * @returns {Promise<{lastID: ?number, changes: any}>}
   */
  async runAsync (sql, params = {}) {
    if (!this.db) {
      throw Error('Nullable db')
    }

    if (!sql.trim()) {
      throw new Error('Empty query')
    }

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err)
          return
        }
        resolve({
          lastID: this.lastID,
          changes: this.changes
        })
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
    // create temporary tables to avoid error without real database
    if (this.filename === ':memory:') {
      await this.runAsync(`
          CREATE TABLE IF NOT EXISTS ${tableName}
          (
              movieId INTEGER NOT NULL
          )
      `)
    }

    return await this.getAllAsync(`
        SELECT *
        FROM ${tableName}
    `, {}) || []
  }

  /**
   * Returns all rows.
   * @param {string} userId
   * @param {string} tableName
   * @returns {Promise<Object[]>}
   * @private
   */
  async allUserRows (userId, tableName) {
    return await this.getAllAsync(`
        SELECT *
        FROM ${tableName}
        WHERE userId = $userId
    `, { $userId: userId }) || {}
  }

  /**
   * Returns json data of all objects.
   * @param {string} tableName
   * @returns {Promise<Object[]>}
   */
  async allData (tableName) {
    const rows = await this.allRows(tableName)
    // noinspection UnnecessaryLocalVariableJS
    const allObjects = rows.map(({ data = null }) => JSON.parse(data))
    return allObjects
  }

  /**
   * Returns json data of all objects.
   * @param {string} userId
   * @param {string} tableName
   * @returns {Promise<Object[]>}
   */
  async allUserData (userId, tableName) {
    const rows = await this.allUserRows(userId, tableName)
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
   * User's movie details.
   * @param {string} userId
   * @param {string} lastUpdatedAt Timestamp
   * @returns {Promise<Object[]>}
   */
  async userDetailsSince (userId, lastUpdatedAt) {
    const allUserDetails = await this.allUserData(userId, 'details')
    if (!lastUpdatedAt) {
      return allUserDetails
    }
    return allUserDetails.filter(({ updatedAt }) => updatedAt > lastUpdatedAt)
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
      createdAt: movie.createdAt,
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
    // find updated/fresh movies for the previous 3 weeks since the last refresh occurred
    // NB pls synchronize this period with purging movies on client
    /** @type {{movieId: number, updatedAt: string}[]} */
    const allVotes = await this.allData('votes')
    const lastUpdatedAt = allVotes.reduce((res, { updatedAt }) => updatedAt > res ? updatedAt : res, '')
    const lastUpdatedTs = new Date(lastUpdatedAt).getTime() || Date.now()
    const minUpdatedTs = lastUpdatedTs - 1000 * 60 * 60 * 24 * 7 * 3
    const visibleVotes = allVotes
      .filter(({ updatedAt }) => (new Date(updatedAt).getTime() || 0) >= minUpdatedTs)
    return visibleVotes.map(({ movieId }) => movieId)
  }

  /**
   * Synchronizes user details.
   * @param {string} userId
   * @param {Object[]} detailsToSync
   * @returns {Promise<void>}
   */
  async synchronizeUserDetails (userId, detailsToSync) {
    const allDetailsByMovieId = (await this.allUserData(userId, 'details'))
      .reduce((acc, next) => ({ ...acc, [next.movieId]: next }), {})
    for (const nextDetails of detailsToSync) {
      const oldDetails = allDetailsByMovieId[nextDetails.movieId]
      if (oldDetails) {
        await this.replaceUserRow(userId, nextDetails.movieId, 'details', {
          ...oldDetails,
          ...nextDetails,
          version: oldDetails.version
        })
      } else {
        await this.insertUserRow(userId, nextDetails.movieId, 'details', nextDetails)
      }
    }
  }

  /**
   * Inserts a new row.
   * @param {string} userId
   * @param {number} movieId
   * @param {string} tableName
   * @param {object} data
   * @returns {Promise<number>}
   * @private
   */
  async insertUserRow (userId, movieId, tableName, data) {
    const updatedAt = new Date().toISOString()
    const { lastID, changes } = await this.runAsync(`
        INSERT INTO ${tableName}(userId, movieId, version, data)
        VALUES ($userId, $movieId, 1, $data)
    `, {
      $userId: userId,
      $movieId: movieId,
      $data: JSON.stringify({
        ...data,
        version: 1,
        updatedAt,
        movieId
      })
    })

    if (!changes) {
      throw Error('An unknown inserting error')
    }

    return lastID
  }

  /**
   * Replaces a row in the table name.
   * @param {string} userId
   * @param {number} movieId
   * @param {string} tableName
   * @param {object} data
   * @private
   */
  async replaceUserRow (userId, movieId, tableName, data) {
    const oldVersion = data.version
    const updatedAt = new Date().toISOString()
    const { lastID, changes } = await this.runAsync(
      `UPDATE ${tableName}
       SET version = version + 1,
           data    = :data
       WHERE userId = :userId
         AND movieId = :movieId
         AND version = :oldVersion
      `, {
        ':userId': userId,
        ':movieId': movieId,
        ':oldVersion': oldVersion,
        ':data': JSON.stringify({
          ...data,
          version: oldVersion + 1,
          updatedAt
        })
      })

    if (!changes) {
      throw Error('An unknown updating error')
    }

    return lastID
  }

  /**
   * Finds push subscription by endpoint.
   * @param {string} endpoint
   * @returns {Promise<PushSubscriptionJSON|null>}
   */
  async findPushSubscription (endpoint) {
    const subscriptionRow = await this.getAsync(`
      SELECT *
      FROM pushes
      WHERE endpoint = $endpoint
    `, { $endpoint: endpoint })
    if (!subscriptionRow) {
      return null
    }
    return JSON.parse(subscriptionRow.data)
  }

  /**
   * Saves push subscription.
   * @param {PushSubscriptionJSON} subscription
   * @returns {Promise<number|null>}
   */
  async savePush (subscription) {
    const updatedAt = new Date().toISOString()
    const { lastID, changes } = await this.runAsync(`
      INSERT INTO pushes(endpoint, version, createdAt, data)
      VALUES ($endpoint, 1, $updatedAt, $data) 
      ON CONFLICT(endpoint) DO UPDATE
        SET version = version + 1, updatedAt = $updatedAt, data = $data
    `, {
      $endpoint: subscription.endpoint,
      $updatedAt: updatedAt,
      $data: JSON.stringify({
        ...subscription,
      })
    })

    if (!changes) {
      throw Error('An unknown inserting error')
    }

    return lastID
  }

  /**
   * Removes push subscription.
   * @param {string} endpoint
   * @returns {Promise<number|null>}
   */
  async removePush (endpoint) {
    const { lastID, changes } = await this.runAsync(`
      DELETE
      FROM pushes
      WHERE endpoint = $endpoint
    `, {
      $endpoint: endpoint
    })

    if (!changes) {
      throw Error('An unknown deleting error.')
    }

    return lastID
  }
}

export default SyncBackendService
