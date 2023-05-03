import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import globalContext from '../context/globalContext.js'

function MovieCounter () {
  const { commonStore } = useContext(globalContext)
  return (
    <>
      {commonStore.filteredCards.length}
      {' / '}
      {commonStore.cards.length}
    </>
  )
}

export default observer(MovieCounter)
