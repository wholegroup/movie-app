import { useContext } from 'react'
import { useRouter } from 'next/router.js'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'
import { movieDetailsStatusEnum } from './CardListStore.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
  const router = useRouter()
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
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
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
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
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
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
  }

  const clickReset = () => {
    cardListStore.resetFilters()
      .catch(e => notificationStore.error({ message: e.message }))
    cardListStore.setIsFiltersPanelOpen(false)

    // scroll to top
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        <div>
          <div>Status</div>
          {Object.keys(movieDetailsStatusEnum).map(status => (
            <div key={status} onClick={() => clickStatus(status)}>
              {cardListStore.filters.status === status
                ? <b>{movieDetailsStatusEnum[status]}</b>
                : movieDetailsStatusEnum[status]}
            </div>
          ))}
        </div>
        <div>
          <div>Years</div>
          {cardListStore.years.map(year => (
            <div key={year} onClick={() => clickYear(year)}>
              {cardListStore.filters.years.length === 0 || cardListStore.filters.years.includes(year)
                ? <b>{year}</b>
                : year}
            </div>
          ))}
        </div>
        <div>
          <div>Genres</div>
          {cardListStore.genres.slice(0, 5).map(genre => (
            <div key={genre} onClick={() => clickGenre(genre)}>
              {cardListStore.filters.genres.length === 0 || cardListStore.filters.genres.includes(genre)
                ? <b>{genre}</b>
                : genre}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={() => clickReset()}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default observer(FiltersPanel)
