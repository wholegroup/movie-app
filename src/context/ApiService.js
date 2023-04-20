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
}

/**
 * @typedef TMovieResponse
 * @property {TMovieItem[]} movies
 * @property {TVotesItem[]} votes
 * @property {TImagesItem[]} images
 * @property {string} lastUpdatedAt
 */

export default ApiService
