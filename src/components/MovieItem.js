import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head.js'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'
import globalContext from '../context/globalContext.js'
import styles from './MovieItem.module.css'
import ApiService from '../context/ApiService.js'

function MovieItem () {
  const { commonStore } = useContext(globalContext)
  const movie = commonStore?.movie
  const images = commonStore?.images

  if (!movie) {
    return null
  }

  const openPhoto = () => {
    const pswp = new PhotoSwipe({
      dataSource: [{
        src: ApiService.generatePosterUrl(images.images[0].hash),
        width: 800,
        height: 1185,
        alt: movie.title
      }],
      index: 0,
      showHideAnimationType: 'none'
    })
    pswp.init()
  }

  return (
    <>
      <Head>
        <title>{`${movie.title}, ${movie.year}`}</title>
        <meta name='description' content={`${movie.title}, ${movie.year}`} />
      </Head>
      <div className={styles.container}>
        <div onClick={() => openPhoto()}>
          <img
            src={ApiService.generatePreviewUrl(images.images[0].hash)}
            title={movie.title}
            alt={movie.title}
            loading='lazy'
          />
        </div>
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
