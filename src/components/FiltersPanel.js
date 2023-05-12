import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'
import { movieDetailsStatusEnum } from '../context/CommonStore.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
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
        : [...commonStore.filters.years, year]
    }).catch(e => notificationStore.error({ message: e.message }))
    commonStore.setIsFiltersPanelOpen(false)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        <div>
          <div>Status</div>
          {Object.keys(movieDetailsStatusEnum).map(status => (
            <div key={status} onClick={() => clickStatus(status)}>
              {commonStore.filters.status === status ?
                <b>{movieDetailsStatusEnum[status]}</b> : movieDetailsStatusEnum[status]}
            </div>
          ))}
        </div>
        <div>
          <div>Years</div>
          {commonStore.years.map(year => (
            <div key={year} onClick={() => clickYear(year)}>
              {commonStore.filters.years.length === 0 || commonStore.filters.years.includes(year) ?
                <b>{year}</b> : year}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={() => {
          commonStore.resetFilters()
          commonStore.setIsFiltersPanelOpen(false)
        }}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default observer(FiltersPanel)
