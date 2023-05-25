import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head.js'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'
import { mdiThumbDown, mdiThumbUp } from '@mdi/js'
import movieContext from './movieContext.js'
import ApiService from '../../context/ApiService.js'
import styles from './MovieItem.module.css'
import { Icon } from '@mdi/react'

function MovieItem () {
  const { movieStore, notificationStore } = useContext(movieContext)
  if (!movieStore?.movie) {
    return null
  }

  const { movie, images, metadata, details } = movieStore

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

  /**
   * Thumb handler.
   * @param {number} mark
   * @returns {Promise<void>}
   */
  const clickThumb = async (mark) => {
    try {
      if (details?.mark !== mark) {
        await movieStore.markAsSeen(movie.movieId, mark)
      } else {
        await movieStore.markAsUnseen(movie.movieId)
      }
    } catch (e) {
      notificationStore.error({ message: e.message })
    }
  }

  return (
    <>
      <Head>
        <title>{`${movie.title}, ${movie.year}`}</title>
        <meta name='description' content={`${movie.title}, ${movie.year}`} />
      </Head>
      <div className={styles.container}>
        <div>
          <div onClick={() => openPhoto()}>
            <img
              src={ApiService.generatePreviewUrl(images?.images[0]?.hash || '')}
              title={movie.title}
              alt={movie.title}
              loading='lazy'
            />
          </div>
          <div className={styles.thumbs}>
            <button type='button' onClick={() => clickThumb(5)}>
              <Icon path={mdiThumbUp} size={1.5} className={details?.mark === 5 ? styles.positive : ''} />
            </button>
            <button type='button' onClick={() => clickThumb(1)}>
              <Icon path={mdiThumbDown} size={1.5} className={details?.mark === 1 ? styles.negative : ''} />
            </button>
          </div>
        </div>
        <div className={styles.info}>
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
      </div>
      {metadata && (
        <div style={{ margin: '2rem auto', width: 'fit-content' }}>
          <pre>{JSON.stringify(metadata, null, 4)}</pre>
        </div>
      )}
    </>
  )
}

export default observer(MovieItem)
