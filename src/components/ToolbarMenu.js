import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiFilterMultiple } from '@mdi/js'
import globalContext from '../context/globalContext.js'
import MovieCounter from './MovieCounter.js'
import styles from './ToolbarMenu.module.css'

/**
 * Toolbar menu in the center.
 */
function ToolbarMenu () {
  const { commonStore } = useContext(globalContext)

  const togglePanel = () => {
    commonStore.setIsFiltersPanelOpen(!commonStore.isFiltersPanelOpen)
  }

  return (
    <>
      <div>
        <button onClick={togglePanel} className={styles.buttonLink}>
          <Icon id={'go-home'} path={mdiFilterMultiple} size={1.5} title={'Filter'} />
        </button>
      </div>
      <div className={styles.hide640}>
        <button onClick={togglePanel} className={styles.buttonLink}>
          Filters
        </button>
      </div>
      <div>&nbsp;&nbsp;&nbsp;</div>
      <div>
        <MovieCounter />
      </div>
    </>
  )
}

export default observer(ToolbarMenu)
