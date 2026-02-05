import { action, makeObservable, observable } from 'mobx'

class MovieStore {
  /** @type {StorageService} */
  storageService

  /** @type {?TMovieItem} */
  movie = null

  /** @type {?TVotesItem} */
  votes = null

  /** @type {?TImagesItem} */
  images = null

  /** @type {?TMetadataItem} */
  metadata = null

  /** @type {?TDetailsItem} */
  details = null

  /** @type {number} TS/trigger to refresh data after some changes. */
  refreshTs = 0

  /** @type {boolean} Indicates whether the data was populated on the server (backend). */
  byBackend = false

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      movie: observable.ref,
      setMovie: action,
      votes: observable.ref,
      setVotes: action,
      images: observable.ref,
      setImages: action,
      metadata: observable.ref,
      setMetadata: action,
      details: observable.ref,
      setDetails: action,
      refreshTs: observable,
      setRefreshTs: action
    })
  }

  /**
   * Sets movie.
   * @param {?TMovieItem} movie
   */
  setMovie (movie) {
    this.movie = movie
  }

  /**
   * Sets movie votes.
   * @param {?TVotesItem} votes
   */
  setVotes (votes) {
    this.votes = votes
  }

  /**
   * Sets movie images.
   * @param {?TImagesItem} images
   */
  setImages (images) {
    this.images = images
  }

  /**
   * Sets movie metadata.
   * @param {?TMetadataItem} metadata
   */
  setMetadata (metadata) {
    this.metadata = metadata
  }

  /**
   * Sets details.
   * @param {?TDetailsItem} details
   * @returns {void}
   */
  setDetails (details) {
    this.details = details
  }

  /**
   * Find movie by slug.
   * @param {string} slug
   * @returns {Promise<TMovieItem>}
   */
  async findMovieBySlug (slug) {
    return await this.storageService.findMovieBySlug(slug)
  }

  /**
   * Loads movie by slug.
   * @param {string} slug
   */
  async loadMovieBySlug (slug) {
    const tm = 'loading movie #' + Math.round(window.performance.now() * 10) + ' ' + slug
    try {
      console.time(tm)

      const movie = await this.storageService.findMovieBySlug(slug)
      if (!movie) {
        throw new Error(`Movie by slug ${slug} not found.`)
      }
      const votes = await this.storageService.findVotesByMovieId(movie.movieId)
      const images = await this.storageService.findImagesByMovieId(movie.movieId)
      const metadata = await this.storageService.findMetadataByMovieId(movie.movieId)
      const details = await this.storageService.findDetailsByMovieId(movie.movieId)

      this.setMovie(movie)
      this.setVotes(votes)
      this.setImages(images)
      this.setMetadata(metadata)
      this.setDetails(details)
    } finally {
      console.timeEnd(tm)
    }
  }

  /**
   * Marks movie as seen,
   * @param {number} movieId
   * @param {number} mark
   * @returns {Promise<void>}
   */
  async markAsSeen (movieId, mark) {
    await this.storageService.setMovieMark(movieId, mark)
    this.setRefreshTs(Date.now())
  }

  /**
   * Marks movie as unseen,
   * @param {number} movieId
   * @returns {Promise<void>}
   */
  async markAsUnseen (movieId) {
    await this.storageService.setMovieMark(movieId, null)
    this.setRefreshTs(Date.now())
  }

  /**
   * Sets RefreshTs
   * @param {number} refreshTs
   */
  setRefreshTs (refreshTs) {
    this.refreshTs = refreshTs
  }
}

export default MovieStore
