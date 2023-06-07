import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import cardListContext from './cardListContext.js'

function MovieCounter () {
  const { cardListStore } = useContext(cardListContext)
  return (
    <>
      {cardListStore.filteredCards.length}
      <span style={{ fontSize: '0.6rem' }}>
      {' / '}
        {cardListStore.cards.length}
      </span>
    </>
  )
}

export default observer(MovieCounter)
