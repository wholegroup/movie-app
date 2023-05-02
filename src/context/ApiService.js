class ApiService {
  /**
   * Makes api fetch.
   * @param resource
   * @param options
   * @returns {Promise<Response>}
   */
  async apiFetch (resource, options = {}) {
    const apiHost = ''
    const authToken = ''

    // set default timeout
    let abortSignal
    if (options.signal) {
      abortSignal = options.signal
    } else {
      const controller = new window.AbortController()
      abortSignal = controller.signal
      setTimeout(() => controller.abort(), 5 * 1000) // 5 seconds by default
    }

    // make fetch
    const response = await window.fetch(`${apiHost}${resource}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      signal: abortSignal
    })

    // throw exception in case of an error
    if (!response.ok) {
      let errorMessage
      try {
        const errorObject = await response.json()
        errorMessage = errorObject.exceptionMessage || errorObject.description || errorObject.message
      } catch {
        errorMessage = response.statusText
      }
      const e = new Error(`[${response.status}] ${errorMessage}`)
      e.code = response.status
      throw e
    }

    return response
  }

  /**
   * Loads movies.
   * @param {string} lastUpdatedAt
   * @returns {Promise<TMovieResponse>}
   */
  async loadMovies (lastUpdatedAt = '') {
    const response = await this.apiFetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lastUpdatedAt
      })
    })

    return await response.json()
  }

  /**
   * Loads user profile.
   * @returns {Promise<?TProfileResponse>}
   */
  async loadProfile () {
    try {
      const response = await this.apiFetch('/api/profile')
      return await response.json()
    } catch (e) {
      if (e.code === 401) {
        return null
      }
      throw e
    }
  }

  /**
   * Generates preview url by hash.
   * @param {string} hash
   * @returns {string} url
   */
  static generatePreviewUrl (hash) {
    const imgHosts = (process.env.NEXT_PUBLIC_MOVIE_APP_IMG_HOST || '/').split(';')
    const imgHost = imgHosts[hash.charCodeAt(0) % imgHosts.length]
    return `${imgHost}/270_400/${hash.charAt(0)}/${hash}_270_400.jpeg`
  }

  /**
   * Generates poster url by hash.
   * @param {string} hash
   * @returns {string} url
   */
  static generatePosterUrl (hash) {
    const imgHosts = (process.env.NEXT_PUBLIC_MOVIE_APP_IMG_HOST || '/').split(';')
    const imgHost = imgHosts[hash.charCodeAt(0) % imgHosts.length]
    return `${imgHost}/800_1185/${hash.charAt(0)}/${hash}_800_1185.jpeg`
  }
}

/**
 * @typedef TMovieResponse
 * @property {TMovieItem[]} movies
 * @property {TVotesItem[]} votes
 * @property {TImagesItem[]} images
 * @property {string} lastUpdatedAt
 */

/**
 * @typedef TProfileResponse
 * @property {string} id
 * @property {boolean} isAdmin
 * @property {string} user.email
 * @property {string} user.name
 * @property {string} user.picture
 */

export default ApiService
