import { observer } from 'mobx-react-lite'
import MovieCard from './MovieCard.js'
import { useContext } from 'react'
import globalContext from '../globalContext.js'
import styles from './MovieIndex.module.css'

function MovieIndex () {
  const { commonStore } = useContext(globalContext)
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        ··· Annual Movies ···
      </h1>
      <div className={styles.grid}>
        {commonStore.sortedCards.map(movieCard => <MovieCard key={movieCard.movieId} card={movieCard} />)}
      </div>
    </main>
  )
}

export default observer(MovieIndex)
