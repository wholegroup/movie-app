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
        errorMessage = errorObject.exceptionMessage || errorObject.message
      } catch {
        errorMessage = response.statusText
      }
      throw new Error(`[${response.status}] ${errorMessage}`)
    }

    return response
  }

  /**
   * Loads movies.
   * @param {number} lastUpdatedAt
   * @returns {Promise<TMovieResponse>}
   */
  async loadMovies (lastUpdatedAt = 0) {
    const response = await this.apiFetch('/api/sync', {
      method: 'POST'
    })

    return await response.json()
  }
}

/**
 * @typedef TMovieResponse
 * @property {Object} movies
 * @property {Object} votes
 * @property {Object} images
 * @property {number} lastUpdatedAt
 */

export default ApiService
