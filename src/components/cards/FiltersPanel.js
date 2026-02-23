import { useContext, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'
import { movieDetailsStatusEnum } from './CardListStore.js'
import FiltersPanelBell from './FiltersPanelBell.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
  const { cardListStore, notificationStore } = useContext(cardListContext)
  const panelRef = useRef(null)

  /**
   * Closes panel by outside click/touch
   */
  useEffect(() => {
    const outsideListener = (evt) => {
      if (!panelRef.current?.contains(evt.target)) {
        cardListStore.setIsFiltersPanelOpen(false)
      }
    }

    document.addEventListener('click', outsideListener)
    document.addEventListener('touchstart', outsideListener)
    return () => {
      document.removeEventListener('click', outsideListener)
      document.removeEventListener('touchstart', outsideListener)
    }
  }, [cardListStore])

  /**
   * Status handler
   * @param ev
   * @param {string} status
   */
  const clickStatus = (ev, status) => {
    ev.preventDefault()
    cardListStore.changeFilters({
      ...cardListStore.filters,
      status
    }).catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  /**
   * Year handler
   * @param ev
   * @param {number} year
   */
  const clickYear = (ev, year) => {
    ev.preventDefault()
    cardListStore.changeFilters({
      ...cardListStore.filters,
      years: cardListStore.filters.years.includes(year)
        ? cardListStore.filters.years.filter(n => n !== year)
        : [year]
    }).catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  /**
   * Genre handler
   * @param ev
   * @param {string} genre
   */
  const clickGenre = (ev, genre) => {
    ev.preventDefault()
    cardListStore.changeFilters({
      ...cardListStore.filters,
      genres: cardListStore.filters.genres.includes(genre)
        ? cardListStore.filters.genres.filter(n => n !== genre)
        : [genre]
    }).catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  /**
   * Reset handler.
   * @param ev
   */
  const clickReset = (ev) => {
    ev.preventDefault()
    cardListStore.resetFilters()
      .catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  return (
    <div ref={panelRef} className={styles.panel}>
      <div className={styles.filters}>
        <div>
          <div className={styles.name}>Status:</div>
          {Object.keys(movieDetailsStatusEnum).map(status => (
            <div key={status}>
              <a href='#' onClick={(ev) => clickStatus(ev, status)}>
                {cardListStore.filters.status === status
                  ? <b>{movieDetailsStatusEnum[status]}</b>
                  : movieDetailsStatusEnum[status]}
              </a>
            </div>
          ))}
          <FiltersPanelBell />
        </div>
        <div>
          <div className={styles.name}>Years:</div>
          {cardListStore.years.map(year => (
            <div key={year}>
              <a href='#' onClick={(ev) => clickYear(ev, year)}>
                {cardListStore.filters.years.length === 0 || cardListStore.filters.years.includes(year)
                  ? <b>{year}</b>
                  : year}
              </a>
            </div>
          ))}
        </div>
        <div>
          <div className={styles.name}>Genres:</div>
          {cardListStore.genres.slice(0, 5).map(genre => (
            <div key={genre}>
              <a href='#' onClick={(ev) => clickGenre(ev, genre)}>
                {cardListStore.filters.genres.length === 0 || cardListStore.filters.genres.includes(genre)
                  ? <b>{genre}</b>
                  : genre}
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        {cardListStore.isFiltersModified ? <a href='#' onClick={(ev) => clickReset(ev)}>reset filters</a> : ''}
        {!cardListStore.isFiltersModified ? <>&nbsp;</> : ''}
      </div>
    </div>
  )
}

export default observer(FiltersPanel)
