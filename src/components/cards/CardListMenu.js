import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { Icon } from '@mdi/react'
import { mdiFilterMultiple } from '@mdi/js'
import cardListContext from './cardListContext.js'
import MovieCounter from './MovieCounter.js'
import styles from './CardListMenu.module.css'

/**
 * Toolbar menu in the center.
 */
function CardListMenu () {
  const { cardListStore } = useContext(cardListContext)

  const togglePanel = (evt) => {
    evt.stopPropagation()
    cardListStore.setIsFiltersPanelOpen(!cardListStore.isFiltersPanelOpen)
  }

  return (
    <>
      <noscript>begin:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>
      {cardListStore.cards.length > 0 && (
        <>
          <div>
            <MovieCounter />
          </div>
          <div>
            <button onClick={togglePanel} className={styles.buttonLink}>
              <Icon
                id={'filters'}
                path={mdiFilterMultiple}
                size={1.5}
                title={'Filters'}
                className={cardListStore.isFiltersModified ? styles.modified : ''}
              />
            </button>
          </div>
          <div className={styles.hide640}>
            <button onClick={togglePanel} className={styles.buttonLink}>
              Filters
            </button>
          </div>
          <div>&nbsp;&nbsp;&nbsp;</div>
        </>
      )}
      <noscript>end:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>
    </>
  )
}

export default observer(CardListMenu)
