import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'

function MovieCounter () {
  const { cardListStore } = useContext(cardListContext)
  return (
    <>
      <span data-clear={0}>{cardListStore.filteredCards.length}</span>
      <span style={{ fontSize: '0.6rem' }}>
      {' / '}
        <span data-clear={0}>{cardListStore.cards.length}</span>
      </span>
    </>
  )
}

export default observer(MovieCounter)
