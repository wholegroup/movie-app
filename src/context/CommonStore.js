import { makeObservable, observable, action, computed } from 'mobx'
import { SETTINGS_NAMES } from './StorageService.js'

export const movieDetailsStatusEnum = Object.freeze({
  ALL: 'All',
  TO_WATCH: 'To watch',
  WITH_MARKS: 'With marks'
})

/** @type {TFilters} */
const defaultFilters = {
  // status: movieDetailsStatusEnum.TO_WATCH,
  status: Object.keys(movieDetailsStatusEnum)
    .find(key => movieDetailsStatusEnum[key] === movieDetailsStatusEnum.TO_WATCH),
  years: []
}

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

  /** @type {?TDetailsItem} */
  details = null

  /** @type {TMovieCard[]} */
  cards = []

  /** @type {?TUserProfile} */
  profile = null

  /** @type {number} TS/trigger to refresh data after some changes. */
  refreshTs = 0

  /** @type {TFilters} */
  filters = defaultFilters

  /** @type {boolean} */
  isFiltersPanelOpen = false

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
      setProfile: action,
      details: observable.ref,
      setDetails: action,
      refreshTs: observable,
      setRefreshTs: action,
      filters: observable.ref,
      setFilters: action,
      isFiltersPanelOpen: observable,
      setIsFiltersPanelOpen: action,
      isFiltersModified: computed,
      years: computed
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
    await this.initializeStoreData()

    this.setIsInitialized()
  }

  /**
   * Initializes store data from storage.
   * @returns {Promise<void>}
   */
  async initializeStoreData () {
    this.setFilters(await this.storageService.getSettings(SETTINGS_NAMES.USER_FILTERS) || defaultFilters)
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
   * Loads movie cards.
   * @returns {Promise<void>}
   */
  async loadCards () {
    const tm = 'loading cards #' + Math.round(window.performance.now() * 10)
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
    return [...this.cards
      .filter(({ year }) => this.filters.years.length === 0 || this.filters.years.includes(year))
      .filter(({ mark }) => {
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.ALL) {
          return true
        }
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.TO_WATCH) {
          return !mark
        }
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.WITH_MARKS) {
          return mark > 0
        }
        return false
      })
    ]
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

  /**
   * Sets details.
   * @param {?TDetailsItem} details
   * @returns {void}
   */
  setDetails (details) {
    this.details = details
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

  /**
   * Sets filter.
   * @param {object} filters
   */
  setFilters (filters) {
    this.filters = filters
  }

  /**
   * Updates filters.
   * @param {TFilters} filters
   * @returns {Promise<void>}
   */
  async updateFilters (filters) {
    this.setFilters(filters)
    await this.storageService.setSettings(SETTINGS_NAMES.USER_FILTERS, { ...this.filters })
  }

  /**
   * Sets isFiltersPanelOpen
   * @param {boolean} isFiltersPanelOpen
   */
  setIsFiltersPanelOpen (isFiltersPanelOpen) {
    this.isFiltersPanelOpen = isFiltersPanelOpen
  }

  /**
   * Resets filters.
   */
  resetFilters () {
    this.filters = defaultFilters
  }

  /**
   * Calculates years.
   * @returns {number[]}
   */
  get years () {
    return [...new Set(this.cards
      .map(({ year }) => Number(year))
      .filter(Boolean)
      .sort()
      .reverse()
    )]
  }

  /**
   * Calculates if filters are modified.
   * @returns {boolean}
   */
  get isFiltersModified () {
    const defaultYears = defaultFilters.years.length > 0 ? defaultFilters.years : this.years
    const filtersYears = this.filters.years.length > 0 ? this.filters.years : this.years
    if (defaultYears.length !== filtersYears.length) {
      return true
    }

    // check intersection
    if (defaultYears.filter(y => !filtersYears.includes(y)).length > 0) {
      return true
    }

    if (defaultFilters.status !== this.filters.status) {
      return true
    }

    return false
  }
}

/**
 * @typedef TFilters
 * @property {string=} status
 * @property {number[]=} years
 */

export default CommonStore
