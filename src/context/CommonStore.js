import { makeObservable, observable, action, computed } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'

class CommonStore {
  /** @type {StorageService} */
  storageService

  /** @type {ApiService} */
  apiService

  /** @type {Promise<void>} */
  makeReadyIsCompleted = null

  /** @type {boolean} isInitialized flag */
  isInitialized = false

  /** @type {?TMovieItem} */
  movie = null

  /** @type {?TVotesItem} */
  votes = null

  /** @type {?TImagesItem} */
  images = null

  /** @type {?TMetadataItem} */
  metadata = null

  /** @type {TMovieCard[]} */
  cards = []

  /** @type {?TUserProfile} */
  profile = null

  /**
   * Default constructor.
   * @param {StorageService} storageService
   * @param {ApiService} apiService
   */
  constructor (storageService, apiService) {
    this.storageService = storageService
    this.apiService = apiService
    makeObservable(this, {
      isInitialized: observable,
      setIsInitialized: action,
      movie: observable.ref,
      setMovie: action,
      votes: observable.ref,
      setVotes: action,
      images: observable.ref,
      setImages: action,
      metadata: observable.ref,
      setMetadata: action,
      cards: observable.ref,
      setCards: action,
      filteredCards: computed,
      sortedCards: computed,
      profile: observable,
      setProfile: action
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
    if (this.isInitialized) {
      console.log('Already initialized')
      return this
    }

    this.makeReadyIsCompleted = new Promise(resolve => {
      this.makeReadyAsync(additional)
        .then(() => {
          this.setIsInitialized()
        })
        .finally(() => {
          resolve()
        })
    })

    return this
  }

  /**
   * Async makeReady
   * @param {() => Promise<void>} additional
   * @returns {Promise<void>}
   */
  async makeReadyAsync (additional) {
    await additional()
  }

  /**
   * Disposes store
   * @param {() => Promise<void>} additional
   * @returns {Promise<void>}
   */
  async disposeAsync (additional) {
    if (!this.makeReadyIsCompleted) {
      throw new Error('makeReady was not run')
    }

    // wait till makeReady is completed
    const timeoutPromise = new Promise((resolve, reject) => setTimeout(reject, 5000))
    await Promise.race([this.makeReadyIsCompleted, timeoutPromise])

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
   * Sets movie metadata.
   * @param {?TMetadataItem} metadata
   */
  setMetadata (metadata) {
    this.metadata = metadata
  }

  /**
   * Sets cards.
   * @param {TMovieCard[]} cards
   */
  setCards (cards) {
    this.cards = cards
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
    const metadata = await this.storageService.findMetadataByMovieId(movie.movieId)

    this.setMovie(movie)
    this.setVotes(votes)
    this.setImages(images)
    this.setMetadata(metadata)
  }

  /**
   * Loads movie cards.
   * @returns {Promise<void>}
   */
  async loadCards () {
    const tm = 'loading cards #' + Math.round(window.performance.now())
    try {
      console.time(tm)
      const allCards = await this.storageService.loadAllCards()
      this.setCards(allCards)
    } finally {
      console.timeEnd(tm)
    }
  }

  /**
   * Returns filtered cards.
   * @returns {TMovieCard[]}
   */
  get filteredCards () {
    return [...this.cards]
  }

  /**
   * Returns filtered and then sorted cards.
   * @returns {TMovieCard[]}
   */
  get sortedCards () {
    return [...this.filteredCards].sort(
      ({ year: a, title: x }, { year: b, title: y }) => (b - a) || x.localeCompare(y)
    )
  }

  /**
   * Sets user profile.
   * @param {?TUserProfile} profile
   */
  setProfile (profile) {
    this.profile = profile
  }

  /**
   * Updates user profile.
   */
  async updateProfile () {
    this.setProfile(await this.storageService.getSettings(SETTINGS_NAMES.USER_PROFILE) || null)
  }
}

export default CommonStore
