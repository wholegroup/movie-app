import { makeObservable, observable, action } from 'mobx'

class CommonStore {
  /** @type {StorageService} */
  storageService

  /** @type {boolean} isInitialized flag */
  isInitialized = false

  /** @type {Object|null} User Info */
  userInfo = null

  /** @type {?TMovieItem} */
  movie = null

  /** @type {?TVotesItem} */
  votes = null

  /** @type {?TImagesItem} */
  images = null

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      isInitialized: observable,
      setIsInitialized: action,
      userInfo: observable,
      movie: observable,
      setMovie: action,
      votes: observable,
      setVotes: action,
      images: observable,
      setImages: action
    })
  }

  /**
   * Sets isInitialized flag.
   */
  setIsInitialized () {
    this.isInitialized = true
  }

  /**
   * Makes ready.
   * @param additional
   * @returns {CommonStore}
   */
  makeReady (additional) {
    this.makeReadyAsync(additional)
      .then(() => {
        this.setIsInitialized()
      })
    return this
  }

  /**
   * Async makeReady
   * @param additional
   * @returns {Promise<void>}
   */
  async makeReadyAsync (additional) {
    await additional()
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
   * Loads movie by slug.
   * @param {string} slug
   */
  async loadMovieBySlug (slug) {
    const movie = await this.storageService.findMovieBySlug(slug)
    if (!movie) {
      throw new Error(`Movie by slug ${slug} not found.`)
    }
    const votes = await this.storageService.findVotesByMovieId(movie.movieId)
    const images = await this.storageService.findImagesByMovieId(movie.movieId)

    this.setMovie(movie)
    this.setVotes(votes)
    this.setImages(images)
  }
}

export default CommonStore
