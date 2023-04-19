import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import MovieContainer from '../components/MovieContainer.js'
import MovieLoader from '../components/MovieLoader'
import CommonStore from '../CommonStore.js'

// noinspection JSUnusedGlobalSymbols
/**
 * Movie page
 */
export default function MovieBySlug () {
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
MovieBySlug.getInitialProps = async function ({ req, query, res }) {
  const isClient = !req
  const { slug } = query

  if (isClient) {
    return {
      ts: Date.now()
    }
  }

  // load movie data on backend
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
      commonStore: Object.assign(new CommonStore(null), {
        movie,
        votes: await syncService.findVotesByMovieId(movie.movieId),
        images: await syncService.findImagesByMovieId(movie.movieId)
      })
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
