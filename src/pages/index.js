import { useEffect } from 'react'
import { useRouter } from 'next/router'
import SyncBackendService from '../../libs/SyncBackendService.js'
import MovieIndex from '../components/CardList.js'
import MovieIndexLoader from '../components/CardsLoader.js'
import ApiService from '../context/ApiService.js'

// noinspection JSUnusedGlobalSymbols
export default function IndexPage () {
  const router = useRouter()

  useEffect(() => {
    // we have to trigger router with current url because
    // index page is returned by Service Worker for any url
    // to support SPA we need to run routing on client side.
    if (router.asPath !== '/') {
      console.log('re-triggering router...')
      router.replace(router.asPath)
        .catch(console.error)
    }
  }, [router])

  return (
    <>
      <MovieIndexLoader />
      <MovieIndex />
    </>
  )
}

IndexPage.getInitialProps = async function ({ req }) {
  const isClient = !req
  if (isClient) {
    return {
      ts: Date.now()
    }
  }

  const syncService = new SyncBackendService(process.env.MOVIE_APP_DB)
  try {
    await syncService.open()

    const visibleIdsPromise = syncService.publicVisibleMovieIds()
    const moviesPromise = syncService.moviesUpdated('')
    const imagesPromise = syncService.imagesUpdated('')

    await Promise.all([visibleIdsPromise, moviesPromise, imagesPromise])

    const visibleIds = await visibleIdsPromise
    const movies = (await moviesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))
    const images = (await imagesPromise)
      .filter(({ movieId }) => visibleIds.includes(movieId))

    const sortedMovies = movies.sort(({ year: a, title: x }, { year: b, title: y }) => (b - a) || x.localeCompare(y))

    const cards = sortedMovies.map(movie => {
      const mainImage = (images.find(nextImages => nextImages.movieId === movie.movieId) || {}).images[0] ?? null
      return {
        movieId: movie.movieId,
        slug: movie.slug,
        title: movie.title,
        year: movie.year,
        posterHash: mainImage?.hash || null,
        posterUrl: ApiService.generatePreviewUrl(mainImage?.hash || '')
      }
    })

    return {
      commonStore: {
        cards
      },
      ts: Date.now()
    }
  } finally {
    if (syncService.isOpen()) {
      await syncService.close()
    }
  }
}
