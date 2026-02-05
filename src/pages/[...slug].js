import SyncBackendService from '../../lib/SyncBackendService.js'
import Toolbar from '../components/app/Toolbar.js'
import MovieItem from '../components/movie/MovieItem.js'
import MovieLoader from '../components/movie/MovieLoader.js'
import MovieContextProvider from '../components/movie/MovieContextProvider.js'

// noinspection JSUnusedGlobalSymbols
/**
 * Movie page
 */
export default function MoviePage ({ ...pageProps }) {
  return (
    <MovieContextProvider {...pageProps}>
      <Toolbar />
      <MovieLoader />
      <MovieItem />
    </MovieContextProvider>
  )
}

// noinspection JSUnusedGlobalSymbols
/**
 * @param {ParsedUrlQuery} [query]
 * @param {ServerResponse} [res]
 * @returns {Promise<object>}
 */
export const getServerSideProps = async function ({ query, res }) {
  const slug = query.slug.join('/')
  const syncService = new SyncBackendService(process.env.MOVIE_APP_MOVIES_DB)
  try {
    await syncService.open()

    const movie = await syncService.findMovieBySlug(slug)
    if (!movie) {
      res.statusCode = 404
      return {
        props: {
          commonStore: {
            responseError: {
              statusCode: res.statusCode
            }
          },
          ts: Date.now()
        }
      }
    }

    return {
      props: {
        ts: Date.now(),
        movieStore: {
          movie,
          votes: await syncService.findVotesByMovieId(movie.movieId),
          images: await syncService.findImagesByMovieId(movie.movieId),
          byBackend: true
        },
      }
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
