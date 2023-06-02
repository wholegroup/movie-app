import SyncBackendService from '../../libs/SyncBackendService.js'
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
      <MovieLoader />
      <MovieItem />
    </MovieContextProvider>
  )
}

/**
 *
 * @param {import('next').NextPageContext} params
 * @returns {Promise<object>}
 */
MoviePage.getInitialProps = async function ({ req, query, res }) {
  const isClient = !req
  if (isClient) {
    return {
      ts: Date.now()
    }
  }

  // load movie data on backend
  const { slug } = query
  const syncService = new SyncBackendService(process.env.MOVIE_APP_MOVIES_DB)
  try {
    await syncService.open()

    const movie = await syncService.findMovieBySlug(slug)
    if (!movie) {
      res.statusCode = 404
      res.end('404 Not found')
      return
    }

    return {
      ts: Date.now(),
      movieStore: {
        movie,
        votes: await syncService.findVotesByMovieId(movie.movieId),
        images: await syncService.findImagesByMovieId(movie.movieId)
      }
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
