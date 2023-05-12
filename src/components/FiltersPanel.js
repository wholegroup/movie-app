import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'
import styles from './FiltersPanel.module.css'

/**
 * Filters Panel.
 */
function FiltersPanel () {
  const { commonStore } = useContext(globalContext)
  if (!commonStore.isFiltersPanelOpen) {
    return null
  }

  return (
    <div className={styles.panel}>
      <div className={styles.filters}>
        <div>
          <div>Status</div>
          <div>FILTERS PANEL</div>
        </div>
        <div>
          <div>Years</div>
          FILTERS PANEL
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
