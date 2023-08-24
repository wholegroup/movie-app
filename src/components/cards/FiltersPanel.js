import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'
import { movieDetailsStatusEnum } from './CardListStore.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
  const { cardListStore, notificationStore } = useContext(cardListContext)
  if (!cardListStore.isFiltersPanelOpen) {
    return null
  }

  /**
   * Status handler
   * @param {string} status
   */
  const clickStatus = (status) => {
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
   * @param {number} year
   */
  const clickYear = (year) => {
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
   * @param {string} genre
   */
  const clickGenre = (genre) => {
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

  const clickReset = (ev) => {
    cardListStore.resetFilters()
      .catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    window.scroll({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        <div>
          <div>Status</div>
          {Object.keys(movieDetailsStatusEnum).map(status => (
            <div key={status}>
              <a href='javascript:' onClick={() => clickStatus(status)}>
                {cardListStore.filters.status === status
                  ? <b>{movieDetailsStatusEnum[status]}</b>
                  : movieDetailsStatusEnum[status]}
              </a>
            </div>
          ))}
        </div>
        <div>
          <div>Years</div>
          {cardListStore.years.map(year => (
            <div key={year}>
              <a href='javascript:' onClick={() => clickYear(year)}>
                {cardListStore.filters.years.length === 0 || cardListStore.filters.years.includes(year)
                  ? <b>{year}</b>
                  : year}
              </a>
            </div>
          ))}
        </div>
        <div>
          <div>Genres</div>
          {cardListStore.genres.slice(0, 5).map(genre => (
            <div key={genre}>
              <a href='javascript:' onClick={() => clickGenre(genre)}>
                {cardListStore.filters.genres.length === 0 || cardListStore.filters.genres.includes(genre)
                  ? <b>{genre}</b>
                  : genre}
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        {cardListStore.isFiltersModified ? <a href='javascript:' onClick={() => clickReset()}>Reset filters</a> : ''}
        {!cardListStore.isFiltersModified ? <>&nbsp;</> : ''}
      </div>
    </div>
  )
}

export default observer(FiltersPanel)
