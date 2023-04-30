import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head.js'
import globalContext from '../context/globalContext.js'
import styles from './MovieItem.module.css'

function MovieItem () {
  const { commonStore } = useContext(globalContext)
  const movie = commonStore?.movie

  if (!movie) {
    return null
  }

  return (
    <>
      <Head>
        <title>{`${movie.title}, ${movie.year}`}</title>
        <meta name='description' content={`${movie.title}, ${movie.year}`} />
      </Head>
      <div className={styles.container}>
        <div>
          <h1>{movie.title}</h1>
        </div>
        <div>
          {movie.year}{', '}
          {movie.runtime}
          {movie.genres?.length > 0 && (
            <>
              {', '}
              {movie.genres.map(genre => <span key={genre}><i>{genre}</i></span>)
                .reduce((acc, item) => acc ? [...acc, ', ', item] : [item], null)}
            </>
          )}
        </div>
        {movie.directors?.length > 0 && (
          <div>
            <span>Directors:</span>{' '}
            {movie.directors.map(({ personId, fullName }) => <span key={personId}>{fullName}</span>)
              .reduce((acc, item) => acc ? [...acc, ', ', item] : [item], null)}
          </div>
        )}
        {movie.stars?.length > 0 && (
          <div>
            <span>Stars:</span>{' '}
            {movie.stars.map(({ personId, fullName }) => <span key={personId}>{fullName}</span>)
              .reduce((acc, item) => acc ? [...acc, ', ', item] : [item], null)}
          </div>
        )}
        <div>{movie.description}</div>
      </div>
    </>
  )
}

export default observer(MovieItem)
