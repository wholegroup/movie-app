import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'
import FiltersPanel from './FiltersPanel.js'

/**
 * Filters Panel.
 */
function Filters () {
  const { cardListStore } = useContext(cardListContext)
  if (!cardListStore.isFiltersPanelOpen) {
    return null
  }

  return <FiltersPanel />
}

export default observer(Filters)
