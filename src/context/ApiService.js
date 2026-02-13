const imageEndpoint = process.env.NEXT_PUBLIC_MOVIE_APP_IMG_HOST || 'https://img.annualmovies.com'

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
    const response = await this.apiFetch('/api/sync/movies', {
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
   * @param {TDetailsItem[]} notSyncedDetails
   * @param {string|null} pushEndpoint
   * @param {string} lastUpdatedAt
   * @returns {Promise<?TProfileResponse>}
   */
  async loadProfile (notSyncedDetails, pushEndpoint, lastUpdatedAt = '') {
    try {
      const response = await this.apiFetch('/api/sync/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          details: notSyncedDetails,
          pushEndpoint,
          lastUpdatedAt
        })
      })
      return await response.json()
    } catch (e) {
      if (e.code === 401) {
        return null
      }
      throw e
    }
  }

  /**
   * Posts new push subscription.
   * @param {PushSubscriptionJSON} subscription
   * @returns {Promise<void>}
   */
  async pushSubscribe (subscription) {
    const response = await this.apiFetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }
  }

  /**
   * Unsubscribes from push notifications by endpoint.
   * @param {string} endpoint
   * @returns {Promise<void>}
   */
  async pushUnsubscribe (endpoint) {
    const response = await this.apiFetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(endpoint)
    })

    if (!response.ok) {
      throw new Error(response.statusText)
    }
  }

  /**
   * Generates preview url by hash.
   * @param {string} hash
   * @returns {string} url
   */
  static generatePreviewUrl (hash) {
    if (!hash) {
      return '/no_poster_270_400.png'
    }

    const imgHosts = imageEndpoint.split(';')
    const imgHost = imgHosts[hash.charCodeAt(0) % imgHosts.length]
    return `${imgHost}/270_400/${hash.charAt(0)}/${hash}_270_400.jpeg`
  }

  /**
   * Generates poster url by hash.
   * @param {string} hash
   * @returns {string} url
   */
  static generatePosterUrl (hash) {
    const imgHosts = imageEndpoint.split(';')
    const imgHost = imgHosts[hash.charCodeAt(0) % imgHosts.length]
    return `${imgHost}/800_1185/${hash.charAt(0)}/${hash}_800_1185.jpeg`
  }
}

/**
 * @typedef TMovieResponse
 * @property {TMovieItem[]} movies
 * @property {TVotesItem[]} votes
 * @property {TImagesItem[]} images
 * @property {TMetadataItem[]} metadata
 * @property {string} lastUpdatedAt
 */

/**
 * @typedef TProfileResponse
 * @property {TProfileInfo} info
 */

/**
 * @typedef TProfileInfo
 * @property {string} id
 * @property {boolean} isAdmin
 * @property {TProfileInfoUser} user
 */

/**
 * @typedef TProfileInfoUser
 * @property {string} email
 * @property {string} name
 * @property {string} picture
 */

export default ApiService
