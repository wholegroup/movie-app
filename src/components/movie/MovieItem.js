import { useContext } from 'react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/dist/photoswipe.css'
import { mdiThumbDown, mdiThumbUp, mdiMagnifyPlus } from '@mdi/js'
import { Icon } from '@mdi/react'
import movieContext from './movieContext.js'
import ApiService from '../../context/ApiService.js'
import styles from './MovieItem.module.css'

function MovieItem () {
  const { movieStore, commonStore, notificationStore, syncStore } = useContext(movieContext)
  if (!movieStore?.movie) {
    return null
  }

  const { movie, images, metadata, details, votes } = movieStore

  const openPhoto = () => {
    if (!images) {
      console.log('no images')
      return
    }
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
   * Marks
   */
  const markHandler = async (mark) => {
    try {
      if (details?.mark !== mark) {
        await movieStore.markAsSeen(movie.movieId, mark)
      } else {
        await movieStore.markAsUnseen(movie.movieId)
      }
      syncStore.scheduleSynchronizingProfile()
    } catch (e) {
      notificationStore.error({ message: e.message })
    }
  }

  /**
   * Thumb handler.
   */
  const clickThumb = (mark) => {
    if (!details?.mark) {
      markHandler(mark)
        .catch(console.error)
      return
    }

    // ask to confirm
    commonStore.openConfirmation(() => {
      markHandler(mark)
        .catch(console.error)
    })
  }

  const idJsonObject = {
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title,
      description: movie.description,
      image: ApiService.generatePosterUrl(images?.images[0]?.hash || ''),
      actor: movie.stars.map(({ fullName }) => ({
        '@type': 'Person',
        name: fullName
      })),
      director: movie.directors.map(({ fullName }) => ({
        '@type': 'Person',
        name: fullName
      }))
    })
  }

  return (
    <>
      <Head>
        <title>{`${movie.title} (${movie.year})`}</title>
        <meta name='description'
              content={`${movie.title} (${movie.year}). ${movie.runtime}. ${movie.genres.join(', ')}.`} />
        <meta name='keywords' content={`${movie.title}, ${movie.year}, ${movie.genres.join(', ')}`} />
        <meta property='og:title' content={movie.title} />
        <meta property='og:description' content={movie.description} />
        <meta property='og:image' content={ApiService.generatePosterUrl(images?.images[0]?.hash || '')} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={movie.title} />
        <meta name='twitter:description' content={movie.description} />
        <meta name='twitter:image' content={ApiService.generatePosterUrl(images?.images[0]?.hash || '')} />
        <script id='ld_json_data' type='application/ld+json' dangerouslySetInnerHTML={idJsonObject} />
      </Head>
      <div className={styles.container}>
        <div>
          <div onClick={() => openPhoto()} style={{ position: 'relative' }}>
            <img
              src={ApiService.generatePreviewUrl(images?.images[0]?.hash || '')}
              title={movie.title}
              alt={movie.title}
              width='270'
              height='400'
              crossOrigin='anonymous'
            />
            <div className={styles.zoom}><Icon path={mdiMagnifyPlus} /></div>
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
          <div className={styles.approved}>
            Approved at {new Date(votes.updatedAt).toLocaleDateString('en-CA')}
          </div>
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
