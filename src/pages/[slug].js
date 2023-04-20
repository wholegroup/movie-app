import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import MovieContainer from '../components/MovieContainer.js'
import MovieLoader from '../components/MovieLoader'

// noinspection JSUnusedGlobalSymbols
/**
 * Movie page
 */
export default function MoviePage () {
  const { query: { slug } } = useRouter()
  return (
    <>
      <MovieLoader slug={slug} />
      <MovieContainer />
    </>
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
  const syncService = new SyncBackendService(process.env.MOVIE_APP_DB)
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
      commonStore: {
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
