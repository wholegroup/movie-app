import { makeObservable, observable, action, computed } from 'mobx'
import { SETTINGS_NAMES } from '../../context/StorageService.js'

export const movieDetailsStatusEnum = Object.freeze({
  ALL: 'All',
  TO_WATCH: 'To watch',
  WITH_MARKS: 'With marks'
})

/** @type {TFilters} */
const defaultFilters = {
  status: Object.keys(movieDetailsStatusEnum)
    .find(key => movieDetailsStatusEnum[key] === movieDetailsStatusEnum.TO_WATCH),
  years: [],
  genres: []
}

class CardListStore {
  /** @type {StorageService} */
  storageService

  /** @type {TMovieCard[]} */
  cards = []

  /** @type {TDetailsItem[]} */
  allDetails = []

  /** @type {TFilters} */
  filters = defaultFilters

  /** @type {boolean} */
  isFiltersPanelOpen = false

  /**
   * Default constructor.
   * @param {StorageService} storageService
   */
  constructor (storageService) {
    this.storageService = storageService
    makeObservable(this, {
      allDetails: observable.ref,
      setAllDetails: action,
      allDetailsKey: computed,
      cards: observable.ref,
      setCards: action,
      filteredCards: computed,
      sortedCards: computed,
      filters: observable.ref,
      setFilters: action,
      isFiltersPanelOpen: observable,
      setIsFiltersPanelOpen: action,
      isFiltersModified: computed,
      years: computed,
      genresCounter: computed,
      genres: computed
    })
  }

  /**
   * Updates filters from storage.
   * @returns {Promise<void>}
   */
  async updateFilters () {
    this.setFilters({
      ...defaultFilters,
      ...(await this.storageService.getSettings(SETTINGS_NAMES.USER_FILTERS) || {})
    })
  }

  /**
   * Sets details.
   * @param {TDetailsItem[]} allDetails
   */
  setAllDetails (allDetails) {
    this.allDetails = allDetails
  }

  /**
   * Sets cards.
   * @param {TMovieCard[]} cards
   */
  setCards (cards) {
    this.cards = cards
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
   * Load all details.
   * @returns {Promise<void>}
   */
  async loadAllDetails () {
    const allDetails = await this.storageService.loadAllDetails()
    this.setAllDetails(allDetails)
  }

  /**
   * All details with keys.
   * @returns {TDetailsItem[]}
   */
  get allDetailsKey () {
    return [...this.allDetails]
      .reduce((acc, details) => ({
        ...acc,
        [details.movieId]: details
      }), {})
  }

  /**
   * Returns filtered cards.
   * @returns {TMovieCard[]}
   */
  get filteredCards () {
    return [...this.cards]
      .filter(({ year }) => this.filters.years.length === 0 || this.filters.years.includes(year))
      .filter(({ genres }) => this.filters.genres.length === 0 ||
        this.filters.genres.filter(g => genres.includes(g)).length > 0)
      .filter(({ movieId }) => {
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.ALL) {
          return true
        }
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.TO_WATCH) {
          return !this.allDetailsKey[movieId]?.mark
        }
        if (movieDetailsStatusEnum[this.filters.status] === movieDetailsStatusEnum.WITH_MARKS) {
          return this.allDetailsKey[movieId]?.mark > 0
        }
        return false
      })
  }

  /**
   * Returns filtered and then sorted cards.
   * @returns {TMovieCard[]}
   */
  get sortedCards () {
    return [...this.filteredCards]
      .sort((a, b) => (b.isNew - a.isNew) || (b.year - a.year) || a.title.localeCompare(b.title))
  }

  /**
   * Marks movie as seen,
   * @param {number} movieId
   * @param {number} mark
   * @returns {Promise<void>}
   */
  async markAsSeen (movieId, mark) {
    await this.storageService.setMovieMark(movieId, mark)
    this.setAllDetails(Object.values({
      ...this.allDetailsKey,
      [movieId]: {
        ...this.allDetailsKey[movieId],
        mark
      }
    }))
  }

  /**
   * Marks movie as unseen,
   * @param {number} movieId
   * @returns {Promise<void>}
   */
  async markAsUnseen (movieId) {
    await this.storageService.setMovieMark(movieId, null)
    this.setAllDetails(Object.values({
      ...this.allDetailsKey,
      [movieId]: {
        ...this.allDetailsKey[movieId],
        mark: null
      }
    }))
  }

  /**
   * Sets filter.
   * @param {object} filters
   */
  setFilters (filters) {
    this.filters = filters
  }

  /**
   * Changes filters.
   * @param {TFilters} filters
   * @returns {Promise<void>}
   */
  async changeFilters (filters) {
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
  async resetFilters () {
    return this.changeFilters(defaultFilters)
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
   * Counts genres.
   * @returns {object}
   */
  get genresCounter () {
    return this.cards
      .map(({ genres }) => genres)
      .flat()
      .filter(Boolean)
      .reduce((acc, genre) => ({
        ...acc,
        [genre]: (acc[genre] || 0) + 1
      }), {})
  }

  /**
   * Calculates genres sorted by counter.
   * @returns {string[]}
   */
  get genres () {
    return Object.keys(this.genresCounter)
      .sort((a, b) => (this.genresCounter[b] - this.genresCounter[a]) || a.localeCompare(b))
  }

  /**
   * Calculates if filters are modified.
   * @returns {boolean}
   */
  get isFiltersModified () {
    // check years intersection
    const defaultYears = defaultFilters.years.length > 0 ? defaultFilters.years : this.years
    const filtersYears = this.filters.years.length > 0 ? this.filters.years : this.years
    if (defaultYears.length !== filtersYears.length) {
      return true
    }

    if (defaultYears.filter(y => !filtersYears.includes(y)).length > 0) {
      return true
    }

    // check genres intersection
    const defaultGenres = defaultFilters.genres.length > 0 ? defaultFilters.genres : this.genres
    const filtersGenres = this.filters.genres.length > 0 ? this.filters.genres : this.genres
    if (defaultGenres.length !== filtersGenres.length) {
      return true
    }

    if (defaultGenres.filter(y => !filtersGenres.includes(y)).length > 0) {
      return true
    }

    // check status
    // noinspection RedundantIfStatementJS
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
 * @property {string[]=} genres
 */

export default CardListStore
