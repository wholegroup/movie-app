import { useContext } from 'react'
import { useRouter } from 'next/router.js'
import { observer } from 'mobx-react-lite'
import globalContext from '../../context/globalContext.js'
import { movieDetailsStatusEnum } from '../../context/CommonStore.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
  const router = useRouter()
  const { commonStore, notificationStore } = useContext(globalContext)
  if (!commonStore.isFiltersPanelOpen) {
    return null
  }

  /**
   * Status handler
   * @param {string} status
   */
  const clickStatus = (status) => {
    commonStore.updateFilters({
      ...commonStore.filters,
      status
    }).catch(e => notificationStore.error({ message: e.message }))
    commonStore.setIsFiltersPanelOpen(false)

    // scroll to top
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
  }

  /**
   * Year handler
   * @param {number} year
   */
  const clickYear = (year) => {
    commonStore.updateFilters({
      ...commonStore.filters,
      years: commonStore.filters.years.includes(year)
        ? commonStore.filters.years.filter(n => n !== year)
        : [year]
    }).catch(e => notificationStore.error({ message: e.message }))
    commonStore.setIsFiltersPanelOpen(false)

    // scroll to top
    router.replace(router.asPath)
      .catch(e => notificationStore.error({ message: e.message }))
  }

  /**
   * Genre handler
   * @param {string} genre
   */
  const clickGenre = (genre) => {
    commonStore.updateFilters({
      ...commonStore.filters,
      genres: commonStore.filters.genres.includes(genre)
        ? commonStore.filters.genres.filter(n => n !== genre)
        : [genre]
    }).catch(e => notificationStore.error({ message: e.message }))
    commonStore.setIsFiltersPanelOpen(false)

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
              {commonStore.filters.status === status
                ? <b>{movieDetailsStatusEnum[status]}</b>
                : movieDetailsStatusEnum[status]}
            </div>
          ))}
        </div>
        <div>
          <div>Years</div>
          {commonStore.years.map(year => (
            <div key={year} onClick={() => clickYear(year)}>
              {commonStore.filters.years.length === 0 || commonStore.filters.years.includes(year)
                ? <b>{year}</b>
                : year}
            </div>
          ))}
        </div>
        <div>
          <div>Genres</div>
          {commonStore.genres.slice(0, 5).map(genre => (
            <div key={genre} onClick={() => clickGenre(genre)}>
              {commonStore.filters.genres.length === 0 || commonStore.filters.genres.includes(genre)
                ? <b>{genre}</b>
                : genre}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={() => {
          commonStore.resetFilters()
            .catch(e => notificationStore.error({ message: e.message }))
          commonStore.setIsFiltersPanelOpen(false)
        }}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default observer(FiltersPanel)
