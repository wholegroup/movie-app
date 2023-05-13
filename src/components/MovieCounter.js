import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'

function MovieCounter () {
  const { commonStore } = useContext(globalContext)
  return (
    <>
      {commonStore.filteredCards.length}
      <span style={{ fontSize: '0.6rem' }}>
      {' / '}
        {commonStore.cards.length}
      </span>
    </>
  )
}

export default observer(MovieCounter)
